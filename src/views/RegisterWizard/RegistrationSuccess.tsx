'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

interface RegistrationSuccessProps {
  businessName: string
  ownerName: string
  profileUrl: string
  mode: 'light' | 'dark' | 'system'
}

const preparationSteps = [
  {
    icon: 'ri-list-check-2',
    title: 'Add Your Services',
    description: 'Set up your service menu with pricing and durations',
    color: 'primary'
  },
  {
    icon: 'ri-team-line',
    title: 'Manage Staff',
    description: 'Add team members and configure their schedules',
    color: 'info'
  },
  {
    icon: 'ri-image-add-line',
    title: 'Upload Photos',
    description: 'Showcase your work with professional images',
    color: 'success'
  },
  {
    icon: 'ri-calendar-line',
    title: 'Set Availability',
    description: 'Configure your working hours and time slots',
    color: 'warning'
  }
]

const approvalProcess = [
  'Registration Submitted',
  'Under Review',
  'Approved & Live'
]

const RegistrationSuccess = ({ businessName, ownerName, profileUrl, mode }: RegistrationSuccessProps) => {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setShowSnackbar(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <Box className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-success/5">
      <Card className="max-w-3xl w-full shadow-xl">
        <CardContent className="p-6 md:p-10">
          {/* Success Animation */}
          <Box className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <i className="ri-checkbox-circle-fill text-5xl text-primary animate-bounce" />
            </div>
            <Typography variant="h4" className="font-bold mb-2">
              🎉 Welcome to Bookly, {ownerName.split(' ')[0]}!
            </Typography>
            <Typography variant="h6" color="text.secondary" className="mb-2">
              {businessName} has been registered successfully
            </Typography>

            {/* Status Badge */}
            <Box className="flex justify-center gap-2 mt-4">
              <Chip
                icon={<i className="ri-time-line" />}
                label="Pending Approval"
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {/* Approval Process Stepper */}
          <Box className="mb-8 px-4">
            <Stepper activeStep={1} alternativeLabel>
              {approvalProcess.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': { color: 'warning.main' },
                        '&.Mui-completed': { color: 'success.main' }
                      }
                    }}
                  >
                    <Typography variant="caption" className="font-medium">
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Important Notice */}
          <Alert severity="info" icon={<i className="ri-information-line" />} className="mb-6">
            <Typography variant="body2" className="font-semibold mb-1">
              Your business is currently under review
            </Typography>
            <Typography variant="body2">
              Our team will review your registration and approve your business within 24-48 hours.
              You'll receive an email notification once approved.
            </Typography>
          </Alert>

          {/* What You Can Do Now */}
          <Box className="mb-6">
            <Box className="flex items-center gap-2 mb-4">
              <i className="ri-checkbox-circle-line text-2xl text-success" />
              <Typography variant="h6" className="font-semibold">
                Prepare Your Business While Waiting
              </Typography>
            </Box>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preparationSteps.map((step, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <Box className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${step.color}/10 flex-shrink-0`}>
                        <i className={`${step.icon} text-xl text-${step.color}`} />
                      </div>
                      <Box className="flex-1">
                        <Typography variant="body1" className="font-semibold mb-1">
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="text-sm">
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Box>

          {/* Current Restrictions */}
          <Box className="mb-6 p-4 bg-warning/5 rounded-lg border border-warning/20">
            <Box className="flex items-start gap-3">
              <i className="ri-lock-line text-xl text-warning mt-0.5" />
              <Box className="flex-1">
                <Typography variant="body2" className="font-semibold mb-2 text-warning-dark">
                  Temporary Restrictions (Until Approved):
                </Typography>
                <ul className="list-none space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-line text-error mt-0.5 flex-shrink-0" />
                    <span>Business won't appear in customer searches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-line text-error mt-0.5 flex-shrink-0" />
                    <span>No customer bookings can be made yet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-line text-error mt-0.5 flex-shrink-0" />
                    <span>Public business profile is hidden</span>
                  </li>
                </ul>
              </Box>
            </Box>
          </Box>

          {/* After Approval Benefits */}
          <Box className="mb-6 p-4 bg-success/5 rounded-lg border border-success/20">
            <Box className="flex items-start gap-3">
              <i className="ri-gift-line text-xl text-success mt-0.5" />
              <Box className="flex-1">
                <Typography variant="body2" className="font-semibold mb-2 text-success-dark">
                  What You'll Get After Approval:
                </Typography>
                <ul className="list-none space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-success mt-0.5 flex-shrink-0" />
                    <span>24/7 online booking from customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-success mt-0.5 flex-shrink-0" />
                    <span>Appear in search results and get discovered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-success mt-0.5 flex-shrink-0" />
                    <span>Automated SMS and email reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-success mt-0.5 flex-shrink-0" />
                    <span>Business analytics and performance reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-check-line text-success mt-0.5 flex-shrink-0" />
                    <span>Shareable public profile link</span>
                  </li>
                </ul>
              </Box>
            </Box>
          </Box>

          {/* Profile Link (Currently Inactive) */}
          <Box className="mb-6 p-4 bg-background rounded-lg border border-divider">
            <Typography variant="body2" className="font-semibold mb-2 flex items-center gap-2">
              <i className="ri-link-m" />
              Your Profile Link (Will activate after approval)
            </Typography>
            <Box className="flex flex-col sm:flex-row gap-2">
              <TextField
                fullWidth
                value={profileUrl}
                InputProps={{
                  readOnly: true,
                  disabled: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyLink} size="small">
                        <i className={copied ? 'ri-check-line text-success' : 'ri-file-copy-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                size="small"
              />
            </Box>
            <Typography variant="caption" color="text.secondary" className="mt-2 block">
              Save this link - you'll be able to share it with customers once your business is approved
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box className="flex flex-col sm:flex-row gap-3">
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleGoToDashboard}
              startIcon={<i className="ri-dashboard-line" />}
              className="font-semibold"
            >
              Go to Dashboard
            </Button>
          </Box>

          {/* Help Section */}
          <Box className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <Typography variant="body2" className="font-semibold mb-2 flex items-center gap-2 text-primary">
              <i className="ri-customer-service-2-line" />
              Need Help?
            </Typography>
            <Typography variant="body2" color="text.secondary" className="text-sm">
              If you have any questions about the approval process or need assistance setting up your business,
              please contact our support team at <strong>support@bookly.com</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success" variant="filled">
          Profile link copied! It will work after approval.
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RegistrationSuccess
