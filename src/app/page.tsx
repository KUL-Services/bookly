import { redirect } from 'next/navigation'
import { i18nConfig } from '@/bookly/i18nConfig'

export default function IndexPage() {
  const locale = i18nConfig.defaultLocale || 'en'
  return redirect(`/${locale}`)
}

