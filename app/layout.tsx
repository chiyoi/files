import type { Metadata, Viewport } from 'next'
import '@radix-ui/themes/styles.css'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Files',
  description: 'Temporary file storage.',
  icons: {
    icon: 'https://files.neko03.moe/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FEF7FB' },
    { media: '(prefers-color-scheme: dark)', color: '#21121D' },
  ],
}

export default function RootLayout(props: Props) {
  const { children } = props
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  )
}

type Props = {
  children: ReactNode
}
