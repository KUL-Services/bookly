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
import { useParams } from 'next/navigation'
import { BusinessService, ServicesService, BranchesService, StaffService } from '@/lib/api'
import type { Business, Service as ApiService, Branch, Staff } from '@/lib/api'
import initTranslations from '@/app/i18n/i18n'

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

        // Use the single business API endpoint that returns everything
        const businessResponse = await BusinessService.getBusiness(params.slug)

        if (businessResponse.error) {
          throw new Error(businessResponse.error)
        }

        if (businessResponse.data) {
          console.log('✅ Business data received:', businessResponse.data)
          setBusiness(businessResponse.data)
        } else {
          throw new Error('No business data received')
        }
      } catch (err) {
        console.warn('Failed to fetch business data, using fallback:', err)

        // Use mock business data
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
              location: '11 Omar Tosson',
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
              location: 'Spa',
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
              name: 'Mohandeseen',
              address: '11 Mohandeseen',
              mobile: '0232323232',
              businessId: params.slug,
              staff: [
                {
                  id: 'staff-1',
                  name: 'Mohsen Hendawy',
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
        setError(null) // Don't show error since we have fallback data
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
            <div className='animate-spin rounded-full h-24 w-24 border-4 border-teal-200 border-t-teal-600 mx-auto shadow-lg'></div>
            <div className='absolute inset-0 rounded-full h-24 w-24 border-4 border-transparent border-t-cyan-400 animate-ping mx-auto'></div>
          </div>
          <div className='mt-6 space-y-2'>
            <p className='text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'>
              {t('business.loading')}
            </p>
            <div className='flex justify-center space-x-1'>
              <div className='w-2 h-2 bg-teal-500 rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-teal-500 rounded-full animate-bounce animation-delay-200'></div>
              <div className='w-2 h-2 bg-teal-500 rounded-full animate-bounce animation-delay-400'></div>
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
            <button className='px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'>
              Browse Other Businesses
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/10 dark:from-teal-600/15 dark:to-cyan-600/8 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-teal-200/10 dark:from-emerald-600/15 dark:to-teal-600/8 rounded-full blur-3xl animate-pulse animation-delay-1000' />
        <div className='absolute top-1/2 right-20 w-32 h-32 bg-gradient-to-br from-teal-300/30 to-cyan-300/20 rounded-full blur-2xl animate-float' />
      </div>
      <div className='container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 flex-none relative z-10'>
        {/* Header Section */}
        <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-teal-100/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 duration-700'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex flex-col md:flex-row gap-4 sm:gap-6'>
              {/* Business Image */}
              <div className='group w-full md:w-52 h-48 sm:h-52 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800/50 dark:to-cyan-800/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
                <img
                  src={(business as any).logoUrl || (business as any).coverImageUrl || '/images/business-placeholder.jpg'}
                  alt={business.name}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </div>

              {/* Business Info */}
              <div className='flex-1 space-y-3 sm:space-y-4'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4'>
                  <div>
                    <H1
                      stringProps={{ plainText: `${business.name}` }}
                      className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'
                    />
                    <div className='flex items-center gap-2 mt-2'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(business.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className='text-sm text-gray-600 dark:text-gray-300'>{business.rating || 0} ({business.reviews?.length || 0} reviews)</span>
                    </div>
                    <Badge className='mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full shadow-md animate-pulse'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-white rounded-full animate-ping' />
                        Open Now
                      </div>
                    </Badge>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      buttonText={{ plainText: 'Save' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:heart' }}
                      className='flex-1 sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-lg border-gray-400 dark:border-gray-600 hover:shadow-none hover:border-none hover:bg-transparent text-sm py-2'
                    />
                    <Button
                      buttonText={{ plainText: 'Share' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:share' }}
                      className='flex-1 sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-lg border-gray-400 dark:border-gray-600 hover:shadow-none hover:border-none hover:bg-transparent text-sm py-2'
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                  {(business as any).address && (
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4' />
                      <span>{(business as any).address}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className='flex items-center gap-2'>
                      <Globe className='w-4 h-4' />
                      <span>{business.email}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <Clock className='w-4 h-4' />
                    <span>
                      {(business as any).openingHours
                        ? `Monday-Wednesday: ${(business as any).openingHours['Mon'] || '9AM-6PM'}, Thursday-Friday: ${(business as any).openingHours['Thu'] || '9AM-6PM'}, Saturday: ${(business as any).openingHours['Sat'] || '10AM-4PM'}, Sunday: ${(business as any).openingHours['Sun'] || 'Closed'}`
                        : 'Monday-Saturday: 9AM-6PM, Sunday: Closed'}
                    </span>
                  </div>
                  {business.socialLinks && business.socialLinks.length > 0 && (
                    <div className='flex items-center gap-2'>
                      <Globe className='w-4 h-4' />
                      <div className='flex gap-2'>
                        {business.socialLinks.map((link, index) => (
                          <a key={index} href={link.url} target='_blank' rel='noopener noreferrer' className='text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 capitalize'>
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  buttonText={{ plainText: 'Book Appointment' }}
                  variant='contained'
                  className='bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 animate-glow'
                  /* oncLick: push client to book a promoted service */
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <div className='mx-auto max-w-4xl rounded-xl border border-teal-100/50 dark:border-gray-700/50 shadow-lg sticky top-0 sm:top-4 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700 animation-delay-300'>
          <nav className='flex justify-center p-1 sm:p-2'>
            <div className='flex w-full sm:w-auto bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 overflow-x-auto'>
              {getTabsWithTranslation(t).map(tab => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant='text'
                  size='lg'
                  className={`relative px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-all duration-300 rounded-lg whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white/50 dark:hover:bg-gray-600/50 hover:scale-105'
                  }`}
                  buttonText={{ plainText: tab.label }}
                />
              ))}
            </div>
          </nav>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {/* mockServices[mockBusinesses[0].services] */}
        {/* Tab Content */}
        <div className='min-h-96 max-w-4xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8 relative z-10'>
          {activeTab === 'services' && (
            <div className='space-y-6'>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent opacity-0 animate-[fadeInUp_0.7s_ease-out_forwards]'>
                {t('business.sections.services')}
              </h2>
              <div className='grid gap-6'>
                {services.map((service, index) => (
                  <Card
                    key={service.id || index}
                    className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border border-teal-100/50 dark:border-gray-700/50 hover:border-teal-200 dark:hover:border-gray-600 hover:scale-[1.02] opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]'
                    style={{
                      animationDelay: `${0.2 + index * 0.1}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <CardContent className='p-6'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1 space-y-3'>
                          <H3
                            stringProps={{ plainText: service.name }}
                            className='font-bold text-xl text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors duration-300'
                          />
                          <P
                            stringProps={{ plainText: service.description || '' }}
                            className='text-gray-600 dark:text-gray-300 leading-relaxed'
                          />
                          <div className='flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400'>
                            <span className='flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full'>
                              <Clock className='w-4 h-4' />
                              {service.duration} min
                            </span>
                          </div>
                        </div>
                        <div className='text-right space-y-3'>
                          <div className='text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'>
                            ${service.price}
                          </div>
                          <Button
                            buttonText={{ plainText: 'Book Now' }}
                            variant='contained'
                            className='bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200'
                            onClick={() => handelBookService(service)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div className='space-y-6'>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent opacity-0 animate-[fadeInUp_0.7s_ease-out_forwards]'>
                {t('business.sections.locations')}
              </h2>
              {branches && branches.length > 0 ? (
                <div className='grid gap-6 md:grid-cols-2'>
                  {branches.map((branch, index) => (
                    <Card
                      key={branch.id || index}
                      className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-teal-100/50 dark:border-gray-700/50 hover:border-teal-200 dark:hover:border-gray-600 hover:scale-[1.02] opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]'
                      style={{
                        animationDelay: `${0.2 + index * 0.1}s`,
                        animationFillMode: 'forwards'
                      }}
                      onClick={() => {
                        setSelectedBranch(branch)
                        setBranchModalOpen(true)
                      }}
                    >
                      <CardContent className='p-6'>
                        <div className='flex flex-col gap-4'>
                          <div className='flex items-start gap-4'>
                            <BusinessAvatar
                              businessName={branch.name}
                              className='w-16 h-16 rounded-lg flex-shrink-0'
                              size='lg'
                            />
                            <div className='flex-1 min-w-0'>
                              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>{branch.name}</h3>
                              <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                                <div className='flex items-center gap-2'>
                                  <MapPin className='w-4 h-4 flex-shrink-0' />
                                  <span className='truncate text-gray-600 dark:text-gray-300'>{branch.address}</span>
                                </div>
                                {branch.mobile && (
                                  <div className='flex items-center gap-2'>
                                    <Phone className='w-4 h-4 flex-shrink-0' />
                                    <span className='text-gray-600 dark:text-gray-300'>{branch.mobile}</span>
                                  </div>
                                )}
                                <div className='flex items-center gap-2'>
                                  <Clock className='w-4 h-4 flex-shrink-0' />
                                  <span className='text-gray-600 dark:text-gray-300'>Open today: 9AM-6PM</span>
                                </div>
                              </div>
                              <div className='mt-3 flex items-center justify-between'>
                                <span className='text-sm text-teal-600 dark:text-teal-400 font-medium'>View Details →</span>
                                <div className='flex gap-1'>
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                                  ))}
                                  <span className='text-xs text-gray-500 ml-1'>4.8</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Branch Gallery Preview */}
                          {branch.galleryUrls && branch.galleryUrls.length > 0 && (
                            <div>
                              <div className='flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'>
                                {branch.galleryUrls.slice(0, 4).map((imageUrl, imageIndex) => (
                                  <div key={imageIndex} className='relative flex-shrink-0'>
                                    <div className='w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700'>
                                      <img
                                        src={imageUrl}
                                        alt={`${branch.name} preview ${imageIndex + 1}`}
                                        className='w-full h-full object-cover'
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.src = '/images/placeholder-image.jpg'
                                        }}
                                      />
                                    </div>
                                    {imageIndex === 3 && branch.galleryUrls.length > 4 && (
                                      <div className='absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center'>
                                        <span className='text-white text-xs font-medium'>
                                          +{branch.galleryUrls.length - 4}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className='shadow-sm opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]'>
                  <CardContent className='p-8 text-center'>
                    <div className='text-gray-400 mb-3'>
                      <MapPin className='w-12 h-12 mx-auto' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>{t('business.noBranches.title')}</h3>
                    <p className='text-gray-600'>{t('business.noBranches.description')}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between opacity-0 animate-[fadeInUp_0.7s_ease-out_forwards]'>
                <H2
                  stringProps={{ localeKey: 'business.sections.reviews' }}
                  i18nTFn={t}
                  className='text-3xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent'
                />
                {/* <h2 className='text-2xl font-bold text-gray-900'>Customer Reviews</h2> */}

                <Button
                  variant='outlined'
                  buttonText={{ localeKey: 'business.writeReview' }}
                  i18nTFn={t}
                  className='bg-white text-gray-900 shadow-lg border-gray-400 hover:shadow-none hover:border-none hover:bg-transparent'
                />
              </div>
              {/* {[...Array(5)].map((_, i) => (
                        <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                      ))} */}
              {/* Review Summary */}
              <Card className='bg-white/80 backdrop-blur-sm shadow-lg border border-teal-100/50 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-6'>
                    <div className='text-center'>
                      <div className='text-4xl font-bold text-gray-900'>{business.rating || 0}</div>
                      <div className='flex items-center justify-center mt-1'>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(business.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}{' '}
                      </div>
                      <div className='text-sm text-gray-600 mt-1'>{business.reviews?.length || 0} review{(business.reviews?.length || 0) !== 1 ? 's' : ''}</div>
                    </div>
                    <div className='flex-1 space-y-2'>
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className='flex items-center gap-2'>
                          <span className='text-sm w-2'>{rating}</span>
                          <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                          <div className='flex-1 bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-yellow-400 h-2 rounded-full'
                              style={{ width: rating === 5 ? '85%' : rating === 4 ? '12%' : '3%' }}
                            ></div>
                          </div>
                          <span className='text-sm text-gray-600 w-8'>
                            {business.reviews ? business.reviews.filter(r => r.rating === rating).length : 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className='space-y-6'>
                {businessReview().length > 0 ? businessReview().map((review, index) => (
                  <Card
                    key={review.id || index}
                    className='group bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100/50 hover:border-teal-200 hover:scale-[1.01] opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]'
                    style={{
                      animationDelay: `${0.4 + index * 0.1}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        <div className='w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center'>
                          <span className='text-sm font-medium text-teal-700'>
                            {review.authorName
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='font-medium text-gray-900'>{review.authorName}</span>
                            <span className='text-sm text-gray-500'>{format(review.date, 'MMM dd, yyyy')}</span>
                          </div>
                          <div className='flex items-center mb-2'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className='ml-2 text-sm text-gray-600'>{review.rating}/5</span>
                          </div>
                          <p className='text-gray-700 dark:[color:rgb(55_65_81)] text-sm leading-relaxed'>{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card className='shadow-sm opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]'>
                    <CardContent className='p-8 text-center'>
                      <div className='text-gray-400 mb-3'>
                        <Star className='w-12 h-12 mx-auto' />
                      </div>
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>No reviews yet</h3>
                      <p className='text-gray-600'>Be the first to leave a review for this business!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className='space-y-6'>
              <H2
                stringProps={{ plainText: `About ${business.name}` }}
                className='text-3xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent opacity-0 animate-[fadeInUp_0.7s_ease-out_forwards]'
              />

              <Card className='bg-white/80 backdrop-blur-sm shadow-lg border border-teal-100/50 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]'>
                <CardContent className='p-6 space-y-4'>
                  <div>
                    <H3 stringProps={{ plainText: 'Our Story' }} className='font-semibold text-lg text-gray-900 mb-2' />

                    <P
                      stringProps={{
                        plainText: business.description || `${business.name} is committed to providing exceptional services in a welcoming, professional environment. Our experienced team is passionate about their craft and dedicated to helping every client look and feel their best.`
                      }}
                      className='text-gray-700 leading-relaxed'
                    />
                  </div>

                  <div>
                    <H3
                      stringProps={{ plainText: 'What Makes Us Special' }}
                      className='font-semibold text-lg text-gray-900 mb-2'
                    />
                    <ul className='space-y-2 text-gray-700'>
                      <li className='flex items-start gap-2'>
                        <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></span>
                        <span>Master barbers with 10+ years of experience</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></span>
                        <span>Premium grooming products and tools</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></span>
                        <span>Clean, modern, and comfortable environment</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></span>
                        <span>Personalized service tailored to your style</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <H3
                      stringProps={{ plainText: 'Hours of Operation' }}
                      className='font-semibold text-lg text-gray-900 mb-2'
                    />
                    <div className='space-y-1 text-gray-700'>
                      <div className='flex justify-between'>
                        <span>Monday - Wednesday</span>
                        <span>{(business as any).openingHours?.['Mon'] || '9AM-6PM'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Thursday - Friday</span>
                        <span>{(business as any).openingHours?.['Thu'] || '9AM-6PM'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Saturday</span>
                        <span>{(business as any).openingHours?.['Sat'] || '10AM-4PM'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <H3
                      stringProps={{ plainText: 'Location & Contact' }}
                      className='font-semibold text-lg text-gray-900 mb-2'
                    />
                    <div className='space-y-2 text-gray-700'>
                      {branches.length > 0 && branches[0].address && (
                        <P stringProps={{ plainText: `Address: ${branches[0].address}` }} />
                      )}
                      {branches.length > 0 && branches[0].mobile && (
                        <P stringProps={{ plainText: `Phone: ${branches[0].mobile}` }} />
                      )}
                      {business.email && (
                        <P stringProps={{ plainText: `Email: ${business.email}` }} />
                      )}
                      {business.socialLinks && business.socialLinks.length > 0 && (
                        <div className='flex items-center gap-4 mt-3'>
                          <span className='font-medium'>Follow us:</span>
                          {business.socialLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-teal-600 hover:text-teal-700 capitalize underline'
                            >
                              {link.platform}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
