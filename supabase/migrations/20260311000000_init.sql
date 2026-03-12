-- All scraped + AI-processed library items
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  raw_content TEXT,
  source_url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  category TEXT NOT NULL,
  tool TEXT NOT NULL DEFAULT 'claude-code',
  ai_summary TEXT,
  ai_actionable_steps JSONB,
  ai_project_ideas JSONB,
  ai_business_use_cases JSONB,
  code_snippet TEXT,
  difficulty TEXT DEFAULT 'beginner',
  tags TEXT[],
  quality_score INT,
  is_featured BOOLEAN DEFAULT FALSE,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily "What's New" digest
CREATE TABLE IF NOT EXISTS daily_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  intro_paragraph TEXT,
  featured_item_ids UUID[],
  total_new_items INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for scrape runs
CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  sources_scraped TEXT[],
  items_found INT DEFAULT 0,
  items_saved INT DEFAULT 0,
  items_rejected INT DEFAULT 0,
  status TEXT,
  error_message TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items (category);
CREATE INDEX IF NOT EXISTS idx_library_items_tool ON library_items (tool);
CREATE INDEX IF NOT EXISTS idx_library_items_difficulty ON library_items (difficulty);
CREATE INDEX IF NOT EXISTS idx_library_items_created_at ON library_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_tags ON library_items USING gin(tags);
