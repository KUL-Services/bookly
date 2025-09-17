import { apiClient } from '../api-client'
import type { AssetFile, CreateAssetRequest, CreateAssetResponse } from '../types'

export class MediaService {
  // Admin/User - Create asset placeholder and get upload URL
  static async createAsset(data: CreateAssetRequest) {
    return apiClient.post<CreateAssetResponse>('/media-lib', data)
  }

  // Admin/User - Update asset metadata and get new upload URL
  static async updateAsset(id: string, data: Partial<CreateAssetRequest>) {
    return apiClient.patch<CreateAssetResponse>(`/media-lib/${id}`, data)
  }

  // Admin/User - Delete asset
  static async deleteAsset(id: string) {
    return apiClient.delete(`/media-lib/${id}`)
  }

  // Helper method to upload file to S3 using the signed URL
  static async uploadFileToS3(uploadUrl: string, file: File) {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return { success: true }
    } catch (error) {
      console.error('File upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  // Complete upload flow: create asset + upload file
  static async uploadFile(file: File) {
    try {
      // 1. Create asset placeholder
      const assetResponse = await this.createAsset({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      })

      if (assetResponse.error || !assetResponse.data) {
        return { error: assetResponse.error || 'Failed to create asset' }
      }

      // 2. Upload file to S3
      const uploadResult = await this.uploadFileToS3(
        assetResponse.data.uploadUrl,
        file
      )

      if (!uploadResult.success) {
        return { error: uploadResult.error }
      }

      return {
        success: true,
        assetFileId: assetResponse.data.assetFileId
      }
    } catch (error) {
      console.error('Complete upload failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }
}