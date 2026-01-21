'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { CalendarCheck, ChevronDown, Heart, LogOut, Menu, User, Building2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BooklyLanguageDropdown from '../../atoms/language-dropdown/language-dropdown.component'
import BooklyThemeToggle from '../../atoms/theme-toggle/theme-toggle.component'

// Assets
import GreenIconLogo from '@assets/logos/icons/Green_Icon.png'
import WhiteIconLogo from '@assets/logos/icons/White_Icon.png'

const BooklyNavbar = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()

  const booklyUser = useAuthStore(s => s.booklyUser)
  const materializeUser = useAuthStore(s => s.materializeUser)
  const userType = useAuthStore(s => s.userType)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)

  const [hydrated, setHydrated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  useEffect(() => {
    // Wait for Zustand store to rehydrate from localStorage
    const timer = setTimeout(() => setHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const { t } = useTranslation()

  useEffect(() => {
    // Wait for Zustand store to rehydrate from localStorage
    const timer = setTimeout(() => setHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const to = (path: string) => {
    console.log('Navigating to:', `/${params?.lang}${path}`)
    router.push(`/${params?.lang}${path}`)
  }

  const handleLogout = () => {
    logoutCustomer()
    setUserDropdownOpen(false)
    to('/landpage')
  }

  // Avoid mismatches before Zustand rehydrates
  if (!hydrated) return null

  return (
    <header className='sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0a2c24]/95 backdrop-blur-xl border-b border-[#0a2c24]/10 dark:border-white/10'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Left Section */}
          <div className='flex items-center gap-4'>
            {/* {!isLandingPage && (
              <button
                aria-label='Go Back'
                onClick={goBack}
                className='inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation'
              >
                <ChevronIcon className='w-5 h-5' />
              </button>
            )} */}

            <button
              onClick={() => to('/landpage')}
              className='flex items-center transition-opacity duration-200 hover:opacity-90 touch-manipulation bg-transparent border-none p-0'
            >
              <div className='relative w-[50px] sm:w-[64px] h-[50px] sm:h-[64px] bg-transparent'>
                {/* Light Mode: Green Icon */}
                <img
                  src={GreenIconLogo.src}
                  alt='Zerv'
                  className='dark:hidden block object-contain object-left w-full h-full'
                />
                {/* Dark Mode: White Icon */}
                <img
                  src={WhiteIconLogo.src}
                  alt='Zerv'
                  className='hidden dark:block object-contain object-left w-full h-full'
                />
              </div>
            </button>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className='hidden md:flex items-center gap-8'>
            <button
              onClick={() => {
                console.log('For Businesses (desktop) clicked', { userType, materializeUser })
                // Check if user is already authenticated as business user
                if (userType === 'business' && materializeUser) {
                  // Already logged in as business, go to dashboard
                  router.push(`/${params?.lang}/apps/bookly/dashboard`)
                } else {
                  // Not business user, go to business login
                  router.push(`/${params?.lang}/login`)
                }
              }}
              className='flex items-center gap-2 px-3 py-2 rounded-full text-sm text-[#0a2c24] dark:text-white hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 transition-all duration-300 border border-transparent'
              aria-label='For Businesses'
            >
              <Building2 className='w-4 h-4' />
              {t('nav.forBusinesses')}
            </button>
          </nav>

          {/* Right Section */}
          <div className='flex items-center gap-3'>
            {/* Language and Theme Toggles */}
            <div className='hidden sm:flex items-center gap-1'>
              <BooklyLanguageDropdown />
              <BooklyThemeToggle />
            </div>

            {booklyUser ? (
              <div className='flex items-center gap-2'>
                <div className='hidden sm:flex items-center gap-1'>
                  <button
                    onClick={() => to('/profile?section=appointments')}
                    className='inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#0a2c24]/10 dark:border-white/10 text-[#0a2c24] dark:text-white hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 transition-all duration-300'
                    aria-label='Appointments'
                  >
                    <CalendarCheck className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => to('/profile?section=favorites')}
                    className='inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#0a2c24]/10 dark:border-white/10 text-[#0a2c24] dark:text-white hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 transition-all duration-300'
                    aria-label='Favorites'
                  >
                    <Heart className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => to('/profile')}
                    className='inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#0a2c24]/10 dark:border-white/10 text-[#0a2c24] dark:text-white hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 transition-all duration-300'
                    aria-label='Profile'
                  >
                    <User className='w-4 h-4' />
                  </button>
                </div>

                <div className='relative'>
                  <button
                    onClick={() => to('/profile')}
                    className='flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-[#77b6a3]/10 dark:bg-[#77b6a3]/20 hover:bg-[#77b6a3]/20 dark:hover:bg-[#77b6a3]/30 border border-[#0a2c24]/10 dark:border-white/10 transition-all duration-300 hover:shadow-md touch-manipulation'
                  >
                    <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0a2c24] dark:bg-[#77b6a3] flex items-center justify-center text-white dark:text-[#0a2c24] font-semibold text-xs sm:text-sm'>
                      {booklyUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className='hidden sm:block text-[#0a2c24] dark:text-white font-medium transition-colors duration-200 text-sm sm:text-base'>
                      {booklyUser.name || 'User'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => router.push(`/${params?.lang}/customer/login`)}
                  className='hidden sm:flex items-center px-4 py-2 h-9 rounded-full border border-[#0a2c24]/15 dark:border-white/15 bg-white dark:bg-transparent text-[#0a2c24] dark:text-white hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 hover:border-[#77b6a3]/30 transition-all duration-300 text-sm font-medium touch-manipulation'
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => router.push(`/${params?.lang}/customer/register`)}
                  className='flex items-center px-4 sm:px-5 py-2.5 h-10 rounded-full bg-[#0a2c24] hover:bg-[#0a2c24]/90 dark:bg-[#77b6a3] dark:hover:bg-[#77b6a3]/90 text-white dark:text-[#0a2c24] transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation text-sm sm:text-base'
                >
                  <span className='hidden sm:inline'>{t('nav.signUp')}</span>
                  <span className='sm:hidden'>{t('nav.join')}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 text-[#0a2c24] dark:text-white transition-all duration-300 touch-manipulation'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className='md:hidden border-t border-[#0a2c24]/10 dark:border-white/10 bg-white/98 dark:bg-[#0a2c24]/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 relative z-50'>
            <div className='px-4 py-4 space-y-3 relative z-50'>
              {/* Mobile Language and Theme Toggles */}
              <div className='flex items-center justify-between gap-3 px-4 py-2'>
                <span className='text-sm font-medium text-[#0a2c24] dark:text-white'>Preferences</span>
                <div className='flex items-center gap-2'>
                  <BooklyLanguageDropdown />
                </div>
              </div>
              <div className='h-px bg-[#0a2c24]/10 dark:bg-white/10 mx-4' />

              <button
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('For Businesses clicked', { userType, materializeUser })
                  setMobileMenuOpen(false)
                  setTimeout(() => {
                    // Check if user is already authenticated as business user
                    if (userType === 'business' && materializeUser) {
                      // Already logged in as business, go to dashboard
                      router.push(`/${params?.lang}/apps/bookly/dashboard`)
                    } else {
                      // Not business user, go to business login
                      router.push(`/${params?.lang}/login`)
                    }
                  }, 100)
                }}
                className='flex items-center gap-3 w-full px-4 py-4 text-left bg-[#f7f8f9] dark:bg-[#202c39] text-[#0a2c24] dark:text-white hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 rounded-full transition-all duration-300 touch-manipulation text-base border border-[#0a2c24]/10 dark:border-white/10'
              >
                <Building2 className='w-5 h-5' />
                {t('nav.forBusinesses')}
              </button>

              {!booklyUser && (
                <div className='pt-2 border-t border-[#0a2c24]/10 dark:border-white/10 space-y-2'>
                  <button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Log In clicked')
                      setMobileMenuOpen(false)
                      setTimeout(() => {
                        router.push(`/${params?.lang}/customer/login`)
                      }, 100)
                    }}
                    className='w-full px-4 py-4 text-center border border-[#0a2c24]/15 dark:border-white/15 bg-white dark:bg-transparent text-[#0a2c24] dark:text-white hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 rounded-full transition-all duration-300 font-medium touch-manipulation text-base'
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Sign Up clicked')
                      setMobileMenuOpen(false)
                      setTimeout(() => {
                        router.push(`/${params?.lang}/customer/register`)
                      }, 100)
                    }}
                    className='w-full px-4 py-4 text-center bg-[#0a2c24] hover:bg-[#0a2c24]/90 dark:bg-[#77b6a3] dark:hover:bg-[#77b6a3]/90 text-white dark:text-[#0a2c24] transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99] rounded-full touch-manipulation text-base'
                  >
                    {t('nav.signUp')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns - Only for user dropdown, not mobile menu */}
      {userDropdownOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => {
            setUserDropdownOpen(false)
          }}
        />
      )}
    </header>
  )
}

export default BooklyNavbar
