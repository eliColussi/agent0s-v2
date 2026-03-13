# Agent0s — Progress Log

## Changelog

### [2026-03-13] — Experimental "Liquid Glass" UI/UX overhaul

**Commit:** (see below) · **Rollback point:** `92e0fa5`

#### Goal
Replace the flat dark UI with a glassmorphism "Liquid Glass" design system — semi-transparent surfaces, backdrop-filter blur, ambient gradient orbs, and an editorial magazine layout for the Mission Briefing. Add an Agent Intelligence Feed as a live scrolling dashboard.

#### Changes (8 files, +791 / -327 lines)
| File | What changed |
|------|-------------|
| `app/globals.css` | Full design system: semi-transparent `--surface` / `--surface-raised`, `--surface-glass`, `--border-glass`, `--glass-blur` vars. Ambient gradient orbs (purple, cyan, gold) over dot grid. Glass utility classes (`.glass`, `.glass-heavy`, `.glass-subtle`, `.glass-nav`). `.glass-border-glow` gradient mask border. `.section-divider`, `.gradient-text`, `.float`, `.feed-scroll` utilities. Enhanced card hover with accent glow. Light theme vars updated. |
| `components/Nav.tsx` | `glass-nav` class, gradient logo with glow, pill-style LIVE indicator, glass mobile drawer with backdrop blur |
| `components/LibraryCard.tsx` | `glass-border-glow` class, semi-transparent background with backdrop blur, `color-mix()` category badges, glass tool pills |
| `components/DailyDigest.tsx` | Editorial magazine layout: `glass-heavy` container, split panel (editorial left + hero spotlight right), ambient glow orbs, stats separated by glass dividers, category-colored accents, pulsing live indicator on hero card |
| `app/page.tsx` | `gradient-text` title, `section-divider` transitions, new Agent Intelligence Feed (scrolling live dashboard with `feed-scroll` animation, fade gradients, LIVE badge) in two-column layout alongside category grid |
| `components/CategoryTiles.tsx` | `glass-border-glow` cards, backdrop blur, category-colored glow orbs, dot indicators, staggered `card-enter` animations |
| `app/library/page.tsx` | `.glass` sidebar/filters, accent glow on stats block, glass pagination buttons, glass empty state, `gradient-text` header |
| `app/layout.tsx` | Glass footer with backdrop blur, gradient logo mark, live pulse indicator |

#### Notes
- This is experimental — may be reverted to `92e0fa5` if the user doesn't like it
- No new dependencies added
- TypeScript build clean (`npx tsc --noEmit`)
- 3D agent visualization deliberately skipped for now

---

### [2026-03-13] — Discovery overhaul: dedicated queries per tool + triage rebalancing

**Commit:** (see below)

#### Problem
- Discovery queries were keyword-stuffed and generic — Codex CLI and OpenCLAW content wasn't being found consistently
- Triage system prompt treated all tools equally, so niche Codex/OpenCLAW content was being discarded as "not novel enough"
- No dedicated queries for projects/use cases people built with each tool

#### Changes
| File | What changed |
|------|-------------|
| `lib/scrapers/perplexity.ts` | Redesigned anchor queries: 9 dedicated queries (2 per tool for releases + projects, plus agentic frameworks, model releases, community signal). Up from 7 generic anchors. Total per run: 14 queries. |
| `lib/pipeline.ts` | Rewrote `TRIAGE_SYSTEM_PROMPT` with three editorial pillars (Claude Code, Codex CLI, OpenCLAW) and explicit scoring guidance: content about these tools gets higher `audience_fit_score` (7+) by default. Projects/use cases are explicitly called out as valuable. |

#### Results from first run with new queries
| Tool | Items saved | Examples |
|---|---|---|
| claude-code | 2 | "Claude Code 2026 Update: Opus 4.6" (9), "Structured Production Workflow" (8) |
| chatgpt-codex | 4 | "Codex CLI 0.114.0" (8), "Automate Code Reviews with Codex GitHub Action" (8) |
| openclaw | 2 | "OpenCLAW Architectural Guide and B2B Use Cases" (7), "OpenClaw v2026.3.7 ContextEngine" (7) |
| general | 4 | "LLM Landscape March 2026" (7), "Addy Osmani's AI Workflow" (8) |

---

### [2026-03-13] — Hero "Today's Top Pick" + live stats across homepage

**Commits:** `f662b4b`, `76366ac`

#### Problem
- Hero section showed stale content from yesterday — no logic to surface today's best item
- `getFeaturedItems()` result was fetched but silently discarded (never assigned to `featuredItems`), so the right-side preview grid was always empty for real data
- "Browse by Category" tile counts were hardcoded from `SEED_ITEMS` — always showed 0 for real categories (e.g. Models showed 0 despite having 3 items)
- Ticker "items indexed" count and hero "TOTAL" stat were hardcoded from `SEED_STATS` (fake number 247)

#### Changes
| File | What changed |
|------|-------------|
| `lib/queries.ts` | Added `getTodaysHeroItem()` — fetches highest `quality_score` item created today; added `getCategoryCounts()` — fetches per-category item counts from DB |
| `app/page.tsx` | Fetches hero item, category counts, and total stats in parallel; category tiles now use real DB counts (with "agentic" summing skill+hook+prompt+plugin); ticker uses real total; fixed `getFeaturedItems` result being used |
| `components/DailyDigest.tsx` | New "TODAY'S TOP PICK" spotlight card; hero "TOTAL" stat now uses real DB count via `totalItems` prop |

#### Also done
- Manual Trigger.dev pipeline run for March 13 (run ID: `run_cmmp766w159bu0in5pbqc1ah8`)
- 13 new items saved, 67 rejected — today's hero: "Agents Towards Production: An Open-Source Playbook" (quality_score: 9)
- Cron schedule unaffected — tomorrow's 7am PST run proceeds as normal

#### Live category counts (from DB)
| Category | Count |
|---|---|
| hook | 2 |
| model | 3 |
| niche-use-case | 1 |
| plugin | 2 |
| technique | 11 |
| workflow | 10 |
| **Total** | **29** |

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

- [x] Discovery queries redesigned: 9 dedicated anchors (2 per tool + broad coverage)
- [x] Triage prompt rebalanced: Claude Code / Codex CLI / OpenCLAW as editorial pillars
- [x] Trigger.dev deployed with new queries (version `20260313.3`)
- [x] Second scrape run: 12 items with all three tools represented
- [x] Hero always shows today's top-scored item ("Today's Top Pick" card)
- [x] Fixed `getFeaturedItems()` result being discarded
- [x] Category tile counts now live from DB (no more hardcoded seed data)
- [x] Ticker + hero stats use real DB total
- [x] Manual March 13 scrapes completed (13 + 12 items)
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
