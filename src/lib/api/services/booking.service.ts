import { apiClient } from '../api-client'
import type {
  Booking,
  CreateBookingRequest,
  AvailabilityResponse,
  Addon,
  ValidateCouponRequest,
  ValidateCouponResponse,
  MockPaymentRequest,
  MockPaymentResponse
} from '../types'

export class BookingService {
  // Get availability for a specific provider/service on a date
  static async getAvailability(params: { providerId: string; serviceId: string; date: string }) {
    const { providerId, serviceId, date } = params
    return apiClient.get<AvailabilityResponse>(
      `/availability?providerId=${providerId}&serviceId=${serviceId}&date=${date}`
    )
  }

  // Get available addons for a service
  static async getAddons(serviceId: string) {
    return apiClient.get<Addon[]>(`/addons?serviceId=${serviceId}`)
  }

  // Validate coupon code
  static async validateCoupon(data: ValidateCouponRequest) {
    return apiClient.post<ValidateCouponResponse>('/coupons/validate', data)
  }

  // Create booking
  static async createBooking(data: CreateBookingRequest) {
    return apiClient.post<Booking>('/bookings', data)
  }

  // Mock payment
  static async mockPayment(data: MockPaymentRequest) {
    return apiClient.post<MockPaymentResponse>('/payments/mock', data)
  }
}
