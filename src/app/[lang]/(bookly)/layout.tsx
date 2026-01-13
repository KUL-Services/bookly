import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'

import { TranslationsProvider } from '@/bookly/providers'
import type { PageProps } from '@/bookly/types'
import { ThemeChanger } from '@/bookly/components/temporary'
import BooklyNavbar from '@/bookly/components/organisms/bookly-navbar/bookly-navbar'
import AuthInitializer from '@/components/AuthInitializer'
import LanguageNavigationGuard from '@/components/LanguageNavigationGuard'

export const metadata: Metadata = {
  title: 'Bookly',
  description: 'Bookly Booking Platform'
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: PageProps['params']
}>) {
  const { lang: locale } = await params

  return (
    <TranslationsProvider locale={locale}>
      <ThemeProvider attribute='class' enableSystem>
        <AuthInitializer />
        <LanguageNavigationGuard />
        {/* <ThemeChanger /> */}
        <div
          style={{
            background: 'var(--background)',
            color: 'var(--foreground)'
          }}
          className='antialiased font-sans'
        >
          <BooklyNavbar />
          {children}
        </div>
      </ThemeProvider>
    </TranslationsProvider>
  )
}
