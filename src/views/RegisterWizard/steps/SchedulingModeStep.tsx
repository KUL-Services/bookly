'use client'

import { useEffect } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
  // Get suggested mode based on business type
  const suggestedMode = SCHEDULING_MODE_SUGGESTIONS[formData.businessType] || 'dynamic'

  // Initialize with suggested mode if not set
  useEffect(() => {
    if (!formData.schedulingMode) {
      updateFormData({ schedulingMode: suggestedMode })
    }
  }, [])

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

  const handleSelectMode = (mode: 'static' | 'dynamic') => {
    updateFormData({
      schedulingMode: mode,
      // Clear rooms if switching to dynamic, they're not needed
      ...(mode === 'dynamic' && formData.rooms?.length > 0 ? { rooms: [] } : {})
    })
  }

  const isSelected = (mode: 'static' | 'dynamic') => formData.schedulingMode === mode

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Choose Your Scheduling Mode
        </Typography>
        <Typography variant="body2" color="text.secondary">
          How do you want clients to book appointments at your business?
        </Typography>
      </div>

      {validationErrors.schedulingMode && (
        <Alert severity="error">{validationErrors.schedulingMode}</Alert>
      )}

      {/* Mode Selection Cards */}
      <div className="flex flex-col gap-4">
        {/* Dynamic Mode Card */}
        <Card
          variant="outlined"
          className={`cursor-pointer transition-all ${
            isSelected('dynamic')
              ? 'ring-2 ring-primary border-primary shadow-md'
              : 'hover:border-primary/50 hover:shadow-sm'
          }`}
          onClick={() => handleSelectMode('dynamic')}
        >
          <CardContent className="p-5">
            <Box className="flex items-start gap-4">
              <Box
                className={`flex items-center justify-center w-14 h-14 rounded-xl ${
                  isSelected('dynamic') ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}
              >
                <i className="ri-user-follow-line text-2xl" />
              </Box>
              <Box className="flex-1">
                <Box className="flex items-center gap-2 mb-1">
                  <Typography variant="h6" className="font-semibold">
                    Staff-Based Booking
                  </Typography>
                  {suggestedMode === 'dynamic' && (
                    <Chip label="Recommended" size="small" color="primary" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" className="mb-3">
                  Clients book appointments with specific staff members based on their availability.
                  Perfect for personal services like salons, barbershops, and one-on-one sessions.
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  <Chip
                    icon={<i className="ri-check-line text-xs" />}
                    label="Individual appointments"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<i className="ri-check-line text-xs" />}
                    label="Staff availability"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<i className="ri-check-line text-xs" />}
                    label="Service-based pricing"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              {isSelected('dynamic') && (
                <Box className="text-primary">
                  <i className="ri-checkbox-circle-fill text-2xl" />
                </Box>
              )}
            </Box>

            <Box className="mt-4 pt-4 border-t border-divider">
              <Typography variant="caption" color="text.secondary">
                <strong>Best for:</strong> Salons, Barbershops, Spas, Personal Training, Consulting, Healthcare
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Static Mode Card */}
        <Card
          variant="outlined"
          className={`cursor-pointer transition-all ${
            isSelected('static')
              ? 'ring-2 ring-primary border-primary shadow-md'
              : 'hover:border-primary/50 hover:shadow-sm'
          }`}
          onClick={() => handleSelectMode('static')}
        >
          <CardContent className="p-5">
            <Box className="flex items-start gap-4">
              <Box
                className={`flex items-center justify-center w-14 h-14 rounded-xl ${
                  isSelected('static') ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}
              >
                <i className="ri-calendar-schedule-line text-2xl" />
              </Box>
              <Box className="flex-1">
                <Box className="flex items-center gap-2 mb-1">
                  <Typography variant="h6" className="font-semibold">
                    Class/Session-Based Booking
                  </Typography>
                  {suggestedMode === 'static' && (
                    <Chip label="Recommended" size="small" color="primary" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" className="mb-3">
                  Schedule fixed classes or sessions in specific rooms/facilities that clients can join.
                  Ideal for group classes, workshops, and recurring scheduled events.
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  <Chip
                    icon={<i className="ri-check-line text-xs" />}
                    label="Group sessions"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<i className="ri-check-line text-xs" />}
                    label="Room capacity"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<i className="ri-check-line text-xs" />}
                    label="Fixed schedule"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              {isSelected('static') && (
                <Box className="text-primary">
                  <i className="ri-checkbox-circle-fill text-2xl" />
                </Box>
              )}
            </Box>

            <Box className="mt-4 pt-4 border-t border-divider">
              <Typography variant="caption" color="text.secondary">
                <strong>Best for:</strong> Fitness Studios, Yoga Centers, Dance Classes, Workshops, Training Facilities
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert severity="info" icon={<i className="ri-information-line" />}>
        <Typography variant="body2">
          {formData.schedulingMode === 'static'
            ? 'You will set up rooms/facilities in the next step, then create your class schedule after registration.'
            : 'You will add staff members who provide services. Clients book based on staff availability.'}
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
