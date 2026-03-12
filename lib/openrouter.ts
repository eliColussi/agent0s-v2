import OpenAI from 'openai'

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://aitoolsdaily.com',
    'X-Title': 'AI Tools Daily',
  },
})

export async function callModel(model: string, prompt: string): Promise<Record<string, unknown>> {
  const response = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })
  return JSON.parse(response.choices[0].message.content!)
}

export const MODELS = {
  filter: 'meta-llama/llama-3.1-8b-instruct',
  categorize: 'anthropic/claude-haiku-4-5',
  enrich: 'anthropic/claude-sonnet-4-6',
  digest: 'anthropic/claude-sonnet-4-6',
} as const
