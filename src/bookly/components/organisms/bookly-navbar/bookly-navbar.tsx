'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { ChevronLeft, ChevronRight, Menu, X, User, LogOut, Building2, Star, Sparkles } from 'lucide-react'
import initTranslations from '@/app/i18n/i18n'

const BooklyNavbar = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const pathname = usePathname()

  const booklyUser = useAuthStore(s => s.booklyUser)
  const materializeUser = useAuthStore(s => s.materializeUser)
  const userType = useAuthStore(s => s.userType)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)

  const [hydrated, setHydrated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [t, setT] = useState<any>(() => (key: string) => key)

  useEffect(() => {
    // Wait for Zustand store to rehydrate from localStorage
    const timer = setTimeout(() => setHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(params?.lang || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [params?.lang])

  const goBack = () => router.back()
  const to = (path: string) => {
    console.log('Navigating to:', `/${params?.lang}${path}`)
    router.push(`/${params?.lang}${path}`)
  }

  const handleLogout = () => {
    logoutCustomer()
    setUserDropdownOpen(false)
    to('/landpage')
  }

  // Check if we're on the landing page
  const isLandingPage = pathname.includes('/landpage')

  // Check if the language is RTL (Arabic)
  const isRTL = params?.lang === 'ar'

  // Choose the appropriate chevron icon based on RTL direction
  const ChevronIcon = isRTL ? ChevronRight : ChevronLeft

  // Avoid mismatches before Zustand rehydrates
  if (!hydrated) return null

  return (
    <header className='sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all duration-300'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Left Section */}
          <div className='flex items-center gap-4'>
            {!isLandingPage && (
              <button
                aria-label='Go Back'
                onClick={goBack}
                className='inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation'
              >
                <ChevronIcon className='w-5 h-5' />
              </button>
            )}

            <button
              onClick={() => to('/landpage')}
              className='group flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent hover:from-teal-700 hover:to-teal-600 transition-all duration-300 touch-manipulation'
            >
              <div className='relative'>
                <Sparkles className='w-6 h-6 text-teal-500 group-hover:animate-pulse' />
                <div className='absolute inset-0 w-6 h-6 text-teal-300 animate-ping opacity-20'></div>
              </div>
              Bookly
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
              className='group flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-teal-50/50 dark:hover:bg-teal-900/30 transition-all duration-200'
              aria-label='For Businesses'
            >
              <Building2 className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
              {t('nav.forBusinesses')}
            </button>
          </nav>

          {/* Right Section */}
          <div className='flex items-center gap-3'>
            {booklyUser ? (
              <div className='relative'>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className='group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-800/40 dark:hover:to-cyan-800/40 border border-teal-200/50 dark:border-teal-700/50 transition-all duration-300 hover:shadow-md touch-manipulation'
                >
                  <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg'>
                    {booklyUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className='hidden sm:block text-gray-700 dark:text-gray-200 font-medium group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200 text-sm sm:text-base'>
                    {booklyUser.name || 'User'}
                  </span>
                  <ChevronIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : (isRTL ? '-rotate-90' : 'rotate-90')}`} />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200'>
                    <button
                      onClick={() => {
                        to('/profile')
                        setUserDropdownOpen(false)
                      }}
                      className='flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-200 touch-manipulation'
                    >
                      <User className='w-4 h-4' />
                      {t('nav.profile')}
                    </button>
                    <hr className='my-1 border-gray-100 dark:border-gray-700' />
                    <button
                      onClick={handleLogout}
                      className='flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200 touch-manipulation'
                    >
                      <LogOut className='w-4 h-4' />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => router.push(`/${params?.lang}/customer/login`)}
                  className='hidden sm:block px-4 py-2 rounded-lg border border-teal-600/20 dark:border-teal-400/30 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-600/40 dark:hover:border-teal-400/50 transition-all duration-200 font-medium touch-manipulation'
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => router.push(`/${params?.lang}/customer/register`)}
                  className='px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation text-sm sm:text-base'
                >
                  <span className='hidden sm:inline'>{t('nav.signUp')}</span>
                  <span className='sm:hidden'>{t('nav.join')}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 touch-manipulation'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200 relative z-50'>
            <div className='px-4 py-4 space-y-3 relative z-50'>
              <button
                onClick={(e) => {
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
                className='flex items-center gap-3 w-full px-4 py-4 text-left text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 rounded-lg transition-all duration-200 touch-manipulation text-base'
              >
                <Building2 className='w-5 h-5' />
                {t('nav.forBusinesses')}
              </button>

              {!booklyUser && (
                <div className='pt-2 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2'>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Log In clicked')
                      setMobileMenuOpen(false)
                      setTimeout(() => {
                        router.push(`/${params?.lang}/customer/login`)
                      }, 100)
                    }}
                    className='w-full px-4 py-4 text-center border border-teal-600/20 dark:border-teal-400/30 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base'
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Sign Up clicked')
                      setMobileMenuOpen(false)
                      setTimeout(() => {
                        router.push(`/${params?.lang}/customer/register`)
                      }, 100)
                    }}
                    className='w-full px-4 py-4 text-center bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-medium touch-manipulation text-base'
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
