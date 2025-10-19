'use client'

import { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

import type { StepProps } from '../types'
import { COUNTRY_CODES } from '../types'
import { validatePhone } from '../utils'
import { sendOtp, verifyOtp } from '../api-stubs'

const MobileVerificationStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [canEdit, setCanEdit] = useState(true)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = async () => {
    const errors: Record<string, string> = {}
    const phoneError = validatePhone(formData.phone)
    if (phoneError) errors.phone = phoneError

    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      await sendOtp(formData.countryCode, formData.phone)
      setOtpSent(true)
      setCountdown(60)
      setCanEdit(false)
    } catch (error) {
      setValidationErrors({ phone: 'Failed to send OTP. Please try again.' })
    }
  }

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setValidationErrors({ otp: 'Please enter a valid 6-digit code' })
      return
    }

    setIsVerifying(true)

    try {
      await verifyOtp(formData.countryCode, formData.phone, formData.otp)
      setIsVerifying(false)
      handleNext()
    } catch (error) {
      setIsVerifying(false)
      setValidationErrors({ otp: 'Invalid verification code. Please try again.' })
    }
  }

  const handleEditPhone = () => {
    setCanEdit(true)
    setOtpSent(false)
    setCountdown(0)
    updateFormData({ otp: '' })
  }

  const handleResend = () => {
    if (countdown === 0) {
      handleSendOtp()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Verify Your Mobile Number
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We'll send you a verification code to confirm your number
        </Typography>
      </div>

      <Box className="flex flex-col sm:flex-row gap-3">
        <FormControl className="w-full sm:w-32">
          <InputLabel>Code</InputLabel>
          <Select
            value={formData.countryCode}
            label="Code"
            disabled={!canEdit}
            onChange={(e) => updateFormData({ countryCode: e.target.value })}
          >
            {COUNTRY_CODES.map((item) => (
              <MenuItem key={item.code} value={item.code}>
                {item.code} {item.country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Phone Number"
          type="tel"
          disabled={!canEdit}
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            updateFormData({ phone: value })
            if (validationErrors.phone) {
              setValidationErrors({ ...validationErrors, phone: '' })
            }
          }}
          error={!!validationErrors.phone}
          helperText={validationErrors.phone || 'Enter your mobile number without spaces or dashes'}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*'
          }}
        />
      </Box>

      {!otpSent ? (
        <Button fullWidth variant="contained" onClick={handleSendOtp}>
          Send Verification Code
        </Button>
      ) : (
        <>
          <Alert severity="success" className="mt-2">
            Verification code sent to {formData.countryCode} {formData.phone}
            <Button size="small" onClick={handleEditPhone} className="ml-2">
              Edit
            </Button>
          </Alert>

          <TextField
            fullWidth
            label="Verification Code"
            value={formData.otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              updateFormData({ otp: value })
              if (validationErrors.otp) {
                setValidationErrors({ ...validationErrors, otp: '' })
              }
            }}
            error={!!validationErrors.otp}
            helperText={validationErrors.otp || 'Enter the 6-digit code sent to your phone'}
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*',
              autoComplete: 'one-time-code'
            }}
          />

          <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?
            </Typography>
            <Button
              size="small"
              onClick={handleResend}
              disabled={countdown > 0}
              className="self-end sm:self-auto"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Button>
          </Box>
        </>
      )}

      <Box className="flex gap-3 justify-between mt-4">
        <Button variant="outlined" onClick={handlePrev}>
          Back
        </Button>
        {otpSent && (
          <Button
            variant="contained"
            onClick={handleVerifyOtp}
            disabled={isVerifying || formData.otp.length !== 6}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </Button>
        )}
      </Box>
    </div>
  )
}

export default MobileVerificationStep
