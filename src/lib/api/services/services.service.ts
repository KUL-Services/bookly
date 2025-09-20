import { apiClient } from '../api-client'
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '../types'

// Note: API spec currently doesn't expose query parameters for services
// UI should handle filtering client-side as per api-flow-map.md
interface ServiceQueryParams {
  // Currently no query params supported by API spec
  // Client-side filtering should be used instead
}

export class ServicesService {
  // Public - Get all services (no query parameters supported by API)
  static async getServices() {
    return apiClient.get<Service[]>('/service')
  }

  // Public - Get specific service by ID (includes categories, branches, business, and reviews)
  static async getService(id: string) {
    return apiClient.get<Service>(`/service/${id}`)
  }

  // Admin only - Create service (API spec requires name, location, price, duration)
  static async createService(data: CreateServiceRequest) {
    return apiClient.post<Service>('/service', data)
  }

  // Admin only - Update service (API spec requires id and allows optional fields)
  static async updateService(data: UpdateServiceRequest) {
    return apiClient.patch<Service>('/service', data)
  }

  // Admin only - Delete service
  static async deleteService(id: string) {
    return apiClient.delete<Service>(`/service/${id}`)
  }
}