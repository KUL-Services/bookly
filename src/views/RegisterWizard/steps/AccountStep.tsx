'use client'

import { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import type { StepProps } from '../types'
import { validateEmail, validatePassword } from '../utils'

const AccountStep = ({ handleNext, formData, updateFormData, validationErrors, setValidationErrors }: StepProps) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.ownerName || formData.ownerName.trim().length < 2) {
      errors.ownerName = 'Please enter your full name (minimum 2 characters)'
    }

    const emailError = validateEmail(formData.email)
    if (emailError) errors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) errors.password = passwordError

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  const handleGoogleAuth = () => {
    // Placeholder for Google OAuth integration
    console.log('Google OAuth - To be implemented')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Create Your Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start by setting up your account credentials
        </Typography>
      </div>

      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleAuth}
        startIcon={<i className="ri-google-fill" />}
        className="border-2"
      >
        Continue with Google
      </Button>

      <Divider>
        <Typography variant="body2" color="text.secondary">
          or continue with email
        </Typography>
      </Divider>

      <TextField
        fullWidth
        label="Your Full Name"
        type="text"
        autoComplete="name"
        value={formData.ownerName}
        onChange={(e) => {
          updateFormData({ ownerName: e.target.value })
          if (validationErrors.ownerName) {
            setValidationErrors({ ...validationErrors, ownerName: '' })
          }
        }}
        error={!!validationErrors.ownerName}
        helperText={validationErrors.ownerName || 'This will be used as the business owner name'}
      />

      <TextField
        fullWidth
        label="Email Address"
        type="email"
        autoComplete="email"
        inputProps={{ inputMode: 'email' }}
        value={formData.email}
        onChange={(e) => {
          updateFormData({ email: e.target.value })
          if (validationErrors.email) {
            setValidationErrors({ ...validationErrors, email: '' })
          }
        }}
        error={!!validationErrors.email}
        helperText={validationErrors.email || 'We\'ll use this for your account login'}
      />

      <TextField
        fullWidth
        label="Password"
        type={isPasswordShown ? 'text' : 'password'}
        autoComplete="new-password"
        value={formData.password}
        onChange={(e) => {
          updateFormData({ password: e.target.value })
          if (validationErrors.password) {
            setValidationErrors({ ...validationErrors, password: '' })
          }
        }}
        error={!!validationErrors.password}
        helperText={
          validationErrors.password ||
          'Must be 8+ characters with uppercase, lowercase, number, and symbol'
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" onClick={() => setIsPasswordShown(!isPasswordShown)}>
                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        type={isConfirmPasswordShown ? 'text' : 'password'}
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={(e) => {
          updateFormData({ confirmPassword: e.target.value })
          if (validationErrors.confirmPassword) {
            setValidationErrors({ ...validationErrors, confirmPassword: '' })
          }
        }}
        error={!!validationErrors.confirmPassword}
        helperText={validationErrors.confirmPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}>
                <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Box className="flex gap-3 justify-end mt-4">
        <Button fullWidth variant="contained" onClick={handleContinue}>
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default AccountStep
