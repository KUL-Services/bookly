import {
  Business,
  Service,
  StaffMember,
  Review,
  Category,
  Booking,
  User,
  StaffSchedule,
  StaffAppointment
} from './types'
import type { Room, StaticServiceSlot, ScheduleTemplate, WeeklySlotPattern } from '@/bookly/features/calendar/types'

export const categories: Category[] = [
  { id: '1', name: 'Hair', icon: '✂️', slug: 'hair' },
  { id: '2', name: 'Nails', icon: '💅', slug: 'nails' },
  { id: '3', name: 'Face', icon: '✨', slug: 'face' },
  { id: '4', name: 'Body', icon: '💆', slug: 'body' },
  { id: '5', name: 'Barber', icon: '🪒', slug: 'barber' },
  { id: '6', name: 'Massage', icon: '👐', slug: 'massage' }
]

export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    categories: ['1'],
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop'
    ],
    address: '123 Oxford Street',
    city: 'London',
    location: { latitude: 51.5074, longitude: -0.1278 },
    branches: [
      {
        id: '1-1',
        name: 'Luxe Hair Studio - Oxford',
        address: '123 Oxford Street',
        city: 'London',
        location: { latitude: 51.5074, longitude: -0.1278 },
        openingHours: {
          Mon: '9:00 AM - 7:00 PM',
          Tue: '9:00 AM - 7:00 PM',
          Wed: '9:00 AM - 7:00 PM',
          Thu: '9:00 AM - 8:00 PM',
          Fri: '9:00 AM - 8:00 PM',
          Sat: '8:00 AM - 6:00 PM',
          Sun: '10:00 AM - 5:00 PM'
        },
        serviceIds: ['1', '2', '3'] // All hair services
      },
      {
        id: '1-2',
        name: 'Luxe Hair Studio - Soho',
        address: '50 Dean Street',
        city: 'London',
        location: { latitude: 51.5135, longitude: -0.1321 },
        openingHours: {
          Mon: '10:00 AM - 8:00 PM',
          Tue: '10:00 AM - 8:00 PM',
          Wed: '10:00 AM - 8:00 PM',
          Thu: '10:00 AM - 9:00 PM',
          Fri: '10:00 AM - 9:00 PM',
          Sat: '9:00 AM - 7:00 PM',
          Sun: 'Closed'
        },
        serviceIds: ['1', '2', '3'] // All hair services
      },
      {
        id: '1-3',
        name: 'Luxe Hair Studio - Kensington',
        address: '200 Kensington High Street',
        city: 'London',
        location: { latitude: 51.5009, longitude: -0.1995 },
        openingHours: {
          Mon: '8:00 AM - 6:00 PM',
          Tue: '8:00 AM - 6:00 PM',
          Wed: '8:00 AM - 6:00 PM',
          Thu: '8:00 AM - 7:00 PM',
          Fri: '8:00 AM - 7:00 PM',
          Sat: '9:00 AM - 5:00 PM',
          Sun: '10:00 AM - 4:00 PM'
        },
        serviceIds: ['1', '3'] // Haircut & Highlights only
      }
    ],
    about: 'Premium hair salon offering cutting-edge styles and treatments in the heart of London.',
    services: ['1', '2', '3'],
    staff: ['1', '2', '7'],
    reviews: ['1', '2'],
    averageRating: 4.8,
    totalRatings: 127,
    openingHours: {
      Mon: '9:00 AM - 7:00 PM',
      Tue: '9:00 AM - 7:00 PM',
      Wed: '9:00 AM - 7:00 PM',
      Thu: '9:00 AM - 8:00 PM',
      Fri: '9:00 AM - 8:00 PM',
      Sat: '8:00 AM - 6:00 PM',
      Sun: '10:00 AM - 5:00 PM'
    }
  },
  {
    id: '2',
    name: 'Bliss Nail Bar',
    categories: ['2'],
    coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop'
    ],
    address: "456 King's Road",
    city: 'London',
    location: { latitude: 51.4875, longitude: -0.1687 },
    branches: [
      {
        id: '2-1',
        name: "Bliss Nail Bar - King's Road",
        address: "456 King's Road",
        city: 'London',
        location: { latitude: 51.4875, longitude: -0.1687 },
        openingHours: {
          Mon: '10:00 AM - 7:00 PM',
          Tue: '10:00 AM - 7:00 PM',
          Wed: '10:00 AM - 7:00 PM',
          Thu: '10:00 AM - 8:00 PM',
          Fri: '10:00 AM - 8:00 PM',
          Sat: '9:00 AM - 6:00 PM',
          Sun: '11:00 AM - 5:00 PM'
        },
        serviceIds: ['4', '5'] // All nail services
      },
      {
        id: '2-2',
        name: 'Bliss Nail Bar - Camden',
        address: '22 Camden High Street',
        city: 'London',
        location: { latitude: 51.5416, longitude: -0.1469 },
        openingHours: {
          Mon: '9:00 AM - 6:00 PM',
          Tue: '9:00 AM - 6:00 PM',
          Wed: '9:00 AM - 6:00 PM',
          Thu: '9:00 AM - 7:00 PM',
          Fri: '9:00 AM - 7:00 PM',
          Sat: '10:00 AM - 6:00 PM',
          Sun: 'Closed'
        },
        serviceIds: ['4'] // Gel Manicure only
      }
    ],
    about: 'Modern nail salon specializing in gel manicures, nail art, and luxury pedicures.',
    services: ['4', '5'],
    staff: ['3', '4'],
    reviews: ['3'],
    averageRating: 4.6,
    totalRatings: 89,
    openingHours: {
      Mon: '10:00 AM - 8:00 PM',
      Tue: '10:00 AM - 8:00 PM',
      Wed: '10:00 AM - 8:00 PM',
      Thu: '10:00 AM - 9:00 PM',
      Fri: '10:00 AM - 9:00 PM',
      Sat: '9:00 AM - 7:00 PM',
      Sun: '11:00 AM - 6:00 PM'
    }
  },
  {
    id: '3',
    name: 'Urban Barber Co.',
    categories: ['3'],
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop'
    ],
    address: '789 Shoreditch High Street',
    city: 'London',
    location: { latitude: 51.5223, longitude: -0.0813 },
    branches: [
      {
        id: '3-1',
        name: 'Urban Barber Co. - Shoreditch',
        address: '789 Shoreditch High Street',
        city: 'London',
        location: { latitude: 51.5223, longitude: -0.0813 },
        openingHours: {
          Mon: '8:00 AM - 7:00 PM',
          Tue: '8:00 AM - 7:00 PM',
          Wed: '8:00 AM - 7:00 PM',
          Thu: '8:00 AM - 8:00 PM',
          Fri: '8:00 AM - 8:00 PM',
          Sat: '9:00 AM - 6:00 PM',
          Sun: '10:00 AM - 4:00 PM'
        },
        serviceIds: ['6', '7'] // All barber services
      },
      {
        id: '3-2',
        name: 'Urban Barber Co. - Brixton',
        address: '332 Brixton Road',
        city: 'London',
        location: { latitude: 51.4635, longitude: -0.1062 },
        openingHours: {
          Mon: '9:00 AM - 6:00 PM',
          Tue: '9:00 AM - 6:00 PM',
          Wed: '9:00 AM - 6:00 PM',
          Thu: '9:00 AM - 7:00 PM',
          Fri: '9:00 AM - 7:00 PM',
          Sat: '10:00 AM - 5:00 PM',
          Sun: 'Closed'
        },
        serviceIds: ['6'] // Classic Cut only
      }
    ],
    about: 'Traditional barbering with a modern twist. Specialists in classic cuts and hot towel shaves.',
    services: ['6', '7'],
    staff: ['5', '6'],
    reviews: ['4', '5'],
    averageRating: 4.9,
    totalRatings: 156,
    openingHours: {
      Mon: '8:00 AM - 7:00 PM',
      Tue: '8:00 AM - 7:00 PM',
      Wed: '8:00 AM - 7:00 PM',
      Thu: '8:00 AM - 8:00 PM',
      Fri: '8:00 AM - 8:00 PM',
      Sat: '8:00 AM - 6:00 PM',
      Sun: 'Closed'
    }
  }
]

