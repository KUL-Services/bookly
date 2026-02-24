import { create } from 'zustand'
import type { ServiceCategory, ExtendedService } from './types'
import { ServicesService } from '@/lib/api/services/services.service'
import { CategoriesService } from '@/lib/api/services/categories.service'
import type { Service as ApiService, Category as ApiCategory } from '@/lib/api/types'

// ============================================================================
// Constants
// ============================================================================

const SERVICE_COLORS = [
  '#0a2c24',
  '#202c39',
  '#51b4b7',
  '#e74c3c',
  '#3498db',
  '#9b59b6',
  '#f39c12',
  '#27ae60',
  '#1abc9c',
  '#e91e63',
  '#795548',
  '#607d8b'
]

// ============================================================================
// Helpers: Map API types → Frontend types
// ============================================================================

function mapApiCategory(api: ApiCategory, index: number): ServiceCategory {
  return {
    id: api.id,
    name: api.name,
    color: SERVICE_COLORS[index % SERVICE_COLORS.length],
    order: index + 1,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt
  }
}

function mapApiService(api: ApiService, index: number): ExtendedService {
  // If the API returns categories, use the first one as categoryId
  const categoryId = api.categories && api.categories.length > 0 ? api.categories[0].id : undefined

  return {
    id: api.id,
    name: api.name,
    description: api.description || '',
    price: api.price,
    duration: api.duration,
    categoryId,
    color: SERVICE_COLORS[index % SERVICE_COLORS.length],
    businessId: api.businessId,
    // Frontend-only defaults
    bookingInterval: { hours: 0, minutes: 15 },
    paddingTime: { rule: 'none', minutes: 0 },
    processingTime: {
      during: { hours: 0, minutes: 0 },
      after: { hours: 0, minutes: 0 }
    },
    taxRate: 'tax_free',
    parallelClients: api.maxConcurrent || 1,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt
  }
}

// ============================================================================
// Services Management State
// ============================================================================

export interface ServicesState {
  // Data
  categories: ServiceCategory[]
  services: ExtendedService[]
  isLoading: boolean
  error: string | null

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

  // API Actions
  fetchServices: () => Promise<void>
  fetchCategories: () => Promise<void>

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
  createService: (service: Omit<ExtendedService, 'id'>) => Promise<void>
  updateService: (id: string, updates: Partial<ExtendedService>) => Promise<void>
  deleteService: (id: string) => Promise<void>

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
  // Initial State — empty, populated by fetch
  categories: [],
  services: [],
  isLoading: false,
  error: null,
  selectedCategoryId: null,
  searchQuery: '',
  selectedServiceId: null,
  isServiceDialogOpen: false,
  isCategoryDialogOpen: false,
  isComboServiceDialogOpen: false,
  editingService: null,
  editingCategory: null,

  // API Actions
  fetchServices: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await ServicesService.getServices()
      const rawData = result.data
      const dataArray = Array.isArray(rawData)
        ? rawData
        : (rawData as any)?.data && Array.isArray((rawData as any).data)
          ? (rawData as any).data
          : []

      const services = dataArray.map((s: ApiService, i: number) => mapApiService(s, i))
      set({ services, isLoading: false })
    } catch (err: any) {
      console.warn('Failed to fetch services from API:', err)
      set({ error: err?.message || 'Failed to fetch services', isLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const result = await CategoriesService.getCategories()
      const rawData = result.data
      const dataArray = Array.isArray(rawData)
        ? rawData
        : (rawData as any)?.data && Array.isArray((rawData as any).data)
          ? (rawData as any).data
          : []

      const categories = dataArray.map((c: ApiCategory, i: number) => mapApiCategory(c, i))
      set({ categories })
    } catch (err: any) {
      console.warn('Failed to fetch categories from API:', err)
      // Non-critical — categories may not exist yet
    }
  },

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
        s => s.name.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query)
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

  // Category Actions — local-only (CategoriesService CRUD is super admin only)
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
      services: state.services.map(s => (s.categoryId === id ? { ...s, categoryId: undefined } : s))
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

  // Service Actions — wired to API
  createService: async (service: Omit<ExtendedService, 'id'>) => {
    try {
      await ServicesService.createService({
        name: service.name,
        description: service.description,
        location: 'on-site',
        price: service.price,
        duration: service.duration,
        categoryIds: service.categoryId ? [service.categoryId] : undefined
      })
      // Refetch to get server-generated ID
      await get().fetchServices()
    } catch (err: any) {
      console.error('Failed to create service:', err)
      set({ error: err?.message || 'Failed to create service' })
    }
  },

  updateService: async (id: string, updates: Partial<ExtendedService>) => {
    try {
      await ServicesService.updateService({
        id,
        name: updates.name,
        description: updates.description,
        price: updates.price,
        duration: updates.duration,
        categoryIds: updates.categoryId ? [updates.categoryId] : undefined
      })
      await get().fetchServices()
    } catch (err: any) {
      console.error('Failed to update service:', err)
      set({ error: err?.message || 'Failed to update service' })
    }
  },

  deleteService: async (id: string) => {
    try {
      await ServicesService.deleteService(id)
      await get().fetchServices()
    } catch (err: any) {
      console.error('Failed to delete service:', err)
      set({ error: err?.message || 'Failed to delete service' })
    }
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
