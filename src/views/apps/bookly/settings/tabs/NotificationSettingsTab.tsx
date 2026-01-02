'use client'

// MUI Imports
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

// Components
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

const NotificationSettingsTab = () => {
  const { notificationSettings, updateNotificationSettings } = useBusinessSettingsStore()

  const handleReminderToggle = (hours: number) => {
    const currentHours = notificationSettings.customerReminders.beforeHours
    if (currentHours.includes(hours)) {
      updateNotificationSettings({
        customerReminders: {
          ...notificationSettings.customerReminders,
          beforeHours: currentHours.filter(h => h !== hours)
        }
      })
    } else {
      updateNotificationSettings({
        customerReminders: {
          ...notificationSettings.customerReminders,
          beforeHours: [...currentHours, hours].sort((a, b) => b - a)
        }
      })
    }
  }

  const handleRemoveRecipient = (email: string) => {
    updateNotificationSettings({
      dailyDigest: {
        ...notificationSettings.dailyDigest,
        recipients: notificationSettings.dailyDigest.recipients.filter(e => e !== email)
      }
    })
  }

  const handleAddRecipient = (email: string) => {
    if (email && !notificationSettings.dailyDigest.recipients.includes(email)) {
      updateNotificationSettings({
        dailyDigest: {
          ...notificationSettings.dailyDigest,
          recipients: [...notificationSettings.dailyDigest.recipients, email]
        }
      })
    }
  }

  return (
    <Grid container spacing={6}>
      {/* New Booking Alerts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='New Booking Alerts' subheader='Get notified when customers make new bookings' />
          <CardContent>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationSettings.newBookingAlert.email}
                    onChange={e =>
                      updateNotificationSettings({
                        newBookingAlert: {
                          ...notificationSettings.newBookingAlert,
                          email: e.target.checked
                        }
                      })
                    }
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-mail-line' />
                    <Typography>Email Notifications</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationSettings.newBookingAlert.sms}
                    onChange={e =>
                      updateNotificationSettings({
                        newBookingAlert: {
                          ...notificationSettings.newBookingAlert,
                          sms: e.target.checked
                        }
                      })
                    }
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-message-2-line' />
                    <Typography>SMS Notifications</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationSettings.newBookingAlert.push}
                    onChange={e =>
                      updateNotificationSettings({
                        newBookingAlert: {
                          ...notificationSettings.newBookingAlert,
                          push: e.target.checked
                        }
                      })
                    }
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-notification-4-line' />
                    <Typography>Push Notifications</Typography>
                  </Box>
                }
              />
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationSettings.cancellationAlert.email}
                    onChange={e =>
                      updateNotificationSettings({
                        cancellationAlert: {
                          ...notificationSettings.cancellationAlert,
                          email: e.target.checked
                        }
                      })
                    }
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-mail-line' />
                    <Typography>Email Notifications</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificationSettings.cancellationAlert.sms}
                    onChange={e =>
                      updateNotificationSettings({
                        cancellationAlert: {
                          ...notificationSettings.cancellationAlert,
                          sms: e.target.checked
                        }
                      })
                    }
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-message-2-line' />
                    <Typography>SMS Notifications</Typography>
                  </Box>
                }
              />
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
                    checked={notificationSettings.customerReminders.enabled}
                    onChange={e =>
                      updateNotificationSettings({
                        customerReminders: {
                          ...notificationSettings.customerReminders,
                          enabled: e.target.checked
                        }
                      })
                    }
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

              {notificationSettings.customerReminders.enabled && (
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
                            checked={notificationSettings.customerReminders.beforeHours.includes(hours)}
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
                    {notificationSettings.customerReminders.beforeHours.length === 0 ? (
                      <Typography variant='caption' color='text.secondary'>
                        No reminders selected
                      </Typography>
                    ) : (
                      notificationSettings.customerReminders.beforeHours.map(hours => (
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
                <Switch
                  checked={notificationSettings.staffNotifications}
                  onChange={e => updateNotificationSettings({ staffNotifications: e.target.checked })}
                />
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
                    checked={notificationSettings.dailyDigest.enabled}
                    onChange={e =>
                      updateNotificationSettings({
                        dailyDigest: {
                          ...notificationSettings.dailyDigest,
                          enabled: e.target.checked
                        }
                      })
                    }
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

              {notificationSettings.dailyDigest.enabled && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TimeSelectField
                      label='Send Time'
                      value={notificationSettings.dailyDigest.time}
                      onChange={value =>
                        updateNotificationSettings({
                          dailyDigest: {
                            ...notificationSettings.dailyDigest,
                            time: value
                          }
                        })
                      }
                      size='small'
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label='Add Recipient Email'
                        placeholder='Enter email and press Enter'
                        size='small'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.target as HTMLInputElement
                            handleAddRecipient(input.value)
                            input.value = ''
                          }
                        }}
                      />

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {notificationSettings.dailyDigest.recipients.length === 0 ? (
                          <Typography variant='caption' color='text.secondary'>
                            No recipients added. Add email addresses to receive daily digest.
                          </Typography>
                        ) : (
                          notificationSettings.dailyDigest.recipients.map(email => (
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
    </Grid>
  )
}

export default NotificationSettingsTab
