import type {
  WeeklyBusinessHours,
  WeeklyStaffHours,
  TimeReservation,
  TimeOffRequest,
  Resource,
  CommissionPolicy,
  ShiftRuleSet,
  StaffShift,
  BreakRange,
  ManagedRoom,
  WeeklyRoomSchedule,
  RoomShift
} from '@/bookly/features/calendar/types'

// ============================================================================
// Business Hours (Weekly Template)
// ============================================================================

export const mockBusinessHours: WeeklyBusinessHours = {
  Sun: {
    isOpen: true,
    shifts: [{ start: '10:00', end: '17:00' }]
  },
  Mon: {
    isOpen: true,
    shifts: [{ start: '09:00', end: '19:00' }]
  },
  Tue: {
    isOpen: true,
    shifts: [{ start: '09:00', end: '19:00' }]
  },
  Wed: {
    isOpen: false,
    shifts: []
  },
  Thu: {
    isOpen: true,
    shifts: [{ start: '09:00', end: '20:00' }]
  },
  Fri: {
    isOpen: true,
    shifts: [{ start: '09:00', end: '20:00' }]
  },
  Sat: {
    isOpen: true,
    shifts: [{ start: '09:00', end: '18:00' }]
  }
}

// ============================================================================
// Staff Working Hours (Weekly Templates)
// ============================================================================

const createDefaultShift = (start: string, end: string, breaks?: BreakRange[]): StaffShift => ({
  id: crypto.randomUUID(),
  start,
  end,
  breaks
})

export const mockStaffWorkingHours: Record<string, WeeklyStaffHours> = {
  // Staff member 1 - Full time (Mon-Fri, off weekends)
  '1': {
    Sun: { isWorking: false, shifts: [] },
    Mon: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '1', start: '12:00', end: '13:00' }])]
    },
    Tue: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '2', start: '12:00', end: '13:00' }])]
    },
    Wed: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '3', start: '12:00', end: '13:00' }])]
    },
    Thu: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '18:00', [{ id: '4', start: '12:00', end: '13:00' }])]
    },
    Fri: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '18:00', [{ id: '5', start: '12:00', end: '13:00' }])]
    },
    Sat: { isWorking: false, shifts: [] }
  },
  // Staff member 2 - Fitness instructor (Sun-Sat, flexible schedule)
  '2': {
    Sun: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '2-sun-break', start: '12:00', end: '13:00' }])]
    },
    Mon: {
      isWorking: true,
      shifts: [createDefaultShift('08:00', '20:00', [{ id: '2-mon-break', start: '12:00', end: '13:00' }])]
    },
    Tue: {
      isWorking: true,
      shifts: [createDefaultShift('14:00', '20:00')]
    },
    Wed: {
      isWorking: true,
      shifts: [createDefaultShift('14:00', '20:00')]
    },
    Thu: {
      isWorking: true,
      shifts: [createDefaultShift('10:00', '14:00'), createDefaultShift('16:00', '20:00')]
    },
    Fri: {
      isWorking: true,
      shifts: [createDefaultShift('14:00', '20:00')]
    },
    Sat: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '18:00', [{ id: '7', start: '13:00', end: '14:00' }])]
    }
  },
  // Staff member 3 - Weekend specialist (Fri-Sun only)
  '3': {
    Sun: {
      isWorking: true,
      shifts: [createDefaultShift('10:00', '17:00')]
    },
    Mon: { isWorking: false, shifts: [] },
    Tue: { isWorking: false, shifts: [] },
    Wed: { isWorking: false, shifts: [] },
    Thu: { isWorking: false, shifts: [] },
    Fri: {
      isWorking: true,
      shifts: [createDefaultShift('12:00', '20:00')]
    },
    Sat: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '18:00', [{ id: '8', start: '12:00', end: '13:00' }])]
    }
  },
  // Staff member 4 - Maria Garcia (Nail Technician)
  '4': {
    Sun: { isWorking: false, shifts: [] },
    Mon: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '9', start: '12:00', end: '13:00' }])]
    },
    Tue: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '10', start: '12:00', end: '13:00' }])]
    },
    Wed: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '11', start: '12:00', end: '13:00' }])]
    },
    Thu: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '18:00', [{ id: '12', start: '12:00', end: '13:00' }])]
    },
    Fri: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '18:00', [{ id: '13', start: '12:00', end: '13:00' }])]
    },
    Sat: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '16:00')]
    }
  },
  // Staff member 5 - James Mitchell (Master Barber)
  '5': {
    Sun: { isWorking: false, shifts: [] },
    Mon: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '19:00', [{ id: '14', start: '12:30', end: '13:30' }])]
    },
    Tue: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '19:00', [{ id: '15', start: '12:30', end: '13:30' }])]
    },
    Wed: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '19:00', [{ id: '16', start: '12:30', end: '13:30' }])]
    },
    Thu: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '20:00', [{ id: '17', start: '12:30', end: '13:30' }])]
    },
    Fri: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '20:00', [{ id: '18', start: '12:30', end: '13:30' }])]
    },
    Sat: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '18:00', [{ id: '19', start: '12:00', end: '13:00' }])]
    }
  },
  // Staff member 6 - David Brown (Barber)
  '6': {
    Sun: { isWorking: false, shifts: [] },
    Mon: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '20', start: '12:00', end: '13:00' }])]
    },
    Tue: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '21', start: '12:00', end: '13:00' }])]
    },
    Wed: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '22', start: '12:00', end: '13:00' }])]
    },
    Thu: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '23', start: '12:00', end: '13:00' }])]
    },
    Fri: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '24', start: '12:00', end: '13:00' }])]
    },
    Sat: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '16:00')]
    }
  },
  // Staff member 7 - Alex Thompson (Junior Stylist) - Part-time
  '7': {
    Sun: { isWorking: false, shifts: [] },
    Mon: { isWorking: false, shifts: [] },
    Tue: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '25', start: '12:00', end: '13:00' }])]
    },
    Wed: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '26', start: '12:00', end: '13:00' }])]
    },
    Thu: { isWorking: false, shifts: [] },
    Fri: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '17:00', [{ id: '27', start: '12:00', end: '13:00' }])]
    },
    Sat: {
      isWorking: true,
      shifts: [createDefaultShift('09:00', '16:00')]
    }
  }
}

