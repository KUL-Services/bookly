'use client'

import { useAuthStore } from '@/stores/auth.store'

export const useBusinessApproval = () => {
  const { materializeUser } = useAuthStore()

  const isBusinessApproved = materializeUser?.business?.approved ?? false
  const businessId = materializeUser?.business?.id
  const businessName = materializeUser?.business?.name

  return {
    isBusinessApproved,
    businessId,
    businessName,
    isActionsDisabled: !isBusinessApproved,
    getDisabledProps: () => ({
      disabled: !isBusinessApproved,
      title: !isBusinessApproved ? 'Business must be approved before performing this action' : undefined
    })
  }
}