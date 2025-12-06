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
  // Staff member 2 - Part time (Tue-Sat, off Sun-Mon)
  '2': {
    Sun: { isWorking: false, shifts: [] },
    Mon: { isWorking: false, shifts: [] },
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
    staffId: '1',
    start: new Date(2025, 0, 15, 14, 0), // Jan 15, 2025, 2:00 PM
    end: new Date(2025, 0, 15, 15, 30), // Jan 15, 2025, 3:30 PM
    reason: 'Staff meeting',
    note: 'Monthly team meeting with management'
  },
  {
    id: 'res-2',
    staffId: '2',
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
      start: new Date(), // Today
      end: new Date() // Today
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
  return mockTimeReservations.filter(res => res.staffId === staffId)
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
    floor: '1st Floor',
    amenities: ['Air Conditioning', 'Mirrors', 'Sound System', 'WiFi'],
    color: '#1976d2',
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
    capacity: 15,
    floor: '2nd Floor',
    amenities: ['Air Conditioning', 'Yoga Mats', 'Mirrors', 'Sound System'],
    color: '#388e3c',
    serviceIds: ['3'], // Highlights only
    weeklySchedule: {
      Sun: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '17:00', ['3'])]
      },
      Mon: {
        isAvailable: true,
        shifts: [
          createRoomShift('09:00', '12:00', ['3']),
          createRoomShift('14:00', '18:00', ['3'])
        ]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['3'])]
      },
      Wed: {
        isAvailable: false,
        shifts: []
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['3'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['3'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['3'])]
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
    floor: '1st Floor',
    amenities: ['Air Conditioning', 'Mirrors'],
    color: '#d32f2f',
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
    floor: 'Ground Floor',
    amenities: ['Air Conditioning', 'Sound System', 'Lockers', 'Showers', 'WiFi'],
    color: '#f57c00',
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
  },
  // Nail Station 1 - Bliss Nail Bar King's Road (2-1)
  {
    id: 'room-5',
    branchId: '2-1',
    name: 'Station 1',
    capacity: 1,
    floor: 'Main Floor',
    amenities: ['UV Lamp', 'Massage Chair', 'Music'],
    color: '#e91e63',
    serviceIds: ['4'], // Gel Manicure
    weeklySchedule: {
      Sun: {
        isAvailable: true,
        shifts: [createRoomShift('11:00', '18:00', ['4'])]
      },
      Mon: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['4'])]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['4'])]
      },
      Wed: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['4'])]
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '21:00', ['4'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '21:00', ['4'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['4'])]
      }
    },
    shiftOverrides: []
  },
  // Nail Station 2 - Bliss Nail Bar King's Road (2-1)
  {
    id: 'room-6',
    branchId: '2-1',
    name: 'Station 2',
    capacity: 1,
    floor: 'Main Floor',
    amenities: ['UV Lamp', 'Massage Chair', 'Music'],
    color: '#9c27b0',
    serviceIds: ['5'], // Luxury Pedicure
    weeklySchedule: {
      Sun: {
        isAvailable: true,
        shifts: [createRoomShift('11:00', '18:00', ['5'])]
      },
      Mon: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['5'])]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['5'])]
      },
      Wed: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['5'])]
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '21:00', ['5'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '21:00', ['5'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['5'])]
      }
    },
    shiftOverrides: []
  },
  // Barber Chair 1 - Urban Barber Shoreditch (3-1)
  {
    id: 'room-7',
    branchId: '3-1',
    name: 'Chair 1',
    capacity: 1,
    floor: 'Ground Floor',
    amenities: ['Hot Towel Station', 'Shaving Tools', 'Music'],
    color: '#795548',
    serviceIds: ['6', '7'], // Classic Cut & Hot Towel Shave
    weeklySchedule: {
      Sun: {
        isAvailable: false,
        shifts: []
      },
      Mon: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['6', '7'])]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['6', '7'])]
      },
      Wed: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['6', '7'])]
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['6', '7'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['6', '7'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['6', '7'])]
      }
    },
    shiftOverrides: []
  },
  // Barber Chair 2 - Urban Barber Brixton (3-2)
  {
    id: 'room-8',
    branchId: '3-2',
    name: 'Chair 2',
    capacity: 1,
    floor: 'Ground Floor',
    amenities: ['Hot Towel Station', 'Shaving Tools', 'Music'],
    color: '#607d8b',
    serviceIds: ['6'], // Classic Cut only
    weeklySchedule: {
      Sun: {
        isAvailable: false,
        shifts: []
      },
      Mon: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['6'])]
      },
      Tue: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['6'])]
      },
      Wed: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '19:00', ['6'])]
      },
      Thu: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['6'])]
      },
      Fri: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '20:00', ['6'])]
      },
      Sat: {
        isAvailable: true,
        shifts: [createRoomShift('09:00', '18:00', ['6'])]
      }
    },
    shiftOverrides: [
      // Example: Room closed for maintenance on a specific date
      {
        id: crypto.randomUUID(),
        date: '2025-12-10',
        start: '08:00',
        end: '12:00',
        serviceIds: [],
        reason: 'manual'
      }
    ]
  }
]

export const getRoomsForBranch = (branchId: string) => {
  return mockManagedRooms.filter(room => room.branchId === branchId)
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
