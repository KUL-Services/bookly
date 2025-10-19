'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Link from 'next/link'
import classnames from 'classnames'

import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'
import type { BusinessRegistrationData, StepConfig } from './types'

import Logo from '@components/layout/shared/Logo'
import StepperWrapper from '@core/styles/stepper'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { getLocalizedUrl } from '@/utils/i18n'
import { getInitialFormData, saveDraft, loadDraft } from './utils'

// Step Components
import AccountStep from './steps/AccountStep'
import MobileVerificationStep from './steps/MobileVerificationStep'
import BusinessBasicsStep from './steps/BusinessBasicsStep'
import LocationStep from './steps/LocationStep'
import BusinessProfileStep from './steps/BusinessProfileStep'
import StaffManagementStep from './steps/StaffManagementStep'
import LegalStep from './steps/LegalStep'
import RegistrationSuccess from './RegistrationSuccess'

const steps: StepConfig[] = [
  {
    icon: 'ri-user-line',
    title: 'Account',
    subtitle: 'Create credentials',
    image: '/images/booksy-biz/step-1.jpeg'
  },
  // OTP Verification - Hidden for Egypt deployment
  // {
  //   icon: 'ri-smartphone-line',
  //   title: 'Verification',
  //   subtitle: 'Verify phone',
  //   image: '/images/booksy-biz/step-2.jpeg'
  // },
  {
    icon: 'ri-store-line',
    title: 'Business',
    subtitle: 'Business basics',
    image: '/images/booksy-biz/step-3.jpeg'
  },
  {
    icon: 'ri-map-pin-line',
    title: 'Location',
    subtitle: 'Address details',
    image: '/images/booksy-biz/step-4.jpeg'
  },
  {
    icon: 'ri-profile-line',
    title: 'Profile',
    subtitle: 'Public page setup',
    image: '/images/booksy-biz/step-5.jpeg'
  },
  {
    icon: 'ri-team-line',
    title: 'Staff',
    subtitle: 'Add team members',
    image: '/images/booksy-biz/step-6.jpeg'
  },
  {
    icon: 'ri-file-text-line',
    title: 'Legal',
    subtitle: 'Terms & privacy',
    image: '/images/booksy-biz/step-7.jpeg'
  }
]

const renderStepContent = (
  activeStep: number,
  isLastStep: boolean,
  isSubmitting: boolean,
  handleNext: () => void,
  handlePrev: () => void,
  formData: BusinessRegistrationData,
  updateFormData: (data: Partial<BusinessRegistrationData>) => void,
  validationErrors: Record<string, string>,
  setValidationErrors: (errors: Record<string, string>) => void
) => {
  const stepProps = {
    activeStep,
    isLastStep,
    handleNext,
    handlePrev,
    formData,
    updateFormData,
    validationErrors,
    setValidationErrors
  }

  // Note: Step 1 (MobileVerificationStep) is hidden for Egypt deployment
  switch (activeStep) {
    case 0:
      return <AccountStep {...stepProps} />
    // case 1:
    //   return <MobileVerificationStep {...stepProps} />
    case 1:
      return <BusinessBasicsStep {...stepProps} />
    case 2:
      return <LocationStep {...stepProps} />
    case 3:
      return <BusinessProfileStep {...stepProps} />
    case 4:
      return <StaffManagementStep {...stepProps} />
    case 5:
      return <LegalStep {...stepProps} isSubmitting={isSubmitting} />
    default:
      return null
  }
}

interface RegisterWizardProps {
  mode: Mode
}

