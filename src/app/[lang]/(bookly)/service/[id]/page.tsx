'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { H1, H2, H3, P } from '@/bookly/components/atoms'
import { Badge } from '@/bookly/components/atoms/base-badge/badge'
import { Avatar, Button } from '@/bookly/components/molecules'
import BookingModal from '@/bookly/components/organisms/booking-modal/booking-modal'
import { Card, CardContent } from '@/bookly/components/ui/card'
import { ServicesService } from '@/lib/api'
import type { Service } from '@/lib/api'
import { Clock, MapPin, Star, Users } from 'lucide-react'

export default function ServiceDetailPage() {
  const router = useRouter()
  const params = useParams<{ lang: string; id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await ServicesService.getService(params.id)
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setService(response.data)
        }
      } catch (err) {
        setError('Failed to load service')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.id])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600'></div>
          <p className='mt-4 text-gray-600'>Loading service...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Service Not Found</h1>
          <p className='text-gray-600 mb-6'>{error || 'The service you\'re looking for doesn\'t exist.'}</p>
          <Button
            buttonText={{ plainText: 'Back to Search' }}
            variant='contained'
            onClick={() => router.push(`/${params.lang}/search`)}
          />
        </div>
      </div>
    )
  }

  const handleBookService = () => {
    setIsBookingModalOpen(true)
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='container mx-auto p-4 space-y-6'>
        {/* Header Section */}
        <Card className='shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-6'>
              {/* Service Image */}
              <div className='w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden'>
                <div className='w-full h-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center'>
                  <div className='text-4xl text-teal-600'>
                    {service.name.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className='flex-1 space-y-4'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                  <div>
                    <H1 stringProps={{ plainText: service.name }} className='text-3xl font-bold text-gray-900' />

                    {/* Business Info */}
                    {service.business && (
                      <div className='mt-2'>
                        <Button
                          buttonText={{ plainText: service.business.name }}
                          variant='text'
                          className='text-teal-600 hover:text-teal-700 p-0 text-lg'
                          onClick={() => router.push(`/${params.lang}/business/${service.business?.name.toLowerCase().replace(/\s+/g, '-')}`)}
                        />
                      </div>
                    )}

                    {/* Rating */}
                    <div className='flex items-center gap-2 mt-2'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                        ))}
                      </div>
                      <span className='text-sm text-gray-600'>4.8 ({service.reviews?.length || 0} reviews)</span>
                    </div>

                    {/* Categories */}
                    <div className='flex gap-2 mt-2'>
                      {service.categories?.map((category) => (
                        <Badge key={category.id} className='bg-teal-100 text-teal-800'>
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      buttonText={{ plainText: 'Save' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:heart' }}
                      className='w-full bg-white text-gray-900 shadow-lg border-gray-400'
                    />
                    <Button
                      buttonText={{ plainText: 'Share' }}
                      variant='outlined'
                      prefixIcon={{ icon: 'lucide:share' }}
                      className='w-full bg-white text-gray-900 shadow-lg border-gray-400'
                    />
                  </div>
                </div>

                {/* Service Details */}
                <div className='space-y-2 text-sm text-gray-600'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='w-4 h-4' />
                    <span>{service.location}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='w-4 h-4' />
                    <span>{service.duration} minutes</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Users className='w-4 h-4' />
                    <span>Available at {service.branches?.length || 0} locations</span>
                  </div>
                </div>

                {/* Pricing and Booking */}
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-3xl font-bold text-gray-900'>${service.price}</div>
                    <div className='text-sm text-gray-600'>{service.duration} minutes</div>
                  </div>
                  <Button
                    buttonText={{ plainText: 'Book Now' }}
                    variant='contained'
                    className='bg-black hover:bg-gray-900 text-white px-8 py-3'
                    onClick={handleBookService}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description Section */}
        {service.description && (
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              <H2 stringProps={{ plainText: 'About This Service' }} className='text-2xl font-bold text-gray-900 mb-4' />
              <P stringProps={{ plainText: service.description }} className='text-gray-700 dark:[color:rgb(55_65_81)] leading-relaxed' />
            </CardContent>
          </Card>
        )}

        {/* Branches Section */}
        {service.branches && service.branches.length > 0 && (
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              <H2 stringProps={{ plainText: 'Available Locations' }} className='text-2xl font-bold text-gray-900 mb-4' />
              <div className='space-y-4'>
                {service.branches.map((branch) => (
                  <div key={branch.id} className='border border-gray-200 rounded-lg p-4'>
                    <H3 stringProps={{ plainText: branch.name }} className='font-semibold text-lg text-gray-900' />
                    {branch.address && (
                      <div className='flex items-center gap-2 mt-2 text-gray-600'>
                        <MapPin className='w-4 h-4' />
                        <span>{branch.address}</span>
                      </div>
                    )}
                    {branch.mobile && (
                      <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <span>📞</span>
                        <span>{branch.mobile}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        {service.reviews && service.reviews.length > 0 && (
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <H2 stringProps={{ plainText: 'Customer Reviews' }} className='text-2xl font-bold text-gray-900' />
                <Button
                  variant='outlined'
                  buttonText={{ plainText: 'Write a Review' }}
                  className='bg-white text-gray-900 shadow-lg border-gray-400'
                />
              </div>

              <div className='space-y-4'>
                {service.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className='border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-start gap-3'>
                      <Avatar
                        avatarTitle={review.user?.firstName + ' ' + review.user?.lastName || 'Anonymous'}
                        size='4XL'
                        alt='Reviewer'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-medium text-gray-900'>
                            {review.user?.firstName + ' ' + review.user?.lastName || 'Anonymous'}
                          </span>
                          <div className='flex items-center'>
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className='text-gray-700 dark:[color:rgb(55_65_81)] text-sm'>{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={service.name}
        servicePrice={service.price.toString()}
        serviceDuration={service.duration.toString()}
      />
    </div>
  )
}