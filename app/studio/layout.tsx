import type { Metadata, Viewport } from 'next'

/**
 * Own root layout for the embedded Studio (brief §8.1). It renders its own
 * <html>/<body> so the Studio is isolated from the localized site chrome, and
 * it works on desktop and mobile. No site fonts, header, footer or CSS here.
 */
export const metadata: Metadata = {
  title: 'Insight Studio',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
