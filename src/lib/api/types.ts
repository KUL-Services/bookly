// API Types based on api-spec.json

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
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
  isApproved?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  socialLinks?: SocialLink[]
  owner?: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
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
  businessId: string
  branchIds?: string[]
  branches?: Branch[]
  createdAt: string
  updatedAt: string
}

export interface Branch {
  id: string
  name: string
  address?: string
  mobile?: string
  businessId: string
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
}

export interface CreateStaffRequest {
  name: string
  mobile?: string
  branchIds?: string[]
}

export interface UpdateStaffRequest {
  id: string
  name: string
  mobile?: string
  branchIds?: string[]
}

export interface CreateBranchRequest {
  name: string
  address?: string
  mobile?: string
  serviceIds?: string[]
}

export interface UpdateBranchRequest {
  id: string
  name: string
  address?: string
  mobile?: string
  serviceIds?: string[]
}

export interface UpdateBusinessRequest {
  id: string
  name?: string
  email?: string
  description?: string
  socialLinks?: SocialLink[]
}

export interface ApproveBusinessRequest {
  id: string
}

export interface RejectBusinessRequest {
  id: string
}