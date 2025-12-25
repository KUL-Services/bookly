'use client'

import { useState } from 'react'
import { Button } from '../../molecules'
import { H3, H4, KulIcon } from '../../atoms'
import { Label } from '@/bookly/components/atoms/base-text/base-text.component'
import { Input } from '../../ui/input'
import { Calendar } from '../../ui/calendar'
import { Card, CardContent } from '../../ui/card'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form'
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'

interface BookingModalProops {
  isOpen: boolean
  onClose: () => void
  serviceName?: string
  servicePrice?: string
  serviceDuration?: string
}

interface Professional {
  id: string
  name: string
  role: string
  avatar: string
  initials: string
}

interface Customer {
  name: string
  email: string
  phone: string
}

interface BookingData {
  professional: Professional | null
  date: Date | null
  time: string | null
  service: {
    name: string | undefined
    price: string | undefined
    duration: string | undefined
  }
  customer: Customer | null
}

const professionals: Professional[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    role: 'Senior Stylist',
    avatar: '',
    initials: 'EJ'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    role: 'Color Specialist',
    avatar: '',
    initials: 'SW'
  },
  {
    id: '3',
    name: 'Alex Thompson',
    role: 'Junior Stylist',
    avatar: '',
    initials: 'AT'
  }
]

const timeSlots = [
  { time: '9:00 AM', available: true },
  { time: '9:30 AM', available: true },
  { time: '10:00 AM', available: false },
  { time: '10:30 AM', available: false },
  { time: '11:00 AM', available: false },
  { time: '11:30 AM', available: false },
  { time: '12:00 PM', available: true },
  { time: '12:30 PM', available: false },
  { time: '1:00 PM', available: true },
  { time: '1:30 PM', available: false },
  { time: '2:00 PM', available: false },
  { time: '2:30 PM', available: true },
  { time: '3:00 PM', available: true },
  { time: '3:30 PM', available: false },
  { time: '4:00 PM', available: false },
  { time: '4:30 PM', available: true },
  { time: '5:00 PM', available: true },
  { time: '5:30 PM', available: true },
  { time: '6:00 PM', available: true },
  { time: '6:30 PM', available: false },
  { time: '7:00 PM', available: true }
]

const formSchema = {
  professional: z.object({
    professionalId: z.string().min(1, { message: 'Please select a professional.' })
  }),

  dateTime: z.object({
    date: z.date({
      error: issue => (issue.input === undefined ? 'Please select a date' : 'Invalid date')
    }),
    time: z.string().min(1, 'Please select an available time slot.')
  }),

  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.email({ message: 'Please enter a valid email address.' }),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits.')
      .max(15, 'Phone number must not exceed 15 digits.')
      .regex(/^[0-9+\-\s()]*$/, 'Please enter a valid phone number.')
  })
}

type ProfessionalFormValues = z.infer<typeof formSchema.professional>
type DateTimeFormValues = z.infer<typeof formSchema.dateTime>
type CustomerFormValues = z.infer<typeof formSchema.customer>

