'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Heart, Search, CalendarDays, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NavItem {
  id: string
  labelKey: string
  icon: React.ElementType
  href: string
}

export const MobileBottomNav = () => {
  const params = useParams<{ lang: string }>()
  const pathname = usePathname()
  const { t } = useTranslation()
  const lang = params?.lang || 'en'

  const navItems: NavItem[] = [
    {
      id: 'home',
      labelKey: 'nav.home',
      icon: Heart,
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
      href: `/${lang}/profile?section=upcoming`
    },
    {
      id: 'profile',
      labelKey: 'nav.profile',
      icon: User,
      href: `/${lang}/profile`
    }
  ]

  const isActive = (href: string) => {
    const cleanHref = href.split('?')[0]
    if (cleanHref.endsWith('/landpage')) {
      return pathname?.endsWith('/landpage') || pathname === `/${lang}`
    }
    return pathname?.startsWith(cleanHref)
  }

  return (
    <nav className='lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a2c24] border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb'>
      <div className='flex items-center justify-around h-16 px-2'>
        {navItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1
                transition-all duration-200 touch-manipulation
                ${
                  active
                    ? 'text-[#0a2c24] dark:text-[#77b6a3]'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }
              `}
            >
              <div
                className={`
                relative p-2 rounded-full transition-all duration-300
                ${active ? 'bg-[#0a2c24]/10 dark:bg-[#77b6a3]/20 scale-110' : 'hover:bg-gray-100 dark:hover:bg-white/5'}
              `}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`}
                  fill={active && item.id === 'home' ? 'currentColor' : 'none'}
                />
                {active && (
                  <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0a2c24] dark:bg-[#77b6a3] rounded-full' />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{t(item.labelKey)}</span>
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
