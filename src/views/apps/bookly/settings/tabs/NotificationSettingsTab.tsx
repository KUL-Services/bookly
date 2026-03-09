'use client'

import { useState } from 'react'

// MUI
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import FormGroup from '@mui/material/FormGroup'
import Alert from '@mui/material/Alert'

// Components
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

// Draft infra
import { useTabDraft } from '@/bookly/hooks/use-tab-draft'
import { TabSaveBar } from '@/bookly/components/molecules/tab-save-bar'
import { ConfirmChangesDialog } from '@/bookly/components/molecules/confirm-changes-dialog'

const LABELS: Record<string, string> = {
  'newBookingAlert.email': 'New booking – email',
  'newBookingAlert.sms': 'New booking – SMS',
  'newBookingAlert.push': 'New booking – push',
  'cancellationAlert.email': 'Cancellation – email',
  'cancellationAlert.sms': 'Cancellation – SMS',
  'cancellationAlert.push': 'Cancellation – push',
  'customerReminders.enabled': 'Customer reminders enabled',
  'customerReminders.beforeHours': 'Reminder times',
  staffNotifications: 'Staff notifications',
  'dailyDigest.enabled': 'Daily digest enabled',
  'dailyDigest.time': 'Daily digest send time',
  'dailyDigest.recipients': 'Daily digest recipients'
}

