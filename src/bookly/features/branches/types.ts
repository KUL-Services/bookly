// ============================================================================
// Branches Feature Types
// ============================================================================

export interface BranchService {
  id: string
  name: string
  price: number
  duration: number
}

export interface BranchStaffMember {
  id: string
  name: string
  title?: string
  color?: string
}

export interface BranchWorkingHours {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  isOpen: boolean
  openTime: string // HH:mm format
  closeTime: string // HH:mm format
}

export interface Branch {
  id: string
  name: string
  address: string
  city: string
  country: string
  mobile: string
  email?: string
  businessId: string

  // Associated data
  services: BranchService[]
  staff: BranchStaffMember[]
  galleryUrls: string[]
  workingHours: BranchWorkingHours[]

  // Status
  isActive: boolean
  isPrimary?: boolean

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface BranchFormData {
  name: string
  address: string
  city: string
  country: string
  mobile: string
  email: string
  serviceIds: string[]
  staffIds: string[]
  galleryUrls: string[]
  workingHours: BranchWorkingHours[]
  isActive: boolean
}

export const DEFAULT_WORKING_HOURS: BranchWorkingHours[] = [
  { day: 'Mon', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Tue', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Wed', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Thu', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Fri', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Sat', isOpen: true, openTime: '10:00', closeTime: '16:00' },
  { day: 'Sun', isOpen: false, openTime: '10:00', closeTime: '16:00' }
]

export const DEFAULT_BRANCH_FORM_DATA: BranchFormData = {
  name: '',
  address: '',
  city: '',
  country: '',
  mobile: '',
  email: '',
  serviceIds: [],
  staffIds: [],
  galleryUrls: [],
  workingHours: DEFAULT_WORKING_HOURS,
  isActive: true
}