// ============================================================================
// Time Reservations
// ============================================================================

export const mockTimeReservations: TimeReservation[] = [
  {
    id: 'res-1',
    staffIds: ['1'],
    roomIds: [],
    start: new Date(2025, 0, 15, 14, 0), // Jan 15, 2025, 2:00 PM
    end: new Date(2025, 0, 15, 15, 30), // Jan 15, 2025, 3:30 PM
    reason: 'Staff meeting',
    note: 'Monthly team meeting with management'
  },
  {
    id: 'res-2',
    staffIds: ['2'],
    roomIds: ['room-1-1-1'],
    start: new Date(2025, 0, 20, 10, 0), // Jan 20, 2025, 10:00 AM
    end: new Date(2025, 0, 20, 12, 0), // Jan 20, 2025, 12:00 PM
    reason: 'Training session',
    note: 'Product knowledge training'
  }
]

// ============================================================================
// Time Off Requests
// ============================================================================

export const mockTimeOffRequests: TimeOffRequest[] = [
  {
    id: 'off-1',
    staffId: '1',
    range: {
      start: new Date(2025, 0, 25), // Jan 25, 2025
      end: new Date(2025, 0, 27) // Jan 27, 2025
    },
    allDay: true,
    reason: 'Vacation',
    approved: true,
    note: 'Family trip'
  },
  {
    id: 'off-2',
    staffId: '2',
    range: {
      start: new Date(2025, 0, 20), // Jan 20, 2025
      end: new Date(2025, 0, 20) // Jan 20, 2025
    },
    allDay: true,
    reason: 'Sick',
    approved: true,
    note: 'Not feeling well'
  },
  {
    id: 'off-3',
    staffId: '2',
    range: {
      start: new Date(2025, 0, 18, 9, 0), // Jan 18, 2025, 9:00 AM
      end: new Date(2025, 0, 18, 13, 0) // Jan 18, 2025, 1:00 PM
    },
    allDay: false,
    reason: 'Personal',
    approved: true,
    note: 'Doctor appointment'
  },
  {
    id: 'off-4',
    staffId: '3',
    range: {
      start: new Date(2025, 0, 22), // Jan 22, 2025
      end: new Date(2025, 0, 22) // Same day
    },
    allDay: true,
    reason: 'Sick',
    approved: false,
    note: 'Not feeling well'
  }
]

