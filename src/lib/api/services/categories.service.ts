import { apiClient } from '../api-client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'

export class CategoriesService {
  // Public - Get all categories
  static async getCategories() {
    return apiClient.get<Category[]>('/categories')
  }

  // Super Admin only - Create category
  static async createCategory(data: CreateCategoryRequest) {
    return apiClient.post<Category>('/categories', data)
  }

  // Super Admin only - Update category
  static async updateCategory(id: string, data: UpdateCategoryRequest) {
    return apiClient.patch<Category>(`/categories/${id}`, data)
  }

  // Super Admin only - Delete category
  static async deleteCategory(id: string) {
    return apiClient.delete<Category>(`/categories/${id}`)
  }
}