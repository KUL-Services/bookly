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
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import { PageLoader } from '@/components/LoadingStates'
import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'

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

// Stores
import { useBusinessSettingsStore } from '@/stores/business-settings.store'
import { useTabDirtyStore } from '@/stores/tab-dirty.store'

const TAB_LABELS: Record<string, string> = {
  'business-profile': 'Business Profile',
  'booking-policies': 'Booking Policies',
  payment: 'Payment',
  notifications: 'Notifications',
  scheduling: 'Scheduling',
  calendar: 'Calendar Display',
  customer: 'Customer Options'
}

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

  const { getTab } = useTabDirtyStore()

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

  // Tab-switching guard state
  const [guardOpen, setGuardOpen] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [guardIsSaving, setGuardIsSaving] = useState(false)

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
    const currentEntry = getTab(activeTab)
    if (currentEntry?.isDirty) {
      // Show leave-guard dialog instead of switching immediately
      setPendingTab(value)
      setGuardOpen(true)
      return
    }
    setActiveTab(value)
  }

  const guardCurrentEntry = getTab(activeTab)
  const guardChanges = guardCurrentEntry ? [] : [] // used for display in modal — comes from dirty store metadata

  const handleGuardStay = () => {
    setGuardOpen(false)
    setPendingTab(null)
  }

  const handleGuardDiscard = () => {
    // Reset current tab draft, then navigate
    getTab(activeTab)?.reset()
    setGuardOpen(false)
    if (pendingTab) setActiveTab(pendingTab)
    setPendingTab(null)
  }

  const handleGuardSaveAndLeave = async () => {
    setGuardIsSaving(true)
    try {
      await getTab(activeTab)?.save()
      setGuardOpen(false)
      if (pendingTab) setActiveTab(pendingTab)
      setPendingTab(null)
    } catch {
      // save errors handled by the tab store
    } finally {
      setGuardIsSaving(false)
    }
  }

  const handleSave = async () => {
    await saveSettings()
  }

  const handleResetAll = () => {
    resetAllSettings()
    setShowResetConfirm(false)
  }

  if (isLoading) {
    return <PageLoader />
  }

  const isSettingsTab = TAB_LABELS[activeTab] !== undefined
  const currentDirtyEntry = getTab(activeTab)

  return (
    <>
      {/* Brand Background Watermark */}
      <div className='fixed right-0 bottom-0 w-[600px] h-[600px] pointer-events-none opacity-[0.02] z-0'>
        <div
          className='w-full h-full bg-no-repeat bg-contain'
          style={{
            backgroundImage: "url('/brand/zerv-z.svg')",
            transform: 'rotate(-15deg)',
            backgroundPosition: 'bottom right'
          }}
        />
      </div>

      <TabContext value={activeTab}>
        <Grid container spacing={6} className='relative z-10'>
          {/* Header */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title='Business Settings'
                subheader={
                  <Typography variant='body2' color='text.secondary'>
                    Configure your business profile, policies, payment options, notifications, and more
                  </Typography>
                }
                action={
                  activeTab !== 'business-profile' && !isSettingsTab ? (
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
                        startIcon={isSaving ? <BrandedSpinner size={16} color='inherit' /> : null}
                      >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </Box>
                  ) : null
                }
              />
            </Card>
          </Grid>

          {/* Tabs */}
          <Grid item xs={12}>
            <CustomTabList onChange={handleTabChange} variant='scrollable' pill='true'>
              <Tab
                label='Business Profile'
                icon={<i className='ri-store-3-line' />}
                iconPosition='start'
                value='business-profile'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label='Services'
                icon={<i className='ri-service-line' />}
                iconPosition='start'
                value='services'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label='Branches'
                icon={<i className='ri-building-line' />}
                iconPosition='start'
                value='branches'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label='Booking Policies'
                icon={<i className='ri-calendar-check-line' />}
                iconPosition='start'
                value='booking-policies'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label='Payment'
                icon={<i className='ri-bank-card-line' />}
                iconPosition='start'
                value='payment'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label='Notifications'
                icon={<i className='ri-notification-4-line' />}
                iconPosition='start'
                value='notifications'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label='Scheduling'
                icon={<i className='ri-time-line' />}
                iconPosition='start'
                value='scheduling'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label='Calendar Display'
                icon={<i className='ri-calendar-view' />}
                iconPosition='start'
                value='calendar'
                sx={{ fontFamily: 'inherit' }}
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Customer Options
                    <Chip
                      label='Coming Soon'
                      size='small'
                      variant='outlined'
                      color='info'
                      sx={{ height: 18, fontSize: '0.6rem' }}
                    />
                  </Box>
                }
                icon={<i className='ri-user-settings-line' />}
                iconPosition='start'
                value='customer'
                sx={{ fontFamily: 'inherit' }}
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

      {/* ─── Tab-Switching Guard Dialog ───────────────────────────────────────── */}
      <Dialog open={guardOpen} onClose={handleGuardStay} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <i
              className='ri-error-warning-line'
              style={{ fontSize: '1.4rem', color: 'var(--mui-palette-warning-main)' }}
            />
            <Box>
              <Typography variant='h6' fontWeight={700}>
                Unsaved Changes
              </Typography>
              {activeTab in TAB_LABELS && (
                <Typography variant='caption' color='text.secondary'>
                  in {TAB_LABELS[activeTab]}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {currentDirtyEntry && (
            <Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                You have unsaved changes. What would you like to do?
              </Typography>

              {/* Show the changes from the tab dirty entry — use TabSaveBar data if available */}
              <Alert severity='warning' sx={{ mb: 0 }}>
                <Typography variant='body2'>
                  Your changes in <strong>{TAB_LABELS[activeTab] ?? activeTab}</strong> have not been saved. If you
                  leave now without saving, all changes will be lost.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant='outlined' color='secondary' onClick={handleGuardStay} disabled={guardIsSaving}>
            Stay Here
          </Button>
          <Button variant='outlined' color='error' onClick={handleGuardDiscard} disabled={guardIsSaving}>
            Discard &amp; Leave
          </Button>
          <Button
            variant='contained'
            onClick={handleGuardSaveAndLeave}
            disabled={guardIsSaving}
            startIcon={guardIsSaving ? <BrandedSpinner size={14} color='inherit' /> : <i className='ri-save-2-line' />}
          >
            {guardIsSaving ? 'Saving...' : 'Save & Leave'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Success/Error Snackbars ─────────────────────────────────────────── */}
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

      {/* ─── Reset Confirmation Dialog ───────────────────────────────────────── */}
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
                  <Box component='p' sx={{ m: 0, color: 'text.secondary', fontSize: '0.875rem' }}>
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
