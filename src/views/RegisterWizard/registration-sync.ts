/**
 * Registration Data Sync Utility
 *
 * This utility syncs registration data to the application stores:
 * - Staff from registration → Staff Management Store
 * - Services from registration → Services Store
 * - Rooms from registration → Staff Management Store (for static mode)
 * - Business hours → Staff Management Store
 */

import type { BusinessRegistrationData, RegistrationService, StaffMember, Room } from './types'
import { DEFAULT_SERVICE_CATEGORIES } from './types'
import type { ExtendedService } from '@/bookly/features/services/types'
import { useServicesStore } from '@/bookly/features/services/services-store'
import { useStaffManagementStore } from '@/bookly/features/staff-management/staff-store'
import { mockStaff } from '@/bookly/data/mock-data'
import type { WeeklyStaffHours, DayOfWeek } from '@/bookly/features/calendar/types'

// ============================================================================
// Type Conversions
// ============================================================================

/**
 * Convert registration service to ExtendedService format for services store
 */
function convertToExtendedService(service: RegistrationService, businessId: string = '1'): ExtendedService {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    duration: service.duration,
    categoryId: service.categoryId,
    color: service.color,
    // Extended fields
    bufferTime: 0,
    minBookingNotice: 60, // 1 hour default
    maxAdvanceBooking: 60 * 24 * 30, // 30 days default
    allowOnlineBooking: true,
    requireDeposit: false,
    depositAmount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Convert registration staff to mock staff format
 */
function convertToMockStaff(staff: StaffMember, businessId: string = '1') {
  return {
    id: staff.id,
    name: staff.name,
    title: staff.role,
    email: staff.email || '',
    phone: staff.phone || '',
    photo: '', // Default no photo
    color: staff.color || '#0a2c24',
    branchId: staff.branchIds[0] || '1-1', // Primary branch
    businessId,
    isActive: true,
    staffType: 'dynamic' as const, // Default to dynamic
    roomAssignments: [],
    serviceIds: staff.serviceIds || []
  }
}

/**
 * Convert registration room to managed room format
 */
function convertToManagedRoom(room: Room, businessId: string = '1') {
  return {
    id: room.id,
    name: room.name,
    branchId: room.branchId,
    capacity: room.capacity,
    floor: room.floor,
    amenities: room.amenities || [],
    isActive: true,
    roomType: 'static' as const,
    serviceIds: [] as string[],
    description: ''
  }
}

/**
 * Convert registration working hours to staff working hours format
 */
function convertToStaffWorkingHours(registrationHours: BusinessRegistrationData['workingHours']): WeeklyStaffHours {
  const dayMapping: Record<string, DayOfWeek> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  }

  const staffHours: WeeklyStaffHours = {
    Sun: { isWorking: false, shifts: [] },
    Mon: { isWorking: false, shifts: [] },
    Tue: { isWorking: false, shifts: [] },
    Wed: { isWorking: false, shifts: [] },
    Thu: { isWorking: false, shifts: [] },
    Fri: { isWorking: false, shifts: [] },
    Sat: { isWorking: false, shifts: [] }
  }

  Object.entries(registrationHours).forEach(([day, hours]) => {
    const dayOfWeek = dayMapping[day]
    if (dayOfWeek && hours) {
      staffHours[dayOfWeek] = {
        isWorking: hours.isOpen,
        shifts: hours.isOpen
          ? [
              {
                id: `shift-${dayOfWeek}-1`,
                start: hours.open,
                end: hours.close
              }
            ]
          : []
      }
    }
  })

  return staffHours
}

// ============================================================================
// Sync Functions
// ============================================================================

/**
 * Sync registration services to the services store
 */
export function syncServicesToStore(services: RegistrationService[]): void {
  const servicesStore = useServicesStore.getState()

  // Get existing categories from registration types
  const categories = DEFAULT_SERVICE_CATEGORIES.map((cat, index) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    order: index + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))

  // Convert and create services
  services.forEach(service => {
    const extendedService = convertToExtendedService(service)

    // Check if service already exists
    const existing = servicesStore.getServiceById(service.id)
    if (existing) {
      servicesStore.updateService(service.id, extendedService)
    } else {
      servicesStore.createService(extendedService)
    }
  })

  console.log(`[Registration Sync] Synced ${services.length} services to services store`)
}

/**
 * Sync registration staff to the staff management store
 * Note: Staff type (static/dynamic) is now set individually per staff member, not globally
 */
