'use client'

import { useState, useEffect, useRef } from 'react'
import { format, addMinutes, addDays } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../../molecules'
import { KulIcon } from '../../atoms'
import { Input } from '../../ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../ui/form'
import { combineDateTimeToUTC } from '@/bookly/utils/timezone.util'
import { downloadICS } from '@/bookly/utils/ics-generator.util'
import { BookingService } from '@/lib/api'
import type { Service, Staff } from '@/lib/api/types'

interface BookingModalV2FixedProps {
  isOpen: boolean
  onClose: () => void
  initialService?: Service
  branchId?: string
}

interface SelectedService {
  id: string
  service: Service
  providerId: string
  providerName: string
  time: string
  endTime: string
}

type Period = 'Morning' | 'Afternoon' | 'Evening'

const detailsFormSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.email('Invalid email'),
  phone: z.string().optional(),
  notes: z.string().optional()
})

type DetailsFormValues = z.infer<typeof detailsFormSchema>

function BookingModalV2Fixed({ isOpen, onClose, initialService, branchId }: BookingModalV2FixedProps) {
  const [currentStep, setCurrentStep] = useState<'selection' | 'details' | 'success'>('selection')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 8, 29))
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Afternoon')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date(2025, 8, 29))
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [showStaffSelector, setShowStaffSelector] = useState<string | null>(null)
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)

  const daysScrollRef = useRef<HTMLDivElement>(null)
  const timesScrollRef = useRef<HTMLDivElement>(null)

  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: { name: '', email: '', phone: '', notes: '' }
  })

  // Generate week of dates
  const getWeekDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStartDate, i))
    }
    return dates
  }

  const weekDates = getWeekDates()

  // Scroll functions
  const scrollDays = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setWeekStartDate(addDays(weekStartDate, -7))
    } else {
      setWeekStartDate(addDays(weekStartDate, 7))
    }
  }

  const scrollTimes = (direction: 'left' | 'right') => {
    if (timesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      timesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Load mock data
  useEffect(() => {
    if (isOpen) {
      loadMockData()
    }
  }, [isOpen])

  const loadMockData = async () => {
    const mockData = await import('@/bookly/data/mock-booking-data.json')

    const services = mockData.default.services.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
      location: s.location,
      business: { name: s.location }
    }))
    setAvailableServices(services)

    const staff = mockData.default.staff.map((s: any) => ({
      id: s.id,
      name: s.name,
      branchId: s.branchId,
      profilePhotoUrl: s.photo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    setAvailableStaff([
      {
        id: 'no-preference',
        name: 'No preference',
        branchId: branchId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...staff
    ])
  }

  // Load time slots
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots()
    }
  }, [selectedDate, selectedPeriod])

  const loadTimeSlots = async () => {
    const mockData = await import('@/bookly/data/mock-booking-data.json')
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const slots = mockData.default.timeSlots[dateStr as keyof typeof mockData.default.timeSlots] || []

    const periodSlots = slots
      .filter((slot: any) => {
        const hour = parseInt(slot.time.split(':')[0])
        if (selectedPeriod === 'Morning') return hour < 12
        if (selectedPeriod === 'Afternoon') return hour >= 12 && hour < 17
        if (selectedPeriod === 'Evening') return hour >= 17
        return false
      })
      .filter((slot: any) => slot.available)
      .map((slot: any) => slot.time)

    setAvailableTimeSlots(periodSlots)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleAddServiceWithTime = (service: Service, time: string, providerId: string = 'no-preference') => {
    const provider = availableStaff.find(s => s.id === providerId)
    const endTime = format(addMinutes(new Date(`2000-01-01T${time}`), service.duration), 'HH:mm')

    const newService: SelectedService = {
      id: `${service.id}-${Date.now()}`,
      service,
      providerId,
      providerName: provider?.name || 'No preference',
      time,
      endTime
    }

    setSelectedServices([...selectedServices, newService])
    setShowServiceSelector(false)
    setSelectedTime(null)
  }

  const handleQuickAddCurrentSelection = () => {
    if (!selectedTime || availableServices.length === 0) return

    // Add first service with selected time
    handleAddServiceWithTime(availableServices[0], selectedTime)
  }

  const handleRemoveService = (id: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== id))
  }

  const handleChangeStaff = (serviceId: string, providerId: string) => {
    const provider = availableStaff.find(s => s.id === providerId)
    setSelectedServices(
      selectedServices.map(s =>
        s.id === serviceId ? { ...s, providerId, providerName: provider?.name || 'No preference' } : s
      )
    )
    setShowStaffSelector(null)
  }

  const calculateTotal = () => {
    return selectedServices.reduce((total, s) => total + s.service.price, 0)
  }

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, s) => total + s.service.duration, 0)
  }

  const handleDetailsSubmit = async (data: DetailsFormValues) => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      for (const selected of selectedServices) {
        const startsAtUtc = combineDateTimeToUTC(dateStr, selected.time)
        await BookingService.createBooking({
          serviceId: selected.service.id,
          providerId: selected.providerId,
          startsAtUtc,
          customer: {
            name: data.name,
            email: data.email,
            phone: data.phone
          },
          notes: data.notes
        })
      }

      setBookingReference(`BK-${Date.now()}`)
      setCurrentStep('success')
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadICS = () => {
    if (selectedServices.length === 0) return

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const firstService = selectedServices[0]
    const startTime = new Date(combineDateTimeToUTC(dateStr, firstService.time))
    const lastService = selectedServices[selectedServices.length - 1]
    const endTime = new Date(combineDateTimeToUTC(dateStr, lastService.endTime))

    downloadICS(
      {
        title: `Booking - ${selectedServices.map(s => s.service.name).join(', ')}`,
        description: `Services: ${selectedServices.map(s => s.service.name).join(', ')}`,
        location: firstService.service.location,
        startTime,
        endTime,
        organizer: { name: 'Bookly', email: 'noreply@bookly.com' }
      },
      `booking-${bookingReference}.ics`
    )
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 bg-white dark:bg-gray-900 z-10 flex items-center justify-between p-4 border-b'>
          <h2 className='text-xl font-semibold'>Book Appointment</h2>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full'>
            <KulIcon icon='lucide:x' />
          </button>
        </div>

        {/* STEP 1: Selection */}
        {currentStep === 'selection' && (
          <div className='p-4 space-y-4'>
            {/* Days Carousel */}
            <div className='flex items-center gap-2'>
              <button
                onClick={() => scrollDays('left')}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0'
              >
                <KulIcon icon='lucide:chevron-left' />
              </button>

              <div ref={daysScrollRef} className='flex-1 flex gap-2 overflow-x-auto scrollbar-hide'>
                {weekDates.map((date, idx) => {
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500 text-white'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className='text-sm'>{weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]}</span>
                      <span className='text-2xl font-bold mt-1'>{format(date, 'd')}</span>
                      {isSelected && <div className='w-8 h-1 bg-yellow-400 rounded-full mt-2' />}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => scrollDays('right')}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0'
              >
                <KulIcon icon='lucide:chevron-right' />
              </button>
            </div>

            {/* Period Tabs */}
            <div className='flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1'>
              {(['Morning', 'Afternoon', 'Evening'] as Period[]).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    selectedPeriod === period
                      ? 'bg-white dark:bg-gray-700 shadow-sm font-semibold'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Time Slots Carousel */}
            <div className='flex items-center gap-2'>
              <button
                onClick={() => scrollTimes('left')}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0'
              >
                <KulIcon icon='lucide:chevron-left' />
              </button>

              <div ref={timesScrollRef} className='flex-1 flex gap-2 overflow-x-auto scrollbar-hide'>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`flex-shrink-0 min-w-[100px] py-3 px-4 rounded-xl border-2 transition-all ${
                        selectedTime === time
                          ? 'border-teal-500 bg-teal-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-teal-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <div className='flex-1 text-center text-gray-500 py-4'>
                    No available slots for this period
                  </div>
                )}
              </div>

              <button
                onClick={() => scrollTimes('right')}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0'
              >
                <KulIcon icon='lucide:chevron-right' />
              </button>
            </div>

            {/* Quick Add Button (when time selected but no service added yet) */}
            {selectedTime && selectedServices.length === 0 && availableServices.length > 0 && (
              <div className='bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4'>
                <div className='text-sm text-teal-700 dark:text-teal-300 mb-2'>
                  Time {selectedTime} selected. Choose a service to continue:
                </div>
                <button
                  onClick={() => setShowServiceSelector(true)}
                  className='w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg'
                >
                  Select Service
                </button>
              </div>
            )}

            {/* Selected Services Cards */}
            <div className='space-y-3'>
              {selectedServices.map(selected => (
                <div key={selected.id} className='bg-gray-50 dark:bg-gray-800 rounded-xl p-4 relative'>
                  <button
                    onClick={() => handleRemoveService(selected.id)}
                    className='absolute top-2 right-2 p-1 bg-gray-300 dark:bg-gray-700 rounded-full hover:bg-gray-400'
                  >
                    <KulIcon icon='lucide:x' className='w-4 h-4' />
                  </button>

                  <div className='flex items-start justify-between mb-3 pr-8'>
                    <div className='flex-1'>
                      <div className='font-semibold text-lg'>{selected.service.name}</div>
                      <div className='text-sm text-gray-500'>
                        {selected.time} - {selected.endTime}
                      </div>
                    </div>
                    <div className='text-xl font-bold'>£{(selected.service.price / 100).toFixed(2)}</div>
                  </div>

                  <div className='flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700'>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>Staff: {selected.providerName}</div>
                    <button
                      onClick={() =>
                        setShowStaffSelector(showStaffSelector === selected.id ? null : selected.id)
                      }
                      className='text-teal-600 hover:text-teal-700 font-medium text-sm'
                    >
                      Change
                    </button>
                  </div>

                  {/* Staff Selector Dropdown */}
                  {showStaffSelector === selected.id && (
                    <div className='mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border space-y-2 max-h-60 overflow-y-auto'>
                      {availableStaff.map(staff => (
                        <button
                          key={staff.id}
                          onClick={() => handleChangeStaff(selected.id, staff.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg ${
                            selected.providerId === staff.id
                              ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {staff.profilePhotoUrl ? (
                            <img
                              src={staff.profilePhotoUrl}
                              alt={staff.name}
                              className='w-10 h-10 rounded-full object-cover'
                            />
                          ) : (
                            <div className='w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold'>
                              {staff.name.charAt(0)}
                            </div>
                          )}
                          <span className='font-medium'>{staff.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Another Service */}
            <button
              onClick={() => setShowServiceSelector(true)}
              className='w-full py-3 border-2 border-dashed border-teal-500 rounded-xl text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center justify-center gap-2 font-medium'
            >
              <KulIcon icon='lucide:plus' />
              Add another service
            </button>

            {/* Service Selector Modal */}
            {showServiceSelector && (
              <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                <div className='bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6'>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-xl font-bold'>Select Service</h3>
                    <button
                      onClick={() => setShowServiceSelector(false)}
                      className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full'
                    >
                      <KulIcon icon='lucide:x' />
                    </button>
                  </div>
                  <div className='space-y-3'>
                    {availableServices.map(service => (
                      <div
                        key={service.id}
                        className='border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-teal-500 transition-all'
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <div className='font-semibold text-lg'>{service.name}</div>
                            <div className='text-sm text-gray-500'>{service.description}</div>
                          </div>
                          <div className='text-lg font-bold'>£{(service.price / 100).toFixed(2)}</div>
                        </div>
                        <div className='text-sm text-gray-500 mb-3'>{service.duration}min</div>
                        <div className='flex gap-2 flex-wrap'>
                          {availableTimeSlots.slice(0, 6).map(time => (
                            <button
                              key={time}
                              onClick={() => handleAddServiceWithTime(service, time)}
                              className='px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition-all'
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Total & Continue */}
            {selectedServices.length > 0 && (
              <div className='sticky bottom-0 bg-white dark:bg-gray-900 border-t pt-4 mt-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>Total</div>
                    <div className='text-3xl font-bold'>£{(calculateTotal() / 100).toFixed(2)}</div>
                    <div className='text-sm text-gray-500'>{calculateTotalDuration()}min</div>
                  </div>
                  <button
                    onClick={() => setCurrentStep('details')}
                    className='bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all'
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Details */}
        {currentStep === 'details' && (
          <div className='p-6 space-y-6'>
            <h3 className='text-2xl font-bold text-center'>Review and confirm</h3>

            <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-4'>
              <div className='text-center mb-4'>
                <div className='text-2xl font-bold'>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
              </div>
              {selectedServices.map(service => (
                <div key={service.id} className='bg-white dark:bg-gray-900 rounded-lg p-4 mb-2'>
                  <div className='flex justify-between'>
                    <div>
                      <div className='font-semibold'>{service.service.name}</div>
                      <div className='text-sm text-gray-500'>
                        {service.time} - {service.endTime} • Staff: {service.providerName}
                      </div>
                    </div>
                    <div className='font-bold'>£{(service.service.price / 100).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <Form {...detailsForm}>
              <form onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)} className='space-y-4'>
                <FormField
                  control={detailsForm.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder='Name' className='rounded-lg' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailsForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} type='email' placeholder='Email' className='rounded-lg' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailsForm.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder='Phone (optional)' className='rounded-lg' />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailsForm.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder='Leave note (optional)' className='rounded-lg' />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className='pt-4 border-t'>
                  <div className='flex justify-between items-center mb-4'>
                    <span className='text-gray-600'>Total to pay</span>
                    <span className='text-4xl font-bold'>£{(calculateTotal() / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => setCurrentStep('selection')}
                    className='flex-1 border-2 border-gray-300 dark:border-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800'
                  >
                    Back
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50'
                  >
                    {loading ? 'Processing...' : 'Confirm & Book'}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* STEP 3: Success */}
        {currentStep === 'success' && (
          <div className='p-12 text-center space-y-6'>
            <div className='flex justify-center'>
              <div className='w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center'>
                <KulIcon icon='lucide:check' className='w-12 h-12 text-teal-500' />
              </div>
            </div>

            <div>
              <h3 className='text-3xl font-bold mb-2'>Appointment Confirmed</h3>
              <div className='text-xl'>{format(selectedDate, 'MMM d, yyyy')}</div>
              <div className='text-gray-600 mt-2'>You're done! We'll send you a reminder before your appointment.</div>
            </div>

            <button
              onClick={handleDownloadICS}
              className='w-full max-w-md mx-auto bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl text-lg font-semibold'
            >
              Download Calendar Event
            </button>

            <button
              onClick={onClose}
              className='w-full max-w-md mx-auto border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50'
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default BookingModalV2Fixed
