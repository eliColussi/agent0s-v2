'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/library', label: 'Library' },
  { href: '/agentic', label: 'Agentic' },
]

export default function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="glass-nav"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 56,
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              background: 'linear-gradient(135deg, var(--accent), rgba(232, 184, 75, 0.6))',
              borderRadius: 5,
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(232, 184, 75, 0.3)',
            }}
          />
          <span
            className="font-syne"
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
            }}
          >
            AGENT0S
          </span>
        </Link>

        {/* Center nav links — desktop */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 2 }}>
          {navLinks.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? 'nav-link-active' : ''}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: active ? 'rgba(232, 184, 75, 0.06)' : 'transparent',
                  transition: 'color 0.15s ease, background 0.15s ease',
                  position: 'relative',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <a
            href="https://www.skool.com/ai-staffroom/about"
            target="_blank"
            rel="noopener noreferrer"
            className="font-syne hidden sm:inline-flex"
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.02em',
              textDecoration: 'none',
              color: '#06080f',
              background: 'linear-gradient(135deg, var(--accent) 0%, #d4a43a 100%)',
              boxShadow: '0 0 20px rgba(232, 184, 75, 0.3), 0 2px 4px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(232, 184, 75, 0.5), 0 4px 12px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(232, 184, 75, 0.3), 0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Learn AI
          </a>

          <div
            className="hidden sm:flex font-mono"
            style={{
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(0, 200, 150, 0.06)',
              border: '1px solid rgba(0, 200, 150, 0.1)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-green)',
                display: 'inline-block',
                boxShadow: '0 0 8px var(--accent-green)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ color: 'var(--accent-green)' }}>LIVE</span>
          </div>

          <ThemeToggle />

          <button
            className="flex md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid var(--border-glass)',
              background: 'var(--surface-glass)',
              color: 'var(--text-muted)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="mobile-menu-enter md:hidden"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '12px 24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navLinks.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  background: active ? 'rgba(232, 184, 75, 0.08)' : 'transparent',
                  transition: 'color 0.15s ease, background 0.15s ease',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}
          <a
            href="https://www.skool.com/ai-staffroom/about"
            target="_blank"
            rel="noopener noreferrer"
            className="font-syne"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: '11px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              color: '#06080f',
              background: 'var(--accent)',
              marginTop: 8,
              boxShadow: '0 0 16px rgba(232, 184, 75, 0.3)',
            }}
          >
            Learn AI
          </a>
        </div>
      )}
    </nav>
  )
}
