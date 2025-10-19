export interface StaffMember {
  id: string
  name: string
  role: string
  isOwner?: boolean
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

  // Step 4: Location
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

  // Step 5: Business Profile
  publicUrlSlug: string
  timezone: string
  workingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean }
  }
  acceptsOnlineBooking: boolean

  // Step 6: Staff Management
  staff: StaffMember[]

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
