'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { ChevronLeft, Menu, X, User, LogOut, Building2, Star, Sparkles } from 'lucide-react'

const BooklyNavbar = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const pathname = usePathname()

  const booklyUser = useAuthStore(s => s.booklyUser)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)

  const [hydrated, setHydrated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  useEffect(() => setHydrated(true), [])

  const goBack = () => router.back()
  const to = (path: string) => router.push(`/${params?.lang}${path}`)

  const handleLogout = () => {
    logoutCustomer()
    setUserDropdownOpen(false)
    to('/landpage')
  }

  // Avoid mismatches before Zustand rehydrates
  if (!hydrated) return null

  return (
    <header className='sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Left Section */}
          <div className='flex items-center gap-4'>
            <button
              aria-label='Go Back'
              onClick={goBack}
              className='inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100/80 text-gray-600 transition-all duration-200 hover:scale-105 active:scale-95'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>

            <button
              onClick={() => to('/landpage')}
              className='group flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent hover:from-teal-700 hover:to-teal-600 transition-all duration-300'
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
              onClick={() => to('/apps/bookly/dashboard')}
              className='group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/50 transition-all duration-200'
              aria-label='For Businesses'
            >
              <Building2 className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
              For Businesses
            </button>
          </nav>

          {/* Right Section */}
          <div className='flex items-center gap-3'>
            {booklyUser ? (
              <div className='relative'>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className='group flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border border-teal-200/50 transition-all duration-300 hover:shadow-md'
                >
                  <div className='w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm shadow-lg'>
                    {booklyUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className='hidden sm:block text-gray-700 font-medium group-hover:text-teal-700 transition-colors duration-200'>
                    {booklyUser.name || 'User'}
                  </span>
                  <ChevronLeft className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : 'rotate-90'}`} />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200'>
                    <button
                      onClick={() => {
                        to('/profile')
                        setUserDropdownOpen(false)
                      }}
                      className='flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200'
                    >
                      <User className='w-4 h-4' />
                      My Profile
                    </button>
                    <hr className='my-1 border-gray-100' />
                    <button
                      onClick={handleLogout}
                      className='flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200'
                    >
                      <LogOut className='w-4 h-4' />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => to('/customer/login')}
                  className='hidden sm:block px-4 py-2 rounded-lg border border-teal-600/20 text-teal-700 hover:bg-teal-50 hover:border-teal-600/40 transition-all duration-200 font-medium'
                >
                  Log In
                </button>
                <button
                  onClick={() => to('/customer/register')}
                  className='px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                >
                  <span className='hidden sm:inline'>Sign Up</span>
                  <span className='sm:hidden'>Join</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200'>
            <div className='px-4 py-4 space-y-3'>
              <button
                onClick={() => {
                  to('/apps/bookly/dashboard')
                  setMobileMenuOpen(false)
                }}
                className='flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-all duration-200'
              >
                <Building2 className='w-5 h-5' />
                For Businesses
              </button>

              {!booklyUser && (
                <div className='pt-2 border-t border-gray-200/50 space-y-2'>
                  <button
                    onClick={() => {
                      to('/customer/login')
                      setMobileMenuOpen(false)
                    }}
                    className='w-full px-4 py-3 text-center border border-teal-600/20 text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200 font-medium'
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      to('/customer/register')
                      setMobileMenuOpen(false)
                    }}
                    className='w-full px-4 py-3 text-center bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-medium'
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(userDropdownOpen || mobileMenuOpen) && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => {
            setUserDropdownOpen(false)
            setMobileMenuOpen(false)
          }}
        />
      )}
    </header>
  )
}

export default BooklyNavbar
