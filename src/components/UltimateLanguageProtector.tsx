'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const UltimateLanguageProtector = () => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang: string }>()
  const sessionLangRef = useRef<string>('')
  const currentUrlLang = params?.lang || 'en'

  useEffect(() => {
    const supportedLanguages = ['en', 'ar', 'fr']

    console.log(`🏰 UltimateLanguageProtector activated`)
    console.log(`   Current URL: ${pathname}`)
    console.log(`   URL Lang: ${currentUrlLang}`)

    // Get or set session language preference
    let sessionLang = ''
    try {
      sessionLang = sessionStorage.getItem('ultimate_lang_preference') || currentUrlLang
      if (!supportedLanguages.includes(sessionLang)) {
        sessionLang = 'en'
      }
    } catch (e) {
      sessionLang = currentUrlLang
    }

    sessionLangRef.current = sessionLang

    console.log(`   Session Lang: ${sessionLang}`)

    // If this is a new session, store the current language
    if (!sessionStorage.getItem('ultimate_lang_preference')) {
      try {
        sessionStorage.setItem('ultimate_lang_preference', currentUrlLang)
        sessionLangRef.current = currentUrlLang
        console.log(`📝 Storing initial language preference: ${currentUrlLang}`)
      } catch (e) {
        console.warn('Failed to store language preference')
      }
    }

    // If URL language doesn't match session preference, correct immediately
    if (currentUrlLang !== sessionLang) {
      console.log(`🚨 ULTIMATE PROTECTION: URL lang ${currentUrlLang} ≠ Session lang ${sessionLang}`)

      const segments = pathname.split('/').filter(Boolean)
      if (segments.length > 0 && supportedLanguages.includes(segments[0])) {
        segments[0] = sessionLang
      }
      const correctedPath = '/' + segments.join('/')

      console.log(`⚡ ULTIMATE CORRECTION: ${pathname} → ${correctedPath}`)

      // Immediate URL replacement
      window.history.replaceState(
        { ultimateProtection: true },
        '',
        correctedPath
      )

      // Force router update
      router.replace(correctedPath)
    }

    // Override browser navigation to maintain session language
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(state: any, title: string, url?: string | URL | null) {
      if (url) {
        const urlStr = url.toString()
        if (urlStr.includes('/en/') || urlStr.includes('/ar/') || urlStr.includes('/fr/')) {
          // Force session language in any navigation
          const correctedUrl = urlStr.replace(/\/(en|ar|fr)\//, `/${sessionLangRef.current}/`)
          if (correctedUrl !== urlStr) {
            console.log(`🔒 ULTIMATE pushState protection: ${urlStr} → ${correctedUrl}`)
            return originalPushState.call(this, state, title, correctedUrl)
          }
        }
      }
      return originalPushState.call(this, state, title, url)
    }

    window.history.replaceState = function(state: any, title: string, url?: string | URL | null) {
      if (url && !state?.ultimateProtection) {
        const urlStr = url.toString()
        if (urlStr.includes('/en/') || urlStr.includes('/ar/') || urlStr.includes('/fr/')) {
          // Force session language in any navigation
          const correctedUrl = urlStr.replace(/\/(en|ar|fr)\//, `/${sessionLangRef.current}/`)
          if (correctedUrl !== urlStr) {
            console.log(`🔒 ULTIMATE replaceState protection: ${urlStr} → ${correctedUrl}`)
            return originalReplaceState.call(this, state, title, correctedUrl)
          }
        }
      }
      return originalReplaceState.call(this, state, title, url)
    }

    // Handle popstate with highest priority
    const handlePopState = (event: PopStateEvent) => {
      const newPath = window.location.pathname
      const segments = newPath.split('/').filter(Boolean)
      const urlLang = segments[0]

      if (urlLang && urlLang !== sessionLangRef.current && supportedLanguages.includes(urlLang)) {
        console.log(`🚨 ULTIMATE popstate protection triggered`)
        console.log(`   URL: ${newPath} (${urlLang})`)
        console.log(`   Session: ${sessionLangRef.current}`)

        event.stopImmediatePropagation()
        event.preventDefault()

        segments[0] = sessionLangRef.current
        const correctedPath = '/' + segments.join('/')

        console.log(`⚡ ULTIMATE popstate correction: ${newPath} → ${correctedPath}`)

        window.history.replaceState(
          { ultimateProtection: true },
          '',
          correctedPath
        )

        router.replace(correctedPath)
      }
    }

    // Add listener with capture=true for highest priority
    window.addEventListener('popstate', handlePopState, true)

    // Cleanup
    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('popstate', handlePopState, true)
    }
  }, [currentUrlLang, pathname, router])

  // Method to update session language preference
  const updateLanguagePreference = (newLang: string) => {
    try {
      sessionStorage.setItem('ultimate_lang_preference', newLang)
      sessionLangRef.current = newLang
      console.log(`🔄 Updated ultimate language preference: ${newLang}`)
    } catch (e) {
      console.warn('Failed to update language preference')
    }
  }

  // Expose method globally for language dropdowns
  useEffect(() => {
    ;(window as any).updateUltimateLanguagePreference = updateLanguagePreference
  }, [])

  return null
}

export default UltimateLanguageProtector