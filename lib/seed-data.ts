import { LibraryItem, DailyDigest } from '@/types'

export const SEED_STATS = { total: 247, today: 16, sources: 2 }

export const SEED_ITEMS: LibraryItem[] = [
  {
    id: 'seed-001',
    title: 'Ultra-Compressed CLAUDE.md System Prompt for Maximum Context Efficiency',
    raw_content: 'A highly compressed CLAUDE.md format that reduces token usage by 60% while retaining all critical context.',
    source_url: 'https://github.com/anthropics/claude-code/discussions/284',
    source_type: 'github',
    category: 'prompt',
    tool: 'claude-code',
    ai_summary: 'A structured CLAUDE.md template using XML-like shorthand notation that communicates your project architecture, conventions, and preferences to Claude Code in under 300 tokens — compared to the typical 800+. Uses abbreviation schemas and tiered priority markers.',
    ai_actionable_steps: [
      'Replace verbose CLAUDE.md prose with the compressed schema: use P1/P2/P3 markers for priority, abbrev tech names (TS, PG, RQ for TypeScript, PostgreSQL, React Query), and collapse repeated patterns into single-line rules.',
      'Add a "FORBIDDEN" block at the top listing anti-patterns Claude should never produce — this is 10x more token-efficient than explaining why not to do each thing.',
      'Benchmark your current CLAUDE.md by pasting it into the Claude.ai tokenizer, then compare after applying the compressed format — most users see 55–65% reduction.',
    ],
    ai_project_ideas: [
      { title: 'CLAUDE.md Generator CLI', description: 'A CLI tool that introspects your project (package.json, tsconfig, .eslintrc) and auto-generates an optimized CLAUDE.md in compressed format.' },
      { title: 'Token Budget Dashboard', description: 'A VS Code extension that shows a live token count for your CLAUDE.md file and warns when you exceed efficient thresholds.' },
    ],
    ai_business_use_cases: [
      'Reduce Claude Code API costs by 40-60% on context-heavy enterprise codebases',
      'Standardize AI onboarding across engineering teams by templatizing the compressed format',
      'Speed up Claude Code response latency on large monorepos by shrinking context window usage',
    ],
    code_snippet: `# CLAUDE.md — compressed schema v2
## PROJECT
stack: Next15·TS5·PG16·Drizzle·RQ5·shadcn
arch: app-router·RSC-first·server-actions
deploy: Vercel·edge-functions

## RULES [P1=critical P2=important P3=prefer]
P1: never-client-components-for-data-fetch
P1: drizzle-not-prisma — schema in /db/schema.ts
P2: zod-validation-all-inputs
P2: error-boundaries-all-async
P3: prefer-server-actions-over-api-routes

## FORBIDDEN
- any useState for server-fetchable data
- inline SQL strings
- console.log in production paths
- @ts-ignore without explanation comment`,
    difficulty: 'intermediate',
    tags: ['claude-code', 'context', 'prompting', 'efficiency', 'CLAUDE.md'],
    quality_score: 9,
    is_featured: true,
    scraped_at: '2026-03-11T07:00:00Z',
    created_at: '2026-03-11T07:00:00Z',
  },
  {
    id: 'seed-002',
    title: 'Custom Slash Commands in Claude Code for Repetitive Workflows',
    raw_content: null,
    source_url: 'https://reddit.com/r/ClaudeAI/comments/1abc123/custom_slash_commands',
    source_type: 'reddit',
    category: 'skill',
    tool: 'claude-code',
    ai_summary: 'Claude Code supports custom slash commands stored in .claude/commands/*.md. Each file becomes a reusable command — perfect for PR descriptions, commit messages, and code review workflows that you run daily.',
    ai_actionable_steps: [
      'Create a .claude/commands/ directory in your repo root. Each .md file in this folder becomes a /command in Claude Code.',
      'Write a pr-description.md command that reads recent git diff and formats a structured PR description with Summary, Changes, and Test Plan sections.',
      'Add commands to your global ~/.claude/commands/ for cross-project utilities like /refactor-to-hooks or /add-error-handling.',
    ],
    ai_project_ideas: [
      { title: 'Command Library Sharing Platform', description: 'A GitHub repo + website where developers share and rate their best Claude Code slash commands, categorized by tech stack.' },
      { title: 'Auto-Command Generator', description: 'Ask Claude to analyze your most common requests and automatically generate slash commands for your top 10 patterns.' },
    ],
    ai_business_use_cases: [
      'Standardize code review quality across engineering teams with shared /review commands',
      'Automate documentation generation with /add-jsdoc and /update-readme commands',
      'Reduce onboarding time by giving new developers a /setup-project command that scaffolds their environment',
    ],
    code_snippet: `# .claude/commands/pr-description.md
Generate a pull request description for the current changes.

Steps:
1. Run \`git diff main...HEAD\` to see all changes
2. Run \`git log main...HEAD --oneline\` for commit history
3. Identify the primary goal and key implementation decisions

Output format:
## Summary
[1-3 sentence description of what this PR does and why]

## Changes
- [bullet list of key changes]

## Test Plan
- [ ] [specific things to test]
- [ ] Edge cases covered

## Notes
[Any breaking changes, migration steps, or reviewer focus areas]`,
    difficulty: 'beginner',
    tags: ['slash-commands', 'workflow', 'automation', 'claude-code'],
    quality_score: 8,
    is_featured: false,
    scraped_at: '2026-03-11T07:00:00Z',
    created_at: '2026-03-11T07:02:00Z',
  },
  {
    id: 'seed-003',
    title: 'Pre-Tool-Call Hooks: Auto-Lint Before Every File Write',
    raw_content: null,
    source_url: 'https://github.com/anthropics/claude-code/issues/891',
    source_type: 'github',
    category: 'hook',
    tool: 'claude-code',
    ai_summary: 'Claude Code hooks let you intercept tool calls before and after execution. A PreToolUse hook on the Write tool can run ESLint/Prettier before Claude writes a file, ensuring every AI-generated file is already formatted — eliminating the "format the file" back-and-forth.',
    ai_actionable_steps: [
      'Add a "hooks" section to your .claude/settings.json. The PreToolUse hook fires before any tool executes and receives the tool name and input via stdin as JSON.',
      'Write a shell script that receives the file path and content, runs eslint --fix and prettier --write on a temp file, then outputs the fixed content back to stdout.',
      'Test with a deliberately malformed file — Claude should now write clean code in one shot rather than requiring a follow-up format request.',
    ],
    ai_project_ideas: [
      { title: 'Hook Middleware Framework', description: 'A Node.js library for writing Claude Code hooks with typed inputs, error handling, and a plugin ecosystem for common transforms.' },
      { title: 'Security Audit Hook', description: 'A PostToolUse hook that scans every file Claude writes for common security vulnerabilities using semgrep and reports them in the session.' },
    ],
    ai_business_use_cases: [
      'Enforce company coding standards automatically — every AI-written file passes linting before hitting the repo',
      'Add automated test generation as a PostToolUse hook that writes tests alongside every new function',
      'Log all file modifications for audit compliance in regulated industries',
    ],
    code_snippet: `// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/pre-write.js"
          }
        ]
      }
    ]
  }
}

// .claude/hooks/pre-write.js
const { execSync } = require('child_process')
const input = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'))

if (input.tool_input?.file_path?.endsWith('.ts') ||
    input.tool_input?.file_path?.endsWith('.tsx')) {
  // Write to temp, lint, read back
  const tmp = '/tmp/claude-lint-' + Date.now() + '.ts'
  require('fs').writeFileSync(tmp, input.tool_input.new_content)
  try {
    execSync(\`npx prettier --write \${tmp}\`)
    input.tool_input.new_content = require('fs').readFileSync(tmp, 'utf8')
  } catch(e) { /* let Claude handle it */ }
}
console.log(JSON.stringify(input))`,
    difficulty: 'advanced',
    tags: ['hooks', 'linting', 'automation', 'claude-code', 'pre-tool-use'],
    quality_score: 9,
    is_featured: true,
    scraped_at: '2026-03-10T07:00:00Z',
    created_at: '2026-03-10T07:00:00Z',
  },
  {
    id: 'seed-004',
    title: 'CodeGPT VS Code Plugin: In-Editor AI Chat with Codebase Context',
    raw_content: null,
    source_url: 'https://github.com/nickytonline/codegpt',
    source_type: 'github',
    category: 'plugin',
    tool: 'general',
    ai_summary: 'CodeGPT is a VS Code extension that embeds AI chat directly in your editor sidebar with full codebase indexing. Unlike GitHub Copilot Chat, it supports multiple LLM backends (OpenAI, Anthropic, Ollama) and lets you create "agents" with custom system prompts per project.',
    ai_actionable_steps: [
      'Install CodeGPT from the VS Code marketplace, connect your preferred LLM API key, then use "Index Workspace" to give it full codebase context.',
      'Create a project-specific agent by clicking "New Agent" and pasting your project conventions — this persists across sessions unlike ad-hoc chat.',
      'Use @file references in chat to pull specific files into context: "@src/auth/middleware.ts explain the token validation flow".',
    ],
    ai_project_ideas: [
      { title: 'Multi-Agent Code Review Bot', description: 'Configure multiple CodeGPT agents — one for security review, one for performance, one for style — and run all three on every PR.' },
      { title: 'Documentation Sync Agent', description: 'An agent that monitors file changes and automatically updates inline JSDoc and README sections when implementation changes.' },
    ],
    ai_business_use_cases: [
      'Reduce context-switching by keeping AI assistance inside the IDE without browser tab juggling',
      'Support local Ollama models for air-gapped enterprise environments where code cannot leave the network',
      'Enable junior developers to get instant architecture guidance without senior developer interruption',
    ],
    code_snippet: null,
    difficulty: 'beginner',
    tags: ['vscode', 'plugin', 'ide', 'ollama', 'codegpt'],
    quality_score: 7,
    is_featured: false,
    scraped_at: '2026-03-10T07:00:00Z',
    created_at: '2026-03-10T07:05:00Z',
  },
  {
    id: 'seed-005',
    title: 'Chain-of-Verification Prompting: Eliminate AI Hallucinations in Research Tasks',
    raw_content: null,
    source_url: 'https://reddit.com/r/PromptEngineering/comments/1xyz456/chain_of_verification',
    source_type: 'reddit',
    category: 'technique',
    tool: 'general',
    ai_summary: 'Chain-of-Verification (CoVe) is a prompting technique where you ask the AI to generate an answer, then independently generate verification questions, answer them without seeing the original response, and finally produce a revised answer. Studies show 30-40% reduction in factual errors.',
    ai_actionable_steps: [
      'After your initial response, prompt: "Now generate 5 specific factual claims from your answer that could be wrong. List only the claims, not your answer."',
      'In a fresh message: "Without referencing your previous answer, answer each of these verification questions independently: [paste the 5 claims]"',
      'Final prompt: "Compare your verification answers to your original response. Produce a corrected version of the original that resolves any contradictions."',
    ],
    ai_project_ideas: [
      { title: 'CoVe Pipeline Tool', description: 'A web app that automates the 3-step CoVe process for research questions, showing which facts changed between original and verified answers.' },
      { title: 'Fact-Check Integration', description: 'A browser extension that runs CoVe on any AI response you receive, highlighting the verified vs unverified claims with color coding.' },
    ],
    ai_business_use_cases: [
      'Legal and compliance document drafting where factual accuracy is liability-critical',
      'Medical or scientific content where errors could cause harm',
      'Financial analysis reports where outdated or incorrect data could affect decisions',
    ],
    code_snippet: `// CoVe prompt template (use with any LLM API)
const covePrompt = async (question: string, llm: LLMClient) => {
  // Step 1: Initial response
  const initial = await llm.complete(\`Answer this question: \${question}\`)

  // Step 2: Generate verification questions
  const vqs = await llm.complete(\`
    Given this answer: "\${initial}"
    List 5 specific factual claims that could be incorrect.
    Format: numbered list, claims only, no explanation.
  \`)

  // Step 3: Answer verification questions independently
  const verified = await llm.complete(\`
    Answer each question independently (ignore any previous context):
    \${vqs}
  \`)

  // Step 4: Reconcile
  return llm.complete(\`
    Original answer: \${initial}
    Verification findings: \${verified}
    Produce a corrected final answer resolving any contradictions.
  \`)
}`,
    difficulty: 'intermediate',
    tags: ['prompting', 'hallucination', 'accuracy', 'chain-of-thought', 'verification'],
    quality_score: 8,
    is_featured: false,
    scraped_at: '2026-03-10T07:00:00Z',
    created_at: '2026-03-10T07:08:00Z',
  },
  {
    id: 'seed-006',
    title: 'Automated PR Review Workflow with GitHub Actions + Claude API',
    raw_content: null,
    source_url: 'https://github.com/anthropics/anthropic-cookbook/tree/main/misc/github_actions_pr_review',
    source_type: 'github',
    category: 'workflow',
    tool: 'claude-code',
    ai_summary: 'A GitHub Actions workflow that automatically reviews every pull request using the Claude API. It reads the diff, runs it through a structured review prompt, and posts inline comments on specific lines — catching logic errors, security issues, and style violations before human review.',
    ai_actionable_steps: [
      'Copy the workflow YAML to .github/workflows/ai-review.yml and add your ANTHROPIC_API_KEY as a GitHub Actions secret.',
      'Customize the review prompt template in the workflow to match your team\'s standards — add your tech stack, forbidden patterns, and required checks.',
      'Set the workflow to only trigger on PRs targeting main/production branches, with a label gate ("needs-ai-review") to avoid reviewing draft PRs.',
    ],
    ai_project_ideas: [
      { title: 'Tiered Review Bot', description: 'A system where Claude does initial triage (block only critical issues), then a more expensive thorough review runs only on PRs that pass triage.' },
      { title: 'Review Analytics Dashboard', description: 'Track which types of issues Claude catches most often in your codebase over time to identify systemic training needs.' },
    ],
    ai_business_use_cases: [
      'Cut average PR review time from hours to minutes for the first-pass review',
      'Ensure consistent code quality standards across distributed teams in different timezones',
      'Catch security vulnerabilities before they reach code review, reducing the likelihood of human reviewers missing them',
    ],
    code_snippet: `# .github/workflows/ai-review.yml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]
    branches: [main, production]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        id: diff
        run: |
          git diff origin/main...HEAD > /tmp/pr.diff
          echo "diff_size=$(wc -c < /tmp/pr.diff)" >> $GITHUB_OUTPUT

      - name: Run AI Review
        if: steps.diff.outputs.diff_size < 50000
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          node .github/scripts/ai-review.js \
            --pr=\${{ github.event.number }} \
            --diff=/tmp/pr.diff`,
    difficulty: 'advanced',
    tags: ['github-actions', 'ci-cd', 'code-review', 'automation', 'workflow'],
    quality_score: 9,
    is_featured: true,
    scraped_at: '2026-03-09T07:00:00Z',
    created_at: '2026-03-09T07:00:00Z',
  },
  {
    id: 'seed-007',
    title: 'The "Rubber Duck" System Prompt: Force AI to Ask Before Acting',
    raw_content: null,
    source_url: 'https://reddit.com/r/ClaudeAI/comments/1def789/rubber_duck_prompt',
    source_type: 'reddit',
    category: 'prompt',
    tool: 'general',
    ai_summary: 'A system prompt pattern that forces the AI to ask 2-3 clarifying questions before attempting any task. Sounds obvious, but the specific phrasing triggers a fundamentally different problem-solving mode — the AI surfaces your hidden assumptions before they become bugs.',
    ai_actionable_steps: [
      'Add this to your system prompt: "Before starting any task with more than one reasonable interpretation, ask me exactly 2 clarifying questions. No more, no less. Choose the two questions that would most change your approach."',
      'The "2 questions" constraint is critical — open-ended questioning leads to annoying back-and-forth. The limit forces the AI to identify the MOST important ambiguities.',
      'Pair with: "After I answer, summarize your understanding in one sentence before proceeding" — this surfaces misunderstandings before work begins.',
    ],
    ai_project_ideas: [
      { title: 'Requirements Interviewer', description: 'A specialized AI assistant that conducts structured requirements gathering interviews, using branching question trees based on project type.' },
      { title: 'Spec Validator', description: 'A tool that takes a project spec and asks targeted questions to find all ambiguities, outputting a resolved spec document.' },
    ],
    ai_business_use_cases: [
      'Client requirement gathering — AI interviews clients and produces structured specs',
      'Support ticket triage — ask clarifying questions before routing to reduce back-and-forth',
      'Feature planning sessions — ensure complete requirements before any development starts',
    ],
    code_snippet: `// System prompt snippet for "ask first" behavior
const RUBBER_DUCK_SYSTEM = \`
You are a precise engineering assistant.

BEFORE starting any task:
1. Identify if there are 2+ reasonable interpretations of the request
2. If yes: ask exactly 2 clarifying questions — the ones that would most
   change your approach. Wait for answers before proceeding.
3. After receiving answers: write ONE sentence summarizing your
   understanding, then proceed.

If the task is unambiguous, proceed immediately without questions.
Do not ask about preferences that don't affect the technical approach.
\``,
    difficulty: 'beginner',
    tags: ['prompting', 'system-prompt', 'requirements', 'clarity', 'ux'],
    quality_score: 8,
    is_featured: false,
    scraped_at: '2026-03-09T07:00:00Z',
    created_at: '2026-03-09T07:03:00Z',
  },
  {
    id: 'seed-008',
    title: 'Cursor Rules Deep Dive: Project-Specific AI Behavior Without Repeating Yourself',
    raw_content: null,
    source_url: 'https://github.com/PatrickJS/awesome-cursorrules',
    source_type: 'github',
    category: 'skill',
    tool: 'chatgpt-codex',
    ai_summary: 'Cursor\'s .cursorrules file lets you define persistent coding standards, architectural patterns, and preferences that apply to every AI interaction in that project. The awesome-cursorrules repo has 200+ community-contributed rule sets for every major tech stack.',
    ai_actionable_steps: [
      'Browse awesome-cursorrules on GitHub, find your stack (Next.js, Django, Rails, etc.), and copy the closest matching .cursorrules to your project root.',
      'Customize the "Project Structure" section to match your actual directory layout — this is the highest-ROI section since it prevents file creation in wrong locations.',
      'Add a "Common Mistakes to Avoid" section listing the top 3 errors you\'ve had to correct in past AI sessions — this prevents repetition.',
    ],
    ai_project_ideas: [
      { title: 'Cursorrules Generator', description: 'Input your tech stack, coding standards, and a few past correction examples — generate an optimized .cursorrules file automatically.' },
      { title: 'Rules Diff Tool', description: 'Compare your .cursorrules against community templates for your stack and highlight what you\'re missing.' },
    ],
    ai_business_use_cases: [
      'Onboard new developers faster by encoding all coding conventions in .cursorrules',
      'Enforce security-first patterns across all AI-generated code in fintech/healthtech projects',
      'Maintain brand/design system consistency by encoding component library usage rules',
    ],
    code_snippet: `# .cursorrules — Next.js 15 App Router + TypeScript

## Tech Stack
- Next.js 15 with App Router (NOT pages router)
- TypeScript strict mode
- Tailwind CSS v4
- Drizzle ORM with PostgreSQL
- Zod for validation

## Architecture Rules
- All data fetching in Server Components unless interactivity required
- Server Actions for mutations (no dedicated API routes for internal use)
- Co-locate types with their features in /features/[name]/types.ts
- Database queries only in /lib/db/*.ts — never in components

## Naming Conventions
- Components: PascalCase, named exports only
- Hooks: useXxx.ts in /hooks/
- Server actions: verbNounAction (e.g., createPostAction)
- DB schema: snake_case column names, camelCase TS types

## NEVER DO
- useState for server-fetchable data
- useEffect for initial data loading
- any type (use unknown + type guard)
- Relative imports beyond 2 levels (use @/ alias)`,
    difficulty: 'beginner',
    tags: ['cursor', 'rules', 'workflow', 'coding-standards', 'productivity'],
    quality_score: 8,
    is_featured: false,
    scraped_at: '2026-03-09T07:00:00Z',
    created_at: '2026-03-09T07:06:00Z',
  },
  {
    id: 'seed-009',
    title: 'Agentic Test-Driven Development: Write Tests First, Let Claude Implement',
    raw_content: null,
    source_url: 'https://reddit.com/r/webdev/comments/1ghi012/tdd_with_claude_code',
    source_type: 'reddit',
    category: 'technique',
    tool: 'claude-code',
    ai_summary: 'A workflow where you write comprehensive failing tests first, then hand off to Claude Code to implement the code that makes them pass. This constrains the AI to produce only what\'s tested, dramatically reducing over-engineering and hallucinated features.',
    ai_actionable_steps: [
      'Write your test file first with all edge cases, then tell Claude: "Implement the minimum code to make these tests pass. Do not add any functionality that isn\'t tested."',
      'Run tests after each Claude implementation attempt and paste the failure output directly — Claude is excellent at red-green-refactor cycles when given exact test output.',
      'After green tests, ask Claude to refactor for readability without changing behavior — use test suite as the safety net for refactoring.',
    ],
    ai_project_ideas: [
      { title: 'Test-First Prompt Templates', description: 'A library of test file templates for common patterns (REST API endpoints, React hooks, utility functions) that make TDD faster to start.' },
      { title: 'AI TDD Coach', description: 'An AI assistant specialized in reviewing test quality, suggesting missing edge cases, and evaluating whether tests actually constrain the implementation.' },
    ],
    ai_business_use_cases: [
      'Build reliable microservices by having AI implement to contract tests',
      'Reduce QA cycles when AI writes code that already passes all edge case tests',
      'Enable non-engineers to specify behavior through tests without knowing implementation details',
    ],
    code_snippet: `// 1. Write tests first (users.test.ts)
describe('createUser', () => {
  it('rejects duplicate email', async () => {
    await createUser({ email: 'a@b.com', name: 'Alice' })
    await expect(
      createUser({ email: 'a@b.com', name: 'Bob' })
    ).rejects.toThrow('Email already exists')
  })

  it('hashes password before storing', async () => {
    const user = await createUser({
      email: 'c@d.com', name: 'Carol', password: 'plain123'
    })
    expect(user.password_hash).not.toBe('plain123')
    expect(user.password_hash).toMatch(/^\$2[ab]\$/)
  })

  it('returns user without password_hash', async () => {
    const user = await createUser({ email: 'e@f.com', name: 'Eve' })
    expect(user).not.toHaveProperty('password_hash')
  })
})

// 2. Claude prompt: "Implement createUser() to pass these tests.
//    Use bcrypt for hashing. No extra features beyond what's tested."`,
    difficulty: 'intermediate',
    tags: ['tdd', 'testing', 'methodology', 'claude-code', 'quality'],
    quality_score: 9,
    is_featured: true,
    scraped_at: '2026-03-08T07:00:00Z',
    created_at: '2026-03-08T07:00:00Z',
  },
  {
    id: 'seed-010',
    title: 'Codex CLI: OpenAI\'s Terminal-Based Coding Agent (Open Source)',
    raw_content: null,
    source_url: 'https://github.com/openai/codex',
    source_type: 'github',
    category: 'plugin',
    tool: 'chatgpt-codex',
    ai_summary: 'Codex CLI is OpenAI\'s open-source terminal agent that can read files, run code, and execute commands to complete programming tasks. Unlike ChatGPT, it has direct filesystem access and runs in a sandboxed environment — closer to Claude Code but for OpenAI models.',
    ai_actionable_steps: [
      'Install with npm install -g @openai/codex, then run codex in any project directory to start an interactive session with full file access.',
      'Use "Full Auto" mode for large refactoring tasks where you trust the AI — it will make multiple file changes without confirmation prompts.',
      'Create a codex-instructions.md in your project root (analogous to CLAUDE.md) to give it project context on startup.',
    ],
    ai_project_ideas: [
      { title: 'Cross-Agent Comparison Harness', description: 'A benchmark runner that gives the same coding tasks to Claude Code and Codex CLI, comparing output quality, token usage, and success rate.' },
      { title: 'Agent Orchestrator', description: 'Use Claude Code for architecture and planning, Codex CLI for implementation — a multi-agent pipeline that plays to each model\'s strengths.' },
    ],
    ai_business_use_cases: [
      'Open-source nature allows custom forks for enterprise-specific tool integrations',
      'GPT-4o access enables teams already on OpenAI enterprise to avoid adding another vendor',
      'Sandboxed execution makes it safer for running in shared CI/CD environments',
    ],
    code_snippet: `# Install and configure
npm install -g @openai/codex
export OPENAI_API_KEY=sk-...

# Basic usage
codex "add input validation to all API route handlers"

# Full auto mode (no confirmations)
codex --approval-mode full-auto "refactor auth module to use JWT refresh tokens"

# With project context file
# Create codex-instructions.md in project root:
cat > codex-instructions.md << 'EOF'
Stack: Express.js + TypeScript + Prisma + PostgreSQL
Test runner: Vitest
Style: Airbnb ESLint config
Never modify migration files directly
Run \`npm test\` after changes to verify
EOF`,
    difficulty: 'intermediate',
    tags: ['codex', 'openai', 'cli', 'terminal', 'agent'],
    quality_score: 7,
    is_featured: false,
    scraped_at: '2026-03-08T07:00:00Z',
    created_at: '2026-03-08T07:04:00Z',
  },
  {
    id: 'seed-011',
    title: 'Structured Output Prompting with Zod Schemas for Type-Safe AI Responses',
    raw_content: null,
    source_url: 'https://reddit.com/r/typescript/comments/1jkl345/zod_ai_structured_output',
    source_type: 'reddit',
    category: 'technique',
    tool: 'general',
    ai_summary: 'A pattern for getting type-safe structured data from any LLM by embedding a Zod schema description in your prompt and then parsing/validating the response. Works with any model even without native function calling, and gives you TypeScript types for free.',
    ai_actionable_steps: [
      'Define your Zod schema first, then use zod-to-json-schema to convert it to a JSON Schema description, and embed that in your prompt as the expected output format.',
      'Use z.object() with .describe() on each field — the descriptions become part of the prompt automatically when you serialize the schema.',
      'Wrap the LLM call in a retry loop with the Zod parse error fed back to the model: "Your response failed validation: [error]. Try again."',
    ],
    ai_project_ideas: [
      { title: 'Schema-Driven Form Filler', description: 'Given any web form structure as a Zod schema, have AI fill it with realistic test data that passes all validations.' },
      { title: 'Data Extraction Pipeline', description: 'Extract structured entities (people, dates, amounts, relationships) from unstructured documents with a validated Zod output schema.' },
    ],
    ai_business_use_cases: [
      'Extract structured data from customer emails into CRM fields without manual data entry',
      'Parse invoices and receipts into typed accounting records with automatic validation',
      'Convert unstructured support tickets into structured issue reports with priority, category, and affected components',
    ],
    code_snippet: `import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const ProductSchema = z.object({
  name: z.string().describe('Product name, title-cased'),
  price: z.number().positive().describe('Price in USD, no currency symbol'),
  category: z.enum(['electronics', 'clothing', 'food', 'other']),
  inStock: z.boolean(),
  tags: z.array(z.string()).max(5).describe('Relevant search tags'),
})

type Product = z.infer<typeof ProductSchema>

async function extractProduct(text: string): Promise<Product> {
  const schema = zodToJsonSchema(ProductSchema)

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    messages: [{
      role: 'user',
      content: \`Extract product info from this text and return ONLY valid JSON
matching this schema: \${JSON.stringify(schema, null, 2)}

Text: \${text}\`
    }]
  })

  const raw = JSON.parse(response.content[0].text)
  return ProductSchema.parse(raw) // throws if invalid
}`,
    difficulty: 'intermediate',
    tags: ['typescript', 'zod', 'structured-output', 'validation', 'parsing'],
    quality_score: 8,
    is_featured: false,
    scraped_at: '2026-03-08T07:00:00Z',
    created_at: '2026-03-08T07:07:00Z',
  },
  {
    id: 'seed-012',
    title: 'Multi-Agent Orchestration: Specialist Subagents with a Coordinator Claude',
    raw_content: null,
    source_url: 'https://github.com/anthropics/anthropic-cookbook/tree/main/patterns/agents',
    source_type: 'github',
    category: 'workflow',
    tool: 'claude-code',
    ai_summary: 'A pattern where a "coordinator" Claude instance breaks down complex tasks and delegates to specialized subagents — a security reviewer, a performance optimizer, a test writer, each with a narrow system prompt. Results are synthesized by the coordinator. Dramatically better than one generalist agent for complex codebases.',
    ai_actionable_steps: [
      'Define your specialist agents: each is just a Claude API call with a highly focused system prompt (e.g., "You are a security auditor. Find vulnerabilities only.").',
      'The coordinator receives the task, breaks it into subtasks, calls each specialist with relevant code context, then synthesizes the responses into a final action plan.',
      'Use Claude\'s extended thinking feature for the coordinator\'s planning phase — this is where most of the intelligence should be invested.',
    ],
    ai_project_ideas: [
      { title: 'Code Analysis Suite', description: 'An orchestrated system with agents for security, performance, accessibility, and maintainability — run all four on any codebase.' },
      { title: 'Document Processing Pipeline', description: 'Coordinator splits documents, specialist agents extract different entity types (people, dates, numbers, relationships), coordinator merges results.' },
    ],
    ai_business_use_cases: [
      'Enterprise due diligence — parallel specialist agents analyze different aspects of target company code simultaneously',
      'Compliance checking — dedicated agents for each regulation (GDPR, HIPAA, SOX) run in parallel for comprehensive audit',
      'Content production pipelines — research agent, writing agent, fact-check agent, and SEO agent work in sequence on each article',
    ],
    code_snippet: `// Multi-agent orchestration pattern
const AGENTS = {
  security: \`You are a security expert. Analyze code for: SQL injection,
    XSS, CSRF, auth bypass, secrets exposure. List findings only.\`,
  performance: \`You are a performance engineer. Identify: N+1 queries,
    missing indexes, unnecessary re-renders, memory leaks. Be specific.\`,
  architecture: \`You are a software architect. Evaluate: separation of
    concerns, SOLID principles, coupling, testability. Give a score 1-10.\`,
}

async function analyzeCode(code: string) {
  // Run specialists in parallel
  const [security, perf, arch] = await Promise.all(
    Object.entries(AGENTS).map(([name, prompt]) =>
      anthropic.messages.create({
        system: prompt,
        messages: [{ role: 'user', content: code }]
      }).then(r => ({ name, findings: r.content[0].text }))
    )
  )

  // Coordinator synthesizes
  return anthropic.messages.create({
    system: 'Synthesize these specialist reports into a prioritized action plan.',
    messages: [{
      role: 'user',
      content: JSON.stringify([security, perf, arch])
    }]
  })
}`,
    difficulty: 'advanced',
    tags: ['multi-agent', 'orchestration', 'architecture', 'parallel', 'claude-code'],
    quality_score: 9,
    is_featured: true,
    scraped_at: '2026-03-07T07:00:00Z',
    created_at: '2026-03-07T07:00:00Z',
  },
  {
    id: 'seed-013',
    title: 'Prompt Caching Strategy: 90% Cost Reduction on Repeated Context',
    raw_content: null,
    source_url: 'https://reddit.com/r/ClaudeAI/comments/1mno678/prompt_caching_guide',
    source_type: 'reddit',
    category: 'skill',
    tool: 'claude-code',
    ai_summary: 'Anthropic\'s prompt caching allows you to cache up to 32k tokens of context at a 90% discount on subsequent calls. For applications with large system prompts, codebases, or reference documents, structuring your prompts to maximize cache hits can reduce API costs by 60-80%.',
    ai_actionable_steps: [
      'Mark your large, static context blocks with "cache_control": {"type": "ephemeral"} in the messages array. Put these BEFORE dynamic content since caching is prefix-based.',
      'Structure prompts as: [static system prompt] → [cached codebase/docs] → [dynamic user message]. The first two layers get cached after the first call.',
      'Monitor cache hit rates in the API response\'s usage.cache_read_input_tokens field. Aim for >80% cache hit rate in production.',
    ],
    ai_project_ideas: [
      { title: 'Cache Hit Rate Optimizer', description: 'Analyze your application\'s Claude API call patterns and automatically restructure prompts to maximize cache hit rates.' },
      { title: 'Documentation Q&A System', description: 'Cache your entire documentation (up to 32k tokens) once, then answer hundreds of user questions about it at 10% the normal cost.' },
    ],
    ai_business_use_cases: [
      'Customer support bots with large knowledge bases — cache the KB once, answer thousands of queries cheaply',
      'Code review systems that analyze the same codebase repeatedly throughout the day',
      'Multi-tenant AI applications where each tenant\'s context is cached across sessions',
    ],
    code_snippet: `import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic()

// Large static content cached after first call
const SYSTEM_DOCS = \`[your 10,000 token documentation here]\`

async function askQuestion(userQuestion: string) {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: 'You are a helpful assistant. Answer questions using the docs.',
      },
      {
        type: 'text',
        text: SYSTEM_DOCS,
        // This block gets cached after first call
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userQuestion }],
  })

  const { cache_creation_input_tokens, cache_read_input_tokens } =
    response.usage
  console.log('Cache hit?', cache_read_input_tokens > 0)
  return response
}`,
    difficulty: 'intermediate',
    tags: ['caching', 'cost-reduction', 'optimization', 'api', 'claude'],
    quality_score: 9,
    is_featured: false,
    scraped_at: '2026-03-07T07:00:00Z',
    created_at: '2026-03-07T07:03:00Z',
  },
  {
    id: 'seed-014',
    title: 'Context Window Management for Large Codebases in Claude Code',
    raw_content: null,
    source_url: 'https://github.com/anthropics/claude-code/discussions/445',
    source_type: 'github',
    category: 'skill',
    tool: 'claude-code',
    ai_summary: 'When working on large codebases, Claude Code\'s context window fills quickly. This guide covers /compact command usage, strategic use of @file references, sub-agent spawning for isolated tasks, and when to start fresh sessions vs. continue existing ones.',
    ai_actionable_steps: [
      'Use /compact before large tasks to summarize conversation history — this frees 60-70% of context while preserving key decisions. Run it after any major feature is complete.',
      'Prefer targeted @file references over asking Claude to "look at the codebase" — be specific: "@src/auth/middleware.ts and @src/types/user.ts" is 10x more efficient than a directory scan.',
      'For isolated, self-contained tasks (writing a utility function, a test file, a migration), spawn a fresh Claude Code session — clean context means sharper focus and lower cost.',
    ],
    ai_project_ideas: [
      { title: 'Context Budget Tracker', description: 'A Claude Code hook that monitors context usage and automatically suggests /compact when approaching 70% capacity.' },
      { title: 'Session Handoff Protocol', description: 'A CLAUDE.md template that captures "current state" at session end, enabling seamless continuation in a new session.' },
    ],
    ai_business_use_cases: [
      'Manage AI costs on enterprise codebases by minimizing unnecessary context inclusion',
      'Maintain session quality on long development days by preventing context degradation',
      'Enable parallel AI sessions on different features without cross-contamination',
    ],
    code_snippet: null,
    difficulty: 'intermediate',
    tags: ['context-window', 'memory', 'optimization', 'claude-code', 'large-codebases'],
    quality_score: 7,
    is_featured: false,
    scraped_at: '2026-03-06T07:00:00Z',
    created_at: '2026-03-06T07:00:00Z',
  },
  {
    id: 'seed-015',
    title: 'Few-Shot Prompting with Negative Examples: What NOT to Output',
    raw_content: null,
    source_url: 'https://reddit.com/r/PromptEngineering/comments/1pqr901/negative_few_shot',
    source_type: 'reddit',
    category: 'prompt',
    tool: 'general',
    ai_summary: 'Standard few-shot prompting shows positive examples. Adding "BAD example" alongside "GOOD example" in your shots reduces the most common failure modes by up to 50%. The contrast teaches the model the boundary more precisely than positive examples alone.',
    ai_actionable_steps: [
      'For each few-shot example, add a parallel "What NOT to do" variant showing the most common failure mode — over-explanation, wrong format, incorrect tone, etc.',
      'Label clearly: "GOOD EXAMPLE:" and "BAD EXAMPLE (too verbose):" — the parenthetical explanation of WHY it\'s bad is crucial.',
      'Use 2 good + 2 bad examples rather than 4 good examples — the contrastive pairs are more information-dense for teaching behavior.',
    ],
    ai_project_ideas: [
      { title: 'Negative Example Generator', description: 'Feed the AI your positive examples and have it generate realistic failure-mode examples for you to include as negative shots.' },
      { title: 'Prompt Quality Scorer', description: 'An AI tool that evaluates prompts for missing negative examples and suggests where contrast examples would improve reliability.' },
    ],
    ai_business_use_cases: [
      'Customer communication templates where tone failures are costly',
      'Legal document generation where format errors create liability',
      'Data extraction where hallucination of missing fields is a common failure mode',
    ],
    code_snippet: `// Few-shot prompt with negative examples
const prompt = \`
Convert informal customer messages to formal support tickets.

GOOD EXAMPLE:
Input: "omg ur app keeps crashing when i try to pay!!"
Output: {
  "title": "Payment flow crash — reproducible",
  "severity": "high",
  "description": "Application crashes during payment process. User reports consistent reproduction.",
  "category": "billing"
}

BAD EXAMPLE (too formal, misses urgency signal):
Input: "omg ur app keeps crashing when i try to pay!!"
Output: {
  "title": "Application issue",
  "severity": "medium",
  "description": "User reported an application problem.",
  "category": "technical"
}
^ Bad because: strips urgency signals, vague description, wrong severity

Now convert this message:
Input: "{customer_message}"
\``,
    difficulty: 'beginner',
    tags: ['few-shot', 'prompting', 'negative-examples', 'reliability', 'format'],
    quality_score: 8,
    is_featured: false,
    scraped_at: '2026-03-06T07:00:00Z',
    created_at: '2026-03-06T07:04:00Z',
  },
  {
    id: 'seed-016',
    title: 'MCP Server Development: Extend Claude Code with Custom Tool APIs',
    raw_content: null,
    source_url: 'https://github.com/anthropics/modelcontextprotocol',
    source_type: 'github',
    category: 'hook',
    tool: 'claude-code',
    ai_summary: 'Model Context Protocol (MCP) lets you build custom tool servers that expose any API, database, or service to Claude Code as native tools. Your internal Jira, Notion workspace, or custom CI system becomes a first-class tool Claude can call without leaving the terminal.',
    ai_actionable_steps: [
      'Scaffold an MCP server with npx @modelcontextprotocol/create-server my-server — this gives you a TypeScript template with typed tool definitions.',
      'Define your tools in the tools array with JSON Schema for inputs — Claude will use these schema descriptions to know when and how to call your tool.',
      'Register the server in ~/.claude/settings.json under "mcpServers" with the command to start it — Claude Code will auto-start it when needed.',
    ],
    ai_project_ideas: [
      { title: 'Internal Tools MCP Hub', description: 'A single MCP server that wraps all your company\'s internal APIs — JIRA, Confluence, internal databases — exposing them all to Claude Code.' },
      { title: 'Database Explorer MCP', description: 'An MCP server that gives Claude read access to your PostgreSQL schema and query execution for data analysis without leaving the terminal.' },
    ],
    ai_business_use_cases: [
      'Connect Claude Code to internal ticketing systems for automatic issue creation and updates',
      'Give developers AI access to production metrics and logs for debugging without context switching',
      'Build compliance automation by connecting Claude to your GRC platform tools',
    ],
    code_snippet: `// MCP Server template (TypeScript)
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const server = new Server(
  { name: 'my-company-tools', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'get_jira_ticket',
    description: 'Fetch a JIRA ticket by ID. Use when discussing a specific issue.',
    inputSchema: {
      type: 'object',
      properties: {
        ticket_id: { type: 'string', description: 'e.g. ENG-1234' }
      },
      required: ['ticket_id']
    }
  }]
}))

server.setRequestHandler('tools/call', async (req) => {
  if (req.params.name === 'get_jira_ticket') {
    const ticket = await fetchJiraTicket(req.params.arguments.ticket_id)
    return { content: [{ type: 'text', text: JSON.stringify(ticket) }] }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)`,
    difficulty: 'advanced',
    tags: ['mcp', 'tool-use', 'integration', 'claude-code', 'protocol'],
    quality_score: 9,
    is_featured: true,
    scraped_at: '2026-03-05T07:00:00Z',
    created_at: '2026-03-05T07:00:00Z',
  },
]

export const SEED_DIGEST: DailyDigest = {
  id: 'digest-20260311',
  date: '2026-03-11',
  headline: 'Hooks, Multi-Agent Pipelines & the Art of Asking Better Questions',
  intro_paragraph: 'Today\'s intelligence covers three themes dominating the AI tooling conversation: Claude Code\'s hook system for automated quality gates, the emerging multi-agent orchestration pattern that separates planning from execution, and the surprisingly powerful impact of negative examples in prompt engineering. Plus: a deep dive into prompt caching economics that most teams are leaving on the table.',
  featured_item_ids: ['seed-001', 'seed-003', 'seed-006', 'seed-009', 'seed-012', 'seed-016'],
  total_new_items: 16,
  created_at: '2026-03-11T07:00:00Z',
}

export function getSeedItemById(id: string): LibraryItem | undefined {
  return SEED_ITEMS.find(item => item.id === id)
}
