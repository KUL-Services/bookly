'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { SyntheticEvent } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

// Tab Components
import BusinessProfileTab from './tabs/BusinessProfileTab'
import BookingPoliciesTab from './tabs/BookingPoliciesTab'
import PaymentSettingsTab from './tabs/PaymentSettingsTab'
import NotificationSettingsTab from './tabs/NotificationSettingsTab'
import SchedulingSettingsTab from './tabs/SchedulingSettingsTab'
import CalendarSettingsTab from './tabs/CalendarSettingsTab'
import CustomerSettingsTab from './tabs/CustomerSettingsTab'
import { ServicesTab } from '@/bookly/features/staff-management/services-tab'
import { BranchesTab } from '@/bookly/features/branches'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

const BusinessSettings = () => {
  // Store
  const {
    isLoading,
    isSaving,
    error,
    successMessage,
    hasUnsavedChanges,
    saveSettings,
    loadSettings,
    clearMessages,
    resetAllSettings
  } = useBusinessSettingsStore()

  // URL params for tab navigation
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')

  // Valid tab values
  const validTabs = [
    'business-profile',
    'booking-policies',
    'payment',
    'notifications',
    'scheduling',
    'calendar',
    'customer',
    'services',
    'branches'
  ]

  // Local state
  const [activeTab, setActiveTab] = useState(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      return tabFromUrl
    }
    return 'business-profile'
  })
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Sync tab with URL when it changes
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleTabChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const handleSave = async () => {
    await saveSettings()
  }

  const handleResetAll = () => {
    resetAllSettings()
    setShowResetConfirm(false)
  }

  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent className='flex justify-center items-center py-12'>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          {/* Header */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title='Business Settings'
                subheader={
                  <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                    Configure your business profile, policies, payment options, notifications, and more
                  </Typography>
                }
                action={
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant='outlined'
                      color='secondary'
                      onClick={() => setShowResetConfirm(true)}
                      disabled={isSaving}
                    >
                      Reset All
                    </Button>
                    <Button
                      variant='contained'
                      onClick={handleSave}
                      disabled={isSaving || !hasUnsavedChanges}
                      startIcon={isSaving ? <CircularProgress size={16} color='inherit' /> : null}
                    >
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </Box>
                }
              />
            </Card>
          </Grid>

          {/* Unsaved changes warning */}
          {hasUnsavedChanges && (
            <Grid item xs={12}>
              <Alert severity='warning'>You have unsaved changes. Don't forget to save before leaving this page.</Alert>
            </Grid>
          )}

          {/* Tabs */}
          <Grid item xs={12}>
            <CustomTabList onChange={handleTabChange} variant='scrollable' pill='true'>
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Business Profile</span>}
                icon={<i className='ri-store-3-line' />}
                iconPosition='start'
                value='business-profile'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Services</span>}
                icon={<i className='ri-service-line' />}
                iconPosition='start'
                value='services'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Branches</span>}
                icon={<i className='ri-building-line' />}
                iconPosition='start'
                value='branches'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Booking Policies</span>}
                icon={<i className='ri-calendar-check-line' />}
                iconPosition='start'
                value='booking-policies'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Payment</span>}
                icon={<i className='ri-bank-card-line' />}
                iconPosition='start'
                value='payment'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Notifications</span>}
                icon={<i className='ri-notification-4-line' />}
                iconPosition='start'
                value='notifications'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Scheduling</span>}
                icon={<i className='ri-time-line' />}
                iconPosition='start'
                value='scheduling'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Calendar Display</span>}
                icon={<i className='ri-calendar-view' />}
                iconPosition='start'
                value='calendar'
              />
              <Tab
                label={<span style={{ fontFamily: 'var(--font-fira-code)' }}>Customer Options</span>}
                icon={<i className='ri-user-settings-line' />}
                iconPosition='start'
                value='customer'
              />
            </CustomTabList>
          </Grid>

          {/* Tab Panels */}
          <Grid item xs={12}>
            <TabPanel value='business-profile' className='p-0'>
              <BusinessProfileTab />
            </TabPanel>
            <TabPanel value='services' className='p-0'>
              <Box sx={{ height: 'calc(100vh - 300px)', minHeight: 500 }}>
                <ServicesTab />
              </Box>
            </TabPanel>
            <TabPanel value='branches' className='p-0'>
              <Box sx={{ height: 'calc(100vh - 300px)', minHeight: 500 }}>
                <BranchesTab />
              </Box>
            </TabPanel>
            <TabPanel value='booking-policies' className='p-0'>
              <BookingPoliciesTab />
            </TabPanel>
            <TabPanel value='payment' className='p-0'>
              <PaymentSettingsTab />
            </TabPanel>
            <TabPanel value='notifications' className='p-0'>
              <NotificationSettingsTab />
            </TabPanel>
            <TabPanel value='scheduling' className='p-0'>
              <SchedulingSettingsTab />
            </TabPanel>
            <TabPanel value='calendar' className='p-0'>
              <CalendarSettingsTab />
            </TabPanel>
            <TabPanel value='customer' className='p-0'>
              <CustomerSettingsTab />
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={clearMessages}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity='success' onClose={clearMessages}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={clearMessages}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity='error' onClose={clearMessages}>
          {error}
        </Alert>
      </Snackbar>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowResetConfirm(false)}
        >
          <Card sx={{ maxWidth: 400, p: 2 }} onClick={e => e.stopPropagation()}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <i className='ri-error-warning-line text-warning' style={{ fontSize: '2rem' }} />
                <Box>
                  <Box component='h3' sx={{ m: 0, fontWeight: 600 }}>
                    Reset All Settings?
                  </Box>
                  <Box
                    component='p'
                    sx={{ m: 0, color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'var(--font-fira-code)' }}
                  >
                    This will reset all settings to their default values. This action cannot be undone.
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant='outlined' onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
                <Button variant='contained' color='error' onClick={handleResetAll}>
                  Reset All
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  )
}

export default BusinessSettings
