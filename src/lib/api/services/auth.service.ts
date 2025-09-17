import { apiClient } from '../api-client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  RegisterAdminRequest,
  VerifyAccountRequest,
  VerificationResponse,
} from '../types'

export class AuthService {
  // User Authentication
  static async registerUser(data: RegisterUserRequest) {
    return apiClient.post<{ verificationToken: string }>('/auth/user/register', data)
  }

  static async verifyUser(data: VerifyAccountRequest) {
    return apiClient.post('/auth/user/verify', data)
  }

  static async loginUser(data: LoginRequest) {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)

    return apiClient.post<LoginResponse>('/auth/user/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }

  // Admin Authentication
  static async registerAdmin(data: RegisterAdminRequest) {
    return apiClient.post('/auth/admin/register', data)
  }

  static async verifyAdmin(data: VerifyAccountRequest) {
    return apiClient.post('/auth/admin/verify', data)
  }

  static async loginAdmin(data: LoginRequest) {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)

    return apiClient.post<LoginResponse>('/auth/admin/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }

  // Super Admin Authentication
  static async loginSuperAdmin(data: LoginRequest) {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)

    return apiClient.post<LoginResponse>('/auth/super-admin/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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
    apiClient.clearAuthToken()
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