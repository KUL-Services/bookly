import { apiClient } from '../api-client'
import type {
  Business,
  BusinessBookingSettings,
  BusinessChangeRequest,
  RegisterBusinessRequest,
  UpdateBusinessRequest,
  ApproveBusinessRequest,
  RejectBusinessRequest,
} from '../types'

interface BusinessQueryParams {
  name?: string
  page?: number
  pageSize?: number
  categoryId?: string
  priceFrom?: number
  priceTo?: number
  search?: string
}

export class BusinessService {
  // Public - Get approved businesses with filtering and pagination
  static async getApprovedBusinesses(params?: BusinessQueryParams) {
    const queryParams = new URLSearchParams()

    if (params) {
      // Handle each parameter explicitly to ensure proper validation
      if (params.page) {
        queryParams.append('page', String(params.page))
      }
      if (params.pageSize) {
        queryParams.append('pageSize', String(params.pageSize))
      }
      if (params.name) {
        queryParams.append('name', params.name)
      }
      if (params.search) {
        queryParams.append('search', params.search)
      }
      if (params.categoryId) {
        queryParams.append('categoryId', params.categoryId)
      }

      // Price parameters are always sent (required by API)
      if (params.priceFrom !== undefined) {
        queryParams.append('priceFrom', String(params.priceFrom))
      }
      if (params.priceTo !== undefined) {
        queryParams.append('priceTo', String(params.priceTo))
      }
    }

    const url = queryParams.toString() ? `/business?${queryParams.toString()}` : '/business'
    return apiClient.get<Business[]>(url)
  }

  // Public - Get specific business by ID
  static async getBusiness(id: string) {
    return apiClient.get<Business>(`/business/${id}`)
  }

  // Public - Get business by slug
  static async getBusinessBySlug(slug: string) {
    return apiClient.get<Business>(`/business/by-slug/${slug}`)
  }

  // Public - Get business details by slug first, then fallback to ID
  static async getBusinessBySlugOrId(identifier: string) {
    const bySlug = await this.getBusinessBySlug(identifier)
    if (bySlug.data) return bySlug

    const byId = await this.getBusiness(identifier)
    if (byId.data) return byId

    return bySlug.error ? bySlug : byId
  }

  // Public - Get booking settings enforced by the business (for booking page pre-flight)
  static async getBookingSettings(businessId: string) {
    return apiClient.get<BusinessBookingSettings>(`/business/${businessId}/booking-settings`)
  }

  // Public - Register new business
  static async registerBusiness(data: RegisterBusinessRequest) {
    return apiClient.post<Business>('/business/register', data)
  }

  // Admin only - Update business profile (business ID identified from authenticated user)
  static async updateBusiness(data: Omit<UpdateBusinessRequest, 'id'>) {
    return apiClient.patch<BusinessChangeRequest>('/admin/business', data)
  }

  // Super Admin only - Get pending businesses
  static async getPendingBusinesses() {
    return apiClient.get<Business[]>('/superadmin/business/pending')
  }

  // Super Admin only - Get pending change requests
  static async getPendingChangeRequests() {
    return apiClient.get<BusinessChangeRequest[]>('/superadmin/business/pending-requests')
  }

  // Super Admin only - Approve business
  static async approveBusiness(data: ApproveBusinessRequest) {
    return apiClient.post<{ message: string }>('/superadmin/business/approve', data)
  }

  // Super Admin only - Reject business
  static async rejectBusiness(data: RejectBusinessRequest) {
    return apiClient.post<{ message: string }>('/superadmin/business/reject', data)
  }

  // Super Admin only - Approve business change request
  static async approveChangeRequest(data: { id: string }) {
    return apiClient.post<{ message: string }>('/superadmin/business/approve-request', data)
  }

  // Super Admin only - Reject business change request
  static async rejectChangeRequest(data: { id: string }) {
    return apiClient.post<{ message: string }>('/superadmin/business/reject-request', data)
  }
}
