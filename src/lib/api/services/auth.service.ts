import { apiClient } from '../api-client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  RegisterAdminRequest,
  VerifyAccountRequest,
  VerificationResponse,
  UpdateUserRequest
} from '../types'

export class AuthService {
  // User Authentication
  static async registerUser(data: RegisterUserRequest) {
    return apiClient.post<{ verificationToken: string }>('/auth/register', data)
  }

  static async verifyUser(data: VerifyAccountRequest) {
    return apiClient.post('/auth/verify', data)
  }

  static async loginUser(data: LoginRequest) {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)

    return apiClient.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  static async forgotPasswordUser(email: string) {
    return apiClient.post<{ verificationToken: string }>('/auth/forget-password', { email })
  }

  static async resetPasswordUser(data: { email: string; code: string; password: string }) {
    return apiClient.post('/auth/reset-password', data)
  }

  static async updateUser(data: UpdateUserRequest) {
    return apiClient.patch('/auth', data)
  }

  static async changePassword(password: string) {
    return apiClient.patch<{ message: string }>('/auth/password', { password })
  }

  static async getUserDetails() {
    return apiClient.get('/auth/details')
  }

  // Admin Authentication
  static async registerAdmin(data: RegisterAdminRequest) {
    return apiClient.post('/admin/auth/register', data)
  }

  static async verifyAdmin(data: VerifyAccountRequest) {
    return apiClient.post('/admin/auth/verify', data)
  }

  static async loginAdmin(data: LoginRequest) {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)

    return apiClient.post<LoginResponse>('/admin/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  static async forgotPasswordAdmin(email: string) {
    return apiClient.post<{ verificationToken: string }>('/admin/auth/forget-password', { email })
  }

  static async resetPasswordAdmin(data: { email: string; code: string; password: string }) {
    return apiClient.post('/admin/auth/reset-password', data)
  }

  static async getAdminDetails() {
    return apiClient.get('/admin/auth/details')
  }

  // Super Admin Authentication
  static async loginSuperAdmin(data: LoginRequest) {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)

    return apiClient.post<LoginResponse>('/superadmin/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  // Token management
  static setAuthToken(token: string) {
    apiClient.setAuthToken(token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  static clearAuthToken() {
    apiClient.forceCleanupToken()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  static getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  static initializeAuth() {
    const token = this.getStoredToken()
    if (token) {
      apiClient.setAuthToken(token)
    }
  }
}
