import type { ServiceCategory, ExtendedService } from './types'

// Mock categories
export const mockCategories: ServiceCategory[] = [
  { id: 'cat-1', name: 'Siloute', color: '#0a2c24', order: 1 },
  { id: 'cat-2', name: 'Hair', color: '#202c39', order: 2 },
  { id: 'cat-3', name: 'Nails', color: '#51b4b7', order: 3 },
  { id: 'cat-4', name: 'Face', color: '#9b59b6', order: 4 },
  { id: 'cat-5', name: 'Body', color: '#e74c3c', order: 5 },
  { id: 'cat-6', name: 'Fitness', color: '#3498db', order: 6 }
]

// Mock services with extended properties
export const mockExtendedServices: ExtendedService[] = [
  {
    id: 'svc-1',
    name: 'Pedicure',
    description: 'Professional pedicure treatment with nail care and polish',
    price: 35,
    duration: 60,
    categoryId: undefined, // Not categorized
    color: '#e74c3c',
    bookingInterval: { hours: 0, minutes: 15 },
    paddingTime: { rule: 'none', minutes: 0 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 0 } },
    taxRate: 'tax_free',
    parallelClients: 1
  },
  {
    id: 'svc-2',
    name: 'Acrylic Nails',
    description: 'Full set of acrylic nails with your choice of shape and design',
    price: 35,
    duration: 105, // 1h 45min
    categoryId: undefined, // Not categorized
    color: '#3498db',
    bookingInterval: { hours: 0, minutes: 30 },
    paddingTime: { rule: 'after', minutes: 15 },
    processingTime: { during: { hours: 0, minutes: 30 }, after: { hours: 0, minutes: 0 } },
    taxRate: '10',
    parallelClients: 1
  },
  {
    id: 'svc-3',
    name: 'Manicure',
    description: 'Classic manicure with nail shaping, cuticle care and polish',
    price: 20,
    duration: 40,
    categoryId: undefined, // Not categorized
    color: '#9b59b6',
    bookingInterval: { hours: 0, minutes: 15 },
    paddingTime: { rule: 'none', minutes: 0 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 0 } },
    taxRate: 'tax_free',
    parallelClients: 2
  },
  {
    id: 'svc-4',
    name: 'Haircut & Style',
    description: 'Professional cut and styling',
    price: 65,
    duration: 60,
    categoryId: 'cat-1', // Siloute
    color: '#0a2c24',
    bookingInterval: { hours: 0, minutes: 15 },
    paddingTime: { rule: 'after', minutes: 10 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 5 } },
    taxRate: '5',
    parallelClients: 1
  },
  {
    id: 'svc-5',
    name: 'Color Treatment',
    description: 'Full color service with premium products',
    price: 120,
    duration: 120,
    categoryId: 'cat-1', // Siloute
    color: '#202c39',
    bookingInterval: { hours: 0, minutes: 30 },
    paddingTime: { rule: 'before_and_after', minutes: 15 },
    processingTime: { during: { hours: 0, minutes: 45 }, after: { hours: 0, minutes: 10 } },
    taxRate: '10',
    parallelClients: 1
  },
  {
    id: 'svc-6',
    name: 'Highlights',
    description: 'Partial highlights with balayage technique',
    price: 85,
    duration: 90,
    categoryId: 'cat-1', // Siloute
    color: '#51b4b7',
    bookingInterval: { hours: 0, minutes: 30 },
    paddingTime: { rule: 'after', minutes: 10 },
    processingTime: { during: { hours: 0, minutes: 30 }, after: { hours: 0, minutes: 0 } },
    taxRate: '10',
    parallelClients: 1
  },
  {
    id: 'svc-7',
    name: 'Facial Treatment',
    description: 'Deep cleansing facial with hydration',
    price: 75,
    duration: 60,
    categoryId: 'cat-4', // Face
    color: '#f39c12',
    bookingInterval: { hours: 0, minutes: 15 },
    paddingTime: { rule: 'before', minutes: 5 },
    processingTime: { during: { hours: 0, minutes: 15 }, after: { hours: 0, minutes: 0 } },
    taxRate: 'tax_free',
    parallelClients: 1
  },
  {
    id: 'svc-8',
    name: 'Swedish Massage',
    description: 'Relaxing full body massage',
    price: 90,
    duration: 60,
    categoryId: 'cat-5', // Body
    color: '#27ae60',
    bookingInterval: { hours: 1, minutes: 0 },
    paddingTime: { rule: 'before_and_after', minutes: 10 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 5 } },
    taxRate: '5',
    parallelClients: 1
  },
  // Fitness Services
  {
    id: 'svc-9',
    name: 'Morning Yoga Class',
    description: 'Energizing morning yoga session for all levels',
    price: 25,
    duration: 60,
    categoryId: 'cat-6', // Fitness
    color: '#9b59b6', // Purple - Yoga
    bookingInterval: { hours: 0, minutes: 30 },
    paddingTime: { rule: 'after', minutes: 5 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 0 } },
    taxRate: 'tax_free',
    parallelClients: 20
  },
  {
    id: 'svc-10',
    name: 'Pilates Class',
    description: 'Core strengthening pilates workout',
    price: 30,
    duration: 60,
    categoryId: 'cat-6', // Fitness
    color: '#3498db', // Blue - Pilates
    bookingInterval: { hours: 0, minutes: 30 },
    paddingTime: { rule: 'after', minutes: 5 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 0 } },
    taxRate: 'tax_free',
    parallelClients: 15
  },
  {
    id: 'svc-11',
    name: 'HIIT Training',
    description: 'High intensity interval training',
    price: 35,
    duration: 45,
    categoryId: 'cat-6', // Fitness
    color: '#e74c3c', // Red - HIIT
    bookingInterval: { hours: 0, minutes: 15 },
    paddingTime: { rule: 'after', minutes: 10 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 0 } },
    taxRate: 'tax_free',
    parallelClients: 12
  },
  {
    id: 'svc-12',
    name: 'Personal Training',
    description: 'One-on-one personal training session',
    price: 75,
    duration: 60,
    categoryId: 'cat-6', // Fitness
    color: '#f39c12', // Orange - Personal Training
    bookingInterval: { hours: 0, minutes: 30 },
    paddingTime: { rule: 'before_and_after', minutes: 5 },
    processingTime: { during: { hours: 0, minutes: 0 }, after: { hours: 0, minutes: 0 } },
    taxRate: '10',
    parallelClients: 1
  }
]

// Service colors palette for new services
export const SERVICE_COLORS = [
  '#0a2c24', // Dark Green
  '#202c39', // Navy Blue
  '#51b4b7', // Teal
  '#e74c3c', // Red
  '#3498db', // Blue
  '#9b59b6', // Purple
  '#f39c12', // Orange
  '#27ae60', // Green
  '#1abc9c', // Turquoise
  '#e91e63', // Pink
  '#795548', // Brown
  '#607d8b'  // Blue Grey
]
