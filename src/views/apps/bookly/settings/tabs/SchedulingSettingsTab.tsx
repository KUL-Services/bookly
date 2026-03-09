'use client'

// MUI
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
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

// Draft infra
import { useTabDraft } from '@/bookly/hooks/use-tab-draft'
import { TabSaveBar } from '@/bookly/components/molecules/tab-save-bar'
import { ConfirmChangesDialog } from '@/bookly/components/molecules/confirm-changes-dialog'

const LABELS: Record<string, string> = {
  defaultBookingDuration: 'Default booking duration (min)',
  bufferTimeBetweenBookings: 'Buffer between bookings (min)',
  allowWalkIns: 'Allow walk-ins',
  allowOverbooking: 'Allow overbooking',
  overbookingType: 'Overbooking type',
  overbookingPercentage: 'Overbooking limit (%)',
  overbookingFixedCount: 'Extra bookings allowed',
  enableWaitlist: 'Enable waitlist'
}

const SchedulingSettingsTab = () => {
  const { schedulingSettings, updateSchedulingSettings, saveSchedulingSettings, isSaving } = useBusinessSettingsStore()

  const { draft, setDraft, isDirty, changes, confirmOpen, setConfirmOpen, handleCancel, handleConfirm } = useTabDraft({
    tabId: 'scheduling',
    labels: LABELS,
    saved: schedulingSettings as unknown as Record<string, unknown>,
    applyDraft: d => updateSchedulingSettings(d as unknown as typeof schedulingSettings),
    saveAction: saveSchedulingSettings
  })

  const set = (patch: Partial<typeof schedulingSettings>) =>
    setDraft(prev => ({ ...prev, ...patch }) as unknown as Record<string, unknown>)

  const ss = draft as unknown as typeof schedulingSettings

  return (
    <Grid container spacing={6}>
      {/* Inline dirty bar */}
      <Grid item xs={12}>
        <TabSaveBar
          isDirty={isDirty}
          changes={changes}
          isSaving={isSaving}
          saveLabel='Save Scheduling'
          onSave={() => setConfirmOpen(true)}
          onCancel={handleCancel}
        />
      </Grid>

      {/* Info Card */}
      <Grid item xs={12}>
        <Alert severity='info' icon={<i className='ri-information-line' />}>
          <Typography variant='body2'>
            <strong>Scheduling Mode is Per Staff/Room:</strong> Each staff member and room can be configured as either{' '}
            <Chip label='Flex' size='small' color='primary' sx={{ mx: 0.5 }} /> (appointment-based) or{' '}
            <Chip label='Fixed' size='small' color='secondary' sx={{ mx: 0.5 }} /> (class/session-based). Configure this
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
              value={ss.defaultBookingDuration}
              onChange={e => set({ defaultBookingDuration: Math.max(15, parseInt(e.target.value) || 60) })}
              InputProps={{ endAdornment: <InputAdornment position='end'>minutes</InputAdornment> }}
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
              control={<Switch checked={ss.allowWalkIns} onChange={e => set({ allowWalkIns: e.target.checked })} />}
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
                value={ss.bufferTimeBetweenBookings}
                onChange={e => set({ bufferTimeBetweenBookings: Math.max(0, parseInt(e.target.value) || 0) })}
                InputProps={{ endAdornment: <InputAdornment position='end'>minutes</InputAdornment> }}
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
                  <Switch checked={ss.allowOverbooking} onChange={e => set({ allowOverbooking: e.target.checked })} />
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

              {ss.allowOverbooking && (
                <>
                  <ToggleButtonGroup
                    value={ss.overbookingType || 'percentage'}
                    exclusive
                    onChange={(_, value) => value && set({ overbookingType: value })}
                    size='small'
                    fullWidth
                  >
                    <ToggleButton value='percentage'>Percentage</ToggleButton>
                    <ToggleButton value='fixed'>Fixed Number</ToggleButton>
                  </ToggleButtonGroup>

                  {(ss.overbookingType || 'percentage') === 'percentage' ? (
                    <TextField
                      label='Overbooking Limit'
                      type='number'
                      value={ss.overbookingPercentage}
                      onChange={e =>
                        set({ overbookingPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                      }
                      InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
                      helperText='Maximum overbooking percentage above normal capacity'
                      size='small'
                    />
                  ) : (
                    <TextField
                      label='Extra Bookings Allowed'
                      type='number'
                      value={ss.overbookingFixedCount || 0}
                      onChange={e => set({ overbookingFixedCount: Math.max(0, parseInt(e.target.value) || 0) })}
                      InputProps={{ endAdornment: <InputAdornment position='end'>extra bookings</InputAdornment> }}
                      helperText='Maximum additional bookings beyond normal capacity'
                      size='small'
                    />
                  )}

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

      {/* Waitlist */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Waitlist' subheader='Allow customers to join a waitlist for full slots' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ss.enableWaitlist || false}
                    onChange={e => set({ enableWaitlist: e.target.checked })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Enable Waitlist</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      When a slot is full, customers can join a waitlist. If a cancellation occurs, the first person on
                      the waitlist is notified.
                    </Typography>
                  </Box>
                }
              />
              {ss.enableWaitlist && (
                <Alert severity='info' sx={{ fontSize: '0.875rem' }}>
                  Waitlist management will be available in the Calendar view. Customers will be automatically notified
                  when a spot opens up.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Config Summary */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Configuration Summary' />
          <CardContent>
            <Grid container spacing={2}>
              {[
                { icon: 'ri-timer-line', value: `${ss.defaultBookingDuration} min`, label: 'Default Duration' },
                { icon: 'ri-time-line', value: `${ss.bufferTimeBetweenBookings} min`, label: 'Buffer Time' },
                { icon: 'ri-walk-line', value: ss.allowWalkIns ? 'Enabled' : 'Disabled', label: 'Walk-ins' },
                {
                  icon: 'ri-stack-line',
                  value: ss.allowOverbooking ? `${ss.overbookingPercentage}%` : 'None',
                  label: 'Overbooking'
                }
              ].map(item => (
                <Grid item xs={12} md={3} key={item.label}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <i className={item.icon} style={{ fontSize: '2rem' }} />
                    <Typography variant='body1' fontWeight={600}>
                      {item.value}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {item.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <ConfirmChangesDialog
        open={confirmOpen}
        title='Save Scheduling Settings'
        changes={changes}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Grid>
  )
}

export default SchedulingSettingsTab
