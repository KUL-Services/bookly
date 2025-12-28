import type { Branch, BranchWorkingHours } from './types'

// ============================================================================
// Mock Branch Data
// ============================================================================

const defaultWorkingHours: BranchWorkingHours[] = [
  { day: 'Mon', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Tue', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Wed', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Thu', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Fri', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Sat', isOpen: true, openTime: '10:00', closeTime: '16:00' },
  { day: 'Sun', isOpen: false, openTime: '10:00', closeTime: '16:00' }
]

export const mockBranchesData: Branch[] = [
  {
    id: 'branch-1',
    name: 'Downtown Salon',
    address: '123 Main Street, Suite 100',
    city: 'New York',
    country: 'United States',
    mobile: '+1 (555) 123-4567',
    email: 'downtown@bookly.com',
    businessId: 'business-1',
    services: [
      { id: 'svc-1', name: 'Haircut', price: 35, duration: 45 },
      { id: 'svc-2', name: 'Hair Coloring', price: 85, duration: 120 },
      { id: 'svc-3', name: 'Beard Trim', price: 15, duration: 20 },
      { id: 'svc-4', name: 'Hair Wash & Style', price: 25, duration: 30 }
    ],
    staff: [
      { id: 'staff-1', name: 'Maria Rodriguez', title: 'Senior Stylist', color: '#9C27B0' },
      { id: 'staff-2', name: 'Carlos Mendez', title: 'Hair Colorist', color: '#2196F3' },
      { id: 'staff-3', name: 'Sofia Gonzalez', title: 'Stylist', color: '#4CAF50' }
    ],
    galleryUrls: [
      '/images/branches/downtown-1.jpg',
      '/images/branches/downtown-2.jpg',
      '/images/branches/downtown-3.jpg'
    ],
    workingHours: defaultWorkingHours,
    isActive: true,
    isPrimary: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-06-20T14:30:00.000Z'
  },
  {
    id: 'branch-2',
    name: 'Westside Beauty Hub',
    address: '456 Oak Avenue, Floor 2',
    city: 'Los Angeles',
    country: 'United States',
    mobile: '+1 (555) 987-6543',
    email: 'westside@bookly.com',
    businessId: 'business-1',
    services: [
      { id: 'svc-5', name: 'Manicure', price: 28, duration: 30 },
      { id: 'svc-6', name: 'Pedicure', price: 38, duration: 45 },
      { id: 'svc-7', name: 'Gel Nails', price: 55, duration: 60 },
      { id: 'svc-8', name: 'Nail Art', price: 20, duration: 30 }
    ],
    staff: [
      { id: 'staff-4', name: 'Ana Martinez', title: 'Nail Artist', color: '#E91E63' },
      { id: 'staff-5', name: 'Isabel Lopez', title: 'Senior Nail Tech', color: '#FF9800' }
    ],
    galleryUrls: [
      '/images/branches/westside-1.jpg',
      '/images/branches/westside-2.jpg'
    ],
    workingHours: [
      { day: 'Mon', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { day: 'Tue', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { day: 'Wed', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { day: 'Thu', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { day: 'Fri', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { day: 'Sat', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'Sun', isOpen: false, openTime: '10:00', closeTime: '16:00' }
    ],
    isActive: true,
    isPrimary: false,
    createdAt: '2024-02-20T09:00:00.000Z',
    updatedAt: '2024-07-15T11:00:00.000Z'
  },
  {
    id: 'branch-3',
    name: 'Uptown Wellness Spa',
    address: '789 Park Boulevard',
    city: 'Chicago',
    country: 'United States',
    mobile: '+1 (555) 456-7890',
    email: 'uptown@bookly.com',
    businessId: 'business-1',
    services: [
      { id: 'svc-9', name: 'Facial Treatment', price: 65, duration: 60 },
      { id: 'svc-10', name: 'Deep Tissue Massage', price: 95, duration: 90 },
      { id: 'svc-11', name: 'Aromatherapy', price: 75, duration: 60 },
      { id: 'svc-12', name: 'Body Scrub', price: 80, duration: 45 }
    ],
    staff: [
      { id: 'staff-6', name: 'Emma Wilson', title: 'Spa Manager', color: '#00BCD4' },
      { id: 'staff-7', name: 'David Chen', title: 'Massage Therapist', color: '#795548' },
      { id: 'staff-8', name: 'Lisa Park', title: 'Esthetician', color: '#9E9E9E' }
    ],
    galleryUrls: [
      '/images/branches/uptown-1.jpg',
      '/images/branches/uptown-2.jpg',
      '/images/branches/uptown-3.jpg',
      '/images/branches/uptown-4.jpg'
    ],
    workingHours: [
      { day: 'Mon', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'Tue', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'Wed', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'Thu', isOpen: true, openTime: '08:00', closeTime: '21:00' },
      { day: 'Fri', isOpen: true, openTime: '08:00', closeTime: '21:00' },
      { day: 'Sat', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'Sun', isOpen: true, openTime: '10:00', closeTime: '17:00' }
    ],
    isActive: true,
    isPrimary: false,
    createdAt: '2024-03-10T08:00:00.000Z',
    updatedAt: '2024-08-01T16:45:00.000Z'
  },
  {
    id: 'branch-4',
    name: 'Midtown Barbershop',
    address: '321 Central Street',
    city: 'Miami',
    country: 'United States',
    mobile: '+1 (555) 321-9876',
    email: 'midtown@bookly.com',
    businessId: 'business-1',
    services: [
      { id: 'svc-13', name: 'Classic Haircut', price: 30, duration: 30 },
      { id: 'svc-14', name: 'Hot Towel Shave', price: 25, duration: 25 },
      { id: 'svc-15', name: 'Kids Haircut', price: 20, duration: 20 },
      { id: 'svc-3', name: 'Beard Trim', price: 15, duration: 20 }
    ],
    staff: [
      { id: 'staff-9', name: 'James Brown', title: 'Master Barber', color: '#3F51B5' },
      { id: 'staff-10', name: 'Marcus Johnson', title: 'Barber', color: '#FF5722' }
    ],
    galleryUrls: [
      '/images/branches/midtown-1.jpg'
    ],
    workingHours: defaultWorkingHours,
    isActive: false, // Temporarily closed
    isPrimary: false,
    createdAt: '2024-04-05T11:00:00.000Z',
    updatedAt: '2024-09-10T09:00:00.000Z'
  }
]

// Available services for branch assignment (from services feature)
export const availableServices = [
  { id: 'svc-1', name: 'Haircut', price: 35, duration: 45 },
  { id: 'svc-2', name: 'Hair Coloring', price: 85, duration: 120 },
  { id: 'svc-3', name: 'Beard Trim', price: 15, duration: 20 },
  { id: 'svc-4', name: 'Hair Wash & Style', price: 25, duration: 30 },
  { id: 'svc-5', name: 'Manicure', price: 28, duration: 30 },
  { id: 'svc-6', name: 'Pedicure', price: 38, duration: 45 },
  { id: 'svc-7', name: 'Gel Nails', price: 55, duration: 60 },
  { id: 'svc-8', name: 'Nail Art', price: 20, duration: 30 },
  { id: 'svc-9', name: 'Facial Treatment', price: 65, duration: 60 },
  { id: 'svc-10', name: 'Deep Tissue Massage', price: 95, duration: 90 },
  { id: 'svc-11', name: 'Aromatherapy', price: 75, duration: 60 },
  { id: 'svc-12', name: 'Body Scrub', price: 80, duration: 45 },
  { id: 'svc-13', name: 'Classic Haircut', price: 30, duration: 30 },
  { id: 'svc-14', name: 'Hot Towel Shave', price: 25, duration: 25 },
  { id: 'svc-15', name: 'Kids Haircut', price: 20, duration: 20 }
]

// Available staff for branch assignment
export const availableStaff = [
  { id: 'staff-1', name: 'Maria Rodriguez', title: 'Senior Stylist', color: '#9C27B0' },
  { id: 'staff-2', name: 'Carlos Mendez', title: 'Hair Colorist', color: '#2196F3' },
  { id: 'staff-3', name: 'Sofia Gonzalez', title: 'Stylist', color: '#4CAF50' },
  { id: 'staff-4', name: 'Ana Martinez', title: 'Nail Artist', color: '#E91E63' },
  { id: 'staff-5', name: 'Isabel Lopez', title: 'Senior Nail Tech', color: '#FF9800' },
  { id: 'staff-6', name: 'Emma Wilson', title: 'Spa Manager', color: '#00BCD4' },
  { id: 'staff-7', name: 'David Chen', title: 'Massage Therapist', color: '#795548' },
  { id: 'staff-8', name: 'Lisa Park', title: 'Esthetician', color: '#9E9E9E' },
  { id: 'staff-9', name: 'James Brown', title: 'Master Barber', color: '#3F51B5' },
  { id: 'staff-10', name: 'Marcus Johnson', title: 'Barber', color: '#FF5722' }
]
