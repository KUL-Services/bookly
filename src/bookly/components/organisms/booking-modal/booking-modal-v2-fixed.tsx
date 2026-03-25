'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  ArrowLeft,
  GripVertical,
  CheckCircle2,
  Building2,
  MapPin
} from 'lucide-react'
import { format, addDays, startOfDay, isSameDay, isBefore } from 'date-fns'
import type { Service as ApiService, Staff, AvailabilitySlot, CreateBookingRequest, Branch } from '@/lib/api'
import { BookingService } from '@/lib/api/services/booking.service'
import { WaitlistService } from '@/lib/api/services/waitlist.service'
import { useSettings } from '@/contexts/settings.context'
import { useAuthStore } from '@/stores/auth.store'

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- Interfaces ---

// --- Modifiers ---
const restrictToVerticalAxis = ({ transform }: any) => {
  return {
    ...transform,
    x: 0
  }
}

interface BookingModalV2FixedProps {
  isOpen: boolean
  onClose: () => void
  initialService?: ApiService | null
  branchId?: string
  businessId: string
  availableServices?: ApiService[]
  availableStaff?: Staff[]
  branches?: Branch[]
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening'
type BookingStep = 'booking' | 'details' | 'confirm'
type SubmissionType = 'booking' | 'waitlist'

interface SelectedService {
  id: string // Unique ID for this instance selected (e.g. serviceId + timestamp)
  service: ApiService
  staffId?: string
  staffName?: string
}

interface CustomerDetails {
  name: string
  email: string
  phone: string
  notes: string
}

// --- Helper Functions ---

const generateTimeSlots = (timeOfDay: TimeOfDay): string[] => {
  const slots: string[] = []
  let start: number
  let end: number

  switch (timeOfDay) {
    case 'morning':
      start = 9
      end = 12
      break
    case 'afternoon':
      start = 12
      end = 17
      break
    case 'evening':
      start = 17
      end = 21
      break
  }

  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  return slots
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query)
      setMatches(media.matches)
      const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [query])
  return matches
}

// --- Sortable Item Component ---

interface SortableServiceItemProps {
  item: SelectedService
  index: number
  isMultiple: boolean
  isOverlay?: boolean
  currencySymbol: string
  availableStaff: Staff[]
  onRemove: (id: string) => void
  onStaffChangeClick: (id: string) => void
  showStaffPicker: boolean
  onChangeStaff: (serviceId: string, staffId: string, staffName: string) => void
  startTime?: string // e.g. "14:00"
  endTime?: string // e.g. "14:45"
  isRoomBasedService?: boolean // Detected from availability slots or service data
}

