import { apiClient } from '../api-client'
import type { Branch, CreateBranchRequest, UpdateBranchRequest } from '../types'

export class BranchesService {
  // Admin only - Get branches for admin's business
  static async getBranches() {
    return apiClient.get<Branch[]>('/branches')
  }

  // Admin only - Create branch (API spec supports name, address, mobile, serviceIds)
  static async createBranch(data: CreateBranchRequest) {
    // Remove any unsupported fields like staff assignments
    const { staff, ...branchData } = data as any
    return apiClient.post<Branch>('/branches', branchData)
  }

  // Admin only - Update branch (API spec requires id, name and supports address, mobile, serviceIds)
  static async updateBranch(data: UpdateBranchRequest) {
    // Remove any unsupported fields like staff assignments
    const { staff, ...branchData } = data as any
    return apiClient.patch<Branch>('/branches', branchData)
  }

  // Admin only - Delete branch
  static async deleteBranch(id: string) {
    return apiClient.delete<Branch>(`/branches/${id}`)
  }
}