// Extract all branches from all businesses
export const mockBranches = mockBusinesses.flatMap(business => business.branches)

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Haircut & Style',
    description: 'Professional cut and styling',
    price: 65,
    duration: 60,
    category: 'Haircut',
    businessId: '1',
    color: '#3B82F6' // Blue
  },
  {
    id: '2',
    name: 'Color Treatment',
    description: 'Full color service',
    price: 120,
    duration: 120,
    category: 'Coloring',
    businessId: '1',
    color: '#8B5CF6' // Purple
  },
  {
    id: '3',
    name: 'Highlights',
    description: 'Partial highlights',
    price: 85,
    duration: 90,
    category: 'Coloring',
    businessId: '1',
    color: '#EC4899' // Pink
  },
  {
    id: '4',
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish',
    price: 35,
    duration: 45,
    category: 'Manicure',
    businessId: '2',
    color: '#F59E0B' // Amber
  },
  {
    id: '5',
    name: 'Luxury Pedicure',
    description: 'Full pedicure with massage',
    price: 45,
    duration: 60,
    category: 'Pedicure',
    businessId: '2',
    color: '#10B981' // Emerald
  },
  {
    id: '6',
    name: 'Classic Cut',
    description: 'Traditional barber cut',
    price: 25,
    duration: 30,
    category: 'Haircut',
    businessId: '3',
    color: '#14B8A6' // Teal
  },
  {
    id: '7',
    name: 'Hot Towel Shave',
    description: 'Traditional wet shave',
    price: 30,
    duration: 45,
    category: 'Shave',
    businessId: '3',
    color: '#F97316' // Orange
  }
]

