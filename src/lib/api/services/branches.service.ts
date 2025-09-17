import { apiClient } from '../api-client'
import type { Branch, CreateBranchRequest, UpdateBranchRequest } from '../types'

export class BranchesService {
  // Admin only - Get branches for admin's business
  static async getBranches() {
    return apiClient.get<Branch[]>('/branches')
  }

  // Admin only - Create branch
  static async createBranch(data: CreateBranchRequest) {
    return apiClient.post<Branch>('/branches', data)
  }

  // Admin only - Update branch
  static async updateBranch(data: UpdateBranchRequest) {
    return apiClient.patch<Branch>('/branches', data)
  }

  // Admin only - Delete branch
  static async deleteBranch(id: string) {
    return apiClient.delete<Branch>(`/branches/${id}`)
  }
}