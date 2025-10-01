'use client'

import { useState, useEffect } from 'react'
import { format, addMinutes } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../../molecules'
import { H3, H4, KulIcon } from '../../atoms'
import { Label } from '@/bookly/components/atoms/base-text/base-text.component'
import { Input } from '../../ui/input'
import { Calendar } from '../../ui/calendar'
import { Card, CardContent } from '../../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form'
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'
import { combineDateTimeToUTC, formatCairoDate, formatCairoTime } from '@/bookly/utils/timezone.util'
import { downloadICS } from '@/bookly/utils/ics-generator.util'
import { BookingService } from '@/lib/api'
import type { Service, Staff, Addon } from '@/lib/api/types'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  service?: Service
  branchId?: string
}

// Step definitions
const STEPS = {
  SELECTION: 1,    // Steps 1-4: Service, Provider, Date/Time, Extras (all in one screen)
  DETAILS: 2,      // Step 5: Customer details & payment
  REVIEW: 3,       // Step 6: Review & confirm
  SUCCESS: 4       // Success screen
}

// Form schemas
const detailsFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['pay_on_arrival', 'mock_card']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
})

type DetailsFormValues = z.infer<typeof detailsFormSchema>

interface TimeSlot {
  time: string
  available: boolean
  period: 'Morning' | 'Afternoon' | 'Evening'
}

