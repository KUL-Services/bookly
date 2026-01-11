'use client'
import { H1, H2, H3, P } from '@/bookly/components/atoms'
import { Badge } from '@/bookly/components/atoms/base-badge/badge'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { Avatar, Button } from '@/bookly/components/molecules'
import { BranchDetailsModal } from '@/bookly/components/molecules/branch-details-modal/branch-details-modal.component'
import BookingModalV2Fixed from '@/bookly/components/organisms/booking-modal/booking-modal-v2-fixed'
import { Card, CardContent } from '@/bookly/components/ui/card'
import { mockBusinesses, mockReviews, mockServices } from '@/bookly/data/mock-data'
import { format } from 'date-fns'
import { Clock, Globe, MapPin, Phone, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { BusinessService, ServicesService, BranchesService, StaffService } from '@/lib/api'
import type { Business, Service as ApiService, Branch, Staff } from '@/lib/api'
import initTranslations from '@/app/i18n/i18n'
import { getBusinessWithDetails } from '@/mocks/businesses'

const getTabsWithTranslation = (t: any) => [
  { id: 'services', label: t('business.tabs.services') },
  { id: 'branches', label: t('business.tabs.branches') },
  { id: 'reviews', label: t('business.tabs.reviews') },
  { id: 'about', label: t('business.tabs.about') }
]

interface Review {
  authorName: string
  rating: number
  date: Date
  comment: string
  id?: string
  authorImage?: string
  businessId?: string
}

function businessDetailsPage() {
  const params = useParams<{ slug: string; lang: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [t, setT] = useState<any>(() => (key: string) => key)

  // Extract services, branches, and staff from business data
  const services = business?.services || []
  const branches = business?.branches || []
  const staff = branches.flatMap(branch => branch.staff || [])

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(params.lang || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [params.lang])

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching business data for ID:', params.slug)

        // Try to get business with full details from mock data first
        const mockBusinessData = getBusinessWithDetails(params.slug)

        if (mockBusinessData) {
          console.log('✅ Using mock business data with full details')
          // Convert BusinessLocation to Business type
          const business: Business = {
            id: mockBusinessData.id,
            name: mockBusinessData.name,
            email: mockBusinessData.email,
            description: mockBusinessData.description,
            approved: mockBusinessData.approved || true,
            rating: mockBusinessData.rating,
            socialLinks: mockBusinessData.socialLinks,
            services: mockBusinessData.services,
            branches: mockBusinessData.fullBranches || mockBusinessData.branches,
            reviews: mockBusinessData.reviews as any,
            logoUrl: mockBusinessData.logoUrl,
            coverImageUrl: mockBusinessData.coverImageUrl
          }
          setBusiness(business)
          setError(null)
          setLoading(false)
          return
        }

        // Fall back to API call
        const businessResponse = await BusinessService.getBusiness(params.slug)

        if (businessResponse.error) {
          throw new Error(businessResponse.error)
        }

        if (businessResponse.data) {
          console.log('✅ Business data received from API:', businessResponse.data)
          setBusiness(businessResponse.data)
        } else {
          throw new Error('No business data received')
        }
      } catch (err) {
        console.warn('Failed to fetch business data, using generic fallback:', err)

        // Generic fallback for unknown businesses
        const mockBusiness: Business = {
          id: params.slug,
          name: 'Demo Beauty Salon',
          email: 'demo@bookly.com',
          description: 'A modern beauty salon offering hair and spa services.',
          approved: true,
          rating: 4.8,
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com/bookly' },
            { platform: 'instagram', url: 'https://instagram.com/bookly' }
          ],
          services: [
            {
              id: 'service-1',
              name: 'Massage',
              description: 'Relaxing full body massage',
              location: 'Main Location',
              price: 20,
              duration: 60,
              businessId: params.slug,
              createdAt: '',
              updatedAt: ''
            },
            {
              id: 'service-2',
              name: 'Facial Treatment',
              description: 'Facial Treatment and Facial Skin Care',
              location: 'Main Location',
              price: 33,
              duration: 90,
              businessId: params.slug,
              createdAt: '',
              updatedAt: ''
            }
          ],
          branches: [
            {
              id: 'branch-1',
              name: 'Main Branch',
              address: 'Downtown Cairo, Egypt',
              mobile: '0232323232',
              businessId: params.slug,
              latitude: 30.0444,
              longitude: 31.2357,
              staff: [
                {
                  id: 'staff-1',
                  name: 'Staff Member 1',
                  mobile: '01010012212',
                  branchId: 'branch-1',
                  businessId: params.slug,
                  createdAt: '',
                  updatedAt: ''
                }
              ],
              createdAt: '',
              updatedAt: ''
            }
          ]
        }

        setBusiness(mockBusiness)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessData()
  }, [params.slug])

  const businessReview = (): Review[] => {
    if (!business?.reviews) return []

    // Convert API reviews to local Review format
    return business.reviews.map(review => ({
      id: review.id,
      authorName: review.user?.firstName + ' ' + review.user?.lastName || 'Anonymous',
      authorImage: undefined, // No avatar in API response
      rating: review.rating,
      comment: review.comment || '',
      date: new Date(review.createdAt),
      businessId: review.businessId || business.id
    }))
  }
  // const oldservices = [
  //   {
  //     name: 'Premium Haircut',
  //     duration: '45 min',
  //     price: '$45',
  //     description: 'Professional haircut with wash and styling'
  //   },
  //   {
  //     name: 'Beard Trim',
  //     duration: '20 min',
  //     price: '$25',
  //     description: 'Precision beard trimming and shaping'
  //   },
  //   {
  //     name: 'Hair Wash & Style',
  //     duration: '30 min',
  //     price: '$30',
  //     description: 'Deep cleansing wash with professional styling'
  //   },
  //   {
  //     name: 'Full Service Package',
  //     duration: '90 min',
  //     price: '$85',
  //     description: 'Complete grooming package with haircut, beard trim, and styling'
  //   }
  // ]

  // const reviews = [
  //   {
  //     name: 'John Smith',
  //     rating: 5,
  //     date: '2 days ago',
  //     comment: 'Excellent service! The barber was very professional and gave me exactly what I wanted. Highly recommend!'
  //   },
  //   {
  //     name: 'Mike Johnson',
  //     rating: 5,
  //     date: '1 week ago',
  //     comment: "Best haircut I've had in years. Great attention to detail and friendly staff."
  //   },
  //   {
  //     name: 'David Wilson',
  //     rating: 4,
  //     date: '2 weeks ago',
  //     comment: 'Good service and clean environment. Will definitely come back.'
  //   },
  //   {
  //     name: 'Alex Brown',
  //     rating: 5,
  //     date: '3 weeks ago',
  //     comment: "Amazing experience! The barber really knows what he's doing. Worth every penny."
  //   }
  // ]

  const [activeTab, setActiveTab] = useState('services')
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ApiService | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [branchModalOpen, setBranchModalOpen] = useState(false)

  const handelBookService = (service?: ApiService) => {
    if (service) {
      setSelectedService(service)
    } else {
      /* Alert you must choose a service */
    }
    setIsBookingModalOpen(true)
    console.log(`Booking Modal is ${isBookingModalOpen}`)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden'>
        {/* Animated background */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/10 rounded-full blur-3xl animate-pulse' />
          <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-teal-200/10 rounded-full blur-3xl animate-pulse animation-delay-1000' />
        </div>

        <div className='text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-24 w-24 border-4 border-primary-200 border-t-primary-800 mx-auto shadow-lg'></div>
            <div className='absolute inset-0 rounded-full h-24 w-24 border-4 border-transparent border-t-cyan-400 animate-ping mx-auto'></div>
          </div>
          <div className='mt-6 space-y-2'>
            <p className='text-xl font-semibold bg-gradient-to-r from-primary-800 to-cyan-600 bg-clip-text text-transparent'>
              {t('business.loading')}
            </p>
            <div className='flex justify-center space-x-1'>
              <div className='w-2 h-2 bg-primary-700 rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-primary-700 rounded-full animate-bounce animation-delay-200'></div>
              <div className='w-2 h-2 bg-primary-700 rounded-full animate-bounce animation-delay-400'></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden'>
        {/* Animated background */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/10 rounded-full blur-3xl animate-pulse' />
          <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-teal-200/10 rounded-full blur-3xl animate-pulse animation-delay-1000' />
        </div>

        <div className='text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
          <div className='mb-6'>
            <div className='w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg'>
              <div className='text-3xl'>🏪</div>
            </div>
          </div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-4'>
            Business not found
          </h1>
          <p className='text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed'>
            The business you're looking for doesn't exist or may have been removed.
          </p>
          <div className='mt-8'>
            <button className='px-6 py-3 bg-gradient-to-r from-primary-800 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'>
              Browse Other Businesses
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden'>
      {/* Background elements - static to prevent flickering */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/15 to-cyan-200/8 dark:from-primary-800/10 dark:to-cyan-600/5 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/15 to-teal-200/8 dark:from-emerald-600/10 dark:to-sage-600/5 rounded-full blur-3xl' />
      </div>
      <div className='w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3 sm:space-y-4 flex-none relative z-10'>
        {/* Header Section - Full width seamless design */}
        <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700'>
          <div className='p-4 sm:p-6 select-text'>
            <div className='flex flex-col md:flex-row gap-4 sm:gap-6'>
              {/* Business Image */}
              <div className='w-full md:w-48 lg:w-56 h-40 sm:h-48 lg:h-56 bg-gradient-to-br from-primary-200 to-sage-200 dark:from-primary-800/50 dark:to-sage-800/50 rounded-xl overflow-hidden select-none'>
                <img
                  src={
                    (business as any).logoUrl || (business as any).coverImageUrl || '/images/business-placeholder.jpg'
                  }
                  alt={business.name}
                  className='w-full h-full object-cover'
                />
              </div>

              {/* Business Info */}
              <div className='flex-1 space-y-2 sm:space-y-3 select-text'>
                <div className='flex flex-col gap-3'>
                  <div>
                    <H1
                      stringProps={{ plainText: `${business.name}` }}
                      className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white select-text'
                    />
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='flex items-center select-none'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(business.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className='text-sm text-gray-600 dark:text-gray-300 select-text'>
                        {business.rating || 0} ({business.reviews?.length || 0})
                      </span>
                    </div>
                    <Badge className='mt-2 bg-green-500 text-white px-3 py-1 text-sm rounded-full select-none'>
                      <div className='flex items-center gap-1'>
                        <div className='w-1.5 h-1.5 bg-white rounded-full' />
                        Open Now
                      </div>
                    </Badge>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      buttonText={{ plainText: 'Save' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:heart' }}
                      className='bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm py-2 px-4 touch-manipulation'
                    />
                    <Button
                      buttonText={{ plainText: 'Share' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:share' }}
                      className='bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm py-2 px-4 touch-manipulation'
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className='space-y-1.5 text-sm text-gray-600 dark:text-gray-300 select-text'>
                  {(business as any).address && (
                    <div className='flex items-start gap-2'>
                      <MapPin className='w-4 h-4 flex-shrink-0 mt-0.5 select-none' />
                      <span className='break-words select-text'>{(business as any).address}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className='flex items-center gap-2'>
                      <Globe className='w-4 h-4 flex-shrink-0 select-none' />
                      <span className='break-all select-text'>{business.email}</span>
                    </div>
                  )}
                  <div className='flex items-start gap-2'>
                    <Clock className='w-4 h-4 flex-shrink-0 mt-0.5 select-none' />
                    <span className='select-text'>
                      {(business as any).openingHours
                        ? `Monday-Saturday: 9AM-6PM, Sunday: Closed`
                        : 'Monday-Saturday: 9AM-6PM, Sunday: Closed'}
                    </span>
                  </div>
                  {business.socialLinks && business.socialLinks.length > 0 && (
                    <div className='flex items-center gap-2'>
                      <Globe className='w-4 h-4 flex-shrink-0 select-none' />
                      <div className='flex gap-2 flex-wrap'>
                        {business.socialLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary-800 dark:text-sage-400 hover:underline capitalize text-sm select-text'
                          >
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Full width seamless */}
        <div className='w-full rounded-xl bg-white/95 dark:bg-gray-800/95 sticky top-0 z-30 animate-in fade-in slide-in-from-top-4 duration-700'>
          <nav className='flex p-1'>
            <div className='flex w-full bg-gray-100/80 dark:bg-gray-700/80 rounded-lg p-0.5 gap-0.5 overflow-x-auto'>
              {getTabsWithTranslation(t).map(tab => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant='text'
                  size='md'
                  className={`relative flex-1 px-3 sm:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm transition-all duration-200 rounded-md whitespace-nowrap touch-manipulation ${
                    activeTab === tab.id
                      ? 'bg-primary-800 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-600/60'
                  }`}
                  buttonText={{ plainText: tab.label }}
                />
              ))}
            </div>
          </nav>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {/* Tab Content - Full width */}
        <div className='w-full px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 relative z-10'>
          {activeTab === 'services' && (
            <div className='space-y-3 sm:space-y-4'>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pt-3'>
                {t('business.sections.services')}
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'>
                {services.map((service, index) => (
                  <div
                    key={service.id || index}
                    className='group bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards] border border-gray-100/50 dark:border-gray-700/50'
                    style={{
                      animationDelay: `${0.1 + index * 0.05}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className='flex flex-col h-full'>
                      <div className='flex-1'>
                        <H3
                          stringProps={{ plainText: service.name }}
                          className='font-semibold text-lg text-gray-900 dark:text-white'
                        />
                        <P
                          stringProps={{ plainText: service.description || '' }}
                          className='text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2'
                        />
                        <span className='inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-2'>
                          <Clock className='w-4 h-4' />
                          {service.duration} min
                        </span>
                      </div>
                      <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700'>
                        <div className='text-xl font-bold text-primary-800 dark:text-primary-400'>
                          ${service.price}
                        </div>
                        <Button
                          buttonText={{ plainText: 'Book Now' }}
                          variant='contained'
                          className='bg-primary-800 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg touch-manipulation'
                          onClick={() => handelBookService(service)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div className='space-y-3 sm:space-y-4'>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pt-3'>
                {t('business.sections.locations')}
              </h2>
              {branches && branches.length > 0 ? (
                <div className='grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {branches.map((branch, index) => (
                    <div
                      key={branch.id || index}
                      className='group bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards] border border-gray-100/50 dark:border-gray-700/50'
                      style={{
                        animationDelay: `${0.1 + index * 0.05}s`,
                        animationFillMode: 'forwards'
                      }}
                      onClick={() => {
                        setSelectedBranch(branch)
                        setBranchModalOpen(true)
                      }}
                    >
                      <div className='flex items-start gap-4'>
                        <BusinessAvatar
                          businessName={branch.name}
                          className='w-16 h-16 rounded-xl flex-shrink-0'
                          size='lg'
                        />
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                            {branch.name}
                          </h3>
                          <div className='space-y-1 text-sm text-gray-500 dark:text-gray-400 mt-2'>
                            <div className='flex items-center gap-2'>
                              <MapPin className='w-4 h-4 flex-shrink-0' />
                              <span className='truncate'>{branch.address}</span>
                            </div>
                            {branch.mobile && (
                              <div className='flex items-center gap-2'>
                                <Phone className='w-4 h-4 flex-shrink-0' />
                                <span>{branch.mobile}</span>
                              </div>
                            )}
                          </div>
                          <div className='mt-3 flex items-center justify-between'>
                            <span className='text-sm text-primary-800 dark:text-sage-400 font-medium'>
                              View Details →
                            </span>
                            <div className='flex items-center gap-1'>
                              <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                              <span className='text-sm text-gray-500'>4.8</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Branch Gallery Preview */}
                      {branch.galleryUrls && branch.galleryUrls.length > 0 && (
                        <div className='mt-3 flex gap-2 overflow-x-auto'>
                          {branch.galleryUrls.slice(0, 3).map((imageUrl, imageIndex) => (
                            <div key={imageIndex} className='relative flex-shrink-0'>
                              <div className='w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700'>
                                <img
                                  src={imageUrl}
                                  alt={`${branch.name} preview ${imageIndex + 1}`}
                                  className='w-full h-full object-cover'
                                  onError={e => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/images/placeholder-image.jpg'
                                  }}
                                />
                              </div>
                              {imageIndex === 2 && branch.galleryUrls.length > 3 && (
                                <div className='absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center'>
                                  <span className='text-white text-sm font-medium'>+{branch.galleryUrls.length - 3}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 text-center'>
                  <MapPin className='w-12 h-12 mx-auto text-gray-400 mb-3' />
                  <h3 className='text-base font-medium text-gray-900 dark:text-white'>{t('business.noBranches.title')}</h3>
                  <p className='text-sm text-gray-500'>{t('business.noBranches.description')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='space-y-3 sm:space-y-4'>
              <div className='flex items-center justify-between pt-3'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
                  {t('business.sections.reviews')}
                </h2>
                <Button
                  variant='outlined'
                  buttonText={{ localeKey: 'business.writeReview' }}
                  i18nTFn={t}
                  className='bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 text-sm px-4 py-2'
                />
              </div>

              {/* Review Summary */}
              <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5'>
                <div className='flex items-center gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900 dark:text-white'>{business.rating || 0}</div>
                    <div className='flex items-center justify-center'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(business.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <div className='text-xs text-gray-500 mt-0.5'>
                      {business.reviews?.length || 0} reviews
                    </div>
                  </div>
                  <div className='flex-1 space-y-1'>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className='flex items-center gap-1.5'>
                        <span className='text-xs w-2'>{rating}</span>
                        <Star className='w-2.5 h-2.5 fill-yellow-400 text-yellow-400' />
                        <div className='flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5'>
                          <div
                            className='bg-yellow-400 h-1.5 rounded-full'
                            style={{ width: rating === 5 ? '85%' : rating === 4 ? '12%' : '3%' }}
                          />
                        </div>
                        <span className='text-xs text-gray-500 w-6'>
                          {business.reviews ? business.reviews.filter(r => r.rating === rating).length : 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'>
                {businessReview().length > 0 ? (
                  businessReview().map((review, index) => (
                    <div
                      key={review.id || index}
                      className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5 opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards] border border-gray-100/50 dark:border-gray-700/50'
                      style={{
                        animationDelay: `${0.1 + index * 0.05}s`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0'>
                          <span className='text-sm font-medium text-primary-800 dark:text-primary-300'>
                            {review.authorName
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-base font-medium text-gray-900 dark:text-white'>{review.authorName}</span>
                            <span className='text-sm text-gray-400'>{format(review.date, 'MMM d')}</span>
                          </div>
                          <div className='flex items-center my-1'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-3'>
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='col-span-full bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 text-center'>
                    <Star className='w-12 h-12 mx-auto text-gray-400 mb-3' />
                    <h3 className='text-base font-medium text-gray-900 dark:text-white'>No reviews yet</h3>
                    <p className='text-sm text-gray-500'>Be the first to leave a review!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className='space-y-3 sm:space-y-4'>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pt-3'>
                About {business.name}
              </h2>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5 border border-gray-100/50 dark:border-gray-700/50'>
                  <h3 className='text-base font-semibold text-gray-900 dark:text-white mb-2'>Our Story</h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                    {business.description ||
                      `${business.name} is committed to providing exceptional services in a welcoming, professional environment.`}
                  </p>
                </div>

                <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5 border border-gray-100/50 dark:border-gray-700/50'>
                  <h3 className='text-base font-semibold text-gray-900 dark:text-white mb-3'>What Makes Us Special</h3>
                  <ul className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                    <li className='flex items-start gap-2'>
                      <span className='w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0' />
                      <span>Experienced professionals</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0' />
                      <span>Premium products and tools</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0' />
                      <span>Clean, modern environment</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0' />
                      <span>Personalized service</span>
                    </li>
                  </ul>
                </div>

                <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5 border border-gray-100/50 dark:border-gray-700/50'>
                  <h3 className='text-base font-semibold text-gray-900 dark:text-white mb-3'>Hours</h3>
                  <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                    <div className='flex justify-between'>
                      <span>Mon-Fri</span>
                      <span className='font-medium'>9AM-6PM</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Saturday</span>
                      <span className='font-medium'>10AM-4PM</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 sm:p-5 border border-gray-100/50 dark:border-gray-700/50'>
                  <h3 className='text-base font-semibold text-gray-900 dark:text-white mb-3'>Contact</h3>
                  <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
                    {branches.length > 0 && branches[0].address && (
                      <p>{branches[0].address}</p>
                    )}
                    {branches.length > 0 && branches[0].mobile && (
                      <p>{branches[0].mobile}</p>
                    )}
                    {business.email && <p>{business.email}</p>}
                    {business.socialLinks && business.socialLinks.length > 0 && (
                      <div className='flex items-center gap-3 mt-2'>
                        {business.socialLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary-700 dark:text-primary-400 hover:underline capitalize font-medium'
                          >
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calling the BookingModal */}
      <BookingModalV2Fixed
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialService={selectedService || undefined}
        branchId={selectedBranch?.id}
        businessId={params.slug}
      />

      {/* Branch Details Modal */}
      {selectedBranch && business && (
        <BranchDetailsModal
          isOpen={branchModalOpen}
          onClose={() => {
            setBranchModalOpen(false)
            setSelectedBranch(null)
          }}
          branch={selectedBranch}
          businessName={business.name}
          businessImage={(business as any).logo || (business as any).coverImage}
          services={services}
          staff={staff}
          allBranches={branches}
          onBranchChange={newBranch => {
            setSelectedBranch(newBranch)
          }}
          onBookService={serviceId => {
            console.log('Booking service:', serviceId)
            setBranchModalOpen(false)
            // TODO: Implement booking logic or open booking modal
          }}
        />
      )}
    </div>
  )
}

export default businessDetailsPage
