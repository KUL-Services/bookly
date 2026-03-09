'use client'

import { useState } from 'react'

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
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

// Shared draft infra
import { useTabDraft } from '@/bookly/hooks/use-tab-draft'
import { TabSaveBar } from '@/bookly/components/molecules/tab-save-bar'
import { ConfirmChangesDialog } from '@/bookly/components/molecules/confirm-changes-dialog'

// ─── field labels for diffing ────────────────────────────────────────────────
const LABELS: Record<string, string> = {
  autoConfirmation: 'Auto-confirm bookings',
  bookingLeadTime: 'Booking lead time (hours)',
  maxAdvanceBooking: 'Max advance booking (days)',
  'cancellationPolicy.enabled': 'Allow cancellations',
  'cancellationPolicy.hoursBeforeAppointment': 'Cancellation deadline (hours)',
  'cancellationPolicy.refundPercentage': 'Refund percentage',
  'reschedulePolicy.enabled': 'Allow rescheduling',
  'reschedulePolicy.hoursBeforeAppointment': 'Reschedule deadline (hours)',
  'noShowPolicy.chargeFee': 'Charge no-show fee',
  'noShowPolicy.feePercentage': 'No-show fee (%)',
  'noShowPolicy.restrictFutureBookings': 'Restrict future bookings',
  'noShowPolicy.restrictAfterCount': 'Restrict after (no-shows)',
  'noShowPolicy.restrictionDays': 'Restriction period (days)'
}

