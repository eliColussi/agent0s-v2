/**
 * Stage 3: GitHub Deep Research
 *
 * For items where Sonar discovered a GitHub URL, this fetches the full
 * README and repo metadata. Gives the enrichment model (Sonnet) real
 * content to work with instead of just a Sonar summary.
 */

const BASE_URL = 'https://api.github.com'

export interface GitHubContent {
  raw_content: string
  github_stars: number | null
}

async function githubFetch(url: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Agent0s/1.0',
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`)
  return res.json()
}

function parseGitHubUrl(url: string): { owner: string; repo: string; filePath?: string } | null {
  try {
    const { hostname, pathname } = new URL(url)
    if (!hostname.includes('github.com')) return null
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null

    // /owner/repo/blob/branch/path/to/file → extract filePath
    const filePath = parts[2] === 'blob' && parts.length > 4
      ? parts.slice(4).join('/')
      : undefined

    return { owner: parts[0], repo: parts[1], filePath }
  } catch {
    return null
  }
}

export async function fetchGitHubContent(url: string): Promise<GitHubContent | null> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) return null

  const { owner, repo, filePath } = parsed

  try {
    // Fetch repo metadata and README in parallel
    const [repoRes, readmeRes] = await Promise.allSettled([
      githubFetch(`${BASE_URL}/repos/${owner}/${repo}`),
      githubFetch(`${BASE_URL}/repos/${owner}/${repo}/readme`),
    ])

    let content = ''
    let stars: number | null = null

    if (repoRes.status === 'fulfilled') {
      const r = repoRes.value
      stars = r.stargazers_count ?? null
      content += `Repository: ${r.full_name}\n`
      content += `Description: ${r.description || 'No description'}\n`
      content += `Stars: ${stars ?? 0} | Language: ${r.language || 'N/A'} | Last updated: ${r.updated_at}\n\n`
    }

    // If URL pointed to a specific file, fetch that too
    if (filePath) {
      const fileRes = await githubFetch(
        `${BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`
      ).catch(() => null)

      if (fileRes?.download_url) {
        const raw = await fetch(fileRes.download_url)
        if (raw.ok) content += (await raw.text()).slice(0, 4000) + '\n\n'
      }
    }

    // Append README content
    if (readmeRes.status === 'fulfilled' && readmeRes.value?.download_url) {
      const raw = await fetch(readmeRes.value.download_url)
      if (raw.ok) content += (await raw.text()).slice(0, 4000)
    }

    if (content.length < 80) return null

    return { raw_content: content.slice(0, 6000), github_stars: stars }
  } catch (e) {
    console.error(`GitHub deep research failed for ${url}:`, e)
    return null
  }
}
