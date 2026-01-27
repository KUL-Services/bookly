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
import {
  Facebook,
  Instagram,
  Twitter,
  Clock,
  Globe,
  MapPin,
  Phone,
  Star,
  Heart,
  Share,
  ChevronRight,
  User as UserLockIcon,
  ChevronLeft
} from 'lucide-react'
import { useState, useEffect, useMemo, useCallback, useRef, TouchEvent, MouseEvent } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { BusinessService, ServicesService, BranchesService, StaffService } from '@/lib/api'
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api'
import GreenIcon from '@/assets/logos/icons/Green_Icon_filled_transparent.png'
import type { Business, Service as ApiService, Branch, Staff } from '@/lib/api'
import initTranslations from '@/app/i18n/i18n'
import { getBusinessWithDetails } from '@/mocks/businesses'
import { useAuthStore } from '@/stores/auth.store'
import { useSettings } from '@/contexts/settings.context'

const getTabsWithTranslation = (t: any) => [
  { id: 'services', label: t('business.tabs.services') },
  { id: 'details', label: t('business.tabs.details') },
  { id: 'reviews', label: t('business.tabs.reviews') }
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

  const { country, currency } = useSettings() // Using standard hook for settings
  // Extract services, branches, and staff from business data
  const services = business?.services || []

  // Group services by category
  const groupedServices = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        const category = (service as any).category || 'General'
        if (!acc[category]) acc[category] = []
        acc[category].push(service)
        return acc
      },
      {} as Record<string, ApiService[]>
    )
  }, [services])

  const branches = business?.branches || []
  const staff = branches.flatMap(branch => branch.staff || [])

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry']
  })

  const mapCenter = useMemo(() => {
    return (business as any)?.coordinates
      ? { lat: (business as any).coordinates.lat, lng: (business as any).coordinates.lng }
      : { lat: 25.2048, lng: 55.2708 } // Default to Dubai
  }, [business])

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations((params.lang || 'en') as any, ['common'])
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
            branches: (mockBusinessData.fullBranches || mockBusinessData.branches) as any[],
            reviews: mockBusinessData.reviews as any,
            logoUrl: mockBusinessData.logoUrl,
            coverImageUrl: mockBusinessData.coverImageUrl
          } as any
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
      businessId: (review as any).businessId || business.id
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

  const { booklyUser } = useAuthStore()
  const router = useRouter()
  const [showLoginGuestModal, setShowLoginGuestModal] = useState(false)
  const staffScrollRef = useRef<HTMLDivElement>(null) // Fix for Safari iOS touch issues - use standard click with touch-action CSS
  // The key fix is using touch-action: manipulation on interactive elements
  // and ensuring onClick works properly on iOS Safari
  const handleButtonClick = useCallback((callback: () => void) => {
    return (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
      e.stopPropagation()
      callback()
    }
  }, [])

  const handleTap = useCallback((callback: () => void) => {
    let touchMoved = false
    let touchStartTime = 0
    return {
      onTouchStart: () => {
        touchMoved = false
        touchStartTime = Date.now()
      },
      onTouchMove: () => {
        touchMoved = true
      },
      onTouchEnd: (e: TouchEvent) => {
        const touchDuration = Date.now() - touchStartTime
        // Only trigger if it was a quick tap without movement
        if (!touchMoved && touchDuration < 500) {
          e.preventDefault()
          callback()
        }
      },
      onClick: (e: MouseEvent) => {
        e.stopPropagation()
        callback()
      }
    }
  }, [])

  const scrollStaff = (direction: 'left' | 'right') => {
    if (staffScrollRef.current) {
      const scrollAmount = 200
      staffScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handelBookService = (service?: ApiService) => {
    if (service) {
      setSelectedService(service)
    } else {
      /* Alert you must choose a service */
    }

    // Check if user is logged in
    if (booklyUser) {
      setIsBookingModalOpen(true)
    } else {
      setShowLoginGuestModal(true)
    }
  }

  const handleLoginRedirect = () => {
    // Redirect to login with return url
    const returnUrl = encodeURIComponent(`/business/${params.slug}`)
    router.push(`/${params.lang}/login?redirect=${returnUrl}`)
    setShowLoginGuestModal(false)
  }

  const handleContinueAsGuest = () => {
    setShowLoginGuestModal(false)
    setIsBookingModalOpen(true)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
        <div className='text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-24 w-24 border-4 border-[#77b6a3]/30 border-t-[#0a2c24] dark:border-t-[#77b6a3] mx-auto shadow-lg'></div>
            <div className='absolute inset-0 rounded-full h-24 w-24 border-4 border-transparent border-t-[#77b6a3] animate-ping mx-auto'></div>
          </div>
          <div className='mt-6 space-y-2'>
            <p className='text-xl font-semibold text-[#0a2c24] dark:text-white'>Loading...</p>
            <div className='flex justify-center space-x-1'>
              <div className='w-2 h-2 bg-[#0a2c24] rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-[#0a2c24] rounded-full animate-bounce animation-delay-200'></div>
              <div className='w-2 h-2 bg-[#0a2c24] rounded-full animate-bounce animation-delay-400'></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
        <div className='text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
          <div className='mb-6'>
            <div className='w-24 h-24 mx-auto bg-[#e88682]/20 dark:bg-[#e88682]/10 rounded-full flex items-center justify-center shadow-lg'>
              <div className='text-3xl'>🏪</div>
            </div>
          </div>
          <h1 className='text-3xl font-bold text-[#0a2c24] dark:text-white mb-4'>Business not found</h1>
          <p className='text-[#0a2c24]/70 dark:text-white/70 text-lg max-w-md mx-auto leading-relaxed'>
            The business you're looking for doesn't exist or may have been removed.
          </p>
          <div className='mt-8'>
            <button className='px-6 py-3 bg-[#0a2c24] hover:bg-[#0a2c24]/90 dark:bg-[#77b6a3] dark:hover:bg-[#77b6a3]/90 text-white dark:text-[#0a2c24] font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'>
              Browse Other Businesses
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div
      className='min-h-screen flex flex-col bg-[#f7f8f9] dark:bg-[#0a2c24] relative font-sans'
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Global styles for iOS Safari touch fix */}
      <style jsx global>{`
        /* Fix iOS Safari touch delay */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        button,
        a,
        [role='button'],
        .cursor-pointer {
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
      {/* Hero Cover Section */}
      <div className='relative h-[65vh] min-h-[550px] lg:h-[50vh] w-full overflow-hidden group rounded-b-[4rem] border-b-2 border-[#0a2c24]'>
        <div className='absolute inset-0 bg-gray-900'>
          <img
            src={(business as any).coverImageUrl || '/images/business-placeholder.jpg'}
            alt='Cover'
            className='w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000'
          />
          <div className='absolute inset-0 bg-[#202c39]/60' />
        </div>

        {/* Hero Content (Desktop) */}
        <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 z-20'>
          <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6'>
            {/* Logo */}
            <div className='relative -mb-12 md:-mb-16 flex-shrink-0'>
              <div className='w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl p-1 bg-white dark:bg-[#202c39] shadow-2xl'>
                <img
                  src={(business as any).logoUrl || '/images/business-placeholder.jpg'}
                  alt='Logo'
                  className='w-full h-full object-cover rounded-xl'
                />
              </div>
            </div>

            {/* Title & Info */}
            <div className='flex-1 mb-8 md:mb-4 text-white shadow-sm'>
              <div className='flex flex-wrap items-center gap-3 mb-3'>
                <Badge className='bg-[#77b6a3] text-white px-3 py-1 text-xs uppercase tracking-wider font-bold rounded-lg border-none animate-pulse'>
                  Open Now
                </Badge>
                <div className='flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20'>
                  <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                  <span className='text-sm font-bold'>{business.rating}</span>
                  <span className='text-xs text-white/80'>({business.reviews?.length} verified)</span>
                </div>
              </div>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-xl'>
                {business.name}
              </h1>
              <div className='flex flex-wrap items-center gap-6 text-sm sm:text-base text-gray-100 font-medium'>
                <div className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-[#77b6a3]' />
                  <span className='line-clamp-1 max-w-xs'>{(business as any).address || 'Location varies'}</span>
                </div>
                {business.description && <span className='hidden sm:inline text-white/40'>•</span>}
                <span className='hidden sm:line-clamp-1 max-w-md text-gray-200'>
                  {business.description?.substring(0, 100)}...
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 mb-6'>
              <button
                className='p-3 rounded-full hover:bg-white/10 text-white transition-all duration-300 hover:scale-110 active:scale-95 group'
                aria-label='Save'
              >
                <Heart className='w-6 h-6' />
              </button>
              <button
                className='p-3 rounded-full hover:bg-white/10 text-white transition-all duration-300 hover:scale-110 active:scale-95'
                aria-label='Share'
              >
                <Share className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-12 relative z-10'>
        {/* Brand Background Graphic */}
        <div
          className='absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-[0.03] z-0'
          style={{
            backgroundImage: "url('/brand/zerv-z.svg')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top right',
            backgroundSize: 'contain',
            transform: 'rotate(-15deg)'
          }}
        />
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Tabs & Content - Left Side */}
          <div className='flex-1 min-w-0'>
            {/* Refined Sticky Navigation */}
            <div className='sticky top-[64px] z-30 mb-8 bg-[#f7f8f9]/95 dark:bg-[#0a2c24]/95 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 transition-all duration-300 border-b border-gray-200/50 dark:border-white/5'>
              <div className='flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0'>
                {getTabsWithTranslation(t).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-6 py-2.5 rounded-full text-base font-bold transition-all duration-300 border
                      whitespace-nowrap flex-shrink-0
                      ${
                        activeTab === tab.id
                          ? 'bg-[#0a2c24] text-white border-[#0a2c24] shadow-lg transform -translate-y-0.5'
                          : 'bg-white/50 dark:bg-white/5 text-[#0a2c24] dark:text-white border-transparent hover:bg-white dark:hover:bg-white/10 hover:shadow-md'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div key={activeTab} className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
              {activeTab === 'services' && (
                <div className='space-y-12'>
                  {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    <div key={category} className='space-y-6'>
                      <div className='flex items-center justify-between'>
                        <h2 className='text-2xl font-bold text-[#202c39] dark:text-white tracking-tight flex items-center gap-3'>
                          <span className='w-2 h-8 bg-[#0a2c24] dark:bg-[#77b6a3] rounded-full'></span>
                          {category}
                        </h2>
                      </div>

                      <div className='grid gap-5'>
                        {categoryServices.map((service, index) => (
                          <div
                            key={service.id || index}
                            className='group relative bg-white dark:bg-[#202c39] rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-white/5'
                          >
                            <div className='relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center'>
                              <div className='flex-1 space-y-2'>
                                <div className='flex items-center gap-3'>
                                  <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0a2c24] dark:group-hover:text-[#77b6a3] transition-colors'>
                                    {service.name}
                                  </h3>
                                  <span className='px-2.5 py-1 bg-[#0a2c24]/5 dark:bg-white/5 text-xs font-medium text-[#0a2c24] dark:text-[#77b6a3] rounded-full'>
                                    {service.duration} min
                                  </span>
                                </div>

                                <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xl'>
                                  {service.description || 'Experience our premium service.'}
                                </p>
                              </div>

                              <div className='flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0'>
                                <div className='text-right'>
                                  <span className='block text-xl font-bold text-[#0a2c24] dark:text-[#77b6a3]'>
                                    {currency === 'AED' ? 'AED' : currency === 'SAR' ? 'SAR' : 'EGP'} {service.price}
                                  </span>
                                </div>
                                <Button
                                  onClick={() => handelBookService(service)}
                                  buttonText={{ plainText: 'Book' }}
                                  className='bg-[#0a2c24] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0a2c24]/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'details' && (
                <div className='space-y-12'>
                  {/* Staff Carousel Section */}
                  {staff.length > 0 && (
                    <div className='bg-white dark:bg-[#202c39] p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden'>
                      <h2 className='text-xl font-bold text-[#0a2c24] dark:text-white mb-6 flex items-center justify-between'>
                        <span>Meet the Team</span>
                        <div className='flex gap-2'>
                          <button
                            {...handleTap(() => scrollStaff('left'))}
                            className='p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                          >
                            <ChevronLeft className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                          </button>
                          <button
                            {...handleTap(() => scrollStaff('right'))}
                            className='p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                          >
                            <ChevronRight className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                          </button>
                        </div>
                      </h2>

                      <div ref={staffScrollRef} className='flex gap-6 overflow-x-auto no-scrollbar pb-2 scroll-smooth'>
                        {staff.map((member, index) => (
                          <div
                            key={member.id || index}
                            className='flex flex-col items-center gap-3 min-w-[100px] cursor-pointer group'
                          >
                            <div className='w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#0a2c24] to-[#77b6a3] group-hover:scale-105 transition-transform shadow-md'>
                              <img
                                src={
                                  (member as any).image ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                                }
                                alt={member.name}
                                className='w-full h-full rounded-full object-cover border-4 border-white dark:border-[#202c39] bg-white'
                              />
                            </div>
                            <div className='text-center'>
                              <span className='block text-sm font-bold text-gray-800 dark:text-gray-200'>
                                {member.name.split(' ')[0]}
                              </span>
                              <span className='text-xs text-gray-500 dark:text-gray-400'>Specialist</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About Section */}
                  <div className='bg-white dark:bg-[#202c39] p-8 md:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden'>
                    <div
                      className='absolute right-[-40px] top-[-40px] h-64 w-64 zerv-mask opacity-[0.05] dark:opacity-[0.08]'
                      style={{ background: 'radial-gradient(circle, #0a2c24 0%, transparent 70%)' }}
                    />
                    <h2 className='text-2xl font-bold text-[#0a2c24] dark:text-white mb-6'>About {business.name}</h2>
                    <div className='prose prose-lg text-gray-600 dark:text-gray-300 max-w-none'>
                      <p className='leading-relaxed'>{business.description}</p>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'>
                      <div className='p-4 bg-gray-50 dark:bg-black/20 rounded-2xl text-center'>
                        <Clock className='w-6 h-6 mx-auto text-[#0a2c24] dark:text-[#77b6a3] mb-2' />
                        <div className='text-xs font-bold'>Hours</div>
                        <div className='text-[10px] text-gray-500'>9AM - 8PM</div>
                      </div>
                      <div className='p-4 bg-gray-50 dark:bg-black/20 rounded-2xl text-center'>
                        <Globe className='w-6 h-6 mx-auto text-[#0a2c24] dark:text-[#77b6a3] mb-2' />
                        <div className='text-xs font-bold'>Booking</div>
                        <div className='text-[10px] text-gray-500'>24/7 Online</div>
                      </div>
                      <div className='p-4 bg-gray-50 dark:bg-black/20 rounded-2xl text-center'>
                        <Star className='w-6 h-6 mx-auto text-[#0a2c24] dark:text-[#77b6a3] mb-2' />
                        <div className='text-xs font-bold'>Quality</div>
                        <div className='text-[10px] text-gray-500'>Premium</div>
                      </div>
                      <div className='p-4 bg-gray-50 dark:bg-black/20 rounded-2xl text-center'>
                        <Phone className='w-6 h-6 mx-auto text-[#0a2c24] dark:text-[#77b6a3] mb-2' />
                        <div className='text-xs font-bold'>Contact</div>
                        <div className='text-[10px] text-gray-500'>Direct</div>
                      </div>
                    </div>
                  </div>

                  {/* Branches Section moved into Details */}
                  {branches.length > 0 && (
                    <div className='mt-8'>
                      <h3 className='text-xl font-bold text-[#0a2c24] dark:text-white mb-6'>Our Locations</h3>
                      <div className='grid grid-cols-1 gap-4'>
                        {branches.map((branch, index) => (
                          <div
                            key={index}
                            role='button'
                            tabIndex={0}
                            {...handleTap(() => {
                              setSelectedBranch(branch)
                              setBranchModalOpen(true)
                            })}
                            className='group bg-white dark:bg-[#202c39] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 items-center border border-gray-100 dark:border-white/5'
                          >
                            <div className='w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative'>
                              <img
                                src={(branch.galleryUrls && branch.galleryUrls[0]) || '/images/placeholder-image2.jpg'}
                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                                alt={branch.name}
                              />
                            </div>
                            <div className='flex-1'>
                              <h4 className='text-base font-bold text-gray-900 dark:text-white mb-0.5'>
                                {branch.name}
                              </h4>
                              <p className='text-xs text-gray-500 flex items-center gap-1'>
                                <MapPin className='w-3 h-3 text-[#2a9d8f]' /> {branch.address}
                              </p>
                            </div>
                            <ChevronRight className='w-5 h-5 text-gray-300 group-hover:text-[#2a9d8f] transition-colors' />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact / Map Section */}
                  <div className='bg-white dark:bg-[#202c39] p-2 rounded-[2.5rem] shadow-sm overflow-hidden mt-8'>
                    <div className='p-6 pb-2'>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>Find Us</h3>
                      <p className='text-sm text-gray-500 mb-4'>{(business as any).address}</p>
                    </div>
                    <div className='h-64 w-full rounded-[2rem] overflow-hidden relative'>
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          center={mapCenter}
                          zoom={15}
                          options={{ disableDefaultUI: true, zoomControl: true }}
                        >
                          <OverlayView position={mapCenter} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                            <div className='relative w-10 h-10 bg-[#0a2c24] rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2'>
                              <img src={GreenIcon.src} alt='Marker' className='w-6 h-6 object-contain' />
                            </div>
                          </OverlayView>
                        </GoogleMap>
                      ) : (
                        <div className='w-full h-full bg-gray-100 flex items-center justify-center text-gray-400'>
                          Loading Map...
                        </div>
                      )}

                      {/* Map Action Buttons */}
                      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 w-full justify-center px-4'>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((business as any).address)}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex-1 max-w-[160px] bg-white text-[#0a2c24] py-3 rounded-xl shadow-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0a2c24] hover:text-white transition-all'
                        >
                          <MapPin className='w-4 h-4' /> Google Maps
                        </a>
                        <a
                          href={`https://waze.com/ul?q=${encodeURIComponent((business as any).address)}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex-1 max-w-[160px] bg-[#33ccff] text-white py-3 rounded-xl shadow-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#33ccff]/90 transition-all'
                        >
                          <MapPin className='w-4 h-4' /> Waze
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {business.socialLinks && business.socialLinks.length > 0 && (
                    <div className='flex gap-4 justify-center py-6'>
                      {business.socialLinks.map((link, i) => {
                        const platform = link.platform.toLowerCase()
                        const Icon = platform.includes('facebook')
                          ? Facebook
                          : platform.includes('instagram')
                            ? Instagram
                            : platform.includes('twitter')
                              ? Twitter
                              : Globe
                        return (
                          <a
                            key={i}
                            href={link.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='w-12 h-12 rounded-full bg-white dark:bg-[#202c39] shadow-md flex items-center justify-center hover:scale-110 transition-transform text-[#0a2c24] dark:text-white border border-gray-100 dark:border-white/5'
                          >
                            <Icon className='w-5 h-5' />
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Branches (Old tab removed) */}
              {activeTab === 'reviews' && (
                <div className='space-y-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-2xl font-bold text-[#0a2c24] dark:text-white'>Customer Reviews</h2>
                    <div className='text-sm text-gray-500'>based on {businessReview().length} reviews</div>
                  </div>

                  {businessReview().length > 0 ? (
                    <div className='grid gap-4'>
                      {businessReview().map(review => (
                        <div
                          key={review.id}
                          className='bg-white dark:bg-[#202c39] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800'
                        >
                          <div className='flex items-start gap-4'>
                            <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-[#0a2c24] dark:text-white'>
                              {review.authorName.charAt(0)}
                            </div>
                            <div className='flex-1'>
                              <div className='flex justify-between items-start'>
                                <div>
                                  <h4 className='font-bold text-gray-900 dark:text-white'>{review.authorName}</h4>
                                  <div className='flex items-center gap-1 mt-1'>
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className='text-xs text-gray-400'>{format(review.date, 'MMM d, yyyy')}</span>
                              </div>
                              <p className='mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed'>
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12 bg-white dark:bg-[#202c39] rounded-[2rem]'>
                      <div className='w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Star className='w-8 h-8 text-gray-400' />
                      </div>
                      <h3 className='text-lg font-bold text-gray-900 dark:text-white'>No reviews yet</h3>
                      <p className='text-gray-500 text-sm'>Be the first to leave a review for this business!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / CTA (Desktop) */}
          <div className='lg:w-96 flex-shrink-0 space-y-6'>
            <div className='sticky top-28 space-y-6'>
              {/* Mini Booking Card */}
              <div className='bg-white dark:bg-[#202c39] rounded-[3rem] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden relative'>
                <div
                  className='absolute right-[-20px] top-[-20px] h-40 w-40 zerv-mask opacity-[0.05]'
                  style={{ background: '#0a2c24' }}
                />

                <h3 className='text-2xl font-bold text-[#202c39] dark:text-white mb-2 relative z-10'>Ready to Book?</h3>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-8 relative z-10 leading-relaxed'>
                  Select your preferred time and service to secure your appointment instantly.
                </p>

                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className='w-full bg-[#0a2c24] text-white font-bold py-4 rounded-full shadow-[0_10px_30px_rgba(10,44,36,0.3)] hover:shadow-[0_15px_40px_rgba(10,44,36,0.4)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md'
                  buttonText={{ plainText: 'Book Appointment Now' }}
                />

                <div className='mt-6 flex items-center justify-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 dark:bg-black/20 py-2 rounded-lg'>
                  <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                  High demand! 12 people looking now.
                </div>
              </div>

              {/* Verified Locations Google Map */}
              <div className='bg-white dark:bg-[#202c39] rounded-[3rem] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.08)] h-[300px] flex flex-col'>
                <div className='p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#202c39] z-10 relative'>
                  <h4 className='font-bold text-[#202c39] dark:text-white'>Location</h4>
                  <span className='text-xs text-[#77b6a3] font-medium flex items-center gap-1 cursor-pointer hover:underline'>
                    View larger <ChevronRight className='w-3 h-3' />
                  </span>
                </div>
                <div className='flex-1 w-full relative group'>
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={15}
                      options={{
                        disableDefaultUI: false, // Enable default UI for "View Larger Map" and others
                        zoomControl: true,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: true,
                        zoomControlOptions: {
                          position: 3 // google.maps.ControlPosition.TOP_RIGHT (using int for safety)
                        },
                        styles: [
                          {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                          }
                        ]
                      }}
                    >
                      <OverlayView position={mapCenter} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                        <div className='relative flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group'>
                          {/* Pulse Effect */}
                          <div className='absolute w-full h-full bg-[#0a2c24]/30 rounded-full animate-ping' />

                          {/* Main Marker */}
                          <div className='relative w-14 h-14 bg-white dark:bg-[#202c39] rounded-full border-[3px] border-[#0a2c24] shadow-[0_8px_20px_rgba(10,44,36,0.3)] flex items-center justify-center p-3 transition-transform duration-300 hover:scale-110 cursor-pointer'>
                            <img src={GreenIcon.src} alt='Marker' className='w-full h-full object-contain' />
                          </div>

                          {/* Ground Shadow */}
                          <div className='w-4 h-1 bg-black/20 rounded-full blur-[2px] mt-2' />
                        </div>
                      </OverlayView>
                    </GoogleMap>
                  ) : (
                    <div className='w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                      <p className='text-gray-400 text-sm'>Loading Map...</p>
                    </div>
                  )}

                  <div className='absolute bottom-4 left-4 right-4'>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((business as any)?.address || business?.name || '')}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-white text-[#202c39] w-full py-3 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 hover:bg-[#0a2c24] hover:text-white transition-all transform hover:scale-105'
                    >
                      <MapPin className='w-4 h-4' />
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModalV2Fixed
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialService={selectedService || undefined}
        branchId={selectedBranch?.id}
        businessId={params.slug}
      />

      {/* Login vs Guest Modal */}
      {showLoginGuestModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200'>
          <div className='bg-white dark:bg-[#202c39] rounded-[2rem] p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200'>
            <div className='text-center mb-8'>
              <div className='w-16 h-16 bg-[#0a2c24]/10 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <UserLockIcon className='w-8 h-8 text-[#0a2c24] dark:text-white' />
              </div>
              <h3 className='text-2xl font-bold text-[#0a2c24] dark:text-white mb-2'>Sign in to Book</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Sign in to access your saved details and manage your booking easily, or continue as a guest.
              </p>
            </div>

            <div className='space-y-3'>
              <Button
                onClick={handleLoginRedirect}
                className='w-full bg-[#0a2c24] text-white py-4 rounded-xl font-bold hover:bg-[#0a2c24]/90 transition-all shadow-lg active:scale-[0.98]'
                buttonText={{ plainText: 'Sign In' }}
              />
              <Button
                onClick={handleContinueAsGuest}
                variant='outlined'
                className='w-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]'
                buttonText={{ plainText: 'Continue as Guest' }}
              />
            </div>

            <button
              onClick={() => setShowLoginGuestModal(false)}
              className='mt-6 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-full text-center hover:underline transition-all'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
          }}
        />
      )}
    </div>
  )
}

export default businessDetailsPage
