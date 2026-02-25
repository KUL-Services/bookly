import { apiClient } from '../api-client'
import type { Session, CreateSessionRequest, UpdateSessionRequest } from '../types'

/**
 * Sessions Service
 *
 * Manages pre-defined sessions for STATIC booking mode resources.
 * Sessions are recurring (dayOfWeek) or one-time (date) time slots that clients
 * can join, like fitness classes, group sessions, or consultation slots.
 */
export class SessionsService {
  // Admin - Get all sessions (optionally filter by resource)
  static async getSessions(params?: { resourceId?: string; serviceId?: string; branchId?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId)
    if (params?.branchId) queryParams.append('branchId', params.branchId)

    const url = queryParams.toString() ? `/admin/sessions?${queryParams.toString()}` : '/admin/sessions'
    return apiClient.get<Session[]>(url)
  }

  // Admin - Get a specific session by ID
  static async getSession(id: string) {
    return apiClient.get<Session>(`/admin/sessions/${id}`)
  }

  // Admin - Create a new session
  static async createSession(data: CreateSessionRequest) {
    return apiClient.post<Session>('/admin/sessions', data)
  }

  // Admin - Update an existing session
  static async updateSession(id: string, data: Partial<UpdateSessionRequest>) {
    return apiClient.patch<Session>(`/admin/sessions/${id}`, data)
  }

  // Admin - Delete a session
  static async deleteSession(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/sessions/${id}`)
  }

  // Admin - Get sessions for a specific date (considers recurring and one-time)
  static async getSessionsForDate(params: { date: string; resourceId?: string; branchId?: string }) {
    const queryParams = new URLSearchParams({ date: params.date })
    if (params.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params.branchId) queryParams.append('branchId', params.branchId)

    return apiClient.get<Session[]>(`/admin/sessions/by-date?${queryParams.toString()}`)
  }

  // Admin - Get sessions for a specific date with authoritative stats
  static async getSessionsForDateWithStats(params: { date: string; resourceId?: string; branchId?: string }) {
    const queryParams = new URLSearchParams({ date: params.date })
    if (params.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params.branchId) queryParams.append('branchId', params.branchId)

    return apiClient.get<Session[]>(`/admin/sessions/by-date-with-stats?${queryParams.toString()}`)
  }

  // Admin - Get participants for a session on a specific date
  static async getSessionParticipants(sessionId: string, date: string) {
    return apiClient.get<any[]>(`/admin/sessions/${sessionId}/participants?date=${date}`)
  }
}
