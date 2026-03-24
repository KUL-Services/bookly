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
  slug?: string
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
  bookingInterval?: number | null
  paddingTime?: number | null
  processingTime?: number | null
  parallelClients?: number | null
  clientSettings?: Record<string, any> | null
  taxRate?: '5' | '10' | '12' | '15' | '20' | 'custom'
  customTaxRate?: number | null
  depositPercentage?: number | null
  duration: number
  variants?: ServiceVariant[]
  maxConcurrent?: number | null
  businessId: string
  staffIds?: string[]
  roomIds?: string[]
  gallery?: string[]
  galleryUrls?: string[]
  business?: Business
  categories?: Category[]
  branches?: Branch[]
  reviews?: Review[]
  createdAt: string
  updatedAt: string
}

export interface Addon {
  id: string
  serviceId?: string
  name: string
  price?: number
  priceCents?: number
  description?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// Booking mode for resources (staff/assets)
export type BookingMode = 'STATIC' | 'DYNAMIC'

export interface BookingModeStatus {
  currentBookingMode?: BookingMode | string
  pendingBookingMode?: BookingMode | string | null
  bookingModeEffectiveDate?: string | null
  effectiveDate?: string | null
  estimatedEffectiveDate?: string | null
  latestBookingEnd?: string | null
  latestExistingBookingEnd?: string | null
  lastExistingBookingEnd?: string | null
  hasFutureBookings?: boolean
  canApplyImmediately?: boolean
}

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
  email?: string
  city?: string
  country?: string
  formattedAddress?: string
  placeId?: string
  timezone?: string
  workingHours?: Record<string, { open: string; close: string; isOpen: boolean }>
  isActive?: boolean
  staffIds?: string[]
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
    slug?: string
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

export interface ServiceVariant {
  name?: string
  duration: number
  price: number
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

export interface CompleteOnboardingRequest {
  businessProfile?: {
    name?: string
    slug?: string
    timezone?: string
    description?: string
    acceptsOnlineBooking?: boolean
    mobileOnly?: boolean
  }
  branches?: Array<{
    id?: string
    tempId?: string
    name: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    phone?: string
    timezone?: string
    isMainBranch?: boolean
    latitude?: number
    longitude?: number
    placeId?: string
    formattedAddress?: string
  }>
  workingHours?: Record<string, { open: string; close: string; isOpen: boolean }>
  staff?: Array<{
    id?: string
    tempId?: string
    name: string
    role?: string
    email?: string
    phone?: string
    color?: string
    branchRefs?: string[]
    branchIds?: string[]
    serviceRefs?: string[]
    serviceIds?: string[]
    bookingMode?: 'STATIC' | 'DYNAMIC'
    workingHours?: Record<string, { open: string; close: string; isOpen: boolean }>
  }>
  services?: Array<{
    id?: string
    tempId?: string
    name: string
    description?: string
    price: number
    duration: number
    color?: string
    branchRefs?: string[]
    branchIds?: string[]
    staffRefs?: string[]
    staffIds?: string[]
    roomRefs?: string[]
    roomIds?: string[]
    categoryRef?: string
    categoryId?: string
  }>
  rooms?: Array<{
    id?: string
    tempId?: string
    name: string
    branchRef?: string
    branchId?: string
    capacity?: number
    floor?: string
    amenities?: string[]
    serviceRefs?: string[]
    serviceIds?: string[]
  }>
  legal?: {
    acceptTerms?: boolean
    acceptPrivacy?: boolean
    marketingOptIn?: boolean
  }
}

export interface CompleteOnboardingResponse {
  businessId: string
  completedAt: string
  idempotencyReplay?: boolean
  mapping?: {
    branches?: Record<string, string>
    staff?: Record<string, string>
    services?: Record<string, string>
    rooms?: Record<string, string>
  }
  entities?: {
    branches?: any[]
    staff?: any[]
    services?: any[]
    rooms?: any[]
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
  bookingInterval?: number
  paddingTime?: number
  processingTime?: number
  parallelClients?: number
  clientSettings?: Record<string, any>
  taxRate?: '5' | '10' | '12' | '15' | '20' | 'custom'
  customTaxRate?: number
  depositPercentage?: number
  duration: number
  color?: string
  categoryIds?: string[]
  branchIds?: string[]
  variants?: ServiceVariant[]
  gallery?: string[]
}

export interface UpdateServiceRequest {
  id: string
  name?: string
  description?: string
  location?: string
  price?: number
  bookingInterval?: number
  paddingTime?: number
  processingTime?: number
  parallelClients?: number
  clientSettings?: Record<string, any>
  taxRate?: '5' | '10' | '12' | '15' | '20' | 'custom'
  customTaxRate?: number
  depositPercentage?: number
  duration?: number
  color?: string
  categoryIds?: string[]
  branchIds?: string[]
  variants?: ServiceVariant[]
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
  email?: string
  city?: string
  country?: string
  formattedAddress?: string
  placeId?: string
  timezone?: string
  workingHours?: Record<string, { open: string; close: string; isOpen: boolean }>
  isActive?: boolean
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
  email?: string
  city?: string
  country?: string
  formattedAddress?: string
  placeId?: string
  timezone?: string
  workingHours?: Record<string, { open: string; close: string; isOpen: boolean }>
  isActive?: boolean
  mobile?: string
  serviceIds?: string[]
  gallery?: string[]
  latitude?: number
  longitude?: number
}

export interface UpdateBranchStatusRequest {
  isActive: boolean
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
  resourceType?: 'STAFF' | 'ASSET'
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  appointmentStatus?: 'confirmed' | 'pending' | 'cancelled' | 'attended' | 'no_show' | 'need_confirm'
  notes?: string
  bookingReference?: string
  sessionId?: string
  partySize?: number
  paymentStatus?: string
  paymentStatusRaw?: string
  paymentMethod?: string
  paymentMethodRaw?: string
  paymentReference?: string
  instapayReference?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  staffId?: string
  staffName?: string
  roomId?: string
  roomName?: string
  matchedFields?: string[]
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
  addons?: Array<{
    id: string
    addonId: string
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  addonsTotal?: number
}

export interface BookingAddonSelection {
  addonId: string
  quantity: number
}

export interface CreateBookingRequest {
  serviceId: string
  branchId: string
  resourceId?: string
  staffId?: string
  roomId?: string
  sessionId?: string // NEW: Required for STATIC mode bookings
  startTime: string
  notes?: string
  addons?: BookingAddonSelection[]
}

export interface ValidateCouponRequest {
  code: string
  serviceId: string
}

export interface ValidateCouponResponse {
  valid: boolean
  discountPercent?: number
}

export interface GuestBookingRequest extends CreateBookingRequest {
  customerName: string
  customerEmail: string
  customerPhone: string
  addons?: BookingAddonSelection[]
}

export interface AdminCreateBookingRequest {
  serviceId: string
  branchId: string
  resourceId?: string
  staffId?: string
  roomId?: string
  sessionId?: string // NEW: Required for STATIC mode bookings
  startTime: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  status?: string
  notes?: string
  addons?: BookingAddonSelection[]
}

export interface RescheduleBookingRequest {
  startTime: string
  resourceId?: string
  staffId?: string
  roomId?: string
}

export type WaitlistStatus = 'ACTIVE' | 'NOTIFIED' | 'LEFT' | 'EXPIRED' | 'BOOKED'

export interface WaitlistEntry {
  id: string
  status: WaitlistStatus
  serviceId: string
  branchId: string
  slotStart: string
  slotEnd?: string | null
  resourceId?: string | null
  sessionId?: string | null
  userId?: string | null
  partySize?: number | null
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  notes?: string | null
  removedAt?: string | null
  leaveReason?: string | null
  createdAt: string
  updatedAt: string
  service?: Service
  branch?: Branch
  resource?: Staff | Asset | null
  session?: Session | null
}

export interface JoinWaitlistRequest {
  serviceId: string
  branchId: string
  slotStart: string
  slotEnd?: string
  resourceId?: string
  sessionId?: string
  userId?: string
  partySize?: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
}

export interface LeaveWaitlistRequest {
  entryId: string
  customerEmail?: string
  customerPhone?: string
  reason?: string
}

export interface NotifyWaitlistRequest {
  entryId?: string
  branchId?: string
  serviceId?: string
  slotStart?: string
  resourceId?: string
  sessionId?: string
  limit?: number
  message?: string
}

export interface WaitlistListParams {
  branchId?: string
  serviceId?: string
  resourceId?: string
  sessionId?: string
  date?: string
  slotStart?: string
  status?: 'active' | 'notified' | 'left' | 'expired' | 'booked'
  page?: number
  pageSize?: number
}

export interface WaitlistBySlotSummary {
  slotStart: string
  slotEnd?: string | null
  total: number
  activeCount: number
  notifiedCount: number
  leftCount: number
  expiredCount: number
  bookedCount: number
  entries: WaitlistEntry[]
}

export interface WaitlistListResponse {
  data: WaitlistEntry[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  bySlot?: WaitlistBySlotSummary[]
}

export interface NotifyWaitlistResponse {
  count: number
  data: WaitlistEntry[]
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
  scope?: 'RESOURCE' | 'BRANCH' | 'BUSINESS'
  precedence?: number
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

export interface UpdateExceptionRequest {
  date?: string
  startTime?: string | null
  endTime?: string | null
  reason?: string
  isAvailable?: boolean
  resourceId?: string | null
  branchId?: string | null
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

export type TimeOffApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface TimeOffEntry {
  id: string
  businessId?: string
  branchId?: string | null
  staffId: string
  startTime: string
  endTime: string
  allDay?: boolean
  reason?: string
  note?: string
  approvalStatus?: TimeOffApprovalStatus
  createdAt?: string
  updatedAt?: string
  staff?: {
    id: string
    name: string
    branchId?: string
  }
  branch?: {
    id: string
    name: string
  }
}

export interface CreateTimeOffRequest {
  staffId: string
  branchId?: string
  startTime: string
  endTime: string
  allDay?: boolean
  reason?: string
  note?: string
  approvalStatus?: TimeOffApprovalStatus
  rejectOverlaps?: boolean
}

export interface UpdateTimeOffRequest {
  staffId?: string
  branchId?: string
  startTime?: string
  endTime?: string
  allDay?: boolean
  reason?: string
  note?: string
  approvalStatus?: TimeOffApprovalStatus
  rejectOverlaps?: boolean
}

export interface GetTimeOffParams {
  staffId?: string
  branchId?: string
  fromDate?: string
  toDate?: string
}

export interface TimeReservationEntry {
  id: string
  businessId?: string
  branchId: string
  startTime: string
  endTime: string
  staffIds: string[]
  roomIds: string[]
  reason?: string
  note?: string
  rejectOverlaps?: boolean
  createdByAdminId?: string
  createdAt?: string
  updatedAt?: string
  branch?: {
    id: string
    name: string
  }
}

export interface CreateTimeReservationRequest {
  branchId: string
  startTime: string
  endTime: string
  staffIds?: string[]
  roomIds?: string[]
  reason?: string
  note?: string
  rejectOverlaps?: boolean
}

export interface UpdateTimeReservationRequest {
  branchId?: string
  startTime?: string
  endTime?: string
  staffIds?: string[]
  roomIds?: string[]
  reason?: string
  note?: string
  rejectOverlaps?: boolean
}

export interface GetTimeReservationParams {
  branchId?: string
  fromDate?: string
  toDate?: string
}

// Commission types
export interface Commission {
  id: string
  staffId?: string
  type?: 'PERCENTAGE' | 'FIXED'
  value?: number
  scope?: 'SERVICE' | 'PRODUCT' | 'GLOBAL'
  scopeId?: string
  // Legacy fields kept for backward compatibility with older payloads.
  serviceId?: string
  resourceId?: string
  percentage?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCommissionRequest {
  staffId: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  scope: 'SERVICE' | 'PRODUCT' | 'GLOBAL'
  scopeId?: string
}

export interface UpdateCommissionRequest extends CreateCommissionRequest {
  id: string
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

export type PushPlatform = 'web' | 'ios' | 'android'

export interface RegisterPushTokenRequest {
  token: string
  platform: PushPlatform
  deviceId?: string
  appVersion?: string
  locale?: string
}

export interface PushTokenRecord {
  id: string
  token: string
  platform: PushPlatform
  isActive: boolean
  lastSeenAt: string
}

export interface DeletePushTokenRequest {
  token: string
}

export interface DeletePushTokenResponse {
  success: boolean
}

// Admin bookings query params
export interface AdminBookingsParams {
  date?: string
  fromDate?: string
  toDate?: string
  branchId?: string
  staffId?: string
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Business Settings — matches PATCH/GET /admin/settings backend shape exactly
export interface ApiNoShowPolicySettings {
  restrictFutureBookings?: boolean
  restrictAfterCount?: number
  chargeFee?: boolean
  feePercentage?: number
  restrictionDays?: number
}

export interface ApiBookingPolicies {
  bookingLeadTime?: number // min hours before booking can be made
  maxAdvanceBooking?: number // max days in advance
  autoConfirmation?: boolean
  allowCancellation?: boolean
  cancellationDeadlineHours?: number // hours before appointment cancellation is allowed
  allowReschedule?: boolean
  rescheduleDeadlineHours?: number // hours before appointment reschedule is allowed
  noShowPolicy?: ApiNoShowPolicySettings | 'NONE' | 'CHARGE_FEE' | 'RESTRICT'
}

export interface ApiSchedulingSettings {
  defaultSlotDuration?: number // backwards-compatible alias
  defaultBookingDuration?: number
  bufferTimeBetweenAppointments?: number // backwards-compatible alias
  bufferTimeBetweenBookings?: number
  allowWalkIns?: boolean
  allowOverbooking?: boolean
  overbookingPercentage?: number
  overbookingType?: 'percentage' | 'fixed'
  overbookingFixedCount?: number
  enableWaitlist?: boolean
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
  weekendDays?: string[]
}

export interface ApiBrandingSettings {
  brandName?: string
  primaryColor?: string
  logo?: string
  welcomeMessage?: string
  confirmationMessage?: string
  bookingPageTheme?: 'light' | 'dark' | 'auto'
}

export interface ApiNotificationChannel {
  email?: boolean
  sms?: boolean
  push?: boolean
}

export interface ApiNotificationSettings {
  newBookingAlert?: ApiNotificationChannel
  cancellationAlert?: ApiNotificationChannel
  customerReminders?: {
    enabled?: boolean
    beforeHours?: number[]
  }
  staffNotifications?: boolean
  dailyDigest?: {
    enabled?: boolean
    time?: string
    recipients?: string[]
  }
}

export interface ApiPaymentSettings {
  // Canonical backend fields
  requireDeposit?: boolean
  depositPercentage?: number
  acceptedPaymentMethods?: string[]
  taxRate?: number
  taxInclusive?: boolean
  // Backward-compatible aliases that backend may still return
  depositRequired?: boolean
  acceptedMethods?: string[]
  taxPercentage?: number
  taxEnabled?: boolean
}

export interface BusinessSettings {
  bookingPolicies?: ApiBookingPolicies
  schedulingSettings?: ApiSchedulingSettings
  notificationSettings?: ApiNotificationSettings
  paymentSettings?: ApiPaymentSettings
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
