'use client'

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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import FormGroup from '@mui/material/FormGroup'
import Chip from '@mui/material/Chip'

// Store
import { useBusinessSettingsStore, type PaymentMethod } from '@/stores/business-settings.store'

// Draft infra
import { useTabDraft } from '@/bookly/hooks/use-tab-draft'
import { TabSaveBar } from '@/bookly/components/molecules/tab-save-bar'
import { ConfirmChangesDialog } from '@/bookly/components/molecules/confirm-changes-dialog'

const paymentMethodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
  pay_on_arrival: { label: 'Pay on Arrival', icon: 'ri-store-2-line' },
  card: { label: 'Credit/Debit Card', icon: 'ri-bank-card-line' },
  instapay: { label: 'InstaPay', icon: 'ri-smartphone-line' },
  fawry: { label: 'Fawry', icon: 'ri-qr-code-line' }
}

const currencies = [
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
]

const LABELS: Record<string, string> = {
  acceptedMethods: 'Accepted payment methods',
  currency: 'Currency',
  taxEnabled: 'Tax (VAT) enabled',
  taxPercentage: 'Tax rate (%)',
  taxInclusive: 'Tax inclusive pricing',
  depositRequired: 'Deposit required',
  depositPercentage: 'Deposit amount (%)'
}

const PaymentSettingsTab = () => {
  const { paymentSettings, updatePaymentSettings, savePaymentSettings, isSaving } = useBusinessSettingsStore()

  const { draft, setDraft, isDirty, changes, confirmOpen, setConfirmOpen, handleCancel, handleConfirm } = useTabDraft({
    tabId: 'payment',
    labels: LABELS,
    saved: paymentSettings as unknown as Record<string, unknown>,
    applyDraft: d => updatePaymentSettings(d as unknown as typeof paymentSettings),
    saveAction: savePaymentSettings
  })

  const set = (patch: Partial<typeof paymentSettings>) =>
    setDraft(prev => ({ ...prev, ...patch }) as unknown as Record<string, unknown>)

  const ps = draft as unknown as typeof paymentSettings

  const handleMethodToggle = (method: PaymentMethod) => {
    const current = ps.acceptedMethods
    if (current.includes(method)) {
      if (current.length === 1) return
      set({ acceptedMethods: current.filter(m => m !== method) })
    } else {
      set({ acceptedMethods: [...current, method] })
    }
  }

  return (
    <Grid container spacing={6}>
      {/* Inline dirty bar */}
      <Grid item xs={12}>
        <TabSaveBar
          isDirty={isDirty}
          changes={changes}
          isSaving={isSaving}
          saveLabel='Save Payment Settings'
          onSave={() => setConfirmOpen(true)}
          onCancel={handleCancel}
        />
      </Grid>

      {/* Payment Methods */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Payment Methods' subheader='Select which payment methods customers can use' />
          <CardContent>
            <FormGroup>
              {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map(method => (
                <FormControlLabel
                  key={method}
                  control={
                    <Checkbox
                      checked={ps.acceptedMethods.includes(method)}
                      onChange={() => handleMethodToggle(method)}
                      disabled={ps.acceptedMethods.includes(method) && ps.acceptedMethods.length === 1}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className={paymentMethodLabels[method]?.icon || 'ri-question-line'} />
                      <Typography>{paymentMethodLabels[method]?.label || method}</Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>

            <Box sx={{ mt: 2 }}>
              <Typography variant='caption' color='text.secondary'>
                At least one payment method must be selected
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant='body2' color='text.secondary' sx={{ width: '100%', mb: 1 }}>
                Currently Enabled:
              </Typography>
              {ps.acceptedMethods.map(method => (
                <Chip
                  key={method}
                  icon={<i className={paymentMethodLabels[method]?.icon || 'ri-question-line'} />}
                  label={paymentMethodLabels[method]?.label || method}
                  color='primary'
                  variant='outlined'
                  size='small'
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Currency & Tax */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Currency & Tax' subheader='Configure pricing and tax settings' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Currency</InputLabel>
                <Select value={ps.currency} label='Currency' onChange={e => set({ currency: e.target.value })}>
                  {currencies.map(c => (
                    <MenuItem key={c.code} value={c.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ minWidth: 30 }}>{c.symbol}</Typography>
                        <Typography>{c.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          ({c.code})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <FormControlLabel
                control={<Switch checked={ps.taxEnabled} onChange={e => set({ taxEnabled: e.target.checked })} />}
                label={
                  <Box>
                    <Typography variant='body1'>Enable Tax (VAT)</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Add tax to service prices
                    </Typography>
                  </Box>
                }
              />

              {ps.taxEnabled && (
                <>
                  <TextField
                    label='Tax Rate'
                    type='number'
                    value={ps.taxPercentage}
                    onChange={e => set({ taxPercentage: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                    InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
                    size='small'
                  />
                  <FormControlLabel
                    control={
                      <Switch checked={ps.taxInclusive} onChange={e => set({ taxInclusive: e.target.checked })} />
                    }
                    label={
                      <Box>
                        <Typography variant='body1'>Tax Inclusive Pricing</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {ps.taxInclusive
                            ? 'Prices shown already include tax'
                            : 'Tax is added on top of displayed prices'}
                        </Typography>
                      </Box>
                    }
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Deposit Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Deposit Requirements' subheader='Require upfront payment to secure bookings' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch checked={ps.depositRequired} onChange={e => set({ depositRequired: e.target.checked })} />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Require Deposit</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Customers must pay a deposit when booking
                    </Typography>
                  </Box>
                }
              />
              {ps.depositRequired && (
                <TextField
                  label='Deposit Amount'
                  type='number'
                  value={ps.depositPercentage}
                  onChange={e => set({ depositPercentage: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                  InputProps={{ endAdornment: <InputAdornment position='end'>% of total</InputAdornment> }}
                  helperText='Percentage of the booking total required as deposit'
                  size='small'
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Summary */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='Payment Summary' subheader='Overview of your current payment configuration' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Currency', value: currencies.find(c => c.code === ps.currency)?.name || ps.currency },
                { label: 'Payment Methods', value: `${ps.acceptedMethods.length} enabled` },
                { label: 'Tax', value: ps.taxEnabled ? `${ps.taxPercentage}%` : 'Disabled' },
                { label: 'Deposit', value: ps.depositRequired ? `${ps.depositPercentage}%` : 'Not required' }
              ].map(row => (
                <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color='text.secondary'>{row.label}</Typography>
                  <Typography fontWeight={600}>{row.value}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <ConfirmChangesDialog
        open={confirmOpen}
        title='Save Payment Settings'
        changes={changes}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Grid>
  )
}

export default PaymentSettingsTab
