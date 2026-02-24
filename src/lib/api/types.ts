// API Types based on actual tested API responses

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  mobile?: string
  verified?: boolean
  profilePhoto?: string | null
  profilePhotoUrl?: string | null
  profileComplete?: boolean
  createdAt: string
  updatedAt?: string
}

export interface Admin {
  id: string
  name: string
  email: string
  isVerified?: boolean
  isOwner?: boolean
  businessId: string
  createdAt: string
  updatedAt: string
  business?: Business
}

export interface Business {
  id: string
  name: string
  email?: string
  description?: string
  approved?: boolean
  logo?: string | null
  logoUrl?: string | null
  coverImageUrl?: string | null
  rating?: number
  socialLinks?: SocialLink[]
  services?: Service[]
  branches?: Branch[]
  reviews?: Review[]
  owner?: {
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface SocialLink {
  id?: string
  platform: string
  url: string
  businessId?: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description?: string
  location?: string
  price: number
  duration: number
  maxConcurrent?: number | null
  businessId: string
  gallery?: string[]
  galleryUrls?: string[]
  business?: Business
  categories?: Category[]
  branches?: Branch[]
  reviews?: Review[]
  createdAt: string
  updatedAt: string
}

// Booking mode for resources (staff/assets)
export type BookingMode = 'STATIC' | 'DYNAMIC'

export interface Resource {
  id: string
  name: string
  type: 'STAFF' | 'ASSET'
  bookingMode?: BookingMode // NEW: Determines if resource uses sessions or flexible booking
  maxConcurrent: number
  slotInterval: number
  slotDuration?: number | null
  mobile?: string | null
  email?: string | null
  profilePhoto?: string | null
  description?: string | null
  image?: string | null
  branchId: string
  services?: Service[]
  pendingBookingMode?: BookingMode
  bookingModeEffectiveDate?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  name: string
  description?: string

  // Recurrence (one OR the other, not both)
  date?: string // ISO date for one-time sessions
  dayOfWeek?: number // 0-6 for recurring sessions

  startTime: string // "14:00"
  endTime: string // "16:00"

  maxParticipants: number // Session capacity (e.g., 25 people for a class)
  resourceId: string // The venue/host (not consumed, just a reference)
  serviceId?: string
  price?: number
  isActive: boolean

  // Computed in responses
  currentParticipants?: number
  availableSpots?: number
}

export interface Staff {
  id: string
  name: string
  mobile?: string
  businessId?: string
  branchId: string
  bookingMode?: BookingMode // NEW: STATIC or DYNAMIC booking mode
  pendingBookingMode?: BookingMode
  bookingModeEffectiveDate?: string
  profilePhoto?: string | null
  profilePhotoUrl?: string | null
  services?: Service[]
  createdAt: string
  updatedAt: string
}

export interface Branch {
  id: string
  name: string
  address?: string
  mobile?: string
  businessId: string
  latitude?: number
  longitude?: number
  gallery?: string[]
  galleryUrls?: string[]
  services?: Service[]
  staff?: Staff[]
  resources?: Resource[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  rating: number
  comment?: string
  reply?: string | null
  flagged?: boolean
  flagReason?: string | null
  userId: string
  serviceId?: string
  businessId?: string
  user?: User
  service?: Service
  business?: {
    id: string
    name: string
    logo?: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface AssetFile {
  id: string
  fileName: string
  mimeType: string
  size: number
  uploadUrl: string
  createdAt: string
  updatedAt: string
}

export interface BusinessChangeRequest {
  id: string
  businessId: string
  name?: string
  email?: string
  description?: string
  socialLinks?: SocialLink[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

// Request/Response Types

// User login returns { accessToken, user }
export interface UserLoginResponse {
  accessToken: string
  user: User
}

// Admin login returns { accessToken, admin }
export interface AdminLoginResponse {
  accessToken: string
  user: Admin & { business?: Business }
}

// Generic login response (handles both camelCase and snake_case from API)
export interface LoginResponse {
  accessToken?: string
  access_token?: string
  user?: any
  admin?: any
}

export interface VerificationResponse {
  verificationToken: string
}

export interface CreateAssetRequest {
  fileName: string
  mimeType: string
  size: number
}

export interface CreateAssetResponse {
  assetFileId: string
  uploadUrl: string
}

export interface RegisterUserRequest {
  firstName: string
  lastName: string
  mobile?: string
  email: string
  password: string
}

export interface RegisterAdminRequest {
  name: string
  email: string
  password: string
}

export interface RegisterBusinessRequest {
  name: string
  email?: string
  description?: string
  socialLinks?: SocialLink[]
  owner: {
    name: string
    email: string
    password: string
  }
}

export interface VerifyAccountRequest {
  email: string
  code: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateCategoryRequest {
  name: string
}

export interface UpdateCategoryRequest {
  id: string
  name?: string
}

export interface CreateServiceRequest {
  name: string
  description?: string
  location: string
  price: number
  duration: number
  categoryIds?: string[]
  branchIds?: string[]
  gallery?: string[]
}

export interface UpdateServiceRequest {
  id: string
  name?: string
  description?: string
  location?: string
  price?: number
  duration?: number
  categoryIds?: string[]
  branchIds?: string[]
  gallery?: string[]
}

export interface CreateStaffRequest {
  name: string
  mobile?: string
  email?: string
  branchId: string
  serviceIds?: string[]
  profilePhoto?: string | null
  slotInterval?: number
  slotDuration?: number | null
  bookingMode?: BookingMode // NEW: STATIC or DYNAMIC
}

export interface UpdateStaffRequest {
  id: string
  name?: string
  mobile?: string
  email?: string
  branchId?: string
  serviceIds?: string[]
  profilePhoto?: string | null
  slotInterval?: number
  slotDuration?: number | null
  bookingMode?: BookingMode // NEW: STATIC or DYNAMIC
}

export interface CreateBranchRequest {
  name: string
  address?: string
  mobile?: string
  serviceIds?: string[]
  gallery?: string[]
  latitude?: number
  longitude?: number
}

export interface UpdateBranchRequest {
  id: string
  name: string
  address?: string
  mobile?: string
  serviceIds?: string[]
  gallery?: string[]
  latitude?: number
  longitude?: number
}

export interface UpdateBusinessRequest {
  id: string
  name?: string
  email?: string
  description?: string
  phone?: string
  website?: string
  language?: string
  timezone?: string
  slug?: string
  socialLinks?: SocialLink[]
  logo?: string | null
  coverImage?: string | null
}

export interface ApproveBusinessRequest {
  id: string
}

export interface RejectBusinessRequest {
  id: string
}

export interface UpdateUserRequest {
  firstName: string
  lastName: string
  mobile: string
  profilePhoto?: string | null
}

// Booking related types

export interface AvailableSlot {
  startTime: string
  endTime: string
}

export interface AvailabilityResponse {
  resourceId: string
  resourceName: string
  resourceType: 'STAFF' | 'ASSET'
  availableSlots: AvailableSlot[]
}

export interface Booking {
  id: string
  userId: string
  serviceId: string
  branchId: string
  resourceId?: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  notes?: string
  service?: {
    name: string
    duration: number
    price: number
    businessId: string
  }
  branch?: {
    name: string
    address: string
    businessId: string
  }
  resource?: {
    name: string
    type: 'STAFF' | 'ASSET'
  }
  user?: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
  // Policy fields returned per booking
  canCancel?: boolean
  cancellationDisabled?: boolean
  cancelDeadlineHours?: number
  cancelCutoffTime?: string
  canReschedule?: boolean
  rescheduleDeadlineHours?: number
  rescheduleCutoffTime?: string
}

export interface CreateBookingRequest {
  serviceId: string
  branchId: string
  resourceId?: string
  sessionId?: string // NEW: Required for STATIC mode bookings
  startTime: string
  notes?: string
}

export interface GuestBookingRequest extends CreateBookingRequest {
  customerName: string
  customerEmail: string
  customerPhone: string
}

export interface AdminCreateBookingRequest {
  serviceId: string
  branchId: string
  resourceId?: string
  staffId?: string
  sessionId?: string // NEW: Required for STATIC mode bookings
  startTime: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  status?: string
  notes?: string
}

export interface RescheduleBookingRequest {
  startTime: string
  resourceId?: string
}

// Availability - flat slot format (verified from actual API)
export interface AvailableSlotFlat {
  startTime: string
  endTime: string
  resourceId: string
}

// Asset (Room/Equipment) types
export type AssetSubType = 'ROOM' | 'EQUIPMENT'

export interface Asset {
  id: string
  name: string
  type: 'ASSET'
  subType?: AssetSubType // Distinguishes between ROOM and EQUIPMENT
  bookingMode?: BookingMode // NEW: STATIC or DYNAMIC booking mode
  pendingBookingMode?: BookingMode // Scheduled mode change
  bookingModeEffectiveDate?: string // When the mode change takes effect
  description?: string | null
  branchId: string
  maxConcurrent: number
  slotInterval: number
  slotDuration?: number | null
  image?: string | null
  mobile?: string | null
  email?: string | null
  serviceIds?: string[]
  services?: Service[]
  createdAt: string
  updatedAt: string
}

export interface CreateAssetResourceRequest {
  name: string
  description?: string
  branchId: string
  subType?: AssetSubType // 'ROOM' or 'EQUIPMENT'
  bookingMode?: BookingMode // NEW: STATIC or DYNAMIC
  maxConcurrent?: number
  serviceIds?: string[]
  image?: string
  slotInterval?: number
  slotDuration?: number | null
}

export interface UpdateAssetResourceRequest {
  id: string
  name?: string
  description?: string
  branchId?: string
  subType?: AssetSubType
  bookingMode?: BookingMode // NEW: STATIC or DYNAMIC
  maxConcurrent?: number
  serviceIds?: string[]
  image?: string
  slotInterval?: number
  slotDuration?: number | null
}

// Scheduling types
export interface Schedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  resourceId?: string
  branchId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateScheduleRequest {
  dayOfWeek: number
  startTime: string
  endTime: string
  resourceId?: string
  branchId?: string
}

export interface ScheduleBreak {
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  resourceId?: string
  branchId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBreakRequest {
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  resourceId?: string
  branchId?: string
}

export interface ScheduleException {
  id: string
  date: string
  startTime?: string | null
  endTime?: string | null
  reason?: string
  isAvailable: boolean
  resourceId?: string
  branchId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateExceptionRequest {
  date: string
  startTime?: string | null
  endTime?: string | null
  reason?: string
  isAvailable: boolean
  resourceId?: string
  branchId?: string
}

export interface ResourceAssignment {
  id: string
  staffId: string
  assetId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

export interface CreateAssignmentRequest {
  staffId: string
  assetId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

// Commission types
export interface Commission {
  id: string
  serviceId: string
  resourceId: string
  percentage: number
  createdAt: string
  updatedAt: string
}

export interface CreateCommissionRequest {
  serviceId: string
  resourceId: string
  percentage: number
}

// Review types
export interface CreateReviewRequest {
  businessId: string
  rating: number
  comment: string
  serviceId?: string
  bookingId?: string
}

export interface AdminReview extends Review {
  reply?: string | null
  flagged?: boolean
  flagReason?: string | null
}

// Notification types
export interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  updatedAt: string
}

// Admin bookings query params
export interface AdminBookingsParams {
  date?: string
  fromDate?: string
  toDate?: string
  staffId?: string
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Business Settings — matches PATCH/GET /admin/settings backend shape exactly
export interface ApiBookingPolicies {
  bookingLeadTime?: number // min hours before booking can be made
  maxAdvanceBooking?: number // max days in advance
  autoConfirmation?: boolean
  allowCancellation?: boolean
  cancellationDeadlineHours?: number // hours before appointment cancellation is allowed
  allowReschedule?: boolean
  rescheduleDeadlineHours?: number // hours before appointment reschedule is allowed
  noShowPolicy?: 'NONE' | 'CHARGE_FEE' | 'RESTRICT'
}

export interface ApiSchedulingSettings {
  defaultSlotDuration?: number // minutes
  bufferTimeBetweenAppointments?: number // minutes between appointments
  allowWalkIns?: boolean
  allowOverbooking?: boolean
  overbookingPercentage?: number
}

export interface ApiCustomerSettings {
  guestCheckout?: boolean
  requireEmail?: boolean
  requirePhone?: boolean
  showCustomerNotesToStaff?: boolean
}

export interface ApiCalendarSettings {
  defaultView?: 'week' | 'day' | 'month'
  timeSlotDuration?: number // 15 | 30 | 60
  startOfWeek?: 'monday' | 'sunday'
  timeFormat?: '12h' | '24h'
  colorScheme?: 'vivid' | 'pastel'
  showWeekends?: boolean
  workingHoursStart?: string // "HH:MM"
  workingHoursEnd?: string // "HH:MM"
}

export interface ApiBrandingSettings {
  primaryColor?: string
  welcomeMessage?: string
  confirmationMessage?: string
  bookingPageTheme?: 'light' | 'dark' | 'auto'
}

export interface BusinessSettings {
  bookingPolicies?: ApiBookingPolicies
  schedulingSettings?: ApiSchedulingSettings
  customerSettings?: ApiCustomerSettings
  calendarSettings?: ApiCalendarSettings
  brandingSettings?: ApiBrandingSettings
}

// Public booking settings (GET /business/:id/booking-settings)
export interface BusinessBookingSettings {
  autoConfirmation: boolean
  allowCancellation: boolean
  cancellationDeadlineHours: number
  allowReschedule: boolean
  rescheduleDeadlineHours: number
  bookingLeadTime: number
  maxAdvanceBooking: number
  guestCheckout: boolean
  requireEmail: boolean
  requirePhone: boolean
  bufferTimeBetweenAppointments: number
}

// ============================================================================
// Session Types (for STATIC booking mode)
// ============================================================================

export interface Session {
  id: string
  name: string
  description?: string

  // Recurrence - one OR the other, not both
  date?: string // ISO date for one-time sessions (e.g., "2026-03-15")
  dayOfWeek?: number // 0-6 for recurring sessions (0 = Sunday)

  startTime: string // "HH:MM" format (e.g., "14:00")
  endTime: string // "HH:MM" format (e.g., "16:00")

  maxParticipants: number
  resourceId: string
  serviceId?: string
  price?: number
  isActive: boolean

  // Computed in responses
  currentParticipants?: number
  availableSpots?: number

  createdAt: string
  updatedAt: string
}

export interface CreateSessionRequest {
  name: string
  description?: string
  date?: string // For one-time sessions
  dayOfWeek?: number // For recurring sessions (0-6)
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
  maxParticipants: number
  resourceId: string
  serviceId?: string
  price?: number
}

export interface UpdateSessionRequest {
  id: string
  name?: string
  description?: string
  date?: string
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  maxParticipants?: number
  serviceId?: string
  price?: number
  isActive?: boolean
}

// Enhanced availability slot - includes session info for STATIC mode
export interface AvailabilitySlot {
  startTime: string // ISO datetime
  endTime: string // ISO datetime
  resourceId: string
  resourceName: string
  resourceType: 'STAFF' | 'ASSET'

  // STATIC mode only (present when booking a session)
  sessionId?: string
  sessionName?: string
  maxParticipants?: number
  currentParticipants?: number
  availableSpots?: number
  price?: number
}

// Staff/Asset request types with bookingMode
export interface CreateStaffWithModeRequest extends CreateStaffRequest {
  bookingMode?: BookingMode
}

export interface UpdateStaffWithModeRequest extends UpdateStaffRequest {
  bookingMode?: BookingMode
}

export interface CreateAssetWithModeRequest extends CreateAssetResourceRequest {
  bookingMode?: BookingMode
}

export interface UpdateAssetWithModeRequest extends UpdateAssetResourceRequest {
  bookingMode?: BookingMode
}
