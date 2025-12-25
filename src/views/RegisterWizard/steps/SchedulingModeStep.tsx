'use client'

import { useEffect } from 'react'

import type { StepProps } from '../types'

const SchedulingModeStep = ({
  handleNext,
  formData,
  updateFormData
}: StepProps) => {
  // Automatically set to dynamic mode and proceed to next step
  useEffect(() => {
    if (!formData.schedulingMode) {
      updateFormData({ schedulingMode: 'dynamic' })
    }
    // Auto-advance to next step
    const timer = setTimeout(() => {
      handleNext()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return null
}

export default SchedulingModeStep
