'use client'

import { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'

import type { StepProps } from '../types'
import { TIMEZONES, DAYS_OF_WEEK } from '../types'
import { validateSlug, generateSlug, hasAtLeastOneOpenDay } from '../utils'
import { checkSlugAvailable } from '../api-stubs'

const BusinessProfileStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  // Auto-generate slug when business name or city changes
  useEffect(() => {
    if (formData.businessName && formData.city && !formData.publicUrlSlug) {
      const slug = generateSlug(formData.businessName, formData.city)
      updateFormData({ publicUrlSlug: slug })
    }
  }, [formData.businessName, formData.city])

  // Debounced slug availability check
  useEffect(() => {
    if (!formData.publicUrlSlug) {
      setSlugAvailable(null)
      return
    }

    const validationError = validateSlug(formData.publicUrlSlug)
    if (validationError) {
      setSlugAvailable(null)
      return
    }

    setSlugChecking(true)
    const timer = setTimeout(async () => {
      const available = await checkSlugAvailable(formData.publicUrlSlug)
      setSlugAvailable(available)
      setSlugChecking(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [formData.publicUrlSlug])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    const slugError = validateSlug(formData.publicUrlSlug)
    if (slugError) errors.publicUrlSlug = slugError
    else if (slugAvailable === false) errors.publicUrlSlug = 'This URL is already taken'

    if (!formData.timezone) errors.timezone = 'Please select a timezone'

    if (formData.acceptsOnlineBooking && !hasAtLeastOneOpenDay(formData.workingHours)) {
      errors.workingHours = 'Please select at least one working day if accepting online bookings'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  const handleDayToggle = (day: string) => {
    updateFormData({
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          isOpen: !formData.workingHours[day].isOpen
        }
      }
    })
  }

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    updateFormData({
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          [field]: value
        }
      }
    })
  }

  const getSlugHelperText = () => {
    if (validationErrors.publicUrlSlug) return validationErrors.publicUrlSlug
    if (slugChecking) return 'Checking availability...'
    if (slugAvailable === true) return '✓ This URL is available'
    if (slugAvailable === false) return 'This URL is already taken'
    return 'Your unique booking page URL'
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='text-center mb-2'>
        <Typography variant='h5' className='mb-2'>
          Set Up Your Business Profile
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Configure your public booking page and hours
        </Typography>
      </div>

      <TextField
        fullWidth
        label='Public URL Slug'
        value={formData.publicUrlSlug}
        onChange={e => {
          const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
          updateFormData({ publicUrlSlug: value })
          if (validationErrors.publicUrlSlug) {
            setValidationErrors({ ...validationErrors, publicUrlSlug: '' })
          }
        }}
        error={!!validationErrors.publicUrlSlug || slugAvailable === false}
        helperText={getSlugHelperText()}
        InputProps={{
          startAdornment: (
            <Typography color='text.secondary' className='mr-1'>
              bookly.com/
            </Typography>
          )
        }}
        required
      />

      <FormControl fullWidth error={!!validationErrors.timezone} required>
        <InputLabel>Timezone</InputLabel>
        <Select
          value={formData.timezone}
          label='Timezone'
          onChange={e => {
            updateFormData({ timezone: e.target.value })
            if (validationErrors.timezone) {
              setValidationErrors({ ...validationErrors, timezone: '' })
            }
          }}
        >
          {TIMEZONES.map(tz => (
            <MenuItem key={tz} value={tz}>
              {tz}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.acceptsOnlineBooking}
            onChange={e => updateFormData({ acceptsOnlineBooking: e.target.checked })}
          />
        }
        label='Accept online bookings'
      />

      <Paper variant='outlined' className='p-4'>
        <Typography variant='subtitle2' className='mb-3'>
          Working Hours
        </Typography>
        <div className='flex flex-col gap-2'>
          {DAYS_OF_WEEK.map(day => {
            const dayData = formData.workingHours[day]
            return (
              <Box key={day} className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                <FormControlLabel
                  control={<Checkbox checked={dayData.isOpen} onChange={() => handleDayToggle(day)} />}
                  label={<Typography className='capitalize w-20 sm:w-24'>{day}</Typography>}
                />
                {dayData.isOpen ? (
                  <Box className='flex gap-2 items-center flex-1 ml-8 sm:ml-0'>
                    <TimeSelectField
                      value={dayData.open}
                      onChange={value => handleTimeChange(day, 'open', value)}
                      size='small'
                    />
                    <Typography className='text-sm'>to</Typography>
                    <TimeSelectField
                      value={dayData.close}
                      onChange={value => handleTimeChange(day, 'close', value)}
                      size='small'
                    />
                  </Box>
                ) : (
                  <Chip
                    label='Closed'
                    size='small'
                    variant='outlined'
                    className='ml-8 sm:ml-0 self-start sm:self-center'
                  />
                )}
              </Box>
            )
          })}
        </div>
        {validationErrors.workingHours && (
          <Typography variant='caption' color='error' className='mt-2 block'>
            {validationErrors.workingHours}
          </Typography>
        )}
      </Paper>

      <Box className='flex gap-3 justify-between mt-4'>
        <Button variant='outlined' onClick={handlePrev}>
          Back
        </Button>
        <Button variant='contained' onClick={handleContinue} disabled={slugChecking}>
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default BusinessProfileStep
