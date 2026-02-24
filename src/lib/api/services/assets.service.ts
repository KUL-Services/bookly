import { apiClient } from '../api-client'
import type { Asset, CreateAssetResourceRequest, UpdateAssetResourceRequest } from '../types'

export class AssetsService {
  // Admin only - Get all assets for the business
  static async getAssets() {
    return apiClient.get<Asset[]>('/admin/assets')
  }

  // Admin only - Get specific asset
  static async getAsset(id: string) {
    return apiClient.get<Asset>(`/admin/assets/${id}`)
  }

  // Admin only - Create asset (room, equipment, etc.)
  static async createAsset(data: CreateAssetResourceRequest) {
    return apiClient.post<Asset>('/admin/assets', data)
  }

  // Admin only - Update asset
  static async updateAsset(data: UpdateAssetResourceRequest) {
    return apiClient.patch<Asset>('/admin/assets', data)
  }

  // Admin only - Delete asset
  static async deleteAsset(id: string) {
    return apiClient.delete<{ message: string }>(`/admin/assets/${id}`)
  }

  // Admin only - Cancel booking mode transition
  // Try DELETE endpoint first (similar to staff), fallback to PATCH with null
  static async cancelBookingModeTransition(id: string) {
    try {
      // Try DELETE endpoint (mirrors staff endpoint pattern)
      return await apiClient.delete<Asset>(`/admin/assets/${id}/booking-mode-transition`)
    } catch (deleteError: any) {
      // If DELETE endpoint doesn't exist (404), try PATCH with explicit nulls
      if (deleteError?.response?.status === 404) {
        return apiClient.patch<Asset>('/admin/assets', {
          id,
          pendingBookingMode: null,
          bookingModeEffectiveDate: null
        })
      }
      throw deleteError
    }
  }
}
