import type { BusinessRegistrationData } from './types'

const STORAGE_KEY = 'business-register-draft:v1'

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Invalid email format'
  return null
}

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain number'
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain special character'
  return null
}

// Phone validation
export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required'
  const phoneRegex = /^[0-9]{10,15}$/
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) return 'Invalid phone number'
  return null
}

// Postal code validation (basic patterns)
export const validatePostalCode = (postalCode: string, country: string): string | null => {
  if (!postalCode) return 'Postal code is required'

  // Basic patterns by country
  const patterns: Record<string, RegExp> = {
    'EG': /^\d{5}$/,
    'US': /^\d{5}(-\d{4})?$/,
    'UK': /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    'CA': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    'AU': /^\d{4}$/,
    'DE': /^\d{5}$/,
    'FR': /^\d{5}$/
  }

  const pattern = patterns[country]
  if (pattern && !pattern.test(postalCode)) {
    return `Invalid postal code format for ${country}`
  }
  return null
}

// Slug validation
export const validateSlug = (slug: string): string | null => {
  if (!slug) return 'URL slug is required'
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) return 'Slug can only contain lowercase letters, numbers, and hyphens'
  if (slug.startsWith('-') || slug.endsWith('-')) return 'Slug cannot start or end with a hyphen'
  if (slug.includes('--')) return 'Slug cannot contain consecutive hyphens'
  return null
}

// Generate slug from business name and city
export const generateSlug = (businessName: string, city: string): string => {
  const combined = `${businessName} ${city}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Check if at least one day is open
export const hasAtLeastOneOpenDay = (workingHours: BusinessRegistrationData['workingHours']): boolean => {
  return Object.values(workingHours).some(day => day.isOpen)
}

// LocalStorage persistence
export const saveDraft = (data: BusinessRegistrationData, lang: string): void => {
  if (typeof window === 'undefined') return
  try {
    const key = `${STORAGE_KEY}:${lang}`
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

export const loadDraft = (lang: string): BusinessRegistrationData | null => {
  if (typeof window === 'undefined') return null
  try {
    const key = `${STORAGE_KEY}:${lang}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

export const clearDraft = (lang: string): void => {
  if (typeof window === 'undefined') return
  try {
    const key = `${STORAGE_KEY}:${lang}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear draft:', error)
  }
}

// Default working hours
export const getDefaultWorkingHours = () => ({
  monday: { open: '09:00', close: '17:00', isOpen: true },
  tuesday: { open: '09:00', close: '17:00', isOpen: true },
  wednesday: { open: '09:00', close: '17:00', isOpen: true },
  thursday: { open: '09:00', close: '17:00', isOpen: true },
  friday: { open: '09:00', close: '17:00', isOpen: true },
  saturday: { open: '10:00', close: '14:00', isOpen: false },
  sunday: { open: '10:00', close: '14:00', isOpen: false }
})

// Initial form data
export const getInitialFormData = (): BusinessRegistrationData => ({
  // Account
  email: '',
  password: '',
  confirmPassword: '',
  ownerName: '',

  // Mobile Verification
  countryCode: '+20',
  phone: '',
  otp: '',

  // Business Basics
  businessName: '',
  businessType: '',
  staffCount: '',
  servicesOffered: [],

  // Scheduling Mode (user chooses)
  schedulingMode: '',

  // Location & Branches (ENHANCED)
  hasMultipleBranches: false,
  branches: [],
  // Legacy single-branch fields
  country: 'EG',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  mobileOnly: false,

  // Rooms (for static mode)
  rooms: [],

  // Business Profile
  publicUrlSlug: '',
  timezone: 'Africa/Cairo',
  workingHours: getDefaultWorkingHours(),
  acceptsOnlineBooking: true,

  // Staff
  staff: [],

  // Services
  services: [],

  // Initial Templates (for static mode)
  initialTemplates: [],

  // Legal
  acceptTerms: false,
  acceptPrivacy: false,
  marketingOptIn: false
})