// ============================================================================
// Resources (Equipment & Machines)
// ============================================================================

export const mockResources: Resource[] = [
  {
    id: 'res-1',
    branchId: '1-1',
    name: 'Styling Chair #1',
    capacity: 1
  },
  {
    id: 'res-2',
    branchId: '1-1',
    name: 'Styling Chair #2',
    capacity: 1
  },
  {
    id: 'res-3',
    branchId: '1-1',
    name: 'Hair Dryer Station #1',
    capacity: 1
  },
  {
    id: 'res-4',
    branchId: '1-1',
    name: 'Massage Chair #1',
    capacity: 1
  },
  {
    id: 'res-5',
    branchId: '1-2',
    name: 'Pedicure Chair #1',
    capacity: 1
  },
  {
    id: 'res-6',
    branchId: '1-2',
    name: 'Pedicure Chair #2',
    capacity: 1
  },
  {
    id: 'res-7',
    branchId: '2-1',
    name: 'Manicure Station #1',
    capacity: 1
  },
  {
    id: 'res-8',
    branchId: '2-1',
    name: 'Manicure Station #2',
    capacity: 1
  }
]

// ============================================================================
// Commission Policies
// ============================================================================

export const mockCommissionPolicies: CommissionPolicy[] = [
  {
    id: 'comm-1',
    scope: 'serviceCategory',
    scopeRefId: '1', // Hair category
    type: 'percent',
    value: 40,
    appliesTo: 'serviceProvider',
    staffScope: 'all'
  },
  {
    id: 'comm-2',
    scope: 'service',
    scopeRefId: '1', // Specific service
    type: 'percent',
    value: 50,
    appliesTo: 'serviceProvider',
    staffScope: { staffIds: ['1', '2'] }
  },
  {
    id: 'comm-3',
    scope: 'product',
    type: 'percent',
    value: 20,
    appliesTo: 'seller',
    staffScope: 'all'
  },
  {
    id: 'comm-4',
    scope: 'giftCard',
    type: 'fixed',
    value: 5,
    appliesTo: 'seller',
    staffScope: 'all'
  }
]

// ============================================================================
// Shift Rules
// ============================================================================

export const mockShiftRules: ShiftRuleSet = {
  duplication: {
    allowCopy: true,
    allowPrint: true
  },
  tutorialsSeen: false
}

// ============================================================================
// Helper Functions
// ============================================================================

export const getBusinessHoursForDay = (day: keyof WeeklyBusinessHours) => {
  return mockBusinessHours[day]
}

export const getStaffHoursForDay = (staffId: string, day: keyof WeeklyStaffHours) => {
  return mockStaffWorkingHours[staffId]?.[day] || { isWorking: false, shifts: [] }
}

export const getTimeReservationsForStaff = (staffId: string) => {
  return mockTimeReservations.filter(res => res.staffIds.includes(staffId))
}

export const getTimeOffForStaff = (staffId: string) => {
  return mockTimeOffRequests.filter(off => off.staffId === staffId)
}

export const getResourcesForBranch = (branchId: string) => {
  return mockResources.filter(res => res.branchId === branchId)
}

export const getCommissionForScope = (scope: CommissionPolicy['scope'], scopeRefId?: string) => {
  return mockCommissionPolicies.filter(comm => comm.scope === scope && (!scopeRefId || comm.scopeRefId === scopeRefId))
}

// ============================================================================
// Managed Rooms (with Schedules & Service Assignments)
// ============================================================================

