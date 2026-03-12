const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const BASE_URL = 'https://api.github.com'

const SEARCH_QUERIES = [
  { q: '"claude code" hooks language:markdown stars:>2', type: 'code' },
  { q: 'CLAUDE.md hooks filename:CLAUDE.md', type: 'code' },
  { q: '"claude code" prompts stars:>3', type: 'repositories' },
  { q: '"claude-code" skills', type: 'repositories' },
]

interface GitHubRawItem {
  title: string
  source_url: string
  raw_content: string
  source_type: 'github'
}

async function githubFetch(url: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Tools-Daily/1.0',
    },
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

export async function scrapeGitHub(): Promise<GitHubRawItem[]> {
  const results: GitHubRawItem[] = []

  for (const { q, type } of SEARCH_QUERIES) {
    try {
      const endpoint = type === 'code'
        ? `${BASE_URL}/search/code?q=${encodeURIComponent(q)}&per_page=10`
        : `${BASE_URL}/search/repositories?q=${encodeURIComponent(q)}&per_page=10&sort=stars`

      const data = await githubFetch(endpoint)
      const items = data.items || []

      for (const item of items.slice(0, 5)) {
        try {
          let content = ''
          let url = ''

          if (type === 'code') {
            url = item.html_url
            const rawUrl = item.url.replace('https://api.github.com/repos', 'https://raw.githubusercontent.com').replace('/contents/', '/').replace(/\?ref=.*/, '')
            const rawRes = await fetch(rawUrl)
            content = rawRes.ok ? await rawRes.text() : item.name
          } else {
            url = item.html_url
            const readme = await githubFetch(`${BASE_URL}/repos/${item.full_name}/readme`)
              .catch(() => null)
            if (readme?.download_url) {
              const rawRes = await fetch(readme.download_url)
              content = rawRes.ok ? await rawRes.text() : item.description || ''
            } else {
              content = item.description || item.full_name
            }
          }

          if (content.length > 100) {
            results.push({
              title: item.name || item.full_name,
              source_url: url,
              raw_content: content.slice(0, 4000),
              source_type: 'github',
            })
          }
        } catch (e) {
          console.error('Error fetching GitHub item:', e)
        }
      }

      await new Promise(r => setTimeout(r, 1000)) // rate limit
    } catch (e) {
      console.error('GitHub search error:', e)
    }
  }

  return results
}
