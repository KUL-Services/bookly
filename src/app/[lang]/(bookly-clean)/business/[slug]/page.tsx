'use client'
import { H1, H2, H3, P } from '@/bookly/components/atoms'
import { Badge } from '@/bookly/components/atoms/base-badge/badge'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { Avatar, Button } from '@/bookly/components/molecules'
import { BranchDetailsModal } from '@/bookly/components/molecules/branch-details-modal/branch-details-modal.component'
import BookingModalV2Fixed from '@/bookly/components/organisms/booking-modal/booking-modal-v2-fixed'
import { Card, CardContent } from '@/bookly/components/ui/card'
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
import { PageLoader } from '@/components/LoadingStates'
import { useState, useEffect, useMemo, useCallback, useRef, TouchEvent, MouseEvent } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { BusinessService, ServicesService, BranchesService, StaffService } from '@/lib/api'
import { GoogleMap, useJsApiLoader, OverlayView, Marker } from '@react-google-maps/api'
import type { Business, Service as ApiService, Branch, Staff } from '@/lib/api'
import initTranslations from '@/app/i18n/i18n'
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

function BusinessDetailsPage() {
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
        console.error('Failed to fetch business data:', err)
        setBusiness(null)
        setError('Failed to load business details.')
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
  //     price: 'E£45',
  //     description: 'Professional haircut with wash and styling'
  //   },
  //   {
  //     name: 'Beard Trim',
  //     duration: '20 min',
  //     price: 'E£25',
  //     description: 'Precision beard trimming and shaping'
  //   },
  //   {
  //     name: 'Hair Wash & Style',
  //     duration: '30 min',
  //     price: 'E£30',
  //     description: 'Deep cleansing wash with professional styling'
  //   },
  //   {
  //     name: 'Full Service Package',
  //     duration: '90 min',
  //     price: 'E£85',
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
    router.push(`/${params.lang}/customer/login?redirect=${returnUrl}`)
    setShowLoginGuestModal(false)
  }

  const handleContinueAsGuest = () => {
    setShowLoginGuestModal(false)
    setIsBookingModalOpen(true)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
        <PageLoader />
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
            <button className='px-6 py-3 border border-[#0a2c24] dark:border-[#77b6a3] bg-transparent text-[#0a2c24] dark:text-[#77b6a3] hover:bg-[#0a2c24] hover:text-white dark:hover:bg-[#77b6a3] dark:hover:text-[#0a2c24] font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'>
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
      {/* Mobile Floating Action Buttons - Top */}
      <div className='lg:hidden fixed top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none'>
        <button
          onClick={() => router.back()}
          className='pointer-events-auto p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-[#0a2c24] transition-all active:scale-95 shadow-lg'
          aria-label='Go back'
        >
          <ChevronLeft className='w-5 h-5' />
        </button>
        <div className='pointer-events-auto flex gap-2'>
          <button
            className='p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-[#0a2c24] transition-all active:scale-95 shadow-lg'
            aria-label='Save'
          >
            <Heart className='w-5 h-5' />
          </button>
          <button
            className='p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-[#0a2c24] transition-all active:scale-95 shadow-lg'
            aria-label='Share'
          >
            <Share className='w-5 h-5' />
          </button>
        </div>
      </div>
      {/* Hero Cover Section - Shorter on mobile */}
      <div className='relative h-[40vh] min-h-[300px] lg:h-[50vh] lg:min-h-[550px] w-full overflow-hidden group rounded-b-[2rem] lg:rounded-b-[4rem] border-b-2 border-[#0a2c24]'>
        <div className='absolute inset-0 bg-gray-900'>
          <img
            src={(business as any).coverImageUrl || '/images/business-placeholder.jpg'}
            alt='Cover'
            className='w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000'
          />
          <div className='absolute inset-0 bg-[#202c39]/60' />
        </div>

        {/* Hero Content */}
        <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 z-20'>
          <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-4 lg:gap-6'>
            {/* Logo - Smaller on mobile */}
            <div className='relative -mb-10 lg:-mb-16 flex-shrink-0'>
              <div className='w-20 h-20 lg:w-40 lg:h-40 rounded-xl lg:rounded-2xl p-1 bg-white dark:bg-[#202c39] shadow-2xl'>
                <img
                  src={(business as any).logoUrl || '/images/business-placeholder.jpg'}
                  alt='Logo'
                  className='w-full h-full object-cover rounded-lg lg:rounded-xl'
                />
              </div>
            </div>

            {/* Title & Info - Compact on mobile */}
            <div className='flex-1 mb-4 lg:mb-4 text-white'>
              <div className='flex flex-wrap items-center gap-2 lg:gap-3 mb-2 lg:mb-3'>
                <Badge className='bg-[#77b6a3] text-white px-2 lg:px-3 py-0.5 lg:py-1 text-[10px] lg:text-xs uppercase tracking-wider font-bold rounded-md lg:rounded-lg border-none'>
                  Open Now
                </Badge>
                <div className='flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 lg:px-3 py-0.5 lg:py-1 rounded-md lg:rounded-lg border border-white/20'>
                  <Star className='w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 fill-yellow-400' />
                  <span className='text-xs lg:text-sm font-bold'>{business.rating}</span>
                  <span className='hidden lg:inline text-xs text-white/80'>({business.reviews?.length} verified)</span>
                </div>
              </div>
              <h1 className='text-2xl sm:text-3xl lg:text-6xl font-extrabold tracking-tight text-white mb-2 lg:mb-4 drop-shadow-xl line-clamp-2'>
                {business.name}
              </h1>
              <div className='flex items-center gap-2 text-xs lg:text-base text-gray-100 font-medium'>
                <MapPin className='w-3 h-3 lg:w-4 lg:h-4 text-[#77b6a3] flex-shrink-0' />
                <span className='line-clamp-1'>{(business as any).address || 'Location varies'}</span>
              </div>
            </div>

            {/* Desktop Action Buttons - Hidden on mobile */}
            <div className='hidden lg:flex gap-3 mb-6'>
              <button
                className='p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-[#0a2c24] hover:border-[#0a2c24] transition-all duration-300 hover:scale-110 active:scale-95 group'
                aria-label='Save'
              >
                <Heart className='w-6 h-6' />
              </button>
              <button
                className='p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-[#0a2c24] hover:border-[#0a2c24] transition-all duration-300 hover:scale-110 active:scale-95'
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
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Tabs & Content - Left Side */}
          <div className='flex-1 min-w-0'>
            {' '}
            {/* Refined Sticky Navigation - Positioned below mobile header buttons */}
            <div className='sticky top-[60px] lg:top-[64px] z-20 mb-6 lg:mb-8 bg-[#f7f8f9]/95 dark:bg-[#0a2c24]/95 backdrop-blur-md py-3 lg:py-4 -mx-4 px-4 sm:mx-0 sm:px-0 transition-all duration-300 border-b border-gray-200/50 dark:border-white/5'>
              {/* Mobile: Segmented Control Style */}
              <div className='lg:hidden flex bg-gray-100 dark:bg-white/10 rounded-xl p-1 relative'>
                {getTabsWithTranslation(t).map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 touch-manipulation relative z-10
                      ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-[#0a2c24] text-[#0a2c24] dark:text-white shadow-md'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Desktop: Original Pill Style */}
              <div className='hidden lg:flex items-center gap-3 overflow-x-auto no-scrollbar'>
                {getTabsWithTranslation(t).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-6 py-2.5 rounded-full text-base font-bold transition-all duration-300 border
                      bg-transparent text-[#0a2c24] dark:text-white border-[#0a2c24]/30 dark:border-[#77b6a3]/40
                      hover:bg-[#0a2c24] hover:text-white hover:border-[#0a2c24]
                      dark:hover:bg-[#77b6a3] dark:hover:text-[#0a2c24] dark:hover:border-[#77b6a3]
                      whitespace-nowrap flex-shrink-0
                      ${
                        activeTab === tab.id
                          ? 'bg-[#0a2c24]/5 dark:bg-[#77b6a3]/10 text-[#0a2c24] dark:text-[#77b6a3] border-[#0a2c24] dark:border-[#77b6a3] shadow-sm'
                          : 'bg-white/75 dark:bg-white/5 text-[#0a2c24]/85 dark:text-white/80 hover:shadow-md'
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
                <div className='space-y-8 lg:space-y-12'>
                  {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    <div key={category} className='space-y-4 lg:space-y-6'>
                      <div className='flex items-center justify-between'>
                        <h2 className='text-lg lg:text-2xl font-bold text-[#202c39] dark:text-white tracking-tight flex items-center gap-2 lg:gap-3'>
                          <span className='w-1.5 lg:w-2 h-6 lg:h-8 bg-[#0a2c24] dark:bg-[#77b6a3] rounded-full'></span>
                          {category}
                        </h2>
                      </div>

                      <div className='grid gap-3 lg:gap-5'>
                        {categoryServices.map((service, index) => (
                          <div
                            key={service.id || index}
                            className='group relative bg-white dark:bg-[#202c39] rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-white/5'
                          >
                            {/* Mobile: Compact horizontal layout */}
                            <div className='lg:hidden'>
                              <div className='flex flex-col gap-3'>
                                <div className='flex justify-between items-start gap-4'>
                                  <h3 className='text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight flex-1'>
                                    {service.name}
                                  </h3>
                                  <span className='flex-shrink-0 text-lg font-bold text-[#0a2c24] dark:text-[#77b6a3] whitespace-nowrap'>
                                    {currency === 'AED' ? 'AED' : currency === 'SAR' ? 'SAR' : 'EGP'} {service.price}
                                  </span>
                                </div>

                                <div className='flex items-center justify-between mt-1'>
                                  <span className='inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-xs font-medium text-gray-600 dark:text-gray-300'>
                                    <Clock className='w-3.5 h-3.5 mr-1.5 opacity-70' />
                                    {service.duration} {t('business.branchDetails.duration')}
                                  </span>{' '}
                                  <button
                                    onClick={() => handelBookService(service)}
                                    className='bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] px-6 py-2 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-all'
                                  >
                                    {t('business.branchDetails.book')}
                                  </button>
                                </div>
                              </div>
                              {service.description && (
                                <p className='text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2'>
                                  {service.description}
                                </p>
                              )}
                            </div>

                            {/* Desktop: Original layout */}
                            <div className='hidden lg:block relative z-10'>
                              <div className='flex flex-col sm:flex-row gap-6 items-start sm:items-center'>
                                <div className='flex-1 space-y-2'>
                                  <div className='flex items-center gap-3'>
                                    <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0a2c24] dark:group-hover:text-[#77b6a3] transition-colors'>
                                      {service.name}
                                    </h3>
                                    <span className='px-2.5 py-1 bg-[#0a2c24]/5 dark:bg-white/5 text-xs font-medium text-[#0a2c24] dark:text-[#77b6a3] rounded-full'>
                                      {service.duration} {t('business.branchDetails.duration')}
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
                                  </div>{' '}
                                  <Button
                                    onClick={() => handelBookService(service)}
                                    buttonText={{ plainText: t('business.branchDetails.book') }}
                                    className='bg-transparent border border-[#0a2c24] dark:border-[#77b6a3] text-[#0a2c24] dark:text-[#77b6a3] px-6 py-2.5 rounded-xl font-bold hover:bg-[#0a2c24] hover:text-white dark:hover:bg-[#77b6a3] dark:hover:text-[#0a2c24] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                  />
                                </div>
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
                            onClick={() => scrollStaff('left')}
                            className='p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                          >
                            <ChevronLeft className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                          </button>
                          <button
                            onClick={() => scrollStaff('right')}
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
                            onClick={() => {
                              setSelectedBranch(branch)
                              setBranchModalOpen(true)
                            }}
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
                          <Marker
                            position={mapCenter}
                            icon={{
                              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                              fillColor: '#0a2c24',
                              fillOpacity: 1,
                              strokeColor: '#ffffff',
                              strokeWeight: 2,
                              scale: 2,
                              anchor: new google.maps.Point(12, 22)
                            }}
                          />
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
                <h3 className='text-2xl font-bold text-[#202c39] dark:text-white mb-2 relative z-10'>Ready to Book?</h3>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-8 relative z-10 leading-relaxed'>
                  Select your preferred time and service to secure your appointment instantly.
                </p>

                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className='w-full bg-transparent border border-[#0a2c24] dark:border-[#77b6a3] text-[#0a2c24] dark:text-[#77b6a3] font-bold py-4 rounded-full shadow-md hover:bg-[#0a2c24] hover:text-white dark:hover:bg-[#77b6a3] dark:hover:text-[#0a2c24] hover:shadow-[0_15px_40px_rgba(10,44,36,0.4)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md'
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
                      <Marker
                        position={mapCenter}
                        icon={{
                          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                          fillColor: '#0a2c24',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                          scale: 2,
                          anchor: new google.maps.Point(12, 22)
                        }}
                      />
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
      </div>{' '}
      <BookingModalV2Fixed
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialService={selectedService || undefined}
        branchId={selectedBranch?.id || branches[0]?.id}
        businessId={params.slug}
        availableServices={services}
        availableStaff={staff}
      />
      {/* Login vs Guest Modal */}
      {showLoginGuestModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-md flex items-end lg:items-center justify-center z-[100] p-0 lg:p-4 animate-in fade-in duration-200'>
          <div className='bg-white dark:bg-[#202c39] rounded-t-[2rem] lg:rounded-[2rem] p-6 lg:p-8 w-full lg:max-w-md shadow-2xl scale-100 animate-in slide-in-from-bottom-4 lg:zoom-in-95 duration-300'>
            {/* Drag Handle - Mobile only */}
            <div className='lg:hidden w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6' />

            <div className='text-center mb-8'>
              <div className='w-20 h-20 bg-gradient-to-br from-[#0a2c24] to-[#2a9d8f] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg'>
                <UserLockIcon className='w-10 h-10 text-white' />
              </div>
              <h3 className='text-2xl font-bold text-[#0a2c24] dark:text-white mb-3'>Sign in to Book</h3>
              <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto'>
                Sign in to save your details and manage bookings, or continue as guest.
              </p>
            </div>

            <div className='space-y-4'>
              <button
                onClick={handleLoginRedirect}
                className='w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0a2c24] to-[#1a4d3e] text-white h-14 rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-lg active:scale-[0.98] touch-manipulation'
              >
                <UserLockIcon className='w-5 h-5' />
                Sign In
              </button>
              <button
                onClick={handleContinueAsGuest}
                className='w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-white/10 text-[#0a2c24] dark:text-white h-14 rounded-2xl font-bold text-base hover:bg-gray-200 dark:hover:bg-white/15 transition-all active:scale-[0.98] touch-manipulation'
              >
                Continue as Guest
              </button>
            </div>

            <button
              onClick={() => setShowLoginGuestModal(false)}
              className='mt-6 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-full text-center py-3 transition-all touch-manipulation'
            >
              Cancel
            </button>
          </div>
        </div>
      )}{' '}
      {/* Mobile Sticky Booking Button - positioned above bottom nav */}
      <div className='lg:hidden fixed inset-x-0 bottom-[calc(var(--mobile-bottom-nav-offset)+8px)] z-40 px-3'>
        <div className='mx-auto max-w-md rounded-2xl border border-[#0a2c24]/10 dark:border-white/15 bg-white/95 dark:bg-[#202c39]/95 backdrop-blur-xl px-3 py-2.5 shadow-[0_12px_28px_rgba(10,44,36,0.16)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.35)]'>
          <div className='flex items-center gap-3'>
            <div className='flex-1 min-w-0'>
              <p className='text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]'>
                {t('business.branchDetails.startingFrom')}
              </p>
              <p className='text-xl font-bold text-[#0a2c24] dark:text-[#77b6a3]'>
                {currency || 'EGP'}{' '}
                {services.length > 0 ? Math.min(...services.map(s => parseFloat((s as any).price) || 0)) : '---'}
              </p>
            </div>
            <button
              onClick={() => {
                if (!booklyUser) {
                  setShowLoginGuestModal(true)
                } else {
                  setIsBookingModalOpen(true)
                }
              }}
              className='flex-shrink-0 bg-gradient-to-r from-[#0a2c24] to-[#155b4a] dark:from-[#77b6a3] dark:to-[#5a9a87] text-white dark:text-[#0a2c24] px-7 py-3 rounded-xl font-bold text-base hover:opacity-95 transition-all duration-300 active:scale-95 touch-manipulation shadow-[0_8px_18px_rgba(10,44,36,0.25)] dark:shadow-[0_8px_18px_rgba(0,0,0,0.35)]'
            >
              {t('business.branchDetails.book') || 'Book Now'}
            </button>
          </div>
        </div>
      </div>
      {/* Spacer for mobile to account for sticky booking button + bottom nav */}
      <div className='lg:hidden h-[10px]' />
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

export default BusinessDetailsPage
