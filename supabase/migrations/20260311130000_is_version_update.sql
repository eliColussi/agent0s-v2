-- Add is_version_update column (missed in initial schema, required by v2 pipeline)
ALTER TABLE library_items ADD COLUMN IF NOT EXISTS is_version_update BOOLEAN DEFAULT false;
