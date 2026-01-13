import type { Metadata } from 'next'
import './globals.css'
import { helveticaWorld, firaCode } from '@/configs/fonts'

export const metadata: Metadata = {
  title: 'Bookly',
  description: 'Bookly app root layout'
}

export default function RootAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning className={`${helveticaWorld.variable} ${firaCode.variable}`}>
      <body className={`min-h-screen w-full flex-1 ${helveticaWorld.className}`}>{children}</body>
    </html>
  )
}
