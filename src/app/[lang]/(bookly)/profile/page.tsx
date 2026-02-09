'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Building2, CalendarDays, Heart, History, LogOut, Pencil, RotateCcw, Star, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BaseImage, H4, H5, H6, P, Strong } from '@/bookly/components/atoms'
import KulIcon from '@/bookly/components/atoms/kul-icon/kul-icon.component'
import Avatar from '@/bookly/components/molecules/avatar/avatar.component'
import Button from '@/bookly/components/molecules/button/button.component'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/bookly/components/ui/card'
import { MOCK_USER } from '@/mocks/user'
import { useAuthStore } from '@/stores/auth.store'
import { PageLoader } from '@/components/LoadingStates'

const UPCOMING_BOOKINGS = [
  {
    id: 'b1',
    business: 'Bliss Nail Bar',
    service: 'Gel Manicure',
    staff: 'Maria Garcia',
    date: 'Saturday, February 14, 2026',
    time: '10:00 AM',
    duration: '45 minutes',
    price: 35,
    status: 'confirmed' as const,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop'
  }
]

const PAST_BOOKINGS = [
  {
    id: 'p1',
    business: 'Urban Cuts',
    service: 'Men Haircut',
    staff: 'Tom Richards',
    date: 'Monday, January 5, 2026',
    time: '4:30 PM',
    duration: '30 minutes',
    price: 22,
    status: 'completed' as const,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&h=300&fit=crop'
  },
  {
    id: 'p2',
    business: 'Glow Spa',
    service: 'Classic Facial',
    staff: 'Linda Gomez',
    date: 'Friday, August 8, 2025',
    time: '12:00 PM',
    duration: '60 minutes',
    price: 55,
    status: 'canceled' as const,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop'
  }
]

const MOCK_FAVORITES = [
  {
    id: 'f1',
    name: 'Elite Hair Studio Dubai',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop',
    category: 'Hair Salon',
    rating: 4.8,
    reviews: 124,
    location: 'Downtown Dubai'
  },
  {
    id: 'f2',
    name: 'Zen Yoga & Wellness',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&h=600&fit=crop',
    category: 'Yoga Studio',
    rating: 4.9,
    reviews: 89,
    location: 'Dubai Marina'
  },
  {
    id: 'f3',
    name: 'The Barber Shop',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop',
    category: 'Barbershop',
    rating: 4.7,
    reviews: 215,
    location: 'Jumeirah'
  }
]

type BookingItem = (typeof UPCOMING_BOOKINGS)[number] | (typeof PAST_BOOKINGS)[number]

const getStatusStyles = (status: BookingItem['status']) => {
  if (status === 'confirmed') {
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  }

  if (status === 'completed') {
    return 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
  }

  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
}

function ProfilePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'favorites'>('upcoming')
  const params = useParams<{ lang: string }>()
  const router = useRouter()
  const booklyUser = useAuthStore(s => s.booklyUser)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)
  const [hydrated, setHydrated] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => setHydrated(true), [])

  const fetchUserDetails = async () => {
    setLoading(true)
    setTimeout(() => {
      setUserDetails({
        ...MOCK_USER,
        createdAt: '2023-05-15T10:00:00Z'
      })
      setLoading(false)
    }, 600)
  }

  useEffect(() => {
    if (!hydrated) return

    const timer = setTimeout(() => {
      fetchUserDetails()
    }, 100)

    const section = new URLSearchParams(window.location.search).get('section')

    if (section === 'favorites') {
      setActiveTab('favorites')
    }

    return () => clearTimeout(timer)
  }, [hydrated, booklyUser, params?.lang, router])

  const handleLogout = () => {
    logoutCustomer()
    router.push(`/${params?.lang}/landpage`)
  }

  const handleViewBusiness = (businessName: string) => {
    toast.info(`Viewing ${businessName}`, {
      description: 'Business page navigation coming soon'
    })
  }

  const handleCancelBooking = (_bookingId: string, serviceName: string) => {
    toast.warning(`Cancel booking for ${serviceName}?`, {
      description: 'Booking cancellation will be available soon',
      action: {
        label: 'OK',
        onClick: () => {}
      }
    })
  }

  const handleRebook = (businessName: string, serviceName: string) => {
    toast.info(`Rebook ${serviceName} at ${businessName}`, {
      description: 'Quick rebooking will be available soon'
    })
  }

  const user = userDetails || MOCK_USER
  const activeBookings = activeTab === 'upcoming' ? UPCOMING_BOOKINGS : PAST_BOOKINGS
  const ratingValue = user.stats.avgRating ?? user.stats.averageRating ?? '-'

  if (!hydrated) return null

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24]'>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#0a2c24]/8 to-transparent dark:from-[#77b6a3]/10' />

      <div className='relative z-10 mx-auto w-full max-w-4xl px-3 sm:px-6 pt-4 sm:pt-8 pb-[calc(var(--mobile-bottom-nav-offset)+20px)] lg:pb-10 space-y-5 lg:space-y-8'>
        <Card className='mb-4 bg-white/95 dark:bg-[#202c39]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none rounded-[1.75rem] lg:rounded-[2.5rem] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 animation-delay-300 overflow-hidden'>
          <CardHeader className='lg:hidden p-4 space-y-3'>
            <div className='rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#202c39] p-4 shadow-sm'>
              <div className='flex items-start gap-3'>
                <div className='relative shrink-0'>
                  <Avatar
                    size='2XL'
                    imageUrl={
                      user.profilePhotoUrl ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.firstName)}`
                    }
                    alt={user.firstName}
                    avatarTitle={user.firstName}
                    className='ring-2 ring-[#0a2c24]/10 dark:ring-white/20 shadow-md'
                  />
                  <span className='absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#202c39]' />
                </div>

                <div className='min-w-0 flex-1'>
                  <H4
                    className='text-gray-900 dark:text-white text-xl font-bold tracking-tight'
                    stringProps={{ plainText: `${user.firstName} ${user.lastName}` }}
                  />
                  <P
                    stringProps={{ plainText: user.email }}
                    className='text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5'
                  />
                  <div className='mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-[#0a2c24]/5 dark:bg-white/10 text-[11px] text-[#0a2c24] dark:text-white/90'>
                    <KulIcon icon='lucide:phone' iconClass='h-3 w-3' />
                    <span>{user.mobile}</span>
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  <button
                    onClick={() => router.push(`/${params?.lang}/profile/settings`)}
                    className='h-9 w-9 rounded-full border border-[#0a2c24]/10 dark:border-white/10 bg-[#0a2c24]/5 dark:bg-white/10 text-[#0a2c24] dark:text-white inline-flex items-center justify-center active:scale-95 transition-transform touch-manipulation'
                    aria-label={t('profile.editProfile') || 'Edit profile'}
                  >
                    <Pencil className='h-4 w-4' />
                  </button>
                  <button
                    onClick={handleLogout}
                    className='h-9 w-9 rounded-full border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-500 inline-flex items-center justify-center active:scale-95 transition-transform touch-manipulation'
                    aria-label={t('nav.logout') || 'Log out'}
                  >
                    <LogOut className='h-4 w-4' />
                  </button>
                </div>
              </div>

              <div className='mt-4 grid grid-cols-3 gap-2'>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className='rounded-xl border border-[#0a2c24]/10 dark:border-white/10 bg-[#0a2c24]/5 dark:bg-white/10 px-2 py-2 text-left active:scale-[0.98] transition-transform touch-manipulation'
                >
                  <div className='flex items-center gap-1'>
                    <CalendarDays className='h-3.5 w-3.5 text-[#0a2c24] dark:text-[#77b6a3]' />
                    <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>
                      {t('profile.bookings.title') || 'Bookings'}
                    </span>
                  </div>
                  <p className='mt-1 text-lg leading-none font-bold text-[#0a2c24] dark:text-white'>
                    {user.stats.totalBookings}
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className='rounded-xl border border-[#0a2c24]/10 dark:border-white/10 bg-[#0a2c24]/5 dark:bg-white/10 px-2 py-2 text-left active:scale-[0.98] transition-transform touch-manipulation'
                >
                  <div className='flex items-center gap-1'>
                    <Heart className='h-3.5 w-3.5 text-[#0a2c24] dark:text-[#77b6a3]' />
                    <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>
                      {t('profile.favorites') || 'Favorites'}
                    </span>
                  </div>
                  <p className='mt-1 text-lg leading-none font-bold text-[#0a2c24] dark:text-white'>
                    {user.stats.favorites}
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className='rounded-xl border border-[#0a2c24]/10 dark:border-white/10 bg-[#0a2c24]/5 dark:bg-white/10 px-2 py-2 text-left active:scale-[0.98] transition-transform touch-manipulation'
                >
                  <div className='flex items-center gap-1'>
                    <Star className='h-3.5 w-3.5 text-yellow-500 fill-yellow-500' />
                    <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>
                      {t('profile.avgRating') || 'Rating'}
                    </span>
                  </div>
                  <p className='mt-1 text-lg leading-none font-bold text-[#0a2c24] dark:text-white'>{ratingValue}</p>
                </button>
              </div>
            </div>
          </CardHeader>

          <CardHeader className='hidden lg:flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-6'>
            <CardTitle>
              <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
                <div className='relative group'>
                  <Avatar
                    size='5XL'
                    imageUrl={
                      user.profilePhotoUrl ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.firstName)}`
                    }
                    alt={user.firstName}
                    avatarTitle={user.firstName}
                    className='ring-4 ring-primary-100 shadow-xl group-hover:ring-primary-200 transition-all duration-300 transform group-hover:scale-105'
                  />
                  <div className='absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse' />
                </div>

                <div className='text-center sm:text-left'>
                  <H4
                    className='text-gray-900 dark:text-white text-3xl font-bold tracking-tight'
                    stringProps={{ plainText: `${user.firstName} ${user.lastName}` }}
                  />

                  <div className='mt-3 sm:items-center sm:gap-6 text-gray-600 dark:text-gray-300 flex flex-wrap gap-3'>
                    <div className='flex items-center justify-center sm:justify-start gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full'>
                      <KulIcon icon='lucide:mail' iconClass='w-3.5 h-3.5 text-primary-600' />
                      <P stringProps={{ plainText: user.email }} className='text-sm font-medium' />
                    </div>
                    <div className='flex items-center justify-center sm:justify-start gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full'>
                      <KulIcon icon='lucide:phone' iconClass='w-3.5 h-3.5 text-primary-600' />
                      <P stringProps={{ plainText: user.mobile }} className='text-sm font-medium' />
                    </div>
                  </div>
                </div>
              </div>
            </CardTitle>

            <CardAction className='ml-auto flex items-center gap-2'>
              <button
                onClick={() => router.push(`/${params?.lang}/profile/settings`)}
                className='p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group'
                title={t('profile.editProfile')}
              >
                <div className='w-10 h-10 rounded-full bg-[#0a2c24] dark:bg-[#77b6a3] flex items-center justify-center text-white dark:text-[#0a2c24] shadow-md group-hover:scale-110 transition-transform duration-300'>
                  <KulIcon icon='lucide:pencil' iconClass='w-5 h-5' />
                </div>
              </button>
              <button
                onClick={handleLogout}
                className='p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group'
                title={t('nav.logout')}
              >
                <div className='w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 dark:text-red-400 shadow-md group-hover:scale-110 transition-transform duration-300 border border-red-100 dark:border-red-900/30'>
                  <LogOut className='w-5 h-5' />
                </div>
              </button>
            </CardAction>
            <CardDescription className='sr-only'>Profile overview</CardDescription>
          </CardHeader>

          <CardContent className='hidden lg:block pt-1 lg:pt-0 px-4 lg:px-6 pb-4 lg:pb-6'>
            {/* Mobile Stats / Tabs replaced by Segmented Control above */}
            <div className='hidden lg:grid mt-8 grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6'>
              <div
                onClick={() => setActiveTab('upcoming')}
                className='cursor-pointer group relative overflow-hidden rounded-[2rem] border-none p-6 bg-[#0a2c24] text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300'
              >
                <div className='absolute -right-8 -top-8 w-32 h-32 opacity-10 group-hover:opacity-20 transition-all duration-700 pointer-events-none'>
                  <div className='w-full h-full animate-[spin_10s_linear_infinite] group-hover:animate-[spin_4s_linear_infinite]'>
                    <svg viewBox='0 0 100 100' fill='currentColor' className='text-[#77b6a3]'>
                      <path d='M20,20 L80,20 L80,30 L35,80 L80,80 L80,90 L20,90 L20,80 L65,30 L20,30 Z' />
                    </svg>
                  </div>
                </div>

                <div className='relative z-10'>
                  <H6
                    className='text-3xl font-bold text-[#77b6a3] mb-1'
                    stringProps={{ plainText: String(user.stats.totalBookings) }}
                  />
                  <P
                    i18nTFn={t}
                    className='text-white/80 font-medium text-sm'
                    stringProps={{ localeKey: 'profile.totalBookings' }}
                  />
                  <div className='mt-3 w-10 h-1.5 bg-[#77b6a3] rounded-full group-hover:w-16 transition-all duration-300' />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('favorites')}
                className='cursor-pointer group relative overflow-hidden rounded-[2rem] border-none p-6 bg-white dark:bg-[#202c39] border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'
              >
                <div className='absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-20 transition-all duration-300 pointer-events-none'>
                  <div className='w-full h-full group-hover:animate-pulse'>
                    <KulIcon icon='lucide:heart' iconClass='w-full h-full text-emerald-500 fill-current' />
                  </div>
                </div>

                <div className='relative z-10'>
                  <H6
                    className='text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1'
                    stringProps={{ plainText: String(user.stats.favorites) }}
                  />
                  <P
                    i18nTFn={t}
                    className='text-gray-600 dark:text-gray-300 font-medium text-sm'
                    stringProps={{ localeKey: 'profile.favorites' }}
                  />
                  <div className='mt-3 w-10 h-1.5 bg-emerald-500 rounded-full group-hover:w-16 transition-all duration-300' />
                </div>
              </div>

              <div className='group relative overflow-hidden rounded-[2rem] border-none p-6 bg-white dark:bg-[#202c39] border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
                <div className='absolute -right-4 -top-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none'>
                  <KulIcon icon='lucide:star' iconClass='w-full h-full text-yellow-500' />
                </div>

                <div className='relative z-10'>
                  <div className='flex items-center gap-2 mb-1'>
                    <H6
                      className='text-3xl font-bold text-yellow-600 dark:text-yellow-400'
                      stringProps={{ plainText: String(ratingValue) }}
                    />
                    <KulIcon
                      icon='lucide:star'
                      iconClass='w-6 h-6 text-yellow-500 dark:text-yellow-400 fill-yellow-500'
                    />
                  </div>
                  <P
                    i18nTFn={t}
                    className='text-gray-600 dark:text-gray-300 font-medium text-sm'
                    stringProps={{ localeKey: 'profile.avgRating' }}
                  />
                  <div className='mt-3 w-10 h-1.5 bg-yellow-500 rounded-full group-hover:w-16 transition-all duration-300' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:bg-white/95 lg:dark:bg-[#202c39]/95 lg:backdrop-blur-md lg:shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-transparent dark:bg-transparent shadow-none border-none lg:rounded-[2.5rem] lg:hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 animation-delay-600'>
          <CardHeader className='pb-0 lg:pb-6 px-0 lg:px-6 pt-0 lg:pt-6'>
            <CardTitle className='hidden lg:block'>
              <H5
                i18nTFn={t}
                className='text-gray-900 dark:text-white text-[1.95rem] lg:text-[2rem]'
                stringProps={{ localeKey: 'profile.bookings.title' }}
              />
            </CardTitle>
            <CardDescription className='w-full'>
              {/* Mobile tabs removed as they moved to header */}
              {/* Mobile Tabs - Sticky & Blended */}
              <div className='lg:hidden mb-0 -mt-8 sticky top-0 z-30 -mx-4 px-4 py-3 bg-[#f7f8f9]/95 dark:bg-[#0a2c24]/95 backdrop-blur-md transition-all duration-300'>
                <div className='bg-white/80 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200/50 dark:border-white/10 grid grid-cols-3 gap-1.5 shadow-sm'>
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                      activeTab === 'upcoming'
                        ? 'bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24] shadow-md scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <CalendarDays className='h-3.5 w-3.5' />
                    <span>{t('profile.bookings.upcomingWithCount', { count: UPCOMING_BOOKINGS.length })}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                      activeTab === 'past'
                        ? 'bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24] shadow-md scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <History className='h-3.5 w-3.5' />
                    <span>{t('profile.bookings.pastWithCount', { count: PAST_BOOKINGS.length })}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                      activeTab === 'favorites'
                        ? 'bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24] shadow-md scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Heart className='h-3.5 w-3.5' />
                    <span>{t('profile.favorites') || 'Favorites'}</span>
                  </button>
                </div>
              </div>

              {/* Mobile Title */}
              <div className='lg:hidden flex items-center gap-2 -mb-2 px-1'>
                {activeTab === 'favorites' ? (
                  <Heart className='h-5 w-5 text-[#0a2c24] dark:text-[#77b6a3]' />
                ) : activeTab === 'upcoming' ? (
                  <CalendarDays className='h-5 w-5 text-[#0a2c24] dark:text-[#77b6a3]' />
                ) : (
                  <History className='h-5 w-5 text-[#0a2c24] dark:text-[#77b6a3]' />
                )}
                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                  {activeTab === 'favorites'
                    ? t('profile.favorites', 'Favorites')
                    : activeTab === 'upcoming'
                      ? t('profile.bookings.upcoming', 'Upcoming')
                      : t('profile.bookings.past', 'History')}
                </h2>
              </div>

              <div className='hidden lg:grid mt-2 p-1 bg-white dark:bg-[#0a2c24]/50 border border-[#0a2c24]/10 dark:border-white/10 rounded-xl grid-cols-3 gap-1 touch-manipulation'>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={
                    activeTab === 'upcoming'
                      ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] py-3 px-2 sm:px-6 text-center font-semibold rounded-lg shadow-md transform scale-105 transition-all duration-300 text-sm sm:text-base'
                      : 'text-[#0a2c24] dark:text-white py-3 px-2 sm:px-6 text-center font-medium hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 rounded-lg transition-all duration-200 text-sm sm:text-base'
                  }
                >
                  <P
                    i18nTFn={t}
                    className={
                      activeTab === 'upcoming' ? 'text-white dark:text-[#0a2c24]' : 'text-[#0a2c24] dark:text-white'
                    }
                    stringProps={{
                      localeKey: 'profile.bookings.upcomingWithCount',
                      localeProps: { count: UPCOMING_BOOKINGS.length }
                    }}
                  />
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={
                    activeTab === 'past'
                      ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] py-3 px-2 sm:px-6 text-center font-semibold rounded-lg shadow-md transform scale-105 transition-all duration-300 text-sm sm:text-base'
                      : 'text-[#0a2c24] dark:text-white py-3 px-2 sm:px-6 text-center font-medium hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 rounded-lg transition-all duration-200 text-sm sm:text-base'
                  }
                >
                  <P
                    i18nTFn={t}
                    className={
                      activeTab === 'past' ? 'text-white dark:text-[#0a2c24]' : 'text-[#0a2c24] dark:text-white'
                    }
                    stringProps={{
                      localeKey: 'profile.bookings.pastWithCount',
                      localeProps: { count: PAST_BOOKINGS.length }
                    }}
                  />
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={
                    activeTab === 'favorites'
                      ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] py-3 px-2 sm:px-6 text-center font-semibold rounded-lg shadow-md transform scale-105 transition-all duration-300 text-sm sm:text-base'
                      : 'text-[#0a2c24] dark:text-white py-3 px-2 sm:px-6 text-center font-medium hover:bg-[#77b6a3]/10 dark:hover:bg-[#77b6a3]/20 rounded-lg transition-all duration-200 text-sm sm:text-base'
                  }
                >
                  <div className='flex items-center justify-center gap-2'>
                    <KulIcon icon='lucide:heart' iconClass='w-4 h-4' />
                    <span>{t('profile.favorites') || 'Favorites'}</span>
                  </div>
                </button>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className='px-4 lg:px-6 pb-4 lg:pb-6'>
            {activeTab === 'favorites' ? (
              <>
                <div className='lg:hidden space-y-1'>
                  {MOCK_FAVORITES.map((business, index) => (
                    <div
                      key={business.id}
                      className='border border-[#0a2c24]/10 dark:border-white/10 rounded-2xl p-3 bg-white dark:bg-[#202c39] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500'
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className='flex gap-3 items-start'>
                        <div className='w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative'>
                          <BaseImage src={business.image} alt={business.name} className='object-cover w-full h-full' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2'>
                            <div className='min-w-0'>
                              <H6
                                className='text-gray-900 dark:text-white truncate'
                                stringProps={{ plainText: business.name }}
                              />
                              <P
                                className='text-xs text-gray-500 mt-0.5'
                                stringProps={{ plainText: business.category }}
                              />
                            </div>
                            <div className='flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-100 dark:border-yellow-900/30 shrink-0'>
                              <KulIcon icon='lucide:star' iconClass='w-3 h-3 text-yellow-500 fill-yellow-500' />
                              <span className='text-xs font-bold text-yellow-700 dark:text-yellow-300'>
                                {business.rating}
                              </span>
                            </div>
                          </div>

                          <div className='mt-2 inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs'>
                            <KulIcon icon='lucide:map-pin' iconClass='w-3 h-3' />
                            <span>{business.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className='mt-3'>
                        <button
                          onClick={() => handleViewBusiness(business.name)}
                          className='h-10 w-full rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] font-semibold text-sm active:scale-[0.98] transition-transform touch-manipulation inline-flex items-center justify-center gap-2'
                        >
                          <Building2 className='h-4 w-4' />
                          {t('common.bookNow', 'Book Now')}
                          <KulIcon icon='lucide:arrow-up-right' iconClass='h-3.5 w-3.5' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='hidden lg:grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {MOCK_FAVORITES.map((business, index) => (
                    <div
                      key={business.id}
                      className='group border border-[#0a2c24]/10 dark:border-white/10 rounded-xl p-4 flex gap-4 items-start bg-white/80 dark:bg-[#202c39]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#202c39] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4'
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleViewBusiness(business.name)}
                    >
                      <div className='w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative'>
                        <BaseImage src={business.image} alt={business.name} className='object-cover w-full h-full' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <H6
                              className='text-gray-900 dark:text-white font-bold'
                              stringProps={{ plainText: business.name }}
                            />
                            <P className='text-sm text-gray-500' stringProps={{ plainText: business.category }} />
                          </div>
                          <div className='flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100'>
                            <KulIcon icon='lucide:star' iconClass='w-3 h-3 text-yellow-500 fill-yellow-500' />
                            <span className='text-xs font-bold text-yellow-700'>{business.rating}</span>
                          </div>
                        </div>

                        <div className='mt-2 flex items-center gap-1 text-gray-500 text-sm'>
                          <KulIcon icon='lucide:map-pin' iconClass='w-3 h-3' />
                          <span>{business.location}</span>
                        </div>

                        <div className='mt-3 flex justify-end'>
                          <Button
                            size='sm'
                            variant='outlined'
                            buttonText={{ plainText: 'Book Now' }}
                            className='text-xs py-1 h-8'
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className='lg:hidden space-y-2'>
                  {activeBookings.map((booking, index) => (
                    <article
                      key={booking.id}
                      className='border border-[#0a2c24]/10 dark:border-white/10 rounded-2xl p-3 bg-white dark:bg-[#202c39] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500'
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className='flex gap-3 items-start'>
                        <div className='w-20 h-20 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900/50 flex-shrink-0 relative'>
                          <BaseImage
                            src={booking.image}
                            alt={booking.business}
                            className='object-cover w-full h-full'
                            unoptimized
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <H6
                            className='text-gray-900 dark:text-white leading-tight'
                            stringProps={{ plainText: booking.business }}
                          />
                          <P
                            className='text-gray-600 dark:text-gray-300 text-sm mt-0.5'
                            stringProps={{ plainText: booking.service }}
                          />
                          <P
                            className='text-gray-500 dark:text-gray-400 text-sm mt-0.5'
                            i18nTFn={t}
                            stringProps={{
                              localeKey: 'profile.bookings.withStaff',
                              localeProps: { staff: booking.staff }
                            }}
                          />

                          <span
                            className={`mt-2 inline-flex items-center gap-1 rounded-full text-[11px] font-medium px-2 py-1 ${getStatusStyles(booking.status)}`}
                          >
                            <span className='h-2 w-2 rounded-full bg-current opacity-80' />
                            {t(`profile.bookings.${booking.status}`)}
                          </span>
                        </div>
                      </div>

                      <div className='mt-3 space-y-1.5 text-gray-600 dark:text-gray-300 text-sm'>
                        <div className='flex items-center gap-2'>
                          <KulIcon icon='lucide:calendar' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                          <span>{booking.date}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <KulIcon icon='lucide:clock' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                          <span>
                            {t('profile.bookings.timeWithDuration', {
                              time: booking.time,
                              duration: booking.duration
                            })}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Strong stringProps={{ plainText: 'E£' }} />
                          <span className='font-semibold'>{booking.price}</span>
                        </div>
                      </div>

                      <div className='mt-3 grid grid-cols-2 gap-2'>
                        <button
                          onClick={() => handleViewBusiness(booking.business)}
                          className='h-10 rounded-xl border border-[#0a2c24]/25 dark:border-white/20 bg-white dark:bg-[#202c39] text-[#0a2c24] dark:text-white text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform touch-manipulation'
                        >
                          <Building2 className='h-4 w-4' />
                          <span>{t('profile.bookings.viewBusiness')}</span>
                        </button>
                        {activeTab === 'upcoming' ? (
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.service)}
                            className='h-10 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform touch-manipulation'
                          >
                            <X className='h-4 w-4' />
                            <span>{t('profile.bookings.cancel')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRebook(booking.business, booking.service)}
                            className='h-10 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform touch-manipulation'
                          >
                            <RotateCcw className='h-4 w-4' />
                            <span>{t('profile.bookings.rebook')}</span>
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                <div className='hidden lg:block space-y-4'>
                  {activeBookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className='group border border-[#0a2c24]/10 dark:border-white/10 rounded-xl p-6 flex gap-4 items-start bg-white/80 dark:bg-[#202c39]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#202c39] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4'
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className='w-20 h-20 rounded-lg overflow-hidden bg-primary-100 dark:bg-primary-900/50 flex-shrink-0 relative shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105'>
                        <BaseImage
                          src={booking.image}
                          alt={booking.business}
                          className='object-cover w-full h-full'
                          unoptimized
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4'>
                          <div>
                            <H6
                              className='text-gray-900 dark:text-white'
                              stringProps={{ plainText: booking.business }}
                            />
                            <P
                              className='text-gray-600 dark:text-gray-300'
                              stringProps={{ plainText: booking.service }}
                            />
                            <P
                              className='text-gray-600 dark:text-gray-300'
                              i18nTFn={t}
                              stringProps={{
                                localeKey: 'profile.bookings.withStaff',
                                localeProps: { staff: booking.staff }
                              }}
                            />
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full text-xs font-medium px-2 py-1 ${getStatusStyles(booking.status)}`}
                          >
                            <span className='h-2 w-2 rounded-full bg-current opacity-80' />
                            {t(`profile.bookings.${booking.status}`)}
                          </span>
                        </div>
                        <div className='mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-600 dark:text-gray-300'>
                          <div className='flex items-center gap-2'>
                            <KulIcon icon='lucide:calendar' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                            <P stringProps={{ plainText: booking.date }} />
                          </div>
                          <div className='flex items-center gap-2'>
                            <KulIcon icon='lucide:clock' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                            <P
                              i18nTFn={t}
                              stringProps={{
                                localeKey: 'profile.bookings.timeWithDuration',
                                localeProps: { time: booking.time, duration: booking.duration }
                              }}
                            />
                          </div>
                          <div className='flex items-center gap-2'>
                            <Strong stringProps={{ plainText: 'E£' }} />
                            <P stringProps={{ plainText: String(booking.price) }} />
                          </div>
                        </div>
                        <div className='mt-4 flex gap-2'>
                          <Button
                            variant='outlined'
                            size='md'
                            buttonText={{ localeKey: 'profile.bookings.viewBusiness' }}
                            onClick={() => handleViewBusiness(booking.business)}
                          />
                          {activeTab === 'upcoming' ? (
                            <Button
                              variant='text'
                              size='md'
                              buttonText={{ localeKey: 'profile.bookings.cancel' }}
                              onClick={() => handleCancelBooking(booking.id, booking.service)}
                            />
                          ) : (
                            <Button
                              variant='text'
                              size='md'
                              buttonText={{ localeKey: 'profile.bookings.rebook' }}
                              onClick={() => handleRebook(booking.business, booking.service)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab !== 'favorites' && activeBookings.length === 0 && (
              <div className='text-center py-6 text-gray-600 dark:text-gray-300'>
                <P i18nTFn={t} stringProps={{ localeKey: 'profile.bookings.empty' }} />
              </div>
            )}
          </CardContent>
          <CardFooter />
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
