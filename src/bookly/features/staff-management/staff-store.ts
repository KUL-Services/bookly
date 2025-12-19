import { create } from 'zustand'
import {
  mockBusinessHours,
  mockStaffWorkingHours,
  mockTimeReservations,
  mockTimeOffRequests,
  mockResources,
  mockCommissionPolicies,
  mockShiftRules,
  mockManagedRooms,
  mockStaffServiceAssignments
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
  DayOfWeek,
  ManagedRoom,
  WeeklyRoomSchedule,
  RoomDaySchedule,
  RoomShift,
  RoomShiftInstance
} from '../calendar/types'
import type { StaffType, RoomAssignment } from '@/bookly/data/types'

// Helper to sync changes with calendar
function syncWithCalendar() {
  // Use dynamic import to avoid circular dependency
  import('../calendar/state')
    .then(({ useCalendarStore }) => {
      useCalendarStore.getState().syncStaffManagementData()
    })
    .catch(() => {
      // Silently fail if calendar store is not available
    })
}

// ============================================================================
// Staff Management State
// ============================================================================

// Interface for staff type transition
export interface StaffTypeTransition {
  staffId: string
  fromType: StaffType
  toType: StaffType
  effectiveDate: Date // Date when the change becomes effective
  createdAt: Date
}

export interface StaffManagementState {
  // Business hours (branch-specific)
  businessHours: Record<string, WeeklyBusinessHours> // branchId -> WeeklyBusinessHours

  // Staff data
  staffWorkingHours: Record<string, WeeklyStaffHours>
  staffServiceAssignments: Record<string, string[]> // staffId -> serviceIds[]
  staffTypeUpdates: Record<string, StaffType> // Track staff type changes for re-rendering
  staffTypeTransitions: StaffTypeTransition[] // Track pending and historical type transitions
  updateCounter: number // Force re-render counter

  // Time management
  timeReservations: TimeReservation[]
  timeOffRequests: TimeOffRequest[]
  shiftOverrides: Record<string, StaffShiftInstance[]> // staffId -> overrides[]

  // Resources
  resources: Resource[]
  resourceServiceAssignments: Record<string, string[]> // resourceId -> serviceIds[]

  // Rooms
  rooms: ManagedRoom[]
  roomShiftOverrides: Record<string, RoomShiftInstance[]> // roomId -> overrides[]

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
  updateBusinessHours: (branchId: string, day: DayOfWeek, hours: WeeklyBusinessHours[DayOfWeek]) => void
  getBusinessHours: (branchId: string, day: DayOfWeek) => WeeklyBusinessHours[DayOfWeek]

  // Actions - Staff Working Hours
  updateStaffWorkingHours: (staffId: string, day: DayOfWeek, hours: WeeklyStaffHours[DayOfWeek]) => void
  getStaffWorkingHours: (staffId: string, day: DayOfWeek) => WeeklyStaffHours[DayOfWeek]
  getStaffShiftForDate: (staffId: string, date: string) => StaffShift | null
  getStaffShiftsForDate: (staffId: string, date: string) => StaffShiftInstance[]
  updateShiftInstance: (staffId: string, shift: StaffShiftInstance) => void
  updateShiftsForDate: (staffId: string, date: string, shifts: StaffShiftInstance[]) => void
  deleteShiftInstance: (staffId: string, date: string, shiftId: string) => void
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

  // Actions - Resource Service Assignments
  assignServicesToResource: (resourceId: string, serviceIds: string[]) => { success: boolean; conflicts?: string[] }
  getResourceServices: (resourceId: string) => string[]
  getServiceResourceAssignments: () => Record<string, string> // serviceId -> resourceId
  isServiceAssigned: (serviceId: string) => boolean
  getResourceForService: (serviceId: string) => string | null

  // Actions - Rooms
  createRoom: (room: Omit<ManagedRoom, 'id' | 'weeklySchedule' | 'shiftOverrides'>) => void
  updateRoom: (id: string, updates: Partial<ManagedRoom>) => void
  deleteRoom: (id: string) => void
  getRoomsForBranch: (branchId: string) => ManagedRoom[]
  updateRoomSchedule: (roomId: string, day: DayOfWeek, schedule: RoomDaySchedule) => void
  getRoomSchedule: (roomId: string, day: DayOfWeek) => RoomDaySchedule
  getRoomShiftForDate: (roomId: string, date: string) => RoomShift | null
  updateRoomShiftInstance: (roomId: string, shift: RoomShiftInstance) => void
  duplicateRoomShifts: (roomId: string, fromDate: string, toRange: { start: string; end: string }) => void

