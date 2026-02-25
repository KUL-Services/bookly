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
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'
import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'

const BookingPoliciesTab = () => {
  const { bookingPolicies, updateBookingPolicies, saveBookingPoliciesSettings, isSaving } = useBusinessSettingsStore()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            onClick={saveBookingPoliciesSettings}
            disabled={isSaving}
            startIcon={isSaving ? <BrandedSpinner size={16} color='inherit' /> : null}
          >
            {isSaving ? 'Saving...' : 'Save Booking Policies'}
          </Button>
        </Box>
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
                  <Switch
                    checked={bookingPolicies.autoConfirmation}
                    onChange={e => updateBookingPolicies({ autoConfirmation: e.target.checked })}
                  />
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
                    value={[0, 1, 2, 4, 8, 12, 24].includes(bookingPolicies.bookingLeadTime) ? bookingPolicies.bookingLeadTime : 'custom'}
                    label='Minimum Booking Lead Time'
                    onChange={e => {
                      const val = e.target.value
                      if (val !== 'custom') updateBookingPolicies({ bookingLeadTime: val as number })
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
                {![0, 1, 2, 4, 8, 12, 24].includes(bookingPolicies.bookingLeadTime) && (
                  <TextField
                    type='number'
                    value={bookingPolicies.bookingLeadTime}
                    onChange={e => updateBookingPolicies({ bookingLeadTime: Math.max(0, parseInt(e.target.value) || 0) })}
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
                    value={[7, 14, 30, 60, 90].includes(bookingPolicies.maxAdvanceBooking) ? bookingPolicies.maxAdvanceBooking : 'custom'}
                    label='Maximum Advance Booking'
                    onChange={e => {
                      const val = e.target.value
                      if (val !== 'custom') updateBookingPolicies({ maxAdvanceBooking: val as number })
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
                {![7, 14, 30, 60, 90].includes(bookingPolicies.maxAdvanceBooking) && (
                  <TextField
                    type='number'
                    value={bookingPolicies.maxAdvanceBooking}
                    onChange={e => updateBookingPolicies({ maxAdvanceBooking: Math.max(1, parseInt(e.target.value) || 1) })}
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
                    checked={bookingPolicies.cancellationPolicy.enabled}
                    onChange={e =>
                      updateBookingPolicies({
                        cancellationPolicy: {
                          ...bookingPolicies.cancellationPolicy,
                          enabled: e.target.checked
                        }
                      })
                    }
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

              {bookingPolicies.cancellationPolicy.enabled && (
                <>
                  <TextField
                    label='Cancellation Deadline'
                    type='number'
                    value={bookingPolicies.cancellationPolicy.hoursBeforeAppointment}
                    onChange={e =>
                      updateBookingPolicies({
                        cancellationPolicy: {
                          ...bookingPolicies.cancellationPolicy,
                          hoursBeforeAppointment: Math.max(0, parseInt(e.target.value) || 0)
                        }
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>hours before</InputAdornment>
                    }}
                    helperText='Minimum time before appointment when cancellation is allowed'
                    size='small'
                  />

                  <TextField
                    label='Refund Percentage'
                    type='number'
                    value={bookingPolicies.cancellationPolicy.refundPercentage}
                    onChange={e =>
                      updateBookingPolicies({
                        cancellationPolicy: {
                          ...bookingPolicies.cancellationPolicy,
                          refundPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                        }
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>%</InputAdornment>
                    }}
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
                    checked={bookingPolicies.reschedulePolicy.enabled}
                    onChange={e =>
                      updateBookingPolicies({
                        reschedulePolicy: {
                          ...bookingPolicies.reschedulePolicy,
                          enabled: e.target.checked
                        }
                      })
                    }
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

              {bookingPolicies.reschedulePolicy.enabled && (
                <TextField
                  label='Reschedule Deadline'
                  type='number'
                  value={bookingPolicies.reschedulePolicy.hoursBeforeAppointment}
                  onChange={e =>
                    updateBookingPolicies({
                      reschedulePolicy: {
                        ...bookingPolicies.reschedulePolicy,
                        hoursBeforeAppointment: Math.max(0, parseInt(e.target.value) || 0)
                      }
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>hours before</InputAdornment>
                  }}
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
                    checked={bookingPolicies.noShowPolicy.chargeFee}
                    onChange={e =>
                      updateBookingPolicies({
                        noShowPolicy: {
                          ...bookingPolicies.noShowPolicy,
                          chargeFee: e.target.checked
                        }
                      })
                    }
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

              {bookingPolicies.noShowPolicy.chargeFee && (
                <TextField
                  label='No-Show Fee'
                  type='number'
                  value={bookingPolicies.noShowPolicy.feePercentage}
                  onChange={e =>
                    updateBookingPolicies({
                      noShowPolicy: {
                        ...bookingPolicies.noShowPolicy,
                        feePercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      }
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>% of booking</InputAdornment>
                  }}
                  size='small'
                />
              )}

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={bookingPolicies.noShowPolicy.restrictFutureBookings}
                    onChange={e =>
                      updateBookingPolicies({
                        noShowPolicy: {
                          ...bookingPolicies.noShowPolicy,
                          restrictFutureBookings: e.target.checked
                        }
                      })
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

              {bookingPolicies.noShowPolicy.restrictFutureBookings && (
                <>
                  <TextField
                    label='After how many no-shows?'
                    type='number'
                    value={bookingPolicies.noShowPolicy.restrictAfterCount ?? 3}
                    onChange={e =>
                      updateBookingPolicies({
                        noShowPolicy: {
                          ...bookingPolicies.noShowPolicy,
                          restrictAfterCount: Math.max(1, parseInt(e.target.value) || 1)
                        }
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>no-shows</InputAdornment>
                    }}
                    helperText='Number of no-shows before restrictions apply'
                    size='small'
                  />
                  <TextField
                    label='Restriction Period'
                    type='number'
                    value={bookingPolicies.noShowPolicy.restrictionDays}
                    onChange={e =>
                      updateBookingPolicies({
                        noShowPolicy: {
                          ...bookingPolicies.noShowPolicy,
                          restrictionDays: Math.max(1, parseInt(e.target.value) || 1)
                        }
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>days</InputAdornment>
                    }}
                    size='small'
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BookingPoliciesTab
