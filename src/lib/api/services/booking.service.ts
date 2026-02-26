import { apiClient } from '../api-client'
import type {
  Booking,
  CreateBookingRequest,
  AvailableSlotFlat,
  AvailabilitySlot,
  AdminBookingsParams,
  AdminCreateBookingRequest,
  GuestBookingRequest,
  RescheduleBookingRequest,
  Addon,
  ValidateCouponRequest,
  ValidateCouponResponse
} from '../types'

export class BookingService {
  // Get availability for a service at a branch on a given date
  // Returns enhanced slots with session info for STATIC mode resources
  static async getAvailability(params: { serviceId: string; branchId: string; date: string; resourceId?: string }) {
    const { serviceId, branchId, date, resourceId } = params
    const queryParams = new URLSearchParams({ serviceId, branchId, date })
    if (resourceId) queryParams.append('resourceId', resourceId)

    // API returns enhanced slots that may include session info for STATIC mode
    return apiClient.get<AvailabilitySlot[]>(`/bookings/availability?${queryParams.toString()}`)
  }

  // Legacy method for backward compatibility - returns flat format
  static async getAvailabilityFlat(params: { serviceId: string; branchId: string; date: string; resourceId?: string }) {
    const { serviceId, branchId, date, resourceId } = params
    const queryParams = new URLSearchParams({ serviceId, branchId, date })
    if (resourceId) queryParams.append('resourceId', resourceId)

    return apiClient.get<AvailableSlotFlat[]>(`/bookings/availability?${queryParams.toString()}`)
  }

  // Create a booking (requires auth)
  // For STATIC mode, include sessionId in the request
  static async createBooking(data: CreateBookingRequest) {
    return apiClient.post<Booking>('/bookings', data)
  }

  // Create a guest booking (no auth)
  static async createGuestBooking(data: GuestBookingRequest) {
    return apiClient.post<Booking>('/bookings', data)
  }

  // Get optional addons for a service (if backend supports them)
  static async getAddons(serviceId: string) {
    return apiClient.get<Addon[]>(`/services/${serviceId}/addons`)
  }

  // Validate a coupon code (if backend supports promotions)
  static async validateCoupon(data: ValidateCouponRequest) {
    return apiClient.post<ValidateCouponResponse>('/bookings/validate-coupon', data)
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
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    if (params?.staffId) queryParams.append('staffId', params.staffId)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
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
    return apiClient.patch<Booking>(`/admin/bookings/${bookingId}/reschedule`, data)
  }

  // Admin - Create a booking on behalf of a customer
  static async createAdminBooking(data: AdminCreateBookingRequest) {
    return apiClient.post<Booking>('/admin/bookings', data)
  }

  // Admin - Delete/cancel a booking
  static async deleteBooking(bookingId: string) {
    return apiClient.delete<{ message: string }>(`/admin/bookings/${bookingId}`)
  }
}
