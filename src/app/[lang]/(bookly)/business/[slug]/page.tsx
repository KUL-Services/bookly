'use client'
import { H1, H2, H3, P } from '@/bookly/components/atoms'
import { Badge } from '@/bookly/components/atoms/base-badge/badge'
import { Button } from '@/bookly/components/molecules'
import BookingModal from '@/bookly/components/organisms/booking-modal/booking-modal'
import { Card, CardContent } from '@/bookly/components/ui/card'
import { Clock, Globe, MapPin, Phone, Star } from 'lucide-react'
import { useState } from 'react'

const tabs = [
  { id: 'services', label: 'Services' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' }
]

const services = [
  {
    name: 'Premium Haircut',
    duration: '45 min',
    price: '$45',
    description: 'Professional haircut with wash and styling'
  },
  {
    name: 'Beard Trim',
    duration: '20 min',
    price: '$25',
    description: 'Precision beard trimming and shaping'
  },
  {
    name: 'Hair Wash & Style',
    duration: '30 min',
    price: '$30',
    description: 'Deep cleansing wash with professional styling'
  },
  {
    name: 'Full Service Package',
    duration: '90 min',
    price: '$85',
    description: 'Complete grooming package with haircut, beard trim, and styling'
  }
]

const reviews = [
  {
    name: 'John Smith',
    rating: 5,
    date: '2 days ago',
    comment: 'Excellent service! The barber was very professional and gave me exactly what I wanted. Highly recommend!'
  },
  {
    name: 'Mike Johnson',
    rating: 5,
    date: '1 week ago',
    comment: "Best haircut I've had in years. Great attention to detail and friendly staff."
  },
  {
    name: 'David Wilson',
    rating: 4,
    date: '2 weeks ago',
    comment: 'Good service and clean environment. Will definitely come back.'
  },
  {
    name: 'Alex Brown',
    rating: 5,
    date: '3 weeks ago',
    comment: "Amazing experience! The barber really knows what he's doing. Worth every penny."
  }
]

interface Service {
  name: string
  price: string
  duration: string
}

function businessDetailsPage() {
  const [activeTab, setActiveTab] = useState('services')
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const handelBookService = (service?: Service) => {
    if (service) {
      setSelectedService(service)
    } else {
      /* Alert you must choose a service */
    }
    setIsBookingModalOpen(true)
    console.log(`Booking Modal is ${isBookingModalOpen}`)
  }
  return (
    <div className='container mx-auto p-4 space-y-6 border border-red-500'>
      {/* Header Section */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row gap-6'>
            {/* Business Image */}
            <div className='w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden'>
              <img src='/modern-barber-shop.png' alt='Elite Barber Shop' className='w-full h-full object-cover' />
            </div>

            {/* Business Info */}
            <div className='flex-1 space-y-4'>
              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                <div>
                  <H1 stringProps={{ plainText: 'Elite Barber Shop' }} className='text-3xl font-bold text-gray-900' />
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='flex items-center'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                      ))}
                    </div>
                    <span className='text-sm text-gray-600'>4.8 (127 reviews)</span>
                  </div>
                  <Badge variant='secondary' className='mt-2'>
                    Open Now
                  </Badge>
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
                <div className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4' />
                  <span>123 Main Street, Downtown, NY 10001</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='w-4 h-4' />
                  <span>(555) 123-4567</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4' />
                  <span>Mon-Sat: 9:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Globe className='w-4 h-4' />
                  <span>www.elitebarbershop.com</span>
                </div>
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
      <div className='border-b border-gray-200 mx-auto max-w-4xl'>
        <nav className='flex space-x-8'>
          {tabs.map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant='text'
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-200'
              }`}
              buttonText={{ plainText: tab.label }}
            />
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='min-h-96 max-w-4xl mx-auto'>
        {activeTab === 'services' && (
          <div className='space-y-4'>
            <h2 className='text-2xl font-bold text-gray-900'>Our Services</h2>
            <div className='grid gap-4'>
              {services.map((service, index) => (
                <Card key={index}>
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <H3 stringProps={{ plainText: service.name }} className='font-semibold text-lg text-gray-900' />
                        {/* <h3 className='font-semibold text-lg text-gray-900'>{service.name}</h3> */}
                        <P stringProps={{ plainText: service.description }} className='text-gray-600 text-sm mt-1' />
                        {/* <p className=''>{service.description}</p> */}
                        <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                          <span className='flex items-center gap-1'>
                            <Clock className='w-4 h-4' />
                            {service.duration}
                          </span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-xl font-bold text-gray-900'>{service.price}</div>
                        <Button
                          buttonText={{ plainText: 'Book Now' }}
                          variant='contained'
                          className='mt-2 bg-black hover:bg-gray-900 text-white'
                          onClick={() =>
                            handelBookService({ name: service.name, price: service.price, duration: service.duration })
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

            {/* Review Summary */}
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center gap-6'>
                  <div className='text-center'>
                    <div className='text-4xl font-bold text-gray-900'>4.8</div>
                    <div className='flex items-center justify-center mt-1'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                      ))}
                    </div>
                    <div className='text-sm text-gray-600 mt-1'>127 reviews</div>
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
                          {rating === 5 ? '108' : rating === 4 ? '15' : '4'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Reviews */}
            <div className='space-y-4'>
              {reviews.map((review, index) => (
                <Card key={index}>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-700'>
                          {review.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-medium text-gray-900'>{review.name}</span>
                          <span className='text-sm text-gray-500'>{review.date}</span>
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

            <Card>
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
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 8:00 PM</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Saturday</span>
                      <span>9:00 AM - 8:00 PM</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Sunday</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                </div>

                <div>
                  <H3
                    stringProps={{ plainText: 'Location & Contact' }}
                    className='font-semibold text-lg text-gray-900 mb-2'
                  />
                  <div className='space-y-2 text-gray-700'>
                    <p>123 Main Street, Downtown, NY 10001</p>
                    <p>Phone: (555) 123-4567</p>
                    <p>Email: info@elitebarbershop.com</p>
                    <p>Website: www.elitebarbershop.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Calling the BookingModal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={selectedService?.name}
        servicePrice={selectedService?.price}
        serviceDuration={selectedService?.duration}
      />
    </div>
  )
}

export default businessDetailsPage
