// Services feature types

export interface ServiceCategory {
  id: string
  name: string
  color?: string
  order?: number
  createdAt?: string
  updatedAt?: string
}

export type PaddingTimeRule = 'none' | 'after' | 'before' | 'before_and_after'

export type TaxRate = 'tax_free' | '5' | '10' | '12' | '15' | '20'

export interface BookingInterval {
  hours: number
  minutes: number
}

export interface PaddingTime {
  rule: PaddingTimeRule
  minutes: number
}

export interface ProcessingTime {
  during: {
    hours: number
    minutes: number
  }
  after: {
    hours: number
    minutes: number
  }
}

export type ClientQuestionType = 'text' | 'textarea' | 'select' | 'checkbox'

export interface ClientQuestion {
  id: string
  question: string
  type: ClientQuestionType
  required: boolean
  options?: string[] // For select type
}

export interface ClientSettings {
  message: string // Message sent to client before appointment
  questions: ClientQuestion[]
}

export interface ExtendedService {
  id: string
  name: string
  description?: string
  price: number
  duration: number // in minutes
  categoryId?: string // Single category assignment
  color?: string
  businessId?: string

  // New booking fields
  bookingInterval?: BookingInterval
  paddingTime?: PaddingTime
  processingTime?: ProcessingTime
  taxRate?: TaxRate
  parallelClients?: number

  // Client settings
  clientSettings?: ClientSettings

  // Metadata
  createdAt?: string
  updatedAt?: string
}

// Form data types
export interface ServiceFormData {
  name: string
  description: string
  price: number | string
  duration: number | string
  categoryId: string
  color: string
  bookingInterval: BookingInterval
  paddingTime: PaddingTime
  processingTime: ProcessingTime
  taxRate: TaxRate
  parallelClients: number
  clientSettings: ClientSettings
}

// Constants
export const PADDING_RULE_OPTIONS: { value: PaddingTimeRule; label: string }[] = [
  { value: 'none', label: '-' },
  { value: 'after', label: 'After' },
  { value: 'before', label: 'Before' },
  { value: 'before_and_after', label: 'Before & after' }
]

export const TAX_RATE_OPTIONS: { value: TaxRate; label: string }[] = [
  { value: 'tax_free', label: 'Tax Free' },
  { value: '5', label: '5%' },
  { value: '10', label: '10%' },
  { value: '12', label: '12%' },
  { value: '15', label: '15%' },
  { value: '20', label: '20%' }
]

export const MINUTES_OPTIONS = [
  { value: 0, label: 'Not set' },
  { value: 5, label: '5min' },
  { value: 10, label: '10min' },
  { value: 15, label: '15min' },
  { value: 20, label: '20min' },
  { value: 30, label: '30min' },
  { value: 45, label: '45min' },
  { value: 60, label: '1h' }
]

export const HOURS_OPTIONS = Array.from({ length: 13 }, (_, i) => ({
  value: i,
  label: `${i}`
}))

export const INTERVAL_MINUTES_OPTIONS = [
  { value: 5, label: '5min' },
  { value: 10, label: '10min' },
  { value: 15, label: '15min' },
  { value: 20, label: '20min' },
  { value: 30, label: '30min' },
  { value: 45, label: '45min' },
  { value: 60, label: '1h' }
]

// Default values
export const DEFAULT_CLIENT_SETTINGS: ClientSettings = {
  message: '',
  questions: []
}

export const DEFAULT_SERVICE_FORM_DATA: ServiceFormData = {
  name: '',
  description: '',
  price: '',
  duration: '',
  categoryId: '',
  color: '#0a2c24',
  bookingInterval: { hours: 0, minutes: 15 },
  paddingTime: { rule: 'none', minutes: 0 },
  processingTime: {
    during: { hours: 0, minutes: 0 },
    after: { hours: 0, minutes: 0 }
  },
  taxRate: 'tax_free',
  parallelClients: 1,
  clientSettings: DEFAULT_CLIENT_SETTINGS
}

// Tooltips
export const TOOLTIPS = {
  bookingInterval: 'Define the time intervals for your bookings. Example: Setting a 15-minute booking interval will allow bookings at 9:00, 9:15, 9:30, and 9:45. A 30-minute interval will allow bookings at 9:00 and 9:30.',
  paddingTime: "Pad on extra time before or after your appointments to allow for cleaning, admin work, etc. Clients will not be able to book during these times. Applies to future bookings - existing appointments won't be impacted.",
  processingTimeDuring: 'Set processing time that occurs during the service (e.g., waiting for color to set).',
  processingTimeAfter: 'Set processing time that occurs after the service is completed.',
  taxRate: 'Customize your tax rate based on the regulations of your region/state.',
  parallelClients: 'Maximum number of clients that can be served at the same time for this service.'
}
