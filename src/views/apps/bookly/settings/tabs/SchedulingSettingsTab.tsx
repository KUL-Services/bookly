'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

const SchedulingSettingsTab = () => {
  const { schedulingSettings, updateSchedulingSettings } = useBusinessSettingsStore()

  return (
    <Grid container spacing={6}>
      {/* Info Card about Scheduling Modes */}
      <Grid item xs={12}>
        <Alert severity='info' icon={<i className='ri-information-line' />}>
          <Typography variant='body2'>
            <strong>Scheduling Mode is Per Staff/Room:</strong> In Bookly, each staff member and room can be configured
            as either <Chip label='Dynamic' size='small' color='primary' sx={{ mx: 0.5 }} /> (appointment-based) or
            <Chip label='Static' size='small' color='secondary' sx={{ mx: 0.5 }} /> (class/slot-based). Configure this
            in the <strong>Staff</strong> and <strong>Rooms</strong> management sections.
          </Typography>
        </Alert>
      </Grid>

      {/* Default Booking Duration */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title='Default Booking Duration'
            subheader='Standard appointment length for new bookings'
            action={
              <Tooltip title='This is the default duration when creating new services'>
                <IconButton size='small'>
                  <i className='ri-information-line' />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent>
            <TextField
              label='Default Duration'
              type='number'
              value={schedulingSettings.defaultBookingDuration}
              onChange={e =>
                updateSchedulingSettings({
                  defaultBookingDuration: Math.max(15, parseInt(e.target.value) || 60)
                })
              }
              InputProps={{
                endAdornment: <InputAdornment position='end'>minutes</InputAdornment>
              }}
              helperText='Minimum 15 minutes. Services can have their own specific duration.'
              size='small'
              fullWidth
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Walk-ins */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Walk-in Bookings' subheader='Allow customers without appointments' />
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={schedulingSettings.allowWalkIns}
                  onChange={e => updateSchedulingSettings({ allowWalkIns: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant='body1'>Allow Walk-ins</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Staff can accept customers who arrive without prior booking
                  </Typography>
                </Box>
              }
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Buffer Time */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Buffer Time' subheader='Add gaps between consecutive bookings' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label='Buffer Between Bookings'
                type='number'
                value={schedulingSettings.bufferTimeBetweenBookings}
                onChange={e =>
                  updateSchedulingSettings({
                    bufferTimeBetweenBookings: Math.max(0, parseInt(e.target.value) || 0)
                  })
                }
                InputProps={{
                  endAdornment: <InputAdornment position='end'>minutes</InputAdornment>
                }}
                helperText='Time gap between the end of one booking and the start of the next'
                size='small'
              />

              <Alert severity='info' sx={{ fontSize: '0.875rem' }}>
                <strong>Example:</strong> If a service takes 60 minutes and buffer is 15 minutes, the next available
                slot will be 75 minutes after the start of the previous booking.
              </Alert>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Overbooking */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Overbooking' subheader='Allow accepting more bookings than capacity allows' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={schedulingSettings.allowOverbooking}
                    onChange={e => updateSchedulingSettings({ allowOverbooking: e.target.checked })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Allow Overbooking</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Accept more bookings than the normal capacity (for static slots)
                    </Typography>
                  </Box>
                }
              />

              {schedulingSettings.allowOverbooking && (
                <>
                  <TextField
                    label='Overbooking Limit'
                    type='number'
                    value={schedulingSettings.overbookingPercentage}
                    onChange={e =>
                      updateSchedulingSettings({
                        overbookingPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>%</InputAdornment>
                    }}
                    helperText='Maximum overbooking percentage above normal capacity'
                    size='small'
                  />

                  <Alert severity='warning' sx={{ fontSize: '0.875rem' }}>
                    <strong>Warning:</strong> Overbooking may lead to scheduling conflicts and customer dissatisfaction.
                    Use this feature carefully.
                  </Alert>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Current Configuration Summary */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Configuration Summary' />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <i className='ri-timer-line' style={{ fontSize: '2rem' }} />
                  <Typography variant='body1' fontWeight={600}>
                    {schedulingSettings.defaultBookingDuration} min
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Default Duration
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <i className='ri-time-line' style={{ fontSize: '2rem' }} />
                  <Typography variant='body1' fontWeight={600}>
                    {schedulingSettings.bufferTimeBetweenBookings} min
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Buffer Time
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <i className='ri-walk-line' style={{ fontSize: '2rem' }} />
                  <Typography variant='body1' fontWeight={600}>
                    {schedulingSettings.allowWalkIns ? 'Enabled' : 'Disabled'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Walk-ins
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <i className='ri-stack-line' style={{ fontSize: '2rem' }} />
                  <Typography variant='body1' fontWeight={600}>
                    {schedulingSettings.allowOverbooking ? `${schedulingSettings.overbookingPercentage}%` : 'None'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Overbooking
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default SchedulingSettingsTab
