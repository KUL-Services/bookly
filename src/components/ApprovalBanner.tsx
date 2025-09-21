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
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-red-800">
              Business Approval Required
            </h3>
            <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
              Under Review
            </div>
          </div>
          <div className="text-red-700 space-y-3">
            <p className="text-sm font-medium">
              Your business <strong>"{business.name}"</strong> is currently under review. You can manage your business data, but customer-facing features are disabled.
            </p>

            <div className="bg-green-100/50 p-3 rounded-md border border-green-200">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-2">
                  <p className="font-medium text-green-800">What you can do while under review:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-600">
                    <li>Create, edit, and delete your services</li>
                    <li>Manage your staff members</li>
                    <li>Add and modify your branches</li>
                    <li>Update your business profile</li>
                    <li>Prepare your business for launch</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-100/50 p-3 rounded-md border border-red-200">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-medium text-red-800">Customer-facing restrictions:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>Your business will not appear in customer searches</li>
                    <li>No customer bookings can be made</li>
                    <li>Public business profile is hidden</li>
                    <li>Email notifications will be sent upon approval</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">
                  You'll receive full access once approved
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Need help? Contact support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}