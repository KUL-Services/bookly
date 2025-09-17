import { apiClient } from '../api-client'
import type {
  Business,
  BusinessChangeRequest,
  RegisterBusinessRequest,
  UpdateBusinessRequest,
  ApproveBusinessRequest,
  RejectBusinessRequest,
} from '../types'

export class BusinessService {
  // Public - Get approved businesses
  static async getApprovedBusinesses() {
    return apiClient.get<Business[]>('/business')
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
    return apiClient.post<Business>('/business/approve', data)
  }

  // Super Admin only - Reject business
  static async rejectBusiness(data: RejectBusinessRequest) {
    return apiClient.post('/business/reject', data)
  }

  // Super Admin only - Approve business change request
  static async approveChangeRequest(data: { id: string }) {
    return apiClient.post<Business>('/business/approve-request', data)
  }

  // Super Admin only - Reject business change request
  static async rejectChangeRequest(data: { id: string }) {
    return apiClient.post('/business/reject-request', data)
  }
}