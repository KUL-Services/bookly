'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'

import type { StepProps, BusinessRegistrationData } from '../types'
import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
import { signUpBusiness } from '../api-stubs'
import { clearDraft } from '../utils'

interface LegalStepProps extends StepProps {
  isSubmitting?: boolean
}

const LegalStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors,
  isSubmitting = false
}: LegalStepProps) => {
  const { lang: locale } = useParams()

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.acceptTerms) errors.acceptTerms = 'You must accept the terms of service'
    if (!formData.acceptPrivacy) errors.acceptPrivacy = 'You must accept the privacy policy'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      handleNext()  // Trigger wizard's submission
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Terms & Privacy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please review and accept our policies to complete registration
        </Typography>
      </div>

      <Paper variant="outlined" className="p-4">
        <Typography variant="subtitle2" className="mb-3">
          Registration Summary
        </Typography>
        <div className="flex flex-col gap-2">
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Email:</Typography>
            <Typography variant="body2">{formData.email}</Typography>
          </Box>
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Business:</Typography>
            <Typography variant="body2">{formData.businessName}</Typography>
          </Box>
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Type:</Typography>
            <Typography variant="body2">{formData.businessType}</Typography>
          </Box>
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Location:</Typography>
            <Typography variant="body2">
              {formData.mobileOnly ? 'Mobile Only' : `${formData.city}, ${formData.state}`}
            </Typography>
          </Box>
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">URL:</Typography>
            <Typography variant="body2">bookly.com/{formData.publicUrlSlug}</Typography>
          </Box>
        </div>
      </Paper>

      <div className="flex flex-col gap-3">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.acceptTerms}
              onChange={(e) => {
                updateFormData({ acceptTerms: e.target.checked })
                if (validationErrors.acceptTerms) {
                  setValidationErrors({ ...validationErrors, acceptTerms: '' })
                }
              }}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href={getLocalizedUrl('/terms', locale as Locale)} target="_blank" className="text-primary">
                Terms of Service
              </Link>{' '}
              *
            </Typography>
          }
        />
        {validationErrors.acceptTerms && (
          <Typography variant="caption" color="error" className="ml-8 -mt-2">
            {validationErrors.acceptTerms}
          </Typography>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.acceptPrivacy}
              onChange={(e) => {
                updateFormData({ acceptPrivacy: e.target.checked })
                if (validationErrors.acceptPrivacy) {
                  setValidationErrors({ ...validationErrors, acceptPrivacy: '' })
                }
              }}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href={getLocalizedUrl('/privacy', locale as Locale)} target="_blank" className="text-primary">
                Privacy Policy
              </Link>{' '}
              *
            </Typography>
          }
        />
        {validationErrors.acceptPrivacy && (
          <Typography variant="caption" color="error" className="ml-8 -mt-2">
            {validationErrors.acceptPrivacy}
          </Typography>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.marketingOptIn}
              onChange={(e) => updateFormData({ marketingOptIn: e.target.checked })}
            />
          }
          label={
            <Typography variant="body2">
              I would like to receive marketing emails and updates (optional)
            </Typography>
          }
        />
      </div>

      {validationErrors.submit && (
        <Typography color="error" variant="body2" className="text-center">
          {validationErrors.submit}
        </Typography>
      )}

      <Box className="flex gap-3 justify-between mt-4">
        <Button variant="outlined" onClick={handlePrev} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
        </Button>
      </Box>
    </div>
  )
}

export default LegalStep
