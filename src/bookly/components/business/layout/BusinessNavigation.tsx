'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  CreditCard,
  Users,
  BarChart,
  Scissors,
  Store,
  Sparkles,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Mail
} from 'lucide-react'

// Navigation Data Configuration
const NAV_ITEMS = {
  whyZerv: {
    label: 'Why Zerv',
    href: '/business/why-zerv',
    type: 'link'
  },
  features: {
    label: 'Features',
    type: 'dropdown',
    cols: 2,
    items: [
      {
        icon: Calendar,
        label: 'Calendar & Booking',
        desc: 'Self-service booking available 24/7.',
        href: '/business/features#booking'
      },
      {
        icon: CreditCard,
        label: 'Payments & POS',
        desc: 'Secure payments, deposits, and cancellation fees.',
        href: '/business/features#payments'
      },
      {
        icon: Users,
        label: 'Client Management',
        desc: 'CRM to keep track of client history and notes.',
        href: '/business/features#clients'
      },
      {
        icon: BarChart,
        label: 'Marketing & Stats',
        desc: 'Grow your business with automated marketing tools.',
        href: '/business/features#marketing'
      }
    ]
  },
  types: {
    label: 'Business Types',
    type: 'dropdown',
    cols: 1,
    items: [
      { icon: Scissors, label: 'Barbers', href: '/business/types?type=barber' },
      { icon: Store, label: 'Salons', href: '/business/types?type=salon' },
      { icon: Sparkles, label: 'Spas', href: '/business/types?type=spa' },
      { icon: Users, label: 'Health & Wellness', href: '/business/types?type=wellness' }
    ]
  },
  resources: {
    label: 'Resources',
    type: 'dropdown',
    cols: 1,
    items: [
      { icon: HelpCircle, label: 'Help Center', href: '/help' },
      { icon: BookOpen, label: 'Blog', href: '/blog' },
      { icon: Mail, label: 'Contact Us', href: '/contact' }
    ]
  }
}

export const BusinessNavigation = ({
  mobile = false,
  closeMobileMenu
}: {
  mobile?: boolean
  closeMobileMenu?: () => void
}) => {
  const { t } = useTranslation()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (key: string) => {
    if (mobile) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(key)
  }

  const handleMouseLeave = () => {
    if (mobile) return
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150) // Small delay to prevent flickering
  }

  // Mobile Accordion State
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({})

  const toggleMobile = (key: string) => {
    setMobileExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (mobile) {
    return (
      <div className='flex flex-col space-y-2'>
        {Object.entries(NAV_ITEMS).map(([key, item]: [string, any]) => (
          <div key={key} className='border-b border-gray-100 dark:border-gray-800 last:border-0 pb-2'>
            {item.type === 'link' ? (
              <Link
                href={item.href}
                className='flex items-center justify-between py-3 text-lg font-medium text-[#202c39] dark:text-white active:scale-95 transition-transform'
                onClick={closeMobileMenu}
              >
                {t(`business.nav.${key}`, item.label) as string}
              </Link>
            ) : (
              <div>
                <button
                  onClick={() => toggleMobile(key)}
                  className='flex items-center justify-between w-full py-3 text-lg font-medium text-[#202c39] dark:text-white'
                >
                  {t(`business.nav.${key}`, item.label) as string}
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${mobileExpanded[key] ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    mobileExpanded[key] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className='flex flex-col pl-4 space-y-3 pb-4'>
                    {item.items.map((subItem: any, idx: number) => (
                      <Link
                        key={idx}
                        href={subItem.href}
                        className='flex items-center gap-3 text-gray-600 dark:text-gray-300 py-2 hover:text-[#77b6a3] transition-colors'
                        onClick={closeMobileMenu}
                      >
                        <div className='p-1.5 bg-gray-50 dark:bg-white/5 rounded-lg'>
                          <subItem.icon size={18} className='text-[#77b6a3]' />
                        </div>
                        <span className='font-medium'>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Desktop Component
  return (
    <nav className='relative hidden md:flex items-center space-x-6' onMouseLeave={handleMouseLeave}>
      {Object.entries(NAV_ITEMS).map(([key, item]: [string, any]) => (
        <div key={key} className='relative group' onMouseEnter={() => handleMouseEnter(key)}>
          {item.type === 'link' ? (
            <Link
              href={item.href}
              className={`flex items-center px-2 py-2 text-[15px] font-medium transition-colors bg-transparent hover:text-[#77b6a3] ${activeDropdown === key ? 'text-[#77b6a3]' : 'text-[#202c39] dark:text-white'}`}
            >
              {t(`business.nav.${key}`, item.label) as string}
            </Link>
          ) : (
            <button
              className={`flex items-center gap-1.5 px-2 py-2 text-[15px] font-medium transition-colors bg-transparent focus:outline-none hover:text-[#77b6a3] ${activeDropdown === key ? 'text-[#77b6a3]' : 'text-[#202c39] dark:text-white'}`}
            >
              {t(`business.nav.${key}`, item.label as string) as string}
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${activeDropdown === key ? 'rotate-180 text-[#77b6a3]' : 'text-gray-400 group-hover:text-[#77b6a3]'}`}
              />
            </button>
          )}

          {/* Mega Menu Dropdown */}
          {item.type === 'dropdown' && (
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-white/95 dark:bg-[#0a2c24]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100/50 dark:border-gray-700/50 p-6 transition-all duration-300 z-50 ${
                activeDropdown === key
                  ? 'opacity-100 translate-y-0 visible'
                  : 'opacity-0 translate-y-4 invisible pointer-events-none'
              } ${item.cols === 1 ? 'w-[320px]' : ''}`}
            >
              <div className={`grid gap-4 ${item.cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {item.items.map((subItem: any, idx: number) => (
                  <Link
                    key={idx}
                    href={subItem.href}
                    className='group/item flex items-center gap-4 p-3 rounded-xl hover:bg-white dark:hover:bg-white/5 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-white/5'
                  >
                    <div className='p-2.5 bg-[#f7f8f9] dark:bg-[#202c39] rounded-xl group-hover/item:bg-[#77b6a3]/10 group-hover/item:text-[#77b6a3] transition-colors'>
                      <subItem.icon
                        size={22}
                        className='text-gray-500 dark:text-gray-400 group-hover/item:text-[#77b6a3] transition-colors'
                      />
                    </div>
                    <div>
                      <h4 className='font-bold text-[#202c39] dark:text-white text-[15px] group-hover/item:text-[#77b6a3] transition-colors'>
                        {subItem.label}
                      </h4>
                      {subItem.desc && (
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-medium'>
                          {subItem.desc}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
