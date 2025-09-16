import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bookly',
  description: 'Bookly app root layout'
}

export default function RootAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='min-h-screen w-full flex-1'>{children}</body>
    </html>
  )
}
