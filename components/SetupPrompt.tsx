'use client'
import { useState } from 'react'

interface Item {
  title: string
  category: string
  tool: string
  ai_summary: string | null
  ai_actionable_steps: string[] | null
  code_snippet: string | null
  source_url: string
  source_type: string
}

/** Does this category typically require AI provider API access? */
function needsAIProvider(category: string): boolean {
  return ['technique', 'workflow', 'niche-use-case', 'model'].includes(category)
}

/** Derive header verb based on category */
function headerVerb(category: string): string {
  switch (category) {
    case 'skill':
    case 'plugin':
    case 'hook': return 'Install & Configure'
    case 'prompt': return 'Set Up'
    case 'technique': return 'Apply Technique'
    case 'workflow': return 'Set Up Workflow'
    case 'niche-use-case': return 'Implement Use Case'
    case 'model': return 'Evaluate Model'
    default: return 'Set Up'
  }
}

function buildPrompt(item: Item): string {
  const lines: string[] = []
  const isAgentic = ['skill', 'hook', 'plugin', 'prompt'].includes(item.category)
  const isGitHub = item.source_url?.includes('github.com')
  const isRepoUrl = isGitHub && !item.source_url.includes('/discussions/') && !item.source_url.includes('/issues/') && !item.source_url.includes('/blob/')
  const isGitHubFile = isGitHub && item.source_url.includes('/blob/')
  const wantsProvider = needsAIProvider(item.category)

  // ── Header ──
  lines.push(`# ${headerVerb(item.category)}: ${item.title}`)
  lines.push('')

  // ── What this is ──
  if (item.ai_summary) {
    lines.push('## What This Is')
    lines.push(item.ai_summary)
    lines.push('')
  }

  // ── Source ──
  if (item.source_url) {
    lines.push(`Source: ${item.source_url}`)
    lines.push('')
  }

  // ── Workspace analysis ──
  if (item.category === 'model') {
    lines.push('## Before You Start')
    lines.push('')
    lines.push('Scan my workspace and analyze:')
    lines.push('- The project language, framework, and current AI integrations')
    lines.push('- Existing AI provider config (check .env, .env.local, config files for API keys — OpenRouter, OpenAI, Anthropic, Google AI, etc.)')
    lines.push('- Which AI models I currently use and for what purposes')
    lines.push('')
    lines.push('Then ask me before proceeding:')
    lines.push('1. Am I interested in evaluating this model for my project, or just want a summary of what it offers?')
    lines.push('2. If I want to try it — which part of my current AI stack should it replace or complement?')
  } else {
    lines.push('## Before You Start')
    lines.push('')
    lines.push('Scan my workspace and analyze:')
    lines.push('- The project language, framework, and directory structure')

    if (wantsProvider) {
      lines.push('- Existing AI provider config (check .env, .env.local, config files for API keys — OpenRouter, OpenAI, Anthropic, Google AI, etc.)')
    }

    if (isAgentic) {
      lines.push('- Existing agent configuration (check for .claude/, .codex/, CLAUDE.md, settings.json, commands/, skills/ directories)')
    }

    if (isRepoUrl) {
      lines.push('- Whether this repository or a similar tool is already cloned or installed')
    }

    lines.push('')
    lines.push('Then ask me before proceeding:')

    // Category-aware questions
    if (wantsProvider) {
      lines.push('1. Which AI provider/API should this use? (Use whatever I already have configured, or ask me to set one up — options include direct provider APIs or a unified service like OpenRouter)')
    }

    const qNum = wantsProvider ? 2 : 1
    if (item.category === 'hook') {
      lines.push(`${qNum}. Which lifecycle event should this hook fire on? (PreToolUse, PostToolUse, Notification, etc.)`)
      lines.push(`${qNum + 1}. Are there any files, patterns, or tools this should be scoped to?`)
    } else if (item.category === 'plugin') {
      lines.push(`${qNum}. Do I need to configure any service credentials for this plugin (database, API keys, etc.)?`)
      lines.push(`${qNum + 1}. Should this be project-scoped or global?`)
    } else if (item.category === 'skill') {
      lines.push(`${qNum}. Where should this skill be installed — project-level (.claude/skills/) or globally?`)
      lines.push(`${qNum + 1}. Any customizations needed (trigger conditions, naming, etc.)?`)
    } else if (item.category === 'prompt') {
      lines.push(`${qNum}. Should this be a slash command (.claude/commands/*.md) or added to CLAUDE.md as persistent context?`)
      lines.push(`${qNum + 1}. Any project-specific values I should customize in the prompt?`)
    } else {
      lines.push(`${qNum}. Where in my project should this be integrated?`)
      lines.push(`${qNum + 1}. Are there any customizations I need (model preferences, naming conventions, constraints)?`)
    }
  }

  lines.push('')

  // ── Source access instructions ──
  // Validate GitHub URLs match expected patterns before embedding in shell commands
  const safeGitHubRepo = isRepoUrl && /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/.test(item.source_url)
  const safeGitHubFile = isGitHubFile && /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/blob\//.test(item.source_url)

  if (safeGitHubRepo) {
    lines.push('## Fetch the Source')
    lines.push('')
    lines.push(`Clone or inspect the repository to understand what needs to be installed:`)
    lines.push('```bash')
    lines.push(`gh repo clone ${item.source_url.replace('https://github.com/', '')}`)
    lines.push('```')
    lines.push('Review the README, directory structure, and any install instructions before proceeding.')
    lines.push('')
  } else if (safeGitHubFile) {
    lines.push('## Fetch the Source')
    lines.push('')
    lines.push('Fetch the raw file content from GitHub:')
    lines.push('```bash')
    const rawUrl = item.source_url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
    lines.push(`curl -sL "${rawUrl}"`)
    lines.push('```')
    lines.push('')
  } else if (item.source_url && !isGitHub) {
    lines.push('## Source Access Note')
    lines.push('')
    lines.push(`The source URL (${item.source_url}) may not be directly accessible from the terminal. Use the Reference Implementation and Additional Context sections below instead. If you need more details, ask me to paste relevant content from the source.`)
    lines.push('')
  }

  // ── Implementation instructions (category-aware) ──
  lines.push('## What to Implement')
  lines.push('')

  if (item.category === 'skill') {
    lines.push('This is an **Agent Skill** — an auto-loaded capability defined in a SKILL.md file.')
    lines.push('')
    lines.push('- Read the source repository/file to find the skill definition (SKILL.md or equivalent)')
    lines.push('- Place it in the correct skills directory for my agent setup (`.claude/skills/`, or equivalent)')
    lines.push('- Ensure the SKILL.md frontmatter is valid and the skill is discoverable')
    lines.push('- If the skill requires any dependencies, install them using the project\'s package manager')
  } else if (item.category === 'hook') {
    lines.push('This is an **Agent Hook** — a shell/HTTP command that fires at lifecycle events.')
    lines.push('')
    lines.push('- Add the hook configuration to `.claude/settings.json` under the lifecycle event I specified')
    lines.push('- If the hook needs a shell script, create it and make it executable (`chmod +x`)')
    lines.push('- If the hook calls an external API, configure it using credentials from my .env files')
    lines.push('- Validate the JSON config is syntactically correct before saving')
  } else if (item.category === 'plugin') {
    lines.push('This is an **Agent Plugin** — typically an MCP server or capability bundle.')
    lines.push('')
    lines.push('- Install any required npm/pip packages from the source repository')
    lines.push('- Register the MCP server in `.claude/settings.json` under the `mcpServers` key with the correct command and args')
    lines.push('- Configure any required environment variables or credentials')
    lines.push('- Verify the server starts correctly by checking its expected output')
  } else if (item.category === 'prompt') {
    lines.push('This is a **Command Template** — a reusable slash command or system prompt.')
    lines.push('')
    lines.push('- Create the command file based on my answer above (either `.claude/commands/[name].md` or add to `CLAUDE.md`)')
    lines.push('- Adapt any placeholder values to my project specifics')
    lines.push('- If the command references specific tools or APIs, wire it to what I already have configured')
  } else if (item.category === 'technique') {
    lines.push('This is an **AI Technique** — a pattern or methodology for working with AI models.')
    lines.push('')
    lines.push('- Explain how this technique applies to my current project and what benefit it provides')
    lines.push('- Implement it in a way that fits my existing codebase — suggest concrete files to modify or create')
    lines.push('- If it requires specific model capabilities (structured output, function calling, etc.), verify my current provider supports them')
    lines.push('- Show me a working example I can test immediately')
  } else if (item.category === 'workflow') {
    lines.push('This is an **AI Workflow** — an end-to-end automation pattern or integration pipeline.')
    lines.push('')
    lines.push('- Study the workflow architecture from the source and context below')
    lines.push('- Identify which parts I can implement locally vs. parts that need external services')
    lines.push('- For local parts: implement them using my existing stack and API keys')
    lines.push('- For external parts: tell me exactly what services I need and help me configure the integration code')
    lines.push('- Wire up any required API calls using keys from my .env files')
  } else if (item.category === 'model') {
    lines.push('This is a **New AI Model** — a model release, update, or capability announcement.')
    lines.push('')
    lines.push('- Analyze the best use cases for this model within my project and current AI stack')
    lines.push('- Compare its strengths, pricing, and context window against whatever I currently use')
    lines.push('- Give me a clear, convincing argument for why this model would (or would not) be a good fit for my project')
    lines.push('- If I want to try it: update my API configuration (provider, model ID, any new parameters) to point to this model')
    lines.push('- If it requires a new API key or provider signup, tell me exactly what to do')
  }

  lines.push('')

  // ── Context from enrichment steps (as background for the agent) ──
  const steps = item.ai_actionable_steps || []
  if (steps.length > 0) {
    lines.push('## Additional Context')
    lines.push('')
    steps.forEach(step => {
      lines.push(`- ${step}`)
    })
    lines.push('')
  }

  // ── Code / config reference ──
  if (item.code_snippet) {
    lines.push('## Reference Implementation')
    lines.push('')
    lines.push('```')
    lines.push(item.code_snippet)
    lines.push('```')
    lines.push('')
  }

  // ── Guidelines for the agent ──
  lines.push('## Guidelines')
  lines.push('')
  lines.push('- Adapt everything to my existing project — do not assume a specific stack or directory layout')

  if (wantsProvider) {
    lines.push('- Use whichever AI provider I already have configured; if I need a new one, tell me what to sign up for and I\'ll give you the key')
    lines.push('- Check my .env files for existing API keys (OpenRouter, OpenAI, Anthropic, Google AI) before asking me to add one')
  }

  lines.push('- Review any fetched code for safety before installing or executing it')
  lines.push('- After setup, run a quick verification and show me a summary of exactly what was installed, where, and how to use it')

  return lines.join('\n')
}

