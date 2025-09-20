import { apiClient } from '../api-client'
import type {
  Business,
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
}

export class BusinessService {
  // Public - Get approved businesses with filtering and pagination
  static async getApprovedBusinesses(params?: BusinessQueryParams) {
    const queryParams = new URLSearchParams()

    if (params) {
      console.log('🔍 BusinessService - Raw params:', params)

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
      if (params.categoryId) {
        queryParams.append('categoryId', params.categoryId)
      }

      // Price parameters are always sent (required by API)
      if (params.priceFrom !== undefined) {
        queryParams.append('priceFrom', String(params.priceFrom))
        console.log(`✅ Added priceFrom: ${params.priceFrom}`)
      }
      if (params.priceTo !== undefined) {
        queryParams.append('priceTo', String(params.priceTo))
        console.log(`✅ Added priceTo: ${params.priceTo}`)
      }
    }

    const url = queryParams.toString() ? `/business?${queryParams.toString()}` : '/business'
    console.log('🌐 Final URL:', url)
    return apiClient.get<Business[]>(url)
  }

  // Public - Get specific business by ID
  static async getBusiness(id: string) {
    return apiClient.get<Business>(`/business/${id}`)
  }

  // Public - Register new business
  static async registerBusiness(data: RegisterBusinessRequest) {
    return apiClient.post<Business>('/business/register', data)
  }

  // Admin only - Submit business update request
  static async submitBusinessUpdateRequest(data: UpdateBusinessRequest) {
    return apiClient.patch<BusinessChangeRequest>('/business', data)
  }

  // Super Admin only - Get pending businesses
  static async getPendingBusinesses() {
    return apiClient.get<Business[]>('/business/pending')
  }

  // Super Admin only - Get pending change requests
  static async getPendingChangeRequests() {
    return apiClient.get<BusinessChangeRequest[]>('/business/pending-requests')
  }

  // Super Admin only - Approve business
  static async approveBusiness(data: ApproveBusinessRequest) {
    return apiClient.post<{ message: string }>('/business/approve', data)
  }

  // Super Admin only - Reject business
  static async rejectBusiness(data: RejectBusinessRequest) {
    return apiClient.post<{ message: string }>('/business/reject', data)
  }

  // Super Admin only - Approve business change request
  static async approveChangeRequest(data: { id: string }) {
    return apiClient.post<{ message: string }>('/business/approve-request', data)
  }

  // Super Admin only - Reject business change request
  static async rejectChangeRequest(data: { id: string }) {
    return apiClient.post<{ message: string }>('/business/reject-request', data)
  }
}