const BookingPoliciesTab = () => {
  const { bookingPolicies, updateBookingPolicies, saveBookingPoliciesSettings, isSaving } = useBusinessSettingsStore()

  const { draft, setDraft, isDirty, changes, confirmOpen, setConfirmOpen, handleCancel, handleConfirm } = useTabDraft({
    tabId: 'booking-policies',
    labels: LABELS,
    saved: bookingPolicies as unknown as Record<string, unknown>,
    applyDraft: d => updateBookingPolicies(d as unknown as typeof bookingPolicies),
    saveAction: saveBookingPoliciesSettings
  })

  // Typed helpers to update the draft
  const set = (patch: Partial<typeof bookingPolicies>) =>
    setDraft(prev => ({ ...prev, ...patch }) as unknown as Record<string, unknown>)

  const bp = draft as unknown as typeof bookingPolicies

  return (
    <Grid container spacing={6}>
      {/* Inline dirty bar */}
      <Grid item xs={12}>
        <TabSaveBar
          isDirty={isDirty}
          changes={changes}
          isSaving={isSaving}
          saveLabel='Save Booking Policies'
          onSave={() => setConfirmOpen(true)}
          onCancel={handleCancel}
        />
      </Grid>

      {/* General Booking Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title='General Booking'
            subheader='Configure basic booking behavior'
            action={
              <Tooltip title='These settings affect how new bookings are handled'>
                <IconButton size='small'>
                  <i className='ri-information-line' />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch checked={bp.autoConfirmation} onChange={e => set({ autoConfirmation: e.target.checked })} />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Auto-confirm bookings</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      When enabled, bookings are automatically confirmed without manual approval
                    </Typography>
                  </Box>
                }
              />

              <Divider />

              <Box>
                <FormControl fullWidth size='small'>
                  <InputLabel>Minimum Booking Lead Time</InputLabel>
                  <Select
                    value={[0, 1, 2, 4, 8, 12, 24].includes(bp.bookingLeadTime) ? bp.bookingLeadTime : 'custom'}
                    label='Minimum Booking Lead Time'
                    onChange={e => {
                      const val = e.target.value
                      if (val !== 'custom') set({ bookingLeadTime: val as number })
                    }}
                  >
                    <MenuItem value={0}>No minimum</MenuItem>
                    <MenuItem value={1}>1 hour</MenuItem>
                    <MenuItem value={2}>2 hours</MenuItem>
                    <MenuItem value={4}>4 hours</MenuItem>
                    <MenuItem value={8}>8 hours</MenuItem>
                    <MenuItem value={12}>12 hours</MenuItem>
                    <MenuItem value={24}>24 hours</MenuItem>
                    <MenuItem value='custom'>Custom</MenuItem>
                  </Select>
                </FormControl>
                {![0, 1, 2, 4, 8, 12, 24].includes(bp.bookingLeadTime) && (
                  <TextField
                    type='number'
                    value={bp.bookingLeadTime}
                    onChange={e => set({ bookingLeadTime: Math.max(0, parseInt(e.target.value) || 0) })}
                    InputProps={{ endAdornment: <InputAdornment position='end'>hours</InputAdornment> }}
                    size='small'
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                )}
                <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                  How far in advance customers must book
                </Typography>
              </Box>

              <Box>
                <FormControl fullWidth size='small'>
                  <InputLabel>Maximum Advance Booking</InputLabel>
                  <Select
                    value={[7, 14, 30, 60, 90].includes(bp.maxAdvanceBooking) ? bp.maxAdvanceBooking : 'custom'}
                    label='Maximum Advance Booking'
                    onChange={e => {
                      const val = e.target.value
                      if (val !== 'custom') set({ maxAdvanceBooking: val as number })
                    }}
                  >
                    <MenuItem value={7}>7 days</MenuItem>
                    <MenuItem value={14}>14 days</MenuItem>
                    <MenuItem value={30}>30 days</MenuItem>
                    <MenuItem value={60}>60 days</MenuItem>
                    <MenuItem value={90}>90 days</MenuItem>
                    <MenuItem value='custom'>Custom</MenuItem>
                  </Select>
                </FormControl>
                {![7, 14, 30, 60, 90].includes(bp.maxAdvanceBooking) && (
                  <TextField
                    type='number'
                    value={bp.maxAdvanceBooking}
                    onChange={e => set({ maxAdvanceBooking: Math.max(1, parseInt(e.target.value) || 1) })}
                    InputProps={{ endAdornment: <InputAdornment position='end'>days</InputAdornment> }}
                    size='small'
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                )}
                <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                  How far ahead customers can book
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Cancellation Policy */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Cancellation Policy' subheader='Control how customers can cancel bookings' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bp.cancellationPolicy.enabled}
                    onChange={e => set({ cancellationPolicy: { ...bp.cancellationPolicy, enabled: e.target.checked } })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Allow cancellations</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      When disabled, customers cannot cancel their bookings online
                    </Typography>
                  </Box>
                }
              />

              {bp.cancellationPolicy.enabled && (
                <>
                  <TextField
                    label='Cancellation Deadline'
                    type='number'
                    value={bp.cancellationPolicy.hoursBeforeAppointment}
                    onChange={e =>
                      set({
                        cancellationPolicy: {
                          ...bp.cancellationPolicy,
                          hoursBeforeAppointment: Math.max(0, parseInt(e.target.value) || 0)
                        }
                      })
                    }
                    InputProps={{ endAdornment: <InputAdornment position='end'>hours before</InputAdornment> }}
                    helperText='Minimum time before appointment when cancellation is allowed'
                    size='small'
                  />

                  <TextField
                    label='Refund Percentage'
                    type='number'
                    value={bp.cancellationPolicy.refundPercentage}
                    onChange={e =>
                      set({
                        cancellationPolicy: {
                          ...bp.cancellationPolicy,
                          refundPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                        }
                      })
                    }
                    InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
                    helperText='How much of the payment is refunded on cancellation'
                    size='small'
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Reschedule Policy */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Reschedule Policy' subheader='Control how customers can reschedule bookings' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bp.reschedulePolicy.enabled}
                    onChange={e => set({ reschedulePolicy: { ...bp.reschedulePolicy, enabled: e.target.checked } })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Allow rescheduling</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      When disabled, customers must cancel and rebook
                    </Typography>
                  </Box>
                }
              />

              {bp.reschedulePolicy.enabled && (
                <TextField
                  label='Reschedule Deadline'
                  type='number'
                  value={bp.reschedulePolicy.hoursBeforeAppointment}
                  onChange={e =>
                    set({
                      reschedulePolicy: {
                        ...bp.reschedulePolicy,
                        hoursBeforeAppointment: Math.max(0, parseInt(e.target.value) || 0)
                      }
                    })
                  }
                  InputProps={{ endAdornment: <InputAdornment position='end'>hours before</InputAdornment> }}
                  helperText='Minimum time before appointment when rescheduling is allowed'
                  size='small'
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* No-Show Policy */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='No-Show Policy' subheader='Handle customers who miss their appointments' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bp.noShowPolicy.chargeFee}
                    onChange={e => set({ noShowPolicy: { ...bp.noShowPolicy, chargeFee: e.target.checked } })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Charge no-show fee</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Charge customers who don't show up for their appointment
                    </Typography>
                  </Box>
                }
              />

              {bp.noShowPolicy.chargeFee && (
                <TextField
                  label='No-Show Fee'
                  type='number'
                  value={bp.noShowPolicy.feePercentage}
                  onChange={e =>
                    set({
                      noShowPolicy: {
                        ...bp.noShowPolicy,
                        feePercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      }
                    })
                  }
                  InputProps={{ endAdornment: <InputAdornment position='end'>% of booking</InputAdornment> }}
                  size='small'
                />
              )}

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={bp.noShowPolicy.restrictFutureBookings}
                    onChange={e =>
                      set({ noShowPolicy: { ...bp.noShowPolicy, restrictFutureBookings: e.target.checked } })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Restrict future bookings</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Temporarily block customers from booking after a no-show
                    </Typography>
                  </Box>
                }
              />

              {bp.noShowPolicy.restrictFutureBookings && (
                <>
                  <TextField
                    label='After how many no-shows?'
                    type='number'
                    value={bp.noShowPolicy.restrictAfterCount ?? 3}
                    onChange={e =>
                      set({
                        noShowPolicy: {
                          ...bp.noShowPolicy,
                          restrictAfterCount: Math.max(1, parseInt(e.target.value) || 1)
                        }
                      })
                    }
                    InputProps={{ endAdornment: <InputAdornment position='end'>no-shows</InputAdornment> }}
                    helperText='Number of no-shows before restrictions apply'
                    size='small'
                  />
                  <TextField
                    label='Restriction Period'
                    type='number'
                    value={bp.noShowPolicy.restrictionDays}
                    onChange={e =>
                      set({
                        noShowPolicy: {
                          ...bp.noShowPolicy,
                          restrictionDays: Math.max(1, parseInt(e.target.value) || 1)
                        }
                      })
                    }
                    InputProps={{ endAdornment: <InputAdornment position='end'>days</InputAdornment> }}
                    size='small'
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <ConfirmChangesDialog
        open={confirmOpen}
        title='Save Booking Policies'
        changes={changes}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Grid>
  )
}

export default BookingPoliciesTab
