# Agent0s — Progress Log

## Changelog

### [2026-03-12] — Add `model` category + fix classification logic

**Commit:** (see below)

#### Problem
- New AI model releases (e.g. Gemini 2.5 Flash) were being miscategorized as `skill`
- The AI setup prompt for model items made no sense — it told users to "scan my workspace, where should this skill be installed?" for a model announcement
- No "Models" filter existed in the library UI

#### Changes
| File | What changed |
|------|-------------|
| `types/index.ts` | Added `'model'` to the `Category` union type |
| `lib/pipeline.ts` | Added `'model'` to EnrichResult type + JSON schema enum; rewrote ENRICH_SYSTEM_PROMPT with explicit classification decision tree; updated TRIAGE_SYSTEM_PROMPT to include model releases as valid content |
| `components/SetupPrompt.tsx` | Model-specific prompt flow: "Evaluate Model" header, different Before You Start section (checks current AI stack, not agent config), different What to Implement section (analyze fit, compare pricing/capabilities, convince user, optionally update API config) |
| `components/CategoryFilter.tsx` | Added "Models" filter pill |
| `components/LibraryCard.tsx` | Added `model` → `var(--cat-model)` color mapping |
| `app/library/[id]/page.tsx` | Added `model` → `var(--cat-model)` color mapping |
| `app/page.tsx` | Added "Models" tile to homepage category grid, links to `/library?category=model` |
| `app/globals.css` | Added `--cat-model: #f43f5e` (rose/red) |

#### Classification rules added to enrichment prompt
1. Content announcing/reviewing a NEW MODEL → `"model"`. Period.
2. Tutorial about USING a model's features → `"technique"` (not `"model"`)
3. Specific installable file (.md, .json config) → `skill`/`hook`/`plugin`/`prompt`
4. Mixed content → pick primary nature
5. Headline is about the model itself → `"model"`

#### Model-specific `ai_actionable_steps` guidance
For `model` category, steps are now written as: "Analyze best use cases for this model within the user's project", "Compare strengths against current provider", "Update API config if user wants to try it" — NOT the generic "scan workspace and install" flow.

#### No DB migration needed
The `category` column is `TEXT NOT NULL` with no CHECK constraint. New category value accepted immediately.

---

## Checklist

- [x] `'model'` category added across all 8 touchpoints
- [x] TypeScript build clean (`npx tsc --noEmit`)
- [x] Enrichment prompt updated with classification decision tree
- [x] Triage prompt updated to pass model releases (not discard them)
- [x] SetupPrompt generates a sensible "Evaluate Model" prompt instead of broken skill-install flow
- [x] "Models" filter pill in library UI
- [x] "Models" tile on homepage
- [x] Rose/red category color (`#f43f5e`)
- [ ] Existing miscategorized items (e.g. Gemini 2.5 Flash) should be re-categorized in Supabase via SQL update

---

## Notes for next run
- The pipeline will now correctly classify new model releases going forward
- Items already in the DB with wrong categories need a one-time manual SQL fix:
  ```sql
  UPDATE library_items
  SET category = 'model'
  WHERE title ILIKE '%gemini%flash%'
     OR title ILIKE '%gemini%pro%'
     OR title ILIKE '%gpt-%'
     OR title ILIKE '%claude%release%'
     OR title ILIKE '%llama%release%'
     OR title ILIKE '%model release%'
     OR title ILIKE '%model update%';
  -- Review results before committing!
  ```
