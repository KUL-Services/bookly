import { create } from 'zustand'
import type { Branch, BranchFormData, BranchService, BranchStaffMember } from './types'
import { DEFAULT_WORKING_HOURS } from './types'
import { BranchesService } from '@/lib/api/services/branches.service'
import { ServicesService } from '@/lib/api/services/services.service'
import type { Branch as ApiBranch, Service as ApiService } from '@/lib/api/types'

// ============================================================================
// Helper: Map API Branch → Frontend Branch
// ============================================================================

const dayToApiKey: Record<string, string> = {
  Sun: 'sunday',
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
  Sat: 'saturday'
}

function mapApiWorkingHours(
  hours?: Record<string, { open?: string; close?: string; isOpen?: boolean }>
): Branch['workingHours'] {
  const defaults = DEFAULT_WORKING_HOURS.map(item => ({ ...item }))
  if (!hours) return defaults

  return defaults.map(item => {
    const apiKey = dayToApiKey[item.day]
    const entry = hours[apiKey]
    if (!entry) return item
    return {
      ...item,
      isOpen: entry.isOpen ?? item.isOpen,
      openTime: entry.open || item.openTime,
      closeTime: entry.close || item.closeTime
    }
  })
}

function toApiWorkingHours(hours: BranchFormData['workingHours'] | undefined) {
  if (!hours || hours.length === 0) return undefined
  const payload: Record<string, { open: string; close: string; isOpen: boolean }> = {}
  hours.forEach(item => {
    const dayKey = dayToApiKey[item.day]
    if (!dayKey) return
    payload[dayKey] = {
      open: item.openTime,
      close: item.closeTime,
      isOpen: item.isOpen
    }
  })
  return payload
}

function mapApiBranch(api: ApiBranch): Branch {
  const sanitizeLocationPart = (value?: string) => {
    const cleaned = (value || '').trim()
    if (!cleaned) return ''
    // Avoid placeholder punctuation values like "," that render as orphan lines.
    if (/^[,.\-_/\\\s]+$/.test(cleaned)) return ''
    return cleaned
  }

  // Extract staff from resources array (staff are resources with type: 'STAFF')
  const staffFromResources = (api.resources || [])
    .filter((r: any) => r.type === 'STAFF')
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      title: r.title || undefined,
      color: r.color || undefined
    }))

  // Also check api.staff for backwards compatibility
  const staffFromStaffArray = (api.staff || []).map(s => ({
    id: s.id,
    name: s.name,
    title: undefined,
    color: undefined
  }))

  // Merge both sources, preferring resources (which is the current backend response)
  const allStaff = staffFromResources.length > 0 ? staffFromResources : staffFromStaffArray

  const addressParts = (api.address || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
  const guessedCountry = addressParts.length > 0 ? addressParts[addressParts.length - 1] : ''
  const guessedCity = addressParts.length > 1 ? addressParts[addressParts.length - 2] : ''
  const apiWorkingHours = mapApiWorkingHours((api as any).workingHours)

  return {
    id: api.id,
    name: api.name,
    address: api.address || '',
    city: sanitizeLocationPart((api as any).city) || sanitizeLocationPart(guessedCity),
    country: sanitizeLocationPart((api as any).country) || sanitizeLocationPart(guessedCountry),
    mobile: api.mobile || '',
    email: (api as any).email || '',
    businessId: api.businessId,
    latitude: api.latitude,
    longitude: api.longitude,
    formattedAddress: (api as any).formattedAddress || api.address || '',
    placeId: (api as any).placeId || '',

    // Map nested services from API if present
    services: (api.services || []).map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration
    })),
    // Use merged staff from resources and/or staff array
    staff: allStaff,
    galleryUrls: api.galleryUrls || api.gallery || [],
    workingHours: apiWorkingHours,

    isActive: (api as any).isActive !== false,
    isPrimary: false,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt
  }
}

// ============================================================================
// Branches Store State
// ============================================================================

export interface BranchesState {
  // Data
  branches: Branch[]
  availableServices: ApiService[] // Real services from API
  isLoading: boolean
  error: string | null

  // UI State
  selectedBranchId: string | null
  searchQuery: string
  statusFilter: 'all' | 'active' | 'inactive'

  // Modal State
  isBranchEditorOpen: boolean
  editingBranch: Branch | null
  isDeleteDialogOpen: boolean
  branchToDelete: Branch | null

  // API Actions
  fetchBranches: () => Promise<void>
  fetchServices: () => Promise<void>

  // Getters
  getFilteredBranches: () => Branch[]
  getBranchById: (id: string) => Branch | undefined
  getActiveBranches: () => Branch[]
  getPrimaryBranch: () => Branch | undefined
  getBranchServices: (branchId: string) => BranchService[]
  getBranchStaff: (branchId: string) => BranchStaffMember[]

