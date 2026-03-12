-- v2 pipeline columns: versioning, social proof, version labeling
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS supersedes_id UUID REFERENCES library_items(id);
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS github_stars INT;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS upvotes INT;
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS version_label TEXT;

-- Index for version lookups
CREATE INDEX IF NOT EXISTS idx_library_items_supersedes ON library_items (supersedes_id);
