/**
 * API Integration Stubs for Business Registration
 *
 * These functions are placeholders for future integration with the backend API.
 * Replace the stub implementations with actual API calls when backend is ready.
 */

import type { BusinessRegistrationData } from './types'
import { BusinessService } from '@/lib/api'
import type { RegisterBusinessRequest } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Send OTP to phone number
 *
 * @param countryCode - Country code (e.g., '+1')
 * @param phone - Phone number without country code
 * @returns Promise that resolves when OTP is sent
 *
 * TODO: Integrate with backend OTP service
 * Expected endpoint: POST /api/auth/send-otp
 * Expected payload: { countryCode: string, phone: string }
 * Expected response: { success: boolean, message: string }
 */
export async function sendOtp(countryCode: string, phone: string): Promise<void> {
  console.log('📱 [STUB] Sending OTP to:', countryCode, phone)

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // TODO: Replace with actual API call
  // const response = await fetch('/api/auth/send-otp', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ countryCode, phone })
  // })
  // if (!response.ok) throw new Error('Failed to send OTP')

  console.log('✅ [STUB] OTP sent successfully')
}

/**
 * Verify OTP code
 *
 * @param countryCode - Country code (e.g., '+1')
 * @param phone - Phone number without country code
 * @param otp - 6-digit OTP code
 * @returns Promise that resolves when OTP is verified
 *
 * TODO: Integrate with backend OTP verification service
 * Expected endpoint: POST /api/auth/verify-otp
 * Expected payload: { countryCode: string, phone: string, otp: string }
 * Expected response: { success: boolean, verified: boolean }
 */
export async function verifyOtp(countryCode: string, phone: string, otp: string): Promise<void> {
  console.log('🔐 [STUB] Verifying OTP:', otp, 'for', countryCode, phone)

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // TODO: Replace with actual API call
  // const response = await fetch('/api/auth/verify-otp', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ countryCode, phone, otp })
  // })
  // const data = await response.json()
  // if (!data.verified) throw new Error('Invalid OTP code')

  console.log('✅ [STUB] OTP verified successfully')
}

/**
 * Check if URL slug is available
 *
 * @param slug - The desired URL slug
 * @returns Promise that resolves to true if available, false if taken
 *
 * TODO: Integrate with backend slug availability check
 * Expected endpoint: GET /api/business/check-slug?slug={slug}
 * Expected response: { available: boolean, slug: string }
 */
export async function checkSlugAvailable(slug: string): Promise<boolean> {
  console.log('🔍 [STUB] Checking slug availability:', slug)

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/business/check-slug?slug=${encodeURIComponent(slug)}`)
  // const data = await response.json()
  // return data.available

  // For demo: reject common/reserved slugs
  const reserved = ['test', 'admin', 'api', 'reserved', 'bookly', 'demo']
  const available = !reserved.includes(slug.toLowerCase())

  console.log(`${available ? '✅' : '❌'} [STUB] Slug ${slug} is ${available ? 'available' : 'taken'}`)
  return available
}

/**
 * Sign up a new business
 *
 * @param payload - Complete business registration data
 * @returns Promise that resolves when registration is complete
 *
 * TODO: Wire to actual BusinessService.registerBusiness and auth store
 * This should:
 * 1. Create the business account
 * 2. Store auth token in auth store
 * 3. Update user session
 */
export async function signUpBusiness(payload: BusinessRegistrationData): Promise<void> {
  console.log('🚀 [STUB] Signing up business with payload:', payload)

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // TODO: Replace with actual API integration
  // Transform wizard data to API format
  // const businessData: RegisterBusinessRequest = {
  //   name: payload.businessName,
  //   email: payload.email,
  //   description: `${payload.businessType} business offering ${payload.servicesOffered.join(', ')}`,
  //   owner: {
  //     name: payload.businessName, // Or collect owner name separately
  //     email: payload.email,
  //     password: payload.password,
  //     phone: `${payload.countryCode}${payload.phone}`
  //   },
  //   location: payload.mobileOnly ? undefined : {
  //     address: payload.addressLine1,
  //     city: payload.city,
  //     state: payload.state,
  //     postalCode: payload.postalCode,
  //     country: payload.country
  //   },
  //   publicUrlSlug: payload.publicUrlSlug,
  //   timezone: payload.timezone,
  //   workingHours: payload.workingHours,
  //   acceptsOnlineBooking: payload.acceptsOnlineBooking
  // }

  // const response = await BusinessService.registerBusiness(businessData)

  // if (response.error) {
  //   throw new Error(response.error)
  // }

  // // Update auth store if login token is returned
  // if (response.data?.token) {
  //   const authStore = useAuthStore.getState()
  //   authStore.setMaterializeUser({
  //     id: response.data.id,
  //     email: payload.email,
  //     name: payload.businessName,
  //     isOwner: true,
  //     business: response.data
  //   })
  // }

  console.log('✅ [STUB] Business registration successful')
}

/**
 * Export all stub functions for easy import
 */
export const BusinessRegistrationAPI = {
  sendOtp,
  verifyOtp,
  checkSlugAvailable,
  signUpBusiness
}
