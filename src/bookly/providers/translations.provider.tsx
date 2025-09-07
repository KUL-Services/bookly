'use client'

import type { ReactNode } from 'react'

import { I18nextProvider } from 'react-i18next'

import type { Resource } from 'i18next'
import { createInstance } from 'i18next'

import initTranslations from '@/app//i18n/i18n'

interface TranslationsProviderProps {
  children: ReactNode
  locale: 'ar' | 'en' | 'fr'
  resources?: Resource // Ideally, use the correct type from your i18n config
}

export default function TranslationsProvider({ children, locale, resources }: TranslationsProviderProps) {
  const i18n = createInstance()

  initTranslations(locale, ['common'], i18n, resources)

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
