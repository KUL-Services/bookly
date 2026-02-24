/**
 * Business Settings Store
 * Manages all business-level configuration settings
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SettingsService } from '@/lib/api/services/settings.service'
import { BusinessService } from '@/lib/api/services/business.service'
import type { BusinessSettings as ApiBusinessSettings } from '@/lib/api/types'

// Lazy import to avoid circular deps — accessed via .getState() outside React
let _getAuthState: (() => { materializeUser: any }) | null = null
const getAuthState = () => {
  if (!_getAuthState) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _getAuthState = require('@/stores/auth.store').useAuthStore.getState
  }
  return _getAuthState!()
}

// ============================================================================
// Types
// ============================================================================

export interface BusinessProfile {
  name: string
  description: string
  logo: string | null
  coverImage: string | null
  email: string
  phone: string
  website: string
  publicUrlSlug: string
  timezone: string
  language: string
}

export interface SocialLinks {
  facebook: string
  instagram: string
  twitter: string
  linkedin: string
  tiktok: string
  youtube: string
}

export interface CancellationPolicy {
  enabled: boolean
  hoursBeforeAppointment: number // 0 = no cancellation allowed
  refundPercentage: number // 0-100
}

export interface ReschedulePolicy {
  enabled: boolean
  hoursBeforeAppointment: number
}

export interface NoShowPolicy {
  chargeFee: boolean
  feePercentage: number
  restrictFutureBookings: boolean
  restrictionDays: number
}

export interface BookingPolicies {
  autoConfirmation: boolean
  cancellationPolicy: CancellationPolicy
  reschedulePolicy: ReschedulePolicy
  noShowPolicy: NoShowPolicy
  bookingLeadTime: number // minimum hours before booking
  maxAdvanceBooking: number // maximum days ahead
}

export type PaymentMethod = 'pay_on_arrival' | 'card' | 'instapay' | 'fawry'

export interface PaymentSettings {
  acceptedMethods: PaymentMethod[]
  depositRequired: boolean
  depositPercentage: number
  currency: string
  taxEnabled: boolean
  taxPercentage: number
  taxInclusive: boolean // tax included in price or added
}

export interface NotificationChannel {
  email: boolean
  sms: boolean
  push?: boolean
}

export interface CustomerReminders {
  enabled: boolean
  beforeHours: number[] // e.g., [1, 24] for 1hr and 24hr before
}

export interface DailyDigest {
  enabled: boolean
  time: string // "08:00"
  recipients: string[] // email addresses
}

export interface BusinessNotificationSettings {
  newBookingAlert: NotificationChannel
  cancellationAlert: Omit<NotificationChannel, 'push'>
  customerReminders: CustomerReminders
  staffNotifications: boolean
  dailyDigest: DailyDigest
}

// Note: Scheduling mode (static/dynamic) is now per staff/room, not global
export interface SchedulingSettings {
  bufferTimeBetweenBookings: number // minutes
  allowOverbooking: boolean
  overbookingPercentage: number
  defaultBookingDuration: number // minutes
  allowWalkIns: boolean
}

export interface CalendarDisplaySettings {
  defaultView: 'month' | 'week' | 'day'
  timeSlotDuration: 15 | 30 | 60
  startOfWeek: 'sunday' | 'monday'
  timeFormat: '12h' | '24h'
  colorScheme: 'vivid' | 'pastel'
  showWeekends: boolean
  workingHoursStart: string // "09:00"
  workingHoursEnd: string // "17:00"
}

export interface CustomerSettings {
  guestCheckout: boolean
  requireEmail: boolean
  requirePhone: boolean
  showCustomerNotesToStaff: boolean
}

export interface BrandingSettings {
  primaryColor: string
  welcomeMessage: string
  confirmationMessage: string
  bookingPageTheme: 'light' | 'dark' | 'auto'
}

// ============================================================================
// Default Values
// ============================================================================

const defaultBusinessProfile: BusinessProfile = {
  name: '',
  description: '',
  logo: null,
  coverImage: null,
  email: '',
  phone: '',
  website: '',
  publicUrlSlug: '',
  timezone: 'Africa/Cairo',
  language: 'en'
}

const defaultSocialLinks: SocialLinks = {
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  tiktok: '',
  youtube: ''
}

const defaultBookingPolicies: BookingPolicies = {
  autoConfirmation: true,
  cancellationPolicy: {
    enabled: true,
    hoursBeforeAppointment: 24,
    refundPercentage: 100
  },
  reschedulePolicy: {
    enabled: true,
    hoursBeforeAppointment: 24
  },
  noShowPolicy: {
    chargeFee: false,
    feePercentage: 0,
    restrictFutureBookings: false,
    restrictionDays: 30
  },
  bookingLeadTime: 2, // 2 hours minimum
  maxAdvanceBooking: 90 // 90 days ahead
}

const defaultPaymentSettings: PaymentSettings = {
  acceptedMethods: ['pay_on_arrival'],
  depositRequired: false,
  depositPercentage: 0,
  currency: 'EGP',
  taxEnabled: false,
  taxPercentage: 14,
  taxInclusive: true
}

const defaultNotificationSettings: BusinessNotificationSettings = {
  newBookingAlert: {
    email: true,
    sms: false,
    push: true
  },
  cancellationAlert: {
    email: true,
    sms: false
  },
  customerReminders: {
    enabled: true,
    beforeHours: [24, 1] // 24 hours and 1 hour before
  },
  staffNotifications: true,
  dailyDigest: {
    enabled: false,
    time: '08:00',
    recipients: []
  }
}

const defaultSchedulingSettings: SchedulingSettings = {
  bufferTimeBetweenBookings: 0,
  allowOverbooking: false,
  overbookingPercentage: 0,
  defaultBookingDuration: 60,
  allowWalkIns: true
}

const defaultCalendarSettings: CalendarDisplaySettings = {
  defaultView: 'week',
  timeSlotDuration: 30,
  startOfWeek: 'sunday',
  timeFormat: '12h',
  colorScheme: 'vivid',
  showWeekends: true,
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00'
}

const defaultCustomerSettings: CustomerSettings = {
  guestCheckout: true,
  requireEmail: true,
  requirePhone: false,
  showCustomerNotesToStaff: true
}

const defaultBrandingSettings: BrandingSettings = {
  primaryColor: '#1B5E4A',
  welcomeMessage: 'Welcome! Book your appointment with us.',
  confirmationMessage: 'Thank you for your booking! We look forward to seeing you.',
  bookingPageTheme: 'auto'
}

// ============================================================================
// Store Interface
// ============================================================================

interface BusinessSettingsState {
  // Settings data
  businessProfile: BusinessProfile
  socialLinks: SocialLinks
  bookingPolicies: BookingPolicies
  paymentSettings: PaymentSettings
  notificationSettings: BusinessNotificationSettings
  schedulingSettings: SchedulingSettings
  calendarSettings: CalendarDisplaySettings
  customerSettings: CustomerSettings
  brandingSettings: BrandingSettings

  // UI state
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
  hasUnsavedChanges: boolean
}

interface BusinessSettingsActions {
  // Update actions
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void
  updateSocialLinks: (links: Partial<SocialLinks>) => void
  updateBookingPolicies: (policies: Partial<BookingPolicies>) => void
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void
  updateNotificationSettings: (settings: Partial<BusinessNotificationSettings>) => void
  updateSchedulingSettings: (settings: Partial<SchedulingSettings>) => void
  updateCalendarSettings: (settings: Partial<CalendarDisplaySettings>) => void
  updateCustomerSettings: (settings: Partial<CustomerSettings>) => void
  updateBrandingSettings: (settings: Partial<BrandingSettings>) => void

  // Reset actions
  resetBusinessProfile: () => void
  resetSocialLinks: () => void
  resetBookingPolicies: () => void
  resetPaymentSettings: () => void
  resetNotificationSettings: () => void
  resetSchedulingSettings: () => void
  resetCalendarSettings: () => void
  resetCustomerSettings: () => void
  resetBrandingSettings: () => void
  resetAllSettings: () => void

  // Persistence
  saveSettings: () => Promise<void>
  loadSettings: () => Promise<void>

  // UI actions
  setError: (error: string | null) => void
  setSuccessMessage: (message: string | null) => void
  clearMessages: () => void
}

type BusinessSettingsStore = BusinessSettingsState & BusinessSettingsActions

// ============================================================================
// Store Implementation
// ============================================================================

export const useBusinessSettingsStore = create<BusinessSettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      businessProfile: defaultBusinessProfile,
      socialLinks: defaultSocialLinks,
      bookingPolicies: defaultBookingPolicies,
      paymentSettings: defaultPaymentSettings,
      notificationSettings: defaultNotificationSettings,
      schedulingSettings: defaultSchedulingSettings,
      calendarSettings: defaultCalendarSettings,
      customerSettings: defaultCustomerSettings,
      brandingSettings: defaultBrandingSettings,

      isLoading: false,
      isSaving: false,
      error: null,
      successMessage: null,
      hasUnsavedChanges: false,

      // Update actions
      updateBusinessProfile: profile =>
        set(state => ({
          businessProfile: { ...state.businessProfile, ...profile },
          hasUnsavedChanges: true
        })),

      updateSocialLinks: links =>
        set(state => ({
          socialLinks: { ...state.socialLinks, ...links },
          hasUnsavedChanges: true
        })),

      updateBookingPolicies: policies =>
        set(state => ({
          bookingPolicies: { ...state.bookingPolicies, ...policies },
          hasUnsavedChanges: true
        })),

      updatePaymentSettings: settings =>
        set(state => ({
          paymentSettings: { ...state.paymentSettings, ...settings },
          hasUnsavedChanges: true
        })),

      updateNotificationSettings: settings =>
        set(state => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
          hasUnsavedChanges: true
        })),

      updateSchedulingSettings: settings =>
        set(state => ({
          schedulingSettings: { ...state.schedulingSettings, ...settings },
          hasUnsavedChanges: true
        })),

      updateCalendarSettings: settings =>
        set(state => ({
          calendarSettings: { ...state.calendarSettings, ...settings },
          hasUnsavedChanges: true
        })),

      updateCustomerSettings: settings =>
        set(state => ({
          customerSettings: { ...state.customerSettings, ...settings },
          hasUnsavedChanges: true
        })),

      updateBrandingSettings: settings =>
        set(state => ({
          brandingSettings: { ...state.brandingSettings, ...settings },
          hasUnsavedChanges: true
        })),

      // Reset actions
      resetBusinessProfile: () => set({ businessProfile: defaultBusinessProfile, hasUnsavedChanges: true }),

      resetSocialLinks: () => set({ socialLinks: defaultSocialLinks, hasUnsavedChanges: true }),

      resetBookingPolicies: () => set({ bookingPolicies: defaultBookingPolicies, hasUnsavedChanges: true }),

      resetPaymentSettings: () => set({ paymentSettings: defaultPaymentSettings, hasUnsavedChanges: true }),

      resetNotificationSettings: () =>
        set({ notificationSettings: defaultNotificationSettings, hasUnsavedChanges: true }),

      resetSchedulingSettings: () => set({ schedulingSettings: defaultSchedulingSettings, hasUnsavedChanges: true }),

      resetCalendarSettings: () => set({ calendarSettings: defaultCalendarSettings, hasUnsavedChanges: true }),

      resetCustomerSettings: () => set({ customerSettings: defaultCustomerSettings, hasUnsavedChanges: true }),

      resetBrandingSettings: () => set({ brandingSettings: defaultBrandingSettings, hasUnsavedChanges: true }),

      resetAllSettings: () =>
        set({
          businessProfile: defaultBusinessProfile,
          socialLinks: defaultSocialLinks,
          bookingPolicies: defaultBookingPolicies,
          paymentSettings: defaultPaymentSettings,
          notificationSettings: defaultNotificationSettings,
          schedulingSettings: defaultSchedulingSettings,
          calendarSettings: defaultCalendarSettings,
          customerSettings: defaultCustomerSettings,
          brandingSettings: defaultBrandingSettings,
          hasUnsavedChanges: true
        }),

      // Maps store shape → API shapes for PATCH /admin/business + PATCH /admin/settings
      saveSettings: async () => {
        set({ isSaving: true, error: null })
        try {
          const state = get()
          const { bookingPolicies: bp, schedulingSettings: ss, businessProfile: profile, socialLinks } = state

          // --- PATCH /admin/business (profile data) ---
          const businessPayload = {
            name: profile.name,
            email: profile.email,
            description: profile.description,
            phone: profile.phone,
            website: profile.website,
            language: profile.language,
            timezone: profile.timezone,
            slug: profile.publicUrlSlug,
            logo: profile.logo,
            coverImage: profile.coverImage,
            socialLinks: [
              ...(socialLinks.facebook ? [{ platform: 'facebook', url: socialLinks.facebook }] : []),
              ...(socialLinks.instagram ? [{ platform: 'instagram', url: socialLinks.instagram }] : []),
              ...(socialLinks.twitter ? [{ platform: 'twitter', url: socialLinks.twitter }] : []),
              ...(socialLinks.linkedin ? [{ platform: 'linkedin', url: socialLinks.linkedin }] : []),
              ...(socialLinks.tiktok ? [{ platform: 'tiktok', url: socialLinks.tiktok }] : []),
              ...(socialLinks.youtube ? [{ platform: 'youtube', url: socialLinks.youtube }] : [])
            ]
          }

          const businessResult = await BusinessService.updateBusiness(businessPayload)
          if (businessResult.error) {
            throw new Error(businessResult.error)
          }

          // --- PATCH /admin/settings (booking/scheduling/calendar/customer/branding) ---
          const noShowPolicyEnum: 'NONE' | 'CHARGE_FEE' | 'RESTRICT' = bp.noShowPolicy.chargeFee ? 'CHARGE_FEE' : 'NONE'

          const settingsPayload: ApiBusinessSettings = {
            bookingPolicies: {
              bookingLeadTime: bp.bookingLeadTime,
              maxAdvanceBooking: bp.maxAdvanceBooking,
              autoConfirmation: bp.autoConfirmation,
              allowCancellation: bp.cancellationPolicy.enabled,
              cancellationDeadlineHours: bp.cancellationPolicy.hoursBeforeAppointment,
              allowReschedule: bp.reschedulePolicy.enabled,
              rescheduleDeadlineHours: bp.reschedulePolicy.hoursBeforeAppointment,
              noShowPolicy: noShowPolicyEnum
            },
            schedulingSettings: {
              defaultSlotDuration: ss.defaultBookingDuration,
              bufferTimeBetweenAppointments: ss.bufferTimeBetweenBookings,
              allowWalkIns: ss.allowWalkIns,
              allowOverbooking: ss.allowOverbooking,
              overbookingPercentage: ss.overbookingPercentage
            },
            customerSettings: state.customerSettings,
            calendarSettings: {
              defaultView: state.calendarSettings.defaultView,
              timeSlotDuration: state.calendarSettings.timeSlotDuration,
              startOfWeek: state.calendarSettings.startOfWeek,
              timeFormat: state.calendarSettings.timeFormat,
              colorScheme: state.calendarSettings.colorScheme,
              showWeekends: state.calendarSettings.showWeekends,
              workingHoursStart: state.calendarSettings.workingHoursStart,
              workingHoursEnd: state.calendarSettings.workingHoursEnd
            },
            brandingSettings: state.brandingSettings
          }

          const settingsResult = await SettingsService.updateSettings(settingsPayload)
          if (settingsResult.error) {
            throw new Error(settingsResult.error)
          }

          set({
            isSaving: false,
            hasUnsavedChanges: false,
            successMessage: 'Settings saved successfully!'
          })

          setTimeout(() => {
            set({ successMessage: null })
          }, 3000)
        } catch (error) {
          set({
            isSaving: false,
            error: error instanceof Error ? error.message : 'Failed to save settings'
          })
        }
      },

      // Maps API shape → store shape for GET /admin/settings + GET /business/:id
      loadSettings: async () => {
        set({ isLoading: true, error: null })
        try {
          // Hydrate business profile from auth state + business API
          const authState = getAuthState()
          const businessId = authState.materializeUser?.business?.id
          if (businessId) {
            const bizResult = await BusinessService.getBusiness(businessId)
            if (bizResult.data) {
              const biz = bizResult.data
              const socialMap: Record<string, string> = {}
              biz.socialLinks?.forEach(l => { socialMap[l.platform] = l.url })
              set(state => ({
                businessProfile: {
                  ...state.businessProfile,
                  name: biz.name ?? state.businessProfile.name,
                  email: biz.email ?? state.businessProfile.email,
                  description: biz.description ?? state.businessProfile.description,
                  logo: biz.logoUrl ?? biz.logo ?? state.businessProfile.logo,
                  coverImage: biz.coverImageUrl ?? state.businessProfile.coverImage
                },
                socialLinks: {
                  facebook: socialMap['facebook'] ?? state.socialLinks.facebook,
                  instagram: socialMap['instagram'] ?? state.socialLinks.instagram,
                  twitter: socialMap['twitter'] ?? state.socialLinks.twitter,
                  linkedin: socialMap['linkedin'] ?? state.socialLinks.linkedin,
                  tiktok: socialMap['tiktok'] ?? state.socialLinks.tiktok,
                  youtube: socialMap['youtube'] ?? state.socialLinks.youtube
                }
              }))
            }
          }

          const result = await SettingsService.getSettings()

          if (result.data) {
            const api = result.data as ApiBusinessSettings
            const current = get()

            const updates: Partial<BusinessSettingsState> = {}

            if (api.bookingPolicies) {
              const apiBp = api.bookingPolicies
              updates.bookingPolicies = {
                ...current.bookingPolicies,
                ...(apiBp.autoConfirmation !== undefined && { autoConfirmation: apiBp.autoConfirmation }),
                ...(apiBp.bookingLeadTime !== undefined && { bookingLeadTime: apiBp.bookingLeadTime }),
                ...(apiBp.maxAdvanceBooking !== undefined && { maxAdvanceBooking: apiBp.maxAdvanceBooking }),
                cancellationPolicy: {
                  ...current.bookingPolicies.cancellationPolicy,
                  ...(apiBp.allowCancellation !== undefined && { enabled: apiBp.allowCancellation }),
                  ...(apiBp.cancellationDeadlineHours !== undefined && { hoursBeforeAppointment: apiBp.cancellationDeadlineHours })
                },
                reschedulePolicy: {
                  ...current.bookingPolicies.reschedulePolicy,
                  ...(apiBp.allowReschedule !== undefined && { enabled: apiBp.allowReschedule }),
                  ...(apiBp.rescheduleDeadlineHours !== undefined && { hoursBeforeAppointment: apiBp.rescheduleDeadlineHours })
                },
                noShowPolicy: {
                  ...current.bookingPolicies.noShowPolicy,
                  ...(apiBp.noShowPolicy !== undefined && { chargeFee: apiBp.noShowPolicy === 'CHARGE_FEE' })
                }
              }
            }

            if (api.schedulingSettings) {
              const apiSs = api.schedulingSettings
              updates.schedulingSettings = {
                ...current.schedulingSettings,
                ...(apiSs.defaultSlotDuration !== undefined && { defaultBookingDuration: apiSs.defaultSlotDuration }),
                ...(apiSs.bufferTimeBetweenAppointments !== undefined && { bufferTimeBetweenBookings: apiSs.bufferTimeBetweenAppointments }),
                ...(apiSs.allowWalkIns !== undefined && { allowWalkIns: apiSs.allowWalkIns }),
                ...(apiSs.allowOverbooking !== undefined && { allowOverbooking: apiSs.allowOverbooking }),
                ...(apiSs.overbookingPercentage !== undefined && { overbookingPercentage: apiSs.overbookingPercentage })
              }
            }

            if (api.customerSettings) {
              updates.customerSettings = { ...current.customerSettings, ...api.customerSettings }
            }

            if (api.calendarSettings) {
              updates.calendarSettings = { ...current.calendarSettings, ...api.calendarSettings } as CalendarDisplaySettings
            }

            if (api.brandingSettings) {
              updates.brandingSettings = { ...current.brandingSettings, ...api.brandingSettings }
            }

            set({ ...updates, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.warn('Failed to load settings from API, using persisted local data:', error)
          set({ isLoading: false })
        }
      },

      // UI actions
      setError: error => set({ error }),
      setSuccessMessage: message => set({ successMessage: message }),
      clearMessages: () => set({ error: null, successMessage: null })
    }),
    {
      name: 'business-settings-storage',
      partialize: state => ({
        businessProfile: state.businessProfile,
        socialLinks: state.socialLinks,
        bookingPolicies: state.bookingPolicies,
        paymentSettings: state.paymentSettings,
        notificationSettings: state.notificationSettings,
        schedulingSettings: state.schedulingSettings,
        calendarSettings: state.calendarSettings,
        customerSettings: state.customerSettings,
        brandingSettings: state.brandingSettings
      })
    }
  )
)

// Export defaults for use in components
export {
  defaultBusinessProfile,
  defaultSocialLinks,
  defaultBookingPolicies,
  defaultPaymentSettings,
  defaultNotificationSettings,
  defaultSchedulingSettings,
  defaultCalendarSettings,
  defaultCustomerSettings,
  defaultBrandingSettings
}
