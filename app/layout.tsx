import type { Metadata } from 'next'
import { Syne, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import { ThemeProvider } from '@/components/ThemeProvider'

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
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
    <html lang="en" className={`${syne.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Nav />
            <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              {children}
            </main>
            <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', marginTop: 'auto' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                  Agent0s · AI Intelligence Library
                </span>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                  Updated daily · 7am PST
                </span>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
