'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Menu, X, Building2 } from 'lucide-react'
import { Button } from '@/bookly/components/molecules'
import GreenWordLogo from '@/assets/logos/words/Green_Word.png'
import WhiteWordLogo from '@/assets/logos/words/White_Word.png'
import { i18nConfig } from '@/bookly/i18nConfig'

import { BusinessNavigation } from './BusinessNavigation'

export const BusinessHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const params = useParams<{ lang: string }>()
  const router = useRouter()
  const { t } = useTranslation()
  const currentLang = params?.lang || i18nConfig.defaultLocale

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerClass = isScrolled
    ? 'bg-white/95 dark:bg-[#0a2c24]/95 backdrop-blur-md shadow-sm py-2'
    : 'bg-transparent py-4'

  const textColorClass = isScrolled ? 'text-[#202c39] dark:text-white' : 'text-[#202c39] dark:text-white'

  return (
    <header className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${headerClass}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link href={`/${currentLang}/business`} className='relative z-50'>
            <div className='h-8 sm:h-10 w-auto'>
              <img src={GreenWordLogo.src} alt='Zerv' className='dark:hidden block object-contain h-full' />
              <img src={WhiteWordLogo.src} alt='Zerv' className='hidden dark:block object-contain h-full' />
            </div>
          </Link>

          {/* Desktop Nav */}
          <BusinessNavigation />

          {/* CTA Buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            <Link
              href={`/${currentLang}/login`}
              className={`text-sm font-medium hover:text-[#77b6a3] transition-colors ${textColorClass}`}
            >
              {t('nav.login', 'Log In')}
            </Link>
            <Button
              onClick={() => router.push(`/${currentLang}/register`)}
              className='bg-[#77b6a3] hover:bg-[#5da891] text-white px-6 py-2 rounded-full font-bold shadow-lg transform hover:-translate-y-0.5 transition-all text-sm'
              buttonText={{ plainText: t('business.hero.cta', 'Try it free') }}
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className='md:hidden p-2 text-gray-600 dark:text-gray-300 relative z-50'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white dark:bg-[#0a2c24] z-40 transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full pt-20 px-6 space-y-6'>
          <BusinessNavigation mobile closeMobileMenu={() => setMobileMenuOpen(false)} />
          <div className='pt-6 space-y-4'>
            <Link
              href={`/${currentLang}/login`}
              className='block w-full text-center py-3 text-[#202c39] dark:text-white font-medium border border-gray-200 dark:border-gray-700 rounded-full'
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.login', 'Log In')}
            </Link>
            <Button
              onClick={() => {
                setMobileMenuOpen(false)
                router.push(`/${currentLang}/register`)
              }}
              className='w-full bg-[#77b6a3] text-white py-3 rounded-full font-bold shadow-lg'
              buttonText={{ plainText: t('business.hero.cta', 'Try it free') }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
