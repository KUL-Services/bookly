'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

interface LanguageStabilizerProps {
  children: React.ReactNode
  expectedLang: string
}

const LanguageStabilizer = ({ children, expectedLang }: LanguageStabilizerProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ lang: string }>()
  const currentUrlLang = params?.lang
  const [isStable, setIsStable] = useState(false)
  const correctionInProgressRef = useRef(false)

  useEffect(() => {
    const supportedLanguages = ['en', 'ar', 'fr']

    console.log(`🔒 LanguageStabilizer check:`)
    console.log(`   Expected: ${expectedLang}`)
    console.log(`   URL: ${currentUrlLang}`)
    console.log(`   Pathname: ${pathname}`)

    // If the URL language doesn't match expected language, correct it immediately
    if (currentUrlLang && currentUrlLang !== expectedLang && supportedLanguages.includes(currentUrlLang)) {
      if (!correctionInProgressRef.current) {
        correctionInProgressRef.current = true

        console.log(`🚨 Language mismatch detected! Correcting ${currentUrlLang} → ${expectedLang}`)

        // Rebuild the path with the correct language
        const segments = pathname.split('/').filter(Boolean)
        segments[0] = expectedLang
        const correctedPath = '/' + segments.join('/')

        console.log(`⚡ Redirecting to: ${correctedPath}`)

        // Immediately redirect to the correct language
        router.replace(correctedPath)
        return
      }
    } else {
      // Language is stable
      setIsStable(true)
      correctionInProgressRef.current = false
    }
  }, [currentUrlLang, expectedLang, pathname, router])

  // Only render children when language is stable
  if (!isStable) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

export default LanguageStabilizer