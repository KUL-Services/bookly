import { apiClient } from '../api-client'
import type { AdminReview, CreateReviewRequest, Review } from '../types'

export class ReviewsService {
  // Admin only - Get all reviews for the business
  static async getReviews() {
    return apiClient.get<AdminReview[]>('/admin/reviews')
  }

  // User - Get the authenticated user's own reviews
  static async getUserReviews() {
    return apiClient.get<Review[]>('/reviews/my')
  }

  // Create a review (User)
  static async createReview(data: CreateReviewRequest) {
    return apiClient.post<Review>('/reviews', data)
  }

  // Admin only - Reply to a review
  static async replyToReview(reviewId: string, reply: string) {
    return apiClient.post<AdminReview>(`/admin/reviews/${reviewId}/reply`, { reply })
  }

  // Admin only - Flag a review
  static async flagReview(reviewId: string, reason: string) {
    return apiClient.post<AdminReview>(`/admin/reviews/${reviewId}/flag`, { reason })
  }
}
