import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Elections E-Vote',
  description: 'Created By Sseruwagi Sinclaire Sebastian',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
