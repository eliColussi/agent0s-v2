export type Category = 'prompt' | 'skill' | 'hook' | 'plugin' | 'technique' | 'workflow'
export type Tool = 'claude-code' | 'chatgpt-codex' | 'general'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type SourceType = 'github' | 'reddit'

export interface LibraryItem {
  id: string
  title: string
  raw_content: string | null
  source_url: string
  source_type: SourceType
  category: Category
  tool: Tool
  ai_summary: string | null
  ai_actionable_steps: string[] | null
  ai_project_ideas: { title: string; description: string }[] | null
  ai_business_use_cases: string[] | null
  code_snippet: string | null
  difficulty: Difficulty
  tags: string[]
  quality_score: number | null
  is_featured: boolean
  scraped_at: string
  created_at: string
}

export interface DailyDigest {
  id: string
  date: string
  headline: string
  intro_paragraph: string | null
  featured_item_ids: string[]
  total_new_items: number
  created_at: string
}

export interface ScrapeLog {
  id: string
  run_at: string
  sources_scraped: string[]
  items_found: number
  items_saved: number
  items_rejected: number
  status: 'success' | 'partial' | 'failed'
  error_message: string | null
}

export interface LibraryFilters {
  category?: Category | 'all'
  tool?: Tool | 'all'
  difficulty?: Difficulty | 'all'
  search?: string
  page?: number
  limit?: number
}
