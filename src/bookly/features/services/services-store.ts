import { create } from 'zustand'
import type { ServiceCategory, ExtendedService } from './types'
import { ServicesService } from '@/lib/api/services/services.service'
import { CategoriesService } from '@/lib/api/services/categories.service'
import { BusinessService } from '@/lib/api/services/business.service'
import type { Service as ApiService, Category as ApiCategory } from '@/lib/api/types'
import { useAuthStore } from '@/stores/auth.store'

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
  const apiAsAny = api as any

  // Backend may return category in different shapes depending on endpoint joins.
  const categoryIdFromObjectArray =
    Array.isArray(apiAsAny.categories) && apiAsAny.categories.length > 0 && typeof apiAsAny.categories[0] === 'object'
      ? apiAsAny.categories[0]?.id
      : undefined
  const categoryIdFromStringArray =
    Array.isArray(apiAsAny.categories) && apiAsAny.categories.length > 0 && typeof apiAsAny.categories[0] === 'string'
      ? apiAsAny.categories[0]
      : undefined
  const categoryIdFromCategoryIds =
    Array.isArray(apiAsAny.categoryIds) && apiAsAny.categoryIds.length > 0 ? apiAsAny.categoryIds[0] : undefined
  const categoryIdFromSingularObject = apiAsAny.category?.id
  const categoryId =
    apiAsAny.categoryId ||
    categoryIdFromSingularObject ||
    categoryIdFromObjectArray ||
    categoryIdFromStringArray ||
    categoryIdFromCategoryIds

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
    taxRate: (api.taxRate as ExtendedService['taxRate']) || 'tax_free',
    customTaxRate: api.customTaxRate || undefined,
    depositPercentage: api.depositPercentage || undefined,
    variants: api.variants,
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
      const businessId = useAuthStore.getState().materializeUser?.business?.id
      let dataArray: ApiService[] = []

      if (businessId) {
        try {
          const businessResult = await BusinessService.getBusiness(businessId)
          const businessPayload: any = businessResult.data || {}
          const business = businessPayload?.data ?? businessPayload
          const businessServices = Array.isArray(business?.services) ? business.services : []

          if (businessServices.length > 0) {
            dataArray = businessServices
          }
        } catch (businessErr) {
          console.warn('Failed to fetch business-scoped services from /business/{id}:', businessErr)
        }
      }

      if (dataArray.length === 0) {
        const result = await ServicesService.getServices()
        const rawData = result.data
        dataArray = Array.isArray(rawData)
          ? rawData
          : (rawData as any)?.data && Array.isArray((rawData as any).data)
            ? (rawData as any).data
            : []

        if (businessId) {
          dataArray = dataArray.filter(service => service.businessId === businessId)
        }
      }

      const services = dataArray.map((s: ApiService, i: number) => mapApiService(s, i))

      // Prefer categories actually used by this business services to avoid global category noise.
      const categoriesMap = new Map<string, ApiCategory>()
      dataArray.forEach(service => {
        ;(service.categories || []).forEach(category => {
          if (category?.id) {
            categoriesMap.set(category.id, category)
          }
        })
      })
      const derivedCategories = Array.from(categoriesMap.values()).map((c, i) => mapApiCategory(c, i))
      const nextCategories = derivedCategories.length > 0 ? derivedCategories : get().categories

      set({
        services,
        categories: nextCategories,
        isLoading: false
      })
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
          : (rawData as any)?.items && Array.isArray((rawData as any).items)
            ? (rawData as any).items
            : (rawData as any)?.categories && Array.isArray((rawData as any).categories)
              ? (rawData as any).categories
              : (rawData as any)?.data?.categories && Array.isArray((rawData as any).data.categories)
                ? (rawData as any).data.categories
          : []

      const apiCategories: ServiceCategory[] = dataArray.map((c: ApiCategory, i: number) => mapApiCategory(c, i))

      const merged = new Map<string, ServiceCategory>()
      apiCategories.forEach(category => merged.set(category.id, category))

      // Keep service-derived categories if they don't exist in categories endpoint yet.
      get().categories.forEach(category => {
        if (!merged.has(category.id)) {
          merged.set(category.id, category)
        }
      })

      const categories = Array.from(merged.values())

      if (categories.length > 0) {
        set({ categories })
      }
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
      const isCustomTax = service.taxRate === 'custom'
      await ServicesService.createService({
        name: service.name,
        description: service.description,
        location: 'on-site',
        price: service.price,
        duration: service.duration,
        categoryIds: service.categoryId ? [service.categoryId] : undefined,
        ...(service.taxRate && service.taxRate !== 'tax_free' && { taxRate: service.taxRate }),
        ...(isCustomTax && service.customTaxRate !== undefined && { customTaxRate: service.customTaxRate }),
        ...(service.depositPercentage !== undefined && { depositPercentage: service.depositPercentage }),
        ...(service.variants && service.variants.length > 0 && { variants: service.variants })
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
      const isCustomTax = updates.taxRate === 'custom'
      await ServicesService.updateService({
        id,
        name: updates.name,
        description: updates.description,
        price: updates.price,
        duration: updates.duration,
        categoryIds: updates.categoryId ? [updates.categoryId] : undefined,
        ...(updates.taxRate && updates.taxRate !== 'tax_free' && { taxRate: updates.taxRate }),
        ...(isCustomTax && updates.customTaxRate !== undefined && { customTaxRate: updates.customTaxRate }),
        ...(updates.taxRate !== 'custom' && { customTaxRate: undefined }),
        ...(updates.depositPercentage !== undefined && { depositPercentage: updates.depositPercentage }),
        ...(updates.variants !== undefined && { variants: updates.variants })
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
