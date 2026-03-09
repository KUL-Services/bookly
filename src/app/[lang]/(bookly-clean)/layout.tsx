import type { Metadata } from 'next'
import '../(bookly)/globals.css'
import { ThemeProvider } from 'next-themes'
import BooklyNavbar from '@/bookly/components/organisms/bookly-navbar/bookly-navbar'
import { MobileBottomNav } from '@/bookly/components/organisms/mobile-bottom-nav'

import { TranslationsProvider } from '@/bookly/providers'
import type { PageProps } from '@/bookly/types'
import { SettingsProvider } from '@/contexts/settings.context'
import AuthInitializer from '@/components/AuthInitializer'
import PushTokenInitializer from '@/components/PushTokenInitializer'
import initTranslations from '@/app/i18n/i18n'
import LanguageNavigationGuard from '@/components/LanguageNavigationGuard'

export const metadata: Metadata = {
  title: 'Zerv',
  description: 'Zerv Booking Platform'
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: PageProps['params']
}>) {
  const { lang: locale } = await params
  const { resources } = await initTranslations(locale || 'en', ['common'])

  return (
    <TranslationsProvider locale={locale || 'en'} resources={resources}>
      {/* Revert option: <ThemeProvider attribute='class' enableSystem> */}
      <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
        <SettingsProvider>
          <AuthInitializer />
          <PushTokenInitializer />
          <LanguageNavigationGuard />
          <div
            style={{
              background: 'var(--background)',
              color: 'var(--foreground)'
            }}
            className='antialiased font-sans'
          >
            {/* Desktop Navbar - hidden on mobile */}
            <div className='hidden lg:block'>
              <BooklyNavbar />
            </div>
            {/* Main Content - with bottom padding for mobile nav */}
            <div className='pb-[calc(var(--mobile-bottom-nav-offset)+16px)] lg:pb-0'>{children}</div>
            {/* Mobile Bottom Nav - hidden on desktop */}
            <MobileBottomNav />
          </div>
        </SettingsProvider>
      </ThemeProvider>
    </TranslationsProvider>
  )
}
