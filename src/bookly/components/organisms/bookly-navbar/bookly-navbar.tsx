'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'

const BooklyNavbar = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const pathname = usePathname()

  const booklyUser = useAuthStore(s => s.booklyUser)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const goBack = () => router.back()
  const to = (path: string) => router.push(`/${params?.lang}${path}`)

  // Avoid mismatches before Zustand rehydrates
  if (!hydrated) return null

  return (
    <header className='w-full bg-white border-b border-gray-200'>
      <div className='mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <button
            aria-label='Go Back'
            onClick={goBack}
            className='inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-700'
          >
            <i className='ri-arrow-left-line' />
          </button>
          <button
            onClick={() => to('/landpage')}
            className='text-xl font-semibold text-teal-600 hover:text-teal-700'
          >
            Bookly
          </button>
        </div>

        <nav className='hidden md:flex items-center gap-4'>
          <button
            onClick={() => to('/login')}
            className='text-gray-700 hover:text-gray-900'
            aria-label='For Businesses'
          >
            For Businesses
          </button>
        </nav>

        <div className='flex items-center gap-3'>
          {booklyUser ? (
            <>
              <button
                onClick={() => to('/profile')}
                className='text-gray-800 hover:text-gray-900'
                title={pathname?.includes('/profile') ? 'Profile' : 'Open profile'}
              >
                {`Hello ${booklyUser.name || 'User'}`}
              </button>
              <button
                onClick={() => {
                  logoutCustomer()
                  to('/landpage')
                }}
                className='px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => to('/customer/login')}
                className='px-3 py-1.5 rounded border border-teal-600 text-teal-700 hover:bg-teal-50'
              >
                Log In
              </button>
              <button
                onClick={() => to('/customer/register')}
                className='px-3 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700'
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default BooklyNavbar

