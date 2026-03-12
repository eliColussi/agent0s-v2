const SUBREDDITS_QUERIES = [
  { sub: 'ClaudeAI', q: 'hooks tips claude code' },
  { sub: 'ChatGPTCoding', q: 'codex prompts claude code' },
  { sub: 'LocalLLaMA', q: 'claude code agent prompts' },
]

interface RedditRawItem {
  title: string
  source_url: string
  raw_content: string
  source_type: 'reddit'
}

export async function scrapeReddit(): Promise<RedditRawItem[]> {
  const results: RedditRawItem[] = []
  const oneDayAgo = Date.now() / 1000 - 86400

  for (const { sub, q } of SUBREDDITS_QUERIES) {
    try {
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(q)}&sort=top&t=day&limit=10`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'AI-Tools-Daily/1.0' },
      })
      if (!res.ok) continue

      const data = await res.json()
      const posts = data?.data?.children || []

      for (const { data: post } of posts) {
        if (post.score < 5) continue
        if (post.created_utc < oneDayAgo) continue

        const content = post.selftext || post.title
        if (content.length < 50) continue

        results.push({
          title: post.title,
          source_url: `https://www.reddit.com${post.permalink}`,
          raw_content: content.slice(0, 4000),
          source_type: 'reddit',
        })
      }

      await new Promise(r => setTimeout(r, 500))
    } catch (e) {
      console.error(`Reddit error for r/${sub}:`, e)
    }
  }

  return results
}
