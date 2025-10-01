// API Types based on api-spec.json

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  verified: boolean
  profilePhoto?: string | null // UUID in requests
  profilePhotoUrl?: string | null // URL in responses
  profileComplete?: boolean
  createdAt: string
}

export interface Admin {
  id: string
  name: string
  email: string
  isVerified: boolean
  businessId: string
  createdAt: string
  updatedAt: string
}

export interface Business {
  id: string
  name: string
  email?: string
  description?: string
  approved?: boolean
  logo?: string | null // UUID in requests
  logoUrl?: string | null // URL in responses
  rating?: number
  socialLinks?: SocialLink[]
  services?: Service[] // Services offered by this business
  branches?: Branch[] // Branches of this business
  reviews?: Review[] // Reviews for this business
  owner?: {
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface SocialLink {
  platform: string
  url: string
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
  location: string
  price: number
  duration: number
  businessId: string
  gallery?: string[] // UUIDs in requests
  galleryUrls?: string[] // URLs in responses
  business?: Business
  categories?: Category[]
  branches?: Branch[]
  reviews?: Review[]
  createdAt: string
  updatedAt: string
}

export interface Staff {
  id: string
  name: string
  mobile?: string
  businessId?: string
  branchId: string
  profilePhoto?: string | null // UUID in requests
  profilePhotoUrl?: string | null // URL in responses
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
  gallery?: string[] // UUIDs in requests
  galleryUrls?: string[] // URLs in responses
  services?: Service[]
  staff?: Staff[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  rating: number
  comment?: string
  userId: string
  serviceId: string
  user?: User
  service?: Service
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
export interface LoginResponse {
  access_token: string
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
  mobile: string
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
  gallery?: string[] // Array of asset UUIDs
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
  gallery?: string[] // Array of asset UUIDs
}

export interface CreateStaffRequest {
  name: string
  mobile?: string
  branchId: string
  serviceIds?: string[] // Array of service UUIDs that staff can provide
  profilePhoto?: string | null // Asset UUID
}

export interface UpdateStaffRequest {
  id: string
  name: string
  mobile?: string
  branchId?: string
  serviceIds?: string[] // Array of service UUIDs that staff can provide
  profilePhoto?: string | null // Asset UUID
}

export interface CreateBranchRequest {
  name: string
  address?: string
  mobile?: string
  serviceIds?: string[]
  gallery?: string[] // Array of asset UUIDs
}

export interface UpdateBranchRequest {
  id: string
  name: string
  address?: string
  mobile?: string
  serviceIds?: string[]
  gallery?: string[] // Array of asset UUIDs
}

export interface UpdateBusinessRequest {
  id: string
  name?: string
  email?: string
  description?: string
  socialLinks?: SocialLink[]
  logo?: string | null // Asset UUID
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
  profilePhoto?: string | null // Asset UUID
}

// Booking related types
export interface Addon {
  id: string
  name: string
  priceCents: number
  maxQty?: number
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface AvailabilityResponse {
  slots: TimeSlot[]
}

export interface Booking {
  id: string
  serviceId: string
  providerId: string
  startsAtUtc: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  addons?: Array<{
    id: string
    quantity: number
  }>
  totalCents: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingRequest {
  serviceId: string
  providerId: string
  startsAtUtc: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  addons?: Array<{
    id: string
    quantity: number
  }>
  notes?: string
  couponCode?: string
}

export interface ValidateCouponRequest {
  code: string
  serviceId: string
}

export interface ValidateCouponResponse {
  valid: boolean
  discountPercent?: number
  discountAmount?: number
}

export interface MockPaymentRequest {
  bookingId: string
  amount: number
}

export interface MockPaymentResponse {
  success: boolean
  transactionId: string
}