  // Actions - Commissions
  createCommissionPolicy: (policy: Omit<CommissionPolicy, 'id'>) => void
  updateCommissionPolicy: (id: string, updates: Partial<CommissionPolicy>) => void
  deleteCommissionPolicy: (id: string) => void
  getCommissionPolicies: (scope?: CommissionPolicy['scope']) => CommissionPolicy[]

  // Actions - Staff Type & Room Assignments
  getStaffType: (staffId: string) => StaffType
  getStaffTypeForDate: (staffId: string, date: Date) => StaffType
  scheduleStaffTypeChange: (staffId: string, targetType: StaffType, effectiveDate: Date) => void
  getPendingStaffTypeChange: (staffId: string) => StaffTypeTransition | null
  cancelStaffTypeChange: (staffId: string) => void
  updateStaffType: (staffId: string, staffType: StaffType) => void
  updateRoomType: (roomId: string, roomType: 'dynamic' | 'static') => void
  assignStaffToRoom: (staffId: string, roomAssignment: RoomAssignment) => void
  removeStaffRoomAssignment: (staffId: string, assignmentIndex: number) => void
  updateStaffRoomAssignment: (staffId: string, assignmentIndex: number, updates: Partial<RoomAssignment>) => void
  getStaffRoomAssignments: (staffId: string) => RoomAssignment[]
  isStaffBusyInRoom: (staffId: string, date: Date, time: string) => { busy: boolean; assignment?: RoomAssignment }

  // Actions - Staff Management
  createStaffMember: (staffData: any) => void
  updateStaffMember: (staffId: string, staffData: any) => void
  deleteStaffMember: (staffId: string) => void

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
  // Initialize business hours for all branches (use same hours for all initially)
  businessHours: {
    '1-1': mockBusinessHours, // Luxe Hair Studio - Oxford
    '1-2': mockBusinessHours, // Luxe Hair Studio - Soho
    '1-3': mockBusinessHours, // Luxe Hair Studio - Kensington
    '2-1': mockBusinessHours, // Bliss Nail Bar - King's Road
    '2-2': mockBusinessHours, // Bliss Nail Bar - Camden
    '3-1': mockBusinessHours, // Urban Barber Co. - Shoreditch
    '3-2': mockBusinessHours // Urban Barber Co. - Brixton
  },
  staffWorkingHours: mockStaffWorkingHours,
  staffServiceAssignments: mockStaffServiceAssignments,
  staffTypeUpdates: {},
  staffTypeTransitions: [],
  updateCounter: 0,
  timeReservations: mockTimeReservations,
  timeOffRequests: mockTimeOffRequests,
  shiftOverrides: {},
  resources: mockResources,
  resourceServiceAssignments: {},
  rooms: mockManagedRooms,
  roomShiftOverrides: {},
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
  updateBusinessHours: (branchId, day, hours) => {
    set(state => ({
      businessHours: {
        ...state.businessHours,
        [branchId]: {
          ...(state.businessHours[branchId] || {}),
          [day]: hours
        }
      }
    }))
  },

