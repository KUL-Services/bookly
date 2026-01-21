'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { H1, H4, H5, H6, P, Strong, BaseImage } from '@/bookly/components/atoms'
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
import KulIcon from '@/bookly/components/atoms/kul-icon/kul-icon.component'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { MOCK_USER } from '@/mocks/user'

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
    // Simulate API delay then load mock data
    setLoading(true)
    setTimeout(() => {
      // Use shared MOCK_USER but ensure createdAt is the specific date requested for testing encoding
      setUserDetails({
        ...MOCK_USER,
        createdAt: '2023-05-15T10:00:00Z' // 15/05/2023
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
    if (section === 'favorites') setActiveTab('favorites')

    return () => clearTimeout(timer)
  }, [hydrated, booklyUser, params?.lang, router])

  const goBack = () => router.push(`/${params?.lang}/landpage`)

  const handleLogout = () => {
    logoutCustomer()
    router.push(`/${params?.lang}/landpage`)
  }

  const handleViewBusiness = (businessName: string) => {
    toast.info(`Viewing ${businessName}`, {
      description: 'Business page navigation coming soon'
    })
  }

  const handleCancelBooking = (bookingId: string, serviceName: string) => {
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

  if (!hydrated) return null

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] flex items-center justify-center font-sans'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-[#0a2c24] dark:border-[#77b6a3]'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
      <div className='w-full max-w-4xl space-y-6 sm:space-y-8 relative z-10'>
        {/* Profile Card */}
        <Card className='bg-white/90 dark:bg-[#202c39]/90 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none rounded-[2.5rem] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
          <CardHeader className='flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6'>
            <CardTitle>
              <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6'>
                <div className='relative group'>
                  <Avatar
                    size='5XL'
                    imageUrl={
                      user.profilePhotoUrl ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.firstName)}`
                    }
                    alt={user.firstName}
                    avatarTitle={user.firstName}
                    className='ring-4 ring-primary-100 shadow-lg group-hover:ring-primary-200 transition-all duration-300'
                  />
                  <div className='absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse' />
                </div>
                <div className='text-center sm:text-left'>
                  <H4
                    className='text-gray-900 dark:text-white text-xl sm:text-2xl'
                    stringProps={{ plainText: `${user.firstName} ${user.lastName}` }}
                  />
                  <div className='mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-6 text-gray-600 dark:text-gray-300 space-y-1 sm:space-y-0'>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:mail' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                      <P stringProps={{ plainText: user.email }} className='' />
                    </div>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:phone' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                      <P stringProps={{ plainText: user.mobile }} className='' />
                    </div>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:id-card' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                      <P
                        i18nTFn={t}
                        stringProps={{
                          localeKey: 'profile.memberSince',
                          localeProps: { date: new Date(user.createdAt).toLocaleDateString() }
                        }}
                        className=''
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardTitle>
            <CardAction className='flex items-center gap-2 ml-auto'>
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
          <CardContent className='pt-0'>
            <div className='mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
              {/* Total Bookings Card */}
              <div
                onClick={() => setActiveTab('past')}
                className='cursor-pointer group relative overflow-hidden rounded-[2rem] border-none p-6 bg-[#0a2c24] text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300'
              >
                {/* Decorative Background - Animated Logo Style */}
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

              {/* Favorites Card */}
              <div
                onClick={() => setActiveTab('favorites')}
                className='cursor-pointer group relative overflow-hidden rounded-[2rem] border-none p-6 bg-white dark:bg-[#202c39] border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'
              >
                {/* Animated Heart Background */}
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

              {/* Rating Card */}
              <div className='group relative overflow-hidden rounded-[2rem] border-none p-6 bg-white dark:bg-[#202c39] border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
                <div className='absolute -right-4 -top-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none'>
                  <KulIcon icon='lucide:star' iconClass='w-full h-full text-yellow-500' />
                </div>

                <div className='relative z-10'>
                  <div className='flex items-center gap-2 mb-1'>
                    <H6
                      className='text-3xl font-bold text-yellow-600 dark:text-yellow-400'
                      stringProps={{ plainText: String(user.stats.avgRating) }}
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

        {/* Content Tabs Card */}
        <Card className='bg-white/90 dark:bg-[#202c39]/90 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none rounded-[2.5rem] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-600'>
          <CardHeader>
            <CardTitle>
              <H5
                i18nTFn={t}
                className='text-gray-900 dark:text-white'
                stringProps={{ localeKey: 'profile.bookings.title' }}
              />
            </CardTitle>
            <CardDescription className='w-full'>
              <div className='mt-4 p-1 bg-white dark:bg-[#0a2c24]/50 border border-[#0a2c24]/10 dark:border-white/10 rounded-xl grid grid-cols-3 gap-1 touch-manipulation'>
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
          <CardContent>
            {activeTab === 'favorites' ? (
              // Favorites Tab Content
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {MOCK_FAVORITES.map((business, index) => (
                  <div
                    key={business.id}
                    className='group border border-[#0a2c24]/10 dark:border-white/10 rounded-xl p-4 flex gap-4 items-start bg-white/80 dark:bg-[#202c39]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#202c39] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer'
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
            ) : (
              // Bookings Tab Content
              (activeTab === 'upcoming' ? UPCOMING_BOOKINGS : PAST_BOOKINGS).map((b, index) => (
                <div
                  key={b.id}
                  className={`group border border-[#0a2c24]/10 dark:border-white/10 rounded-xl p-6 flex gap-4 items-start bg-white/80 dark:bg-[#202c39]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#202c39] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className='w-20 h-20 rounded-lg overflow-hidden bg-primary-100 dark:bg-primary-900/50 flex-shrink-0 relative shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105'>
                    <BaseImage
                      src={b.image}
                      alt={b.business}
                      className='object-cover w-full h-full'
                      unoptimized={true}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4'>
                      <div>
                        <H6 className='text-gray-900 dark:text-white' stringProps={{ plainText: b.business }} />
                        <P className='text-gray-600 dark:text-gray-300' stringProps={{ plainText: b.service }} />
                        <P
                          className='text-gray-600 dark:text-gray-300'
                          i18nTFn={t}
                          stringProps={{ localeKey: 'profile.bookings.withStaff', localeProps: { staff: b.staff } }}
                        />
                      </div>
                      {b.status === 'confirmed' && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-1'>
                          <span className='h-2 w-2 rounded-full bg-green-600 dark:bg-green-400' />
                          {t('profile.bookings.confirmed')}
                        </span>
                      )}
                      {b.status === 'completed' && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-1'>
                          <span className='h-2 w-2 rounded-full bg-slate-600 dark:bg-slate-400' />
                          {t('profile.bookings.completed')}
                        </span>
                      )}
                      {b.status === 'canceled' && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium px-2 py-1'>
                          <span className='h-2 w-2 rounded-full bg-red-600 dark:bg-red-400' />
                          {t('profile.bookings.canceled')}
                        </span>
                      )}
                    </div>
                    <div className='mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-600 dark:text-gray-300'>
                      <div className='flex items-center gap-2'>
                        <KulIcon icon='lucide:calendar' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                        <P stringProps={{ plainText: b.date }} className='' />
                      </div>
                      <div className='flex items-center gap-2'>
                        <KulIcon icon='lucide:clock' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                        <P
                          i18nTFn={t}
                          stringProps={{
                            localeKey: 'profile.bookings.timeWithDuration',
                            localeProps: { time: b.time, duration: b.duration }
                          }}
                        />
                      </div>
                      <div className='flex items-center gap-2'>
                        <Strong stringProps={{ plainText: '£' }} className='' />
                        <P stringProps={{ plainText: String(b.price) }} className='' />
                      </div>
                    </div>
                    <div className='mt-4 flex gap-2'>
                      {activeTab === 'upcoming' ? (
                        <>
                          <Button
                            variant='outlined'
                            size='md'
                            buttonText={{ localeKey: 'profile.bookings.viewBusiness' }}
                            onClick={() => handleViewBusiness(b.business)}
                          />
                          <Button
                            variant='text'
                            size='md'
                            buttonText={{ localeKey: 'profile.bookings.cancel' }}
                            onClick={() => handleCancelBooking(b.id, b.service)}
                          />
                        </>
                      ) : (
                        <>
                          <Button
                            variant='outlined'
                            size='md'
                            buttonText={{ localeKey: 'profile.bookings.viewBusiness' }}
                            onClick={() => handleViewBusiness(b.business)}
                          />
                          <Button
                            variant='text'
                            size='md'
                            buttonText={{ localeKey: 'profile.bookings.rebook' }}
                            onClick={() => handleRebook(b.business, b.service)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {activeTab !== 'favorites' &&
              (activeTab === 'upcoming' ? UPCOMING_BOOKINGS : PAST_BOOKINGS).length === 0 && (
                <div className='text-center py-6 text-gray-600 dark:text-gray-300'>
                  <P i18nTFn={t} stringProps={{ localeKey: 'profile.bookings.empty' }} />
                </div>
              )}
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
