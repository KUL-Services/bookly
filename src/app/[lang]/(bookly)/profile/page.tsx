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
import { AuthService } from '@/lib/api'
import { toast } from 'sonner'

function ProfilePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const params = useParams<{ lang: string }>()
  const router = useRouter()
  const booklyUser = useAuthStore(s => s.booklyUser)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)
  const [hydrated, setHydrated] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => setHydrated(true), [])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)

      // Ensure we have a token before making the API call
      const storedToken = AuthService.getStoredToken()
      if (!storedToken) {
        console.warn('No auth token found, skipping user details fetch')
        setLoading(false)
        return
      }

      // Ensure the API client has the token
      AuthService.initializeAuth()

      const response = await AuthService.getUserDetails()

      if (response.error) {
        console.error('Failed to fetch user details:', response.error)
        return
      }

      if (response.data) {
        setUserDetails(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hydrated) return
    if (!booklyUser) {
      router.replace(`/${params?.lang}/customer/login`)
      return
    }

    // Add a small delay to ensure store has fully rehydrated
    const timer = setTimeout(() => {
      fetchUserDetails()
    }, 100)

    return () => clearTimeout(timer)
  }, [hydrated, booklyUser, params?.lang, router])

  const goBack = () => router.push(`/${params?.lang}/landpage`)

  const handleViewBusiness = (businessName: string) => {
    // TODO: Navigate to actual business page when we have business slugs
    toast.info(`Viewing ${businessName}`, {
      description: 'Business page navigation coming soon'
    })
  }

  const handleCancelBooking = (bookingId: string, serviceName: string) => {
    // TODO: Implement cancel booking API call
    toast.warning(`Cancel booking for ${serviceName}?`, {
      description: 'Booking cancellation will be available soon',
      action: {
        label: 'OK',
        onClick: () => {}
      }
    })
  }

  const handleRebook = (businessName: string, serviceName: string) => {
    // TODO: Navigate to booking flow with pre-filled service
    toast.info(`Rebook ${serviceName} at ${businessName}`, {
      description: 'Quick rebooking will be available soon'
    })
  }

  // User data from API or fallback
  const user = userDetails
    ? {
        name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || 'User',
        email: booklyUser?.email || 'No email',
        phone: userDetails.mobile || 'No phone',
        memberSince: userDetails.createdAt
          ? new Date(userDetails.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : 'Unknown',
        profilePhotoUrl: userDetails.profilePhotoUrl || null,
        stats: { totalBookings: 12, favorites: 2, avgRating: 4.8 } // TODO: Replace with real stats when available
      }
    : {
        name: 'Loading...',
        email: 'Loading...',
        phone: 'Loading...',
        memberSince: 'Loading...',
        profilePhotoUrl: null,
        stats: { totalBookings: 0, favorites: 0, avgRating: 0 }
      }

  const upcomingBookings = [
    {
      id: 'b1',
      business: 'Bliss Nail Bar',
      service: 'Gel Manicure',
      staff: 'Maria Garcia',
      date: 'Saturday, September 20, 2025',
      time: '10:00 AM',
      duration: '45 minutes',
      price: 35,
      status: 'confirmed' as const,
      image: 'https://images.unsplash.com/photo-1607779097040-7db2a5aa8b80?q=80&w=1200&auto=format&fit=crop'
    }
  ]

  const pastBookings = [
    {
      id: 'p1',
      business: 'Urban Cuts',
      service: 'Men Haircut',
      staff: 'Tom Richards',
      date: 'Monday, July 15, 2025',
      time: '4:30 PM',
      duration: '30 minutes',
      price: 22,
      status: 'completed' as const,
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop'
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
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop'
    }
  ]

  if (!hydrated || !booklyUser) return null

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary-800'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden'>
      <div className='w-full max-w-4xl space-y-6 sm:space-y-8 relative z-10'>
        {/* Header */}
        {/* <div className='flex items-center justify-between gap-3 sm:gap-2 animate-in fade-in slide-in-from-top-4 duration-700'>
          <button
            onClick={goBack}
            className='inline-flex items-center p-2 rounded-full text-primary-800 dark:text-sage-400 hover:text-primary-900 dark:hover:text-sage-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-200 hover:scale-110 active:scale-95'
          >
            <KulIcon icon='lucide:chevron-left' iconClass='w-6 h-6' />
          </button>
          <H1
            i18nTFn={t}
            className='font-bold text-2xl sm:text-3xl bg-gradient-to-r from-primary-800 to-sage-600 dark:from-sage-400 dark:to-primary-400 bg-clip-text text-transparent'
            stringProps={{ localeKey: 'profile.title' }}
          />
          <button
            onClick={() => {
              logoutCustomer()
              router.replace(`/${params?.lang}/customer/login`)
            }}
            className='px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 font-medium'
          >
            Logout
          </button>
        </div> */}

        {/* Profile Card */}
        <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-primary-100/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
          <CardHeader className='flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6'>
            <CardTitle>
              <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6'>
                <div className='relative group'>
                  <Avatar
                    size='5XL'
                    imageUrl={
                      user.profilePhotoUrl ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                    }
                    alt={user.name}
                    avatarTitle={user.name}
                    className='ring-4 ring-primary-100 shadow-lg group-hover:ring-primary-200 transition-all duration-300'
                  />
                  <div className='absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse' />
                </div>
                <div className='text-center sm:text-left'>
                  <H4
                    className='text-gray-900 dark:text-white text-xl sm:text-2xl'
                    stringProps={{ plainText: user.name }}
                  />
                  <div className='mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-6 text-gray-600 dark:text-gray-300 space-y-1 sm:space-y-0'>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:mail' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                      <P stringProps={{ plainText: user.email }} />
                    </div>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:phone' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                      <P stringProps={{ plainText: user.phone }} />
                    </div>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:id-card' iconClass='w-4 h-4 text-gray-500 dark:text-gray-400' />
                      <P
                        i18nTFn={t}
                        stringProps={{ localeKey: 'profile.memberSince', localeProps: { date: user.memberSince } }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardTitle>
            <CardAction>
              <Button
                size='md'
                variant='contained'
                buttonText={{ localeKey: 'profile.editProfile' }}
                onClick={() => router.push(`/${params?.lang}/profile/settings`)}
              />
            </CardAction>
            <CardDescription className='sr-only'>Profile overview</CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
              <div className='group rounded-xl border border-primary-100 dark:border-primary-700/50 p-6 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                <H6
                  className='text-2xl font-bold text-primary-800 dark:text-sage-400 mb-1'
                  stringProps={{ plainText: String(user.stats.totalBookings) }}
                />
                <P
                  i18nTFn={t}
                  className='text-gray-700 dark:[color:rgb(55_65_81)] font-medium'
                  stringProps={{ localeKey: 'profile.totalBookings' }}
                />
                <div className='mt-2 w-8 h-1 bg-teal-500 rounded-full' />
              </div>
              <div className='group rounded-xl border border-emerald-100 dark:border-emerald-700/50 p-6 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                <H6
                  className='text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1'
                  stringProps={{ plainText: String(user.stats.favorites) }}
                />
                <P
                  i18nTFn={t}
                  className='text-gray-700 dark:[color:rgb(55_65_81)] font-medium'
                  stringProps={{ localeKey: 'profile.favorites' }}
                />
                <div className='mt-2 w-8 h-1 bg-emerald-500 rounded-full' />
              </div>
              <div className='group rounded-xl border border-yellow-100 dark:border-yellow-700/50 p-6 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                <div className='flex items-center gap-2 mb-1'>
                  <H6
                    className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'
                    stringProps={{ plainText: String(user.stats.avgRating) }}
                  />
                  <KulIcon
                    icon='lucide:star'
                    iconClass='w-6 h-6 text-yellow-500 dark:text-yellow-400 group-hover:animate-pulse'
                  />
                </div>
                <P
                  i18nTFn={t}
                  className='text-gray-700 dark:[color:rgb(55_65_81)] font-medium'
                  stringProps={{ localeKey: 'profile.avgRating' }}
                />
                <div className='mt-2 w-8 h-1 bg-yellow-500 rounded-full' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Card */}
        <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-primary-100/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-600'>
          <CardHeader>
            <CardTitle>
              <H5
                i18nTFn={t}
                className='text-gray-900 dark:text-white'
                stringProps={{ localeKey: 'profile.bookings.title' }}
              />
            </CardTitle>
            <CardDescription className='w-full'>
              <div className='mt-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl grid grid-cols-2 gap-1 touch-manipulation'>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={
                    activeTab === 'upcoming'
                      ? 'bg-primary-700 text-white py-3 px-6 text-center font-semibold rounded-lg shadow-md transform scale-105 transition-all duration-300'
                      : 'text-gray-600 dark:text-gray-300 py-3 px-6 text-center font-medium hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-all duration-200'
                  }
                >
                  <P
                    i18nTFn={t}
                    className={activeTab === 'upcoming' ? 'text-white' : 'text-gray-700 dark:[color:rgb(55_65_81)]'}
                    stringProps={{
                      localeKey: 'profile.bookings.upcomingWithCount',
                      localeProps: { count: upcomingBookings.length }
                    }}
                  />
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={
                    activeTab === 'past'
                      ? 'bg-primary-700 text-white py-3 px-6 text-center font-semibold rounded-lg shadow-md transform scale-105 transition-all duration-300'
                      : 'text-gray-600 dark:text-gray-300 py-3 px-6 text-center font-medium hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-all duration-200'
                  }
                >
                  <P
                    i18nTFn={t}
                    className={activeTab === 'past' ? 'text-white' : 'text-gray-700 dark:[color:rgb(55_65_81)]'}
                    stringProps={{
                      localeKey: 'profile.bookings.pastWithCount',
                      localeProps: { count: pastBookings.length }
                    }}
                  />
                </button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((b, index) => (
              <div
                key={b.id}
                className={`group border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 flex gap-4 items-start bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className='w-20 h-20 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900/50 flex-shrink-0 relative shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105'>
                  <BaseImage src={b.image} alt={b.business} className='object-cover w-full h-full' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-4'>
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
                      <P stringProps={{ plainText: b.date }} />
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
                      <Strong stringProps={{ plainText: '£' }} />
                      <P stringProps={{ plainText: String(b.price) }} />
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
            ))}
            {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
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
