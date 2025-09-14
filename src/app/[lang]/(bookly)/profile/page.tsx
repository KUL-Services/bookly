'use client'

import { useState } from 'react'
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

function ProfilePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const params = useParams<{ lang: string }>()
  const router = useRouter()
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

  return (
    <div
      className='min-h-screen w-full px-4 md:px-6 py-8 flex flex-col items-center'
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className='w-full max-w-4xl space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-2 text-teal-600'>
          <button onClick={goBack} className='inline-flex items-center text-teal-600 hover:text-teal-700'>
            <KulIcon icon='lucide:chevron-left' iconClass='w-5 h-5' />
          </button>
          <H1 i18nTFn={t} className='font-bold' stringProps={{ localeKey: 'profile.title' }} />
        </div>

        {/* Profile Card */}
        <Card className='bg-white shadow-sm border border-gray-200'>
          <CardHeader className='flex flex-row items-start gap-4'>
            <CardTitle>
              <div className='flex items-center gap-4'>
                <Avatar
                  size='5XL'
                  imageUrl='https://api.dicebear.com/9.x/initials/svg?seed=Aly%20Lashin'
                  alt={user.name}
                  avatarTitle={user.name}
                />
                <div>
                  <H4 className='text-gray-900' stringProps={{ plainText: user.name }} />
                  <div className='mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-6 text-gray-600'>
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
            <div className='mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='rounded-lg border border-gray-200 p-4 bg-gray-50'>
                <H6 className='text-teal-600' stringProps={{ plainText: String(user.stats.totalBookings) }} />
                <P i18nTFn={t} className='text-gray-600' stringProps={{ localeKey: 'profile.totalBookings' }} />
              </div>
              <div className='rounded-lg border border-gray-200 p-4 bg-gray-50'>
                <H6 className='text-teal-600' stringProps={{ plainText: String(user.stats.favorites) }} />
                <P i18nTFn={t} className='text-gray-600' stringProps={{ localeKey: 'profile.favorites' }} />
              </div>
              <div className='rounded-lg border border-gray-200 p-4 bg-gray-50'>
                <div className='flex items-center gap-1'>
                  <H6 className='text-teal-600' stringProps={{ plainText: String(user.stats.avgRating) }} />
                  <KulIcon icon='lucide:star' iconClass='w-4 h-4 text-yellow-500' />
                </div>
                <P i18nTFn={t} className='text-gray-600' stringProps={{ localeKey: 'profile.avgRating' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Card */}
        <Card className='bg-white shadow-sm border border-gray-200'>
          <CardHeader>
            <CardTitle>
              <H5 i18nTFn={t} className='text-gray-900' stringProps={{ localeKey: 'profile.bookings.title' }} />
            </CardTitle>
            <CardDescription className='w-full'>
              <div className='mt-2 grid grid-cols-2 rounded-md overflow-hidden border border-gray-200'>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={
                    activeTab === 'upcoming'
                      ? 'bg-teal-600 text-white py-2 text-center font-medium'
                      : 'bg-gray-100 text-gray-600 py-2 text-center font-medium hover:bg-gray-200'
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
                      ? 'bg-teal-600 text-white py-2 text-center font-medium'
                      : 'bg-gray-100 text-gray-600 py-2 text-center font-medium hover:bg-gray-200'
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
            {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(b => (
              <div key={b.id} className='border border-gray-200 rounded-lg p-4 flex gap-4 items-start bg-white'>
                <div className='w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative'>
                  <BaseImage src={b.image} alt={b.business} />
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