  getBusinessHours: (branchId, day) => {
    const branchHours = get().businessHours[branchId]
    if (!branchHours) {
      // Return default closed state if branch not found
      return { isOpen: false, shifts: [] }
    }
    return branchHours[day]
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
      // Find existing shift by both date AND id to support multiple shifts per day
      const existingIndex = overrides.findIndex(o => o.date === shift.date && o.id === shift.id)

      let newOverrides
      if (existingIndex >= 0) {
        // Update existing shift
        newOverrides = [...overrides]
        newOverrides[existingIndex] = shift
      } else {
        // Add new shift (allows multiple shifts per day)
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

  getStaffShiftsForDate: (staffId, date) => {
    // Get all shift instances for a specific date (supports multiple shifts per day)
    const overrides = get().shiftOverrides[staffId] || []
    const dateOverrides = overrides.filter(o => o.date === date)

    if (dateOverrides.length > 0) {
      return dateOverrides
    }

    // Fall back to weekly template
    const dateObj = new Date(date)
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const day = dayNames[dateObj.getDay()]

    const dayHours = get().getStaffWorkingHours(staffId, day)
    return dayHours.shifts.map(shift => ({
      ...shift,
      date,
      reason: undefined
    }))
  },

  updateShiftsForDate: (staffId, date, shifts) => {
    // Replace all shifts for a specific date
    set(state => {
      const overrides = state.shiftOverrides[staffId] || []
      // Remove all existing shifts for this date
      const filteredOverrides = overrides.filter(o => o.date !== date)
      // Add new shifts
      const newOverrides = [...filteredOverrides, ...shifts]

      return {
        shiftOverrides: {
          ...state.shiftOverrides,
          [staffId]: newOverrides
        }
      }
    })
  },

  deleteShiftInstance: (staffId, date, shiftId) => {
    // Delete a specific shift instance
    set(state => {
      const overrides = state.shiftOverrides[staffId] || []
      const newOverrides = overrides.filter(o => !(o.date === date && o.id === shiftId))

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

  getStaffServices: staffId => {
    return get().staffServiceAssignments[staffId] || []
  },

  // Time Reservation Actions
  createTimeReservation: reservation => {
    set(state => ({
      timeReservations: [...state.timeReservations, { ...reservation, id: `res-${Date.now()}` }]
    }))
    syncWithCalendar()
  },

  updateTimeReservation: (id, updates) => {
    set(state => ({
      timeReservations: state.timeReservations.map(res => (res.id === id ? { ...res, ...updates } : res))
    }))
    syncWithCalendar()
  },

  deleteTimeReservation: id => {
    set(state => ({
      timeReservations: state.timeReservations.filter(res => res.id !== id)
    }))
    syncWithCalendar()
  },

  getTimeReservationsForStaff: staffId => {
    return get().timeReservations.filter(res => res.staffId === staffId)
  },

  // Time Off Actions
  createTimeOff: request => {
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
      timeOffRequests: state.timeOffRequests.map(req => (req.id === id ? { ...req, ...updates } : req))
    }))
    syncWithCalendar()
  },

  deleteTimeOff: id => {
    set(state => ({
      timeOffRequests: state.timeOffRequests.filter(req => req.id !== id)
    }))
    syncWithCalendar()
  },

  toggleApproval: id => {
    set(state => ({
      timeOffRequests: state.timeOffRequests.map(req => (req.id === id ? { ...req, approved: !req.approved } : req))
    }))
    syncWithCalendar()
  },

  getTimeOffForStaff: staffId => {
    return get().timeOffRequests.filter(req => req.staffId === staffId)
  },

  // Resource Actions
  createResource: resource => {
    const newId = `room-${Date.now()}`
    set(state => ({
      resources: [...state.resources, { ...resource, id: newId }],
      // Also sync resourceServiceAssignments if serviceIds are provided
      resourceServiceAssignments:
        resource.serviceIds && resource.serviceIds.length > 0
          ? { ...state.resourceServiceAssignments, [newId]: resource.serviceIds }
          : state.resourceServiceAssignments
    }))
  },

  updateResource: (id, updates) => {
    set(state => {
      const updatedResources = state.resources.map(res => (res.id === id ? { ...res, ...updates } : res))

      // Also sync resourceServiceAssignments if serviceIds are being updated
      const updatedResource = updatedResources.find(r => r.id === id)
      const newAssignments = updatedResource?.serviceIds
        ? { ...state.resourceServiceAssignments, [id]: updatedResource.serviceIds }
        : state.resourceServiceAssignments

      return {
        resources: updatedResources,
        resourceServiceAssignments: newAssignments
      }
    })
  },

  deleteResource: id => {
    set(state => {
      const { [id]: removed, ...remainingAssignments } = state.resourceServiceAssignments
      return {
        resources: state.resources.filter(res => res.id !== id),
        resourceServiceAssignments: remainingAssignments
      }
    })
  },

  getResourcesForBranch: branchId => {
    return get().resources.filter(res => res.branchId === branchId)
  },

  // Resource Service Assignment Actions
  getServiceResourceAssignments: () => {
    const assignments: Record<string, string> = {}
    const state = get()

    // Check resources
    Object.entries(state.resourceServiceAssignments).forEach(([resourceId, serviceIds]) => {
      serviceIds.forEach(serviceId => {
        assignments[serviceId] = resourceId
      })
    })

    // Check rooms
    state.rooms.forEach(room => {
      if (room.serviceIds) {
        room.serviceIds.forEach(serviceId => {
          assignments[serviceId] = room.id
        })
      }
    })

    return assignments
  },

  isServiceAssigned: serviceId => {
    const assignments = get().getServiceResourceAssignments()
    return serviceId in assignments
  },

  getResourceForService: serviceId => {
    const assignments = get().getServiceResourceAssignments()
    return assignments[serviceId] || null
  },

  assignServicesToResource: (resourceId, serviceIds) => {
    const currentAssignments = get().getServiceResourceAssignments()
    const conflicts: string[] = []

    // Check for conflicts
    serviceIds.forEach(serviceId => {
      if (currentAssignments[serviceId] && currentAssignments[serviceId] !== resourceId) {
        conflicts.push(serviceId)
      }
    })

    if (conflicts.length > 0) {
      return { success: false, conflicts }
    }

    set(state => ({
      resourceServiceAssignments: {
        ...state.resourceServiceAssignments,
        [resourceId]: serviceIds
      },
      // Also update the resource's serviceIds field
      resources: state.resources.map(r => (r.id === resourceId ? { ...r, serviceIds } : r))
    }))

    return { success: true }
  },

  getResourceServices: resourceId => {
    // Use the resource's serviceIds field as the source of truth
    const resource = get().resources.find(r => r.id === resourceId)
    return resource?.serviceIds || []
  },

  // Room Management Actions
  createRoom: room => {
    const defaultSchedule: WeeklyRoomSchedule = {
      Sun: { isAvailable: false, shifts: [] },
      Mon: { isAvailable: false, shifts: [] },
      Tue: { isAvailable: false, shifts: [] },
      Wed: { isAvailable: false, shifts: [] },
      Thu: { isAvailable: false, shifts: [] },
      Fri: { isAvailable: false, shifts: [] },
      Sat: { isAvailable: false, shifts: [] }
    }

    set(state => ({
      rooms: [
        ...state.rooms,
        {
          ...room,
          id: `room-${Date.now()}`,
          serviceIds: room.serviceIds || [],
          weeklySchedule: defaultSchedule,
          shiftOverrides: []
        }
      ]
    }))
  },

  updateRoom: (id, updates) => {
    set(state => ({
      rooms: state.rooms.map(room => (room.id === id ? { ...room, ...updates } : room))
    }))
  },

  deleteRoom: id => {
    set(state => ({
      rooms: state.rooms.filter(room => room.id !== id),
      roomShiftOverrides: Object.fromEntries(
        Object.entries(state.roomShiftOverrides).filter(([roomId]) => roomId !== id)
      )
    }))
  },

  getRoomsForBranch: branchId => {
    return get().rooms.filter(room => room.branchId === branchId)
  },

  updateRoomSchedule: (roomId, day, schedule) => {
    set(state => ({
      rooms: state.rooms.map(room =>
        room.id === roomId
          ? {
              ...room,
              weeklySchedule: {
                ...room.weeklySchedule,
                [day]: schedule
              }
            }
          : room
      )
    }))
  },

  getRoomSchedule: (roomId, day) => {
    const room = get().rooms.find(r => r.id === roomId)
    if (!room || !room.weeklySchedule[day]) {
      return { isAvailable: false, shifts: [] }
    }
    return room.weeklySchedule[day]
  },

  getRoomShiftForDate: (roomId, date) => {
    // Check for override first
    const overrides = get().roomShiftOverrides[roomId] || []
    const override = overrides.find(o => o.date === date)
    if (override) {
      return override
    }

    // Fall back to weekly template
    const room = get().rooms.find(r => r.id === roomId)
    if (!room) return null

    const dateObj = new Date(date)
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const day = dayNames[dateObj.getDay()]

    const daySchedule = room.weeklySchedule[day]
    return daySchedule.shifts[0] || null
  },

  updateRoomShiftInstance: (roomId, shift) => {
    set(state => {
      const overrides = state.roomShiftOverrides[roomId] || []
      const existingIndex = overrides.findIndex(o => o.date === shift.date)

      let newOverrides
      if (existingIndex >= 0) {
        newOverrides = [...overrides]
        newOverrides[existingIndex] = shift
      } else {
        newOverrides = [...overrides, shift]
      }

      return {
        roomShiftOverrides: {
          ...state.roomShiftOverrides,
          [roomId]: newOverrides
        }
      }
    })
  },

  duplicateRoomShifts: (roomId, fromDate, toRange) => {
    const sourceShift = get().getRoomShiftForDate(roomId, fromDate)
    if (!sourceShift) return

    const start = new Date(toRange.start)
    const end = new Date(toRange.end)
    const newOverrides: RoomShiftInstance[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      newOverrides.push({
        ...sourceShift,
        date: dateStr,
        reason: 'copy'
      })
    }

    set(state => ({
      roomShiftOverrides: {
        ...state.roomShiftOverrides,
        [roomId]: [...(state.roomShiftOverrides[roomId] || []), ...newOverrides]
      }
    }))
  },

  // Commission Actions
  createCommissionPolicy: policy => {
    set(state => ({
      commissionPolicies: [...state.commissionPolicies, { ...policy, id: `comm-${Date.now()}` }]
    }))
  },

  updateCommissionPolicy: (id, updates) => {
    set(state => ({
      commissionPolicies: state.commissionPolicies.map(pol => (pol.id === id ? { ...pol, ...updates } : pol))
    }))
  },

  deleteCommissionPolicy: id => {
    set(state => ({
      commissionPolicies: state.commissionPolicies.filter(pol => pol.id !== id)
    }))
  },

  getCommissionPolicies: scope => {
    const policies = get().commissionPolicies
    return scope ? policies.filter(p => p.scope === scope) : policies
  },

  // Staff Type & Room Assignment Actions
  getStaffType: staffId => {
    const state = get()
    // Check if there's an override in state
    if (state.staffTypeUpdates[staffId]) {
      return state.staffTypeUpdates[staffId]
    }
    // Fall back to mockStaff
    const staff = mockStaff.find(s => s.id === staffId)
    return staff?.staffType || 'dynamic'
  },

  getStaffTypeForDate: (staffId, date) => {
    const state = get()

    // Check for transitions affecting this date
    const transition = state.staffTypeTransitions
      .filter(t => t.staffId === staffId)
      .find(t => date >= t.effectiveDate)

    if (transition) {
      return transition.toType
    }

    // Fall back to current type
    return get().getStaffType(staffId)
  },

  scheduleStaffTypeChange: (staffId, targetType, effectiveDate) => {
    const currentType = get().getStaffType(staffId)

    // Remove any existing pending transition for this staff
    set(state => ({
      staffTypeTransitions: [
        ...state.staffTypeTransitions.filter(t => t.staffId !== staffId || t.effectiveDate < new Date()),
        {
          staffId,
          fromType: currentType,
          toType: targetType,
          effectiveDate,
          createdAt: new Date()
        }
      ]
    }))

    // If effective date is today or in the past, apply immediately
    if (effectiveDate <= new Date()) {
      get().updateStaffType(staffId, targetType)
    }

    syncWithCalendar()
  },

  getPendingStaffTypeChange: staffId => {
    const state = get()
    return (
      state.staffTypeTransitions
        .filter(t => t.staffId === staffId && t.effectiveDate > new Date())
        .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())[0] || null
    )
  },

  cancelStaffTypeChange: staffId => {
    set(state => ({
      staffTypeTransitions: state.staffTypeTransitions.filter(
        t => !(t.staffId === staffId && t.effectiveDate > new Date())
      )
    }))
    syncWithCalendar()
  },

  updateStaffType: (staffId, staffType) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (staff) {
      staff.staffType = staffType
      // If changing to dynamic, clear room assignments
      if (staffType === 'dynamic') {
        staff.roomAssignments = []
      }
      // Update state to trigger re-render
      set(state => ({
        staffTypeUpdates: {
          ...state.staffTypeUpdates,
          [staffId]: staffType
        },
        updateCounter: state.updateCounter + 1
      }))
      syncWithCalendar()
    }
  },

