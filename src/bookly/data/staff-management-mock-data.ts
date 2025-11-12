import type {
  WeeklyBusinessHours,
  WeeklyStaffHours,
  TimeReservation,
  TimeOffRequest,
  Resource,
  CommissionPolicy,
  ShiftRuleSet,
  StaffShift,
  BreakRange
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
    shifts: [{ start: '08:00', end: '18:00' }]
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
  // Staff member 1 - Full time
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
    Sat: {
      isWorking: true,
      shifts: [createDefaultShift('08:00', '16:00', [{ id: '6', start: '12:00', end: '12:30' }])]
    }
  },
  // Staff member 2 - Part time with split shift
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
  // Staff member 3 - Weekend specialist
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
      shifts: [createDefaultShift('08:00', '18:00', [{ id: '8', start: '12:00', end: '13:00' }])]
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
// Resources (Rooms/Facilities)
// ============================================================================

export const mockResources: Resource[] = [
  {
    id: 'room-1',
    branchId: '1-1',
    name: 'Main Studio',
    capacity: 20,
    floor: '1st Floor',
    amenities: ['Air Conditioning', 'Mirrors', 'Sound System', 'WiFi'],
    color: '#1976d2'
  },
  {
    id: 'room-2',
    branchId: '1-1',
    name: 'Yoga Room',
    capacity: 15,
    floor: '2nd Floor',
    amenities: ['Air Conditioning', 'Yoga Mats', 'Mirrors', 'Sound System'],
    color: '#388e3c'
  },
  {
    id: 'room-3',
    branchId: '1-1',
    name: 'Private Room',
    capacity: 5,
    floor: '1st Floor',
    amenities: ['Air Conditioning', 'Mirrors'],
    color: '#d32f2f'
  },
  {
    id: 'room-4',
    branchId: '1-2',
    name: 'Spin Studio',
    capacity: 12,
    floor: 'Ground Floor',
    amenities: ['Air Conditioning', 'Sound System', 'Lockers', 'Showers', 'WiFi'],
    color: '#f57c00'
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
