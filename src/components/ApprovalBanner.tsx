'use client'

import { useAuthStore } from '@/stores/auth.store'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

export const ApprovalBanner = () => {
  const { materializeUser } = useAuthStore()

  // Don't show banner if no user or no business data
  if (!materializeUser?.business) {
    return null
  }

  const { business } = materializeUser
  const isApproved = business.approved

  // Don't show banner if business is already approved
  if (isApproved) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-amber-800">
              Business Approval Pending
            </h3>
            <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
              Under Review
            </div>
          </div>
          <div className="text-amber-700 space-y-2">
            <p className="text-sm">
              Your business <strong>"{business.name}"</strong> is currently under review by our team.
            </p>
            <div className="bg-amber-100/50 p-3 rounded-md border border-amber-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-medium">What this means:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-600">
                    <li>Your business will not appear in customer search results</li>
                    <li>Customers cannot book your services yet</li>
                    <li>You can still set up your business profile, services, and staff</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-700">
                You'll receive an email notification once your business is approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}