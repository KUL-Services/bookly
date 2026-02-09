'use client'

import { useMemo, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  Star,
  CalendarClock,
  CircleX,
  RotateCcw,
  ArrowUpRight,
  MessageSquareText,
  CalendarDays,
  History,
  Sparkles
} from 'lucide-react'

import { mockBusinesses } from '@/bookly/data/mock-data'

const mockData = mockBusinesses[0]

type TabType = 'upcoming' | 'past' | 'favourites'

const upcomingBookings = [
  {
    id: 1,
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    service: 'Haircut & Style',
    provider: 'Emma Johnson',
    date: 'Saturday, February 14, 2026',
    time: '2:00 PM',
    duration: '60 min',
    price: 'EGP 650',
    status: 'Confirmed',
    notes: 'Please trim split ends and add light layers',
    image: mockData.galleryImages[1],
    address: '123 Beauty Lane, Cairo'
  },
  {
    id: 2,
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    service: 'Gel Manicure',
    provider: 'Lisa Chen',
    date: 'Tuesday, February 17, 2026',
    time: '11:00 AM',
    duration: '45 min',
    price: 'EGP 350',
    status: 'Confirmed',
    notes: '',
    image: mockData.galleryImages[2],
    address: '456 Style Street, Cairo'
  }
]

const pastBookings = [
  {
    id: 3,
    businessId: '3',
    businessName: 'Zen Spa & Wellness',
    service: 'Deep Tissue Massage',
    provider: 'Michael Brown',
    date: 'Friday, January 17, 2026',
    time: '3:00 PM',
    duration: '90 min',
    price: 'EGP 850',
    status: 'Completed',
    rating: 5,
    image: mockBusinesses[2]?.galleryImages?.[1] || mockData.coverImage,
    address: '789 Wellness Ave, Cairo'
  },
  {
    id: 4,
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    service: 'Color Refresh',
    provider: 'Emma Johnson',
    date: 'Wednesday, January 8, 2026',
    time: '1:30 PM',
    duration: '75 min',
    price: 'EGP 780',
    status: 'Completed',
    image: mockData.coverImage,
    address: '123 Beauty Lane, Cairo'
  }
]

