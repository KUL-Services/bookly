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

function ProfilePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const params = useParams<{ lang: string }>()
  const router = useRouter()
  const booklyUser = useAuthStore(s => s.booklyUser)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (!hydrated) return
    if (!booklyUser) {
      router.replace(`/${params?.lang}/customer/login`)
    }
  }, [hydrated, booklyUser, params?.lang, router])
  const goBack = () => router.push(`/${params?.lang}/landpage`)

  // Mocked user and booking data
  const user = {
    name: 'Aly Lashin',
    email: 'aly@example.com',
    phone: '+44 7700 900456',
    memberSince: 'June 2023',
    stats: { totalBookings: 12, favorites: 2, avgRating: 4.8 }
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

  return (
    <div className='min-h-screen w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-teal-200/10 rounded-full blur-3xl animate-pulse animation-delay-1000' />
      </div>
      <div className='w-full max-w-4xl space-y-6 sm:space-y-8 relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between gap-3 sm:gap-2 animate-in fade-in slide-in-from-top-4 duration-700'>
          <button
            onClick={goBack}
            className='inline-flex items-center p-2 rounded-full text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-200 hover:scale-110 active:scale-95'
          >
            <KulIcon icon='lucide:chevron-left' iconClass='w-6 h-6' />
          </button>
          <H1
            i18nTFn={t}
            className='font-bold text-2xl sm:text-3xl bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent'
            stringProps={{ localeKey: 'profile.title' }}
          />
          <button
            onClick={() => {
              logoutCustomer()
              router.replace(`/${params?.lang}/customer/login`)
            }}
            className='px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium'
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <Card className='bg-white/80 backdrop-blur-sm shadow-xl border border-teal-100/50 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
          <CardHeader className='flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6'>
            <CardTitle>
              <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6'>
                <div className='relative group'>
                  <Avatar
                    size='5XL'
                    imageUrl='https://api.dicebear.com/9.x/initials/svg?seed=Aly%20Lashin'
                    alt={user.name}
                    avatarTitle={user.name}
                    className='ring-4 ring-teal-100 shadow-lg group-hover:ring-teal-200 transition-all duration-300'
                  />
                  <div className='absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse' />
                </div>
                <div className='text-center sm:text-left'>
                  <H4 className='text-gray-900 text-xl sm:text-2xl' stringProps={{ plainText: user.name }} />
                  <div className='mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-6 text-gray-600 space-y-1 sm:space-y-0'>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:mail' iconClass='w-4 h-4 text-gray-500' />
                      <P stringProps={{ plainText: user.email }} />
                    </div>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:phone' iconClass='w-4 h-4 text-gray-500' />
                      <P stringProps={{ plainText: user.phone }} />
                    </div>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:id-card' iconClass='w-4 h-4 text-gray-500' />
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
                onClick={() => alert('Edit profile clicked (mock)')}
              />
            </CardAction>
            <CardDescription className='sr-only'>Profile overview</CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
              <div className='group rounded-xl border border-teal-100 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                <H6 className='text-2xl font-bold text-teal-600 mb-1' stringProps={{ plainText: String(user.stats.totalBookings) }} />
                <P i18nTFn={t} className='text-gray-700 font-medium' stringProps={{ localeKey: 'profile.totalBookings' }} />
                <div className='mt-2 w-8 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full' />
              </div>
              <div className='group rounded-xl border border-emerald-100 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                <H6 className='text-2xl font-bold text-emerald-600 mb-1' stringProps={{ plainText: String(user.stats.favorites) }} />
                <P i18nTFn={t} className='text-gray-700 font-medium' stringProps={{ localeKey: 'profile.favorites' }} />
                <div className='mt-2 w-8 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full' />
              </div>
              <div className='group rounded-xl border border-yellow-100 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                <div className='flex items-center gap-2 mb-1'>
                  <H6 className='text-2xl font-bold text-yellow-600' stringProps={{ plainText: String(user.stats.avgRating) }} />
                  <KulIcon icon='lucide:star' iconClass='w-6 h-6 text-yellow-500 group-hover:animate-pulse' />
                </div>
                <P i18nTFn={t} className='text-gray-700 font-medium' stringProps={{ localeKey: 'profile.avgRating' }} />
                <div className='mt-2 w-8 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Card */}
        <Card className='bg-white/80 backdrop-blur-sm shadow-xl border border-teal-100/50 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-600'>
          <CardHeader>
            <CardTitle>
              <H5 i18nTFn={t} className='text-gray-900' stringProps={{ localeKey: 'profile.bookings.title' }} />
            </CardTitle>
            <CardDescription className='w-full'>
              <div className='mt-4 p-1 bg-gray-100 rounded-xl grid grid-cols-2 gap-1 touch-manipulation'>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={
                    activeTab === 'upcoming'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-6 text-center font-semibold rounded-lg shadow-md transform scale-105 transition-all duration-300'
                      : 'text-gray-600 py-3 px-6 text-center font-medium hover:bg-white/50 rounded-lg transition-all duration-200'
                  }
                >
                  <P
                    i18nTFn={t}
                    className={activeTab === 'upcoming' ? 'text-white' : 'text-gray-700'}
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
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-6 text-center font-semibold rounded-lg shadow-md transform scale-105 transition-all duration-300'
                      : 'text-gray-600 py-3 px-6 text-center font-medium hover:bg-white/50 rounded-lg transition-all duration-200'
                  }
                >
                  <P
                    i18nTFn={t}
                    className={activeTab === 'past' ? 'text-white' : 'text-gray-700'}
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
              <div key={b.id} className={`group border border-gray-200/50 rounded-xl p-6 flex gap-4 items-start bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className='w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100 flex-shrink-0 relative shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105'>
                  <BaseImage src={b.image} alt={b.business} className='object-cover w-full h-full' />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <H6 className='text-gray-900' stringProps={{ plainText: b.business }} />
                      <P className='text-gray-600' stringProps={{ plainText: b.service }} />
                      <P
                        className='text-gray-600'
                        i18nTFn={t}
                        stringProps={{ localeKey: 'profile.bookings.withStaff', localeProps: { staff: b.staff } }}
                      />
                    </div>
                    {b.status === 'confirmed' && (
                      <span className='inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-xs font-medium px-2 py-1'>
                        <span className='h-2 w-2 rounded-full bg-green-600' />
                        {t('profile.bookings.confirmed')}
                      </span>
                    )}
                    {b.status === 'completed' && (
                      <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1'>
                        <span className='h-2 w-2 rounded-full bg-slate-600' />
                        {t('profile.bookings.completed')}
                      </span>
                    )}
                    {b.status === 'canceled' && (
                      <span className='inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 text-xs font-medium px-2 py-1'>
                        <span className='h-2 w-2 rounded-full bg-red-600' />
                        {t('profile.bookings.canceled')}
                      </span>
                    )}
                  </div>
                  <div className='mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:calendar' iconClass='w-4 h-4 text-gray-500' />
                      <P stringProps={{ plainText: b.date }} />
                    </div>
                    <div className='flex items-center gap-2'>
                      <KulIcon icon='lucide:clock' iconClass='w-4 h-4 text-gray-500' />
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
                        />
                        <Button variant='text' size='md' buttonText={{ localeKey: 'profile.bookings.cancel' }} />
                      </>
                    ) : (
                      <>
                        <Button
                          variant='outlined'
                          size='md'
                          buttonText={{ localeKey: 'profile.bookings.viewBusiness' }}
                        />
                        <Button variant='text' size='md' buttonText={{ localeKey: 'profile.bookings.rebook' }} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
              <div className='text-center py-6 text-gray-600'>
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