  updateRoomType: (roomId, roomType) => {
    set(state => ({
      rooms: state.rooms.map(room => (room.id === roomId ? { ...room, roomType } : room))
    }))
    syncWithCalendar()
  },

  assignStaffToRoom: (staffId, roomAssignment) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (staff) {
      if (!staff.roomAssignments) {
        staff.roomAssignments = []
      }
      staff.roomAssignments.push(roomAssignment)
      // Automatically set staff type to static if not already
      if (staff.staffType !== 'static') {
        staff.staffType = 'static'
      }
      syncWithCalendar()
    }
  },

  removeStaffRoomAssignment: (staffId, assignmentIndex) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (staff && staff.roomAssignments) {
      staff.roomAssignments.splice(assignmentIndex, 1)
      syncWithCalendar()
    }
  },

  updateStaffRoomAssignment: (staffId, assignmentIndex, updates) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (staff && staff.roomAssignments && staff.roomAssignments[assignmentIndex]) {
      staff.roomAssignments[assignmentIndex] = {
        ...staff.roomAssignments[assignmentIndex],
        ...updates
      }
      syncWithCalendar()
    }
  },

  getStaffRoomAssignments: staffId => {
    const staff = mockStaff.find(s => s.id === staffId)
    return staff?.roomAssignments || []
  },

  isStaffBusyInRoom: (staffId, date, time) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (!staff || !staff.roomAssignments || staff.roomAssignments.length === 0) {
      return { busy: false }
    }

    // Get day of week from date
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = dayNames[date.getDay()]

    // Convert time to minutes for comparison
    const [hours, minutes] = time.split(':').map(Number)
    const timeInMinutes = hours * 60 + minutes

    // Check each room assignment
    for (const assignment of staff.roomAssignments) {
      if (assignment.dayOfWeek === dayOfWeek) {
        const [startHours, startMinutes] = assignment.startTime.split(':').map(Number)
        const [endHours, endMinutes] = assignment.endTime.split(':').map(Number)
        const startInMinutes = startHours * 60 + startMinutes
        const endInMinutes = endHours * 60 + endMinutes

        if (timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes) {
          return { busy: true, assignment }
        }
      }
    }

    return { busy: false }
  },

  // Staff Management Actions
  createStaffMember: staffData => {
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
    syncWithCalendar()
  },

  updateStaffMember: (staffId, staffData) => {
    // Find and update staff in mockStaff array
    const staffIndex = mockStaff.findIndex(s => s.id === staffId)
    if (staffIndex !== -1) {
      mockStaff[staffIndex] = {
        ...mockStaff[staffIndex],
        name: staffData.name,
        title: staffData.title || '',
        email: staffData.email,
        phone: staffData.phone,
        photo: staffData.photo,
        color: staffData.color,
        branchId: staffData.branchId,
        isActive: staffData.isActive
      }
      console.log('Updated staff member:', staffId, staffData)
      syncWithCalendar()
    }
  },

  deleteStaffMember: staffId => {
    // Find and remove staff from mockStaff array
    const staffIndex = mockStaff.findIndex(s => s.id === staffId)
    if (staffIndex !== -1) {
      mockStaff.splice(staffIndex, 1)

      // Clean up related data
      set(state => ({
        staffWorkingHours: Object.fromEntries(Object.entries(state.staffWorkingHours).filter(([id]) => id !== staffId)),
        staffServiceAssignments: Object.fromEntries(
          Object.entries(state.staffServiceAssignments).filter(([id]) => id !== staffId)
        ),
        shiftOverrides: Object.fromEntries(Object.entries(state.shiftOverrides).filter(([id]) => id !== staffId)),
        timeReservations: state.timeReservations.filter(res => res.staffId !== staffId),
        timeOffRequests: state.timeOffRequests.filter(req => req.staffId !== staffId),
        selectedStaffId: state.selectedStaffId === staffId ? null : state.selectedStaffId
      }))

      syncWithCalendar()
    }
  },

  // UI Actions
  selectStaff: staffId => set({ selectedStaffId: staffId }),
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
  markTutorialSeen: () =>
    set(state => ({
      shiftRules: { ...state.shiftRules, tutorialsSeen: true }
    }))
}))
