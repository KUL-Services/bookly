import { OnboardingService } from '@/lib/api/services/onboarding.service'
import type { CompleteOnboardingRequest } from '@/lib/api/types'
import type { BusinessRegistrationData, StaffMember } from './types'
import { loadDraft, clearDraft } from './utils'

const IDEMPOTENCY_KEY_PREFIX = 'business-onboarding-idempotency:v1'

const normalizeDay = (day: string): string => day.trim().toLowerCase()

const toStaffWorkingHours = (member: StaffMember): Record<string, { open: string; close: string; isOpen: boolean }> | undefined => {
  if (!member.workingHours) return undefined

  const dayMap: Record<string, string> = {
    sun: 'sunday',
    mon: 'monday',
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday'
  }

  const result: Record<string, { open: string; close: string; isOpen: boolean }> = {}

  Object.entries(member.workingHours).forEach(([key, value]) => {
    const normalized = normalizeDay(key)
    const day = dayMap[normalized] || normalized
    const firstShift = value?.shifts?.[0]

    result[day] = {
      open: firstShift?.start || '09:00',
      close: firstShift?.end || '17:00',
      isOpen: Boolean(value?.isWorking && firstShift)
    }
  })

  return Object.keys(result).length > 0 ? result : undefined
}

const buildFallbackSingleBranch = (formData: BusinessRegistrationData) => {
  if (formData.mobileOnly || !formData.addressLine1) return []

  return [
    {
      tempId: 'branch-1',
      name: formData.businessName ? `${formData.businessName} - Main Location` : 'Main Location',
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      postalCode: formData.postalCode || undefined,
      country: formData.country || undefined,
      timezone: formData.timezone || 'Africa/Cairo',
      isMainBranch: true,
      latitude: formData.latitude,
      longitude: formData.longitude,
      placeId: formData.placeId,
      formattedAddress: formData.formattedAddress
    }
  ]
}

export const buildOnboardingPayload = (formData: BusinessRegistrationData): CompleteOnboardingRequest => {
  const branches =
    formData.branches && formData.branches.length > 0
      ? formData.branches.map(branch => ({
          tempId: branch.id,
          name: branch.name,
          addressLine1: branch.addressLine1 || undefined,
          addressLine2: branch.addressLine2 || undefined,
          city: branch.city || undefined,
          state: branch.state || undefined,
          postalCode: branch.postalCode || undefined,
          country: branch.country || undefined,
          phone: branch.phone || undefined,
          timezone: branch.timezone || formData.timezone || 'Africa/Cairo',
          isMainBranch: branch.isMainBranch,
          latitude: branch.latitude,
          longitude: branch.longitude,
          placeId: branch.placeId,
          formattedAddress: branch.formattedAddress
        }))
      : buildFallbackSingleBranch(formData)

  const staffBookingMode = formData.schedulingMode === 'static' ? 'STATIC' : 'DYNAMIC'

  return {
    businessProfile: {
      slug: formData.publicUrlSlug || undefined,
      timezone: formData.timezone || 'Africa/Cairo',
      description: formData.businessType || undefined,
      acceptsOnlineBooking: formData.acceptsOnlineBooking,
      mobileOnly: formData.mobileOnly
    },
    branches,
    workingHours: formData.workingHours || undefined,
    staff: (formData.staff || []).map(member => ({
      tempId: member.id,
      name: member.name,
      role: member.role || undefined,
      email: member.email || undefined,
      phone: member.phone || undefined,
      color: member.color || undefined,
      branchRefs: member.branchIds || [],
      serviceRefs: member.serviceIds || [],
      bookingMode: staffBookingMode,
      workingHours: toStaffWorkingHours(member)
    })),
    services: (formData.services || []).map(service => ({
      tempId: service.id,
      name: service.name,
      description: service.description || undefined,
      price: Number(service.price) || 0,
      duration: Number(service.duration) || 0,
      color: service.color || undefined,
      branchRefs: service.branchIds || [],
      staffRefs: service.staffIds || [],
      roomRefs: service.roomIds || [],
      categoryRef: service.categoryId || undefined
    })),
    rooms: (formData.rooms || []).map(room => ({
      tempId: room.id,
      name: room.name,
      branchRef: room.branchId,
      capacity: room.capacity,
      floor: room.floor || undefined,
      amenities: room.amenities || [],
      serviceRefs: (formData.services || []).filter(service => service.roomIds?.includes(room.id)).map(service => service.id)
    })),
    legal: {
      acceptTerms: formData.acceptTerms,
      acceptPrivacy: formData.acceptPrivacy,
      marketingOptIn: formData.marketingOptIn
    }
  }
}

const getIdempotencyStorageKey = (locale: string, email: string) =>
  `${IDEMPOTENCY_KEY_PREFIX}:${locale}:${email.trim().toLowerCase()}`

const getOrCreateIdempotencyKey = (storageKey: string): string => {
  const existing = localStorage.getItem(storageKey)
  if (existing) return existing

  const key =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  localStorage.setItem(storageKey, key)
  return key
}

export const completePendingRegistrationOnLogin = async (locale: string, loginEmail: string): Promise<void> => {
  const draft = loadDraft(locale)

  if (!draft) {
    return
  }

  const normalizedLoginEmail = loginEmail.trim().toLowerCase()
  const normalizedDraftEmail = draft.email?.trim().toLowerCase()

  // Prevent applying old drafts for a different account.
  if (normalizedDraftEmail && normalizedDraftEmail !== normalizedLoginEmail) {
    return
  }

  const payload = buildOnboardingPayload(draft)
  const idempotencyStorageKey = getIdempotencyStorageKey(locale, normalizedLoginEmail)
  const idempotencyKey = getOrCreateIdempotencyKey(idempotencyStorageKey)
  const result = await OnboardingService.completeOnboarding(payload, idempotencyKey)

  if (result.error) {
    throw new Error(result.error)
  }

  clearDraft(locale)
  localStorage.removeItem(idempotencyStorageKey)
}
