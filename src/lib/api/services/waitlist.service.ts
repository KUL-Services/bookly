import { apiClient } from '../api-client'
import type {
  JoinWaitlistRequest,
  LeaveWaitlistRequest,
  NotifyWaitlistRequest,
  NotifyWaitlistResponse,
  WaitlistEntry,
  WaitlistListParams,
  WaitlistListResponse
} from '../types'

export class WaitlistService {
  // Public/customer - Join waitlist
  static async join(data: JoinWaitlistRequest) {
    return apiClient.post<WaitlistEntry>('/waitlist/join', data)
  }

  // Public/customer - Leave waitlist
  static async leave(data: LeaveWaitlistRequest) {
    return apiClient.delete<WaitlistEntry>('/waitlist/leave', {
      body: JSON.stringify(data)
    })
  }

  // Admin - Notify waitlist
  static async notify(data: NotifyWaitlistRequest) {
    return apiClient.post<NotifyWaitlistResponse>('/waitlist/notify', data)
  }

  // Admin - List waitlist entries
  static async list(params?: WaitlistListParams) {
    const queryParams = new URLSearchParams()
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId)
    if (params?.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params?.sessionId) queryParams.append('sessionId', params.sessionId)
    if (params?.date) queryParams.append('date', params.date)
    if (params?.slotStart) queryParams.append('slotStart', params.slotStart)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const url = queryParams.toString() ? `/waitlist?${queryParams.toString()}` : '/waitlist'
    return apiClient.get<WaitlistListResponse>(url)
  }
}