const RegisterWizard = ({ mode }: RegisterWizardProps) => {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<BusinessRegistrationData>(getInitialFormData())
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const isLastStep = activeStep === steps.length - 1

  // Illustration images
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // Load draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !draftLoaded) {
      const draft = loadDraft(locale as string)
      if (draft) {
        setFormData(draft)
        console.log('📋 Draft restored from localStorage')
      }
      setDraftLoaded(true)
    }
  }, [locale, draftLoaded])

  // Auto-save draft on form data change
  useEffect(() => {
    if (draftLoaded) {
      saveDraft(formData, locale as string)
    }
  }, [formData, locale, draftLoaded])

  const handleNext = async () => {
    setValidationErrors({})
    if (!isLastStep) {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    } else {
      // Last step - submit registration
      await handleSubmitRegistration()
    }
  }

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('📤 Submitting registration data:', formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Clear draft after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`business-register-draft:v1:${locale}`)
      }

      // Show success page
      setShowSuccess(true)

      console.log('✅ Registration completed successfully!')
    } catch (error) {
      console.error('❌ Registration failed:', error)
      setValidationErrors({ submit: 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrev = () => {
    setValidationErrors({})
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleStep = (step: number) => () => {
    setActiveStep(step)
    setValidationErrors({})
  }

  const updateFormData = (data: Partial<BusinessRegistrationData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSaveForLater = () => {
    saveDraft(formData, locale as string)
    alert('Your progress has been saved! You can continue later from where you left off.')
  }

  // Show success page if registration is complete
  if (showSuccess) {
    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://bookly.com'}/${formData.publicUrlSlug || 'business'}`
    return (
      <RegistrationSuccess
        businessName={formData.businessName}
        ownerName={formData.ownerName}
        profileUrl={profileUrl}
        mode={mode}
      />
    )
  }

  return (
    <div className="flex bs-full justify-center">
      {/* Form Section */}
      <div className="flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:p-12">
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className="absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]"
        >
          <Logo />
        </Link>

        <div className="flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[500px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0">
          {/* Header */}
          <div className="text-center">
            <Typography variant="h4" className="mb-1">
              Business Registration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </div>

          {/* Stepper - Horizontal on mobile, Vertical on desktop */}
          <StepperWrapper>
            {/* Desktop Stepper */}
            <Stepper
              activeStep={activeStep}
              orientation="horizontal"
              className="hidden md:flex mb-6"
            >
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar
                        variant="rounded"
                        className={classnames('cursor-pointer', {
                          'bg-primary text-white shadow-xs': activeStep === index,
                          'bg-primaryLight text-primary': activeStep > index,
                          'bg-actionHover': activeStep < index
                        })}
                        onClick={handleStep(index)}
                      >
                        <i className={step.icon} />
                      </Avatar>
                    )}
                  >
                    <Typography className="text-xs font-medium hidden lg:block">
                      {step.title}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Mobile Progress Bar - Styled like Booksy Biz */}
            <Box className="md:hidden mb-6">
              <div className="flex gap-2 mb-4" style={{ minHeight: '8px' }}>
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={classnames('flex-1 rounded-full transition-all duration-300')}
                    style={{
                      height: '8px',
                      backgroundColor: index <= activeStep ? 'var(--mui-palette-primary-main)' : 'rgba(128, 128, 128, 0.2)',
                      boxShadow: index <= activeStep ? '0 2px 6px rgba(var(--mui-palette-primary-mainChannel) / 0.4)' : 'none'
                    }}
                  />
                ))}
              </div>
              {/* Mobile Step Icons */}
              <div className="flex justify-between items-center px-1">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center gap-1.5">
                    <Avatar
                      variant="rounded"
                      className={classnames('cursor-pointer transition-all duration-300')}
                      onClick={handleStep(index)}
                      sx={{
                        width: 36,
                        height: 36,
                        backgroundColor: activeStep === index
                          ? 'var(--mui-palette-primary-main)'
                          : activeStep > index
                          ? 'var(--mui-palette-primary-light)'
                          : 'rgba(128, 128, 128, 0.15)',
                        color: activeStep >= index ? '#fff' : 'var(--mui-palette-text-secondary)',
                        transform: activeStep === index ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: activeStep === index ? '0 4px 12px rgba(var(--mui-palette-primary-mainChannel) / 0.3)' : 'none'
                      }}
                    >
                      <i className={`${step.icon} text-base`} />
                    </Avatar>
                    <Typography
                      className="text-[10px] font-medium text-center whitespace-nowrap"
                      sx={{
                        color: index <= activeStep ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-secondary)'
                      }}
                    >
                      {step.title}
                    </Typography>
                  </div>
                ))}
              </div>
            </Box>
          </StepperWrapper>

          {/* Step Content */}
          <div className="flex-1">
            {renderStepContent(
              activeStep,
              isLastStep,
              isSubmitting,
              handleNext,
              handlePrev,
              formData,
              updateFormData,
              validationErrors,
              setValidationErrors
            )}
          </div>

          {/* Save for later button */}
          <div className="text-center">
            <Button variant="text" size="small" onClick={handleSaveForLater}>
              Save and continue later
            </Button>
          </div>

          {/* Footer */}
          <div className="flex justify-center items-center flex-wrap gap-2">
            <Typography variant="body2">Already have an account?</Typography>
            <Typography
              component={Link}
              href={getLocalizedUrl('/login', locale as Locale)}
              color="primary"
              className="font-medium"
            >
              Sign in instead
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterWizard
