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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import FormGroup from '@mui/material/FormGroup'
import Chip from '@mui/material/Chip'

// Store
import { useBusinessSettingsStore, type PaymentMethod } from '@/stores/business-settings.store'

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

const PaymentSettingsTab = () => {
  const { paymentSettings, updatePaymentSettings } = useBusinessSettingsStore()

  const handleMethodToggle = (method: PaymentMethod) => {
    const currentMethods = paymentSettings.acceptedMethods
    if (currentMethods.includes(method)) {
      // Don't allow removing the last payment method
      if (currentMethods.length === 1) return
      updatePaymentSettings({
        acceptedMethods: currentMethods.filter(m => m !== method)
      })
    } else {
      updatePaymentSettings({
        acceptedMethods: [...currentMethods, method]
      })
    }
  }

  return (
    <Grid container spacing={6}>
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
                      checked={paymentSettings.acceptedMethods.includes(method)}
                      onChange={() => handleMethodToggle(method)}
                      disabled={
                        paymentSettings.acceptedMethods.includes(method) && paymentSettings.acceptedMethods.length === 1
                      }
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className={paymentMethodLabels[method].icon} />
                      <Typography>{paymentMethodLabels[method].label}</Typography>
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
              {paymentSettings.acceptedMethods.map(method => (
                <Chip
                  key={method}
                  icon={<i className={paymentMethodLabels[method].icon} />}
                  label={paymentMethodLabels[method].label}
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
                <Select
                  value={paymentSettings.currency}
                  label='Currency'
                  onChange={e => updatePaymentSettings({ currency: e.target.value })}
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency.code} value={currency.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ minWidth: 30 }}>{currency.symbol}</Typography>
                        <Typography>{currency.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          ({currency.code})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={paymentSettings.taxEnabled}
                    onChange={e => updatePaymentSettings({ taxEnabled: e.target.checked })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Enable Tax (VAT)</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Add tax to service prices
                    </Typography>
                  </Box>
                }
              />

              {paymentSettings.taxEnabled && (
                <>
                  <TextField
                    label='Tax Rate'
                    type='number'
                    value={paymentSettings.taxPercentage}
                    onChange={e =>
                      updatePaymentSettings({
                        taxPercentage: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>%</InputAdornment>
                    }}
                    size='small'
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.taxInclusive}
                        onChange={e => updatePaymentSettings({ taxInclusive: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body1'>Tax Inclusive Pricing</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {paymentSettings.taxInclusive
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
                  <Switch
                    checked={paymentSettings.depositRequired}
                    onChange={e => updatePaymentSettings({ depositRequired: e.target.checked })}
                  />
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

              {paymentSettings.depositRequired && (
                <TextField
                  label='Deposit Amount'
                  type='number'
                  value={paymentSettings.depositPercentage}
                  onChange={e =>
                    updatePaymentSettings({
                      depositPercentage: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>% of total</InputAdornment>
                  }}
                  helperText='Percentage of the booking total required as deposit'
                  size='small'
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Info Summary */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='Payment Summary' subheader='Overview of your current payment configuration' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary'>Currency</Typography>
                <Typography fontWeight={600}>
                  {currencies.find(c => c.code === paymentSettings.currency)?.name || paymentSettings.currency}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary'>Payment Methods</Typography>
                <Typography fontWeight={600}>{paymentSettings.acceptedMethods.length} enabled</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary'>Tax</Typography>
                <Typography fontWeight={600}>
                  {paymentSettings.taxEnabled ? `${paymentSettings.taxPercentage}%` : 'Disabled'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary'>Deposit</Typography>
                <Typography fontWeight={600}>
                  {paymentSettings.depositRequired ? `${paymentSettings.depositPercentage}%` : 'Not required'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PaymentSettingsTab
