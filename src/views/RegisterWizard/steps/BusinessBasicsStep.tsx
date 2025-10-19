'use client'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'

import type { StepProps } from '../types'
import { BUSINESS_TYPES, STAFF_COUNTS, SERVICES_OPTIONS } from '../types'

const BusinessBasicsStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.businessName) errors.businessName = 'Business name is required'
    if (!formData.businessType) errors.businessType = 'Please select a business type'
    if (!formData.staffCount) errors.staffCount = 'Please select staff count'
    if (formData.servicesOffered.length === 0) errors.servicesOffered = 'Please select at least one service'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Tell Us About Your Business
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Help us understand what services you provide
        </Typography>
      </div>

      <TextField
        fullWidth
        label="Business Name"
        value={formData.businessName}
        onChange={(e) => {
          updateFormData({ businessName: e.target.value })
          if (validationErrors.businessName) {
            setValidationErrors({ ...validationErrors, businessName: '' })
          }
        }}
        error={!!validationErrors.businessName}
        helperText={validationErrors.businessName || 'This is how customers will find you'}
        required
      />

      <FormControl fullWidth error={!!validationErrors.businessType} required>
        <InputLabel>Business Type</InputLabel>
        <Select
          value={formData.businessType}
          label="Business Type"
          onChange={(e) => {
            updateFormData({ businessType: e.target.value })
            if (validationErrors.businessType) {
              setValidationErrors({ ...validationErrors, businessType: '' })
            }
          }}
        >
          {BUSINESS_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
        {validationErrors.businessType && (
          <Typography variant="caption" color="error" className="mt-1 ml-3">
            {validationErrors.businessType}
          </Typography>
        )}
      </FormControl>

      <FormControl fullWidth error={!!validationErrors.staffCount} required>
        <InputLabel>Team Size</InputLabel>
        <Select
          value={formData.staffCount}
          label="Team Size"
          onChange={(e) => {
            updateFormData({ staffCount: e.target.value })
            if (validationErrors.staffCount) {
              setValidationErrors({ ...validationErrors, staffCount: '' })
            }
          }}
        >
          {STAFF_COUNTS.map((count) => (
            <MenuItem key={count} value={count}>
              {count}
            </MenuItem>
          ))}
        </Select>
        {validationErrors.staffCount && (
          <Typography variant="caption" color="error" className="mt-1 ml-3">
            {validationErrors.staffCount}
          </Typography>
        )}
      </FormControl>

      <FormControl fullWidth error={!!validationErrors.servicesOffered} required>
        <InputLabel>Services Offered</InputLabel>
        <Select
          multiple
          value={formData.servicesOffered}
          onChange={(e) => {
            const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
            updateFormData({ servicesOffered: value })
            if (validationErrors.servicesOffered) {
              setValidationErrors({ ...validationErrors, servicesOffered: '' })
            }
          }}
          input={<OutlinedInput label="Services Offered" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {SERVICES_OPTIONS.map((service) => (
            <MenuItem key={service} value={service}>
              {service}
            </MenuItem>
          ))}
        </Select>
        {validationErrors.servicesOffered ? (
          <Typography variant="caption" color="error" className="mt-1 ml-3">
            {validationErrors.servicesOffered}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" className="mt-1 ml-3">
            Select all that apply
          </Typography>
        )}
      </FormControl>

      <Box className="flex gap-3 justify-between mt-4">
        <Button variant="outlined" onClick={handlePrev}>
          Back
        </Button>
        <Button variant="contained" onClick={handleContinue}>
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default BusinessBasicsStep
