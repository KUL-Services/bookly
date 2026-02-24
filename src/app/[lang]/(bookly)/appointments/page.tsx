'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  Star,
  CircleX,
  RotateCcw,
  ArrowUpRight,
  MessageSquareText,
  CalendarDays,
  History,
  Sparkles,
  Loader2,
  PhoneCall,
  Info
} from 'lucide-react'

import { BookingService } from '@/lib/api/services/booking.service'
import { ReviewsService } from '@/lib/api/services/reviews.service'
import type { Booking } from '@/lib/api/types'
import { format, parseISO, isPast } from 'date-fns'

// Mock data for favourites (no API endpoint exists)
import { mockBusinesses } from '@/bookly/data/mock-data'

type TabType = 'upcoming' | 'past' | 'favourites'

const favouriteBusinesses = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    category: 'Hair Salon',
    rating: 4.9,
    reviewCount: 234,
    image: mockBusinesses[0]?.coverImage || '',
    address: '123 Beauty Lane, Cairo'
  },
  {
    id: '3',
    name: 'Zen Spa & Wellness',
    category: 'Spa & Massage',
    rating: 4.8,
    reviewCount: 189,
    image: mockBusinesses[2]?.coverImage || mockBusinesses[0]?.coverImage || '',
    address: '789 Wellness Ave, Cairo'
  },
  {
    id: '2',
    name: 'Glow Beauty Lounge',
    category: 'Beauty Salon',
    rating: 4.7,
    reviewCount: 156,
    image: mockBusinesses[1]?.coverImage || mockBusinesses[0]?.coverImage || '',
    address: '555 Glow Street, Cairo'
  }
]

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang || 'en'

  // Cancel Confirmation Modal State
  const [cancelConfirmBooking, setCancelConfirmBooking] = useState<Booking | null>(null)

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Fetch user bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await BookingService.getUserBookings()
        if (result.data && Array.isArray(result.data)) {
          setBookings(result.data)
        } else {
          setBookings([])
          if (result.error) setError(result.error)
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError('Failed to load appointments')
        setBookings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Split bookings into upcoming and past
  const { upcomingBookings, pastBookings } = useMemo(() => {
    const upcoming: Booking[] = []
    const past: Booking[] = []

    bookings.forEach(booking => {
      const bookingDate = parseISO(booking.startTime)
      if (
        isPast(bookingDate) ||
        booking.status === 'COMPLETED' ||
        booking.status === 'CANCELLED' ||
        booking.status === 'NO_SHOW'
      ) {
        past.push(booking)
      } else {
        upcoming.push(booking)
      }
    })

    // Sort upcoming by date ascending, past by date descending
    upcoming.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
    past.sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime())

    return { upcomingBookings: upcoming, pastBookings: past }
  }, [bookings])

  const handleConfirmCancel = async () => {
    if (!cancelConfirmBooking || cancellingId) return
    const bookingId = cancelConfirmBooking.id
    setCancelConfirmBooking(null)
    setCancellingId(bookingId)
    try {
      const result = await BookingService.cancelBooking(bookingId)
      if (result.data) {
        setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b)))
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err)
    } finally {
      setCancellingId(null)
    }
  }

  const handleOpenReview = (booking: Booking) => {
    setSelectedBooking(booking)
    setRating(0)
    setComment('')
    setIsReviewOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedBooking || rating === 0) return

    setIsSubmittingReview(true)
    try {
      await ReviewsService.createReview({
        businessId: selectedBooking.branch?.businessId || 'unknown', // Ideally from booking relation
        serviceId: selectedBooking.serviceId,
        bookingId: selectedBooking.id,
        rating,
        comment
      })
      // Success
      setIsReviewOpen(false)
      // Maybe show success toast?
    } catch (err) {
      console.error('Failed to submit review', err)
      // Show error?
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'COMPLETED':
        return 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
      case 'NO_SHOW':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      default:
        return 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
    }
  }

  const formatBookingDate = (isoDate: string) => {
    try {
      return format(parseISO(isoDate), 'EEEE, MMMM d, yyyy')
    } catch {
      return isoDate
    }
  }

  const formatBookingTime = (isoDate: string) => {
    try {
      return format(parseISO(isoDate), 'h:mm a')
    } catch {
      return ''
    }
  }

  const tabs = useMemo(
    () => [
      { id: 'upcoming' as const, label: 'Upcoming', count: upcomingBookings.length, icon: CalendarDays },
      { id: 'past' as const, label: 'Past', count: pastBookings.length, icon: History },
      { id: 'favourites' as const, label: 'Favourites', count: favouriteBusinesses.length, icon: Heart }
    ],
    [upcomingBookings.length, pastBookings.length]
  )

  const renderBookingCard = (booking: Booking, type: 'upcoming' | 'past') => (
    <div
      key={booking.id}
      className={`overflow-hidden rounded-3xl border ${
        type === 'upcoming'
          ? 'border-[#0a2c24]/10 dark:border-white/10 shadow-[0_12px_30px_rgba(10,44,36,0.08)]'
          : 'border-gray-100 dark:border-white/10'
      } bg-white dark:bg-[#122823]`}
    >
      <div className='px-4 pt-4 pb-3'>
        <div className='flex gap-3.5'>
          <div className='h-20 w-20 rounded-2xl bg-[#0a2c24]/5 dark:bg-[#77b6a3]/10 flex items-center justify-center flex-shrink-0'>
            <CalendarDays className='w-8 h-8 text-[#0a2c24]/30 dark:text-[#77b6a3]/30' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0'>
                <h3 className='truncate text-lg font-bold text-gray-900 dark:text-white'>
                  {booking.service?.name || 'Service'}
                </h3>
                <p className='truncate text-sm text-gray-600 dark:text-gray-300'>{booking.branch?.name || 'Branch'}</p>
                {booking.resource && (
                  <p className='text-xs text-gray-500 dark:text-gray-400'>with {booking.resource.name}</p>
                )}
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}
              >
                {booking.status}
              </span>
            </div>

            <div className='mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-300'>
              <div className='inline-flex items-center gap-1.5'>
                <Calendar className='h-4 w-4 text-gray-400' />
                <span>{formatBookingDate(booking.startTime)}</span>
              </div>
              <div className='inline-flex items-center gap-1.5'>
                <Clock className='h-4 w-4 text-gray-400' />
                <span>
                  {formatBookingTime(booking.startTime)}
                  {booking.endTime && ` - ${formatBookingTime(booking.endTime)}`}
                  {booking.service?.duration && ` (${booking.service.duration} min)`}
                </span>
              </div>
              {booking.branch?.address && (
                <div className='inline-flex items-center gap-1.5'>
                  <MapPin className='h-4 w-4 text-gray-400' />
                  <span className='truncate'>{booking.branch.address}</span>
                </div>
              )}
            </div>

            {booking.service?.price && (
              <div className='mt-2 text-base font-bold text-[#0a2c24] dark:text-[#77b6a3]'>
                EGP {booking.service.price}
              </div>
            )}
          </div>
        </div>

        {booking.notes && (
          <div className='mt-3 rounded-xl bg-gray-50 dark:bg-white/5 p-3 text-sm'>
            <span className='font-semibold text-gray-700 dark:text-gray-200'>Notes: </span>
            <span className='text-gray-600 dark:text-gray-300'>{booking.notes}</span>
          </div>
        )}
      </div>

      {type === 'upcoming' && booking.status !== 'CANCELLED' ? (
        <div className='border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 p-3 space-y-2'>
          {/* Cancel deadline hint */}
          {booking.cancelDeadlineHours != null && booking.cancelCutoffTime && (
            <div className='flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
              <Info className='h-3.5 w-3.5 shrink-0' />
              <span>
                Must cancel {booking.cancelDeadlineHours}h before &mdash; cancellable until{' '}
                {format(parseISO(booking.cancelCutoffTime), 'MMM d \'at\' h:mm a')}
              </span>
            </div>
          )}

          <div className='grid grid-cols-2 gap-2'>
            <button
              onClick={() => {
                const businessId = booking.branch?.businessId || booking.service?.businessId
                if (businessId) {
                  router.push(`/${lang}/business/${businessId}`)
                }
              }}
              className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#0a2c24]/20 dark:border-white/20 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-[#0a2c24] dark:text-[#77b6a3]'
            >
              <ArrowUpRight className='h-4 w-4' />
              View
            </button>
            {/* Reschedule button commented out until feature is ready */}
            {/* <button
              type='button'
              className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200'
            >
              <CalendarClock className='h-4 w-4' />
              Reschedule
            </button> */}
            {booking.cancellationDisabled ? (
              <div className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400'>
                <PhoneCall className='h-4 w-4' />
                Call to Cancel
              </div>
            ) : booking.canCancel !== false ? (
              <button
                type='button'
                onClick={() => setCancelConfirmBooking(booking)}
                disabled={cancellingId === booking.id}
                className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/35 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 disabled:opacity-50'
              >
                {cancellingId === booking.id ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <CircleX className='h-4 w-4' />
                )}
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : type === 'past' ? (
        <div className='grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 p-3'>
          <button
            onClick={() => router.push(`/${lang}/search`)}
            className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] text-xs sm:text-sm font-semibold text-white dark:text-[#0a2c24]'
          >
            <RotateCcw className='h-4 w-4' />
            Book Again
          </button>
          <button
            onClick={() => handleOpenReview(booking)}
            className='inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#0a2c24]/20 dark:border-white/20 bg-white dark:bg-white/10 text-xs sm:text-sm font-medium text-[#0a2c24] dark:text-[#77b6a3]'
          >
            <MessageSquareText className='h-4 w-4' />
            Leave Review
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0f1f1b] pb-[calc(var(--mobile-bottom-nav-offset)+16px)] lg:pb-10'>
      <div className='sticky top-0 z-30 border-b border-gray-100/90 dark:border-white/10 bg-white/95 dark:bg-[#1a2e35]/90 backdrop-blur-md'>
        <div className='mx-auto max-w-4xl px-4 pt-4 pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl font-bold text-gray-900 dark:text-white'>My Appointments</h1>
              <p className='text-xs text-gray-500 dark:text-gray-400 lg:hidden'>
                Manage upcoming, past, and favourites
              </p>
            </div>
            <div className='hidden lg:inline-flex items-center gap-1 rounded-full bg-[#0a2c24]/6 dark:bg-white/10 px-3 py-1.5 text-xs font-medium text-[#0a2c24] dark:text-[#77b6a3]'>
              <Sparkles className='h-3.5 w-3.5' />
              Live appointments
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
        {/* Loading state */}
        {isLoading && (activeTab === 'upcoming' || activeTab === 'past') && (
          <div className='flex flex-col items-center justify-center py-16'>
            <Loader2 className='h-8 w-8 text-[#0a2c24] dark:text-[#77b6a3] animate-spin mb-3' />
            <p className='text-sm text-gray-500 dark:text-gray-400'>Loading your appointments...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (activeTab === 'upcoming' || activeTab === 'past') && (
          <div className='rounded-3xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 px-6 py-6 text-center'>
            <p className='text-sm text-amber-700 dark:text-amber-400'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-3 text-sm font-semibold text-[#0a2c24] dark:text-[#77b6a3] underline'
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === 'upcoming' && !isLoading && !error && (
          <div className='space-y-4'>
            {upcomingBookings.length === 0 ? (
              <div className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-10 text-center'>
                <Calendar className='mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>No upcoming appointments</h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Book your next appointment to see it here
                </p>
                <button
                  onClick={() => router.push(`/${lang}/search`)}
                  className='mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] px-5 py-2.5 text-sm font-semibold text-white dark:text-[#0a2c24]'
                >
                  Explore Services
                  <ArrowUpRight className='h-4 w-4' />
                </button>
              </div>
            ) : (
              upcomingBookings.map(booking => renderBookingCard(booking, 'upcoming'))
            )}
          </div>
        )}

        {activeTab === 'past' && !isLoading && !error && (
          <div className='space-y-4'>
            {pastBookings.length === 0 ? (
              <div className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-10 text-center'>
                <History className='mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>No past appointments</h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Completed bookings will appear here</p>
              </div>
            ) : (
              pastBookings.map(booking => renderBookingCard(booking, 'past'))
            )}
          </div>
        )}

        {activeTab === 'favourites' && (
          <div className='space-y-4'>
            {favouriteBusinesses.length === 0 ? (
              <div className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-10 text-center'>
                <Heart className='mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>No favourites yet</h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Save businesses you love for quick booking
                </p>
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
                            <h3 className='truncate text-lg font-bold text-gray-900 dark:text-white'>
                              {business.name}
                            </h3>
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

      {/* Cancel Confirmation Modal */}
      {cancelConfirmBooking && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-sm bg-white dark:bg-[#122823] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10'>
            <div className='p-6'>
              <div className='flex flex-col items-center text-center mb-5'>
                <div className='mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                  <CircleX className='h-7 w-7 text-red-600 dark:text-red-400' />
                </div>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Cancel Appointment?</h3>
                <p className='mt-1.5 text-sm text-gray-500 dark:text-gray-400'>
                  Are you sure you want to cancel{' '}
                  <span className='font-semibold text-gray-700 dark:text-gray-200'>
                    {cancelConfirmBooking.service?.name}
                  </span>{' '}
                  on{' '}
                  <span className='font-semibold text-gray-700 dark:text-gray-200'>
                    {format(parseISO(cancelConfirmBooking.startTime), 'MMM d \'at\' h:mm a')}
                  </span>
                  ? This cannot be undone.
                </p>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={() => setCancelConfirmBooking(null)}
                  className='h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-200'
                >
                  Keep It
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className='h-11 rounded-xl bg-red-600 dark:bg-red-500 text-sm font-semibold text-white'
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewOpen && selectedBooking && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-md bg-white dark:bg-[#122823] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Write a Review</h3>
                <button
                  onClick={() => setIsReviewOpen(false)}
                  className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500'
                >
                  <CircleX className='w-6 h-6' />
                </button>
              </div>

              <div className='mb-6'>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>How was your experience with</p>
                <p className='text-lg font-semibold text-[#0a2c24] dark:text-[#77b6a3]'>
                  {selectedBooking.service?.name} at {selectedBooking.branch?.name}
                </p>
              </div>

              <div className='flex justify-center gap-2 mb-6'>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className='p-1 focus:outline-none transition-transform hover:scale-110'
                  >
                    <Star
                      className={`w-8 h-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  </button>
                ))}
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Your comments (optional)
                </label>
                <textarea
                  className='w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0a2c24] focus:border-transparent resize-none'
                  placeholder='Tell us about your experience...'
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={rating === 0 || isSubmittingReview}
                className='w-full py-3 rounded-xl bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
