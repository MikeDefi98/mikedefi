import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'Mike Web | Web & App Development Studio – mikedefi.com',
  description:
    'Mike Web (mikedefi.com) is a trusted web and app development studio founded in 2015. Specializing in web development, crypto trading bots, UI/UX design, and digital marketing. 150+ satisfied clients worldwide.',
  keywords:
    'Mike Web, mikedefi.com, Mike Defi, web development, app development, crypto trading bots, UI UX design, digital marketing, Mike Web review, is Mike Web legit',
  metadataBase: new URL('https://mikedefi.com'),
  openGraph: {
    title: 'Mike Web | Web & App Development Studio – mikedefi.com',
    description:
      'Mike Web is a trusted development studio since 2015. 150+ clients, 200+ projects. Web, apps, crypto bots, and more.',
    url: 'https://mikedefi.com',
    siteName: 'Mike Web',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mikedefi.com',
  },
}

export const viewport: Viewport = {
  themeColor: '#050508',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
