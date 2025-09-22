'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useLanguageNavigation = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const currentLang = params?.lang || 'en'

  useEffect(() => {
    // Function to rewrite URL with current language
    const rewriteUrlWithCurrentLanguage = (url: string): string => {
      // Parse the URL to extract path segments
      const urlObj = new URL(url, window.location.origin)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)

      // If the first segment is a language code, replace it with current language
      const languageCodes = ['en', 'ar', 'fr']
      if (pathSegments.length > 0 && languageCodes.includes(pathSegments[0])) {
        pathSegments[0] = currentLang
      } else if (pathSegments.length > 0) {
        // If no language code detected, prepend current language
        pathSegments.unshift(currentLang)
      } else {
        // If empty path, use current language
        pathSegments.push(currentLang)
      }

      return '/' + pathSegments.join('/') + urlObj.search + urlObj.hash
    }

    // Handle browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      const currentUrl = window.location.href
      const currentPath = window.location.pathname

      // Check if the current URL has a different language than our context
      const pathSegments = currentPath.split('/').filter(Boolean)
      const urlLang = pathSegments[0]

      if (urlLang && urlLang !== currentLang && ['en', 'ar', 'fr'].includes(urlLang)) {
        // Prevent the default navigation
        event.preventDefault()

        // Rewrite the URL with current language and navigate
        const newUrl = rewriteUrlWithCurrentLanguage(currentUrl)
        console.log(`🔄 Language navigation: Rewriting ${currentUrl} → ${newUrl}`)

        // Use replace to avoid creating additional history entries
        window.history.replaceState(event.state, '', newUrl)

        // Force router to recognize the new URL
        router.refresh()
      }
    }

    // Add event listener for browser navigation
    window.addEventListener('popstate', handlePopState)

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [currentLang, router])

  return {
    currentLanguage: currentLang
  }
}