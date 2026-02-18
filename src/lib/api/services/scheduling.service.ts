import { apiClient } from '../api-client'
import type {
  Schedule,
  CreateScheduleRequest,
  ScheduleBreak,
  CreateBreakRequest,
  ScheduleException,
  CreateExceptionRequest,
  ResourceAssignment,
  CreateAssignmentRequest,
} from '../types'

export class SchedulingService {
  // --- Schedules ---

  static async getSchedules(params?: { resourceId?: string; branchId?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    const url = queryParams.toString()
      ? `/admin/scheduling/schedules?${queryParams.toString()}`
      : '/admin/scheduling/schedules'
    return apiClient.get<Schedule[]>(url)
  }

  static async createSchedule(data: CreateScheduleRequest) {
    return apiClient.post<Schedule>('/admin/scheduling/schedules', data)
  }

  static async deleteSchedule(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/scheduling/schedules/${id}`)
  }

  // --- Breaks ---

  static async getBreaks(params?: { resourceId?: string; branchId?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    const url = queryParams.toString()
      ? `/admin/scheduling/breaks?${queryParams.toString()}`
      : '/admin/scheduling/breaks'
    return apiClient.get<ScheduleBreak[]>(url)
  }

  static async createBreak(data: CreateBreakRequest) {
    return apiClient.post<ScheduleBreak>('/admin/scheduling/breaks', data)
  }

  static async deleteBreak(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/scheduling/breaks/${id}`)
  }

  // --- Exceptions ---

  static async getExceptions(params?: { resourceId?: string; branchId?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    const url = queryParams.toString()
      ? `/admin/scheduling/exceptions?${queryParams.toString()}`
      : '/admin/scheduling/exceptions'
    return apiClient.get<ScheduleException[]>(url)
  }

  static async createException(data: CreateExceptionRequest) {
    return apiClient.post<ScheduleException>('/admin/scheduling/exceptions', data)
  }

  static async deleteException(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/scheduling/exceptions/${id}`)
  }

  // --- Assignments (Staff ↔ Room) ---

  static async getAssignments(params?: { date?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.date) queryParams.append('date', params.date)
    const url = queryParams.toString()
      ? `/admin/scheduling/assignments?${queryParams.toString()}`
      : '/admin/scheduling/assignments'
    return apiClient.get<ResourceAssignment[]>(url)
  }

  static async createAssignment(data: CreateAssignmentRequest) {
    return apiClient.post<ResourceAssignment>('/admin/scheduling/assignments', data)
  }

  static async deleteAssignment(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/scheduling/assignments/${id}`)
  }
}