function BookingModal({ isOpen, onClose, serviceName, servicePrice, serviceDuration }: BookingModalProops) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [bookingData, setbookingData] = useState<BookingData | null>(null) // for debug ONLY

  // Forms
  const professionalForm = useForm<ProfessionalFormValues>({
    resolver: zodResolver(formSchema.professional),
    defaultValues: {
      professionalId: ''
    }
  })

  const dateTimeForm = useForm<DateTimeFormValues>({
    resolver: zodResolver(formSchema.dateTime),
    defaultValues: {
      date: undefined,
      time: ''
    }
  })

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema.customer),
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  })

  function onProfessionalSubmit(data: ProfessionalFormValues) {
    const professional = professionals.find(p => p.id === data.professionalId)

    if (professional) {
      setSelectedProfessional(professional)
      handleNext()
    }
  }

  function onDateTimeSubmit(data: DateTimeFormValues) {
    handleDateSelect(data.date)
    handleTimeSelect(data.time)
    handleNext()
  }

  async function onCustomerSubmit(data: CustomerFormValues) {
    try {
      // If validation passes, create the booking data
      const bookingData = {
        professional: selectedProfessional,
        date: selectedDate,
        time: selectedTime,
        service: {
          name: serviceName,
          price: servicePrice,
          duration: serviceDuration
        },
        customer: data
      }

      // Here you would typically make an API call to submit the booking
      console.log('Final Booking Data =>', bookingData)
      setbookingData(bookingData)
    } catch (error) {
      customerForm.setError('root', {
        type: 'manual',
        message: 'Failed to submit booking. Please try again.'
      })
    }
  }

  // Handles Functions
  const formatDate = (date: Date) => {
    return format(date, 'PPP')
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleConfirmBooking = () => {
    console.log(
      `Final Booking Data => ${bookingData?.customer?.name} - ${bookingData?.date?.getDate()} - ${bookingData?.time} - ${bookingData?.professional?.name} - ${bookingData?.service.name}`
    )
    onClose() // Close the modal using the provided onClose prop
  }

  if (!isOpen) return null
  return (
    <div className='fixed inset-0 bg-gray-700 bg-opacity-30 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-400'>
          <div>
            <h2 className='text-xl font-semibold'>Book {serviceName}</h2>
            <p className='text-sm text-gray-500'>Luxe Hair Studio • Step {step} of 3</p>
          </div>
          <Button variant='text' prefixIcon={{ icon: 'lucide:x' }} onClick={onClose} />
        </div>
        {/* Step 1: Choose Professional */}
        {step === 1 && (
          <div className='p-6'>
            <Form {...professionalForm}>
              <form onSubmit={professionalForm.handleSubmit(onProfessionalSubmit)} className='space-y-6'>
                <H3 stringProps={{ plainText: 'Choose your professional' }} className='text-lg font-medium mb-6' />

                <FormField
                  control={professionalForm.control}
                  name='professionalId'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='space-y-3'>
                          {professionals.map(professional => (
                            <FormItem
                              key={professional.id}
                              className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                                field.value === professional.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <FormControl className='cursor-pointer'>
                                <RadioGroupItem value={professional.id} className='' />
                              </FormControl>
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                  professional.id === '1'
                                    ? 'bg-purple-500'
                                    : professional.id === '2'
                                      ? 'bg-blue-500'
                                      : 'bg-red-500'
                                }`}
                              >
                                {professional.initials}
                              </div>
                              <div>
                                <div className='font-medium'>{professional.name}</div>
                                <div className='text-sm text-gray-500'>{professional.role}</div>
                              </div>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />
                <div className=' flex items-center justify-end'>
                  <Button
                    type='submit'
                    variant='text'
                    className=' bg-primary-700 text-white shadow-lg border-teal-400 hover:shadow-none hover: border-none hover:bg-transparent'
                    suffixIcon={{ icon: 'lucide:chevron-right' }}
                    buttonText={{ plainText: 'Go' }}
                  />
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && (
          <div className='p-6'>
            <Form {...dateTimeForm}>
              <form onSubmit={dateTimeForm.handleSubmit(onDateTimeSubmit)} className='space-y-6'>
                <H3 stringProps={{ plainText: 'Select a date and time' }} className='text-lg font-medium mb-6' />
                <FormMessage className='text-red-500' />

                {/* Calendar */}
                <div className='mb-6'>
                  <FormField
                    control={dateTimeForm.control}
                    name='date'
                    render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between mb-4'>
                          <FormLabel className='flex items-center gap-2'>
                            <KulIcon icon={'lucide:calendar'} />
                            <H4 stringProps={{ plainText: 'Choose Date' }} />
                          </FormLabel>
                          {field.value && <p className='text-sm text-muted-foreground'>{format(field.value, 'PPP')}</p>}
                        </div>
                        <FormControl>
                          <div className='border border-gray-300 rounded-lg'>
                            <Calendar
                              mode='single'
                              required={true}
                              selected={field.value}
                              onSelect={field.onChange}
                              className='w-full'
                              initialFocus
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Time Slots */}
                <FormField
                  control={dateTimeForm.control}
                  name='time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-2 mb-4'>
                        <KulIcon icon={'lucide:clock'} />
                        <H4 stringProps={{ plainText: 'Choose Time' }} />
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className='grid grid-cols-2 sm:grid-cols-4 gap-2'
                        >
                          {timeSlots.map(slot => (
                            <FormItem key={slot.time}>
                              <FormControl>
                                <RadioGroupItem value={slot.time} disabled={!slot.available} className='sr-only' />
                              </FormControl>
                              <Button
                                type='button'
                                variant={field.value === slot.time ? 'contained' : 'outlined'}
                                size='sm'
                                onClick={() => slot.available && field.onChange(slot.time)}
                                disabled={!slot.available}
                                className={`h-auto min-h-[3rem] w-full ${!slot.available ? 'opacity-50' : ''}`}
                                buttonText={{ plainText: slot.time }}
                                descriptionText={!slot.available ? { plainText: 'Unavailable' } : undefined}
                                textContainerClassName='flex flex-col items-center justify-center gap-1'
                              />
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className=' flex items-center justify-end'>
                  <Button
                    type='submit'
                    variant='text'
                    className=' bg-primary-700 text-white shadow-lg border border-teal-400 hover:shadow-none hover:bg-white'
                    suffixIcon={{ icon: 'lucide:chevron-right' }}
                    buttonText={{ plainText: 'Go' }}
                  />
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Step 3: Confirm Booking */}
        {step === 3 && (
          <div className='p-6'>
            <H3 stringProps={{ plainText: 'Confirm your booking' }} className='text-lg font-medium mb-6' />

            {/* Booking Summary */}
            <Card className='mb-6'>
              <CardContent className='p-4'>
                <H4 stringProps={{ plainText: 'Booking Summary' }} className='font-medium mb-4' />
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Service:</span>
                    <span>{serviceName ? serviceName : 'No Service'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Professional:</span>
                    <span>{selectedProfessional ? selectedProfessional.name : 'No Professional'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Date:</span>
                    <span>{selectedDate ? formatDate(selectedDate) : ''}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Time:</span>
                    <span>{selectedTime ? selectedTime : 'Not Selected'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Duration:</span>
                    <span>{serviceDuration ? serviceDuration : 'No Duration'}</span>
                  </div>
                  <div className='flex justify-between font-medium text-lg pt-2 border-t'>
                    <span>Total Price:</span>
                    <span className='text-primary-800'>{servicePrice ? servicePrice : 'No Price'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Form {...customerForm}>
              <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className='space-y-6'>
                <h4 className='font-medium'>Your Information</h4>
                <FormMessage className='text-red-500' />

                <FormField
                  control={customerForm.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Label stringProps={{ plainText: 'Full Name' }} />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Enter your full name' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Label stringProps={{ plainText: 'Email Address' }} />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type='email' placeholder='Enter your email address' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerForm.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Label stringProps={{ plainText: 'Phone Number' }} />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type='tel' placeholder='Enter your phone number' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-sm text-gray-600'>
                    <strong>Note:</strong> By confirming this booking, you agree to our terms and conditions. You'll
                    receive a confirmation email with booking details.
                  </p>
                </div>
                {!bookingData ? (
                  <div className='flex justify-end'>
                    <Button
                      type='submit'
                      variant='contained'
                      className=' bg-primary-700 text-white shadow-lg border border-teal-400 hover:shadow-none hover:bg-white hover:text-gray-900'
                      buttonText={{ plainText: 'Finish' }}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </form>
            </Form>
          </div>
        )}
        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t border-gray-300 bg-gray-50'>
          <Button
            variant='outlined'
            onClick={step === 1 ? onClose : handleBack}
            className='flex items-center gap-2 bg-white text-gray-900 shadow-lg border-gray-400 hover:shadow-none hover: border-none hover:bg-transparent'
            prefixIcon={step === 1 ? undefined : { icon: 'lucide:chevron-left' }}
            buttonText={step === 1 ? { plainText: 'Cancel' } : { plainText: 'Back' }}
          />
          {/* <Button
            variant='outlined'
            onClick={step === 1 ? onClose : handleBack}
            className='flex items-center gap-2 bg-transparent'
          >
            {step === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className='w-4 h-4' />
                Back
              </>
            )}
          </Button> */}

          {step == 3 && (
            <Button
              variant='contained'
              disabled={!bookingData}
              onClick={() => handleConfirmBooking()}
              className='flex items-center gap-2 bg-black hover:bg-gray-900 text-white'
              // suffixIcon={{ icon: 'lucide:chevron-right' }}
              buttonText={{ plainText: 'Confirm Booking' }}
            />
          )}
          {/*
          <Button onClick={step === 3 ? handleConfirmBooking : handleNext} className='flex items-center gap-2'>
            {step === 3 ? (
              'Confirm Booking'
            ) : (
              <>
                Next
                <ChevronRight className='w-4 h-4' />
              </>
            )}
          </Button> */}
        </div>
      </div>
    </div>
  )
}

export default BookingModal
