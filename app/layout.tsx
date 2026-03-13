import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Analytics } from '@vercel/analytics/next'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-syne',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Agent0s — AI Intelligence Library',
  description: 'Mission-critical AI tools, prompts, hooks, and techniques — curated daily for builders and business owners.',
  openGraph: {
    title: 'Agent0s — AI Intelligence Library',
    description: 'Daily-updated library of AI tools, prompts, and techniques.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Nav />
            <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              {children}
            </main>
            <footer
              style={{
                borderTop: '1px solid var(--border-glass)',
                padding: '24px 24px',
                marginTop: 'auto',
                background: 'var(--surface-glass)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      background: 'linear-gradient(135deg, var(--accent), rgba(232, 184, 75, 0.5))',
                      borderRadius: 3,
                      flexShrink: 0,
                    }}
                  />
                  <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                    Agent0s · AI Intelligence Library
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                    Updated daily · 7am PST
                  </span>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--accent-green)',
                      display: 'inline-block',
                      boxShadow: '0 0 6px var(--accent-green)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
