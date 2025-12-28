import { create } from 'zustand'
import type { Branch, BranchFormData, BranchService, BranchStaffMember } from './types'
import { mockBranchesData, availableServices, availableStaff } from './mock-data'

// ============================================================================
// Branches Store State
// ============================================================================

export interface BranchesState {
  // Data
  branches: Branch[]

  // UI State
  selectedBranchId: string | null
  searchQuery: string
  statusFilter: 'all' | 'active' | 'inactive'

  // Modal State
  isBranchEditorOpen: boolean
  editingBranch: Branch | null
  isDeleteDialogOpen: boolean
  branchToDelete: Branch | null

  // Getters
  getFilteredBranches: () => Branch[]
  getBranchById: (id: string) => Branch | undefined
  getActiveBranches: () => Branch[]
  getPrimaryBranch: () => Branch | undefined
  getBranchServices: (branchId: string) => BranchService[]
  getBranchStaff: (branchId: string) => BranchStaffMember[]

  // Branch Actions
  createBranch: (data: BranchFormData) => void
  updateBranch: (id: string, data: Partial<BranchFormData>) => void
  deleteBranch: (id: string) => void
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
  // Initial State
  branches: mockBranchesData,
  selectedBranchId: null,
  searchQuery: '',
  statusFilter: 'all',
  isBranchEditorOpen: false,
  editingBranch: null,
  isDeleteDialogOpen: false,
  branchToDelete: null,

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

  // Branch Actions
  createBranch: (data: BranchFormData) => {
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      name: data.name,
      address: data.address,
      city: data.city,
      country: data.country,
      mobile: data.mobile,
      email: data.email || undefined,
      businessId: 'business-1',
      services: data.serviceIds.map(id => {
        const service = availableServices.find(s => s.id === id)
        return service || { id, name: 'Unknown', price: 0, duration: 0 }
      }),
      staff: data.staffIds.map(id => {
        const staff = availableStaff.find(s => s.id === id)
        return staff || { id, name: 'Unknown' }
      }),
      galleryUrls: data.galleryUrls,
      workingHours: data.workingHours,
      isActive: data.isActive,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    set(state => ({
      branches: [...state.branches, newBranch]
    }))
  },

  updateBranch: (id: string, data: Partial<BranchFormData>) => {
    set(state => ({
      branches: state.branches.map(branch => {
        if (branch.id !== id) return branch

        const updates: Partial<Branch> = {
          updatedAt: new Date().toISOString()
        }

        if (data.name !== undefined) updates.name = data.name
        if (data.address !== undefined) updates.address = data.address
        if (data.city !== undefined) updates.city = data.city
        if (data.country !== undefined) updates.country = data.country
        if (data.mobile !== undefined) updates.mobile = data.mobile
        if (data.email !== undefined) updates.email = data.email || undefined
        if (data.galleryUrls !== undefined) updates.galleryUrls = data.galleryUrls
        if (data.workingHours !== undefined) updates.workingHours = data.workingHours
        if (data.isActive !== undefined) updates.isActive = data.isActive

        if (data.serviceIds !== undefined) {
          updates.services = data.serviceIds.map(serviceId => {
            const service = availableServices.find(s => s.id === serviceId)
            return service || { id: serviceId, name: 'Unknown', price: 0, duration: 0 }
          })
        }

        if (data.staffIds !== undefined) {
          updates.staff = data.staffIds.map(staffId => {
            const staff = availableStaff.find(s => s.id === staffId)
            return staff || { id: staffId, name: 'Unknown' }
          })
        }

        return { ...branch, ...updates }
      })
    }))
  },

  deleteBranch: (id: string) => {
    const branch = get().getBranchById(id)
    if (branch?.isPrimary) {
      console.warn('Cannot delete primary branch')
      return
    }

    set(state => ({
      branches: state.branches.filter(branch => branch.id !== id),
      selectedBranchId: state.selectedBranchId === id ? null : state.selectedBranchId
    }))
  },

  toggleBranchStatus: (id: string) => {
    set(state => ({
      branches: state.branches.map(branch =>
        branch.id === id
          ? { ...branch, isActive: !branch.isActive, updatedAt: new Date().toISOString() }
          : branch
      )
    }))
  },

  setPrimaryBranch: (id: string) => {
    set(state => ({
      branches: state.branches.map(branch => ({
        ...branch,
        isPrimary: branch.id === id,
        updatedAt: new Date().toISOString()
      }))
    }))
  },

  // Service & Staff Assignment
  assignServicesToBranch: (branchId: string, serviceIds: string[]) => {
    set(state => ({
      branches: state.branches.map(branch => {
        if (branch.id !== branchId) return branch

        const newServices = serviceIds.map(id => {
          const existing = branch.services.find(s => s.id === id)
          if (existing) return existing

          const service = availableServices.find(s => s.id === id)
          return service || { id, name: 'Unknown', price: 0, duration: 0 }
        })

        return {
          ...branch,
          services: newServices,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },

  assignStaffToBranch: (branchId: string, staffIds: string[]) => {
    set(state => ({
      branches: state.branches.map(branch => {
        if (branch.id !== branchId) return branch

        const newStaff = staffIds.map(id => {
          const existing = branch.staff.find(s => s.id === id)
          if (existing) return existing

          const staff = availableStaff.find(s => s.id === id)
          return staff || { id, name: 'Unknown' }
        })

        return {
          ...branch,
          staff: newStaff,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  },

  removeServiceFromBranch: (branchId: string, serviceId: string) => {
    set(state => ({
      branches: state.branches.map(branch =>
        branch.id === branchId
          ? {
              ...branch,
              services: branch.services.filter(s => s.id !== serviceId),
              updatedAt: new Date().toISOString()
            }
          : branch
      )
    }))
  },

  removeStaffFromBranch: (branchId: string, staffId: string) => {
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