const favouriteBusinesses = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    category: 'Hair Salon',
    rating: 4.9,
    reviewCount: 234,
    image: mockData.coverImage,
    address: '123 Beauty Lane, Cairo'
  },
  {
    id: '3',
    name: 'Zen Spa & Wellness',
    category: 'Spa & Massage',
    rating: 4.8,
    reviewCount: 189,
    image: mockBusinesses[2]?.coverImage || mockData.coverImage,
    address: '789 Wellness Ave, Cairo'
  },
  {
    id: '2',
    name: 'Glow Beauty Lounge',
    category: 'Beauty Salon',
    rating: 4.7,
    reviewCount: 156,
    image: mockBusinesses[1]?.coverImage || mockData.coverImage,
    address: '555 Glow Street, Cairo'
  }
]

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang || 'en'

  const tabs = useMemo(
    () => [
      { id: 'upcoming' as const, label: 'Upcoming', count: upcomingBookings.length, icon: CalendarDays },
      { id: 'past' as const, label: 'Past', count: pastBookings.length, icon: History },
      { id: 'favourites' as const, label: 'Favourites', count: favouriteBusinesses.length, icon: Heart }
    ],
    []
  )

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0f1f1b] pb-[calc(var(--mobile-bottom-nav-offset)+16px)] lg:pb-10'>
      <div className='sticky top-0 z-30 border-b border-gray-100/90 dark:border-white/10 bg-white/95 dark:bg-[#1a2e35]/90 backdrop-blur-md'>
        <div className='mx-auto max-w-4xl px-4 pt-4 pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl font-bold text-gray-900 dark:text-white'>My Appointments</h1>
              <p className='text-xs text-gray-500 dark:text-gray-400 lg:hidden'>Manage upcoming, past, and favourites</p>
            </div>
            <div className='hidden lg:inline-flex items-center gap-1 rounded-full bg-[#0a2c24]/6 dark:bg-white/10 px-3 py-1.5 text-xs font-medium text-[#0a2c24] dark:text-[#77b6a3]'>
              <Sparkles className='h-3.5 w-3.5' />
              Mobile-friendly refresh
            </div>
          </div>

          <div className='mt-3 rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#122823] p-1'>
            <div className='grid grid-cols-3 gap-1'>
              {tabs.map(tab => {
                const active = activeTab === tab.id
                const Icon = tab.icon

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-xl px-2 py-2 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                      active
                        ? 'bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24] shadow'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-[#0a2c24]/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className='inline-flex items-center justify-center gap-1.5'>
                      <Icon className='h-4 w-4' />
                      <span>
                        {tab.label} ({tab.count})
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-4xl px-4 py-5 lg:py-7'>
        {activeTab === 'upcoming' && (
          <div className='space-y-4'>
            {upcomingBookings.length === 0 ? (
              <div className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-10 text-center'>
                <Calendar className='mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>No upcoming appointments</h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Book your next appointment to see it here</p>
                <button
                  onClick={() => router.push(`/${lang}/search`)}
                  className='mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] px-5 py-2.5 text-sm font-semibold text-white dark:text-[#0a2c24]'
                >
                  Explore Services
                  <ArrowUpRight className='h-4 w-4' />
                </button>
              </div>
            ) : (
              upcomingBookings.map(booking => (
                <div
                  key={booking.id}
                  className='overflow-hidden rounded-3xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#122823] shadow-[0_12px_30px_rgba(10,44,36,0.08)]'
                >
                  <div className='px-4 pt-4 pb-3'>
                    <div className='flex gap-3.5'>
                      <img
                        src={booking.image}
                        alt={booking.businessName}
                        className='h-20 w-20 rounded-2xl object-cover flex-shrink-0'
                      />
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0'>
                            <h3 className='truncate text-lg font-bold text-gray-900 dark:text-white'>{booking.businessName}</h3>
                            <p className='truncate text-sm text-gray-600 dark:text-gray-300'>{booking.service}</p>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>with {booking.provider}</p>
                          </div>
                          <span className='inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-green-400'>
                            {booking.status}
                          </span>
                        </div>

                        <div className='mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-300'>
                          <div className='inline-flex items-center gap-1.5'>
                            <Calendar className='h-4 w-4 text-gray-400' />
                            <span>{booking.date}</span>
                          </div>
                          <div className='inline-flex items-center gap-1.5'>
                            <Clock className='h-4 w-4 text-gray-400' />
                            <span>
                              {booking.time} ({booking.duration})
                            </span>
                          </div>
                          <div className='inline-flex items-center gap-1.5'>
                            <MapPin className='h-4 w-4 text-gray-400' />
                            <span className='truncate'>{booking.address}</span>
                          </div>
                        </div>

                        <div className='mt-2 text-base font-bold text-[#0a2c24] dark:text-[#77b6a3]'>{booking.price}</div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className='mt-3 rounded-xl bg-gray-50 dark:bg-white/5 p-3 text-sm'>
                        <span className='font-semibold text-gray-700 dark:text-gray-200'>Notes: </span>
                        <span className='text-gray-600 dark:text-gray-300'>{booking.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className='grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 p-3'>
                    <button
                      onClick={() => router.push(`/${lang}/business/${booking.businessId}`)}
                      className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#0a2c24]/20 dark:border-white/20 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-[#0a2c24] dark:text-[#77b6a3]'
                    >
                      <ArrowUpRight className='h-4 w-4' />
                      View
                    </button>
                    <button
                      type='button'
                      className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      <CalendarClock className='h-4 w-4' />
                      Reschedule
                    </button>
                    <button
                      type='button'
                      className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/35 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400'
                    >
                      <CircleX className='h-4 w-4' />
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className='space-y-4'>
            {pastBookings.length === 0 ? (
              <div className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-10 text-center'>
                <History className='mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>No past appointments</h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Completed bookings will appear here</p>
              </div>
            ) : (
              pastBookings.map(booking => (
                <div
                  key={booking.id}
                  className='overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#122823]'
                >
                  <div className='px-4 pt-4 pb-3'>
                    <div className='flex gap-3.5'>
                      <img
                        src={booking.image}
                        alt={booking.businessName}
                        className='h-20 w-20 rounded-2xl object-cover flex-shrink-0'
                      />
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0'>
                            <h3 className='truncate text-lg font-bold text-gray-900 dark:text-white'>{booking.businessName}</h3>
                            <p className='truncate text-sm text-gray-600 dark:text-gray-300'>{booking.service}</p>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>with {booking.provider}</p>
                          </div>
                          <span className='inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300'>
                            {booking.status}
                          </span>
                        </div>

                        <div className='mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-300'>
                          <div className='inline-flex items-center gap-1.5'>
                            <Calendar className='h-4 w-4 text-gray-400' />
                            <span>{booking.date}</span>
                          </div>
                          <div className='inline-flex items-center gap-1.5'>
                            <Clock className='h-4 w-4 text-gray-400' />
                            <span>
                              {booking.time} ({booking.duration})
                            </span>
                          </div>
                        </div>

                        <div className='mt-2 flex items-center justify-between gap-2'>
                          <span className='font-semibold text-gray-800 dark:text-gray-100'>{booking.price}</span>
                          {booking.rating ? (
                            <div className='inline-flex items-center gap-0.5'>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < booking.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 p-3'>
                    <button
                      onClick={() => router.push(`/${lang}/business/${booking.businessId}`)}
                      className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] text-xs sm:text-sm font-semibold text-white dark:text-[#0a2c24]'
                    >
                      <RotateCcw className='h-4 w-4' />
                      Book Again
                    </button>
                    <button
                      onClick={() => router.push(`/${lang}/profile/reviews`)}
                      className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#0a2c24]/20 dark:border-white/20 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-[#0a2c24] dark:text-[#77b6a3]'
                    >
                      <MessageSquareText className='h-4 w-4' />
                      {booking.rating ? 'View Review' : 'Leave Review'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'favourites' && (
          <div className='space-y-4'>
            {favouriteBusinesses.length === 0 ? (
              <div className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-10 text-center'>
                <Heart className='mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>No favourites yet</h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Save businesses you love for quick booking</p>
                <button
                  onClick={() => router.push(`/${lang}/search`)}
                  className='mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] px-5 py-2.5 text-sm font-semibold text-white dark:text-[#0a2c24]'
                >
                  Explore Businesses
                  <ArrowUpRight className='h-4 w-4' />
                </button>
              </div>
            ) : (
              favouriteBusinesses.map(business => (
                <div
                  key={business.id}
                  className='overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#122823]'
                >
                  <div className='px-4 pt-4 pb-3'>
                    <div className='flex gap-3.5'>
                      <img
                        src={business.image}
                        alt={business.name}
                        className='h-20 w-20 rounded-2xl object-cover flex-shrink-0'
                      />
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0'>
                            <h3 className='truncate text-lg font-bold text-gray-900 dark:text-white'>{business.name}</h3>
                            <p className='text-sm text-gray-600 dark:text-gray-300'>{business.category}</p>
                          </div>
                          <button
                            type='button'
                            className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/25 text-red-500'
                            aria-label='Remove favourite'
                          >
                            <Heart className='h-[18px] w-[18px] fill-current' />
                          </button>
                        </div>

                        <div className='mt-2 inline-flex items-center gap-1.5 text-sm'>
                          <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                          <span className='font-medium text-gray-900 dark:text-white'>{business.rating}</span>
                          <span className='text-gray-500 dark:text-gray-400'>({business.reviewCount} reviews)</span>
                        </div>

                        <div className='mt-2 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400'>
                          <MapPin className='h-4 w-4' />
                          <span className='truncate'>{business.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 p-3'>
                    <button
                      onClick={() => router.push(`/${lang}/business/${business.id}`)}
                      className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#0a2c24]/20 dark:border-white/20 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-[#0a2c24] dark:text-[#77b6a3]'
                    >
                      <ArrowUpRight className='h-4 w-4' />
                      View Business
                    </button>
                    <button
                      onClick={() => router.push(`/${lang}/business/${business.id}`)}
                      className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] text-xs sm:text-sm font-semibold text-white dark:text-[#0a2c24]'
                    >
                      <CalendarDays className='h-4 w-4' />
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
