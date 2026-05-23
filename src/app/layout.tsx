import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Lexend, Source_Sans_3 } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ERP RRI',
  description: 'ERP System for RRI',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${lexend.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('erp_rri_theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