export function syncStaffToStore(
  staff: StaffMember[],
  workingHours: BusinessRegistrationData['workingHours'],
  services: RegistrationService[]
): void {
  const staffStore = useStaffManagementStore.getState()

  // Convert working hours
  const defaultHours = convertToStaffWorkingHours(workingHours)

  staff.forEach(member => {
    // Check if staff member already exists in mockStaff
    const existingIndex = mockStaff.findIndex(s => s.id === member.id)
    const mockStaffData = convertToMockStaff(member)

    // Staff type defaults to 'dynamic', can be changed individually in staff management
    mockStaffData.staffType = 'dynamic'

    if (existingIndex >= 0) {
      // Update existing staff
      mockStaff[existingIndex] = {
        ...mockStaff[existingIndex],
        ...mockStaffData
      }
    } else {
      // Add new staff to mockStaff array
      mockStaff.push(mockStaffData)
    }

    // Create staff member in store (this will add working hours)
    staffStore.createStaffMember({
      ...mockStaffData,
      workingHours: defaultHours
    })

    // Assign services to staff based on registration service assignments
    const assignedServices = services.filter(s => s.staffIds?.includes(member.id)).map(s => s.id)

    if (assignedServices.length > 0) {
      staffStore.assignServicesToStaff(member.id, assignedServices)
    }
  })

  console.log(`[Registration Sync] Synced ${staff.length} staff members to staff management store`)
}

/**
 * Sync registration rooms to the staff management store
 */
export function syncRoomsToStore(rooms: Room[], services: RegistrationService[]): void {
  const staffStore = useStaffManagementStore.getState()

  rooms.forEach(room => {
    const managedRoom = convertToManagedRoom(room)

    // Get services assigned to this room
    const roomServices = services.filter(s => s.roomIds?.includes(room.id)).map(s => s.id)

    managedRoom.serviceIds = roomServices

    // Create room in store
    staffStore.createRoom(managedRoom)
  })

  console.log(`[Registration Sync] Synced ${rooms.length} rooms to staff management store`)
}

/**
 * Sync business hours to staff management store
 */
export function syncBusinessHoursToStore(
  workingHours: BusinessRegistrationData['workingHours'],
  branches: BusinessRegistrationData['branches']
): void {
  const staffStore = useStaffManagementStore.getState()

  const dayMapping: Record<string, DayOfWeek> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  }

  // Apply business hours to all branches
  branches.forEach(branch => {
    Object.entries(workingHours).forEach(([day, hours]) => {
      const dayOfWeek = dayMapping[day]
      if (dayOfWeek && hours) {
        staffStore.updateBusinessHours(branch.id, dayOfWeek, {
          isOpen: hours.isOpen,
          shifts: hours.isOpen ? [{ id: `biz-${dayOfWeek}`, start: hours.open, end: hours.close }] : []
        })
      }
    })
  })

  console.log(`[Registration Sync] Synced business hours for ${branches.length} branches`)
}

// ============================================================================
// Main Sync Function
// ============================================================================

/**
 * Main function to sync all registration data to application stores
 * Call this after successful registration completion
 */
export function syncRegistrationDataToStores(formData: BusinessRegistrationData): void {
  console.log('[Registration Sync] Starting sync of registration data to stores...')

  try {
    // 1. Sync services first (other entities may reference them)
    if (formData.services && formData.services.length > 0) {
      syncServicesToStore(formData.services)
    }

    // 2. Sync staff with their service assignments
    // Note: Staff type (static/dynamic) is set individually per staff, not globally
    if (formData.staff && formData.staff.length > 0) {
      syncStaffToStore(formData.staff, formData.workingHours, formData.services || [])
    }

    // 3. Sync rooms if any are defined
    if (formData.rooms && formData.rooms.length > 0) {
      syncRoomsToStore(formData.rooms, formData.services || [])
    }

    // 4. Sync business hours to all branches
    if (formData.branches && formData.branches.length > 0) {
      syncBusinessHoursToStore(formData.workingHours, formData.branches)
    }

    console.log('[Registration Sync] Successfully synced all registration data!')
  } catch (error) {
    console.error('[Registration Sync] Error syncing registration data:', error)
    throw error
  }
}

/**
 * Check if registration data needs syncing
 * (e.g., if stores are empty or have different data)
 */
export function needsRegistrationSync(formData: BusinessRegistrationData): boolean {
  const servicesStore = useServicesStore.getState()
  const staffStore = useStaffManagementStore.getState()

  // Check if any registration data exists but isn't in stores
  const hasUnSyncedServices = formData.services?.some(s => !servicesStore.getServiceById(s.id))

  const hasUnSyncedStaff = formData.staff?.some(s => !mockStaff.find(m => m.id === s.id))

  return Boolean(hasUnSyncedServices || hasUnSyncedStaff)
}

/**
 * Clear all synced registration data from stores
 * Useful for testing or resetting
 */
export function clearRegistrationDataFromStores(formData: BusinessRegistrationData): void {
  const servicesStore = useServicesStore.getState()
  const staffStore = useStaffManagementStore.getState()

  // Remove services
  formData.services?.forEach(service => {
    servicesStore.deleteService(service.id)
  })

  // Remove staff
  formData.staff?.forEach(staff => {
    staffStore.deleteStaffMember(staff.id)
  })

  // Remove rooms
  formData.rooms?.forEach(room => {
    staffStore.deleteRoom(room.id)
  })

  console.log('[Registration Sync] Cleared all registration data from stores')
}
