import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Nav } from '@/components/nav'
import { QueryProvider } from '@/providers/query-provider'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Grocery',
  description: 'Grocery list, recipes, and meal planning',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground md:h-screen">
        <QueryProvider>
          <div className="flex min-h-screen flex-col md:h-screen md:flex-row">
            {/* Sidebar on desktop, bottom bar on mobile */}
            <aside className="md:w-52 md:shrink-0 md:border-r">
              <Nav />
            </aside>

            {/* Main content */}
            <main className="flex-1 pb-20 md:overflow-y-auto md:pb-0">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
