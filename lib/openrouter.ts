/**
 * OpenRouter client — Agent0s AI Pipeline
 *
 * Modern 2026 architecture:
 * - Raw fetch for full OpenRouter feature access
 * - models[] array for automatic provider fallbacks
 * - json_schema structured outputs for enrichment (Sonnet/Gemini)
 * - json_object mode for triage (universal compatibility)
 * - Perplexity Sonar with citations extraction
 */

// ─── Model registry — swap any model here without touching pipeline code ──────
export const MODELS = {
  // Stage 1: Discovery — live web search + citations
  discovery: 'perplexity/sonar-pro',

  // Stage 2: Triage — fast parallel scoring (~50-80 calls/day)
  triage:          'google/gemini-2.5-flash',
  triage_fallback: 'anthropic/claude-haiku-4.5',

  // Stage 4: Enrichment — quality layer users actually read
  enrich:          'anthropic/claude-sonnet-4.6',
  enrich_fallback: 'google/gemini-2.5-pro',

  // Stage 5: Daily digest — one call/day, premium writing quality
  digest:          'anthropic/claude-opus-4.6',
  digest_fallback: 'anthropic/claude-sonnet-4.6',
} as const

// Strip markdown code fences some models wrap JSON responses in
function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
}

// ─── Shared headers ───────────────────────────────────────────────────────────
const getHeaders = () => ({
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://agent0s.com',
  'X-Title': 'Agent0s',
})

// ─── json_object call — universal, used for triage ───────────────────────────
export async function callJSON<T = Record<string, unknown>>(
  model: string,
  prompt: string,
  options: { fallback?: string; system?: string } = {}
): Promise<T> {
  const { fallback, system } = options

  const body: Record<string, unknown> = {
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  }

  // models[] array enables automatic fallback routing in OpenRouter
  body[fallback ? 'models' : 'model'] = fallback ? [model, fallback] : model

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`OpenRouter [${model}] ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error(`Empty response from ${data.model ?? model}`)

  return JSON.parse(stripFences(content)) as T
}

// ─── json_schema call — used for enrichment (Sonnet + Gemini 2.5 Pro) ────────
export interface JsonSchemaOptions<T> {
  model: string
  fallback?: string
  system?: string
  prompt: string
  schemaName: string
  schema: Record<string, unknown>
}

export async function callSchema<T>(options: JsonSchemaOptions<T>): Promise<T> {
  const { model, fallback, system, prompt, schemaName, schema } = options

  const body: Record<string, unknown> = {
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: schemaName,
        schema,
      },
    },
  }

  body[fallback ? 'models' : 'model'] = fallback ? [model, fallback] : model

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`OpenRouter [${model}] ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error(`Empty response from ${data.model ?? model}`)

  return JSON.parse(stripFences(content)) as T
}

// ─── Perplexity Sonar — live web search with cited source URLs ─────────────
export interface SonarResult {
  answer: string
  citations: string[] // source URLs Perplexity cited
}

export async function callSonar(query: string): Promise<SonarResult> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: MODELS.discovery,
      messages: [{ role: 'user', content: query }],
    }),
  })

  if (!res.ok) throw new Error(`Sonar ${res.status}: ${await res.text()}`)

  const data = await res.json()

  // OpenRouter surfaces Perplexity citations as annotations on the message,
  // not as a top-level data.citations field.
  const annotations: { type: string; url_citation?: { url: string } }[] =
    data.choices?.[0]?.message?.annotations ?? []
  const citations = annotations
    .filter(a => a.type === 'url_citation' && a.url_citation?.url)
    .map(a => a.url_citation!.url)

  return {
    answer: data.choices?.[0]?.message?.content ?? '',
    citations,
  }
}

// ─── Batch utility — parallel execution in controlled batches ────────────────
export async function batchAsync<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<(R | null)[]> {
  const results: (R | null)[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const settled = await Promise.allSettled(
      batch.map((item, j) => fn(item, i + j))
    )
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : null)
    }
  }
  return results
}
