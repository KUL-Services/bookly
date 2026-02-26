import { apiClient } from '../api-client'
import type {
  Schedule,
  CreateScheduleRequest,
  ScheduleBreak,
  CreateBreakRequest,
  ScheduleException,
  CreateExceptionRequest,
  UpdateExceptionRequest,
  ResourceAssignment,
  CreateAssignmentRequest,
  TimeOffEntry,
  CreateTimeOffRequest,
  UpdateTimeOffRequest,
  GetTimeOffParams,
  TimeReservationEntry,
  CreateTimeReservationRequest,
  UpdateTimeReservationRequest,
  GetTimeReservationParams,
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

  static async getExceptions(params?: { resourceId?: string; branchId?: string; includeBusinessWide?: boolean }) {
    const queryParams = new URLSearchParams()
    if (params?.resourceId) queryParams.append('resourceId', params.resourceId)
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    if (params?.includeBusinessWide) queryParams.append('includeBusinessWide', 'true')
    const url = queryParams.toString()
      ? `/admin/scheduling/exceptions?${queryParams.toString()}`
      : '/admin/scheduling/exceptions'
    return apiClient.get<ScheduleException[]>(url)
  }

  static async createException(data: CreateExceptionRequest) {
    return apiClient.post<ScheduleException>('/admin/scheduling/exceptions', data)
  }

  static async updateException(id: string, data: UpdateExceptionRequest) {
    return apiClient.patch<ScheduleException>(`/admin/scheduling/exceptions/${id}`, data)
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

  // --- Time Off ---

  static async getTimeOff(params?: GetTimeOffParams) {
    const queryParams = new URLSearchParams()
    if (params?.staffId) queryParams.append('staffId', params.staffId)
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params?.toDate) queryParams.append('toDate', params.toDate)
    const url = queryParams.toString()
      ? `/admin/scheduling/time-off?${queryParams.toString()}`
      : '/admin/scheduling/time-off'
    return apiClient.get<TimeOffEntry[]>(url)
  }

  static async createTimeOff(data: CreateTimeOffRequest) {
    return apiClient.post<TimeOffEntry>('/admin/scheduling/time-off', data)
  }

  static async updateTimeOff(id: string, data: UpdateTimeOffRequest) {
    return apiClient.patch<TimeOffEntry>(`/admin/scheduling/time-off/${id}`, data)
  }

  static async deleteTimeOff(id: string) {
    return apiClient.delete<TimeOffEntry>(`/admin/scheduling/time-off/${id}`)
  }

  // --- Reservations ---

  static async getReservations(params?: GetTimeReservationParams) {
    const queryParams = new URLSearchParams()
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params?.toDate) queryParams.append('toDate', params.toDate)
    const url = queryParams.toString()
      ? `/admin/scheduling/reservations?${queryParams.toString()}`
      : '/admin/scheduling/reservations'
    return apiClient.get<TimeReservationEntry[]>(url)
  }

  static async createReservation(data: CreateTimeReservationRequest) {
    return apiClient.post<TimeReservationEntry>('/admin/scheduling/reservations', data)
  }

  static async updateReservation(id: string, data: UpdateTimeReservationRequest) {
    return apiClient.patch<TimeReservationEntry>(`/admin/scheduling/reservations/${id}`, data)
  }

  static async deleteReservation(id: string) {
    return apiClient.delete<TimeReservationEntry>(`/admin/scheduling/reservations/${id}`)
  }
}
