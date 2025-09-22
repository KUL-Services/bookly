'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const AggressiveLanguageGuard = () => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang: string }>()
  const currentLang = params?.lang || 'en'
  const isInitializedRef = useRef(false)
  const originalHistoryRef = useRef<{
    pushState: typeof window.history.pushState
    replaceState: typeof window.history.replaceState
  } | null>(null)

  useEffect(() => {
    const supportedLanguages = ['en', 'ar', 'fr']

    console.log(`🛡️ AggressiveLanguageGuard initialized for ${pathname}`)
    console.log(`   Current language: ${currentLang}`)
    console.log(`   Environment: ${pathname.includes('/apps/') ? 'Dashboard' : 'Bookly'}`)

    // Function to correct language in URL
    const correctLanguageInUrl = (url: string): string => {
      try {
        const urlObj = new URL(url, window.location.origin)
        const segments = urlObj.pathname.split('/').filter(Boolean)

        if (segments.length > 0 && supportedLanguages.includes(segments[0])) {
          segments[0] = currentLang
        } else if (segments.length > 0) {
          segments.unshift(currentLang)
        }

        return urlObj.origin + '/' + segments.join('/') + urlObj.search + urlObj.hash
      } catch (e) {
        console.warn('Failed to parse URL:', url, e)
        return url
      }
    }

    // Intercept History API methods
    const interceptHistoryAPI = () => {
      if (originalHistoryRef.current) return // Already intercepted

      const originalPushState = window.history.pushState.bind(window.history)
      const originalReplaceState = window.history.replaceState.bind(window.history)

      originalHistoryRef.current = { pushState: originalPushState, replaceState: originalReplaceState }

      // Override pushState
      window.history.pushState = function(state: any, title: string, url?: string | URL | null) {
        if (url) {
          const correctedUrl = correctLanguageInUrl(url.toString())
          if (correctedUrl !== url.toString()) {
            console.log(`🚫 Intercepted pushState: ${url} → ${correctedUrl}`)
            return originalPushState(state, title, correctedUrl)
          }
        }
        return originalPushState(state, title, url)
      }

      // Override replaceState
      window.history.replaceState = function(state: any, title: string, url?: string | URL | null) {
        if (url) {
          const correctedUrl = correctLanguageInUrl(url.toString())
          if (correctedUrl !== url.toString()) {
            console.log(`🚫 Intercepted replaceState: ${url} → ${correctedUrl}`)
            return originalReplaceState(state, title, correctedUrl)
          }
        }
        return originalReplaceState(state, title, url)
      }
    }

    // Restore original History API methods
    const restoreHistoryAPI = () => {
      if (originalHistoryRef.current) {
        window.history.pushState = originalHistoryRef.current.pushState
        window.history.replaceState = originalHistoryRef.current.replaceState
        originalHistoryRef.current = null
      }
    }

    // Handle popstate events (back/forward navigation)
    const handlePopState = (event: PopStateEvent) => {
      console.log(`📱 PopState event triggered`)

      // Get URL state before any changes
      const beforeUrl = window.location.href
      const beforePath = window.location.pathname

      // Use immediate setTimeout to catch URL after change
      setTimeout(() => {
        const afterUrl = window.location.href
        const afterPath = window.location.pathname
        const segments = afterPath.split('/').filter(Boolean)
        const urlLang = segments[0]

        console.log(`📱 PopState analysis:`)
        console.log(`   Before: ${beforePath}`)
        console.log(`   After: ${afterPath}`)
        console.log(`   URL Language: ${urlLang}`)
        console.log(`   Context Language: ${currentLang}`)

        if (urlLang && urlLang !== currentLang && supportedLanguages.includes(urlLang)) {
          console.log(`🚨 CRITICAL: Language context violation detected!`)

          // Create corrected URL immediately
          segments[0] = currentLang
          const correctedPath = '/' + segments.join('/')

          console.log(`⚡ Emergency correction: ${afterPath} → ${correctedPath}`)

          // Replace the URL immediately without any navigation
          window.history.replaceState(
            { ...window.history.state, emergencyCorrection: true, originalPath: afterPath },
            '',
            correctedPath
          )

          // Force Next.js router to recognize the correction
          router.replace(correctedPath)

          // Also trigger a page refresh if needed to reset state
          if (pathname.includes('/apps/')) {
            console.log(`🔄 Forcing dashboard state reset`)
            // Small delay to let the replace complete, then refresh
            setTimeout(() => {
              router.refresh()
            }, 10)
          }
        }
      }, 0) // Immediate execution after current call stack
    }

    // Handle initial URL check
    const checkInitialUrl = () => {
      if (isInitializedRef.current) return
      isInitializedRef.current = true

      const segments = pathname.split('/').filter(Boolean)
      const urlLang = segments[0]

      if (urlLang && urlLang !== currentLang && supportedLanguages.includes(urlLang)) {
        const correctedPath = '/' + currentLang + '/' + segments.slice(1).join('/')
        console.log(`🔧 Initial URL correction: ${pathname} → ${correctedPath}`)
        router.replace(correctedPath)
      }
    }

    // Set up all protections
    interceptHistoryAPI()
    window.addEventListener('popstate', handlePopState, true) // Use capture phase
    checkInitialUrl()

    // Cleanup
    return () => {
      restoreHistoryAPI()
      window.removeEventListener('popstate', handlePopState, true)
    }
  }, [currentLang, pathname, router])

  return null
}

export default AggressiveLanguageGuard