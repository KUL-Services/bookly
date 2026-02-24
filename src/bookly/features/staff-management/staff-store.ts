import { create } from 'zustand'
import { AssetsService } from '@/lib/api/services/assets.service'
import { SchedulingService } from '@/lib/api/services/scheduling.service'
import { CommissionsService } from '@/lib/api/services/commissions.service'
import { StaffService } from '@/lib/api/services/staff.service'
import { ServicesService } from '@/lib/api/services/services.service'
import { BranchesService } from '@/lib/api/services/branches.service'
import { SessionsService } from '@/lib/api/services/sessions.service'
import type { Session, CreateSessionRequest } from '@/lib/api/types'
// Mock data imports kept as fallbacks only\nimport {} from '@/bookly/data/staff-management-mock-data'
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

// Special Rule Interface
export interface SpecialRule {
  id: string
  name: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  type: 'closed' | 'custom'
  shifts: { start: string; end: string }[]
  color?: string
}

// Generate a deterministic color from a name string
function generateColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32-bit int
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 55%, 45%)`
}

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
  // API-loaded data
  staffMembers: any[] // Staff from API
  apiBranches: any[] // Branches from API
  apiServices: any[] // Services from API
  sessions: Session[] // Sessions from API for STATIC resources
  isStaffLoading: boolean

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
  isSpecialDaysModalOpen: boolean
  shiftRules: ShiftRuleSet

  // Special Rules
  specialRules: SpecialRule[]
  addSpecialRule: (rule: Omit<SpecialRule, 'id'>) => void
  updateSpecialRule: (id: string, updates: Partial<SpecialRule>) => void
  deleteSpecialRule: (id: string) => void

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
  saveStaffWorkingHours: (staffId: string) => Promise<void>
  saveShiftsExceptions: (staffId: string, date: string, shifts: StaffShiftInstance[]) => Promise<void>
  deleteShiftInstance: (staffId: string, date: string, shiftId: string) => void
  duplicateShifts: (staffId: string, fromDate: string, toRange: { start: string; end: string }) => void
  addBreak: (staffId: string, shiftId: string, breakRange: { start: string; end: string }) => void
  removeBreak: (staffId: string, shiftId: string, breakId: string) => void

  // Actions - Service Assignments
  assignServicesToStaff: (staffId: string, serviceIds: string[]) => Promise<void>
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
  createResource: (resource: Omit<Resource, 'id'>) => Promise<void>
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>
  deleteResource: (id: string) => Promise<void>
  getResourcesForBranch: (branchId: string) => Resource[]

  // Actions - Resource Service Assignments
  assignServicesToResource: (
    resourceId: string,
    serviceIds: string[]
  ) => Promise<{ success: boolean; conflicts?: string[] }>
  getResourceServices: (resourceId: string) => string[]
  getServiceResourceAssignments: () => Record<string, string> // serviceId -> resourceId
  isServiceAssigned: (serviceId: string) => boolean
  getResourceForService: (serviceId: string) => string | null

  // Actions - Rooms
  createRoom: (room: Omit<ManagedRoom, 'id' | 'weeklySchedule' | 'shiftOverrides'>) => Promise<void>
  updateRoom: (id: string, updates: Partial<ManagedRoom>) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
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
  updateStaffType: (staffId: string, staffType: StaffType) => Promise<void>
  updateRoomType: (roomId: string, roomType: 'dynamic' | 'static') => Promise<void>
  cancelRoomBookingModeTransition: (roomId: string) => Promise<void>
  assignStaffToRoom: (staffId: string, roomAssignment: RoomAssignment) => void
  removeStaffRoomAssignment: (staffId: string, assignmentIndex: number) => void
  updateStaffRoomAssignment: (staffId: string, assignmentIndex: number, updates: Partial<RoomAssignment>) => void
  getStaffRoomAssignments: (staffId: string) => RoomAssignment[]
  isStaffBusyInRoom: (staffId: string, date: Date, time: string) => { busy: boolean; assignment?: RoomAssignment }

  createStaffMember: (staffData: any) => Promise<void>
  updateStaffMember: (staffId: string, staffData: any) => Promise<void>
  deleteStaffMember: (staffId: string) => Promise<void>
  cancelStaffBookingModeTransition: (staffId: string) => Promise<void>

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
  openSpecialDays: () => void
  closeSpecialDays: () => void
  toggleSpecialDays: () => void
  markTutorialSeen: () => void

  // Actions - API Hydration
  fetchStaffFromApi: () => Promise<void>
  fetchServicesFromApi: () => Promise<void>
  fetchBranchesFromApi: () => Promise<void>
  fetchResourcesFromApi: () => Promise<void>
  fetchSchedulesFromApi: () => Promise<void>
  fetchCommissionsFromApi: () => Promise<void>
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useStaffManagementStore = create<StaffManagementState>((set, get) => ({
  // Initial State
  staffMembers: [],
  apiBranches: [],
  apiServices: [],
  sessions: [],
  isStaffLoading: false,

  // Initialize business hours for all branches - starts empty, populated by fetchSchedulesFromApi
  businessHours: {},
  staffWorkingHours: {},
  staffServiceAssignments: {},
  staffTypeUpdates: {},
  staffTypeTransitions: [],
  updateCounter: 0,
  timeReservations: [],
  timeOffRequests: [],
  shiftOverrides: {},
  resources: [],
  resourceServiceAssignments: {},
  rooms: [],
  roomShiftOverrides: {},
  commissionPolicies: [],
  selectedStaffId: null,
  isEditServicesOpen: false,
  isShiftEditorOpen: false,
  isTimeReservationOpen: false,
  isTimeOffOpen: false,
  isResourceEditorOpen: false,
  isCommissionEditorOpen: false,
  isSpecialDaysModalOpen: false,
  shiftRules: { duplication: { allowCopy: true, allowPrint: true }, tutorialsSeen: false },
  specialRules: [],

  // Special Rules Actions
  openSpecialDays: () => set({ isSpecialDaysModalOpen: true }),
  closeSpecialDays: () => set({ isSpecialDaysModalOpen: false }),
  toggleSpecialDays: () => set(state => ({ isSpecialDaysModalOpen: !state.isSpecialDaysModalOpen })),

  // API Hydration Actions
  fetchStaffFromApi: async () => {
    set({ isStaffLoading: true })
    try {
      const result = await StaffService.getStaff()
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        // Map API staff to a shape compatible with the UI
        const apiStaff = result.data.map((s: any) => ({
          id: s.id,
          name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          title: s.title || s.role || '',
          email: s.email || '',
          phone: s.phone || s.mobile || '',
          photo: s.profilePhoto || s.photo || '',
          color: s.color || '#0a2c24',
          branchId: s.branchId || '1-1',
          businessId: s.businessId || '',
          isActive: s.isActive !== false,
          staffType: s.bookingMode === 'STATIC' ? 'static' : 'dynamic',
          bookingMode: s.bookingMode || 'DYNAMIC',
          maxConcurrentBookings: s.maxConcurrentBookings || 1,
          roomAssignments: s.roomAssignments || []
        }))

        // Populate service assignments
        const serviceAssignments: Record<string, string[]> = {}
        result.data.forEach((s: any) => {
          if (s.serviceIds) {
            serviceAssignments[s.id] = s.serviceIds
          } else if (s.services) {
            serviceAssignments[s.id] = s.services.map((srv: any) => srv.id)
          }
        })

        set({ staffMembers: apiStaff, staffServiceAssignments: serviceAssignments, isStaffLoading: false })
        syncWithCalendar()
      } else {
        // Fallback to mockStaff
        set({ staffMembers: mockStaff, isStaffLoading: false })
      }
    } catch (err) {
      console.warn('Failed to fetch staff from API, using mock data:', err)
      set({ staffMembers: mockStaff, isStaffLoading: false })
    }
  },

  fetchServicesFromApi: async () => {
    try {
      const result = await ServicesService.getServices()
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        set({ apiServices: result.data })
      }
    } catch (err) {
      console.warn('Failed to fetch services from API:', err)
    }
  },

  fetchBranchesFromApi: async () => {
    try {
      const result = await BranchesService.getBranches()
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        set({ apiBranches: result.data })
      }
    } catch (err) {
      console.warn('Failed to fetch branches from API:', err)
    }
  },

  fetchResourcesFromApi: async () => {
    try {
      const result = await AssetsService.getAssets()
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        // Separate assets by subType: EQUIPMENT goes to resources, ROOM goes to rooms
        // If subType is not set, use legacy behavior (treat as both for backward compatibility)
        const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const defaultDaySchedule = { isOpen: false, shifts: [] as any[] }
        const defaultWeeklySchedule = Object.fromEntries(dayNames.map(d => [d, { ...defaultDaySchedule }]))

        // Filter equipment resources (subType === 'EQUIPMENT' or no subType for backward compatibility)
        const equipmentAssets = result.data.filter(
          (asset: any) => asset.subType === 'EQUIPMENT' || (!asset.subType && asset.type !== 'ROOM')
        )
        const apiResources = equipmentAssets.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          type: 'equipment',
          subType: 'EQUIPMENT' as const,
          branchId: asset.branchId || '',
          capacity: asset.maxConcurrent || asset.capacity || 1,
          description: asset.description || '',
          serviceIds: asset.serviceIds || (asset.services ? asset.services.map((s: any) => s.id) : [])
        }))
        set({ resources: apiResources })

        // Filter room assets (subType === 'ROOM')
        const roomAssets = result.data.filter(
          (asset: any) => asset.subType === 'ROOM' || (!asset.subType && asset.type === 'ROOM')
        )
        const apiRooms: ManagedRoom[] = roomAssets.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          branchId: asset.branchId || '',
          capacity: asset.maxConcurrent || asset.capacity || 1,
          color: generateColorFromName(asset.name),
          description: asset.description || '',
          roomType: (asset.bookingMode === 'STATIC' ? 'static' : 'dynamic') as 'dynamic' | 'static',
          bookingMode: asset.bookingMode || 'DYNAMIC',
          pendingBookingMode: asset.pendingBookingMode || undefined,
          bookingModeEffectiveDate: asset.bookingModeEffectiveDate || undefined,
          weeklySchedule: defaultWeeklySchedule as any,
          shiftOverrides: [],
          serviceIds: asset.serviceIds || (asset.services ? asset.services.map((s: any) => s.id) : [])
        }))
        if (apiRooms.length > 0) {
          set({ rooms: apiRooms })
        }

        syncWithCalendar()
      }
    } catch (err) {
      console.warn('Failed to fetch resources from API:', err)
    }
  },

  fetchSchedulesFromApi: async () => {
    try {
      const [schedulesRes, assignmentsRes, exceptionsRes, breaksRes, sessionsRes] = await Promise.all([
        SchedulingService.getSchedules(),
        SchedulingService.getAssignments().catch(() => ({ data: [] })),
        SchedulingService.getExceptions().catch(() => ({ data: [] })),
        SchedulingService.getBreaks().catch(() => ({ data: [] })),
        SessionsService.getSessions().catch(() => ({ data: [] }))
      ])

      if (schedulesRes.data && Array.isArray(schedulesRes.data) && schedulesRes.data.length > 0) {
        // Map API Schedule[] to WeeklyStaffHours format
        const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const workingHours: Record<string, any> = {}
        const branchHours: Record<string, any> = {}

        schedulesRes.data.forEach((schedule: any) => {
          const dayKey = dayNames[schedule.dayOfWeek] || dayNames[0]
          const shift = { start: schedule.startTime, end: schedule.endTime }

          if (schedule.resourceId) {
            // Staff/resource schedule
            if (!workingHours[schedule.resourceId]) {
              workingHours[schedule.resourceId] = {}
              dayNames.forEach(d => {
                workingHours[schedule.resourceId][d] = { isWorking: false, shifts: [] }
              })
            }
            workingHours[schedule.resourceId][dayKey] = {
              isWorking: true,
              shifts: [...(workingHours[schedule.resourceId][dayKey]?.shifts || []), { ...shift, breaks: [] }]
            }
          }

          if (schedule.branchId) {
            // Branch business hours
            if (!branchHours[schedule.branchId]) {
              branchHours[schedule.branchId] = {}
              dayNames.forEach(d => {
                branchHours[schedule.branchId][d] = { isOpen: false, shifts: [] }
              })
            }
            // Use earliest start and latest end for branch hours
            const existing = branchHours[schedule.branchId][dayKey]
            const existingStart = existing.shifts?.[0]?.start
            const existingEnd = existing.shifts?.[0]?.end

            branchHours[schedule.branchId][dayKey] = {
              isOpen: true,
              shifts: [
                {
                  start: !existingStart || schedule.startTime < existingStart ? schedule.startTime : existingStart,
                  end: !existingEnd || schedule.endTime > existingEnd ? schedule.endTime : existingEnd
                }
              ]
            }
          }
        })

        // Pre-fill fallback business hours for ALL branches
        // Since backend might not return explicit branch schedules if they use defaults
        let apiBranches = get().apiBranches || []
        if (apiBranches.length === 0) {
          try {
            const branchesRes = await import('../../../lib/api/services/branches.service').then(m =>
              m.BranchesService.getBranches()
            )
            if (branchesRes.data) apiBranches = branchesRes.data as any[]
          } catch (e) {
            console.warn('Could not fetch branches for schedule fallback')
          }
        }

        apiBranches.forEach(branch => {
          if (!branchHours[branch.id]) {
            branchHours[branch.id] = {}
            dayNames.forEach(d => {
              // Default to 9am - 5pm if no DB schedule exists for this branch
              branchHours[branch.id][d] = {
                isOpen: true,
                shifts: [{ start: '09:00', end: '17:00' }]
              }
            })
          }
        })

        // 1.5. Process Breaks for Recurring Schedules
        if (breaksRes.data && Array.isArray(breaksRes.data)) {
          breaksRes.data.forEach((br: any) => {
            const dayKey = dayNames[br.dayOfWeek] || dayNames[0]
            if (br.resourceId && workingHours[br.resourceId]?.[dayKey]) {
              // Find the shift this break belongs to (optional, but good for frontend structure)
              // For simplicity, we can just add it to the first shift that contains it,
              // or just keep them as orphans if needed.
              // The frontend types expect breaks to be inside a StaffShift.
              const breakRange = { id: br.id, start: br.startTime, end: br.endTime }
              const shifts = workingHours[br.resourceId][dayKey].shifts
              const targetShift = shifts.find((s: any) => br.startTime >= s.start && br.endTime <= s.end)
              if (targetShift) {
                if (!targetShift.breaks) targetShift.breaks = []
                targetShift.breaks.push(breakRange)
              }
            }
          })
        }

        set({
          staffWorkingHours: workingHours,
          businessHours: branchHours
        })
      } else {
        // If API completely empty, fall back to default hours for all known branches
        let apiBranches = get().apiBranches || []
        if (apiBranches.length === 0) {
          try {
            const branchesRes = await import('../../../lib/api/services/branches.service').then(m =>
              m.BranchesService.getBranches()
            )
            if (branchesRes.data) apiBranches = branchesRes.data as any[]
          } catch (e) {
            console.warn('Could not fetch branches for empty schedule fallback')
          }
        }

        const branchHours: Record<string, any> = {}
        const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        apiBranches.forEach(branch => {
          branchHours[branch.id] = {}
          dayNames.forEach(d => {
            branchHours[branch.id][d] = {
              isOpen: true,
              shifts: [{ start: '09:00', end: '17:00' }]
            }
          })
        })

        set({ businessHours: branchHours })
      }

      // 2. Process Staff Room Assignments
      if (assignmentsRes.data && Array.isArray(assignmentsRes.data)) {
        const staffMembers = get().staffMembers
        const rooms = get().rooms
        const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        const assignmentsData = assignmentsRes.data || []
        const updatedStaff = staffMembers.map(staff => {
          const myAssignments = assignmentsData
            .filter((a: any) => a.staffId === staff.id)
            .map((a: any) => ({
              id: a.id,
              roomId: a.assetId,
              roomName: rooms.find(r => r.id === a.assetId)?.name || 'Unknown Room',
              dayOfWeek: dayNames[a.dayOfWeek] || dayNames[0],
              startTime: a.startTime,
              endTime: a.endTime,
              serviceIds: []
            }))
          return { ...staff, roomAssignments: myAssignments }
        })
        set({ staffMembers: updatedStaff })
      }

      // 3. Process Schedule Exceptions
      if (exceptionsRes.data && Array.isArray(exceptionsRes.data)) {
        const overrides: Record<string, any[]> = {}
        exceptionsRes.data.forEach((ex: any) => {
          if (ex.resourceId) {
            if (!overrides[ex.resourceId]) overrides[ex.resourceId] = []

            overrides[ex.resourceId].push({
              id: ex.id,
              date: ex.date,
              start: ex.isAvailable ? ex.startTime || '09:00' : '00:00',
              end: ex.isAvailable ? ex.endTime || '17:00' : '00:00',
              reason: ex.reason || 'manual'
            })
          }
        })
        set({ shiftOverrides: overrides })
      }

      // 4. Process Sessions
      if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
        set({ sessions: sessionsRes.data })
      }

      syncWithCalendar()
    } catch (err) {
      console.warn('Failed to fetch schedules from API:', err)
    }
  },

  fetchCommissionsFromApi: async () => {
    try {
      const result = await CommissionsService.getCommissions()
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        // Map API Commission[] { id, serviceId, resourceId, percentage } → CommissionPolicy[]
        const mapped = result.data.map((c: any) => ({
          id: c.id,
          scope: 'service' as const,
          scopeRefId: c.serviceId,
          type: 'percent' as const,
          value: c.percentage,
          appliesTo: 'serviceProvider' as const,
          staffScope: c.resourceId ? { staffIds: [c.resourceId] } : ('all' as const)
        }))
        set({ commissionPolicies: mapped })
      }
    } catch (err) {
      console.warn('Failed to fetch commissions from API:', err)
    }
  },

  addSpecialRule: (rule: Omit<SpecialRule, 'id'>) =>
    set(state => ({ specialRules: [...state.specialRules, { ...rule, id: `rule-${Date.now()}` }] })),
  updateSpecialRule: (id, updates) =>
    set(state => ({ specialRules: state.specialRules.map(r => (r.id === id ? { ...r, ...updates } : r)) })),
  deleteSpecialRule: id => set(state => ({ specialRules: state.specialRules.filter(r => r.id !== id) })),

  // Business Hours Actions
  updateBusinessHours: async (branchId, day, hours) => {
    // 1. Optimistic UI update
    set(state => ({
      businessHours: {
        ...state.businessHours,
        [branchId]: {
          ...(state.businessHours[branchId] || {}),
          [day]: hours
        }
      }
    }))

    // 2. Persist to API
    try {
      const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayIndex = dayNames.indexOf(day)

      // Fetch existing schedules for this branch
      const existingSchedules = await import('../../../lib/api/services/scheduling.service').then(m =>
        m.SchedulingService.getSchedules({ branchId })
      )

      // Filter schedules specifically for this dayOfWeek
      const schedulesToDelete = (existingSchedules.data || []).filter(s => s.dayOfWeek === dayIndex)

      // Delete old schedules
      await Promise.all(
        schedulesToDelete.map(s =>
          import('../../../lib/api/services/scheduling.service').then(m => m.SchedulingService.deleteSchedule(s.id))
        )
      )

      // Get existing breaks for this branch
      const existingBreaks = await import('../../../lib/api/services/scheduling.service').then(m =>
        m.SchedulingService.getBreaks({ branchId })
      )
      const breaksToDelete = (existingBreaks.data || []).filter(b => b.dayOfWeek === dayIndex)

      // Delete old breaks
      await Promise.all(
        breaksToDelete.map(b =>
          import('../../../lib/api/services/scheduling.service').then(m => m.SchedulingService.deleteBreak(b.id))
        )
      )

      // If open, add the new ones
      if (hours.isOpen) {
        for (const shift of hours.shifts) {
          // Create schedule
          const createData = {
            branchId,
            dayOfWeek: dayIndex,
            startTime: shift.start,
            endTime: shift.end
          }
          await import('../../../lib/api/services/scheduling.service').then(m =>
            m.SchedulingService.createSchedule(createData)
          )

          // Create breaks associated with this shift
          if ((shift as any).breaks && (shift as any).breaks.length > 0) {
            for (const b of (shift as any).breaks) {
              const breakData = {
                branchId,
                name: 'Break',
                dayOfWeek: dayIndex,
                startTime: b.start,
                endTime: b.end
              }
              await import('../../../lib/api/services/scheduling.service').then(m =>
                m.SchedulingService.createBreak(breakData)
              )
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to update branch business hours on server:', e)
      // We could optionally revert the optimistic UI update here if necessary
    }
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

    // Check for Special Rules (Holidays/Custom Hours)
    const specialRule = get().specialRules.find(r => date >= r.startDate && date <= r.endDate)
    if (specialRule) {
      if (specialRule.type === 'closed') return [] // No shifts
      // Return all shifts from custom rule
      return specialRule.shifts.map((s, idx) => ({
        id: `special-${specialRule.id}-${idx}`,
        start: s.start,
        end: s.end,
        date,
        reason: 'business_hours_change'
      })) as StaffShiftInstance[]
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

  saveStaffWorkingHours: async staffId => {
    try {
      const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      // 1. Fetch current schedules and breaks for this staff from backend to know what to delete
      const [currentSchedulesResp, currentBreaksResp] = await Promise.all([
        SchedulingService.getSchedules({ resourceId: staffId }),
        SchedulingService.getBreaks({ resourceId: staffId })
      ])

      const currentSchedules = currentSchedulesResp.data || []
      const currentBreaks = currentBreaksResp.data || []

      // 2. Delete ALL existing real schedules and breaks for this staff
      for (const old of currentSchedules) {
        await SchedulingService.deleteSchedule(old.id)
      }
      for (const old of currentBreaks) {
        await SchedulingService.deleteBreak(old.id)
      }

      // 3. Create new schedules and breaks from current state
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const day = dayNames[dayIndex]
        const hours = get().staffWorkingHours[staffId]?.[day]

        if (hours && hours.isWorking && hours.shifts) {
          for (const shift of hours.shifts) {
            await SchedulingService.createSchedule({
              dayOfWeek: dayIndex,
              startTime: shift.start,
              endTime: shift.end,
              resourceId: staffId
            })

            // Also create breaks for this shift
            if (shift.breaks && Array.isArray(shift.breaks)) {
              for (const br of shift.breaks) {
                await SchedulingService.createBreak({
                  name: 'Break',
                  dayOfWeek: dayIndex,
                  startTime: br.start,
                  endTime: br.end,
                  resourceId: staffId
                })
              }
            }
          }
        }
      }
      await get().fetchSchedulesFromApi()
    } catch (err) {
      console.error('Failed to save staff working hours:', err)
    }
  },

  saveShiftsExceptions: async (staffId, date, shifts) => {
    try {
      // 1. Fetch current exceptions for this staff from backend to know what to delete
      const currentExceptionsResp = await SchedulingService.getExceptions({ resourceId: staffId })
      const currentExceptions = currentExceptionsResp.data || []

      // 2. Filter by date to find which to delete
      const exceptionsForDate = currentExceptions.filter(e => e.date === date)
      for (const old of exceptionsForDate) {
        await SchedulingService.deleteException(old.id)
      }

      // 3. Create new exceptions
      if (shifts.length === 0 || (shifts.length === 1 && shifts[0].start === '00:00' && shifts[0].end === '00:00')) {
        // Special case: Not working at all this day
        await SchedulingService.createException({
          date,
          isAvailable: false,
          reason: shifts[0]?.reason || 'manual',
          resourceId: staffId
        })
      } else {
        for (const shift of shifts) {
          // If shift has breaks, we need to split it into multiple AVAILABLE exceptions
          if (shift.breaks && shift.breaks.length > 0) {
            // Sort breaks by start time
            const sortedBreaks = [...shift.breaks].sort((a, b) => a.start.localeCompare(b.start))

            let currentTime = shift.start

            for (const br of sortedBreaks) {
              // Create segment before break if there's space
              if (br.start > currentTime) {
                await SchedulingService.createException({
                  date,
                  startTime: currentTime,
                  endTime: br.start,
                  isAvailable: true,
                  reason: shift.reason || 'manual',
                  resourceId: staffId
                })
              }
              currentTime = br.end
            }

            // Create segment after the last break if there's space
            if (shift.end > currentTime) {
              await SchedulingService.createException({
                date,
                startTime: currentTime,
                endTime: shift.end,
                isAvailable: true,
                reason: shift.reason || 'manual',
                resourceId: staffId
              })
            }
          } else {
            // Regular shift without breaks
            await SchedulingService.createException({
              date,
              startTime: shift.start,
              endTime: shift.end,
              isAvailable: true,
              reason: shift.reason || 'manual',
              resourceId: staffId
            })
          }
        }
      }

      await get().fetchSchedulesFromApi()
    } catch (err) {
      console.error('Failed to save shift exceptions:', err)
    }
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
  assignServicesToStaff: async (staffId, serviceIds) => {
    try {
      set(state => ({
        staffServiceAssignments: {
          ...state.staffServiceAssignments,
          [staffId]: serviceIds
        }
      }))
      await StaffService.updateStaff({ id: staffId, serviceIds })
      await get().fetchStaffFromApi()
    } catch (err) {
      console.error('Failed to assign services to staff:', err)
    }
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
    return get().timeReservations.filter(res => res.staffIds.includes(staffId))
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

  // Staff Management Actions
  createStaffMember: async staffData => {
    try {
      set({ isStaffLoading: true })
      await StaffService.createStaff(staffData)
      await get().fetchStaffFromApi()
    } catch (err) {
      console.error('Failed to create staff member:', err)
      set({ isStaffLoading: false })
    }
  },

  updateStaffMember: async (staffId, staffData) => {
    try {
      set({ isStaffLoading: true })
      await StaffService.updateStaff({ id: staffId, ...staffData })
      await get().fetchStaffFromApi()
    } catch (err) {
      console.error('Failed to update staff member:', err)
      set({ isStaffLoading: false })
    }
  },

  deleteStaffMember: async staffId => {
    try {
      set({ isStaffLoading: true })
      await StaffService.deleteStaff(staffId)
      await get().fetchStaffFromApi()
    } catch (err) {
      console.error('Failed to delete staff member:', err)
      set({ isStaffLoading: false })
    }
  },

  // Resource Actions
  createResource: async resource => {
    try {
      // Map frontend Resource to API Asset with subType: EQUIPMENT
      const assetData = {
        name: resource.name,
        subType: 'EQUIPMENT' as const, // Always EQUIPMENT for resources
        branchId: resource.branchId,
        maxConcurrent: resource.capacity,
        description: resource.description,
        serviceIds: resource.serviceIds || [],
        bookingMode: (resource as any).bookingMode || 'DYNAMIC' // STATIC or DYNAMIC booking mode
      }
      await AssetsService.createAsset(assetData)
      await get().fetchResourcesFromApi()
    } catch (err) {
      console.error('Failed to create resource:', err)
    }
  },

  updateResource: async (id, updates) => {
    try {
      const assetData = {
        id,
        subType: 'EQUIPMENT' as const,
        ...(updates.name && { name: updates.name }),
        ...(updates.branchId && { branchId: updates.branchId }),
        ...(updates.capacity !== undefined && { maxConcurrent: updates.capacity }),
        ...(updates.description && { description: updates.description }),
        ...(updates.serviceIds && { serviceIds: updates.serviceIds }),
        ...((updates as any).bookingMode && { bookingMode: (updates as any).bookingMode })
      }
      await AssetsService.updateAsset(assetData)
      await get().fetchResourcesFromApi()
    } catch (err) {
      console.error('Failed to update resource:', err)
    }
  },

  deleteResource: async id => {
    try {
      await AssetsService.deleteAsset(id)
      await get().fetchResourcesFromApi()
    } catch (err) {
      console.error('Failed to delete resource:', err)
    }
  },

  // Room Actions
  createRoom: async room => {
    try {
      const assetData = {
        name: room.name,
        subType: 'ROOM' as const, // Always ROOM for rooms
        branchId: room.branchId,
        maxConcurrent: room.capacity,
        description: room.description,
        serviceIds: room.serviceIds || [],
        bookingMode: (room as any).bookingMode || 'DYNAMIC', // STATIC or DYNAMIC booking mode
        roomType: room.roomType || 'dynamic' // dynamic/flexible vs static/fixed
      }
      await AssetsService.createAsset(assetData)
      await get().fetchResourcesFromApi() // Rooms are fetched via resources/assets endpoint
    } catch (err) {
      console.error('Failed to create room:', err)
    }
  },

  updateRoom: async (id, updates) => {
    try {
      console.log('updateRoom called with updates:', updates)
      const assetData = {
        id,
        subType: 'ROOM' as const,
        ...(updates.name && { name: updates.name }),
        ...(updates.branchId && { branchId: updates.branchId }),
        ...(updates.capacity !== undefined && { maxConcurrent: updates.capacity }),
        ...(updates.description && { description: updates.description }),
        ...(updates.serviceIds && { serviceIds: updates.serviceIds }),
        ...((updates as any).bookingMode && { bookingMode: (updates as any).bookingMode })
      }
      console.log('updateRoom payload assetData:', assetData)
      await AssetsService.updateAsset(assetData)
      await get().fetchResourcesFromApi()
    } catch (err) {
      console.error('Failed to update room:', err)
    }
  },

  deleteRoom: async id => {
    try {
      await AssetsService.deleteAsset(id)
      await get().fetchResourcesFromApi()
    } catch (err) {
      console.error('Failed to delete room:', err)
    }
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

  assignServicesToResource: async (resourceId, serviceIds) => {
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

    try {
      // 1. Send update to API
      await AssetsService.updateAsset({
        id: resourceId,
        serviceIds: serviceIds
      })

      // 2. Fetch fresh data from API to ensure state matches backend
      await get().fetchResourcesFromApi()

      return { success: true }
    } catch (err) {
      console.error('Failed to assign services to resource:', err)
      return { success: false, conflicts: ['API_ERROR'] }
    }
  },

  getResourceServices: resourceId => {
    // Use the resource's serviceIds field as the source of truth
    const resource = get().resources.find(r => r.id === resourceId)
    return resource?.serviceIds || []
  },

  // Room Management Actions

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
    // Rooms share the same schedule storage as staff (staffWorkingHours)
    const schedule = get().getStaffWorkingHours(roomId, day)
    return {
      isAvailable: schedule.isWorking,
      shifts: schedule.shifts as unknown as RoomShift[]
    }
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
    const transition = state.staffTypeTransitions.filter(t => t.staffId === staffId).find(t => date >= t.effectiveDate)

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

  cancelStaffBookingModeTransition: async staffId => {
    try {
      await import('../../../lib/api/services/staff.service').then(m =>
        m.StaffService.cancelBookingModeTransition(staffId)
      )
      await get().fetchStaffFromApi()
      syncWithCalendar()
    } catch (e: any) {
      console.error('Failed to cancel staff booking mode transition:', e)
      // Re-throw with error message for UI to handle
      const errorMessage =
        e?.response?.data?.message || e?.message || 'Cannot cancel. There may be bookings after the effective date.'
      throw new Error(errorMessage)
    }
  },

  updateStaffType: async (staffId, staffType) => {
    try {
      set(state => ({
        staffTypeUpdates: {
          ...state.staffTypeUpdates,
          [staffId]: staffType
        },
        updateCounter: state.updateCounter + 1
      }))

      await StaffService.updateStaff({
        id: staffId,
        bookingMode: staffType === 'static' ? 'STATIC' : 'DYNAMIC'
      })
      await get().fetchStaffFromApi()
      syncWithCalendar()
    } catch (err: any) {
      console.error('Failed to update staff type:', err)
      // Revert optimistic update
      set(state => {
        const newUpdates = { ...state.staffTypeUpdates }
        delete newUpdates[staffId]
        return { staffTypeUpdates: newUpdates, updateCounter: state.updateCounter + 1 }
      })
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update staff type'
      throw new Error(errorMessage)
    }
  },

  updateRoomType: async (roomId, roomType) => {
    const previousRooms = get().rooms
    try {
      set(state => ({
        rooms: state.rooms.map(room => (room.id === roomId ? { ...room, roomType } : room))
      }))
      await AssetsService.updateAsset({
        id: roomId,
        subType: 'ROOM' as const,
        bookingMode: roomType === 'static' ? 'STATIC' : 'DYNAMIC'
      })
      await get().fetchResourcesFromApi()
      syncWithCalendar()
    } catch (err: any) {
      console.error('Failed to update room type:', err)
      // Revert optimistic update
      set({ rooms: previousRooms })
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update room type'
      throw new Error(errorMessage)
    }
  },

  cancelRoomBookingModeTransition: async roomId => {
    try {
      await AssetsService.cancelBookingModeTransition(roomId)
      await get().fetchResourcesFromApi()
      syncWithCalendar()
    } catch (err: any) {
      console.error('Failed to cancel room booking mode transition:', err)
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Cannot cancel. There may be bookings after the effective date.'
      throw new Error(errorMessage)
    }
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
