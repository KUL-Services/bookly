'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, CalendarDays, User, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect, useState } from 'react'

interface NavItem {
  id: string
  labelKey: string
  icon: React.ElementType
  href: string
  requiresAuth?: boolean
}

export const MobileBottomNav = () => {
  const params = useParams<{ lang: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const lang = params?.lang || 'en'

  // Auth state
  const booklyUser = useAuthStore(s => s.booklyUser)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for Zustand store to rehydrate from localStorage
    const timer = setTimeout(() => setHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const isLoggedIn = hydrated && !!booklyUser

  // Nav items change based on auth state
  const navItems: NavItem[] = isLoggedIn
    ? [
        {
          id: 'home',
          labelKey: 'nav.home',
          icon: Home,
          href: `/${lang}/landpage`
        },
        {
          id: 'explore',
          labelKey: 'nav.explore',
          icon: Search,
          href: `/${lang}/search`
        },
        {
          id: 'appointments',
          labelKey: 'nav.appointments',
          icon: CalendarDays,
          href: `/${lang}/profile?section=upcoming`,
          requiresAuth: true
        },
        {
          id: 'profile',
          labelKey: 'nav.profile',
          icon: User,
          href: `/${lang}/profile`,
          requiresAuth: true
        }
      ]
    : [
        {
          id: 'home',
          labelKey: 'nav.home',
          icon: Home,
          href: `/${lang}/landpage`
        },
        {
          id: 'explore',
          labelKey: 'nav.explore',
          icon: Search,
          href: `/${lang}/search`
        },
        {
          id: 'login',
          labelKey: 'nav.login',
          icon: LogIn,
          href: `/${lang}/customer/login`
        },
        {
          id: 'signup',
          labelKey: 'nav.signUp',
          icon: User,
          href: `/${lang}/customer/register`
        }
      ]

  const isActive = (href: string, itemId: string) => {
    const cleanHref = href.split('?')[0]
    if (cleanHref.endsWith('/landpage')) {
      return pathname?.endsWith('/landpage') || pathname === `/${lang}`
    }
    if (itemId === 'login') {
      return pathname?.includes('/customer/login')
    }
    if (itemId === 'signup') {
      return pathname?.includes('/customer/register')
    }
    return pathname?.startsWith(cleanHref)
  }

  return (
    <nav className='lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a2c24] border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb'>
      <div className='flex items-center justify-around h-16 px-2'>
        {navItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href, item.id)
          const isSignup = item.id === 'signup'

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1
                transition-all duration-200 touch-manipulation
                ${
                  isSignup
                    ? 'text-[#0a2c24] dark:text-[#77b6a3]'
                    : active
                      ? 'text-[#0a2c24] dark:text-[#77b6a3]'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }
              `}
            >
              <div
                className={`
                relative p-2 rounded-full transition-all duration-300
                ${
                  isSignup
                    ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24]'
                    : active
                      ? 'bg-[#0a2c24]/10 dark:bg-[#77b6a3]/20 scale-110'
                      : 'hover:bg-gray-100 dark:hover:bg-white/5'
                }
              `}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${active && !isSignup ? 'scale-110' : ''} ${isSignup ? 'text-white dark:text-[#0a2c24]' : ''}`}
                  fill={active && item.id === 'home' ? 'currentColor' : 'none'}
                />
                {active && !isSignup && (
                  <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0a2c24] dark:bg-[#77b6a3] rounded-full' />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active || isSignup ? 'font-bold' : ''}`}>
                {t(item.labelKey) ||
                  (item.id === 'signup' ? 'Sign Up' : item.id === 'login' ? 'Log In' : item.labelKey)}
              </span>
            </Link>
          )
        })}
      </div>

      {/* iOS Home Indicator Safe Area */}
      <div className='h-[env(safe-area-inset-bottom)] bg-white dark:bg-[#0a2c24]' />
    </nav>
  )
}

export default MobileBottomNav
