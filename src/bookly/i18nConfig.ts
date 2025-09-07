import { Config } from 'next-i18n-router/dist/types'

const i18nConfig: Config = {
  locales: ['en', 'ar', 'fr'],
  defaultLocale: 'en',
  prefixDefault: true
}

export { i18nConfig }
