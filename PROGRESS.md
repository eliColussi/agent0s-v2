# Agent0s — Progress Log

## Changelog

### [2026-03-13] — Hero "Today's Top Pick" + fix featured items bug

**Commit:** (see below)

#### Problem
- Hero section showed stale content from yesterday — no logic to surface today's best item
- `getFeaturedItems()` result was fetched but silently discarded (never assigned to `featuredItems`), so the right-side preview grid was always empty for real data

#### Changes
| File | What changed |
|------|-------------|
| `lib/queries.ts` | Added `getTodaysHeroItem()` — fetches highest `quality_score` item created today (UTC), with `quality_score >= 7` filter |
| `app/page.tsx` | Fetches hero item in parallel with digest + recent items; fixed `getFeaturedItems` result actually being used; passes `heroItem` to `DailyDigest` |
| `components/DailyDigest.tsx` | New "TODAY'S TOP PICK" spotlight card on right side of hero — shows category badge, title, AI summary (3-line clamp), and explore link. Falls back to featured items grid when no today item exists |

#### Also done
- Manual Trigger.dev pipeline run for March 13 (run ID: `run_cmmp766w159bu0in5pbqc1ah8`)
- 13 new items saved, 67 rejected — today's hero: "Agents Towards Production: An Open-Source Playbook" (quality_score: 9)
- Cron schedule unaffected — tomorrow's 7am PST run proceeds as normal

---

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

### [2026-03-12] — DB audit: category fixes + duplicate purge

**42 → 23 items** after full database pass.

#### Category recategorizations (7)
| ID (short) | Title | From → To | Reason |
|---|---|---|---|
| cef29b53 | Claude Opus 4.6 | skill → **model** | Model release announcement |
| 2603afc1 | Gemini 3.1 Flash-Lite | skill → **model** | Model release announcement |
| d5157079 | Top AI Agent Frameworks Ranked | workflow → **technique** | Framework ranking/comparison |
| 9b6b52b1 | Microsoft Agent Framework | workflow → **technique** | Pattern/methodology guide |
| 0559dfa2 | Top Open-Source AI Agent Frameworks | workflow → **technique** | Framework comparison |
| 38a7a346 | AI Agent Frameworks Hands-On | workflow → **technique** | Hands-on comparison |
| 4e76e155 | 500+ AI Agent Projects | workflow → **niche-use-case** | Use case collection across industries |

#### Deleted duplicates (19)
- **Claude Opus 4.6** — 1 near-duplicate removed
- **Windsurf comparisons** — 5 near-duplicate comparison articles removed (kept 2 most relevant)
- **Claude Code Hooks** — 4 near-duplicates removed (kept 2 best: one hook config, one safety scripts)
- **Advanced Claude Code Workflows** — 2 near-duplicates removed
- **AI Financial Operations** — 3 exact title duplicates removed
- **AI Back-Office Automation** — 2 exact title duplicates removed
- **AI Scheduling** — 1 near-duplicate removed
- **AI Agent Frameworks ranked** — 1 near-duplicate removed

#### Also fixed
- Nulled bogus `supersedes_id` on Gemini item that incorrectly pointed to Claude Opus 4.6

#### Final state
| Category | Count |
|---|---|
| hook | 2 |
| model | 2 |
| niche-use-case | 1 |
| technique | 6 |
| workflow | 12 |
| **Total** | **23** |

---

## Checklist

- [x] Hero always shows today's top-scored item ("Today's Top Pick" card)
- [x] Fixed `getFeaturedItems()` result being discarded
- [x] Manual March 13 scrape completed (13 items)
- [x] TypeScript build clean
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
