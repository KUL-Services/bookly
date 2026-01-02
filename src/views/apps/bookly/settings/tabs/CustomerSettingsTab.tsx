'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

const CustomerSettingsTab = () => {
  const { customerSettings, updateCustomerSettings } = useBusinessSettingsStore()

  return (
    <Grid container spacing={6}>
      {/* Guest Checkout */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Guest Checkout' subheader='Allow customers to book without creating an account' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={customerSettings.guestCheckout}
                    onChange={e => updateCustomerSettings({ guestCheckout: e.target.checked })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Enable Guest Checkout</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      When enabled, customers can book without signing up for an account
                    </Typography>
                  </Box>
                }
              />

              {customerSettings.guestCheckout && (
                <Alert severity='info' sx={{ fontSize: '0.875rem' }}>
                  Guest customers will still need to provide contact information for booking confirmations.
                </Alert>
              )}

              {!customerSettings.guestCheckout && (
                <Alert severity='warning' sx={{ fontSize: '0.875rem' }}>
                  Requiring account creation may reduce conversion rates but helps build your customer database.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Required Fields */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title='Required Customer Information'
            subheader='Choose which fields are mandatory for bookings'
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={customerSettings.requireEmail}
                    onChange={e => updateCustomerSettings({ requireEmail: e.target.checked })}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-mail-line' />
                    <Box>
                      <Typography variant='body1'>Require Email</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Email is needed for confirmations and reminders
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={customerSettings.requirePhone}
                    onChange={e => updateCustomerSettings({ requirePhone: e.target.checked })}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-phone-line' />
                    <Box>
                      <Typography variant='body1'>Require Phone Number</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Phone number for SMS reminders and urgent contact
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              {!customerSettings.requireEmail && !customerSettings.requirePhone && (
                <Alert severity='warning' sx={{ mt: 2, fontSize: '0.875rem' }}>
                  At least one contact method (email or phone) should be required for booking confirmations.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Staff Visibility */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title='Staff Information Visibility'
            subheader='Control what information staff can see about customers'
          />
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={customerSettings.showCustomerNotesToStaff}
                  onChange={e => updateCustomerSettings({ showCustomerNotesToStaff: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant='body1'>Show Customer Notes to Staff</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Staff members can view notes and special requests from customers
                  </Typography>
                </Box>
              }
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Current Configuration Summary */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='Customer Experience Summary' subheader='Overview of current customer settings' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className={customerSettings.guestCheckout ? 'ri-user-line' : 'ri-user-add-line'} />
                  <Typography color='text.secondary'>Account Requirement</Typography>
                </Box>
                <Typography fontWeight={600}>{customerSettings.guestCheckout ? 'Optional' : 'Required'}</Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-mail-line' />
                  <Typography color='text.secondary'>Email</Typography>
                </Box>
                <Typography fontWeight={600} color={customerSettings.requireEmail ? 'success.main' : 'text.secondary'}>
                  {customerSettings.requireEmail ? 'Required' : 'Optional'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-phone-line' />
                  <Typography color='text.secondary'>Phone</Typography>
                </Box>
                <Typography fontWeight={600} color={customerSettings.requirePhone ? 'success.main' : 'text.secondary'}>
                  {customerSettings.requirePhone ? 'Required' : 'Optional'}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-sticky-note-line' />
                  <Typography color='text.secondary'>Notes to Staff</Typography>
                </Box>
                <Typography fontWeight={600}>
                  {customerSettings.showCustomerNotesToStaff ? 'Visible' : 'Hidden'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Future Features */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Coming Soon' subheader='Additional customer features in development' />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <i className='ri-gift-line' style={{ fontSize: '1.5rem' }} />
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      Loyalty Program
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Reward repeat customers with points and discounts
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <i className='ri-vip-crown-line' style={{ fontSize: '1.5rem' }} />
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      VIP Customers
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Priority booking and special perks for top customers
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <i className='ri-chat-smile-3-line' style={{ fontSize: '1.5rem' }} />
                  <Box>
                    <Typography variant='body1' fontWeight={600}>
                      Review Requests
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Automatically request reviews after appointments
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomerSettingsTab
