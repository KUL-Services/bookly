import { redirect } from 'next/navigation'
import { i18nConfig } from '@/bookly/i18nConfig'

export default function BusinessIndexPage() {
  const locale = i18nConfig.defaultLocale || 'en'
  return redirect(`/${locale}/login`)
}