function SortableServiceItem({
  item,
  isMultiple,
  isOverlay,
  currencySymbol,
  availableStaff,
  onRemove,
  onStaffChangeClick,
  showStaffPicker,
  onChangeStaff,
  startTime,
  endTime,
  isRoomBasedService
}: SortableServiceItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as const
  }

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? {} : style}
      className={`p-4 rounded-2xl border transition-all ${
        isOverlay
          ? 'bg-white dark:bg-[#1a2e35] shadow-xl border-[#0a2c24] dark:border-[#77b6a3] scale-105'
          : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 shadow-sm'
      }`}
    >
      <div className='flex items-start gap-3'>
        {isMultiple && (
          <div
            {...attributes}
            {...listeners}
            style={{ touchAction: 'none' }}
            className='flex items-center justify-center pt-3 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-[#0a2c24] dark:hover:text-[#77b6a3] transition-colors self-center sm:self-start'
          >
            <GripVertical className='w-5 h-5' />
          </div>
        )}

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1 min-w-0'>
              <h4 className='text-base font-bold text-gray-900 dark:text-white line-clamp-1'>{item.service.name}</h4>
              <div className='flex items-center gap-3 mt-1.5 flex-wrap'>
                <span className='inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                  <Clock className='w-3.5 h-3.5' />
                  {item.service.duration} min
                </span>
                {startTime && endTime ? (
                  <span className='inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#0a2c24]/10 dark:bg-[#77b6a3]/20 text-[#0a2c24] dark:text-[#77b6a3]'>
                    <Calendar className='w-3 h-3' />
                    {startTime} – {endTime}
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic'>
                    Select time below
                  </span>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-lg font-bold text-[#0a2c24] dark:text-[#77b6a3]'>
                {currencySymbol}
                {item.service.price}
              </p>
              <button
                onClick={e => {
                  e.stopPropagation()
                  onRemove(item.id)
                }}
                className='p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>

          <div className='mt-3 pt-3 border-t border-gray-100 dark:border-white/10'>
            {(() => {
              const svc = item.service as any
              const hasStaffIds = svc?.staffIds?.length > 0
              const hasRoomIds = svc?.roomIds?.length > 0
              // Room-only = has rooms but NO staff assigned. If it has both rooms + staff, show staff picker.
              const isRoomOnly = (hasRoomIds && !hasStaffIds) || (isRoomBasedService && availableStaff.length === 0)

              if (isRoomOnly) {
                return (
                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                    <Building2 className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                    <span>Room-based service — room auto-assigned</span>
                  </div>
                )
              }

              return (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onStaffChangeClick(item.id)
                    }}
                    className='flex items-center justify-between w-full text-left'
                  >
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Staff: {item.staffName || 'No preference'}
                    </span>
                    <span className='text-xs font-bold px-2.5 py-1 border border-[#0a2c24] dark:border-[#77b6a3] text-[#0a2c24] dark:text-[#77b6a3] rounded-full hover:bg-[#0a2c24]/5 dark:hover:bg-[#77b6a3]/10 transition-colors'>
                      Change
                    </span>
                  </button>

                  {showStaffPicker && !isOverlay && (
                    <div className='mt-3 p-2 bg-gray-50 dark:bg-white/5 rounded-xl space-y-1 max-h-48 overflow-y-auto border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200'>
                      <button
                        onClick={() => onChangeStaff(item.id, '', 'No preference')}
                        className='w-full flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors'
                      >
                        <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
                          <User className='w-4 h-4 text-gray-500' />
                        </div>
                        <span className='text-sm font-medium dark:text-white'>No preference</span>
                      </button>
                      {availableStaff
                        .filter(staff => {
                          // Only show staff assigned to this service (if service has staffIds)
                          const svc = item.service as any
                          if (svc?.staffIds?.length > 0) return svc.staffIds.includes(staff.id)
                          return true
                        })
                        .map(staff => (
                        <button
                          key={staff.id}
                          onClick={() => onChangeStaff(item.id, staff.id, staff.name)}
                          className='w-full flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors'
                        >
                          <img
                            src={
                              (staff as any).profilePhotoUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`
                            }
                            alt={staff.name}
                            className='w-8 h-8 rounded-full object-cover bg-gray-200'
                          />
                          <span className='text-sm font-medium dark:text-white'>{staff.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---

export function BookingModalV2Fixed({
  isOpen,
  onClose,
  initialService,
  branchId,
  businessId,
  availableServices = [],
  availableStaff = [],
  branches = []
}: BookingModalV2FixedProps) {
  const { currency } = useSettings()
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const { isAuthenticated, booklyUser } = useAuthStore()

  // State
  const [step, setStep] = useState<BookingStep>('booking')
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('afternoon')
  const [isClosing, setIsClosing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // API availability state
  const [apiSlots, setApiSlots] = useState<AvailabilitySlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [hasFetchedAvailability, setHasFetchedAvailability] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [waitlistEntryId, setWaitlistEntryId] = useState<string | null>(null)
  const [isLeavingWaitlist, setIsLeavingWaitlist] = useState(false)
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null)

  // Branch selection
  const [activeBranchId, setActiveBranchId] = useState<string | undefined>(branchId)
  const hasMultipleBranches = branches.length > 1

  // Filtered services/staff by active branch
  const branchFilteredServices = useMemo(() => {
    if (!activeBranchId || branches.length <= 1) return availableServices
    // Filter services that belong to the active branch
    return availableServices.filter(svc => {
      // If service has branches array, check if active branch is included
      if ((svc as any).branches?.length > 0) {
        return (svc as any).branches.some((b: any) => b.id === activeBranchId)
      }
      // If service has no branch association, show it everywhere
      return true
    })
  }, [availableServices, activeBranchId, branches.length])

  const branchFilteredStaff = useMemo(() => {
    if (!activeBranchId || branches.length <= 1) return availableStaff
    return availableStaff.filter(s => (s as any).branchId === activeBranchId)
  }, [availableStaff, activeBranchId, branches.length])

  // Modals & Pickers
  const [showServicePicker, setShowServicePicker] = useState(false)
  const [activeStaffPickerId, setActiveStaffPickerId] = useState<string | null>(null)

  // Data
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({})
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Drag & Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    }),
    useSensor(TouchSensor, {
      // Small delay/tolerance to distinguish scroll from drag
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    })
  )
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  // --- Initialization ---

  // Initialization Effect - Runs ONLY when isOpen changes to true
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      setStep('booking')
      setIsClosing(false)
      setIsSubmitting(false)
      setShowServicePicker(false)
      setActiveStaffPickerId(null)
      setCustomerDetails({ name: '', email: '', phone: '', notes: '' })
      setErrors({})
      setBookingReference(null)
      setWaitlistEntryId(null)
      setSubmissionType(null)
      setBookingError(null)
      setSelectedDate(new Date())
      setSelectedTime(null)
      setActiveBranchId(branchId || branches[0]?.id)

      // Pre-fill customer details if logged in
      if (isAuthenticated() && booklyUser) {
        setCustomerDetails({
          name: booklyUser.name || '',
          email: booklyUser.email || '',
          phone: booklyUser.phone || '',
          notes: ''
        })
      } else {
        setCustomerDetails({ name: '', email: '', phone: '', notes: '' })
      }

      // Initial Service Population
      // We use a timestamp to ensure uniqueness if the ID is reused
      if (initialService) {
        setSelectedServices([
          {
            id: `${initialService.id}-${Date.now()}`,
            service: initialService,
            staffName: 'No preference'
          }
        ])
      } else {
        setSelectedServices([])
      }
    } else {
      setMounted(false)
    }
  }, [isOpen, initialService])
  // Updated dependency array to include initialService so it catches updates even if isOpen is already true

  // Effective branch ID: use internal selection (activeBranchId) over prop
  const effectiveBranchId = activeBranchId || branchId

  // Track the primary service ID and staffId as stable values to prevent stale closure issues
  const primaryServiceId = selectedServices.length > 0 ? selectedServices[0].service.id : null
  const primaryStaffId = selectedServices.length > 0 ? (selectedServices[0].staffId || null) : null

  // Fetch real availability from API when date, services, or branch change
  const fetchIdRef = useRef(0)
  useEffect(() => {
    if (!isOpen || !primaryServiceId || !effectiveBranchId) {
      setApiSlots([])
      setHasFetchedAvailability(false)
      return
    }

    // Increment fetch ID to cancel stale responses (race condition guard)
    const currentFetchId = ++fetchIdRef.current

    const fetchAvailability = async () => {
      setIsLoadingSlots(true)
      setHasFetchedAvailability(false)
      setSlotsError(null)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const result = await BookingService.getAvailability({
          serviceId: primaryServiceId,
          branchId: effectiveBranchId,
          date: dateStr,
          resourceId: primaryStaffId || undefined
        })

        // Discard stale response if a newer fetch has started
        if (currentFetchId !== fetchIdRef.current) return

        if (result.data && Array.isArray(result.data)) {
          setApiSlots(result.data)

          // Auto-detect best time period based on returned slots
          if (result.data.length > 0) {
            const slotHours = result.data.map(slot => new Date(slot.startTime).getHours())
            const hasMorning = slotHours.some(h => h >= 9 && h < 12)
            const hasAfternoon = slotHours.some(h => h >= 12 && h < 17)
            const hasEvening = slotHours.some(h => h >= 17 && h < 21)

            // Switch to the period that has slots (if current period is empty)
            setSelectedTimeOfDay(prev => {
              const currentHasSlots =
                (prev === 'morning' && hasMorning) ||
                (prev === 'afternoon' && hasAfternoon) ||
                (prev === 'evening' && hasEvening)
              if (currentHasSlots) return prev
              if (hasMorning) return 'morning'
              if (hasAfternoon) return 'afternoon'
              if (hasEvening) return 'evening'
              return prev
            })
          }
        } else {
          setApiSlots([])
          if (result.error) setSlotsError(result.error)
        }
      } catch (err) {
        if (currentFetchId !== fetchIdRef.current) return
        console.error('Failed to fetch availability:', err)
        setSlotsError('Could not load availability')
        setApiSlots([])
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setIsLoadingSlots(false)
          setHasFetchedAvailability(true)
        }
      }
    }

    fetchAvailability()
  }, [isOpen, selectedDate, primaryServiceId, primaryStaffId, effectiveBranchId])

  // --- Computed Values ---

  const availableDates = useMemo(() => {
    const dates: Date[] = []
    const start = startOfDay(new Date())
    for (let i = 0; i < 30; i++) {
      // Show next 30 days
      dates.push(addDays(start, i))
    }
    return dates
  }, [])

  const timeSlots = useMemo(() => generateTimeSlots(selectedTimeOfDay), [selectedTimeOfDay])

  // Use real API slots when available, fall back to generated mock slots
  const availableSlots = useMemo(() => {
    if (isLoadingSlots && !hasFetchedAvailability) {
      return [] as { time: string; sessionName?: string; availableSpots?: number; resourceName?: string; resourceType?: string }[]
    }

    if (hasFetchedAvailability && !slotsError) {
      // Convert API slots to enriched display slots
      const enrichedSlots = apiSlots.map(slot => {
        const d = new Date(slot.startTime)
        const h = d.getHours()
        const m = d.getMinutes()
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        return {
          time,
          sessionName: slot.sessionName,
          availableSpots: slot.availableSpots,
          resourceName: slot.resourceName,
          resourceType: slot.resourceType
        }
      })

      // Filter by selected time of day
      const filtered = enrichedSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0])
        switch (selectedTimeOfDay) {
          case 'morning':
            return hour >= 9 && hour < 12
          case 'afternoon':
            return hour >= 12 && hour < 17
          case 'evening':
            return hour >= 17 && hour < 21
        }
      })

      // Deduplicate by time and sort (keep the first occurrence which has session info)
      const seen = new Set<string>()
      return filtered
        .filter(slot => {
          if (seen.has(slot.time)) return false
          seen.add(slot.time)
          return true
        })
        .sort((a, b) => a.time.localeCompare(b.time))
    }
    // Fallback during loading/errors
    return timeSlots.map(time => ({ time, sessionName: undefined, availableSpots: undefined, resourceName: undefined, resourceType: undefined }))
  }, [apiSlots, timeSlots, selectedTimeOfDay, hasFetchedAvailability, slotsError, isLoadingSlots])

  const noAvailableSlots = hasFetchedAvailability && !slotsError && availableSlots.length === 0

  // Detect if the primary service is room-based from availability slots
  // (fallback when public API doesn't return roomIds/staffIds on service objects)
  const isDetectedRoomService = useMemo(() => {
    if (apiSlots.length === 0) return false
    return apiSlots.every(slot => slot.resourceType === 'ASSET')
  }, [apiSlots])

  const totals = useMemo(() => {
    const price = selectedServices.reduce((sum, s) => sum + (s.service.price || 0), 0)
    const duration = selectedServices.reduce((sum, s) => sum + (s.service.duration || 0), 0)
    return { price, duration }
  }, [selectedServices])

  const unselectedServices = useMemo(() => {
    // Show branch-filtered services in picker
    return branchFilteredServices
  }, [branchFilteredServices])

  const canProceed = selectedServices.length > 0 && selectedTime !== null

  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'AED':
        return 'AED '
      case 'SAR':
        return 'SAR '
      default:
        return 'EGP '
    }
  }, [currency])

  // Calculate start and end times for each service based on their order
  const serviceTimeRanges = useMemo(() => {
    if (!selectedTime) return {}

    const ranges: Record<string, { startTime: string; endTime: string }> = {}
    let currentMinutes = 0

    // Parse selected time to minutes
    const [hours, mins] = selectedTime.split(':').map(Number)
    const startMinutesOfDay = hours * 60 + mins

    selectedServices.forEach(service => {
      const serviceStartMinutes = startMinutesOfDay + currentMinutes
      const serviceEndMinutes = serviceStartMinutes + (service.service.duration || 0)

      // Format time as HH:MM
      const formatTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60) % 24
        const m = totalMinutes % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      }

      ranges[service.id] = {
        startTime: formatTime(serviceStartMinutes),
        endTime: formatTime(serviceEndMinutes)
      }

      currentMinutes += service.service.duration || 0
    })

    return ranges
  }, [selectedTime, selectedServices])

  // --- Handlers ---

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setMounted(false)
    }, 300)
  }, [onClose])

  const handleBack = useCallback(() => {
    if (step === 'details') setStep('booking')
    else if (step === 'confirm') handleClose()
  }, [step, handleClose])

  const handleNext = useCallback(() => {
    if (step === 'booking' && canProceed) setStep('details')
  }, [step, canProceed])

  const handleAddService = useCallback((service: ApiService) => {
    // Generate unique ID using random + timestamp
    const uniqueId = `${service.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    setSelectedServices(prev => [
      ...prev,
      {
        id: uniqueId,
        service,
        staffName: 'No preference'
      }
    ])
    setShowServicePicker(false)
  }, [])

  const handleRemoveService = useCallback((id: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleChangeStaff = useCallback((serviceId: string, staffId: string, staffName: string) => {
    setSelectedServices(prev => prev.map(s => (s.id === serviceId ? { ...s, staffId, staffName } : s)))
    setActiveStaffPickerId(null)
  }, [])

  const validateDetails = useCallback((forWaitlist: boolean): boolean => {
    const newErrors: Partial<CustomerDetails> = {}
    const hasEmail = !!customerDetails.email.trim()
    const hasPhone = !!customerDetails.phone.trim()

    if (!customerDetails.name.trim()) newErrors.name = 'Name is required'

    if (forWaitlist) {
      if (!isAuthenticated() && !hasEmail && !hasPhone) {
        newErrors.email = 'Provide email or phone for waitlist updates'
      } else if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
        newErrors.email = 'Invalid email format'
      }
    } else {
      if (!hasEmail) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) newErrors.email = 'Invalid email format'
      if (!hasPhone) newErrors.phone = 'Phone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [customerDetails, isAuthenticated])

  const handleConfirmBooking = useCallback(async () => {
    const isWaitlistMode = noAvailableSlots
    if (!validateDetails(isWaitlistMode)) return
    setIsSubmitting(true)
    setBookingError(null)
    try {
      // Build ISO start time from selected date + time
      const [hours, mins] = (selectedTime || '00:00').split(':').map(Number)
      const startDate = new Date(selectedDate)
      startDate.setHours(hours, mins, 0, 0)

      const primaryService = selectedServices[0]
      if (!primaryService || !effectiveBranchId) {
        throw new Error('Missing service or branch')
      }

      let result
      const selectedSlot =
        apiSlots.find(slot => {
          const d = new Date(slot.startTime)
          const h = d.getHours().toString().padStart(2, '0')
          const m = d.getMinutes().toString().padStart(2, '0')
          return `${h}:${m}` === selectedTime
        }) || null

      if (isWaitlistMode) {
        const durationMinutes = primaryService.service.duration || 60
        const derivedEndDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
        const isAuthed = isAuthenticated()

        result = await WaitlistService.join({
          serviceId: primaryService.service.id,
          branchId: effectiveBranchId,
          slotStart: startDate.toISOString(),
          slotEnd: selectedSlot?.endTime || derivedEndDate.toISOString(),
          resourceId: selectedSlot?.resourceId || primaryService.staffId || undefined,
          sessionId: selectedSlot?.sessionId || undefined,
          userId: isAuthed ? booklyUser?.id : undefined,
          partySize: 1,
          customerName: customerDetails.name || undefined,
          customerEmail: customerDetails.email || undefined,
          customerPhone: customerDetails.phone || undefined,
          notes: customerDetails.notes || undefined
        })

        if (result.data) {
          const entry = (result.data as any)?.data ?? result.data
          const entryId = entry?.id || `WL-${Date.now().toString(36).toUpperCase().slice(-6)}`
          setWaitlistEntryId(entryId)
          setBookingReference(entryId)
          setSubmissionType('waitlist')
          setStep('confirm')
        } else {
          setBookingError(result.error || 'Could not join waitlist. Please try again.')
        }
      } else {
        // Use the exact API slot time (avoids timezone issues from manual date construction)
        const bookingStartTime = selectedSlot?.startTime || startDate.toISOString()

        // Determine resource/room IDs from matched slot
        const isRoomSlot = selectedSlot?.resourceType === 'ASSET'
        const bookingResourceId = isRoomSlot ? undefined : (selectedSlot?.resourceId || primaryService.staffId || undefined)
        const bookingRoomId = isRoomSlot ? selectedSlot?.resourceId : undefined

        // For STATIC mode, include sessionId from the matched slot
        const bookingSessionId = selectedSlot?.sessionId || undefined

        const bookingPayload: CreateBookingRequest = {
          serviceId: primaryService.service.id,
          branchId: effectiveBranchId,
          resourceId: bookingResourceId,
          roomId: bookingRoomId,
          sessionId: bookingSessionId,
          startTime: bookingStartTime,
          notes: customerDetails.notes || undefined
        }

        if (isAuthenticated()) {
          result = await BookingService.createBooking(bookingPayload)
        } else {
          result = await BookingService.createGuestBooking({
            ...bookingPayload,
            customerName: customerDetails.name,
            customerEmail: customerDetails.email,
            customerPhone: customerDetails.phone
          })
        }

        if (result.data) {
          const booking = (result.data as any)?.data ?? result.data
          setBookingReference(booking?.id || `BK-${Date.now().toString(36).toUpperCase().slice(-6)}`)
          setSubmissionType('booking')
          setStep('confirm')
        } else {
          setBookingError(result.error || 'Booking failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Booking failed:', error)
      setBookingError(error instanceof Error ? error.message : 'Booking failed')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    validateDetails,
    selectedDate,
    selectedTime,
    selectedServices,
    apiSlots,
    noAvailableSlots,
    effectiveBranchId,
    customerDetails,
    isAuthenticated,
    booklyUser
  ])

  const handleLeaveWaitlist = useCallback(async () => {
    if (!waitlistEntryId) return

    const email = customerDetails.email?.trim() || booklyUser?.email || undefined
    const phone = customerDetails.phone?.trim() || booklyUser?.phone || undefined

    if (!email && !phone) {
      setBookingError('Email or phone is required to leave the waitlist')
      return
    }

    setIsLeavingWaitlist(true)
    setBookingError(null)
    try {
      const result = await WaitlistService.leave({
        entryId: waitlistEntryId,
        customerEmail: email,
        customerPhone: phone,
        reason: 'User requested removal from waitlist'
      })

      if (result.error) {
        setBookingError(result.error || 'Could not leave waitlist')
        return
      }

      handleClose()
    } catch (error) {
      console.error('Failed to leave waitlist:', error)
      setBookingError(error instanceof Error ? error.message : 'Could not leave waitlist')
    } finally {
      setIsLeavingWaitlist(false)
    }
  }, [waitlistEntryId, customerDetails.email, customerDetails.phone, booklyUser?.email, booklyUser?.phone, handleClose])

  // --- Drag and Drop Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
    if (navigator.vibrate) navigator.vibrate(10) // Haptic feedback start
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedServices(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
      if (navigator.vibrate) navigator.vibrate(20) // Haptic feedback end
    }

    setActiveDragId(null)
  }

  // --- Render ---

  if (!isOpen) return null

  // We are focusing on Mobile mostly as requested ("Refining... is not good... on both desktop and mobile")
  // But we want a unified responsive experience.
  // The previous code had a specific `isMobile` check return. We will maintain that distinction if needed,
  // but let's try to unify or use the improved mobile layout.
  // Using the new Slide-Up Sheet style for mobile and a Centered Modal for desktop is standard.

  // NOTE: For simplicity and since the user asked for MOBILE optimization mainly,
  // I'll ensure the mobile view (which might be triggered by `isMobile`) is perfect.
  // But I will also ensure the desktop view works.
  // I'll stick to the "Sheet" style for mobile and "Modal" for desktop.

  const content = (
    <>
      {/* Header */}
      <div className='relative px-5 pt-4 pb-4 bg-white dark:bg-[#1a2e35] border-b border-gray-100 dark:border-white/10 flex-shrink-0'>
        <div className='flex items-center gap-3'>
          {step === 'details' && (
            <button
              onClick={handleBack}
              className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 text-gray-500 dark:text-gray-400' />
            </button>
          )}
          <div className='flex-1'>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
              {step === 'booking' && 'Book Appointment'}
              {step === 'details' && 'Your Details'}
              {step === 'confirm' && 'Booking Confirmed!'}
            </h2>
            {step !== 'confirm' && (
              <div className='flex items-center gap-2 mt-1'>
                <div className='flex-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-[#0a2c24] dark:bg-[#77b6a3] transition-all duration-300'
                    style={{ width: step === 'booking' ? '50%' : '100%' }}
                  />
                </div>
                <span className='text-xs text-gray-400'>Step {step === 'booking' ? 1 : 2}/2</span>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
          >
            <X className='w-6 h-6 text-gray-400' />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='flex-1 overflow-y-auto overscroll-contain bg-[#f8faf9] dark:bg-[#0f1f1b]'>
        {step === 'booking' && (
          <div className='p-5 space-y-6 pb-24'>
            {' '}
            {/* pb-24 for sticky footer */}
            {/* Branch Selector — only shown for multi-branch businesses */}
            {hasMultipleBranches && (
              <div className='space-y-2'>
                <h3 className='text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                  Select Location
                </h3>
                <div className='-mx-5 px-5 overflow-x-auto no-scrollbar py-1'>
                  <div className='flex gap-2'>
                    {branches.filter(b => b.isActive !== false).map(branch => {
                      const isSelected = activeBranchId === branch.id
                      return (
                        <button
                          key={branch.id}
                          onClick={() => {
                            setActiveBranchId(branch.id)
                            // Clear selected services when branch changes (they may not be available at new branch)
                            setSelectedServices([])
                            setSelectedTime(null)
                            setApiSlots([])
                            setHasFetchedAvailability(false)
                          }}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] shadow-md'
                              : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#0a2c24] dark:hover:border-[#77b6a3]'
                          }`}
                        >
                          {branch.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* Services Section */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                  <Sparkles className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                  Selected Services
                </h3>
                {selectedServices.length > 0 && (
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {totals.duration} min • {currencySymbol}
                    {totals.price}
                  </span>
                )}
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={selectedServices.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className='space-y-3'>
                    {selectedServices.map((item, index) => (
                      <SortableServiceItem
                        key={item.id}
                        item={item}
                        index={index}
                        isMultiple={selectedServices.length > 1}
                        currencySymbol={currencySymbol}
                        availableStaff={branchFilteredStaff}
                        onRemove={handleRemoveService}
                        onStaffChangeClick={id => setActiveStaffPickerId(activeStaffPickerId === id ? null : id)}
                        showStaffPicker={activeStaffPickerId === item.id}
                        onChangeStaff={handleChangeStaff}
                        startTime={serviceTimeRanges[item.id]?.startTime}
                        endTime={serviceTimeRanges[item.id]?.endTime}
                        isRoomBasedService={index === 0 ? isDetectedRoomService : undefined}
                      />
                    ))}
                  </div>
                </SortableContext>

                {/* Use Portal for DragOverlay to fix transform/zIndex issues */}
                {typeof window !== 'undefined' &&
                  createPortal(
                    <DragOverlay
                      dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
                      }}
                      zIndex={9999} // Ensure high z-index
                    >
                      {activeDragId ? (
                        <div className='w-[340px] md:w-[480px]'>
                          {' '}
                          {/* Fixed width to prevent collapsing during portal based on modal size guess */}
                          <SortableServiceItem
                            item={selectedServices.find(s => s.id === activeDragId)!}
                            index={0}
                            isMultiple={true}
                            isOverlay={true}
                            currencySymbol={currencySymbol}
                            availableStaff={branchFilteredStaff}
                            onRemove={() => {}}
                            onStaffChangeClick={() => {}}
                            showStaffPicker={false}
                            onChangeStaff={() => {}}
                            startTime={serviceTimeRanges[activeDragId]?.startTime}
                            endTime={serviceTimeRanges[activeDragId]?.endTime}
                            isRoomBasedService={isDetectedRoomService}
                          />
                        </div>
                      ) : null}
                    </DragOverlay>,
                    document.body
                  )}
              </DndContext>
              <button
                onClick={() => setShowServicePicker(true)}
                className='w-full py-3.5 border-2 border-dashed border-[#0a2c24]/20 dark:border-[#77b6a3]/20 rounded-2xl text-[#0a2c24] dark:text-[#77b6a3] hover:bg-[#0a2c24]/5 dark:hover:bg-[#77b6a3]/10 flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98]'
              >
                <Plus className='w-5 h-5' />
                Add another service
              </button>
              {selectedServices.length > 1 && (
                <p className='text-center text-xs text-gray-400'>Long press & drag to reorder services</p>
              )}
            </div>
            {/* Date Selection - Horizontal Scroller (No Grid/Heatmap) */}
            <div className='space-y-3'>
              <h3 className='text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                Select Date
              </h3>
              <div className='-mx-5 px-5 overflow-x-auto no-scrollbar py-2'>
                <div className='flex gap-2.5'>
                  {availableDates.map(date => {
                    const isSelected = isSameDay(date, selectedDate)
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] shadow-lg scale-105'
                            : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span className='text-xs font-medium opacity-80'>{format(date, 'EEE')}</span>
                        <span className={`text-xl font-bold ${isSelected ? '' : 'text-gray-900 dark:text-white'}`}>
                          {format(date, 'd')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            {/* Time Selection */}
            <div className='space-y-3'>
              <h3 className='text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <Clock className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3]' />
                Select Time
              </h3>

              {/* Time of Day Pills */}
              <div className='flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-3'>
                {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map(period => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedTimeOfDay(period)
                      setSelectedTime(null) // Reset selection when switching period
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                      selectedTimeOfDay === period
                        ? 'bg-white dark:bg-[#77b6a3] text-[#0a2c24] shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {isLoadingSlots ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='w-6 h-6 border-2 border-[#0a2c24] dark:border-[#77b6a3] border-t-transparent rounded-full animate-spin' />
                  <span className='ml-2 text-sm text-gray-500'>Loading available slots...</span>
                </div>
              ) : slotsError ? (
                <div className='text-center py-4'>
                  <p className='text-sm text-amber-600 dark:text-amber-400'>Using default time slots</p>
                </div>
              ) : null}

              <div className='grid grid-cols-4 gap-2'>
                {availableSlots.map(slot => {
                  const isSelected = selectedTime === slot.time
                  return (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] shadow-md'
                          : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#0a2c24] dark:hover:border-[#77b6a3]'
                      }`}
                    >
                      <span>{slot.time}</span>
                      {slot.resourceType === 'ASSET' && slot.resourceName && (
                        <span className={`block text-[10px] font-normal mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#0a2c24]/60 dark:text-[#77b6a3]/60'}`}>
                          {slot.resourceName}
                        </span>
                      )}
                      {slot.availableSpots != null && (
                        <span className={`block text-[10px] font-normal mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                          {slot.availableSpots} spot{slot.availableSpots !== 1 ? 's' : ''} left
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {noAvailableSlots && (
                <div className='space-y-3 pt-2'>
                  <p className='text-center text-sm text-amber-600 dark:text-amber-400 py-1'>
                    No available time slots for this period. Choose a preferred time to join the waitlist.
                  </p>
                  <div className='grid grid-cols-4 gap-2'>
                    {timeSlots.map(time => {
                      const isSelected = selectedTime === time
                      return (
                        <button
                          key={`wl-${time}`}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                              : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-600'
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {bookingError && step === 'booking' && (
                <p className='text-sm text-red-500 dark:text-red-400 mt-2'>{bookingError}</p>
              )}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className='p-5 space-y-5'>
            {/* Summary Card */}
            <div className='p-4 bg-[#0a2c24]/5 dark:bg-[#77b6a3]/10 rounded-2xl border border-[#0a2c24]/10 dark:border-[#77b6a3]/20'>
              <h3 className='text-sm font-bold text-gray-900 dark:text-white mb-3'>
                {noAvailableSlots ? 'Waitlist Request Summary' : 'Booking Summary'}
              </h3>
              <div className='space-y-2 text-sm'>
                <div className='flex items-start gap-3'>
                  <Calendar className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3] mt-0.5' />
                  <div>
                    <p className='font-medium text-gray-900 dark:text-white'>
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className='text-gray-500 dark:text-gray-400'>at {selectedTime}</p>
                  </div>
                </div>
                <div className='flex items-start gap-3 pt-2 border-t border-dashed border-gray-200 dark:border-white/10'>
                  <Sparkles className='w-4 h-4 text-[#0a2c24] dark:text-[#77b6a3] mt-0.5' />
                  <div className='flex-1'>
                    {selectedServices.map(s => (
                      <div key={s.id} className='flex justify-between mb-1'>
                        <span className='text-gray-900 dark:text-white'>{s.service.name}</span>
                        <span className='text-gray-500 font-medium'>
                          {currencySymbol}
                          {s.service.price}
                        </span>
                      </div>
                    ))}
                    <div className='flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-white/10 font-bold'>
                      <span className='text-[#0a2c24] dark:text-[#77b6a3]'>Total</span>
                      <span className='text-[#0a2c24] dark:text-[#77b6a3]'>
                        {currencySymbol}
                        {totals.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  <User className='w-4 h-4 inline mr-2 text-[#77b6a3]' />
                  Full Name
                </label>
                <input
                  type='text'
                  value={customerDetails.name}
                  onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className={`w-full px-4 py-3 text-base rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-white/5 outline-none focus:ring-2 focus:ring-[#0a2c24] dark:focus:ring-[#77b6a3] transition-all`}
                  placeholder='John Doe'
                />
                {errors.name && <p className='text-xs text-red-500 mt-1 ml-1'>{errors.name}</p>}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  <Mail className='w-4 h-4 inline mr-2 text-[#77b6a3]' />
                  Email Address
                </label>
                <input
                  type='email'
                  value={customerDetails.email}
                  onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className={`w-full px-4 py-3 text-base rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-white/5 outline-none focus:ring-2 focus:ring-[#0a2c24] dark:focus:ring-[#77b6a3] transition-all`}
                  placeholder='john@example.com'
                />
                {errors.email && <p className='text-xs text-red-500 mt-1 ml-1'>{errors.email}</p>}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  <Phone className='w-4 h-4 inline mr-2 text-[#77b6a3]' />
                  Phone Number
                </label>
                <input
                  type='tel'
                  value={customerDetails.phone}
                  onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className={`w-full px-4 py-3 text-base rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-white/5 outline-none focus:ring-2 focus:ring-[#0a2c24] dark:focus:ring-[#77b6a3] transition-all`}
                  placeholder='+1 234 567 8900'
                />
                {errors.phone && <p className='text-xs text-red-500 mt-1 ml-1'>{errors.phone}</p>}
              </div>
            </div>

            {/* Static Action Button for Details Step */}
            <div className='pt-4'>
              {bookingError && <p className='text-sm text-red-500 dark:text-red-400 mb-3'>{bookingError}</p>}
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-95 ${
                  isSubmitting
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] hover:shadow-xl'
                }`}
              >
                {isSubmitting ? 'Processing...' : noAvailableSlots ? 'Join Waitlist' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className='flex flex-col items-center justify-center p-8 text-center h-full'>
            <div className='w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500'>
              <CheckCircle2 className='w-12 h-12 text-green-600 dark:text-green-400' />
            </div>
            <h2 className='text-2xl font-bold text-[#0a2c24] dark:text-white mb-2'>
              {submissionType === 'waitlist' ? 'Added to Waitlist!' : 'Booking Confirmed!'}
            </h2>
            <p className='text-gray-500 dark:text-gray-400 mb-8'>
              {submissionType === 'waitlist'
                ? 'We will notify you when this time becomes available.'
                : 'Your appointment has been scheduled successfully.'}
            </p>
            <div className='p-6 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 w-full mb-8'>
              <p className='text-xs text-gray-400 mb-1'>
                {submissionType === 'waitlist' ? 'Waitlist Entry ID' : 'Reference ID'}
              </p>
              <p className='text-xl font-mono font-bold text-[#0a2c24] dark:text-[#77b6a3] tracking-widest'>
                {bookingReference}
              </p>
            </div>
            {submissionType === 'waitlist' && waitlistEntryId && (
              <button
                onClick={handleLeaveWaitlist}
                disabled={isLeavingWaitlist}
                className='w-full mb-3 py-3 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50'
              >
                {isLeavingWaitlist ? 'Leaving Waitlist...' : 'Leave Waitlist'}
              </button>
            )}
            <button
              onClick={handleClose}
              className='w-full py-4 bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] text-lg font-bold rounded-2xl shadow-lg active:scale-95 transition-all'
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Sticky Footer for Actions */}
      {/* Sticky Footer for Actions - ONLY for Booking Step */}
      {step === 'booking' && (
        <div className='absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-[#0f1f1b]/80 backdrop-blur-md border-t border-gray-200 dark:border-white/10 lg:rounded-b-2xl z-50'>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-95 ${
              !canProceed
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-[#0a2c24] dark:bg-[#77b6a3] text-white dark:text-[#0a2c24] hover:shadow-xl'
            }`}
          >
            {noAvailableSlots ? 'Continue to Waitlist' : 'Continue'}
          </button>
        </div>
      )}

      {/* Service Picker Overlay */}
      {showServicePicker && (
        <div className='absolute inset-0 z-50 bg-[#f8faf9] dark:bg-[#0f1f1b] flex flex-col animate-in slide-in-from-bottom duration-300'>
          <div className='px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between'>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Select a Service</h3>
            <button
              onClick={() => setShowServicePicker(false)}
              className='p-2 bg-gray-100 dark:bg-white/10 rounded-full'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
          <div className='flex-1 overflow-y-auto p-5 space-y-3'>
            {branchFilteredServices.map(service => (
              <button
                key={service.id}
                onClick={() => handleAddService(service)}
                className='w-full p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-left hover:border-[#0a2c24] dark:hover:border-[#77b6a3] transition-all active:scale-[0.98]'
              >
                <div className='flex justify-between items-start'>
                  <div>
                    <h4 className='font-bold text-gray-900 dark:text-white'>{service.name}</h4>
                    <p className='text-sm text-gray-500 mt-1'>{service.duration} mins</p>
                  </div>
                  <span className='font-bold text-[#0a2c24] dark:text-[#77b6a3]'>
                    {currencySymbol}
                    {service.price}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )

  // Render based on platform (Mobile or Desktop)

  if (isMobile) {
    return createPortal(
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isClosing ? 'opacity-0' : mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={handleClose} />
        <div
          className={`absolute inset-x-0 bottom-0 h-[92vh] bg-[#f8faf9] dark:bg-[#0f1f1b] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out ${isClosing ? 'translate-y-full' : mounted ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className='w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-1 opacity-50' />
          {content}
        </div>
      </div>,
      document.body
    )
  }

  // Desktop Render (Modal Center)
  // Desktop Render (Modal Center)
  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={handleClose} />
      <div
        className={`relative w-full max-w-lg bg-[#f8faf9] dark:bg-[#0f1f1b] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-transform duration-300 ${isClosing ? 'scale-95' : mounted ? 'scale-100' : 'scale-95'}`}
      >
        {content}
      </div>
    </div>,
    document.body
  )
}

export default BookingModalV2Fixed
