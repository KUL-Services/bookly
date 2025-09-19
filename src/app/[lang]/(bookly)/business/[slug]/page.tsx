'use client'
import { H1, H2, H3, P } from '@/bookly/components/atoms'
import { Badge } from '@/bookly/components/atoms/base-badge/badge'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { Avatar, Button } from '@/bookly/components/molecules'
import { BranchDetailsModal } from '@/bookly/components/molecules/branch-details-modal/branch-details-modal.component'
import BookingModal from '@/bookly/components/organisms/booking-modal/booking-modal'
import { Card, CardContent } from '@/bookly/components/ui/card'
import { mockBusinesses, mockReviews, mockServices } from '@/bookly/data/mock-data'
import { format } from 'date-fns'
import { Clock, Globe, MapPin, Phone, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { BusinessService, ServicesService, BranchesService, StaffService } from '@/lib/api'
import type { Business, Service as ApiService, Branch, Staff } from '@/lib/api'

const tabs = [
  { id: 'services', label: 'Services' },
  { id: 'branches', label: 'Branches' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' }
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
  const params = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<ApiService[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true)
        // Try to fetch business by slug/name
        const businessesResponse = await BusinessService.getApprovedBusinesses()

        if (businessesResponse.data) {
          // Find business by slug (convert name to slug format)
          const foundBusiness = businessesResponse.data.find(
            b => b.name.toLowerCase().replace(/\s+/g, '-') === params.slug
          )

          if (foundBusiness) {
            setBusiness(foundBusiness)

            // Fetch all related data in parallel
            const [servicesResponse, branchesResponse, staffResponse] = await Promise.all([
              ServicesService.getServices(),
              BranchesService.getBranches(),
              StaffService.getStaff()
            ])

            // Filter services for this business
            if (servicesResponse.data) {
              const businessServices = servicesResponse.data.filter(s => s.businessId === foundBusiness.id)
              setServices(businessServices)
            }

            // Filter branches for this business
            if (branchesResponse.data) {
              const businessBranches = branchesResponse.data.filter(b => b.businessId === foundBusiness.id)
              setBranches(businessBranches)
            } else {
              // Fallback to mock branches if API fails
              setBranches((mockBusinesses[0] as any).branches || [])
            }

            // Filter staff for this business
            if (staffResponse.data) {
              const businessStaff = staffResponse.data.filter(s => s.businessId === foundBusiness.id)
              setStaff(businessStaff)
            } else {
              // Fallback to empty staff if API fails
              setStaff([])
            }

          } else {
            // Fallback to mock data if business not found
            const mockBusiness = mockBusinesses[0] as any
            setBusiness(mockBusiness)
            setBranches(mockBusiness.branches || [])
            setStaff([])

            const serviceIds = mockBusiness.services
            const mockServicesForBusiness = mockServices
              .filter(service => serviceIds.includes(service.id))
              .map(service => ({
                id: service.id,
                name: service.name,
                description: service.description,
                location: service.location || 'Main Location',
                price: service.price,
                duration: service.duration,
                businessId: service.businessId,
                categories: [],
                branches: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }))
            setServices(mockServicesForBusiness)
          }
        } else {
          throw new Error('Failed to fetch businesses')
        }
      } catch (err) {
        console.warn('Failed to fetch business data, using fallback:', err)
        const mockBusiness = mockBusinesses[0] as any
        setBusiness(mockBusiness)
        setBranches(mockBusiness.branches || [])
        setStaff([])

        const serviceIds = mockBusiness.services
        const mockServicesForBusiness = mockServices
          .filter(service => serviceIds.includes(service.id))
          .map(service => ({
            id: service.id,
            name: service.name,
            description: service.description,
            location: service.location || 'Main Location',
            price: service.price,
            duration: service.duration,
            businessId: service.businessId,
            categories: [],
            branches: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        setServices(mockServicesForBusiness)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessData()
  }, [params.slug])

  const businessReview = (): Review[] => {
    if (!business) return []
    const reviewIds = (business as any).reviews || []
    return mockReviews
      .filter(review => reviewIds.includes(review.id))
      .map(review => ({
        id: review.id,
        authorName: review.authorName,
        authorImage: review.authorImage,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        businessId: review.businessId
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
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [branchModalOpen, setBranchModalOpen] = useState(false)

  const handelBookService = (service?: { name: string; price: string; duration: string }) => {
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
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading business...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Business not found</h1>
          <p className='text-gray-600'>The business you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <div className='container mx-auto p-4 space-y-6 flex-none'>
        {/* Header Section */}
        <Card className='shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-6'>
              {/* Business Image */}
              <div className='w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden'>
                <img
                  src={(business as any).logo || (business as any).coverImage || '/images/business-placeholder.jpg'}
                  alt={business.name}
                  className='w-full h-full object-cover'
                />
              </div>

              {/* Business Info */}
              <div className='flex-1 space-y-4'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                  <div>
                    <H1 stringProps={{ plainText: `${business.name}` }} className='text-3xl font-bold text-gray-900' />
                    <div className='flex items-center gap-2 mt-2'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                        ))}
                      </div>
                      <span className='text-sm text-gray-600'>4.8 (127 reviews)</span>
                    </div>
                    <Badge className='mt-2 bg-teal-500 text-teal-50'>Open Now</Badge>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      buttonText={{ plainText: 'Save' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:heart' }}
                      className='w-full bg-white text-gray-900 shadow-lg border-gray-400 hover:shadow-none hover: border-none hover:bg-transparent'
                    />
                    <Button
                      buttonText={{ plainText: 'Share' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:share' }}
                      className='w-full bg-white text-gray-900 shadow-lg border-gray-400 hover:shadow-none hover: border-none hover:bg-transparent'
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className='space-y-2 text-sm text-gray-600'>
                  {(business as any).address && (
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4' />
                      <span>{(business as any).address}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className='flex items-center gap-2'>
                      <Phone className='w-4 h-4' />
                      <span>{business.email}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <Clock className='w-4 h-4' />
                    <span>
                      {(business as any).openingHours
                        ? `Mon-Wed: ${(business as any).openingHours['Mon'] || '9AM-6PM'} , Thu-Fri: ${(business as any).openingHours['Thu'] || '9AM-6PM'}, Sat: ${(business as any).openingHours['Sat'] || '10AM-4PM'}, Sun: ${(business as any).openingHours['Sun'] || 'Closed'}`
                        : 'Mon-Sat: 9AM-6PM, Sun: Closed'}
                    </span>
                  </div>
                  {(business as any).website && (
                    <div className='flex items-center gap-2'>
                      <Globe className='w-4 h-4' />
                      <span>{(business as any).website}</span>
                    </div>
                  )}
                </div>
                <Button
                  buttonText={{ plainText: 'Book Appointment' }}
                  variant='contained'
                  className=' bg-black hover:bg-gray-900 text-white'
                  /* oncLick: push client to book a promoted service */
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <div className='mx-auto max-w-4xl rounded-lg border border-gray-200 shadow-sm sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70'>
          <nav className='flex justify-center space-x-8'>
            {tabs.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant='text'
                size='lg'
                className={`w-full py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-200'
                }`}
                buttonText={{ plainText: tab.label }}
              />
            ))}
          </nav>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {/* mockServices[mockBusinesses[0].services] */}
        {/* Tab Content */}
        <div className='min-h-96 max-w-4xl mx-auto px-4 pb-8'>
          {activeTab === 'services' && (
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold text-gray-900'>Our Services</h2>
              <div className='grid gap-4'>
                {services.map((service, index) => (
                  <Card key={service.id || index} className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardContent className='p-4'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <H3
                            stringProps={{ plainText: service.name }}
                            className='font-semibold text-lg text-gray-900'
                          />
                          <P
                            stringProps={{ plainText: service.description || '' }}
                            className='text-gray-600 text-sm mt-1'
                          />
                          <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                            <span className='flex items-center gap-1'>
                              <Clock className='w-4 h-4' />
                              {service.duration} min
                            </span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-xl font-bold text-gray-900'>${service.price}</div>
                          <Button
                            buttonText={{ plainText: 'Book Now' }}
                            variant='contained'
                            className='mt-2 bg-black hover:bg-gray-900 text-white'
                            onClick={() =>
                              handelBookService({
                                name: service.name,
                                price: service.price.toString(),
                                duration: `${service.duration} min`
                              })
                            }
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
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold text-gray-900'>Our Locations</h2>
              {branches && branches.length > 0 ? (
                <div className='grid gap-4 md:grid-cols-2'>
                  {branches.map((branch, index) => (
                    <Card key={branch.id || index} className='shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                      onClick={() => {
                        setSelectedBranch(branch)
                        setBranchModalOpen(true)
                      }}
                    >
                      <CardContent className='p-6'>
                        <div className='flex items-start gap-4'>
                          <BusinessAvatar
                            businessName={branch.name}
                            className='w-16 h-16 rounded-lg flex-shrink-0'
                            size='lg'
                          />
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-lg font-semibold text-gray-900 mb-1'>{branch.name}</h3>
                            <div className='space-y-2 text-sm text-gray-600'>
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
                              <div className='flex items-center gap-2'>
                                <Clock className='w-4 h-4 flex-shrink-0' />
                                <span>Open today: 9AM-6PM</span>
                              </div>
                            </div>
                            <div className='mt-3 flex items-center justify-between'>
                              <span className='text-sm text-teal-600 font-medium'>View Details →</span>
                              <div className='flex gap-1'>
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                                ))}
                                <span className='text-xs text-gray-500 ml-1'>4.8</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className='shadow-sm'>
                  <CardContent className='p-8 text-center'>
                    <div className='text-gray-400 mb-3'>
                      <MapPin className='w-12 h-12 mx-auto' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>No branches available</h3>
                    <p className='text-gray-600'>This business operates from a single location.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <H2 stringProps={{ plainText: 'Customer Reviews' }} className='text-2xl font-bold text-gray-900' />
                {/* <h2 className='text-2xl font-bold text-gray-900'>Customer Reviews</h2> */}

                <Button
                  variant='outlined'
                  buttonText={{ plainText: 'Write a Review' }}
                  className='bg-white text-gray-900 shadow-lg border-gray-400 hover:shadow-none hover: border-none hover:bg-transparent'
                />
              </div>
              {/* {[...Array(5)].map((_, i) => (
                        <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                      ))} */}
              {/* Review Summary */}
              <Card className='shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-6'>
                    <div className='text-center'>
                      <div className='text-4xl font-bold text-gray-900'>4.8</div>
                      <div className='flex items-center justify-center mt-1'>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                        ))}{' '}
                      </div>
                      <div className='text-sm text-gray-600 mt-1'>{(business as any).totalRatings || 0} reviews</div>
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
                            {/* {rating === 5 ? '108' : rating === 4 ? '15' : '4'} */}
                            {(business as any).averageRating || '0'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className='space-y-4'>
                {businessReview().map((review, index) => (
                  <Card key={index} className='shadow-sm hover:shadow-md transition-shadow'>
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        {/* <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-700'>
                          {review.authorName
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </span>
                      </div> */}
                        <Avatar avatarTitle='Aly Lashin' imageUrl={review.authorImage} size='4XL' alt='Aly Lashin' />
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-medium text-gray-900'>{review.authorName}</span>
                            <span className='text-sm text-gray-500'>{format(review.date, 'yyyy-MM-dd')}</span>
                            <div className='flex items-center mb-2'>
                              {[...Array(review.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className='text-gray-700 text-sm'>{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className='space-y-6'>
              <H2 stringProps={{ plainText: 'About Elite Barber Shop' }} className='text-2xl font-bold text-gray-900' />

              <Card className='shadow-sm'>
                <CardContent className='p-6 space-y-4'>
                  <div>
                    <H3 stringProps={{ plainText: 'Our Story' }} className='font-semibold text-lg text-gray-900 mb-2' />

                    <P
                      stringProps={{
                        plainText:
                          ' Elite Barber Shop has been serving the downtown community for over 15 years. We pride ourselves on providing exceptional grooming services  in a welcoming, professional environment. Our experience barbers are passionate about their craft and committed to helping every client look and feel their best.'
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
                        <span>Monday - Wensday</span>
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
                      <P
                        stringProps={{ plainText: `Address: ${(business as any).address || 'No address provided'}` }}
                      />
                      <P stringProps={{ plainText: 'Phone: (555) 123-4567' }} />
                      <P stringProps={{ plainText: 'Email: info@elitebarbershop.com' }} />
                      <P stringProps={{ plainText: 'Email: info@elitebarbershop.com' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Calling the BookingModal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={selectedService?.name}
        servicePrice={selectedService?.price}
        serviceDuration={selectedService?.duration}
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
          onBranchChange={(newBranch) => {
            setSelectedBranch(newBranch)
          }}
          onBookService={(serviceId) => {
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
