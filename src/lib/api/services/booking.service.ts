import { apiClient } from '../api-client'
import type {
  Booking,
  CreateBookingRequest,
  AvailableSlotFlat,
  AdminBookingsParams,
  AdminCreateBookingRequest,
  GuestBookingRequest,
  RescheduleBookingRequest
} from '../types'

export class BookingService {
  // Get availability for a service at a branch on a given date
  static async getAvailability(params: { serviceId: string; branchId: string; date: string; resourceId?: string }) {
    const { serviceId, branchId, date, resourceId } = params
    const queryParams = new URLSearchParams({ serviceId, branchId, date })
    if (resourceId) queryParams.append('resourceId', resourceId)

    // API returns flat array of { startTime, endTime, resourceId }
    return apiClient.get<AvailableSlotFlat[]>(`/bookings/availability?${queryParams.toString()}`)
  }

  // Create a booking (requires auth)
  static async createBooking(data: CreateBookingRequest) {
    return apiClient.post<Booking>('/bookings', data)
  }

  // Create a guest booking (no auth)
  static async createGuestBooking(data: GuestBookingRequest) {
    return apiClient.post<Booking>('/bookings', data)
  }

  // Reschedule a booking (User)
  static async rescheduleBooking(bookingId: string, data: RescheduleBookingRequest) {
    return apiClient.patch<Booking>(`/bookings/${bookingId}/reschedule`, data)
  }

  // Get user's bookings (requires auth)
  static async getUserBookings() {
    return apiClient.get<Booking[]>('/bookings')
  }

  // Cancel a booking (requires auth)
  static async cancelBooking(bookingId: string) {
    return apiClient.patch<Booking>(`/bookings/${bookingId}/cancel`)
  }

  // Admin - Get all bookings for the business
  static async getBusinessBookings(params?: AdminBookingsParams) {
    const queryParams = new URLSearchParams()
    if (params?.date) queryParams.append('date', params.date)
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params?.toDate) queryParams.append('toDate', params.toDate)
    if (params?.staffId) queryParams.append('staffId', params.staffId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = queryParams.toString() ? `/admin/bookings?${queryParams.toString()}` : '/admin/bookings'
    return apiClient.get<Booking[]>(url)
  }

  // Admin - Update booking status
  static async updateBookingStatus(bookingId: string, status: string) {
    return apiClient.patch<Booking>(`/admin/bookings/${bookingId}/status`, { status })
  }

  // Admin - Reschedule a booking
  static async adminRescheduleBooking(bookingId: string, data: RescheduleBookingRequest) {
    // Admin endpoint seems to be missing, trying standard endpoint with admin auth
    return apiClient.patch<Booking>(`/bookings/${bookingId}/reschedule`, data)
  }

  // Admin - Create a booking on behalf of a customer
  static async createAdminBooking(data: AdminCreateBookingRequest) {
    // Admin specific endpoint /admin/bookings returns 404
    // Using standard /bookings endpoint which should accept admin requests with proper auth
    return apiClient.post<Booking>('/bookings', data)
  }

  // Admin - Delete/cancel a booking
  static async deleteBooking(bookingId: string) {
    // Try standard delete if admin delete is missing
    return apiClient.delete<{ message: string }>(`/bookings/${bookingId}`)
  }
}
