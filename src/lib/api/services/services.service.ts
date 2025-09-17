import { apiClient } from '../api-client'
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '../types'

export class ServicesService {
  // Public - Get all services
  static async getServices() {
    return apiClient.get<Service[]>('/service')
  }

  // Public - Get specific service by ID
  static async getService(id: string) {
    return apiClient.get<Service>(`/service/${id}`)
  }

  // Admin only - Create service
  static async createService(data: CreateServiceRequest) {
    return apiClient.post<Service>('/service', data)
  }

  // Admin only - Update service
  static async updateService(data: UpdateServiceRequest) {
    return apiClient.patch<Service>('/service', data)
  }

  // Admin only - Delete service
  static async deleteService(id: string) {
    return apiClient.delete<Service>(`/service/${id}`)
  }
}