'use client'

import { useState, useEffect, useRef } from 'react'
import { format, addMinutes, addDays } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '../../molecules'
import { KulIcon } from '../../atoms'
import { Input } from '../../ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../ui/form'
import { combineDateTimeToUTC } from '@/bookly/utils/timezone.util'
import { downloadICS } from '@/bookly/utils/ics-generator.util'
import { BookingService } from '@/lib/api'
import type { Service, Staff } from '@/lib/api/types'
import { getBusinessWithDetails } from '@/mocks/businesses'

interface BookingModalV2FixedProps {
  isOpen: boolean
  onClose: () => void
  initialService?: Service
  initialTime?: string
  branchId?: string
  businessId?: string
}

interface SelectedService {
  id: string
  service: Service
  providerId: string
  providerName: string
  time: string
  endTime: string
  sequence: number
}

type Period = 'Morning' | 'Afternoon' | 'Evening'

// Period time bounds (HH:mm format)
const PERIOD_BOUNDS = {
  Morning: { start: '08:00', end: '11:59' },
  Afternoon: { start: '12:00', end: '16:59' },
  Evening: { start: '17:00', end: '21:00' }
} as const

const CLOSING_TIME = '21:00'

/**
 * Pure function to recalculate chained service times from an anchor start time
 * @param anchorStartHHmm - Starting time in HH:mm format (e.g., "16:00")
 * @param services - Array of selected services with durations
 * @returns New array with recalculated time and endTime for each service
 */
function recalcChainedTimes(anchorStartHHmm: string, services: SelectedService[]): SelectedService[] {
  if (!anchorStartHHmm || services.length === 0) return services

  // Sort by sequence to ensure correct order
  const sorted = [...services].sort((a, b) => a.sequence - b.sequence)

  let currentTime = anchorStartHHmm

  return sorted.map(service => {
    const startTime = currentTime

    // Create a valid date object with today's date + current time
    const [hours, minutes] = currentTime.split(':').map(Number)

    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time format:', currentTime)
      return service
    }

    const baseDate = new Date()
    baseDate.setHours(hours, minutes, 0, 0)

    // Validate duration
    const duration = service.service?.duration || 0
    if (duration === 0) {
      console.error('Invalid service duration:', service.service)
      return service
    }

    const endDate = addMinutes(baseDate, duration)
    const endTime = format(endDate, 'HH:mm')

    // Update current time for next service
    currentTime = endTime

    return {
      ...service,
      time: startTime,
      endTime
    }
  })
}

/**
 * Check if time string is within period bounds
 */
function isTimeInPeriod(timeHHmm: string, period: Period): boolean {
  const bounds = PERIOD_BOUNDS[period]
  return timeHHmm >= bounds.start && timeHHmm <= bounds.end
}

/**
 * Compare two time strings (HH:mm format)
 */
function compareTime(time1: string, time2: string): number {
  return time1.localeCompare(time2)
}

const detailsFormSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.email('Invalid email'),
  phone: z.string().optional(),
  notes: z.string().optional()
})

type DetailsFormValues = z.infer<typeof detailsFormSchema>

// Sortable Service Card Component
interface SortableServiceCardProps {
  selected: SelectedService
  showStaffSelector: boolean
  availableStaff: Staff[]
  onRemove: () => void
  onToggleStaffSelector: () => void
  onChangeStaff: (providerId: string) => void
}

function SortableServiceCard({
  selected,
  showStaffSelector,
  availableStaff,
  onRemove,
  onToggleStaffSelector,
  onChangeStaff
}: SortableServiceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: selected.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className='bg-slate-700 dark:bg-slate-700 rounded-xl p-4 relative border-2 border-slate-600'>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className='absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 hover:bg-slate-600 dark:hover:bg-slate-600 rounded-lg transition-colors'
      >
        <KulIcon icon='lucide:grip-vertical' className='w-5 h-5 text-slate-400 hover:text-teal-400' />
      </div>

      <button
        onClick={onRemove}
        className='absolute top-2 right-2 p-1.5 bg-red-500/20 dark:bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 hover:text-red-300 transition-all'
      >
        <KulIcon icon='lucide:x' className='w-4 h-4' />
      </button>

      <div className='flex items-start justify-between mb-3 pr-8 pl-10'>
        <div className='flex-1'>
          <div className='font-semibold text-lg text-white'>{selected.service.name}</div>
          <div className='text-sm text-teal-400'>
            {selected.time && selected.endTime ? `${selected.time} - ${selected.endTime}` : 'Time pending - select start time'}
          </div>
        </div>
        <div className='text-xl font-bold text-teal-400'>£{(selected.service.price / 100).toFixed(2)}</div>
      </div>

      <div className='flex items-center justify-between pt-3 border-t border-slate-600 dark:border-slate-600 pl-10'>
        <div className='text-sm text-slate-300 dark:text-slate-300'>Staff: {selected.providerName}</div>
        <button onClick={onToggleStaffSelector} className='text-teal-400 hover:text-teal-300 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-teal-500/10 transition-all'>
          Change
        </button>
      </div>

      {/* Staff Selector Dropdown */}
      {showStaffSelector && (
        <div className='mt-3 p-3 bg-slate-800 dark:bg-slate-800 rounded-lg border border-slate-600 space-y-2 max-h-60 overflow-y-auto ml-10'>
          {availableStaff.map(staff => (
            <button
              key={staff.id}
              onClick={() => onChangeStaff(staff.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                selected.providerId === staff.id
                  ? 'bg-teal-500/20 border-2 border-teal-500 shadow-md'
                  : 'bg-slate-700 border-2 border-transparent hover:bg-slate-600 hover:border-teal-500/50'
              }`}
            >
              {staff.profilePhotoUrl ? (
                <img src={staff.profilePhotoUrl} alt={staff.name} className='w-10 h-10 rounded-full object-cover' />
              ) : (
                <div className='w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold'>
                  {staff.name.charAt(0)}
                </div>
              )}
              <span className='font-semibold text-white'>{staff.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BookingModalV2Fixed({ isOpen, onClose, initialService, initialTime, branchId, businessId }: BookingModalV2FixedProps) {
  const [currentStep, setCurrentStep] = useState<'selection' | 'details' | 'success'>('selection')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Afternoon')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [showStaffSelector, setShowStaffSelector] = useState<string | null>(null)
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [timeWarning, setTimeWarning] = useState<string | null>(null)
  const hasAutoAddedInitialService = useRef(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

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

  const goToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    const dayOfWeek = today.getDay()
    // Saturday is 6, so if it's Saturday use current date, otherwise go back to previous Saturday
    const saturday = dayOfWeek === 6 ? today : addDays(today, -(dayOfWeek + 1))
    setWeekStartDate(saturday)
  }

  const goToNextAvailable = async () => {
    const nextAvailable = await findNextAvailableDate()
    if (nextAvailable) {
      setSelectedDate(nextAvailable)
      const dayOfWeek = nextAvailable.getDay()
      // Saturday is 6, so if it's Saturday use current date, otherwise go back to previous Saturday
      const saturday = dayOfWeek === 6 ? nextAvailable : addDays(nextAvailable, -(dayOfWeek + 1))
      setWeekStartDate(saturday)
    }
  }

  const scrollTimes = (direction: 'left' | 'right') => {
    const periods: Period[] = ['Morning', 'Afternoon', 'Evening']
    const currentIndex = periods.indexOf(selectedPeriod)

    if (direction === 'left') {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : periods.length - 1
      setSelectedPeriod(periods[newIndex])
    } else {
      const newIndex = currentIndex < periods.length - 1 ? currentIndex + 1 : 0
      setSelectedPeriod(periods[newIndex])
    }
  }

  // Helper to find first available date in next 14 days
  const findNextAvailableDate = async (): Promise<Date | null> => {
    const mockData = await import('@/bookly/data/mock-booking-data.json')
    const today = new Date()

    for (let i = 0; i < 14; i++) {
      const checkDate = addDays(today, i)
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      const slots = mockData.default.timeSlots[dateStr as keyof typeof mockData.default.timeSlots] || []
      const hasAvailableSlots = slots.some((slot: any) => slot.available)

      if (hasAvailableSlots) {
        return checkDate
      }
    }

    return null
  }

  // Load mock data and set initial time + default date
  useEffect(() => {
    if (isOpen) {
      loadMockData()

      // Set default date to first available in next 14 days
      findNextAvailableDate().then(availableDate => {
        if (availableDate) {
          setSelectedDate(availableDate)
          // Set week to include this date (Saturday to Friday)
          const dayOfWeek = availableDate.getDay()
          const saturday = dayOfWeek === 6 ? availableDate : addDays(availableDate, -(dayOfWeek + 1))
          setWeekStartDate(saturday)
        }
      })

      if (initialTime) {
        setSelectedTime(initialTime)
      }
    } else {
      // Reset state when modal closes
      setSelectedTime(null)
      setSelectedServices([])
      setCurrentStep('selection')
      setTimeWarning(null)
    }
  }, [isOpen, initialTime])

  // Auto-add initial service with selected time (only once when modal opens)
  useEffect(() => {
    // If we have an initialService and user selected a time (or we have initialTime from props)
    const timeToUse = initialTime || selectedTime

    if (
      isOpen &&
      initialService &&
      timeToUse &&
      selectedServices.length === 0 &&
      availableStaff.length > 0 &&
      !hasAutoAddedInitialService.current
    ) {
      // Don't clear selectedTime so the time button stays highlighted
      handleAddServiceWithTime(initialService, timeToUse, 'no-preference', false)
      hasAutoAddedInitialService.current = true
    }

    // Reset flag when modal closes
    if (!isOpen) {
      hasAutoAddedInitialService.current = false
    }
  }, [isOpen, initialService, initialTime, selectedTime, availableStaff])

  const loadMockData = async () => {
    // Try to get business data from businessId
    if (businessId) {
      const businessData = getBusinessWithDetails(businessId)

      if (businessData && businessData.services) {
        // Use services from business details
        setAvailableServices(businessData.services)

        // Get staff from the specific branch or all branches
        const allStaff: Staff[] = []
        if (businessData.branches) {
          businessData.branches.forEach(branch => {
            if (!branchId || branch.id === branchId) {
              if (branch.staff) {
                allStaff.push(...branch.staff)
              }
            }
          })
        }

        setAvailableStaff([
          {
            id: 'no-preference',
            name: 'No preference',
            branchId: branchId || '',
            businessId: businessId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          ...allStaff
        ])
        return
      }
    }

    // Fallback to mock-booking-data.json if no businessId or business not found
    const mockData = await import('@/bookly/data/mock-booking-data.json')

    const services = mockData.default.services.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      price: s.price,
      duration: s.duration,
      location: s.location,
      businessId: s.businessId || '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      business: { name: s.location }
    }))
    setAvailableServices(services)

    const staff = mockData.default.staff.map((s: any) => ({
      id: s.id,
      name: s.name,
      branchId: s.branchId,
      businessId: s.businessId || '1',
      profilePhotoUrl: s.photo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    setAvailableStaff([
      {
        id: 'no-preference',
        name: 'No preference',
        branchId: branchId || '',
        businessId: businessId || '1',
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
      .filter((slot: any) => isTimeInPeriod(slot.time, selectedPeriod))
      .filter((slot: any) => slot.available)
      .map((slot: any) => slot.time)

    setAvailableTimeSlots(periodSlots)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)

    // Recalculate all service times from new anchor
    if (selectedServices.length > 0) {
      const recalculated = recalcChainedTimes(time, selectedServices)
      setSelectedServices(recalculated)

      // Check if end time exceeds closing time
      const lastService = recalculated[recalculated.length - 1]
      if (compareTime(lastService.endTime, CLOSING_TIME) > 0) {
        setTimeWarning('Selected start pushes end past closing; consider earlier time.')
      } else {
        setTimeWarning(null)
      }
    }
  }

  const handleAddServiceWithTime = (
    service: Service,
    time: string,
    providerId: string = 'no-preference',
    clearSelectedTime: boolean = true
  ) => {
    // Validate service has required fields
    if (!service || !service.duration) {
      console.error('Invalid service object:', service)
      return
    }

    console.log('Adding service:', service, 'with time:', time)

    const provider = availableStaff.find(s => s.id === providerId)

    // Get next sequence number
    const nextSequence = selectedServices.length > 0 ? Math.max(...selectedServices.map(s => s.sequence)) + 1 : 0

    const newService: SelectedService = {
      id: `${service.id}-${Date.now()}`,
      service,
      providerId,
      providerName: provider?.name || 'No preference',
      time: '', // Will be calculated by chain
      endTime: '', // Will be calculated by chain
      sequence: nextSequence
    }

    const updatedServices = [...selectedServices, newService]

    // Use anchor time if available, otherwise use the time passed in
    const anchorTime = selectedTime || time
    console.log('Recalculating times with anchor:', anchorTime, 'for services:', updatedServices.length)
    const recalculated = recalcChainedTimes(anchorTime, updatedServices)
    setSelectedServices(recalculated)

    // Set anchor time if not already set
    if (!selectedTime) {
      setSelectedTime(anchorTime)
    }

    // Check time warning
    const lastService = recalculated[recalculated.length - 1]
    if (compareTime(lastService.endTime, CLOSING_TIME) > 0) {
      setTimeWarning('Selected start pushes end past closing; consider earlier time.')
    } else {
      setTimeWarning(null)
    }

    setShowServiceSelector(false)
    if (clearSelectedTime) {
      setSelectedTime(null)
    }
  }

  const handleQuickAddCurrentSelection = () => {
    if (!selectedTime || availableServices.length === 0) return

    // Add first service with selected time
    handleAddServiceWithTime(availableServices[0], selectedTime)
  }

  const handleRemoveService = (id: string) => {
    const remaining = selectedServices.filter(s => s.id !== id)

    if (remaining.length > 0 && selectedTime) {
      // Recalculate times for remaining services
      const recalculated = recalcChainedTimes(selectedTime, remaining)
      setSelectedServices(recalculated)

      // Check time warning
      const lastService = recalculated[recalculated.length - 1]
      if (compareTime(lastService.endTime, CLOSING_TIME) > 0) {
        setTimeWarning('Selected start pushes end past closing; consider earlier time.')
      } else {
        setTimeWarning(null)
      }
    } else {
      setSelectedServices(remaining)
      setTimeWarning(null)
    }
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = selectedServices.findIndex(s => s.id === active.id)
      const newIndex = selectedServices.findIndex(s => s.id === over.id)

      const reordered = arrayMove(selectedServices, oldIndex, newIndex)

      // Update sequences and recalculate times
      const withNewSequences = reordered.map((service, index) => ({
        ...service,
        sequence: index
      }))

      if (selectedTime) {
        const recalculated = recalcChainedTimes(selectedTime, withNewSequences)
        setSelectedServices(recalculated)

        // Check time warning
        const lastService = recalculated[recalculated.length - 1]
        if (compareTime(lastService.endTime, CLOSING_TIME) > 0) {
          setTimeWarning('Selected start pushes end past closing; consider earlier time.')
        } else {
          setTimeWarning(null)
        }
      } else {
        setSelectedServices(withNewSequences)
      }
    }
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

      // Sort by sequence to ensure correct booking order
      const sortedServices = [...selectedServices].sort((a, b) => a.sequence - b.sequence)

      for (const selected of sortedServices) {
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

    // Sort by sequence to get correct first and last services
    const sortedServices = [...selectedServices].sort((a, b) => a.sequence - b.sequence)
    const firstService = sortedServices[0]
    const lastService = sortedServices[sortedServices.length - 1]

    const startTime = new Date(combineDateTimeToUTC(dateStr, firstService.time))
    const endTime = new Date(combineDateTimeToUTC(dateStr, lastService.endTime))

    downloadICS(
      {
        title: `Booking - ${sortedServices.map(s => s.service.name).join(', ')}`,
        description: `Services: ${sortedServices.map(s => s.service.name).join(', ')}`,
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
          <button
            onClick={onClose}
            className='p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-full transition-colors'
          >
            <KulIcon icon='lucide:x' />
          </button>
        </div>

        {/* STEP 1: Selection */}
        {currentStep === 'selection' && (
          <div className='p-4 space-y-4'>
            {/* Quick Navigation Buttons */}
            <div className='flex gap-2 justify-end'>
              <button
                onClick={goToToday}
                className='px-3 py-1.5 text-sm bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-lg font-medium transition-colors border border-teal-200 dark:border-teal-800'
              >
                Today
              </button>
              <button
                onClick={goToNextAvailable}
                className='px-3 py-1.5 text-sm bg-teal-500 text-white hover:bg-teal-600 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md'
              >
                Next Available
              </button>
            </div>

            {/* Days Carousel */}
            <div className='flex items-center gap-2'>
              <button
                onClick={() => scrollDays('left')}
                className='p-2 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full flex-shrink-0 transition-colors'
              >
                <KulIcon icon='lucide:chevron-left' />
              </button>

              <div ref={daysScrollRef} className='flex-1 flex gap-2 overflow-x-auto scrollbar-hide'>
                {weekDates.map((date, idx) => {
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  // Week starts Saturday (6), ends Friday (5): Sat, Sun, Mon, Tue, Wed, Thu, Fri
                  const weekdays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500 text-white shadow-lg'
                          : 'border-slate-600 dark:border-slate-600 bg-slate-700 dark:bg-slate-700 text-slate-200 hover:border-teal-400 hover:bg-slate-600'
                      }`}
                    >
                      <span className='text-sm'>{weekdays[idx]}</span>
                      <span className='text-2xl font-bold mt-1'>{format(date, 'd')}</span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => scrollDays('right')}
                className='p-2 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full flex-shrink-0 transition-colors'
              >
                <KulIcon icon='lucide:chevron-right' />
              </button>
            </div>

            {/* Period Tabs */}
            <div className='flex gap-2 bg-slate-800/50 dark:bg-slate-800/50 rounded-xl p-1.5 border border-slate-700 dark:border-slate-700'>
              {(['Morning', 'Afternoon', 'Evening'] as Period[]).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 py-2.5 px-4 rounded-lg transition-all font-medium ${
                    selectedPeriod === period
                      ? 'bg-teal-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-slate-700 dark:bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
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
                className='p-2 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full flex-shrink-0 transition-colors'
              >
                <KulIcon icon='lucide:chevron-left' />
              </button>

              <div ref={timesScrollRef} className='flex-1 flex gap-2 overflow-x-auto scrollbar-hide'>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`flex-shrink-0 min-w-[100px] py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                        selectedTime === time
                          ? 'border-teal-500 bg-teal-500 text-white shadow-lg'
                          : 'border-slate-600 dark:border-slate-600 bg-slate-700 dark:bg-slate-700 text-slate-200 hover:border-teal-400 hover:bg-slate-600'
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
                className='p-2 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full flex-shrink-0 transition-colors'
              >
                <KulIcon icon='lucide:chevron-right' />
              </button>
            </div>

            {/* Quick Add Button (when time selected but no service added yet, and no initial service) */}
            {selectedTime && selectedServices.length === 0 && availableServices.length > 0 && !initialService && (
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

            {/* Time Warning */}
            {timeWarning && (
              <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3'>
                <div className='flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300'>
                  <KulIcon icon='lucide:alert-triangle' className='w-4 h-4' />
                  {timeWarning}
                </div>
              </div>
            )}

            {/* Prompt to select time if no anchor */}
            {!selectedTime && selectedServices.length > 0 && (
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3'>
                <div className='flex items-center gap-2 text-sm text-red-700 dark:text-red-300 font-medium'>
                  <KulIcon icon='lucide:alert-circle' className='w-4 h-4' />
                  Please select a start time above to schedule your services
                </div>
              </div>
            )}

            {/* Selected Services Cards with Drag-and-Drop */}
            {selectedServices.length > 0 && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selectedServices.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className='space-y-3'>
                    {selectedServices.map(selected => (
                      <SortableServiceCard
                        key={selected.id}
                        selected={selected}
                        showStaffSelector={showStaffSelector === selected.id}
                        availableStaff={availableStaff}
                        onRemove={() => handleRemoveService(selected.id)}
                        onToggleStaffSelector={() =>
                          setShowStaffSelector(showStaffSelector === selected.id ? null : selected.id)
                        }
                        onChangeStaff={providerId => handleChangeStaff(selected.id, providerId)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Add Another Service */}
            <button
              onClick={() => setShowServiceSelector(true)}
              className='w-full py-4 border-2 border-dashed border-teal-500/60 dark:border-teal-500/60 bg-slate-700/50 dark:bg-slate-700/50 rounded-xl text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 dark:hover:bg-teal-900/30 dark:hover:border-teal-400 flex items-center justify-center gap-2 font-semibold transition-all shadow-sm hover:shadow-md'
            >
              <KulIcon icon='lucide:plus' className='w-5 h-5' />
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
                      className='p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-full transition-colors'
                    >
                      <KulIcon icon='lucide:x' />
                    </button>
                  </div>
                  <div className='space-y-3'>
                    {availableServices.map(service => (
                      <button
                        key={service.id}
                        onClick={() => handleAddServiceWithTime(service, selectedTime || '00:00', 'no-preference', false)}
                        className='w-full border-2 border-slate-600 dark:border-slate-600 bg-slate-700 dark:bg-slate-700 rounded-xl p-5 hover:border-teal-500 hover:bg-slate-600 dark:hover:bg-slate-600 hover:shadow-lg transition-all text-left group'
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <div className='flex-1'>
                            <div className='font-bold text-lg text-white group-hover:text-teal-400 transition-colors'>{service.name}</div>
                            <div className='text-sm text-slate-400 mt-1'>{service.description}</div>
                          </div>
                          <div className='text-xl font-bold text-teal-400 ml-4'>£{(service.price / 100).toFixed(2)}</div>
                        </div>
                        <div className='text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-full inline-block'>{service.duration}min</div>
                      </button>
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
                    disabled={!selectedTime}
                    className='bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
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
                    className='flex-1 border-2 border-teal-500 dark:border-teal-600 text-teal-600 dark:text-teal-400 py-3 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors'
                  >
                    Back
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-md hover:shadow-lg transition-all'
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
              className='w-full max-w-md mx-auto bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-md'
            >
              Download Calendar Event
            </button>

            <button
              onClick={onClose}
              className='w-full max-w-md mx-auto bg-slate-700 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-md'
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
