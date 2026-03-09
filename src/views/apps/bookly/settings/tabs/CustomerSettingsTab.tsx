'use client'

// MUI
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

// Draft infra
import { useTabDraft } from '@/bookly/hooks/use-tab-draft'
import { TabSaveBar } from '@/bookly/components/molecules/tab-save-bar'
import { ConfirmChangesDialog } from '@/bookly/components/molecules/confirm-changes-dialog'

const LABELS: Record<string, string> = {
  guestCheckout: 'Guest checkout',
  requireEmail: 'Require email',
  requirePhone: 'Require phone number',
  showCustomerNotesToStaff: 'Show customer notes to staff'
}

const CustomerSettingsTab = () => {
  const { customerSettings, updateCustomerSettings, saveCustomerSettings, isSaving } = useBusinessSettingsStore()

  const { draft, setDraft, isDirty, changes, confirmOpen, setConfirmOpen, handleCancel, handleConfirm } = useTabDraft({
    tabId: 'customers',
    labels: LABELS,
    saved: customerSettings as unknown as Record<string, unknown>,
    applyDraft: d => updateCustomerSettings(d as unknown as typeof customerSettings),
    saveAction: saveCustomerSettings
  })

  const set = (patch: Partial<typeof customerSettings>) =>
    setDraft(prev => ({ ...prev, ...patch }) as unknown as Record<string, unknown>)

  const cs = draft as unknown as typeof customerSettings

  return (
    <Grid container spacing={6}>
      {/* Inline dirty bar */}
      <Grid item xs={12}>
        <TabSaveBar
          isDirty={isDirty}
          changes={changes}
          isSaving={isSaving}
          saveLabel='Save Customer Settings'
          onSave={() => setConfirmOpen(true)}
          onCancel={handleCancel}
        />
      </Grid>

      {/* Guest Checkout */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Guest Checkout' subheader='Allow customers to book without creating an account' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={<Switch checked={cs.guestCheckout} onChange={e => set({ guestCheckout: e.target.checked })} />}
                label={
                  <Box>
                    <Typography variant='body1'>Enable Guest Checkout</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      When enabled, customers can book without signing up for an account
                    </Typography>
                  </Box>
                }
              />

              {cs.guestCheckout && (
                <Alert severity='info' sx={{ fontSize: '0.875rem' }}>
                  Guest customers will still need to provide contact information for booking confirmations.
                </Alert>
              )}

              {!cs.guestCheckout && (
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
                control={<Switch checked={cs.requireEmail} onChange={e => set({ requireEmail: e.target.checked })} />}
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
                control={<Switch checked={cs.requirePhone} onChange={e => set({ requirePhone: e.target.checked })} />}
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

              {!cs.requireEmail && !cs.requirePhone && (
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
                  checked={cs.showCustomerNotesToStaff}
                  onChange={e => set({ showCustomerNotesToStaff: e.target.checked })}
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

      {/* Summary */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='Customer Experience Summary' subheader='Overview of current customer settings' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className={cs.guestCheckout ? 'ri-user-line' : 'ri-user-add-line'} />
                  <Typography color='text.secondary'>Account Requirement</Typography>
                </Box>
                <Typography fontWeight={600}>{cs.guestCheckout ? 'Optional' : 'Required'}</Typography>
              </Box>

              <Divider />

              {[
                {
                  icon: 'ri-mail-line',
                  label: 'Email',
                  value: cs.requireEmail ? 'Required' : 'Optional',
                  positive: cs.requireEmail
                },
                {
                  icon: 'ri-phone-line',
                  label: 'Phone',
                  value: cs.requirePhone ? 'Required' : 'Optional',
                  positive: cs.requirePhone
                }
              ].map(row => (
                <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className={row.icon} />
                    <Typography color='text.secondary'>{row.label}</Typography>
                  </Box>
                  <Typography fontWeight={600} color={row.positive ? 'success.main' : 'text.secondary'}>
                    {row.value}
                  </Typography>
                </Box>
              ))}

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-sticky-note-line' />
                  <Typography color='text.secondary'>Notes to Staff</Typography>
                </Box>
                <Typography fontWeight={600}>{cs.showCustomerNotesToStaff ? 'Visible' : 'Hidden'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Coming Soon */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Coming Soon' subheader='Additional customer features in development' />
          <CardContent>
            <Grid container spacing={2}>
              {[
                {
                  icon: 'ri-gift-line',
                  title: 'Loyalty Program',
                  desc: 'Reward repeat customers with points and discounts'
                },
                {
                  icon: 'ri-vip-crown-line',
                  title: 'VIP Customers',
                  desc: 'Priority booking and special perks for top customers'
                },
                {
                  icon: 'ri-chat-smile-3-line',
                  title: 'Review Requests',
                  desc: 'Automatically request reviews after appointments'
                }
              ].map(item => (
                <Grid item xs={12} md={4} key={item.title}>
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
                    <i className={item.icon} style={{ fontSize: '1.5rem' }} />
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        {item.title}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <ConfirmChangesDialog
        open={confirmOpen}
        title='Save Customer Settings'
        changes={changes}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Grid>
  )
}

export default CustomerSettingsTab
