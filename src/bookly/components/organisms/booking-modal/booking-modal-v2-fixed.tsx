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
import type { Service, Staff, TimeSlot } from '@/lib/api/types'
import { getBusinessWithDetails } from '@/mocks/businesses'
import { Check, CalendarPlus, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

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
  email: z.string().email('Invalid email'),
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

  const staffScrollRef = useRef<HTMLDivElement>(null)

  const scrollStaff = (direction: 'left' | 'right') => {
    if (staffScrollRef.current) {
      const scrollAmount = 100
      staffScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-white dark:bg-[#202c39] rounded-2xl p-5 relative shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700'
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className='absolute left-2 top-4 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors touch-none'
        style={{ touchAction: 'none' }}
      >
        <KulIcon icon='lucide:grip-vertical' className='w-5 h-5 text-gray-400 hover:text-primary-600' />
      </div>

      <button
        onClick={onRemove}
        className='absolute top-3 right-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all'
      >
        <KulIcon icon='lucide:x' className='w-4 h-4' />
      </button>

      <div className='flex items-start justify-between mb-4 pr-10 pl-10'>
        <div className='flex-1'>
          <h3 className='font-bold text-lg text-gray-900 dark:text-white mb-1'>{selected.service.name}</h3>
          <div className='text-sm text-gray-500 dark:text-gray-400 font-medium font-mono'>
            {selected.time && selected.endTime ? (
              <span className='flex items-center gap-2'>
                <Clock className='w-3.5 h-3.5' /> {selected.time} - {selected.endTime}
              </span>
            ) : (
              'Time pending - select start time'
            )}
          </div>
          <div className='text-xs text-gray-400 mt-1 font-mono'>{selected.service.duration}min</div>
        </div>
        <div className='text-xl font-bold text-gray-900 dark:text-white font-mono'>
          £{(selected.service.price / 100).toFixed(2)}
        </div>
      </div>

      {/* Staff Selection - Horizontal Scroll */}
      <div className='pl-10 mt-4 border-t border-gray-100 dark:border-gray-700/50 pt-4'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-sm font-bold text-gray-900 dark:text-white'>Available staff</h4>
          <div className='flex gap-1'>
            <button
              onClick={() => scrollStaff('left')}
              className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
            <button
              onClick={() => scrollStaff('right')}
              className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        </div>

        <div ref={staffScrollRef} className='flex gap-4 overflow-x-auto no-scrollbar pb-2 items-start scroll-smooth'>
          {availableStaff.map(staff => {
            const isSelected = selected.providerId === staff.id
            return (
              <button
                key={staff.id}
                onClick={() => onChangeStaff(staff.id)}
                className='bg-transparent flex flex-col items-center gap-2 group min-w-[70px] flex-shrink-0'
              >
                <div
                  className={`relative w-14 h-14 rounded-full p-0.5 transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-[#0a2c24] dark:border-white ring-2 ring-[#0a2c24]/20 dark:ring-white/20'
                      : 'border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {staff.profilePhotoUrl ? (
                    <img
                      src={staff.profilePhotoUrl}
                      alt={staff.name}
                      className='w-full h-full rounded-full object-cover'
                    />
                  ) : staff.id === 'no-preference' ? (
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center ${isSelected ? 'bg-[#0a2c24] text-white' : 'bg-white border-2 border-[#0a2c24] text-[#0a2c24]'}`}
                    >
                      <KulIcon icon='lucide:users' className='w-6 h-6' />
                    </div>
                  ) : (
                    <div className='w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold'>
                      {staff.name.charAt(0)}
                    </div>
                  )}

                  {/* Green Dot Indicator */}
                  {isSelected && (
                    <div className='absolute bottom-0 right-0 w-4 h-4 bg-[#22c55e] border-2 border-white dark:border-[#202c39] rounded-full z-10' />
                  )}
                </div>

                <span
                  className={`text-xs text-center max-w-[80px] leading-tight ${
                    isSelected
                      ? 'font-bold text-[#0a2c24] dark:text-white'
                      : 'font-medium text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {staff.name === 'No preference' ? 'No preference' : staff.name.split(' ')[0]}
                  {staff.name !== 'No preference' && staff.name.split(' ').length > 1 && (
                    <span className='block text-[10px] text-gray-400 font-normal'>{(staff as any).location || ''}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BookingModalV2Fixed({
  isOpen,
  onClose,
  initialService,
  initialTime,
  branchId,
  businessId
}: BookingModalV2FixedProps) {
  const [currentStep, setCurrentStep] = useState<'selection' | 'details' | 'success'>('selection')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Afternoon')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [showStaffSelector, setShowStaffSelector] = useState<string | null>(null)
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [timeWarning, setTimeWarning] = useState<string | null>(null)
  const hasAutoAddedInitialService = useRef(false)

  // DnD sensors - configured for both desktop and mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // 8px of movement required before drag starts
      }
    }),
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
    // We allow empty string for time so the service card appears ("Time pending")
    const timeToUse = initialTime || selectedTime || ''

    if (
      isOpen &&
      initialService &&
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
        if (businessData.fullBranches) {
          businessData.fullBranches.forEach(branch => {
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
      business: { id: '1', name: s.location }
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
      .map((slot: any) => ({
        time: slot.time,
        endTime: slot.endTime,
        type: slot.type || 'dynamic',
        available: slot.available
      }))

    setAvailableTimeSlots(periodSlots)
  }

  const dynamicSlots = availableTimeSlots.filter(s => s.type !== 'static')
  const staticSlots = availableTimeSlots.filter(s => s.type === 'static')

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
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4 transition-all duration-300'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-900 w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-500'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-20 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800'>
          <div>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>Book Appointment</h2>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block'>
              Select your preferred time and services
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
          >
            <KulIcon icon='lucide:n' className='w-6 h-6' /> {/* Using 'n' as 'x' alias close icon usually */}
            <span className='sr-only'>Close</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-x'
            >
              <path d='M18 6 6 18' />
              <path d='m6 6 18 18' />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-black/20'>
          {/* STEP 1: Selection */}
          {currentStep === 'selection' && (
            <div className='p-4 sm:p-6 space-y-4 sm:space-y-5'>
              {/* Quick Navigation Buttons */}
              <div className='flex gap-3 justify-end'>
                <button
                  onClick={goToToday}
                  className='px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-white dark:bg-gray-800 text-primary-800 dark:text-teal-300 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md border border-primary-200/50 dark:border-primary-800/50 touch-manipulation'
                >
                  Today
                </button>
                <button
                  onClick={goToNextAvailable}
                  className='bg-primary-700 hover:bg-primary-800 px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg touch-manipulation'
                >
                  Next Available
                </button>
              </div>

              {/* Days Carousel */}
              <div className='flex items-center gap-2 sm:gap-3'>
                <button
                  onClick={() => scrollDays('left')}
                  className='p-2 sm:p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-700 dark:text-teal-400 rounded-xl flex-shrink-0 transition-all shadow-sm hover:shadow-md touch-manipulation border border-gray-200 dark:border-gray-700'
                >
                  <KulIcon icon='lucide:chevron-left' className='w-5 h-5' />
                </button>

                <div ref={daysScrollRef} className='flex-1 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1'>
                  {weekDates.map((date, idx) => {
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                    // Week starts Saturday (6), ends Friday (5): Sat, Sun, Mon, Tue, Wed, Thu, Fri
                    const weekdays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px] h-16 sm:h-24 rounded-xl transition-all duration-200 touch-manipulation border ${
                          isSelected
                            ? 'bg-primary-800 text-white shadow-md border-primary-800 opacity-100'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300'
                        }`}
                      >
                        <span
                          className={`text-xs font-medium font-mono ${isSelected ? 'text-white/80' : 'text-inherit'}`}
                        >
                          {weekdays[idx]}
                        </span>
                        <span className='text-lg sm:text-2xl font-bold mt-1 font-mono'>{format(date, 'd')}</span>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => scrollDays('right')}
                  className='p-2 sm:p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-700 dark:text-teal-400 rounded-xl flex-shrink-0 transition-all shadow-sm hover:shadow-md touch-manipulation border border-gray-200 dark:border-gray-700'
                >
                  <KulIcon icon='lucide:chevron-right' className='w-5 h-5' />
                </button>
              </div>

              {/* Period Tabs */}
              <div className='flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5'>
                {(['Morning', 'Afternoon', 'Evening'] as Period[]).map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base touch-manipulation ${
                      selectedPeriod === period
                        ? 'bg-primary-800 text-white shadow-sm opacity-100'
                        : 'text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-white/50 dark:hover:bg-gray-800/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Time Slots Carousel (Dynamic) */}
              {dynamicSlots.length > 0 && (
                <div className='flex items-center gap-2 sm:gap-3'>
                  <button
                    onClick={() => scrollTimes('left')}
                    className='p-2 sm:p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-700 dark:text-teal-400 rounded-xl flex-shrink-0 transition-all shadow-sm hover:shadow-md touch-manipulation border border-gray-200 dark:border-gray-700'
                  >
                    <KulIcon icon='lucide:chevron-left' className='w-5 h-5' />
                  </button>

                  <div ref={timesScrollRef} className='flex-1 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1'>
                    {dynamicSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`flex-shrink-0 min-w-[80px] sm:min-w-[100px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base touch-manipulation border font-mono ${
                          selectedTime === slot.time
                            ? 'bg-primary-800 text-white shadow-md border-primary-800 opacity-100'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => scrollTimes('right')}
                    className='p-2 sm:p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-700 dark:text-teal-400 rounded-xl flex-shrink-0 transition-all shadow-sm hover:shadow-md touch-manipulation border border-gray-200 dark:border-gray-700'
                  >
                    <KulIcon icon='lucide:chevron-right' className='w-5 h-5' />
                  </button>
                </div>
              )}

              {/* Static Slots Grid */}
              {staticSlots.length > 0 && (
                <div className='mt-4'>
                  <h4 className='text-sm font-bold text-gray-900 dark:text-white mb-2 pl-1'>Fixed Time Slots</h4>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                    {staticSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`py-3 px-4 rounded-xl text-left border transition-all ${
                          selectedTime === slot.time
                            ? 'bg-primary-800 text-white border-primary-800 shadow-md transform scale-[1.02]'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-sm'
                        }`}
                      >
                        <div className='text-sm font-bold font-mono'>
                          {slot.time} - {slot.endTime || '...'}
                        </div>
                        <div className='text-[10px] mt-1 opacity-70'>
                          {selectedTime === slot.time ? 'Selected' : 'Available'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableTimeSlots.length === 0 && (
                <div className='text-center text-gray-400 dark:text-gray-500 py-6 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                  No available slots for this period
                </div>
              )}

              {/* Quick Add Button (when time selected but no service added yet, and no initial service) */}
              {selectedTime && selectedServices.length === 0 && availableServices.length > 0 && !initialService && (
                <div className='bg-primary-100 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4'>
                  <div className='text-sm text-primary-900 dark:text-sage-300 mb-2'>
                    Time <span className='font-mono'>{selectedTime}</span> selected. Choose a service to continue:
                  </div>
                  <button
                    onClick={() => setShowServiceSelector(true)}
                    className='w-full bg-primary-700 hover:bg-primary-800 text-white py-2 rounded-lg'
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
                className='w-full py-4 sm:py-5 border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-700 dark:text-teal-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:border-primary-400 dark:hover:border-primary-600 flex items-center justify-center gap-2 font-semibold transition-all'
              >
                <KulIcon icon='lucide:plus' className='w-5 h-5' />
                Add another service
              </button>

              {/* Service Selector Modal */}
              {showServiceSelector && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                  <div className='bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl'>
                    <div className='flex justify-between items-center mb-5'>
                      <h3 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>Select Service</h3>
                      <button
                        onClick={() => setShowServiceSelector(false)}
                        className='p-2.5 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 text-gray-500 dark:text-gray-400 rounded-xl transition-all'
                      >
                        <KulIcon icon='lucide:x' className='w-5 h-5' />
                      </button>
                    </div>
                    <div className='space-y-3'>
                      {availableServices.map(service => (
                        <button
                          key={service.id}
                          onClick={() =>
                            handleAddServiceWithTime(service, selectedTime || '00:00', 'no-preference', false)
                          }
                          className='w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all text-left group border border-gray-200 dark:border-gray-700'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <div className='flex-1'>
                              <div className='font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-teal-400 transition-colors'>
                                {service.name}
                              </div>
                              <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{service.description}</div>
                            </div>
                            <div className='text-xl font-bold text-primary-700 dark:text-teal-400 ml-4 font-mono'>
                              £{(service.price / 100).toFixed(2)}
                            </div>
                          </div>
                          <div className='text-sm text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/50 px-4 py-1.5 rounded-full inline-block font-medium font-mono'>
                            {service.duration}min
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Total & Continue */}
              {selectedServices.length > 0 && (
                <div className='sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-5 mt-4 sm:mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-6'>
                  <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className='w-full sm:w-auto text-center sm:text-left'>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>Total</div>
                      <div className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-mono'>
                        £{(calculateTotal() / 100).toFixed(2)}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400 font-mono'>
                        {calculateTotalDuration()}min
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep('details')}
                      disabled={!selectedTime}
                      className='w-full sm:w-auto bg-primary-700 hover:bg-primary-800 text-white px-8 sm:px-10 py-4 rounded-2xl text-lg font-semibold transition-all shadow-lg shadow-primary-500/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation'
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
            <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
              <h3 className='text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white'>
                Review and confirm
              </h3>

              <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700'>
                <div className='text-center mb-4 sm:mb-5'>
                  <div className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
                <div className='space-y-3'>
                  {selectedServices.map(service => (
                    <div
                      key={service.id}
                      className='bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all'
                    >
                      <div className='flex flex-col sm:flex-row justify-between gap-2 sm:gap-0'>
                        <div className='flex-1'>
                          <div className='font-bold text-base sm:text-lg text-gray-900 dark:text-white'>
                            {service.service.name}
                          </div>
                          <div className='text-sm text-primary-600 dark:text-teal-400 font-medium mt-1 font-mono'>
                            {service.time} - {service.endTime} • Staff: {service.providerName}
                          </div>
                        </div>
                        <div className='font-bold text-lg sm:text-xl text-primary-700 dark:text-teal-400 font-mono'>
                          £{(service.service.price / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Form {...detailsForm}>
                <form onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)} className='space-y-4'>
                  <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 space-y-4'>
                    <FormField
                      control={detailsForm.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Name'
                              className='rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20'
                            />
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
                            <Input
                              {...field}
                              type='email'
                              placeholder='Email'
                              className='rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20'
                            />
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
                            <Input
                              {...field}
                              placeholder='Phone (optional)'
                              className='rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20'
                            />
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
                            <Input
                              {...field}
                              placeholder='Leave note (optional)'
                              className='rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20'
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700'>
                    <div className='flex justify-between items-center mb-4 sm:mb-5'>
                      <span className='text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium'>
                        Total to pay
                      </span>
                      <span className='text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white font-mono'>
                        £{(calculateTotal() / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3'>
                      <button
                        type='button'
                        onClick={() => setCurrentStep('selection')}
                        className='flex-1 bg-white dark:bg-gray-900 border-2 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-teal-400 py-3.5 h-12 sm:h-auto rounded-xl font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 dark:hover:border-primary-600 transition-all touch-manipulation'
                      >
                        Back
                      </button>
                      <button
                        type='submit'
                        disabled={loading}
                        className='flex-1 btn-primary-enhanced btn-press py-3.5 h-12 sm:h-auto rounded-xl font-semibold disabled:opacity-50'
                      >
                        {loading ? 'Processing...' : 'Confirm & Book'}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* STEP 3: Success */}
          {currentStep === 'success' && (
            <div className='p-6 sm:p-8 lg:p-12 text-center space-y-5 sm:space-y-6'>
              <div className='flex justify-center'>
                <div className='w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/30 animate-scale-in'>
                  <Check className='w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white stroke-[3]' />
                </div>
              </div>

              <div className='space-y-3'>
                <h3 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>Appointment Confirmed</h3>
                <div className='text-lg sm:text-xl font-semibold text-primary-700 dark:text-teal-400 font-mono'>
                  {format(selectedDate, 'MMM d, yyyy')}
                </div>
                <div className='text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-sm mx-auto'>
                  You're done! We'll send you a reminder before your appointment.
                </div>
              </div>

              <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 max-w-md mx-auto space-y-3'>
                <button
                  onClick={handleDownloadICS}
                  className='w-full btn-primary-enhanced btn-press py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2'
                >
                  <CalendarPlus className='w-5 h-5' />
                  Download Calendar Event
                </button>

                <button
                  onClick={onClose}
                  className='w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all touch-manipulation'
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
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