function NewBookingModal({ isOpen, onClose, service, branchId }: BookingModalProps) {
  const [step, setStep] = useState(STEPS.SELECTION)
  const [selectedProvider, setSelectedProvider] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Map<string, number>>(new Map())
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState<number>(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  // Customer details form
  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      couponCode: '',
      paymentMethod: 'pay_on_arrival',
      agreeToTerms: false
    }
  })

  // Calculate total price
  const calculateTotal = (): number => {
    if (!service) return 0

    let total = service.price * 100 // Convert to cents

    // Add addons
    selectedAddons.forEach((quantity, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId)
      if (addon) {
        total += addon.priceCents * quantity
      }
    })

    // Apply coupon discount
    if (couponDiscount > 0) {
      total = total * (1 - couponDiscount / 100)
    }

    return total
  }

  // Fetch available staff when service changes
  useEffect(() => {
    if (service && branchId) {
      // Fetch staff from mock data
      import('@/bookly/data/mock-booking-data.json').then(mockData => {
        const staff = mockData.default.staff
          .filter((s: any) => s.branchId === branchId || s.businessId === service.business?.id)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            branchId: s.branchId,
            profilePhotoUrl: s.photo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))

        // Add "No preference" option
        const staffWithNoPreference = [
          {
            id: 'no-preference',
            name: 'No preference',
            branchId: branchId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          ...staff
        ]

        setAvailableStaff(staffWithNoPreference)
      })
    }
  }, [service, branchId])

  // Fetch available time slots when provider and date change
  useEffect(() => {
    if (selectedProvider && selectedDate && service) {
      fetchAvailability()
    }
  }, [selectedProvider, selectedDate, service])

  // Fetch addons when service changes
  useEffect(() => {
    if (service) {
      fetchAddons()
    }
  }, [service])

  const fetchAvailability = async () => {
    if (!selectedProvider || !selectedDate || !service) return

    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const result = await BookingService.getAvailability({
        providerId: selectedProvider.id,
        serviceId: service.id,
        date: dateStr
      })

      if (result.data) {
        // Group time slots by period
        const slots: TimeSlot[] = result.data.slots.map(slot => {
          const hour = parseInt(slot.time.split(':')[0])
          let period: 'Morning' | 'Afternoon' | 'Evening'

          if (hour < 12) period = 'Morning'
          else if (hour < 17) period = 'Afternoon'
          else period = 'Evening'

          return {
            ...slot,
            period
          }
        })

        setAvailableTimeSlots(slots)
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err)
      setError('Failed to load available time slots')
    } finally {
      setLoading(false)
    }
  }

  const fetchAddons = async () => {
    if (!service) return

    try {
      const result = await BookingService.getAddons(service.id)
      if (result.data) {
        setAvailableAddons(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch addons:', err)
    }
  }

  const validateCoupon = async (code: string) => {
    if (!service || !code) return

    setValidatingCoupon(true)
    try {
      const result = await BookingService.validateCoupon({
        code,
        serviceId: service.id
      })

      if (result.data?.valid && result.data.discountPercent) {
        setCouponDiscount(result.data.discountPercent)
      } else {
        detailsForm.setError('couponCode', {
          type: 'manual',
          message: 'Invalid coupon code'
        })
      }
    } catch (err) {
      detailsForm.setError('couponCode', {
        type: 'manual',
        message: 'Failed to validate coupon'
      })
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleAddonChange = (addonId: string, quantity: number) => {
    const newAddons = new Map(selectedAddons)
    if (quantity === 0) {
      newAddons.delete(addonId)
    } else {
      newAddons.set(addonId, quantity)
    }
    setSelectedAddons(newAddons)
  }

  const handleDetailsSubmit = async (data: DetailsFormValues) => {
    setStep(STEPS.REVIEW)
  }

  const handleConfirmBooking = async () => {
    if (!service || !selectedProvider || !selectedDate || !selectedTime) return

    setLoading(true)
    setError(null)

    try {
      const formData = detailsForm.getValues()

      // Convert Cairo time to UTC
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const startsAtUtc = combineDateTimeToUTC(dateStr, selectedTime)

      // Create booking
      const bookingData = {
        serviceId: service.id,
        providerId: selectedProvider.id,
        startsAtUtc,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        addons: Array.from(selectedAddons.entries()).map(([id, quantity]) => ({
          id,
          quantity
        })),
        notes: formData.notes,
        couponCode: formData.couponCode
      }

      const result = await BookingService.createBooking(bookingData)

      if (result.data) {
        // If mock card payment selected, process payment
        if (formData.paymentMethod === 'mock_card') {
          await BookingService.mockPayment({
            bookingId: result.data.id,
            amount: calculateTotal()
          })
        }

        setBookingReference(result.data.id)
        setStep(STEPS.SUCCESS)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadICS = () => {
    if (!service || !selectedDate || !selectedTime) return

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const startTime = new Date(combineDateTimeToUTC(dateStr, selectedTime))
    const endTime = addMinutes(startTime, service.duration)

    downloadICS(
      {
        title: `${service.name} Booking`,
        description: service.description,
        location: service.location,
        startTime,
        endTime,
        organizer: {
          name: 'Bookly',
          email: 'noreply@bookly.com'
        }
      },
      `booking-${bookingReference}.ics`
    )
  }

  const canProceedToDetails = (): boolean => {
    return !!(selectedProvider && selectedDate && selectedTime)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 bg-white dark:bg-gray-900 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>{service?.name}</h2>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {service?.business?.name} • {service?.location}
            </p>
          </div>
          <Button variant='text' prefixIcon={{ icon: 'lucide:x' }} onClick={onClose} />
        </div>

        {/* Content */}
        <div className='p-6'>
          {error && (
            <div className='mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400'>
              {error}
            </div>
          )}

          {/* STEP 1: Selection Screen (Service, Provider, Date/Time, Extras) */}
          {step === STEPS.SELECTION && (
            <div className='space-y-6'>
              {/* Provider Selection */}
              <div>
                <H3 stringProps={{ plainText: 'Choose Staff' }} className='mb-4' />
                <RadioGroup
                  value={selectedProvider?.id}
                  onValueChange={id => {
                    const staff = availableStaff.find(s => s.id === id)
                    setSelectedProvider(staff || null)
                    setSelectedTime(null) // Reset time when changing provider
                  }}
                  className='grid grid-cols-1 gap-3'
                >
                  {availableStaff.map(staff => (
                    <div
                      key={staff.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedProvider?.id === staff.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <RadioGroupItem value={staff.id} />
                      <div className='flex items-center gap-3 flex-1'>
                        {staff.profilePhotoUrl ? (
                          <img
                            src={staff.profilePhotoUrl}
                            alt={staff.name}
                            className='w-10 h-10 rounded-full object-cover'
                          />
                        ) : (
                          <div className='w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium'>
                            {staff.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className='font-medium text-gray-900 dark:text-white'>{staff.name}</div>
                          <div className='text-sm text-teal-600 dark:text-teal-400'>
                            {staff.id === 'no-preference' ? 'Highest availability' : 'Available'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Date & Time Selection */}
              {selectedProvider && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <H3 stringProps={{ plainText: 'September - October 2025' }} />
                    <button className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
                      <KulIcon icon='lucide:chevron-right' />
                    </button>
                  </div>

                  {/* Days Carousel */}
                  <div className='flex gap-2 overflow-x-auto pb-2'>
                    {[29, 30, 1, 2, 3, 4, 5].map((day, idx) => {
                      const isSelected = selectedDate?.getDate() === day
                      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            const newDate = new Date(2025, idx < 2 ? 8 : 9, day)
                            setSelectedDate(newDate)
                            setSelectedTime(null)
                          }}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-500 text-white'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <span className='text-sm'>{weekdays[idx]}</span>
                          <span className='text-2xl font-bold mt-1'>{day}</span>
                          {isSelected && (
                            <div className='w-8 h-1 bg-yellow-400 rounded-full mt-2' />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className='space-y-4'>
                      {/* Morning */}
                      <div>
                        <H4 stringProps={{ plainText: 'Morning' }} className='mb-3 text-gray-600 dark:text-gray-400' />
                        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                          {['11:20', '11:40'].map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                selectedTime === time
                                  ? 'border-teal-500 bg-teal-500 text-white'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Afternoon */}
                      <div>
                        <H4
                          stringProps={{ plainText: 'Afternoon' }}
                          className='mb-3 text-gray-600 dark:text-gray-400'
                        />
                        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                          {['12:55', '13:10', '14:30', '14:45'].map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                selectedTime === time
                                  ? 'border-teal-500 bg-teal-500 text-white'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Evening */}
                      <div>
                        <H4 stringProps={{ plainText: 'Evening' }} className='mb-3 text-gray-600 dark:text-gray-400' />
                        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                          <button
                            disabled
                            className='p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          >
                            18:00
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Summary Card */}
              {selectedProvider && selectedDate && selectedTime && (
                <Card className='bg-gray-50 dark:bg-gray-800/50'>
                  <CardContent className='p-4'>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-400'>{service?.name}</span>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          £{((service?.price || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {selectedTime} - {selectedTime && service?.duration
                          ? format(addMinutes(new Date(`2000-01-01T${selectedTime}`), service.duration), 'HH:mm')
                          : ''}
                      </div>
                      <div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
                        <div className='flex justify-between'>
                          <span className='font-semibold text-gray-900 dark:text-white'>Total</span>
                          <span className='font-bold text-xl text-gray-900 dark:text-white'>
                            £{(calculateTotal() / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className='text-right text-sm text-gray-500 dark:text-gray-400'>
                          {service?.duration}min
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Continue Button */}
              <div className='flex justify-center'>
                <Button
                  variant='contained'
                  disabled={!canProceedToDetails()}
                  onClick={() => setStep(STEPS.DETAILS)}
                  className='w-full max-w-md bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl text-lg font-semibold'
                  buttonText={{ plainText: 'Continue' }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Details & Payment */}
          {step === STEPS.DETAILS && (
            <div className='space-y-6'>
              <div className='text-center mb-6'>
                <H3 stringProps={{ plainText: 'Review and confirm' }} className='text-2xl font-bold' />
              </div>

              {/* Booking Summary */}
              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3'>
                <div className='text-center'>
                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                    September, Monday 29 2025
                  </div>
                  <div className='text-3xl font-bold mt-1 text-gray-900 dark:text-white'>
                    {selectedTime} - {selectedTime && service?.duration
                      ? format(addMinutes(new Date(`2000-01-01T${selectedTime}`), service.duration), 'HH:mm')
                      : ''}{' '}
                    ({service?.duration}min)
                  </div>
                  <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                    {service?.business?.name}
                  </div>
                </div>

                <div className='bg-white dark:bg-gray-900 rounded-lg p-4'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <div className='font-medium text-gray-900 dark:text-white'>{service?.name}</div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        Staff: {selectedProvider?.name || 'No preference'}
                      </div>
                    </div>
                    <div className='font-semibold text-gray-900 dark:text-white'>
                      £{((service?.price || 0) / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Form */}
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
                          <Input {...field} type='tel' placeholder='Phone (optional)' className='rounded-lg' />
                        </FormControl>
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total */}
                  <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                    <div className='flex justify-between items-center mb-4'>
                      <span className='text-gray-600 dark:text-gray-400'>Total to pay</span>
                      <span className='text-4xl font-bold text-gray-900 dark:text-white'>
                        £{(calculateTotal() / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    type='submit'
                    variant='contained'
                    className='w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl text-lg font-semibold'
                    buttonText={{ plainText: 'Confirm & Book' }}
                  />

                  <div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
                    Your personal data will be handled by the business. You can find more information{' '}
                    <span className='text-teal-500 cursor-pointer'>here</span>. By clicking "Confirm & Book", you accept
                    the <span className='text-teal-500 cursor-pointer'>Cancellation Policy</span> and agree that a
                    Cancellation Fee or Deposit may be charged to your card if it's violated..
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === STEPS.SUCCESS && (
            <div className='text-center py-12 space-y-6'>
              <div className='flex justify-center'>
                <div className='w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center'>
                  <KulIcon icon='lucide:check' className='text-teal-500 w-12 h-12' />
                </div>
              </div>

              <div>
                <H3 stringProps={{ plainText: 'Appointment Confirmed' }} className='text-3xl font-bold mb-2' />
                <div className='text-xl text-gray-900 dark:text-white'>
                  Sep 29, 2025, {selectedTime}
                </div>
                <div className='text-gray-600 dark:text-gray-400 mt-2'>
                  You're done! We'll send you a reminder before your appointment.
                </div>
              </div>

              <Button
                variant='contained'
                onClick={handleDownloadICS}
                className='w-full max-w-md bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl text-lg font-semibold'
                buttonText={{ plainText: 'Show appointment' }}
              />
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step !== STEPS.SUCCESS && (
          <div className='sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between'>
            <Button
              variant='text'
              onClick={step === STEPS.SELECTION ? onClose : () => setStep(step - 1)}
              prefixIcon={{ icon: 'lucide:arrow-left' }}
              buttonText={{ plainText: step === STEPS.SELECTION ? 'Cancel' : 'Back' }}
              className='text-gray-600 dark:text-gray-400'
            />

            {step === STEPS.REVIEW && (
              <Button
                variant='contained'
                onClick={handleConfirmBooking}
                disabled={loading}
                className='bg-teal-500 hover:bg-teal-600 text-white'
                buttonText={{ plainText: loading ? 'Processing...' : 'Confirm Booking' }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewBookingModal
