import { create } from 'zustand'
import {
  mockBusinessHours,
  mockStaffWorkingHours,
  mockTimeReservations,
  mockTimeOffRequests,
  mockResources,
  mockCommissionPolicies,
  mockShiftRules
} from '@/bookly/data/staff-management-mock-data'
import { mockStaff } from '@/bookly/data/mock-data'
import type {
  WeeklyBusinessHours,
  WeeklyStaffHours,
  TimeReservation,
  TimeOffRequest,
  Resource,
  CommissionPolicy,
  ShiftRuleSet,
  StaffShift,
  StaffShiftInstance,
  DayOfWeek
} from '../calendar/types'

// Helper to sync changes with calendar
function syncWithCalendar() {
  // Use dynamic import to avoid circular dependency
  import('../calendar/state').then(({ useCalendarStore }) => {
    useCalendarStore.getState().syncStaffManagementData()
  }).catch(() => {
    // Silently fail if calendar store is not available
  })
}

// ============================================================================
// Staff Management State
// ============================================================================

export interface StaffManagementState {
  // Business hours
  businessHours: WeeklyBusinessHours

  // Staff data
  staffWorkingHours: Record<string, WeeklyStaffHours>
  staffServiceAssignments: Record<string, string[]>  // staffId -> serviceIds[]

  // Time management
  timeReservations: TimeReservation[]
  timeOffRequests: TimeOffRequest[]
  shiftOverrides: Record<string, StaffShiftInstance[]>  // staffId -> overrides[]

  // Resources
  resources: Resource[]

  // Commissions
  commissionPolicies: CommissionPolicy[]

  // UI State
  selectedStaffId: string | null
  isEditServicesOpen: boolean
  isShiftEditorOpen: boolean
  isTimeReservationOpen: boolean
  isTimeOffOpen: boolean
  isResourceEditorOpen: boolean
  isCommissionEditorOpen: boolean
  shiftRules: ShiftRuleSet

  // Actions - Business Hours
  updateBusinessHours: (day: DayOfWeek, hours: WeeklyBusinessHours[DayOfWeek]) => void
  getBusinessHours: (day: DayOfWeek) => WeeklyBusinessHours[DayOfWeek]

  // Actions - Staff Working Hours
  updateStaffWorkingHours: (staffId: string, day: DayOfWeek, hours: WeeklyStaffHours[DayOfWeek]) => void
  getStaffWorkingHours: (staffId: string, day: DayOfWeek) => WeeklyStaffHours[DayOfWeek]
  getStaffShiftForDate: (staffId: string, date: string) => StaffShift | null
  updateShiftInstance: (staffId: string, shift: StaffShiftInstance) => void
  duplicateShifts: (staffId: string, fromDate: string, toRange: { start: string; end: string }) => void
  addBreak: (staffId: string, shiftId: string, breakRange: { start: string; end: string }) => void
  removeBreak: (staffId: string, shiftId: string, breakId: string) => void

  // Actions - Service Assignments
  assignServicesToStaff: (staffId: string, serviceIds: string[]) => void
  getStaffServices: (staffId: string) => string[]

  // Actions - Time Reservations
  createTimeReservation: (reservation: Omit<TimeReservation, 'id'>) => void
  updateTimeReservation: (id: string, updates: Partial<TimeReservation>) => void
  deleteTimeReservation: (id: string) => void
  getTimeReservationsForStaff: (staffId: string) => TimeReservation[]

  // Actions - Time Off
  createTimeOff: (request: Omit<TimeOffRequest, 'id'>) => void
  updateTimeOff: (id: string, updates: Partial<TimeOffRequest>) => void
  deleteTimeOff: (id: string) => void
  toggleApproval: (id: string) => void
  getTimeOffForStaff: (staffId: string) => TimeOffRequest[]

  // Actions - Resources
  createResource: (resource: Omit<Resource, 'id'>) => void
  updateResource: (id: string, updates: Partial<Resource>) => void
  deleteResource: (id: string) => void
  getResourcesForBranch: (branchId: string) => Resource[]

  // Actions - Commissions
  createCommissionPolicy: (policy: Omit<CommissionPolicy, 'id'>) => void
  updateCommissionPolicy: (id: string, updates: Partial<CommissionPolicy>) => void
  deleteCommissionPolicy: (id: string) => void
  getCommissionPolicies: (scope?: CommissionPolicy['scope']) => CommissionPolicy[]

  // Actions - Staff Management
  createStaffMember: (staffData: any) => void

  // Actions - UI
  selectStaff: (staffId: string | null) => void
  openEditServices: () => void
  closeEditServices: () => void
  openShiftEditor: () => void
  closeShiftEditor: () => void
  openTimeReservation: () => void
  closeTimeReservation: () => void
  toggleTimeReservation: () => void
  openTimeOff: () => void
  closeTimeOff: () => void
  toggleTimeOff: () => void
  openResourceEditor: () => void
  closeResourceEditor: () => void
  openCommissionEditor: () => void
  closeCommissionEditor: () => void
  markTutorialSeen: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useStaffManagementStore = create<StaffManagementState>((set, get) => ({
  // Initial State
  businessHours: mockBusinessHours,
  staffWorkingHours: mockStaffWorkingHours,
  staffServiceAssignments: {},
  timeReservations: mockTimeReservations,
  timeOffRequests: mockTimeOffRequests,
  shiftOverrides: {},
  resources: mockResources,
  commissionPolicies: mockCommissionPolicies,
  selectedStaffId: null,
  isEditServicesOpen: false,
  isShiftEditorOpen: false,
  isTimeReservationOpen: false,
  isTimeOffOpen: false,
  isResourceEditorOpen: false,
  isCommissionEditorOpen: false,
  shiftRules: mockShiftRules,

  // Business Hours Actions
  updateBusinessHours: (day, hours) => {
    set(state => ({
      businessHours: {
        ...state.businessHours,
        [day]: hours
      }
    }))
  },

  getBusinessHours: (day) => {
    return get().businessHours[day]
  },

  // Staff Working Hours Actions
  updateStaffWorkingHours: (staffId, day, hours) => {
    set(state => ({
      staffWorkingHours: {
        ...state.staffWorkingHours,
        [staffId]: {
          ...state.staffWorkingHours[staffId],
          [day]: hours
        }
      }
    }))
  },

  getStaffWorkingHours: (staffId, day) => {
    const staffHours = get().staffWorkingHours[staffId]
    if (!staffHours || !staffHours[day]) {
      return { isWorking: false, shifts: [] }
    }
    return staffHours[day]
  },

  getStaffShiftForDate: (staffId, date) => {
    // Check for override first
    const overrides = get().shiftOverrides[staffId] || []
    const override = overrides.find(o => o.date === date)
    if (override) {
      return override
    }

    // Fall back to weekly template
    const dateObj = new Date(date)
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const day = dayNames[dateObj.getDay()]

    const dayHours = get().getStaffWorkingHours(staffId, day)
    return dayHours.shifts[0] || null
  },

  updateShiftInstance: (staffId, shift) => {
    set(state => {
      const overrides = state.shiftOverrides[staffId] || []
      const existingIndex = overrides.findIndex(o => o.date === shift.date)

      let newOverrides
      if (existingIndex >= 0) {
        newOverrides = [...overrides]
        newOverrides[existingIndex] = shift
      } else {
        newOverrides = [...overrides, shift]
      }

      return {
        shiftOverrides: {
          ...state.shiftOverrides,
          [staffId]: newOverrides
        }
      }
    })
  },

  duplicateShifts: (staffId, fromDate, toRange) => {
    const sourceShift = get().getStaffShiftForDate(staffId, fromDate)
    if (!sourceShift) return

    const start = new Date(toRange.start)
    const end = new Date(toRange.end)
    const newOverrides: StaffShiftInstance[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      newOverrides.push({
        ...sourceShift,
        date: dateStr,
        reason: 'copy'
      })
    }

    set(state => ({
      shiftOverrides: {
        ...state.shiftOverrides,
        [staffId]: [...(state.shiftOverrides[staffId] || []), ...newOverrides]
      }
    }))
  },

  addBreak: (staffId, shiftId, breakRange) => {
    // Implementation for adding break to a shift
    set(state => {
      const staffHours = state.staffWorkingHours[staffId]
      // Add break logic here
      return state
    })
  },

  removeBreak: (staffId, shiftId, breakId) => {
    // Implementation for removing break from a shift
    set(state => {
      const staffHours = state.staffWorkingHours[staffId]
      // Remove break logic here
      return state
    })
  },

  // Service Assignment Actions
  assignServicesToStaff: (staffId, serviceIds) => {
    set(state => ({
      staffServiceAssignments: {
        ...state.staffServiceAssignments,
        [staffId]: serviceIds
      }
    }))
  },

  getStaffServices: (staffId) => {
    return get().staffServiceAssignments[staffId] || []
  },

  // Time Reservation Actions
  createTimeReservation: (reservation) => {
    set(state => ({
      timeReservations: [
        ...state.timeReservations,
        { ...reservation, id: `res-${Date.now()}` }
      ]
    }))
    syncWithCalendar()
  },

  updateTimeReservation: (id, updates) => {
    set(state => ({
      timeReservations: state.timeReservations.map(res =>
        res.id === id ? { ...res, ...updates } : res
      )
    }))
    syncWithCalendar()
  },

  deleteTimeReservation: (id) => {
    set(state => ({
      timeReservations: state.timeReservations.filter(res => res.id !== id)
    }))
    syncWithCalendar()
  },

  getTimeReservationsForStaff: (staffId) => {
    return get().timeReservations.filter(res => res.staffId === staffId)
  },

  // Time Off Actions
  createTimeOff: (request) => {
    const newRequest: TimeOffRequest = {
      ...request,
      id: `off-${Date.now()}`
    }

    // Handle repeat logic
    if (request.repeat) {
      const requests: TimeOffRequest[] = [newRequest]
      const start = new Date(request.range.start)
      const until = new Date(request.repeat.until)

      for (let d = new Date(start); d <= until; d.setDate(d.getDate() + 1)) {
        if (d.getTime() === start.getTime()) continue // Skip first day (already added)

        const end = new Date(d)
        end.setHours(request.range.end.getHours())
        end.setMinutes(request.range.end.getMinutes())

        requests.push({
          ...request,
          id: `off-${Date.now()}-${d.getTime()}`,
          range: { start: new Date(d), end }
        })
      }

      set(state => ({
        timeOffRequests: [...state.timeOffRequests, ...requests]
      }))
    } else {
      set(state => ({
        timeOffRequests: [...state.timeOffRequests, newRequest]
      }))
    }
    syncWithCalendar()
  },

  updateTimeOff: (id, updates) => {
    set(state => ({
      timeOffRequests: state.timeOffRequests.map(req =>
        req.id === id ? { ...req, ...updates } : req
      )
    }))
    syncWithCalendar()
  },

  deleteTimeOff: (id) => {
    set(state => ({
      timeOffRequests: state.timeOffRequests.filter(req => req.id !== id)
    }))
    syncWithCalendar()
  },

  toggleApproval: (id) => {
    set(state => ({
      timeOffRequests: state.timeOffRequests.map(req =>
        req.id === id ? { ...req, approved: !req.approved } : req
      )
    }))
    syncWithCalendar()
  },

  getTimeOffForStaff: (staffId) => {
    return get().timeOffRequests.filter(req => req.staffId === staffId)
  },

  // Resource Actions
  createResource: (resource) => {
    set(state => ({
      resources: [...state.resources, { ...resource, id: `room-${Date.now()}` }]
    }))
  },

  updateResource: (id, updates) => {
    set(state => ({
      resources: state.resources.map(res =>
        res.id === id ? { ...res, ...updates } : res
      )
    }))
  },

  deleteResource: (id) => {
    set(state => ({
      resources: state.resources.filter(res => res.id !== id)
    }))
  },

  getResourcesForBranch: (branchId) => {
    return get().resources.filter(res => res.branchId === branchId)
  },

  // Commission Actions
  createCommissionPolicy: (policy) => {
    set(state => ({
      commissionPolicies: [...state.commissionPolicies, { ...policy, id: `comm-${Date.now()}` }]
    }))
  },

  updateCommissionPolicy: (id, updates) => {
    set(state => ({
      commissionPolicies: state.commissionPolicies.map(pol =>
        pol.id === id ? { ...pol, ...updates } : pol
      )
    }))
  },

  deleteCommissionPolicy: (id) => {
    set(state => ({
      commissionPolicies: state.commissionPolicies.filter(pol => pol.id !== id)
    }))
  },

  getCommissionPolicies: (scope) => {
    const policies = get().commissionPolicies
    return scope ? policies.filter(p => p.scope === scope) : policies
  },

  // Staff Management Actions
  createStaffMember: (staffData) => {
    const newStaffId = `staff-${Date.now()}`

    // Initialize staff working hours (all days off by default)
    const defaultWorkingHours: WeeklyStaffHours = {
      Sun: { isWorking: false, shifts: [] },
      Mon: { isWorking: false, shifts: [] },
      Tue: { isWorking: false, shifts: [] },
      Wed: { isWorking: false, shifts: [] },
      Thu: { isWorking: false, shifts: [] },
      Fri: { isWorking: false, shifts: [] },
      Sat: { isWorking: false, shifts: [] }
    }

    set(state => ({
      staffWorkingHours: {
        ...state.staffWorkingHours,
        [newStaffId]: defaultWorkingHours
      }
    }))

    // Add to mockStaff array (in a real app, this would be an API call)
    mockStaff.push({
      id: newStaffId,
      name: staffData.name,
      title: staffData.title,
      email: staffData.email,
      phone: staffData.phone,
      photo: staffData.photo,
      color: staffData.color,
      branchId: staffData.branchId,
      isActive: staffData.isActive
    })

    console.log('Created new staff member:', { id: newStaffId, ...staffData })
  },

  // UI Actions
  selectStaff: (staffId) => set({ selectedStaffId: staffId }),
  openEditServices: () => set({ isEditServicesOpen: true }),
  closeEditServices: () => set({ isEditServicesOpen: false }),
  openShiftEditor: () => set({ isShiftEditorOpen: true }),
  closeShiftEditor: () => set({ isShiftEditorOpen: false }),
  openTimeReservation: () => set({ isTimeReservationOpen: true }),
  closeTimeReservation: () => set({ isTimeReservationOpen: false }),
  toggleTimeReservation: () => set(state => ({ isTimeReservationOpen: !state.isTimeReservationOpen })),
  openTimeOff: () => set({ isTimeOffOpen: true }),
  closeTimeOff: () => set({ isTimeOffOpen: false }),
  toggleTimeOff: () => set(state => ({ isTimeOffOpen: !state.isTimeOffOpen })),
  openResourceEditor: () => set({ isResourceEditorOpen: true }),
  closeResourceEditor: () => set({ isResourceEditorOpen: false }),
  openCommissionEditor: () => set({ isCommissionEditorOpen: true }),
  closeCommissionEditor: () => set({ isCommissionEditorOpen: false }),
  markTutorialSeen: () => set(state => ({
    shiftRules: { ...state.shiftRules, tutorialsSeen: true }
  }))
}))
