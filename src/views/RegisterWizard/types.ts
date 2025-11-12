export interface Branch {
  id: string
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  timezone: string
  isMainBranch: boolean
  latitude?: number
  longitude?: number
  placeId?: string
  formattedAddress?: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  branchId: string
  floor?: string
  amenities?: string[]
}

export interface TimeSlot {
  start: string
  end: string
}

export interface WorkingHours {
  [day: string]: {
    isWorking: boolean
    shifts: TimeSlot[]
  }
}

export interface StaffMember {
  id: string
  name: string
  role: string
  isOwner?: boolean
  branchIds: string[]
  serviceIds?: string[]  // NEW: Services this staff can provide
  email?: string
  phone?: string
  color?: string
  workingHours?: WorkingHours
  specialization?: string[]
  // NEW: Staff management fields
  shiftOverrides?: any[]  // StaffShiftInstance[]
  breaks?: any[]  // BreakTemplate[]
  timeOffRequests?: any[]  // TimeOffRequest[]
  timeReservations?: any[]  // TimeReservation[]
}

export interface BasicTemplate {
  id: string
  name: string
  roomId: string
  instructorStaffId: string
  capacity: number
  duration: number
  description?: string
  weeklySchedule: {
    [day: string]: string[]
  }
}

export interface BusinessRegistrationData {
  // Step 1: Account
  email: string
  password: string
  confirmPassword: string
  ownerName: string

  // Step 2: Mobile Verification
  countryCode: string
  phone: string
  otp: string

  // Step 3: Business Basics
  businessName: string
  businessType: string
  staffCount: string
  servicesOffered: string[]

  // Step 3.5: Scheduling Mode (NEW)
  schedulingMode: 'static' | 'dynamic' | ''

  // Step 4: Location & Branches (ENHANCED)
  hasMultipleBranches: boolean
  branches: Branch[]
  // Legacy fields for single branch (backward compatibility)
  country: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  mobileOnly: boolean
  latitude?: number
  longitude?: number
  placeId?: string
  formattedAddress?: string

  // Step 4.5: Rooms Setup (NEW - for static mode)
  rooms: Room[]

  // Step 5: Business Profile
  publicUrlSlug: string
  timezone: string
  workingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean }
  }
  acceptsOnlineBooking: boolean

  // Step 6: Staff Management (ENHANCED)
  staff: StaffMember[]

  // Step 6.5: Initial Templates (NEW - for static mode)
  initialTemplates: BasicTemplate[]

  // Step 7: Legal
  acceptTerms: boolean
  acceptPrivacy: boolean
  marketingOptIn: boolean
}

export interface StepProps {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  isLastStep: boolean
  formData: BusinessRegistrationData
  updateFormData: (data: Partial<BusinessRegistrationData>) => void
  validationErrors: Record<string, string>
  setValidationErrors: (errors: Record<string, string>) => void
}

export interface StepConfig {
  icon: string
  title: string
  subtitle: string
  image?: string
}

export const BUSINESS_TYPES = [
  'Salon & Spa',
  'Barbershop',
  'Beauty',
  'Massage',
  'Fitness',
  'Wellness',
  'Pet Care',
  'Healthcare',
  'Education',
  'Other'
]

export const SCHEDULING_MODE_SUGGESTIONS: Record<string, 'static' | 'dynamic'> = {
  'Fitness': 'static',
  'Wellness': 'static',
  'Education': 'static',
  'Salon & Spa': 'dynamic',
  'Barbershop': 'dynamic',
  'Beauty': 'dynamic',
  'Massage': 'dynamic',
  'Pet Care': 'dynamic',
  'Healthcare': 'dynamic',
  'Other': 'dynamic'
}

export const STAFF_COUNTS = [
  'Just me',
  '2-5 staff',
  '6-10 staff',
  '10+ staff'
]

export const SERVICES_OPTIONS = [
  'Haircut',
  'Hair Coloring',
  'Styling',
  'Manicure',
  'Pedicure',
  'Facial',
  'Massage',
  'Waxing',
  'Makeup',
  'Barber Services',
  'Personal Training',
  'Yoga Classes',
  'Other'
]

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Africa/Cairo'
]

export const COUNTRY_CODES = [
  { code: '+20', country: 'EG' },
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'AU' },
  { code: '+86', country: 'CN' },
  { code: '+91', country: 'IN' },
  { code: '+33', country: 'FR' },
  { code: '+49', country: 'DE' },
  { code: '+81', country: 'JP' },
  { code: '+971', country: 'AE' }
]

export const ROOM_AMENITIES = [
  'Air Conditioning',
  'Heating',
  'Mirrors',
  'Sound System',
  'Projector',
  'Yoga Mats',
  'Weights',
  'Cardio Equipment',
  'Showers',
  'Lockers',
  'Water Fountain',
  'WiFi',
  'Parking',
  'Wheelchair Accessible'
]

export const CLASS_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
]