const createRoomShift = (start: string, end: string, serviceIds: string[]): RoomShift => ({
  id: crypto.randomUUID(),
  start,
  end,
  serviceIds
})

export const mockManagedRooms: ManagedRoom[] = [
  // Main Studio - Luxe Hair Studio Oxford (1-1)
  {
    id: 'room-1',
    branchId: '1-1',
    name: 'Main Studio',
    capacity: 20,
    roomType: 'static',
    floor: '1st Floor',
    amenities: ['Air Conditioning', 'Mirrors', 'Sound System', 'WiFi'],
    color: '#0a2c24', // Dark Green - brand primary
    serviceIds: ['1', '2'], // Haircut & Style, Color Treatment
    weeklySchedule: {
      Sun: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '17:00', ['1'])] // Only haircuts on Sunday
      },
      Mon: {
        isAvailable: true,
        shifts: [
          createRoomShift('09:00', '12:00', ['1', '2']),
          createRoomShift('13:00', '19:00', ['1', '2', '3'])
        ]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['1', '2', '3'])]
      },
      Wed: {
        isAvailable: false,
        shifts: []
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['1', '2', '3'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [
          createRoomShift('09:00', '13:00', ['1', '3']),
          createRoomShift('14:00', '20:00', ['1', '2', '3'])
        ]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['1', '2', '3'])]
      }
    },
    shiftOverrides: [
      // Special override for a specific date
      {
        id: crypto.randomUUID(),
        date: '2025-12-01',
        start: '10:00',
        end: '16:00',
        serviceIds: ['1'],
        reason: 'manual'
      }
    ]
  },
  // Yoga Room - Luxe Hair Studio Oxford (1-1)
  {
    id: 'room-2',
    branchId: '1-1',
    name: 'Yoga Room',
    capacity: 20,
    roomType: 'static',
    floor: '2nd Floor',
    amenities: ['Air Conditioning', 'Yoga Mats', 'Mirrors', 'Sound System'],
    color: '#77b6a3', // Sage Green - brand accent
    serviceIds: ['fitness-1', 'fitness-2', 'fitness-3', 'fitness-4'], // Fitness classes
    weeklySchedule: {
      Sun: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '17:00', ['fitness-1', 'fitness-2'])]
      },
      Mon: {
        isAvailable: true,
        shifts: [createRoomShift('08:00', '21:00', ['fitness-1', 'fitness-2', 'fitness-3'])]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('08:00', '21:00', ['fitness-1', 'fitness-2', 'fitness-3'])]
      },
      Wed: {
        isAvailable: true,
        shifts: [createRoomShift('08:00', '21:00', ['fitness-4'])]
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('08:00', '21:00', ['fitness-1', 'fitness-2'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('08:00', '21:00', ['fitness-3'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['fitness-1', 'fitness-2'])]
      }
    },
    shiftOverrides: []
  },
  // Private Room - Luxe Hair Studio Oxford (1-1)
  {
    id: 'room-3',
    branchId: '1-1',
    name: 'Private Room',
    capacity: 5,
    roomType: 'static',
    floor: '1st Floor',
    amenities: ['Air Conditioning', 'Mirrors'],
    color: '#e88682', // Coral - brand accent
    serviceIds: ['2'], // Color Treatment only
    weeklySchedule: {
      Sun: {
        isAvailable: false,
        shifts: []
      },
      Mon: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['2'])]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['2'])]
      },
      Wed: {
        isAvailable: false,
        shifts: []
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['2'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['2'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '17:00', ['2'])]
      }
    },
    shiftOverrides: []
  },
  // Spin Studio - Luxe Hair Studio Soho (1-2)
  {
    id: 'room-4',
    branchId: '1-2',
    name: 'Spin Studio',
    capacity: 12,
    roomType: 'dynamic',
    floor: 'Ground Floor',
    amenities: ['Air Conditioning', 'Sound System', 'Lockers', 'Showers', 'WiFi'],
    color: '#51b4b7', // Teal - brand accent
    serviceIds: ['1', '3'], // Haircut & Highlights
    weeklySchedule: {
      Sun: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '16:00', ['1'])]
      },
      Mon: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['1', '3'])]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['1', '3'])]
      },
      Wed: {
        isAvailable: false,
        shifts: []
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['1', '3'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['1', '3'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['1', '3'])]
      }
    },
    shiftOverrides: []
  }
]

export const getRoomsForBranch = (branchId: string) => {
  return mockManagedRooms.filter(room => room.branchId === branchId)
}

// ============================================================================
// Room Session Bookings (Mock Appointment Data for Rooms)
// ============================================================================

export interface RoomSessionBooking {
  id: string
  roomId: string
  date: string // YYYY-MM-DD format
  shiftStartTime: string // HH:MM format
  shiftEndTime: string // HH:MM format
  bookedSpots: number
  capacity: number
  bookings: {
    id: string
    customerName: string
    status: 'confirmed' | 'attended' | 'no_show' | 'cancelled'
  }[]
}

// Mock bookings for this week and next week
const today = new Date()
const getDateString = (daysOffset: number = 0): string => {
  const date = new Date(today)
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

export const mockRoomSessionBookings: RoomSessionBooking[] = [
  // Main Studio (room-1) - Static room bookings for this week
  {
    id: 'rsb-1',
    roomId: 'room-1',
    date: getDateString(1), // Tomorrow
    shiftStartTime: '09:00',
    shiftEndTime: '12:00',
    bookedSpots: 15,
    capacity: 20,
    bookings: [
      { id: 'b1', customerName: 'Alice Johnson', status: 'confirmed' },
      { id: 'b2', customerName: 'Bob Smith', status: 'confirmed' },
      { id: 'b3', customerName: 'Carol White', status: 'confirmed' },
      { id: 'b4', customerName: 'David Brown', status: 'confirmed' },
      { id: 'b5', customerName: 'Emma Davis', status: 'confirmed' },
      // ... 10 more (15 total)
    ]
  },
  {
    id: 'rsb-2',
    roomId: 'room-1',
    date: getDateString(1),
    shiftStartTime: '13:00',
    shiftEndTime: '19:00',
    bookedSpots: 18,
    capacity: 20,
    bookings: [
      { id: 'b6', customerName: 'Frank Miller', status: 'confirmed' },
      { id: 'b7', customerName: 'Grace Lee', status: 'confirmed' },
      // ... 16 more (18 total)
    ]
  },
  {
    id: 'rsb-3',
    roomId: 'room-1',
    date: getDateString(2), // 2 days from now
    shiftStartTime: '09:00',
    shiftEndTime: '19:00',
    bookedSpots: 12,
    capacity: 20,
    bookings: []
  },
  {
    id: 'rsb-4',
    roomId: 'room-1',
    date: getDateString(4), // 4 days from now (Thu)
    shiftStartTime: '09:00',
    shiftEndTime: '20:00',
    bookedSpots: 20,
    capacity: 20,
    bookings: [] // Fully booked!
  },
  {
    id: 'rsb-5',
    roomId: 'room-1',
    date: getDateString(5), // Friday
    shiftStartTime: '09:00',
    shiftEndTime: '13:00',
    bookedSpots: 8,
    capacity: 20,
    bookings: []
  },
  {
    id: 'rsb-6',
    roomId: 'room-1',
    date: getDateString(5),
    shiftStartTime: '14:00',
    shiftEndTime: '20:00',
    bookedSpots: 16,
    capacity: 20,
    bookings: []
  },

  // Yoga Room (room-2) - Fitness class bookings
  {
    id: 'rsb-7',
    roomId: 'room-2',
    date: getDateString(1), // Tomorrow (Mon)
    shiftStartTime: '08:00',
    shiftEndTime: '21:00',
    bookedSpots: 17,
    capacity: 20,
    bookings: [
      { id: 'yb1', customerName: 'Hannah Green', status: 'confirmed' },
      { id: 'yb2', customerName: 'Ian Black', status: 'confirmed' },
      // ... 15 more (17 total)
    ]
  },
  {
    id: 'rsb-8',
    roomId: 'room-2',
    date: getDateString(2), // Tuesday
    shiftStartTime: '08:00',
    shiftEndTime: '21:00',
    bookedSpots: 19,
    capacity: 20,
    bookings: [] // Almost full!
  },
  {
    id: 'rsb-9',
    roomId: 'room-2',
    date: getDateString(4), // Thursday
    shiftStartTime: '08:00',
    shiftEndTime: '21:00',
    bookedSpots: 14,
    capacity: 20,
    bookings: []
  },
  {
    id: 'rsb-10',
    roomId: 'room-2',
    date: getDateString(5), // Friday
    shiftStartTime: '08:00',
    shiftEndTime: '21:00',
    bookedSpots: 11,
    capacity: 20,
    bookings: []
  },
  {
    id: 'rsb-11',
    roomId: 'room-2',
    date: getDateString(6), // Saturday
    shiftStartTime: '09:00',
    shiftEndTime: '18:00',
    bookedSpots: 20,
    capacity: 20,
    bookings: [] // Fully booked weekend!
  },

  // Past sessions with attendance data (yesterday)
  {
    id: 'rsb-past-1',
    roomId: 'room-1',
    date: getDateString(-1), // Yesterday
    shiftStartTime: '09:00',
    shiftEndTime: '19:00',
    bookedSpots: 16,
    capacity: 20,
    bookings: [
      { id: 'pb1', customerName: 'Past Customer 1', status: 'attended' },
      { id: 'pb2', customerName: 'Past Customer 2', status: 'attended' },
      { id: 'pb3', customerName: 'Past Customer 3', status: 'attended' },
      { id: 'pb4', customerName: 'Past Customer 4', status: 'no_show' },
      { id: 'pb5', customerName: 'Past Customer 5', status: 'no_show' },
      // ... more
    ]
  },
  {
    id: 'rsb-past-2',
    roomId: 'room-2',
    date: getDateString(-1), // Yesterday
    shiftStartTime: '08:00',
    shiftEndTime: '21:00',
    bookedSpots: 18,
    capacity: 20,
    bookings: [
      { id: 'pyb1', customerName: 'Yoga Student 1', status: 'attended' },
      { id: 'pyb2', customerName: 'Yoga Student 2', status: 'attended' },
      { id: 'pyb3', customerName: 'Yoga Student 3', status: 'attended' },
      { id: 'pyb4', customerName: 'Yoga Student 4', status: 'attended' },
      { id: 'pyb5', customerName: 'Yoga Student 5', status: 'no_show' },
      // ... more (total 18, with 16 attended, 2 no-show)
    ]
  }
]

// Helper to get bookings for a specific room on a specific date
export const getRoomBookingsForDate = (roomId: string, date: string): RoomSessionBooking[] => {
  return mockRoomSessionBookings.filter(booking => booking.roomId === roomId && booking.date === date)
}

// Helper to get booking count for a specific shift
export const getShiftBookingCount = (
  roomId: string,
  date: string,
  shiftStart: string,
  shiftEnd: string
): { bookedSpots: number; capacity: number; percentage: number } | null => {
  const booking = mockRoomSessionBookings.find(
    b =>
      b.roomId === roomId && b.date === date && b.shiftStartTime === shiftStart && b.shiftEndTime === shiftEnd
  )

  if (!booking) {
    return null
  }

  return {
    bookedSpots: booking.bookedSpots,
    capacity: booking.capacity,
    percentage: Math.round((booking.bookedSpots / booking.capacity) * 100)
  }
}

// ============================================================================
// Staff Session Bookings (Mock appointment data for staff shifts)
// ============================================================================

export interface StaffSessionBooking {
  id: string
  staffId: string
  date: string // YYYY-MM-DD format
  shiftStartTime: string // HH:MM format
  shiftEndTime: string // HH:MM format
  bookedSlots: number
  totalCapacity: number
  appointments: {
    id: string
    customerName: string
    serviceName: string
    startTime: string
    endTime: string
    status: 'confirmed' | 'attended' | 'no_show' | 'cancelled'
  }[]
}

export const mockStaffSessionBookings: StaffSessionBooking[] = [
  // Emma Johnson (staff-1) - Hair stylist with high bookings
  {
    id: 'ssb-1',
    staffId: '1',
    date: getDateString(1), // Tomorrow (Mon)
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    bookedSlots: 7,
    totalCapacity: 8,
    appointments: [
      { id: 'apt-1', customerName: 'Alice Brown', serviceName: 'Haircut & Style', startTime: '09:00', endTime: '10:00', status: 'confirmed' },
      { id: 'apt-2', customerName: 'Bob Smith', serviceName: 'Color Treatment', startTime: '10:00', endTime: '12:00', status: 'confirmed' },
      { id: 'apt-3', customerName: 'Carol White', serviceName: 'Haircut', startTime: '12:00', endTime: '13:00', status: 'confirmed' },
      { id: 'apt-4', customerName: 'David Lee', serviceName: 'Haircut & Style', startTime: '13:00', endTime: '14:00', status: 'confirmed' },
      { id: 'apt-5', customerName: 'Eve Martinez', serviceName: 'Highlights', startTime: '14:00', endTime: '16:00', status: 'confirmed' },
      { id: 'apt-6', customerName: 'Frank Chen', serviceName: 'Haircut', startTime: '16:00', endTime: '17:00', status: 'confirmed' }
    ]
  },
  {
    id: 'ssb-2',
    staffId: '1',
    date: getDateString(2), // Tuesday
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    bookedSlots: 8,
    totalCapacity: 8,
    appointments: [] // Fully booked!
  },
  {
    id: 'ssb-3',
    staffId: '1',
    date: getDateString(3), // Wednesday
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    bookedSlots: 5,
    totalCapacity: 8,
    appointments: []
  },
  {
    id: 'ssb-4',
    staffId: '1',
    date: getDateString(4), // Thursday
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    bookedSlots: 6,
    totalCapacity: 8,
    appointments: []
  },

  // Sarah Williams (staff-2) - Senior stylist
  {
    id: 'ssb-5',
    staffId: '2',
    date: getDateString(1),
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    bookedSlots: 6,
    totalCapacity: 8,
    appointments: []
  },
  {
    id: 'ssb-6',
    staffId: '2',
    date: getDateString(2),
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    bookedSlots: 7,
    totalCapacity: 8,
    appointments: []
  },

  // Michael Chen (staff-3) - Nail technician
  {
    id: 'ssb-7',
    staffId: '3',
    date: getDateString(1),
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    bookedSlots: 4,
    totalCapacity: 6,
    appointments: [
      { id: 'nail-1', customerName: 'Julia Roberts', serviceName: 'Manicure', startTime: '09:00', endTime: '10:00', status: 'confirmed' },
      { id: 'nail-2', customerName: 'Kate Hudson', serviceName: 'Pedicure', startTime: '10:30', endTime: '11:30', status: 'confirmed' },
      { id: 'nail-3', customerName: 'Laura Dean', serviceName: 'Gel Nails', startTime: '12:00', endTime: '13:30', status: 'confirmed' },
      { id: 'nail-4', customerName: 'Maria Garcia', serviceName: 'Manicure', startTime: '14:00', endTime: '15:00', status: 'confirmed' }
    ]
  },

  // Alex Thompson (staff-7) - Flexible stylist
  {
    id: 'ssb-8',
    staffId: '7',
    date: getDateString(1),
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    bookedSlots: 3,
    totalCapacity: 8,
    appointments: []
  },

  // Gym trainers - Lisa Anderson (staff-9) - Personal trainer
  {
    id: 'ssb-9',
    staffId: '9',
    date: getDateString(1),
    shiftStartTime: '06:00',
    shiftEndTime: '14:00',
    bookedSlots: 6,
    totalCapacity: 8,
    appointments: [
      { id: 'pt-1', customerName: 'Athlete 1', serviceName: 'Personal Training', startTime: '06:00', endTime: '07:00', status: 'confirmed' },
      { id: 'pt-2', customerName: 'Athlete 2', serviceName: 'Personal Training', startTime: '07:00', endTime: '08:00', status: 'confirmed' },
      { id: 'pt-3', customerName: 'Athlete 3', serviceName: 'Personal Training', startTime: '09:00', endTime: '10:00', status: 'confirmed' },
      { id: 'pt-4', customerName: 'Athlete 4', serviceName: 'Personal Training', startTime: '10:00', endTime: '11:00', status: 'confirmed' },
      { id: 'pt-5', customerName: 'Athlete 5', serviceName: 'Personal Training', startTime: '12:00', endTime: '13:00', status: 'confirmed' },
      { id: 'pt-6', customerName: 'Athlete 6', serviceName: 'Personal Training', startTime: '13:00', endTime: '14:00', status: 'confirmed' }
    ]
  },
  {
    id: 'ssb-10',
    staffId: '9',
    date: getDateString(2),
    shiftStartTime: '06:00',
    shiftEndTime: '14:00',
    bookedSlots: 7,
    totalCapacity: 8,
    appointments: []
  },

  // Past session with attendance data
  {
    id: 'ssb-11',
    staffId: '1',
    date: getDateString(-1), // Yesterday
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    bookedSlots: 7,
    totalCapacity: 8,
    appointments: [
      { id: 'past-1', customerName: 'Past Client 1', serviceName: 'Haircut', startTime: '09:00', endTime: '10:00', status: 'attended' },
      { id: 'past-2', customerName: 'Past Client 2', serviceName: 'Color', startTime: '10:00', endTime: '12:00', status: 'attended' },
      { id: 'past-3', customerName: 'Past Client 3', serviceName: 'Haircut', startTime: '12:00', endTime: '13:00', status: 'attended' },
      { id: 'past-4', customerName: 'Past Client 4', serviceName: 'Haircut', startTime: '13:00', endTime: '14:00', status: 'attended' },
      { id: 'past-5', customerName: 'Past Client 5', serviceName: 'Style', startTime: '14:00', endTime: '15:00', status: 'attended' },
      { id: 'past-6', customerName: 'Past Client 6', serviceName: 'Haircut', startTime: '15:00', endTime: '16:00', status: 'no_show' },
      { id: 'past-7', customerName: 'Past Client 7', serviceName: 'Haircut', startTime: '16:00', endTime: '17:00', status: 'attended' }
    ]
  }
]

// Helper to get staff bookings for a specific date
export const getStaffBookingsForDate = (staffId: string, date: string): StaffSessionBooking[] => {
  return mockStaffSessionBookings.filter(booking => booking.staffId === staffId && booking.date === date)
}

// Helper to get booking count for a specific staff shift
export const getStaffShiftBookingCount = (
  staffId: string,
  date: string,
  shiftStart: string,
  shiftEnd: string
): { bookedSlots: number; totalCapacity: number; percentage: number } | null => {
  const booking = mockStaffSessionBookings.find(
    b =>
      b.staffId === staffId && b.date === date && b.shiftStartTime === shiftStart && b.shiftEndTime === shiftEnd
  )

  if (!booking) {
    return null
  }

  return {
    bookedSlots: booking.bookedSlots,
    totalCapacity: booking.totalCapacity,
    percentage: Math.round((booking.bookedSlots / booking.totalCapacity) * 100)
  }
}

// ============================================================================
// Staff Service Assignments (Initial Mock Data)
// ============================================================================

export const mockStaffServiceAssignments: Record<string, string[]> = {
  // Luxe Hair Studio staff
  '1': ['1', '2', '3'], // Emma Johnson - All hair services
  '2': ['1', '2', '3'], // Sarah Williams - All hair services
  '7': ['1'], // Alex Thompson - Basic haircuts only

  // Bliss Nail Bar staff
  '3': ['4', '5'], // Lisa Chen - All nail services
  '4': ['4', '5'], // Maria Garcia - All nail services

  // Urban Barber staff
  '5': ['6', '7'], // James Mitchell - All barber services
  '6': ['6'], // David Brown - Classic cuts only
}
