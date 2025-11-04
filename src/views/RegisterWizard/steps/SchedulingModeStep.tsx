'use client'

import { useEffect } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

import type { StepProps } from '../types'
import { SCHEDULING_MODE_SUGGESTIONS } from '../types'

const SchedulingModeStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  // Auto-suggest scheduling mode based on business type
  useEffect(() => {
    if (formData.businessType && !formData.schedulingMode) {
      const suggested = SCHEDULING_MODE_SUGGESTIONS[formData.businessType] || 'dynamic'
      updateFormData({ schedulingMode: suggested })
    }
  }, [formData.businessType])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.schedulingMode) {
      errors.schedulingMode = 'Please select a scheduling mode'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  const handleModeSelect = (mode: 'static' | 'dynamic') => {
    updateFormData({ schedulingMode: mode })
    if (validationErrors.schedulingMode) {
      setValidationErrors({ ...validationErrors, schedulingMode: '' })
    }
  }

  const suggestedMode = formData.businessType
    ? SCHEDULING_MODE_SUGGESTIONS[formData.businessType] || 'dynamic'
    : 'dynamic'

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Choose Your Scheduling Mode
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This determines how your calendar and bookings will work
        </Typography>
      </div>

      {validationErrors.schedulingMode && (
        <Alert severity="error">{validationErrors.schedulingMode}</Alert>
      )}

      {/* Scheduling Mode Cards */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Static Scheduling Card */}
        <Card
          variant="outlined"
          className={`relative ${formData.schedulingMode === 'static' ? 'ring-2 ring-primary shadow-lg' : ''}`}
        >
          <CardActionArea onClick={() => handleModeSelect('static')}>
            <CardContent className="p-5">
              <Box className="flex items-start justify-between mb-3">
                <Box className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                    <i className="ri-calendar-schedule-line text-2xl" />
                  </div>
                  {suggestedMode === 'static' && (
                    <Chip
                      label="Recommended"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                {formData.schedulingMode === 'static' && (
                  <i className="ri-checkbox-circle-fill text-2xl text-primary" />
                )}
              </Box>

              <Typography variant="h6" className="mb-2 font-semibold">
                Static Scheduling
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-3">
                Slot-based scheduling with recurring class templates
              </Typography>

              <Box className="space-y-2">
                <Typography variant="caption" className="font-medium block">
                  Best for:
                </Typography>
                <Box className="flex flex-wrap gap-1">
                  <Chip label="Fitness Classes" size="small" variant="outlined" />
                  <Chip label="Yoga Studios" size="small" variant="outlined" />
                  <Chip label="Group Sessions" size="small" variant="outlined" />
                  <Chip label="Workshops" size="small" variant="outlined" />
                </Box>

                <Box className="mt-3 space-y-1">
                  <Typography variant="caption" className="flex items-center gap-2 text-success-main">
                    <i className="ri-check-line" />
                    Room/facility management
                  </Typography>
                  <Typography variant="caption" className="flex items-center gap-2 text-success-main">
                    <i className="ri-check-line" />
                    Capacity limits per session
                  </Typography>
                  <Typography variant="caption" className="flex items-center gap-2 text-success-main">
                    <i className="ri-check-line" />
                    Recurring weekly templates
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Dynamic Scheduling Card */}
        <Card
          variant="outlined"
          className={`relative ${formData.schedulingMode === 'dynamic' ? 'ring-2 ring-primary shadow-lg' : ''}`}
        >
          <CardActionArea onClick={() => handleModeSelect('dynamic')}>
            <CardContent className="p-5">
              <Box className="flex items-start justify-between mb-3">
                <Box className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                    <i className="ri-calendar-check-line text-2xl" />
                  </div>
                  {suggestedMode === 'dynamic' && (
                    <Chip
                      label="Recommended"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                {formData.schedulingMode === 'dynamic' && (
                  <i className="ri-checkbox-circle-fill text-2xl text-primary" />
                )}
              </Box>

              <Typography variant="h6" className="mb-2 font-semibold">
                Dynamic Scheduling
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-3">
                Staff-based flexible appointment booking
              </Typography>

              <Box className="space-y-2">
                <Typography variant="caption" className="font-medium block">
                  Best for:
                </Typography>
                <Box className="flex flex-wrap gap-1">
                  <Chip label="Salons" size="small" variant="outlined" />
                  <Chip label="Barbershops" size="small" variant="outlined" />
                  <Chip label="Spas" size="small" variant="outlined" />
                  <Chip label="Medical" size="small" variant="outlined" />
                </Box>

                <Box className="mt-3 space-y-1">
                  <Typography variant="caption" className="flex items-center gap-2 text-success-main">
                    <i className="ri-check-line" />
                    Staff-based appointments
                  </Typography>
                  <Typography variant="caption" className="flex items-center gap-2 text-success-main">
                    <i className="ri-check-line" />
                    Flexible time slots
                  </Typography>
                  <Typography variant="caption" className="flex items-center gap-2 text-success-main">
                    <i className="ri-check-line" />
                    Individual bookings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" icon={<i className="ri-information-line" />}>
        <Typography variant="caption">
          Don't worry, you can always change this later in your business settings.
          This choice affects what information we'll ask for in the next steps.
        </Typography>
      </Alert>

      {/* Navigation */}
      <Box className="flex gap-3 justify-between mt-4">
        <Button variant="outlined" onClick={handlePrev}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!formData.schedulingMode}
        >
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default SchedulingModeStep
