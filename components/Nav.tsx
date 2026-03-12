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
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 56,
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              background: 'var(--accent)',
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
          <span
            className="font-syne"
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
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
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color 0.15s ease',
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
          {/* Learn AI CTA */}
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
              background: 'var(--accent)',
              boxShadow: '0 0 16px rgba(232, 184, 75, 0.3), 0 1px 2px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(232, 184, 75, 0.5), 0 2px 8px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(232, 184, 75, 0.3), 0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Learn AI
          </a>

          {/* Live status */}
          <div
            className="hidden sm:flex font-mono"
            style={{
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-green)',
                display: 'inline-block',
                boxShadow: '0 0 6px var(--accent-green)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span>LIVE · 247 items</span>
          </div>

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface-raised)',
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="mobile-menu-enter md:hidden"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
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