  // Branch Actions
  createBranch: (data: BranchFormData) => Promise<void>
  updateBranch: (id: string, data: Partial<BranchFormData>) => Promise<void>
  deleteBranch: (id: string) => Promise<void>
  toggleBranchStatus: (id: string) => void
  setPrimaryBranch: (id: string) => void

  // Service & Staff Assignment
  assignServicesToBranch: (branchId: string, serviceIds: string[]) => void
  assignStaffToBranch: (branchId: string, staffIds: string[]) => void
  removeServiceFromBranch: (branchId: string, serviceId: string) => void
  removeStaffFromBranch: (branchId: string, staffId: string) => void

  // UI Actions
  setSelectedBranch: (branchId: string | null) => void
  setSearchQuery: (query: string) => void
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void
  openBranchEditor: (branch?: Branch) => void
  closeBranchEditor: () => void
  openDeleteDialog: (branch: Branch) => void
  closeDeleteDialog: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useBranchesStore = create<BranchesState>((set, get) => ({
  // Initial State — empty, populated by fetchBranches()
  branches: [],
  availableServices: [], // Real services from API
  isLoading: false,
  error: null,
  selectedBranchId: null,
  searchQuery: '',
  statusFilter: 'all',
  isBranchEditorOpen: false,
  editingBranch: null,
  isDeleteDialogOpen: false,
  branchToDelete: null,

  // API Actions
  fetchBranches: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await BranchesService.getBranches()
      const rawData = result.data

      const dataArray = Array.isArray(rawData)
        ? rawData
        : (rawData as any)?.data && Array.isArray((rawData as any).data)
          ? (rawData as any).data
          : []

      const branches = dataArray.map(mapApiBranch)

      // Mark the first branch as primary if none set
      if (branches.length > 0) {
        branches[0].isPrimary = true
      }
      set({ branches, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch branches from API:', err)
      set({ error: err?.message || 'Failed to fetch branches', isLoading: false })
    }
  },

  // Fetch real services from API for branch assignment
  fetchServices: async () => {
    try {
      const result = await ServicesService.getServices()
      const rawData = result.data
      const dataArray = Array.isArray(rawData)
        ? rawData
        : (rawData as any)?.data && Array.isArray((rawData as any).data)
          ? (rawData as any).data
          : []
      set({ availableServices: dataArray })
    } catch (err: any) {
      console.warn('Failed to fetch services from API:', err)
    }
  },

  // Getters
  getFilteredBranches: () => {
    const { branches, searchQuery, statusFilter } = get()

    let filtered = branches

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        branch =>
          branch.name.toLowerCase().includes(query) ||
          branch.address.toLowerCase().includes(query) ||
          branch.city.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(branch => branch.isActive)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(branch => !branch.isActive)
    }

    return filtered
  },

  getBranchById: (id: string) => {
    return get().branches.find(branch => branch.id === id)
  },

  getActiveBranches: () => {
    return get().branches.filter(branch => branch.isActive)
  },

  getPrimaryBranch: () => {
    return get().branches.find(branch => branch.isPrimary)
  },

  getBranchServices: (branchId: string) => {
    const branch = get().getBranchById(branchId)
    return branch?.services || []
  },

  getBranchStaff: (branchId: string) => {
    const branch = get().getBranchById(branchId)
    return branch?.staff || []
  },

  // Branch Actions — wired to API
  createBranch: async (data: BranchFormData) => {
    try {
      await BranchesService.createBranch({
        name: data.name,
        address: data.formattedAddress || data.address,
        email: data.email,
        city: data.city,
        country: data.country,
        formattedAddress: data.formattedAddress,
        placeId: data.placeId,
        timezone: 'Africa/Cairo',
        workingHours: toApiWorkingHours(data.workingHours),
        isActive: data.isActive,
        mobile: data.mobile,
        serviceIds: data.serviceIds,
        gallery: data.galleryUrls,
        latitude: data.latitude,
        longitude: data.longitude
      })
      // Refetch to get server-generated ID and all nested data
      await get().fetchBranches()
    } catch (err: any) {
      console.error('Failed to create branch:', err)
      set({ error: err?.message || 'Failed to create branch' })
    }
  },

  updateBranch: async (id: string, data: Partial<BranchFormData>) => {
    try {
      const existing = get().getBranchById(id)
      await BranchesService.updateBranch({
        id,
        name: data.name || existing?.name || '',
        address: data.formattedAddress || data.address,
        email: data.email,
        city: data.city,
        country: data.country,
        formattedAddress: data.formattedAddress,
        placeId: data.placeId,
        timezone: 'Africa/Cairo',
        workingHours: toApiWorkingHours(data.workingHours),
        isActive: data.isActive,
        mobile: data.mobile,
        serviceIds: data.serviceIds,
        gallery: data.galleryUrls,
        latitude: data.latitude,
        longitude: data.longitude
      })
      await get().fetchBranches()
    } catch (err: any) {
      console.error('Failed to update branch:', err)
      set({ error: err?.message || 'Failed to update branch' })
    }
  },

  deleteBranch: async (id: string) => {
    const branch = get().getBranchById(id)
    if (branch?.isPrimary) {
      console.warn('Cannot delete primary branch')
      return
    }

    try {
      await BranchesService.deleteBranch(id)
      await get().fetchBranches()
    } catch (err: any) {
      console.error('Failed to delete branch:', err)
      set({ error: err?.message || 'Failed to delete branch' })
    }
  },

  toggleBranchStatus: (id: string) => {
    const branch = get().getBranchById(id)
    if (!branch) return

    void (async () => {
      try {
        const result = await BranchesService.updateBranchStatus(id, !branch.isActive)
        if (result.error) {
          throw new Error(result.error)
        }
        await get().fetchBranches()
      } catch (err: any) {
        set({ error: err?.message || 'Failed to update branch status' })
      }
    })()
  },

  setPrimaryBranch: (id: string) => {
    // Local-only: API doesn't support isPrimary
    set(state => ({
      branches: state.branches.map(branch => ({
        ...branch,
        isPrimary: branch.id === id,
        updatedAt: new Date().toISOString()
      }))
    }))
  },

  // Service & Staff Assignment — local-only (update API via updateBranch for serviceIds)
  assignServicesToBranch: (branchId: string, serviceIds: string[]) => {
    // Optimistic local update, then sync to API
    const branch = get().getBranchById(branchId)
    if (!branch) return

    const newServices = serviceIds.map(id => {
      const existing = branch.services.find(s => s.id === id)
      return existing || { id, name: 'Service', price: 0, duration: 0 }
    })

    set(state => ({
      branches: state.branches.map(b =>
        b.id === branchId ? { ...b, services: newServices, updatedAt: new Date().toISOString() } : b
      )
    }))

    // Fire API update in background
    BranchesService.updateBranch({
      id: branchId,
      name: branch.name,
      serviceIds
    }).catch(err => console.warn('Failed to sync services to API:', err))
  },

  assignStaffToBranch: (branchId: string, staffIds: string[]) => {
    // Local-only: API doesn't support staff assignment via branch endpoint
    const branch = get().getBranchById(branchId)
    if (!branch) return

    const newStaff = staffIds.map(id => {
      const existing = branch.staff.find(s => s.id === id)
      return existing || { id, name: 'Staff' }
    })

    set(state => ({
      branches: state.branches.map(b =>
        b.id === branchId ? { ...b, staff: newStaff, updatedAt: new Date().toISOString() } : b
      )
    }))
  },

  removeServiceFromBranch: (branchId: string, serviceId: string) => {
    const branch = get().getBranchById(branchId)
    if (!branch) return

    const remainingIds = branch.services.filter(s => s.id !== serviceId).map(s => s.id)

    set(state => ({
      branches: state.branches.map(b =>
        b.id === branchId
          ? {
              ...b,
              services: b.services.filter(s => s.id !== serviceId),
              updatedAt: new Date().toISOString()
            }
          : b
      )
    }))

    // Sync to API
    BranchesService.updateBranch({
      id: branchId,
      name: branch.name,
      serviceIds: remainingIds
    }).catch(err => console.warn('Failed to sync service removal to API:', err))
  },

  removeStaffFromBranch: (branchId: string, staffId: string) => {
    // Local-only
    set(state => ({
      branches: state.branches.map(branch =>
        branch.id === branchId
          ? {
              ...branch,
              staff: branch.staff.filter(s => s.id !== staffId),
              updatedAt: new Date().toISOString()
            }
          : branch
      )
    }))
  },

  // UI Actions
  setSelectedBranch: (branchId: string | null) => {
    set({ selectedBranchId: branchId })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => {
    set({ statusFilter: filter })
  },

  openBranchEditor: (branch?: Branch) => {
    set({
      isBranchEditorOpen: true,
      editingBranch: branch || null
    })
  },

  closeBranchEditor: () => {
    set({
      isBranchEditorOpen: false,
      editingBranch: null
    })
  },

  openDeleteDialog: (branch: Branch) => {
    set({
      isDeleteDialogOpen: true,
      branchToDelete: branch
    })
  },

  closeDeleteDialog: () => {
    set({
      isDeleteDialogOpen: false,
      branchToDelete: null
    })
  }
}))
