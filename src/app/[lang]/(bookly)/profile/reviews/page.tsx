'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { ArrowLeft, ArrowUpRight, MapPin, MessageSquareText, Star } from 'lucide-react'

import { PageLoader } from '@/components/LoadingStates'
import { ReviewsService } from '@/lib/api/services/reviews.service'
import { useAuthStore } from '@/stores/auth.store'
import type { Review } from '@/lib/api/types'

type FilterType = 'all' | 'five' | 'fourPlus'

export default function ProfileReviewsPage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang || 'en'
  const booklyUser = useAuthStore(s => s.booklyUser)

  const [hydrated, setHydrated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (!hydrated) return

    if (!booklyUser) {
      router.push(`/${lang}/customer/login`)
      return
    }

    ReviewsService.getUserReviews()
      .then(res => {
        if (res.data) setReviews(res.data)
      })
      .catch(() => {
        // silently fail — empty state is fine
      })
      .finally(() => setLoading(false))
  }, [hydrated, booklyUser, lang, router])

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'five') return reviews.filter(r => Number(r.rating) === 5)
    if (activeFilter === 'fourPlus') return reviews.filter(r => Number(r.rating) >= 4)
    return reviews
  }, [activeFilter, reviews])

  const averageRating = useMemo(() => {
    if (!reviews.length) return '0.0'
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  if (!hydrated || loading) {
    return (
      <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0f1f1b]'>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0f1f1b] pb-[calc(var(--mobile-bottom-nav-offset)+16px)] lg:pb-10'>
      <div className='sticky top-0 z-30 border-b border-gray-100/90 dark:border-white/10 bg-white/95 dark:bg-[#1a2e35]/90 backdrop-blur-md'>
        <div className='mx-auto max-w-4xl px-4 py-3.5'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.push(`/${lang}/profile`)}
              className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#0a2c24]/10 dark:border-white/15 bg-white dark:bg-white/10 text-[#0a2c24] dark:text-white transition-all active:scale-95'
              aria-label='Back to profile'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <div className='min-w-0 flex-1'>
              <h1 className='text-xl font-bold text-gray-900 dark:text-white'>My Reviews</h1>
              <p className='truncate text-xs text-gray-500 dark:text-gray-400'>Reviews you shared across businesses</p>
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-4xl space-y-4 px-4 py-5 lg:py-7'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#122823] p-4'>
            <div className='inline-flex items-center gap-2 text-[#0a2c24] dark:text-[#77b6a3]'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm font-medium'>Average Rating</span>
            </div>
            <p className='mt-2 text-2xl font-bold text-gray-900 dark:text-white'>{averageRating}</p>
          </div>

          <div className='rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#122823] p-4'>
            <div className='inline-flex items-center gap-2 text-[#0a2c24] dark:text-[#77b6a3]'>
              <MessageSquareText className='h-4 w-4' />
              <span className='text-sm font-medium'>Total Reviews</span>
            </div>
            <p className='mt-2 text-2xl font-bold text-gray-900 dark:text-white'>{reviews.length}</p>
          </div>
        </div>

        <div className='rounded-2xl border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#122823] p-1'>
          <div className='grid grid-cols-3 gap-1'>
            <button
              type='button'
              onClick={() => setActiveFilter('all')}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24]'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-[#0a2c24]/5 dark:hover:bg-white/5'
              }`}
            >
              All
            </button>
            <button
              type='button'
              onClick={() => setActiveFilter('five')}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                activeFilter === 'five'
                  ? 'bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24]'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-[#0a2c24]/5 dark:hover:bg-white/5'
              }`}
            >
              5 Stars
            </button>
            <button
              type='button'
              onClick={() => setActiveFilter('fourPlus')}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                activeFilter === 'fourPlus'
                  ? 'bg-[#0a2c24] text-white dark:bg-[#77b6a3] dark:text-[#0a2c24]'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-[#0a2c24]/5 dark:hover:bg-white/5'
              }`}
            >
              4+ Stars
            </button>
          </div>
        </div>

        {filteredReviews.length > 0 ? (
          <div className='space-y-3'>
            {filteredReviews.map(review => {
              const authorName = review.user
                ? `${review.user.firstName} ${review.user.lastName}`.trim()
                : 'You'
              const authorInitial = authorName.charAt(0).toUpperCase()
              const reviewDate = new Date(review.createdAt)

              return (
                <article
                  key={review.id}
                  className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#122823] p-4 shadow-[0_10px_24px_rgba(10,44,36,0.07)]'
                >
                  <div className='flex items-start gap-3'>
                    <div className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300'>
                      {authorInitial}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <h3 className='truncate text-base font-semibold text-gray-900 dark:text-white'>
                            {authorName}
                          </h3>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            {reviewDate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className='inline-flex items-center gap-0.5'>
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < Number(review.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.comment && (
                        <p className='mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200'>
                          {review.comment}
                        </p>
                      )}

                      {(review.service?.name || review.business) && (
                        <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
                          {review.service?.name && (
                            <div className='inline-flex min-w-0 items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
                              <MapPin className='h-3.5 w-3.5 shrink-0' />
                              <span className='truncate'>{review.service.name}</span>
                            </div>
                          )}

                          {review.business && (
                            <button
                              onClick={() => router.push(`/${lang}/business/${review.business!.id}`)}
                              className='inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-[#0a2c24]/20 dark:border-white/20 bg-white dark:bg-white/10 px-2.5 text-xs font-medium text-[#0a2c24] dark:text-[#77b6a3] transition-all hover:bg-gray-50 dark:hover:bg-white/15 active:scale-95'
                            >
                              {review.business.logo ? (
                                <img
                                  src={review.business.logo}
                                  alt={review.business.name}
                                  className='h-5 w-5 rounded-full object-cover'
                                />
                              ) : (
                                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-[#0a2c24]/10 dark:bg-white/20 text-[8px] font-bold text-[#0a2c24] dark:text-white'>
                                  {review.business.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className='truncate max-w-[120px]'>{review.business.name}</span>
                              <ArrowUpRight className='h-3.5 w-3.5 shrink-0' />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className='rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#122823] px-6 py-10 text-center'>
            <MessageSquareText className='mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {activeFilter === 'all' ? 'No reviews yet' : 'No reviews in this filter'}
            </h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {activeFilter === 'all'
                ? 'Your reviews will appear here after you complete bookings.'
                : 'Try another filter to see your reviews.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