const NotificationSettingsTab = () => {
  const { notificationSettings, updateNotificationSettings, saveNotificationSettings, isSaving } =
    useBusinessSettingsStore()

  const [recipientInput, setRecipientInput] = useState('')

  const { draft, setDraft, isDirty, changes, confirmOpen, setConfirmOpen, handleCancel, handleConfirm } = useTabDraft({
    tabId: 'notifications',
    labels: LABELS,
    saved: notificationSettings as unknown as Record<string, unknown>,
    applyDraft: d => updateNotificationSettings(d as unknown as typeof notificationSettings),
    saveAction: saveNotificationSettings
  })

  const set = (patch: Partial<typeof notificationSettings>) =>
    setDraft(prev => ({ ...prev, ...patch }) as unknown as Record<string, unknown>)

  const ns = draft as unknown as typeof notificationSettings

  const handleReminderToggle = (hours: number) => {
    const current = ns.customerReminders.beforeHours
    const next = current.includes(hours) ? current.filter(h => h !== hours) : [...current, hours].sort((a, b) => b - a)
    set({ customerReminders: { ...ns.customerReminders, beforeHours: next } })
  }

  const handleAddRecipient = () => {
    const email = recipientInput.trim()
    if (email && !ns.dailyDigest.recipients.includes(email)) {
      set({ dailyDigest: { ...ns.dailyDigest, recipients: [...ns.dailyDigest.recipients, email] } })
      setRecipientInput('')
    }
  }

  const handleRemoveRecipient = (email: string) =>
    set({ dailyDigest: { ...ns.dailyDigest, recipients: ns.dailyDigest.recipients.filter(e => e !== email) } })

  return (
    <Grid container spacing={6}>
      {/* Inline dirty bar */}
      <Grid item xs={12}>
        <TabSaveBar
          isDirty={isDirty}
          changes={changes}
          isSaving={isSaving}
          saveLabel='Save Notifications'
          onSave={() => setConfirmOpen(true)}
          onCancel={handleCancel}
        />
      </Grid>

      {/* New Booking Alerts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='New Booking Alerts' subheader='Get notified when customers make new bookings' />
          <CardContent>
            <FormGroup>
              {[
                { key: 'email', icon: 'ri-mail-line', label: 'Email Notifications', checked: ns.newBookingAlert.email },
                { key: 'sms', icon: 'ri-message-2-line', label: 'SMS Notifications', checked: ns.newBookingAlert.sms },
                {
                  key: 'push',
                  icon: 'ri-notification-4-line',
                  label: 'Push Notifications',
                  checked: ns.newBookingAlert.push
                }
              ].map(item => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Checkbox
                      checked={item.checked}
                      onChange={e => set({ newBookingAlert: { ...ns.newBookingAlert, [item.key]: e.target.checked } })}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className={item.icon} />
                      <Typography>{item.label}</Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>

      {/* Cancellation Alerts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Cancellation Alerts' subheader='Get notified when customers cancel bookings' />
          <CardContent>
            <FormGroup>
              {[
                {
                  key: 'email',
                  icon: 'ri-mail-line',
                  label: 'Email Notifications',
                  checked: ns.cancellationAlert.email
                },
                {
                  key: 'sms',
                  icon: 'ri-message-2-line',
                  label: 'SMS Notifications',
                  checked: ns.cancellationAlert.sms
                },
                {
                  key: 'push',
                  icon: 'ri-notification-4-line',
                  label: 'Push Notifications',
                  checked: ns.cancellationAlert.push || false
                }
              ].map(item => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Checkbox
                      checked={item.checked}
                      onChange={e =>
                        set({ cancellationAlert: { ...ns.cancellationAlert, [item.key]: e.target.checked } })
                      }
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className={item.icon} />
                      <Typography>{item.label}</Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>

      {/* Customer Reminders */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title='Customer Reminders'
            subheader='Send automatic reminders to customers before their appointments'
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ns.customerReminders.enabled}
                    onChange={e => set({ customerReminders: { ...ns.customerReminders, enabled: e.target.checked } })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Enable Reminders</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Automatically remind customers about upcoming appointments
                    </Typography>
                  </Box>
                }
              />

              {ns.customerReminders.enabled && (
                <>
                  <Divider />
                  <Typography variant='body2' color='text.secondary'>
                    Send reminders at these times before the appointment:
                  </Typography>
                  <FormGroup row>
                    {[1, 2, 4, 12, 24, 48].map(hours => (
                      <FormControlLabel
                        key={hours}
                        control={
                          <Checkbox
                            checked={ns.customerReminders.beforeHours.includes(hours)}
                            onChange={() => handleReminderToggle(hours)}
                          />
                        }
                        label={hours < 24 ? `${hours}h` : `${hours / 24}d`}
                      />
                    ))}
                  </FormGroup>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant='body2' color='text.secondary' sx={{ width: '100%' }}>
                      Selected:
                    </Typography>
                    {ns.customerReminders.beforeHours.length === 0 ? (
                      <Typography variant='caption' color='text.secondary'>
                        No reminders selected
                      </Typography>
                    ) : (
                      ns.customerReminders.beforeHours.map(hours => (
                        <Chip
                          key={hours}
                          label={
                            hours < 24
                              ? `${hours} hour${hours > 1 ? 's' : ''} before`
                              : `${hours / 24} day${hours / 24 > 1 ? 's' : ''} before`
                          }
                          size='small'
                          color='primary'
                          variant='outlined'
                          onDelete={() => handleReminderToggle(hours)}
                        />
                      ))
                    )}
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Staff Notifications */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Staff Notifications' subheader='Notify staff members about their bookings' />
          <CardContent>
            <FormControlLabel
              control={
                <Switch checked={ns.staffNotifications} onChange={e => set({ staffNotifications: e.target.checked })} />
              }
              label={
                <Box>
                  <Typography variant='body1'>Enable Staff Notifications</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Staff members will receive notifications about their upcoming appointments
                  </Typography>
                </Box>
              }
            />
            {ns.staffNotifications && (
              <Alert severity='info' sx={{ mt: 2 }} icon={<i className='ri-information-line' />}>
                <Typography variant='caption'>
                  Staff will receive notifications via their registered email or phone number. Ensure staff contact
                  details are up to date in Staff Management.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Daily Digest */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Daily Digest' subheader="Receive a summary of the next day's appointments" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ns.dailyDigest.enabled}
                    onChange={e => set({ dailyDigest: { ...ns.dailyDigest, enabled: e.target.checked } })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Enable Daily Digest</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Get a daily email with tomorrow's appointments
                    </Typography>
                  </Box>
                }
              />

              {ns.dailyDigest.enabled && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TimeSelectField
                      label='Send Time'
                      value={ns.dailyDigest.time}
                      onChange={value => set({ dailyDigest: { ...ns.dailyDigest, time: value } })}
                      size='small'
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          label='Add Recipient Email'
                          placeholder='Enter email and press Enter or +'
                          size='small'
                          value={recipientInput}
                          onChange={e => setRecipientInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddRecipient()
                            }
                          }}
                        />
                        <IconButton onClick={handleAddRecipient} color='primary'>
                          <i className='ri-add-line' />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {ns.dailyDigest.recipients.length === 0 ? (
                          <Typography variant='caption' color='text.secondary'>
                            No recipients added. Add email addresses to receive daily digest.
                          </Typography>
                        ) : (
                          ns.dailyDigest.recipients.map(email => (
                            <Chip
                              key={email}
                              label={email}
                              size='small'
                              onDelete={() => handleRemoveRecipient(email)}
                            />
                          ))
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <ConfirmChangesDialog
        open={confirmOpen}
        title='Save Notification Settings'
        changes={changes}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Grid>
  )
}

export default NotificationSettingsTab
