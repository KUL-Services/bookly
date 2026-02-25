import { apiClient } from '../api-client'
import type { CompleteOnboardingRequest, CompleteOnboardingResponse } from '../types'

export class OnboardingService {
  static async completeOnboarding(payload: CompleteOnboardingRequest, idempotencyKey?: string) {
    const headers: HeadersInit = {}

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    return apiClient.post<CompleteOnboardingResponse>('/admin/onboarding/complete', payload, {
      headers
    })
  }
}
