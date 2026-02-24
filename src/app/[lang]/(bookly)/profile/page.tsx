'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import {
  Settings,
  Star,
  LogOut,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Shield,
  Edit3,
  Mail,
  Phone,
  CalendarCheck2,
  Heart,
  MessageSquareText,
  UserRound
} from 'lucide-react'

import { PageLoader } from '@/components/LoadingStates'
import { useAuthStore } from '@/stores/auth.store'
import { AuthService } from '@/lib/api/services/auth.service'

const menuItems = [
  {
    id: 'account',
    label: 'Account & Settings',
    icon: Settings,
    href: '/profile/settings'
  },
  {
    id: 'reviews',
    label: 'My Reviews',
    icon: Star,
    href: '/profile/reviews',
    badge: '3'
  }
  // {
  //   id: 'payment',
  //   label: 'Payment Methods',
  //   icon: CreditCard,
  //   href: '/profile/payment'
  // },
  // {
  //   id: 'privacy',
  //   label: 'Privacy & Security',
  //   icon: Shield,
  //   href: '/profile/privacy'
  // },
  // {
  //   id: 'help',
  //   label: 'Help & Support',
  //   icon: HelpCircle,
  //   href: '/profile/help'
  // }
]

function ProfilePage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang || 'en'

  const logoutCustomer = useAuthStore(s => s.logoutCustomer)
  const booklyUser = useAuthStore(s => s.booklyUser)
  const [hydrated, setHydrated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<any>(null)

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (!hydrated) return

    // If not authenticated, redirect to login
    if (!booklyUser) {
      router.push(`/${lang}/customer/login`)
      return
    }

    // Fetch user details from API
    AuthService.getUserDetails()
      .then(res => {
        if (res.data) {
          setUserDetails(res.data)
        } else {
          // Fall back to auth store data
          setUserDetails({
            firstName: booklyUser.name?.split(' ')[0] || '',
            lastName: booklyUser.name?.split(' ').slice(1).join(' ') || '',
            email: booklyUser.email,
            profilePhotoUrl: booklyUser.avatar
          })
        }
      })
      .catch(() => {
        // Fall back to auth store data on error
        setUserDetails({
          firstName: booklyUser.name?.split(' ')[0] || '',
          lastName: booklyUser.name?.split(' ').slice(1).join(' ') || '',
          email: booklyUser.email,
          profilePhotoUrl: booklyUser.avatar
        })
      })
      .finally(() => setLoading(false))
  }, [hydrated, booklyUser, lang, router])

  const handleLogout = () => {
    logoutCustomer()
    router.push(`/${lang}/landpage`)
  }

  const user = userDetails || {
    firstName: booklyUser?.name?.split(' ')[0] || 'User',
    lastName: booklyUser?.name?.split(' ').slice(1).join(' ') || '',
    email: booklyUser?.email || ''
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'June 2023'

  const quickActions = useMemo(
    () => [
      {
        id: 'appointments',
        label: 'Appointments',
        icon: CalendarCheck2,
        href: `/${lang}/appointments`
      },
      {
        id: 'reviews',
        label: 'Reviews',
        icon: MessageSquareText,
        href: `/${lang}/profile/reviews`
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: `/${lang}/profile/settings`
      }
    ],
    [lang]
  )

  const stats = [
    {
      label: 'Bookings',
      value: user.stats?.totalBookings || 12,
      icon: CalendarCheck2
    },
    {
      label: 'Favourites',
      value: user.stats?.favourites || 5,
      icon: Heart
    },
    {
      label: 'Avg',
      value: user.stats?.avgRating || user.stats?.averageRating || 4.8,
      icon: Star
    }
  ]

  if (!hydrated || loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-[#0f1f1b]'>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0f1f1b] pb-[calc(var(--mobile-bottom-nav-offset)+16px)] lg:pb-10'>
      <div className='sticky top-0 z-30 border-b border-gray-100/90 dark:border-white/10 bg-white/95 dark:bg-[#1a2e35]/90 backdrop-blur-md'>
        <div className='mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5'>
          <h1 className='text-xl font-bold text-gray-900 dark:text-white'>Profile</h1>
          <button
            onClick={() => router.push(`/${lang}/profile/settings`)}
            className='inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-[#0a2c24]/10 dark:border-white/15 bg-white dark:bg-white/10 text-[#0a2c24] dark:text-white transition-all active:scale-95'
            aria-label='Open settings'
          >
            <Settings className='h-5 w-5' />
          </button>
        </div>
      </div>

      <div className='mx-auto max-w-4xl px-4 py-5 lg:py-7 space-y-5 lg:space-y-6'>
        <div className='lg:hidden space-y-4'>
          <div className='rounded-3xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#122823] px-4 py-4 shadow-[0_14px_36px_rgba(10,44,36,0.09)]'>
            <div className='flex items-start gap-3'>
              <img
                src={
                  user.profilePhotoUrl ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.firstName)}`
                }
                alt={user.firstName}
                className='h-16 w-16 rounded-2xl object-cover border border-white dark:border-white/10 shadow'
              />

              <div className='min-w-0 flex-1'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <h2 className='truncate text-xl font-bold text-gray-900 dark:text-white'>
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className='mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400'>
                      Member since {memberSince}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/${lang}/profile/settings`)}
                    className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24]'
                    aria-label='Edit profile'
                  >
                    <Edit3 className='h-4 w-4' />
                  </button>
                </div>

                <div className='mt-2 space-y-1.5'>
                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                    <Mail className='h-4 w-4 shrink-0 text-gray-400' />
                    <span className='truncate'>{user.email}</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                    <Phone className='h-4 w-4 shrink-0 text-gray-400' />
                    <span>{user.mobile}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-4 grid grid-cols-3 gap-2'>
              {stats.map(item => (
                <div
                  key={item.label}
                  className='rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-[#f8fbfa] dark:bg-white/5 px-2 py-2.5 text-center'
                >
                  <item.icon
                    className={`mx-auto mb-1 h-4 w-4 ${
                      item.label === 'Avg' ? 'text-yellow-500 fill-yellow-500' : 'text-[#0a2c24] dark:text-[#77b6a3]'
                    }`}
                  />
                  <div className='text-base font-bold text-[#0a2c24] dark:text-[#77b6a3]'>{item.value}</div>
                  <div className='text-[11px] text-gray-500 dark:text-gray-400'>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* <div className='grid grid-cols-3 gap-2'>
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => router.push(action.href)}
                className='rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#122823] px-2 py-3 text-center active:scale-[0.98] transition-transform'
              >
                <action.icon className='mx-auto mb-1.5 h-[18px] w-[18px] text-[#0a2c24] dark:text-[#77b6a3]' />
                <span className='text-xs font-medium text-gray-700 dark:text-gray-200'>{action.label}</span>
              </button>
            ))}
          </div> */}
        </div>

        <div className='hidden lg:block rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-7'>
          <div className='flex items-start gap-5'>
            <div className='relative'>
              <img
                src={
                  user.profilePhotoUrl ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.firstName)}`
                }
                alt={user.firstName}
                className='h-20 w-20 rounded-full object-cover border-4 border-white dark:border-[#1a2e35] shadow-lg'
              />
              <button
                onClick={() => router.push(`/${lang}/profile/settings`)}
                className='absolute bottom-0 right-0 p-1.5 bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] rounded-full shadow-lg hover:opacity-90 transition-opacity'
              >
                <Edit3 className='h-3.5 w-3.5' />
              </button>
            </div>

            <div className='flex-1 min-w-0'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {user.firstName} {user.lastName}
              </h2>

              <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                  <Mail className='h-4 w-4' />
                  <span className='truncate'>{user.email}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                  <Phone className='h-4 w-4' />
                  <span>{user.mobile}</span>
                </div>
              </div>
              <div className='mt-2 text-sm text-gray-500 dark:text-gray-500'>Member since {memberSince}</div>
            </div>
          </div>

          <div className='mt-6 grid grid-cols-3 gap-4'>
            {stats.map(item => (
              <div
                key={item.label}
                className='rounded-2xl border border-gray-100 dark:border-white/10 bg-[#f8fbfa] dark:bg-white/5 px-4 py-4 text-center'
              >
                <div className='flex items-center justify-center gap-2'>
                  <item.icon
                    className={`h-5 w-5 ${
                      item.label === 'Avg' ? 'text-yellow-500 fill-yellow-500' : 'text-[#0a2c24] dark:text-[#77b6a3]'
                    }`}
                  />
                  <span className='text-2xl font-bold text-[#0a2c24] dark:text-[#77b6a3]'>{item.value}</span>
                </div>
                <div className='mt-1 text-xs text-gray-500 dark:text-gray-400'>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5'>
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => router.push(`/${lang}${item.href}`)}
              className={`w-full flex items-center justify-between px-4 py-4 transition-colors active:bg-gray-50 dark:active:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/5 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100 dark:border-white/10' : ''
              }`}
            >
              <div className='flex min-w-0 items-center gap-3'>
                <div className='inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a2c24]/7 dark:bg-white/10'>
                  <item.icon className='h-[18px] w-[18px] text-[#0a2c24] dark:text-[#77b6a3]' />
                </div>
                <span className='truncate text-sm sm:text-base font-medium text-gray-900 dark:text-white'>
                  {item.label}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                {item.badge && (
                  <span className='min-w-6 h-6 px-1.5 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24]'>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className='h-5 w-5 text-gray-400 dark:text-gray-500' />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className='w-full rounded-2xl border border-red-100 dark:border-red-900/30 bg-white dark:bg-white/5 px-4 py-3.5 inline-flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors'
        >
          <LogOut className='h-5 w-5' />
          <span>Log Out</span>
        </button>

        <p className='pb-1 text-center text-xs text-gray-400 dark:text-gray-500 inline-flex w-full items-center justify-center gap-1'>
          <UserRound className='h-3.5 w-3.5' />
          Zerv v1.0.0
        </p>
      </div>
    </div>
  )
}

export default ProfilePage
