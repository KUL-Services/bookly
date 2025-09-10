'use client'

import { useState } from 'react'
import { Button } from '../../molecules'
import { H3, H4, KulIcon } from '../../atoms'
import { Card, CardContent } from '../../ui/card'

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

interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface BookingData {
  professional: Professional | null
  date: Date | null
  time: string | null
  customerInfo: CustomerInfo
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

function BookingModal({ isOpen, onClose, serviceName, servicePrice, serviceDuration }: BookingModalProops) {
  const [step, setstep] = useState(1)
  const [bookingData, setbookingData] = useState<BookingData>({
    professional: null,
    date: null,
    time: null,
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    }
  })

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8))
  const [selectedDate, setselectedDate] = useState<Date | null>(null)

  // Handles Functions
  const handelNext = () => {
    if (step < 3) setstep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setstep(step - 1)
  }

  const handleProfessionalSelect = (professional: Professional) => {
    setbookingData(prev => ({ ...prev, professional }))
  }

  const handleDateSelect = (date: Date) => {
    setselectedDate(date)
    setbookingData(prev => ({ ...prev, date }))
  }

  const handleTimeSelect = (time: string) => {
    setbookingData(prev => ({ ...prev, time }))
  }

  const handleConfirmBooking = () => {}

  // Helper Functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Days / month variables

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (!isOpen) return null
  return (
    <div className='fixed inset-0 bg-gray-700 bg-opacity-30 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
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
            <H3 stringProps={{ plainText: 'Choose your professional' }} className='text-lg font-medium mb-6' />
            <div className='space-y-3'>
              {professionals.map(professional => (
                <div
                  key={professional.id}
                  onClick={() => handleProfessionalSelect(professional)}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    bookingData.professional?.id === professional.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                      professional.id === '1' ? 'bg-purple-500' : professional.id === '2' ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                  >
                    {professional.initials}
                  </div>
                  <div>
                    <div className='font-medium'>{professional.name}</div>
                    <div className='text-sm text-gray-500'>{professional.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && (
          <div className='p-6'>
            <H3 stringProps={{ plainText: 'Select a date and time' }} className='text-lg font-medium mb-6' />

            {/* Calendar */}
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='font-medium flex items-center gap-2'>
                  <KulIcon icon={'lucide:calendar'} />
                  <H4 stringProps={{ plainText: 'Choose Date' }} />
                </div>
              </div>

              <div className='border border-gray-300 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <Button
                    variant='contained'
                    size='sm'
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    prefixIcon={{ icon: 'lucide:chevron-left' }}
                  />

                  <h5 className='font-medium'>{monthYear}</h5>
                  <Button
                    variant='contained'
                    size='sm'
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    prefixIcon={{ icon: 'lucide:chevron-right' }}
                  />
                </div>

                <div className='grid grid-cols-7 gap-1 mb-2'>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className='text-center text-sm font-medium text-gray-500 p-2'>
                      {day}
                    </div>
                  ))}
                </div>

                <div className='grid grid-cols-7 gap-1'>
                  {days.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && handleDateSelect(day)}
                      disabled={!day}
                      className={`p-2 text-sm rounded transition-colors ${
                        !day
                          ? 'invisible'
                          : selectedDate && day.toDateString() === selectedDate.toDateString()
                            ? 'bg-teal-500 text-white'
                            : 'hover:bg-gray-100'
                      }`}
                    >
                      {day?.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Time Slots */}
            <div>
              <div className='font-medium flex items-center gap-2 mb-4'>
                <KulIcon icon={'lucide:clock'} />
                <H4 stringProps={{ plainText: 'Choose Time' }} />
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {timeSlots.map(slot => (
                  <>
                    <Button
                      variant='text'
                      size='sm'
                      key={slot.time}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={` p-3 text-sm rounded border transition-colors ${
                        !slot.available
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed text-xs mt-1'
                          : bookingData.time === slot.time
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      buttonText={
                        slot.available ? { plainText: slot.time } : { plainText: `${slot.time} \nUnavailable` }
                      }
                    />
                    {/* <button>
                          {slot.time}
                          {!slot.available && <div className='text-xs mt-1'>Unavailable</div>}
                        </button> */}
                  </>
                ))}
              </div>
            </div>
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
                    <span>{serviceName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Professional:</span>
                    <span>{bookingData.professional?.name}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Date:</span>
                    <span>{bookingData.date ? formatDate(bookingData.date) : ''}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Time:</span>
                    <span>{bookingData.time}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Duration:</span>
                    <span>{serviceDuration}</span>
                  </div>
                  <div className='flex justify-between font-medium text-lg pt-2 border-t'>
                    <span>Total Price:</span>
                    <span className='text-teal-600'>{servicePrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
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

          <Button
            variant='contained'
            onClick={step === 3 ? handleConfirmBooking : handelNext}
            className='flex items-center gap-2  bg-black hover:bg-gray-900 text-white '
            prefixIcon={step === 3 ? undefined : { icon: 'lucide:chevron-right' }}
            buttonText={step === 3 ? { plainText: 'Confirm Booking' } : { plainText: 'Next' }}
          />
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
