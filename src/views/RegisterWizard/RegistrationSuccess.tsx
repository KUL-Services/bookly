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

interface RegistrationSuccessProps {
  businessName: string
  ownerName: string
  profileUrl: string
  mode: 'light' | 'dark' | 'system'
}

const features = [
  {
    icon: 'ri-notification-3-line',
    title: 'Automated Reminders',
    description: 'Reduce no-shows with SMS and email reminders',
    color: 'primary'
  },
  {
    icon: 'ri-line-chart-line',
    title: 'Business Analytics',
    description: 'Track performance with real-time reports',
    color: 'success'
  },
  {
    icon: 'ri-calendar-check-line',
    title: '24/7 Online Booking',
    description: 'Accept bookings anytime, anywhere',
    color: 'info'
  },
  {
    icon: 'ri-team-line',
    title: 'Staff Management',
    description: 'Manage your team and schedules easily',
    color: 'warning'
  }
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book with ${businessName}`,
          text: `Check out my Bookly profile and book your appointment!`,
          url: profileUrl
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <Box className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-success/5">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardContent className="p-6 md:p-10">
          {/* Success Animation */}
          <Box className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4 animate-bounce">
              <i className="ri-checkbox-circle-fill text-5xl text-success" />
            </div>
            <Typography variant="h4" className="font-bold mb-2">
              🎉 Congratulations, {ownerName.split(' ')[0]}!
            </Typography>
            <Typography variant="h6" color="text.secondary" className="mb-4">
              {businessName} is now live on Bookly
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You're all set to start accepting bookings and growing your business
            </Typography>
          </Box>

          {/* Feature Highlights */}
          <Box className="mb-8">
            <Typography variant="h6" className="font-semibold mb-4 text-center">
              What you get with Bookly:
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <Box className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${feature.color}/10`}>
                        <i className={`${feature.icon} text-xl text-${feature.color}`} />
                      </div>
                      <Box className="flex-1">
                        <Typography variant="body1" className="font-semibold mb-1">
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="text-sm">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Box>

          {/* Profile Link Section */}
          <Box className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <Typography variant="body1" className="font-semibold mb-3 flex items-center gap-2">
              <i className="ri-share-line" />
              Your Bookly Profile
            </Typography>
            <Box className="flex flex-col sm:flex-row gap-2">
              <TextField
                fullWidth
                value={profileUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyLink} size="small">
                        <i className={copied ? 'ri-check-line text-success' : 'ri-file-copy-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                className="bg-background"
              />
              <Button
                variant="outlined"
                onClick={handleShare}
                startIcon={<i className="ri-share-forward-line" />}
                className="whitespace-nowrap"
              >
                Share
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" className="mt-2 block">
              Share this link on social media or send it to your clients to start getting bookings
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
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => window.open(profileUrl, '_blank')}
              startIcon={<i className="ri-external-link-line" />}
            >
              View Profile
            </Button>
          </Box>

          {/* Quick Tips */}
          <Box className="mt-6 p-4 bg-info/5 rounded-lg border border-info/10">
            <Typography variant="body2" className="font-semibold mb-2 flex items-center gap-2 text-info">
              <i className="ri-lightbulb-line" />
              Quick Tips to Get Started:
            </Typography>
            <ul className="list-none space-y-1 ml-6">
              <li className="text-sm text-text-secondary">
                ✓ Add your services and pricing
              </li>
              <li className="text-sm text-text-secondary">
                ✓ Upload photos of your work
              </li>
              <li className="text-sm text-text-secondary">
                ✓ Set up your availability calendar
              </li>
              <li className="text-sm text-text-secondary">
                ✓ Share your profile link with clients
              </li>
            </ul>
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
          Profile link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RegistrationSuccess
