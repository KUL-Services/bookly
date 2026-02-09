'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

import { CalendarDays, House, LogIn, Search, User, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/stores/auth.store'

interface NavItem {
  id: string
  labelKey: string
  icon: LucideIcon
  href: string
  requiresAuth?: boolean
}

const LABEL_FALLBACKS: Record<string, string> = {
  home: 'Home',
  explore: 'Explore',
  appointments: 'Appointments',
  profile: 'Profile',
  login: 'Log In',
  signup: 'Sign Up'
}

export const MobileBottomNav = () => {
  const params = useParams<{ lang: string }>()
  const pathname = usePathname()
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
          icon: House,
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
          icon: House,
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

  const getLabel = (itemId: string, labelKey: string) => {
    const translated = t(labelKey)

    return translated === labelKey ? LABEL_FALLBACKS[itemId] || labelKey : translated
  }

  return (
    <nav
      className='lg:hidden fixed inset-x-0 bottom-0 z-50 px-3'
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--mobile-bottom-nav-floating-gap))' }}
    >
      <div className='relative mx-auto max-w-md rounded-[26px] border border-[#0a2c24]/10 dark:border-white/15 bg-white dark:bg-[#0a2c24] shadow-[0_16px_35px_rgba(10,44,36,0.16)] dark:shadow-[0_16px_35px_rgba(0,0,0,0.45)] animate-scale-up-soft'>
        <div className='grid h-[var(--mobile-bottom-nav-shell-height)] grid-cols-4 gap-1 px-2'>
          {navItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.href, item.id)
            const isSignup = !isLoggedIn && item.id === 'signup'
            const label = getLabel(item.id, item.labelKey)

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`
                group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2
                transition-all duration-300 ease-out touch-manipulation active:scale-[0.97]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a2c24]/30 dark:focus-visible:ring-[#77b6a3]/40
                ${
                  isSignup
                    ? 'text-[#0a2c24] dark:text-[#77b6a3]'
                    : active
                      ? 'text-[#0a2c24] dark:text-[#77b6a3]'
                      : 'text-[#0a2c24]/45 dark:text-white/45 hover:text-[#0a2c24]/80 dark:hover:text-white/80'
                }
                `}
                style={{ transitionDelay: `${index * 35}ms` }}
              >
                {active && !isSignup && (
                  <span className='pointer-events-none absolute inset-x-1 top-1/2 h-[54px] -translate-y-1/2 rounded-2xl bg-gradient-to-b from-[#0a2c24]/12 to-[#77b6a3]/10 dark:from-[#77b6a3]/20 dark:to-[#77b6a3]/8 transition-all duration-300' />
                )}

                <div
                  className={`
                  relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300
                  ${
                    isSignup
                      ? 'bg-gradient-to-br from-[#0a2c24] to-[#155b4a] dark:from-[#77b6a3] dark:to-[#99cfbf] shadow-[0_8px_16px_rgba(10,44,36,0.26)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.35)]'
                      : active
                        ? 'bg-[#0a2c24]/12 dark:bg-[#77b6a3]/22 scale-110'
                        : 'bg-transparent group-hover:bg-[#0a2c24]/6 dark:group-hover:bg-white/8'
                  }
                  `}
                >
                  <Icon
                    className={`
                    h-5 w-5 transition-transform duration-300
                    ${active && !isSignup ? 'scale-110 -translate-y-[1px]' : ''}
                    ${isSignup ? 'text-white dark:text-[#0a2c24]' : ''}
                  `}
                    strokeWidth={item.id === 'home' ? (active ? 2.4 : 2.2) : undefined}
                  />
                </div>
                <span
                  className={`
                  relative z-10 max-w-full truncate text-[11px] leading-none tracking-tight transition-all duration-300
                  ${active || isSignup ? 'font-semibold opacity-100' : 'font-medium opacity-80'}
                `}
                >
                  {label}
                </span>

                {active && !isSignup && (
                  <span className='pointer-events-none absolute top-2 h-[3px] w-8 rounded-full bg-[#0a2c24]/75 dark:bg-[#77b6a3]/80' />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default MobileBottomNav
