import { create } from 'zustand'
import type { ServiceCategory, ExtendedService, ServiceFormData } from './types'
import { mockCategories, mockExtendedServices, SERVICE_COLORS } from './mock-data'
import { DEFAULT_SERVICE_FORM_DATA } from './types'

// ============================================================================
// Services Management State
// ============================================================================

export interface ServicesState {
  // Data
  categories: ServiceCategory[]
  services: ExtendedService[]

  // UI State
  selectedCategoryId: string | null // null = All Categories, 'uncategorized' = Not categorized
  searchQuery: string
  selectedServiceId: string | null

  // Modal state
  isServiceDialogOpen: boolean
  isCategoryDialogOpen: boolean
  isComboServiceDialogOpen: boolean
  editingService: ExtendedService | null
  editingCategory: ServiceCategory | null

  // Filtered data getters
  getFilteredServices: () => ExtendedService[]
  getCategoryById: (id: string) => ServiceCategory | undefined
  getServiceById: (id: string) => ExtendedService | undefined
  getServicesInCategory: (categoryId: string | null) => ExtendedService[]

  // Category actions
  createCategory: (name: string) => void
  updateCategory: (id: string, updates: Partial<ServiceCategory>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (startIndex: number, endIndex: number) => void

  // Service actions
  createService: (service: Omit<ExtendedService, 'id'>) => void
  updateService: (id: string, updates: Partial<ExtendedService>) => void
  deleteService: (id: string) => void

  // UI actions
  setSelectedCategory: (categoryId: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedService: (serviceId: string | null) => void

  // Modal actions
  openServiceDialog: (service?: ExtendedService) => void
  closeServiceDialog: () => void
  openCategoryDialog: (category?: ServiceCategory) => void
  closeCategoryDialog: () => void
  openComboServiceDialog: () => void
  closeComboServiceDialog: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useServicesStore = create<ServicesState>((set, get) => ({
  // Initial State
  categories: mockCategories,
  services: mockExtendedServices,
  selectedCategoryId: null,
  searchQuery: '',
  selectedServiceId: null,
  isServiceDialogOpen: false,
  isCategoryDialogOpen: false,
  isComboServiceDialogOpen: false,
  editingService: null,
  editingCategory: null,

  // Getters
  getFilteredServices: () => {
    const { services, selectedCategoryId, searchQuery } = get()

    let filtered = services

    // Filter by category
    if (selectedCategoryId === 'uncategorized') {
      filtered = filtered.filter(s => !s.categoryId)
    } else if (selectedCategoryId) {
      filtered = filtered.filter(s => s.categoryId === selectedCategoryId)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  },

  getCategoryById: (id: string) => {
    return get().categories.find(c => c.id === id)
  },

  getServiceById: (id: string) => {
    return get().services.find(s => s.id === id)
  },

  getServicesInCategory: (categoryId: string | null) => {
    const { services } = get()
    if (categoryId === null || categoryId === 'uncategorized') {
      return services.filter(s => !s.categoryId)
    }
    return services.filter(s => s.categoryId === categoryId)
  },

  // Category Actions
  createCategory: (name: string) => {
    const newCategory: ServiceCategory = {
      id: `cat-${Date.now()}`,
      name,
      color: SERVICE_COLORS[get().categories.length % SERVICE_COLORS.length],
      order: get().categories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    set(state => ({
      categories: [...state.categories, newCategory]
    }))
  },

  updateCategory: (id: string, updates: Partial<ServiceCategory>) => {
    set(state => ({
      categories: state.categories.map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    }))
  },

  deleteCategory: (id: string) => {
    // Move services from deleted category to uncategorized
    set(state => ({
      categories: state.categories.filter(c => c.id !== id),
      services: state.services.map(s =>
        s.categoryId === id ? { ...s, categoryId: undefined } : s
      )
    }))
  },

  reorderCategories: (startIndex: number, endIndex: number) => {
    set(state => {
      const newCategories = [...state.categories]
      const [removed] = newCategories.splice(startIndex, 1)
      newCategories.splice(endIndex, 0, removed)

      // Update order property for all categories
      return {
        categories: newCategories.map((cat, index) => ({
          ...cat,
          order: index + 1
        }))
      }
    })
  },

  // Service Actions
  createService: (service: Omit<ExtendedService, 'id'>) => {
    const newService: ExtendedService = {
      ...service,
      id: `svc-${Date.now()}`,
      color: service.color || SERVICE_COLORS[get().services.length % SERVICE_COLORS.length],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    set(state => ({
      services: [...state.services, newService]
    }))
  },

  updateService: (id: string, updates: Partial<ExtendedService>) => {
    set(state => ({
      services: state.services.map(s =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
    }))
  },

  deleteService: (id: string) => {
    set(state => ({
      services: state.services.filter(s => s.id !== id),
      selectedServiceId: state.selectedServiceId === id ? null : state.selectedServiceId
    }))
  },

  // UI Actions
  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategoryId: categoryId })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setSelectedService: (serviceId: string | null) => {
    set({ selectedServiceId: serviceId })
  },

  // Modal Actions
  openServiceDialog: (service?: ExtendedService) => {
    set({
      isServiceDialogOpen: true,
      editingService: service || null
    })
  },

  closeServiceDialog: () => {
    set({
      isServiceDialogOpen: false,
      editingService: null
    })
  },

  openCategoryDialog: (category?: ServiceCategory) => {
    set({
      isCategoryDialogOpen: true,
      editingCategory: category || null
    })
  },

  closeCategoryDialog: () => {
    set({
      isCategoryDialogOpen: false,
      editingCategory: null
    })
  },

  openComboServiceDialog: () => {
    set({ isComboServiceDialogOpen: true })
  },

  closeComboServiceDialog: () => {
    set({ isComboServiceDialogOpen: false })
  }
}))
