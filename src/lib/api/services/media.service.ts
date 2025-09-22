import { apiClient } from '../api-client'
import type { AssetFile, CreateAssetRequest, CreateAssetResponse } from '../types'

export class MediaService {
  // Admin/User - Create asset and upload file directly
  static async createAsset(data: CreateAssetRequest) {
    return apiClient.post<CreateAssetResponse>('/media-lib', data)
  }

  // Admin/User - Update asset metadata
  static async updateAsset(id: string, data: Partial<CreateAssetRequest>) {
    return apiClient.patch<CreateAssetResponse>(`/media-lib/${id}`, data)
  }

  // Admin/User - Delete asset
  static async deleteAsset(id: string) {
    return apiClient.delete(`/media-lib/${id}`)
  }

  // Get asset URL by ID
  static async getAssetUrl(assetId: string): Promise<string | null> {
    try {
      // In a real implementation, this would fetch from a GET /media-lib/{id} endpoint
      // For now, we'll construct a URL pattern based on the asset ID
      return `/api/assets/${assetId}`
    } catch (error) {
      console.error('Failed to get asset URL:', error)
      return null
    }
  }

  // Get multiple asset URLs
  static async getAssetUrls(assetIds: string[]): Promise<(string | null)[]> {
    try {
      return Promise.all(assetIds.map(id => this.getAssetUrl(id)))
    } catch (error) {
      console.error('Failed to get asset URLs:', error)
      return assetIds.map(() => null)
    }
  }

  // Complete upload flow: create asset placeholder, return assetFileId immediately
  static async uploadFile(file: File) {
    try {
      // Create asset placeholder and get assetFileId
      const assetResponse = await this.createAsset({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      })

      if (assetResponse.error || !assetResponse.data) {
        return { error: assetResponse.error || 'Failed to create asset' }
      }

      // Return assetFileId immediately without using uploadUrl
      return {
        success: true,
        assetFileId: assetResponse.data.assetFileId
      }
    } catch (error) {
      console.error('Upload failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  // Upload multiple files and return their IDs
  static async uploadMultipleFiles(files: File[]) {
    try {
      const results = await Promise.allSettled(files.map(file => this.uploadFile(file)))

      const successes: string[] = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successes.push(result.value.assetFileId)
        } else {
          const error = result.status === 'fulfilled' ? result.value.error : result.reason?.message || 'Upload failed'
          errors.push(`File ${files[index].name}: ${error}`)
        }
      })

      return {
        success: errors.length === 0,
        assetFileIds: successes,
        errors: errors.length > 0 ? errors : undefined
      }
    } catch (error) {
      console.error('Multiple file upload failed:', error)
      return {
        success: false,
        assetFileIds: [],
        errors: [error instanceof Error ? error.message : 'Upload failed']
      }
    }
  }

  // Validate image file
  static validateImageFile(file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Only image files are allowed' }
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
    }

    // Check specific image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { isValid: false, error: 'Only JPEG, PNG, WebP and GIF images are allowed' }
    }

    return { isValid: true }
  }

  // Validate multiple image files
  static validateImageFiles(files: File[], maxSizeMB: number = 5): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    files.forEach((file, index) => {
      const validation = this.validateImageFile(file, maxSizeMB)
      if (!validation.isValid) {
        errors.push(`File ${index + 1} (${file.name}): ${validation.error}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
