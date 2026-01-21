import { createInstance, i18n, Resource } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { i18nConfig } from '@/bookly/i18nConfig'

type Locale = 'en' | 'ar' | 'fr'
type Namespace = string | readonly string[]

interface InitTranslationsResult {
  i18n: i18n
  resources: Resource
  t: i18n['t']
}

export default async function initTranslations(
  locale: Locale,
  namespaces: Namespace,
  i18nInstance?: i18n,
  resources?: Resource
): Promise<InitTranslationsResult> {
  const instance = i18nInstance || createInstance()

  instance.use(initReactI18next)

  if (!resources) {
    instance.use(
      resourcesToBackend(
        (language: string, namespace: string) => import(`@/bookly/locales/${language}/${namespace}.json`)
      )
    )
  }

  await instance.init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: Array.isArray(namespaces) ? namespaces[0] : namespaces,
    fallbackNS: Array.isArray(namespaces) ? namespaces[0] : namespaces,
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales,
    interpolation: {
      escapeValue: false
    }
  })

  return {
    i18n: instance,
    resources: {
      [locale]: instance.services.resourceStore.data[locale] as Resource[string]
    },
    t: instance.t
  }
}
