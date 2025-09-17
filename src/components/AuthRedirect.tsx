'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const pathname = usePathname()

  // ℹ️ Bring me `lang`
  const redirectUrl = `/${lang}/login?redirectTo=${pathname}`
  const login = `/${lang}/login`
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)

  // Don't redirect public bookly pages to login - only redirect dashboard pages
  const isBooklyPublicPage = pathname.includes('/landpage') ||
                            pathname.includes('/search') ||
                            pathname.includes('/business/') ||
                            pathname.includes('/service/') ||
                            pathname.includes('/category/') ||
                            pathname.includes('/customer/login') ||
                            pathname.includes('/customer/register')

  if (isBooklyPublicPage) {
    return null
  }

  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}

export default AuthRedirect