// Helper function to generate appointments for staff members
const generateStaffAppointments = (
  staffId: string,
  businessType: 'hair' | 'nails' | 'barber' | 'spa' | 'dental' | 'fitness'
): StaffAppointment[] => {
  const today = new Date(2025, 9, 17) // October 17, 2025
  const appointments: StaffAppointment[] = []

  const servicesByType = {
    hair: ['Haircut & Style', 'Color Treatment', 'Highlights', 'Deep Conditioning'],
    nails: ['Gel Manicure', 'Luxury Pedicure', 'Nail Art', 'French Manicure'],
    barber: ['Classic Cut', 'Hot Towel Shave', 'Beard Trim', 'Kids Cut'],
    spa: ['Swedish Massage', 'Deep Tissue Massage', 'Aromatherapy', 'Facial Treatment'],
    dental: ['Dental Cleaning', 'Teeth Whitening', 'Dental Checkup', 'Cavity Filling'],
    fitness: ['Personal Training', 'Yoga Session', 'Strength Training', 'Cardio Workout']
  }

  const customers = [
    'John Smith',
    'Emma Davis',
    'Michael Brown',
    'Sarah Wilson',
    'David Lee',
    'Lisa Anderson',
    'James Taylor',
    'Maria Garcia'
  ]

  // Generate appointments for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)

    // Skip Sundays for some variety
    if (date.getDay() === 0 && Math.random() > 0.3) continue

    // Generate 3-6 appointments per day
    const appointmentCount = Math.floor(Math.random() * 4) + 3

    for (let i = 0; i < appointmentCount; i++) {
      const hour = 9 + Math.floor(Math.random() * 8) // 9 AM to 5 PM
      const minute = Math.random() > 0.5 ? '00' : '30'
      const duration = Math.floor(Math.random() * 3) * 30 + 30 // 30, 60, or 90 minutes

      const startTime = `${hour.toString().padStart(2, '0')}:${minute}`
      const endHour = hour + Math.floor(duration / 60)
      const endMinute = (parseInt(minute) + (duration % 60)).toString().padStart(2, '0')
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute}`

      const services = servicesByType[businessType]
      const serviceName = services[Math.floor(Math.random() * services.length)]
      const customerName = customers[Math.floor(Math.random() * customers.length)]

      let status: 'confirmed' | 'pending' | 'completed' | 'cancelled' = 'confirmed'
      if (dayOffset < 0) status = 'completed'
      else if (Math.random() > 0.9) status = 'cancelled'
      else if (Math.random() > 0.8) status = 'pending'

      appointments.push({
        id: `apt-${staffId}-${dayOffset}-${i}`,
        date,
        startTime,
        endTime,
        serviceName,
        customerName,
        status
      })
    }
  }

  return appointments.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime()
    return a.startTime.localeCompare(b.startTime)
  })
}

// Helper function to convert 24h time to 12h format
const formatTimeTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Helper function to get typical working hours from schedule
const getWorkingHoursFromSchedule = (schedule?: StaffSchedule[]): string => {
  if (!schedule || schedule.length === 0) return '10:00 AM-7:00 PM'

  // Find a typical working day (prefer Mon-Fri)
  const workingDay =
    schedule.find(s => s.isAvailable && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(s.dayOfWeek)) ||
    schedule.find(s => s.isAvailable)

  if (!workingDay) return '10:00 AM-7:00 PM'

  return `${formatTimeTo12Hour(workingDay.startTime)}-${formatTimeTo12Hour(workingDay.endTime)}`
}

// Standard working week schedule
const standardSchedule: StaffSchedule[] = [
  { dayOfWeek: 'Mon', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'Tue', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'Wed', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'Thu', startTime: '09:00', endTime: '18:00', isAvailable: true },
  { dayOfWeek: 'Fri', startTime: '09:00', endTime: '18:00', isAvailable: true },
  { dayOfWeek: 'Sat', startTime: '08:00', endTime: '16:00', isAvailable: true },
  { dayOfWeek: 'Sun', startTime: '10:00', endTime: '15:00', isAvailable: false }
]

// Extended hours schedule
const extendedSchedule: StaffSchedule[] = [
  { dayOfWeek: 'Mon', startTime: '08:00', endTime: '19:00', isAvailable: true },
  { dayOfWeek: 'Tue', startTime: '08:00', endTime: '19:00', isAvailable: true },
  { dayOfWeek: 'Wed', startTime: '08:00', endTime: '19:00', isAvailable: true },
  { dayOfWeek: 'Thu', startTime: '08:00', endTime: '20:00', isAvailable: true },
  { dayOfWeek: 'Fri', startTime: '08:00', endTime: '20:00', isAvailable: true },
  { dayOfWeek: 'Sat', startTime: '08:00', endTime: '18:00', isAvailable: true },
  { dayOfWeek: 'Sun', startTime: '10:00', endTime: '16:00', isAvailable: true }
]

// Part-time schedule
const partTimeSchedule: StaffSchedule[] = [
  { dayOfWeek: 'Mon', startTime: '09:00', endTime: '17:00', isAvailable: false },
  { dayOfWeek: 'Tue', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'Wed', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'Thu', startTime: '09:00', endTime: '17:00', isAvailable: false },
  { dayOfWeek: 'Fri', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'Sat', startTime: '08:00', endTime: '16:00', isAvailable: true },
  { dayOfWeek: 'Sun', startTime: '10:00', endTime: '15:00', isAvailable: false }
]

// Base staff data with old format (1-1, 1-2, etc.)
const baseStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    title: 'Senior Stylist',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b077?w=150&h=150&fit=crop&crop=face',
    businessId: '1',
    branchId: '1-1',
    email: 'emma.johnson@luxehair.com',
    phone: '+44 7700 900001',
    color: '#1976d2',
    isActive: true,
    staffType: 'dynamic', // Traditional appointment-based scheduling
    schedule: extendedSchedule,
    workingHours: getWorkingHoursFromSchedule(extendedSchedule),
    appointments: generateStaffAppointments('1', 'hair'),
    maxConcurrentBookings: 2, // Can handle 2 overlapping appointments
    // Dynamic staff can also have room assignments (workplace reference, not scheduling constraint)
    roomAssignments: [
      {
        roomId: 'room-1-1-1',
        roomName: 'Studio A',
        dayOfWeek: 'Mon',
        startTime: '09:00',
        endTime: '17:00',
        serviceIds: ['1', '2', '3'] // Hair services
      },
      {
        roomId: 'room-1-1-1',
        roomName: 'Studio A',
        dayOfWeek: 'Tue',
        startTime: '09:00',
        endTime: '17:00',
        serviceIds: ['1', '2', '3']
      },
      {
        roomId: 'room-1-1-1',
        roomName: 'Studio A',
        dayOfWeek: 'Wed',
        startTime: '09:00',
        endTime: '17:00',
        serviceIds: ['1', '2', '3']
      },
      {
        roomId: 'room-1-1-1',
        roomName: 'Studio A',
        dayOfWeek: 'Thu',
        startTime: '09:00',
        endTime: '18:00',
        serviceIds: ['1', '2', '3']
      },
      {
        roomId: 'room-1-1-1',
        roomName: 'Studio A',
        dayOfWeek: 'Fri',
        startTime: '09:00',
        endTime: '18:00',
        serviceIds: ['1', '2', '3']
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Williams',
    title: 'Color Specialist',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    businessId: '1',
    branchId: '1-1',
    email: 'sarah.williams@luxehair.com',
    phone: '+44 7700 900002',
    color: '#9c27b0',
    isActive: true,
    staffType: 'static', // Works in rooms on fixed schedule
    schedule: standardSchedule,
    workingHours: getWorkingHoursFromSchedule(standardSchedule),
    appointments: generateStaffAppointments('2', 'hair'),
    maxConcurrentBookings: 1,
    roomAssignments: [
      {
        roomId: 'room-1-1-2',
        roomName: 'Studio B',
        dayOfWeek: 'Mon',
        startTime: '09:00',
        endTime: '13:00',
        serviceIds: ['fitness-1', 'fitness-2'] // Morning yoga and pilates
      },
      {
        roomId: 'room-1-1-2',
        roomName: 'Studio B',
        dayOfWeek: 'Wed',
        startTime: '10:00',
        endTime: '11:00',
        serviceIds: ['fitness-4'] // Personal training
      },
      {
        roomId: 'room-1-1-2',
        roomName: 'Studio B',
        dayOfWeek: 'Thu',
        startTime: '09:00',
        endTime: '10:00',
        serviceIds: ['fitness-1'] // Morning yoga
      }
    ]
  },
  {
    id: '3',
    name: 'Lisa Chen',
    title: 'Nail Artist',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    businessId: '2',
    branchId: '2-1',
    email: 'lisa.chen@blissnails.com',
    phone: '+44 7700 900003',
    color: '#e91e63',
    isActive: true,
    staffType: 'static', // Works in nail stations
    schedule: extendedSchedule,
    workingHours: getWorkingHoursFromSchedule(extendedSchedule),
    appointments: generateStaffAppointments('3', 'nails'),
    roomAssignments: [
      {
        roomId: 'room-2-1-1',
        roomName: 'Station 1',
        dayOfWeek: 'Mon',
        startTime: '09:00',
        endTime: '20:00',
        serviceIds: ['4'] // Gel Manicure
      },
      {
        roomId: 'room-2-1-1',
        roomName: 'Station 1',
        dayOfWeek: 'Tue',
        startTime: '09:00',
        endTime: '20:00',
        serviceIds: ['4']
      },
      {
        roomId: 'room-2-1-1',
        roomName: 'Station 1',
        dayOfWeek: 'Wed',
        startTime: '09:00',
        endTime: '20:00',
        serviceIds: ['4']
      }
    ]
  },
  {
    id: '4',
    name: 'Maria Garcia',
    title: 'Senior Nail Technician',
    photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    businessId: '2',
    branchId: '1-1',
    email: 'maria.garcia@blissnails.com',
    phone: '+44 7700 900004',
    color: '#f06292',
    isActive: true,
    staffType: 'dynamic', // Traditional booking
    schedule: standardSchedule,
    workingHours: getWorkingHoursFromSchedule(standardSchedule),
    appointments: generateStaffAppointments('4', 'nails'),
    maxConcurrentBookings: 2,
    // Dynamic staff with room assignments for flexible booking from specific workspace
    roomAssignments: [
      {
        roomId: 'room-2-1-2',
        roomName: 'Station 2',
        dayOfWeek: 'Mon',
        startTime: '10:00',
        endTime: '19:00',
        serviceIds: ['4', '5'] // Nail services
      },
      {
        roomId: 'room-2-1-2',
        roomName: 'Station 2',
        dayOfWeek: 'Wed',
        startTime: '10:00',
        endTime: '19:00',
        serviceIds: ['4', '5']
      },
      {
        roomId: 'room-2-1-2',
        roomName: 'Station 2',
        dayOfWeek: 'Fri',
        startTime: '10:00',
        endTime: '19:00',
        serviceIds: ['4', '5']
      }
    ]
  },
  {
    id: '5',
    name: 'James Mitchell',
    title: 'Master Barber',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    businessId: '3',
    branchId: '3-1',
    email: 'james.mitchell@urbanbarber.com',
    phone: '+44 7700 900005',
    color: '#795548',
    isActive: true,
    staffType: 'dynamic', // Traditional booking
    schedule: extendedSchedule,
    workingHours: getWorkingHoursFromSchedule(extendedSchedule),
    appointments: generateStaffAppointments('5', 'barber')
  },
  {
    id: '6',
    name: 'David Brown',
    title: 'Barber',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    businessId: '3',
    branchId: '3-2',
    email: 'david.brown@urbanbarber.com',
    phone: '+44 7700 900006',
    color: '#6d4c41',
    isActive: true,
    staffType: 'dynamic', // Traditional booking
    schedule: standardSchedule,
    workingHours: getWorkingHoursFromSchedule(standardSchedule),
    appointments: generateStaffAppointments('6', 'barber')
  },
  {
    id: '7',
    name: 'Alex Thompson',
    title: 'Junior Stylist',
    photo: '', // Empty photo to demonstrate initials
    businessId: '1',
    branchId: '1-3',
    email: 'alex.thompson@luxehair.com',
    phone: '+44 7700 900007',
    color: '#00897b',
    isActive: true,
    staffType: 'dynamic', // Traditional booking - NO room assignment (freelance/flexible)
    schedule: partTimeSchedule,
    workingHours: getWorkingHoursFromSchedule(partTimeSchedule),
    appointments: generateStaffAppointments('7', 'hair')
  },
  {
    id: '8',
    name: 'Rebecca Foster',
    title: 'Senior Colorist',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    businessId: '1',
    branchId: '1-1',
    email: 'rebecca.foster@luxehair.com',
    phone: '+44 7700 900008',
    color: '#ff6b6b',
    isActive: true,
    staffType: 'static', // Works in fixed time slots - NO room assignment (pool staff, flexible location)
    schedule: standardSchedule,
    workingHours: getWorkingHoursFromSchedule(standardSchedule),
    appointments: generateStaffAppointments('8', 'hair'),
    maxConcurrentBookings: 1
    // NO roomAssignments - static staff without fixed room assignment
  },
  {
    id: '9',
    name: 'Oliver Price',
    title: 'Specialist Colorist',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    businessId: '1',
    branchId: '1-2',
    email: 'oliver.price@luxehair.com',
    phone: '+44 7700 900009',
    color: '#4ecdc4',
    isActive: true,
    staffType: 'static', // Works in fixed time slots - NO room assignment
    schedule: extendedSchedule,
    workingHours: getWorkingHoursFromSchedule(extendedSchedule),
    appointments: generateStaffAppointments('9', 'hair'),
    maxConcurrentBookings: 1
    // NO roomAssignments - static staff without fixed room assignment
  }
]

// Helper function to generate staff for any business/branch pattern
function generateMockStaffForBusiness(
  businessId: string,
  branchId: string,
  staffIndex: number,
  category: 'spa' | 'hair' | 'dental' | 'fitness' | 'nails'
): StaffMember {
  const names = {
    spa: ['Olivia Martinez', 'Isabella Santos', 'Mia Chen', 'Ava Rodriguez', 'Emma Williams'],
    hair: ['Sophia Anderson', 'Charlotte Brown', 'Amelia Davis', 'Harper Wilson', 'Evelyn Moore'],
    dental: ['Dr. James Wilson', 'Dr. Sarah Johnson', 'Dr. Michael Lee', 'Dr. Emily Taylor', 'Dr. David Martinez'],
    fitness: ['Alex Thompson', 'Jordan Smith', 'Casey Rodriguez', 'Morgan Lee', 'Taylor Anderson'],
    nails: ['Luna Garcia', 'Nova Martinez', 'Stella Chen', 'Aurora Kim', 'Violet Rodriguez']
  }

  const titles = {
    spa: ['Senior Therapist', 'Massage Specialist', 'Spa Manager', 'Wellness Expert', 'Aromatherapist'],
    hair: ['Senior Stylist', 'Color Specialist', 'Hair Artist', 'Style Director', 'Creative Stylist'],
    dental: ['Dentist', 'Oral Surgeon', 'Orthodontist', 'Dental Hygienist', 'Dental Consultant'],
    fitness: ['Personal Trainer', 'Fitness Coach', 'Strength Trainer', 'Yoga Instructor', 'Fitness Manager'],
    nails: ['Nail Artist', 'Nail Technician', 'Manicure Specialist', 'Nail Designer', 'Nail Care Expert']
  }

  const photos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b077?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  ]

  const schedules = [extendedSchedule, standardSchedule, partTimeSchedule]
  const nameIndex = staffIndex % names[category].length
  const titleIndex = staffIndex % titles[category].length
  const photoIndex = staffIndex % photos.length
  const scheduleIndex = staffIndex % schedules.length
  const selectedSchedule = schedules[scheduleIndex]

  return {
    id: `${businessId}-staff-${staffIndex + 1}`,
    name: names[category][nameIndex],
    title: titles[category][titleIndex],
    photo: photos[photoIndex],
    businessId,
    branchId,
    staffType: 'dynamic', // Default to dynamic scheduling
    schedule: selectedSchedule,
    workingHours: getWorkingHoursFromSchedule(selectedSchedule),
    appointments: generateStaffAppointments(`${businessId}-staff-${staffIndex + 1}`, category)
  }
}

// Generate staff for all businesses in the system
const additionalStaff: StaffMember[] = []

// Generate staff for biz-1 to biz-32 (spa, hair, dental, fitness businesses)
for (let bizNum = 1; bizNum <= 32; bizNum++) {
  const businessId = `biz-${bizNum}`

  // Determine category based on business number (simplified mapping)
  let category: 'spa' | 'hair' | 'dental' | 'fitness' | 'nails' = 'spa'
  const bizMod = bizNum % 5
  if (bizMod === 1) category = 'spa'
  else if (bizMod === 2) category = 'hair'
  else if (bizMod === 3) category = 'dental'
  else if (bizMod === 4) category = 'fitness'
  else category = 'nails'

  // Branch 1 - always has 2 staff
  additionalStaff.push(
    generateMockStaffForBusiness(businessId, `${businessId}-branch-1`, 0, category),
    generateMockStaffForBusiness(businessId, `${businessId}-branch-1`, 1, category)
  )

  // Branch 2 - some businesses have it (1 staff member)
  if (bizNum % 2 === 0) {
    additionalStaff.push(generateMockStaffForBusiness(businessId, `${businessId}-branch-2`, 2, category))
  }

  // Branch 3 - fewer businesses have it (1 staff member)
  if (bizNum % 3 === 0) {
    additionalStaff.push(generateMockStaffForBusiness(businessId, `${businessId}-branch-3`, 3, category))
  }
}

export const mockStaff: StaffMember[] = [...baseStaff, ...additionalStaff]

export const mockReviews: Review[] = [
  {
    id: '1',
    authorName: 'Sophie Turner',
    authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: 'Amazing service! Emma did an incredible job with my highlights.',
    date: new Date('2024-01-15'),
    businessId: '1'
  },
  {
    id: '2',
    authorName: 'Kate Wilson',
    authorImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: "Best haircut I've ever had! Will definitely be back.",
    date: new Date('2024-01-12'),
    businessId: '1'
  },
  {
    id: '3',
    authorName: 'Rachel Green',
    authorImage: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=50&h=50&fit=crop&crop=face',
    rating: 4,
    comment: 'Great nail art! Lisa is very talented.',
    date: new Date('2024-01-10'),
    businessId: '2'
  },
  {
    id: '4',
    authorName: 'John Smith',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: 'Perfect cut and shave. James knows his craft.',
    date: new Date('2024-01-08'),
    businessId: '3'
  },
  {
    id: '5',
    authorName: 'Michael Davis',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: 'Old school barbering at its finest. Highly recommend!',
    date: new Date('2024-01-05'),
    businessId: '3'
  }
]

export const mockUser: User = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+44 7700 900123',
  profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  memberSince: new Date('2023-03-15'),
  totalBookings: 8,
  favoriteBusinesses: ['1', '2']
}

// Mock customers/clients for appointments
export const mockCustomers: User[] = [
  {
    id: 'customer-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+44 7700 900123',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2023-03-15'),
    totalBookings: 8,
    favoriteBusinesses: ['1', '2']
  },
  {
    id: 'customer-2',
    firstName: 'Sarah',
    lastName: 'Smith',
    email: 'sarah.smith@example.com',
    phone: '+44 7700 900124',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2024-01-10'),
    totalBookings: 3,
    favoriteBusinesses: ['1']
  },
  {
    id: 'customer-3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.j@example.com',
    phone: '+44 7700 900125',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2023-08-22'),
    totalBookings: 12,
    favoriteBusinesses: ['1', '2', '3']
  },
  {
    id: 'customer-4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    phone: '+44 7700 900126',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2024-02-05'),
    totalBookings: 5,
    favoriteBusinesses: ['2']
  },
  {
    id: 'customer-5',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.w@example.com',
    phone: '+44 7700 900127',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2023-11-18'),
    totalBookings: 7,
    favoriteBusinesses: ['3']
  },
  {
    id: 'customer-6',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'jessica.m@example.com',
    phone: '+44 7700 900128',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2024-03-12'),
    totalBookings: 2,
    favoriteBusinesses: ['1']
  },
  {
    id: 'customer-7',
    firstName: 'Christopher',
    lastName: 'Brown',
    email: 'chris.brown@example.com',
    phone: '+44 7700 900129',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2023-06-08'),
    totalBookings: 15,
    favoriteBusinesses: ['1', '2']
  },
  {
    id: 'customer-8',
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'amanda.t@example.com',
    phone: '+44 7700 900130',
    profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    memberSince: new Date('2024-01-20'),
    totalBookings: 4,
    favoriteBusinesses: ['2', '3']
  }
]

export const mockBookings: Booking[] = [
  // Upcoming bookings
  {
    id: 'booking-1',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-11-25'),
    time: '2:00 PM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Please trim split ends and add light layers'
  },
  {
    id: 'booking-2',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-10-28'),
    time: '11:00 AM',
    duration: 45,
    price: 35,
    status: 'confirmed'
  },
  {
    id: 'booking-3',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-10-02'),
    time: '4:30 PM',
    duration: 30,
    price: 25,
    status: 'pending'
  },

  // Past bookings
  {
    id: 'booking-4',
    businessId: '1',
    branchId: '1-2',
    branchName: 'Luxe Hair Studio - Soho',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Color Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2024-12-15'),
    time: '10:00 AM',
    duration: 120,
    price: 120,
    status: 'completed',
    notes: 'Full highlights with root touch-up'
  },
  {
    id: 'booking-5',
    businessId: '2',
    branchId: '2-2',
    branchName: 'Bliss Nail Bar - Camden',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2024-12-08'),
    time: '3:00 PM',
    duration: 60,
    price: 45,
    status: 'completed'
  },
  {
    id: 'booking-6',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2024-11-22'),
    time: '1:30 PM',
    duration: 60,
    price: 65,
    status: 'completed'
  },
  {
    id: 'booking-7',
    businessId: '3',
    branchId: '3-2',
    branchName: 'Urban Barber Co. - Brixton',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'David Brown',
    date: new Date('2024-11-10'),
    time: '5:00 PM',
    duration: 45,
    price: 30,
    status: 'completed'
  },
  {
    id: 'booking-8',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2024-10-28'),
    time: '12:00 PM',
    duration: 45,
    price: 35,
    status: 'cancelled',
    notes: 'Cancelled due to scheduling conflict'
  },
  // Current month (September 2025)
  {
    id: 'booking-9',
    businessId: '1',
    branchId: '1-2',
    branchName: 'Luxe Hair Studio - Soho',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Highlights',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-09-10'),
    time: '3:00 PM',
    duration: 90,
    price: 85,
    status: 'completed',
    notes: 'Partial highlights for autumn look'
  },
  {
    id: 'booking-10',
    businessId: '2',
    branchId: '2-2',
    branchName: 'Bliss Nail Bar - Camden',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2025-09-18'),
    time: '2:00 PM',
    duration: 60,
    price: 45,
    status: 'confirmed'
  },
  {
    id: 'booking-15',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-09-21'),
    time: '9:00 AM',
    duration: 45,
    price: 35,
    status: 'completed',
    notes: 'Special nail art for event'
  },
  {
    id: 'booking-19',
    businessId: '1',
    branchId: '1-2',
    branchName: 'Luxe Hair Studio - Soho',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Highlights',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-09-30'),
    time: '1:00 PM',
    duration: 90,
    price: 85,
    status: 'confirmed',
    notes: 'Blonde highlights refresh'
  },
  // Past month (August 2025)
  {
    id: 'booking-11',
    businessId: '3',
    branchId: '3-2',
    branchName: 'Urban Barber Co. - Brixton',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'David Brown',
    date: new Date('2025-08-22'),
    time: '5:30 PM',
    duration: 45,
    price: 30,
    status: 'completed',
    notes: 'Classic shave before holiday'
  },
  {
    id: 'booking-12',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-08-29'),
    time: '10:00 AM',
    duration: 45,
    price: 35,
    status: 'cancelled',
    notes: 'Client cancelled due to illness'
  },
  {
    id: 'booking-17',
    businessId: '3',
    branchId: '3-2',
    branchName: 'Urban Barber Co. - Brixton',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'David Brown',
    date: new Date('2025-08-15'),
    time: '2:00 PM',
    duration: 45,
    price: 30,
    status: 'completed',
    notes: 'Pre-wedding grooming'
  },
  // Upcoming month (October 2025)
  {
    id: 'booking-13',
    businessId: '1',
    branchId: '1-2',
    branchName: 'Luxe Hair Studio - Soho',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Color Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-10-05'),
    time: '1:00 PM',
    duration: 120,
    price: 120,
    status: 'pending',
    notes: 'Full color refresh for fall'
  },
  {
    id: 'booking-14',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-10-15'),
    time: '6:00 PM',
    duration: 30,
    price: 25,
    status: 'confirmed'
  },
  {
    id: 'booking-16',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-10-03'),
    time: '10:00 AM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Layered cut for new look'
  },
  {
    id: 'booking-18',
    businessId: '2',
    branchId: '2-2',
    branchName: 'Bliss Nail Bar - Camden',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2025-10-20'),
    time: '5:00 PM',
    duration: 60,
    price: 45,
    status: 'pending',
    notes: 'Spa pedicure for relaxation'
  },
  {
    id: 'booking-20',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-10-25'),
    time: '3:00 PM',
    duration: 30,
    price: 25,
    status: 'pending',
    notes: 'Trim before business trip'
  },

  // Static scheduling bookings with slotId (for capacity testing)
  // Next Monday's Morning Yoga (12 capacity) - 5 bookings
  {
    id: 'booking-static-1',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Morning Yoga Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'), // Next Monday
    time: '9:00 AM',
    duration: 60,
    price: 25,
    status: 'confirmed',
    notes: 'Emma - Regular attendee',
    slotId: 'slot-fitness-mon-1',
    roomId: 'room-1-1-2',
    partySize: 1
  },
  {
    id: 'booking-static-2',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Morning Yoga Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '9:00 AM',
    duration: 60,
    price: 25,
    status: 'confirmed',
    notes: 'Olivia - Beginner friendly',
    slotId: 'slot-fitness-mon-1',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-3',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Morning Yoga Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '9:00 AM',
    duration: 60,
    price: 25,
    status: 'confirmed',
    notes: 'Sophia',
    slotId: 'slot-fitness-mon-1',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-4',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Morning Yoga Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '9:00 AM',
    duration: 60,
    price: 25,
    status: 'pending',
    notes: 'Isabella - First class',
    slotId: 'slot-fitness-mon-1',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-5',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Morning Yoga Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '9:00 AM',
    duration: 60,
    price: 25,
    status: 'cancelled',
    notes: 'Ava - Cancelled, opens spot',
    slotId: 'slot-fitness-mon-1',
    roomId: 'room-1-1-2'
  },
  // Next Monday's Pilates (15 capacity) - 10 bookings
  {
    id: 'booking-static-6',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Mia',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-7',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Charlotte',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-8',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Amelia',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-9',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Harper',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-10',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Evelyn',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-11',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Abigail',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-12',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Ella',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-13',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Emily',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-14',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'pending',
    notes: 'Luna',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-15',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Pilates Class',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-03'),
    time: '6:00 PM',
    duration: 60,
    price: 30,
    status: 'confirmed',
    notes: 'Grace',
    slotId: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2'
  },
  // Next Wednesday's small capacity slot (2 capacity) - 2 bookings to make it FULL
  {
    id: 'booking-static-16',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Personal Training Session',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-05'), // Next Wednesday
    time: '10:00 AM',
    duration: 60,
    price: 50,
    status: 'confirmed',
    notes: 'Chloe - One-on-one',
    slotId: 'slot-fitness-wed-small',
    roomId: 'room-1-1-2'
  },
  {
    id: 'booking-static-17',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Personal Training Session',
    staffMemberName: 'Sarah Johnson',
    date: new Date('2025-11-05'),
    time: '10:00 AM',
    duration: 60,
    price: 50,
    status: 'confirmed',
    notes: 'Lily - Personal session',
    slotId: 'slot-fitness-wed-small',
    roomId: 'room-1-1-2'
  },
  // Today's bookings (2025-12-14)
  {
    id: 'booking-today-1',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-12-14'),
    time: '9:00 AM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Regular haircut and styling'
  },
  {
    id: 'booking-today-2',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-12-14'),
    time: '10:30 AM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Customer booking for color treatment'
  },
  {
    id: 'booking-today-3',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Color Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-12-14'),
    time: '2:00 PM',
    duration: 120,
    price: 120,
    status: 'confirmed',
    notes: 'Full color refresh'
  },
  {
    id: 'booking-today-4',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-12-14'),
    time: '11:00 AM',
    duration: 45,
    price: 35,
    status: 'confirmed'
  },
  {
    id: 'booking-today-5',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-12-14'),
    time: '2:00 PM',
    duration: 45,
    price: 35,
    status: 'confirmed',
    notes: 'Holiday nail art'
  },
  {
    id: 'booking-today-6',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-12-14'),
    time: '1:00 PM',
    duration: 30,
    price: 25,
    status: 'confirmed'
  },
  // Tomorrow's bookings (2025-12-15)
  {
    id: 'booking-tomorrow-1',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-12-15'),
    time: '10:00 AM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Highlight appointment'
  },
  {
    id: 'booking-tomorrow-2',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Highlights',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-12-15'),
    time: '1:00 PM',
    duration: 90,
    price: 85,
    status: 'confirmed',
    notes: 'Partial highlights for event'
  },
  {
    id: 'booking-tomorrow-3',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-12-15'),
    time: '3:00 PM',
    duration: 60,
    price: 45,
    status: 'confirmed',
    notes: 'Holiday pampering'
  },
  // This week's bookings
  {
    id: 'booking-week-1',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-12-16'),
    time: '4:00 PM',
    duration: 45,
    price: 30,
    status: 'confirmed',
    notes: 'Pre-weekend grooming'
  },
  {
    id: 'booking-week-2',
    businessId: '1',
    branchId: '1-2',
    branchName: 'Luxe Hair Studio - Soho',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-12-17'),
    time: '11:00 AM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Christmas party hair appointment'
  },

  // Week view and day view showcase bookings - Dynamic staff (Emma Johnson - ID: 1)
  {
    id: 'booking-showcase-1',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-12-18'),
    time: '9:30 AM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Dynamic staff appointment - morning'
  },
  {
    id: 'booking-showcase-2',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Highlights',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-12-18'),
    time: '1:00 PM',
    duration: 90,
    price: 85,
    status: 'confirmed',
    notes: 'Dynamic staff appointment - afternoon'
  },
  {
    id: 'booking-showcase-3',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Hair Coloring',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-12-19'),
    time: '10:00 AM',
    duration: 120,
    price: 100,
    status: 'pending',
    notes: 'Dynamic staff next day'
  },

  // Static staff (Sarah Williams - ID: 2)
  {
    id: 'booking-showcase-4',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Color Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-12-18'),
    time: '10:30 AM',
    duration: 60,
    price: 75,
    status: 'confirmed',
    notes: 'Static staff appointment - morning'
  },
  {
    id: 'booking-showcase-5',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Hair Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-12-18'),
    time: '3:00 PM',
    duration: 45,
    price: 55,
    status: 'confirmed',
    notes: 'Static staff appointment - afternoon'
  },
  {
    id: 'booking-showcase-6',
    businessId: '1',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Color Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-12-20'),
    time: '2:00 PM',
    duration: 90,
    price: 85,
    status: 'pending',
    notes: 'Static staff different day'
  },

  // Static staff - Lisa Chen (ID: 3, static) at nail salon
  {
    id: 'booking-showcase-7',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-12-18'),
    time: '11:00 AM',
    duration: 45,
    price: 35,
    status: 'confirmed',
    notes: 'Static nail artist - morning slot'
  },
  {
    id: 'booking-showcase-8',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-12-18'),
    time: '4:00 PM',
    duration: 60,
    price: 45,
    status: 'confirmed',
    notes: 'Static nail artist - afternoon slot'
  },
  {
    id: 'booking-showcase-9',
    businessId: '2',
    branchId: '2-1',
    branchName: "Bliss Nail Bar - King's Road",
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-12-19'),
    time: '2:00 PM',
    duration: 45,
    price: 35,
    status: 'pending',
    notes: 'Static nail artist - next day'
  },

  // Dynamic staff - Maria Garcia (ID: 4, dynamic) at nail salon
  {
    id: 'booking-showcase-10',
    businessId: '2',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2025-12-18'),
    time: '9:00 AM',
    duration: 45,
    price: 35,
    status: 'confirmed',
    notes: 'Dynamic nail artist - early morning'
  },
  {
    id: 'booking-showcase-11',
    businessId: '2',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2025-12-18'),
    time: '5:00 PM',
    duration: 60,
    price: 45,
    status: 'confirmed',
    notes: 'Dynamic nail artist - evening'
  },
  {
    id: 'booking-showcase-12',
    businessId: '2',
    branchId: '1-1',
    branchName: 'Luxe Hair Studio - Oxford',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Nail Art',
    staffMemberName: 'Maria Garcia',
    date: new Date('2025-12-20'),
    time: '11:00 AM',
    duration: 60,
    price: 40,
    status: 'pending',
    notes: 'Dynamic nail artist - weekend'
  },

  // Dynamic staff - James Mitchell (ID: 5, dynamic) barber
  {
    id: 'booking-showcase-13',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-12-18'),
    time: '8:00 AM',
    duration: 30,
    price: 25,
    status: 'confirmed',
    notes: 'Dynamic barber - early slot'
  },
  {
    id: 'booking-showcase-14',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-12-18'),
    time: '2:30 PM',
    duration: 30,
    price: 25,
    status: 'confirmed',
    notes: 'Dynamic barber - afternoon'
  },
  {
    id: 'booking-showcase-15',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-12-19'),
    time: '3:00 PM',
    duration: 45,
    price: 30,
    status: 'pending',
    notes: 'Dynamic barber - next day'
  },
  {
    id: 'booking-showcase-16',
    businessId: '3',
    branchId: '3-1',
    branchName: 'Urban Barber Co. - Shoreditch',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-12-21'),
    time: '10:00 AM',
    duration: 30,
    price: 25,
    status: 'confirmed',
    notes: 'Dynamic barber - later in week'
  }
]

// Mock Rooms for static scheduling mode
export const mockRooms: Room[] = [
  // Luxe Hair Studio - Oxford Branch
  {
    id: 'room-1-1-1',
    name: 'Studio A',
    branchId: '1-1',
    color: '#FF6B6B'
  },
  {
    id: 'room-1-1-2',
    name: 'Studio B',
    branchId: '1-1',
    color: '#4ECDC4'
  },
  {
    id: 'room-1-1-3',
    name: 'Studio C',
    branchId: '1-1',
    color: '#95E1D3'
  },
  // Luxe Hair Studio - Soho Branch
  {
    id: 'room-1-2-1',
    name: 'Room 1',
    branchId: '1-2',
    color: '#FFE66D'
  },
  {
    id: 'room-1-2-2',
    name: 'Room 2',
    branchId: '1-2',
    color: '#A8E6CF'
  },
  // Luxe Hair Studio - Kensington Branch
  {
    id: 'room-1-3-1',
    name: 'Salon A',
    branchId: '1-3',
    color: '#FF8B94'
  },
  {
    id: 'room-1-3-2',
    name: 'Salon B',
    branchId: '1-3',
    color: '#C7CEEA'
  },
  // Bliss Nail Bar - King's Road Branch
  {
    id: 'room-2-1-1',
    name: 'Station 1',
    branchId: '2-1',
    color: '#FFDAC1'
  },
  {
    id: 'room-2-1-2',
    name: 'Station 2',
    branchId: '2-1',
    color: '#B5EAD7'
  },
  {
    id: 'room-2-1-3',
    name: 'Station 3',
    branchId: '2-1',
    color: '#C7CEEA'
  },
  // Bliss Nail Bar - Camden Branch
  {
    id: 'room-2-2-1',
    name: 'Pod A',
    branchId: '2-2',
    color: '#FFB6B9'
  },
  {
    id: 'room-2-2-2',
    name: 'Pod B',
    branchId: '2-2',
    color: '#FEC8D8'
  }
]

// Mock Static Service Slots for static scheduling mode
// These represent predefined time slots where specific services are available
export const mockStaticServiceSlots: StaticServiceSlot[] = [
  // Luxe Hair Studio - Oxford Branch (Business 1, Branch 1-1)
  // Monday Schedule for Studio A
  {
    id: 'slot-1-1-1-mon-1',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '09:00',
    endTime: '10:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-mon-2',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '10:00',
    endTime: '11:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-mon-3',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '11:00',
    endTime: '13:00',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '1',
    price: 120
  },
  {
    id: 'slot-1-1-1-mon-4',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '14:00',
    endTime: '15:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '1',
    price: 85
  },
  {
    id: 'slot-1-1-1-mon-5',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '15:30',
    endTime: '16:30',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },

  // Monday Schedule for Studio B
  {
    id: 'slot-1-1-2-mon-1',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '09:00',
    endTime: '11:00',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '2',
    price: 120
  },
  {
    id: 'slot-1-1-2-mon-2',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '11:00',
    endTime: '12:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '2',
    price: 65
  },
  {
    id: 'slot-1-1-2-mon-3',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '13:00',
    endTime: '14:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '2',
    price: 85
  },
  {
    id: 'slot-1-1-2-mon-4',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '14:30',
    endTime: '15:30',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '2',
    price: 65
  },
  {
    id: 'slot-1-1-2-mon-5',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '15:30',
    endTime: '17:30',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '2',
    price: 120
  },

  // Tuesday Schedule for Studio A
  {
    id: 'slot-1-1-1-tue-1',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Tue',
    startTime: '09:00',
    endTime: '10:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '1',
    price: 85
  },
  {
    id: 'slot-1-1-1-tue-2',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Tue',
    startTime: '10:30',
    endTime: '11:30',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-tue-3',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Tue',
    startTime: '13:00',
    endTime: '15:00',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '1',
    price: 120
  },
  {
    id: 'slot-1-1-1-tue-4',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Tue',
    startTime: '15:00',
    endTime: '16:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },

  // Wednesday Schedule for Studio A
  {
    id: 'slot-1-1-1-wed-1',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Wed',
    startTime: '09:00',
    endTime: '10:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-wed-2',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Wed',
    startTime: '10:00',
    endTime: '12:00',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '1',
    price: 120
  },
  {
    id: 'slot-1-1-1-wed-3',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Wed',
    startTime: '13:00',
    endTime: '14:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '1',
    price: 85
  },
  {
    id: 'slot-1-1-1-wed-4',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Wed',
    startTime: '14:30',
    endTime: '15:30',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-wed-5',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Wed',
    startTime: '15:30',
    endTime: '16:30',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },

  // Thursday Schedule for Studio A
  {
    id: 'slot-1-1-1-thu-1',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Thu',
    startTime: '09:00',
    endTime: '11:00',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '1',
    price: 120
  },
  {
    id: 'slot-1-1-1-thu-2',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Thu',
    startTime: '11:00',
    endTime: '12:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '1',
    price: 85
  },
  {
    id: 'slot-1-1-1-thu-3',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Thu',
    startTime: '14:00',
    endTime: '15:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-thu-4',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Thu',
    startTime: '15:00',
    endTime: '16:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-thu-5',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Thu',
    startTime: '16:00',
    endTime: '17:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },

  // Friday Schedule for Studio A
  {
    id: 'slot-1-1-1-fri-1',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Fri',
    startTime: '09:00',
    endTime: '10:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-fri-2',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Fri',
    startTime: '10:00',
    endTime: '11:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '1',
    price: 85
  },
  {
    id: 'slot-1-1-1-fri-3',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Fri',
    startTime: '13:00',
    endTime: '15:00',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '1',
    price: 120
  },
  {
    id: 'slot-1-1-1-fri-4',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Fri',
    startTime: '15:00',
    endTime: '16:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-fri-5',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Fri',
    startTime: '16:00',
    endTime: '17:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },

  // Saturday Schedule for Studio A (shorter day)
  {
    id: 'slot-1-1-1-sat-1',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sat',
    startTime: '08:00',
    endTime: '09:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-sat-2',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sat',
    startTime: '09:00',
    endTime: '10:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '1',
    price: 85
  },
  {
    id: 'slot-1-1-1-sat-3',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sat',
    startTime: '10:30',
    endTime: '11:30',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-sat-4',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sat',
    startTime: '11:30',
    endTime: '13:30',
    serviceId: '2',
    serviceName: 'Color Treatment',
    capacity: 1,
    instructorStaffId: '1',
    price: 120
  },
  {
    id: 'slot-1-1-1-sat-5',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sat',
    startTime: '14:00',
    endTime: '15:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },

  // Sunday Schedule for Studio A (limited hours)
  {
    id: 'slot-1-1-1-sun-1',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sun',
    startTime: '10:00',
    endTime: '11:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },
  {
    id: 'slot-1-1-1-sun-2',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sun',
    startTime: '11:00',
    endTime: '12:30',
    serviceId: '3',
    serviceName: 'Highlights',
    capacity: 1,
    instructorStaffId: '1',
    price: 85
  },
  {
    id: 'slot-1-1-1-sun-3',
    roomId: 'room-1-1-1',
    branchId: '1-1',
    dayOfWeek: 'Sun',
    startTime: '13:00',
    endTime: '14:00',
    serviceId: '1',
    serviceName: 'Haircut & Style',
    capacity: 1,
    instructorStaffId: '1',
    price: 65
  },

  // High-capacity class-style slots (Studio B - Fitness/Group Sessions)
  // Monday Classes
  {
    id: 'slot-fitness-mon-1',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '09:00',
    endTime: '10:00',
    serviceId: 'fitness-1',
    serviceName: 'Morning Yoga Class',
    capacity: 12,
    instructorStaffId: '2',
    price: 25
  },
  {
    id: 'slot-fitness-mon-2',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '18:00',
    endTime: '19:00',
    serviceId: 'fitness-2',
    serviceName: 'Pilates Class',
    capacity: 15,
    instructorStaffId: '2',
    price: 30
  },
  {
    id: 'slot-fitness-mon-3',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Mon',
    startTime: '19:30',
    endTime: '20:30',
    serviceId: 'fitness-3',
    serviceName: 'Zumba Dance',
    capacity: 20,
    instructorStaffId: '3',
    price: 28
  },
  // Tuesday Classes
  {
    id: 'slot-fitness-tue-1',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Tue',
    startTime: '09:00',
    endTime: '10:00',
    serviceId: 'fitness-2',
    serviceName: 'Pilates Class',
    capacity: 15,
    instructorStaffId: '2',
    price: 30
  },
  {
    id: 'slot-fitness-tue-2',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Tue',
    startTime: '18:00',
    endTime: '19:00',
    serviceId: 'fitness-1',
    serviceName: 'Morning Yoga Class',
    capacity: 12,
    instructorStaffId: '2',
    price: 25
  },
  // Small capacity slot for testing full state
  {
    id: 'slot-fitness-wed-small',
    roomId: 'room-1-1-2',
    branchId: '1-1',
    dayOfWeek: 'Wed',
    startTime: '10:00',
    endTime: '11:00',
    serviceId: 'fitness-4',
    serviceName: 'Personal Training Session',
    capacity: 2,
    instructorStaffId: '2',
    price: 50
  }
]

// Schedule Templates for automated slot generation
export const mockScheduleTemplates: ScheduleTemplate[] = [
  {
    id: 'template-1',
    name: 'Winter 2025 Fitness Schedule',
    businessId: '1',
    branchId: '1-1',
    activeFrom: new Date('2025-01-01'),
    activeUntil: new Date('2025-03-31'),
    isActive: true,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    weeklyPattern: [
      // Monday Classes
      {
        id: 'pattern-mon-1',
        dayOfWeek: 'Mon',
        startTime: '09:00',
        endTime: '10:00',
        serviceId: 'fitness-1',
        serviceName: 'Morning Yoga Class',
        roomId: 'room-1-1-2',
        capacity: 12,
        instructorStaffId: '2',
        price: 25
      },
      {
        id: 'pattern-mon-2',
        dayOfWeek: 'Mon',
        startTime: '10:30',
        endTime: '11:30',
        serviceId: 'fitness-2',
        serviceName: 'Pilates Class',
        roomId: 'room-1-1-2',
        capacity: 15,
        instructorStaffId: '2',
        price: 30
      },
      {
        id: 'pattern-mon-3',
        dayOfWeek: 'Mon',
        startTime: '18:00',
        endTime: '19:00',
        serviceId: 'fitness-3',
        serviceName: 'Zumba Dance',
        roomId: 'room-1-1-2',
        capacity: 20,
        instructorStaffId: '3',
        price: 28
      },
      // Tuesday Classes
      {
        id: 'pattern-tue-1',
        dayOfWeek: 'Tue',
        startTime: '09:00',
        endTime: '10:00',
        serviceId: 'fitness-2',
        serviceName: 'Pilates Class',
        roomId: 'room-1-1-2',
        capacity: 15,
        instructorStaffId: '2',
        price: 30
      },
      {
        id: 'pattern-tue-2',
        dayOfWeek: 'Tue',
        startTime: '18:00',
        endTime: '19:00',
        serviceId: 'fitness-1',
        serviceName: 'Evening Yoga',
        roomId: 'room-1-1-2',
        capacity: 12,
        instructorStaffId: '2',
        price: 25
      },
      // Wednesday Classes
      {
        id: 'pattern-wed-1',
        dayOfWeek: 'Wed',
        startTime: '10:00',
        endTime: '11:00',
        serviceId: 'fitness-4',
        serviceName: 'Personal Training Session',
        roomId: 'room-1-1-2',
        capacity: 2,
        instructorStaffId: '2',
        price: 50
      },
      {
        id: 'pattern-wed-2',
        dayOfWeek: 'Wed',
        startTime: '18:30',
        endTime: '19:30',
        serviceId: 'fitness-3',
        serviceName: 'Zumba Dance',
        roomId: 'room-1-1-2',
        capacity: 20,
        instructorStaffId: '3',
        price: 28
      },
      // Thursday Classes
      {
        id: 'pattern-thu-1',
        dayOfWeek: 'Thu',
        startTime: '09:00',
        endTime: '10:00',
        serviceId: 'fitness-1',
        serviceName: 'Morning Yoga Class',
        roomId: 'room-1-1-2',
        capacity: 12,
        instructorStaffId: '2',
        price: 25
      },
      {
        id: 'pattern-thu-2',
        dayOfWeek: 'Thu',
        startTime: '19:00',
        endTime: '20:00',
        serviceId: 'fitness-2',
        serviceName: 'Pilates Class',
        roomId: 'room-1-1-2',
        capacity: 15,
        instructorStaffId: '2',
        price: 30
      },
      // Friday Classes
      {
        id: 'pattern-fri-1',
        dayOfWeek: 'Fri',
        startTime: '18:00',
        endTime: '19:00',
        serviceId: 'fitness-3',
        serviceName: 'Friday Zumba',
        roomId: 'room-1-1-2',
        capacity: 20,
        instructorStaffId: '3',
        price: 28
      },
      // Saturday Classes
      {
        id: 'pattern-sat-1',
        dayOfWeek: 'Sat',
        startTime: '10:00',
        endTime: '11:00',
        serviceId: 'fitness-1',
        serviceName: 'Weekend Yoga',
        roomId: 'room-1-1-2',
        capacity: 15,
        instructorStaffId: '2',
        price: 25
      }
    ]
  }
]
