'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const useLanguageProtection = () => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang: string }>()
  const [protectedLang, setProtectedLang] = useState<string>('')
  const lastValidLangRef = useRef<string>('')
  const protectionActiveRef = useRef(false)

  useEffect(() => {
    const supportedLanguages = ['en', 'ar', 'fr']
    const currentUrlLang = params?.lang || 'en'

    // Initialize protected language if not set
    if (!protectedLang && supportedLanguages.includes(currentUrlLang)) {
      setProtectedLang(currentUrlLang)
      lastValidLangRef.current = currentUrlLang
      console.log(`🔒 Language protection initialized: ${currentUrlLang}`)
      return
    }

    // If URL language changes and differs from protected language
    if (protectedLang && currentUrlLang !== protectedLang && supportedLanguages.includes(currentUrlLang)) {
      if (!protectionActiveRef.current) {
        protectionActiveRef.current = true

        console.log(`🛡️ Language protection triggered!`)
        console.log(`   Protected: ${protectedLang}`)
        console.log(`   URL attempted: ${currentUrlLang}`)
        console.log(`   Pathname: ${pathname}`)

        // Reconstruct URL with protected language
        const segments = pathname.split('/').filter(Boolean)
        if (segments.length > 0 && supportedLanguages.includes(segments[0])) {
          segments[0] = protectedLang
        }
        const correctedPath = '/' + segments.join('/')

        console.log(`⚡ Auto-correcting to: ${correctedPath}`)

        // Force correction
        router.replace(correctedPath)

        // Reset protection flag after correction
        setTimeout(() => {
          protectionActiveRef.current = false
        }, 100)
      }
    }
  }, [params?.lang, pathname, router, protectedLang])

  // Method to change protected language (for language dropdown)
  const changeLanguage = (newLang: string) => {
    console.log(`🔄 Changing protected language: ${protectedLang} → ${newLang}`)
    setProtectedLang(newLang)
    lastValidLangRef.current = newLang

    // Update URL immediately
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      segments[0] = newLang
    }
    const newPath = '/' + segments.join('/')
    router.push(newPath)
  }

  return {
    protectedLanguage: protectedLang,
    changeLanguage,
    isProtectionActive: protectionActiveRef.current
  }
}