export default function SetupPrompt({ item }: { item: Item }) {
  const [copied, setCopied] = useState(false)
  const prompt = buildPrompt(item)

  const copy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const toolTarget =
    item.tool === 'claude-code' ? 'Claude Code'
    : item.tool === 'chatgpt-codex' ? 'Codex CLI'
    : 'Claude Code or Codex CLI'

  return (
    <section
      style={{
        background: '#080c16',
        border: '1px solid rgba(6,182,212,0.15)',
        borderLeft: '3px solid rgba(6,182,212,0.5)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <h2
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.10em',
              color: 'var(--cat-skill)',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            AI SETUP PROMPT
          </h2>
          <p className="font-mono" style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
            Paste into {toolTarget} — it will scan your project and ask how to proceed
          </p>
        </div>

        <button
          onClick={copy}
          aria-label={copied ? 'Prompt copied to clipboard' : 'Copy setup prompt to clipboard'}
          className="font-mono"
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: 8,
            border: copied ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(6,182,212,0.35)',
            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.12)',
            color: copied ? '#6ee7b7' : '#67e8f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
            minHeight: 44,
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy Prompt
            </>
          )}
        </button>
      </div>

      {/* Prompt preview */}
      <pre
        className="font-mono"
        style={{
          margin: 0,
          padding: '16px 20px',
          fontSize: 12,
          lineHeight: '20px',
          color: '#a5b4c8',
          overflowX: 'auto',
          maxHeight: 280,
          overflowY: 'auto',
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <code>{prompt}</code>
      </pre>

      {/* Footer */}
      <div
        className="font-mono"
        style={{
          padding: '8px 20px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10,
          color: 'var(--text-dim)',
        }}
      >
        <span>~{prompt.length.toLocaleString()} chars</span>
        <span style={{ color: 'rgba(6,182,212,0.4)' }}>Works with Claude Code & Codex CLI</span>
      </div>
    </section>
  )
}
