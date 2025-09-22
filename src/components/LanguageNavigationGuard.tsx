'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const LanguageNavigationGuard = () => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang: string }>()
  const currentLang = params?.lang || 'en'
  const lastCorrectionRef = useRef<string>('')

  useEffect(() => {
    const supportedLanguages = ['en', 'ar', 'fr']

    console.log(`🛡️ LanguageNavigationGuard initialized`)
    console.log(`   Current language: ${currentLang}`)
    console.log(`   Current pathname: ${pathname}`)
    console.log(`   Environment: ${pathname.includes('/apps/') ? 'Dashboard' : 'Bookly'}`)

    // Function to rewrite URL path with current language
    const rewritePathWithLanguage = (path: string): string => {
      const segments = path.split('/').filter(Boolean)

      // If first segment is a language, replace it
      if (segments.length > 0 && supportedLanguages.includes(segments[0])) {
        segments[0] = currentLang
        console.log(`🔄 Replacing language: ${segments.join('/')} with ${currentLang}`)
      } else if (segments.length > 0) {
        // If no language detected, prepend current language
        segments.unshift(currentLang)
        console.log(`🔄 Prepending language: ${currentLang} to ${segments.slice(1).join('/')}`)
      } else {
        // For root path
        segments.push(currentLang)
        console.log(`🔄 Adding language to root: ${currentLang}`)
      }

      const newPath = '/' + segments.join('/')
      console.log(`🔧 Path rewrite: ${path} → ${newPath}`)
      return newPath
    }

    // Handle browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      console.log(`📱 PopState event detected`)
      console.log(`   Event state:`, event.state)
      console.log(`   Current pathname:`, window.location.pathname)
      console.log(`   Context language:`, currentLang)

      // Prevent infinite loops
      if (event.state?.languageCorrected) {
        console.log(`⏭️ Skipping - already corrected`)
        return
      }

      // Small delay to let the navigation complete
      setTimeout(() => {
        const newPathname = window.location.pathname
        const segments = newPathname.split('/').filter(Boolean)
        const urlLang = segments[0]

        console.log(`🔍 Analyzing pathname: ${newPathname}`)
        console.log(`   Segments:`, segments)
        console.log(`   URL language: ${urlLang}`)
        console.log(`   Current context: ${currentLang}`)

        // Check if URL language differs from current context
        if (urlLang && urlLang !== currentLang && supportedLanguages.includes(urlLang)) {
          const correctedPath = rewritePathWithLanguage(newPathname)

          // Prevent correcting the same path repeatedly
          if (lastCorrectionRef.current === correctedPath) {
            console.log(`⏭️ Skipping - same path already corrected: ${correctedPath}`)
            return
          }

          console.log(`🔄 Language navigation guard ACTIVE: ${urlLang} → ${currentLang}`)
          console.log(`   Original: ${newPathname}`)
          console.log(`   Corrected: ${correctedPath}`)

          lastCorrectionRef.current = correctedPath

          // Replace the current history entry with language correction
          window.history.replaceState(
            { ...event.state, languageCorrected: true, originalPath: newPathname },
            '',
            correctedPath
          )

          // Navigate to corrected path
          router.replace(correctedPath)
        } else {
          console.log(`✅ No language correction needed`)
          console.log(`   URL lang matches context: ${urlLang === currentLang}`)
          console.log(`   URL lang is supported: ${supportedLanguages.includes(urlLang || '')}`)
        }
      }, 50) // Slightly longer delay for stability
    }

    // Handle page unload to persist language preference
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem('bookly_preferred_language', currentLang)
        sessionStorage.setItem('bookly_last_corrected_path', lastCorrectionRef.current)
      } catch (e) {
        // Handle localStorage/sessionStorage errors gracefully
        console.warn('Failed to store language preference:', e)
      }
    }

    // Check for stored language preference on mount
    const checkStoredLanguage = () => {
      try {
        const storedLang = sessionStorage.getItem('bookly_preferred_language')
        if (storedLang && storedLang !== currentLang && supportedLanguages.includes(storedLang)) {
          console.log(`📦 Found stored language preference: ${storedLang}, current: ${currentLang}`)
        }
      } catch (e) {
        // Handle sessionStorage errors gracefully
      }
    }

    // Listen to browser navigation events
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Check stored preferences
    checkStoredLanguage()

    // On component mount, check if we need to correct the current URL
    const currentSegments = pathname.split('/').filter(Boolean)
    const currentUrlLang = currentSegments[0]

    if (currentUrlLang && currentUrlLang !== currentLang && supportedLanguages.includes(currentUrlLang)) {
      const correctedPath = rewritePathWithLanguage(pathname)
      if (correctedPath !== pathname) {
        console.log(`🔧 Initial URL correction: ${pathname} → ${correctedPath}`)
        lastCorrectionRef.current = correctedPath
        router.replace(correctedPath)
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [currentLang, pathname, router])

  return null // This component doesn't render anything
}

export default LanguageNavigationGuard