// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const OrderIdFormat = () => {
  return (
    <Card>
      <CardHeader
        title='Order id format'
        subheader={
          <Typography variant='body2' color='text.secondary' style={{ fontFamily: 'var(--font-fira-code)' }}>
            Shown on the Orders page, customer pages, and customer order notifications to identify orders.
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Prefix'
              placeholder='Prefix'
              InputProps={{
                startAdornment: <InputAdornment position='start'>#</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Suffix'
              placeholder='Suffix'
              InputProps={{
                endAdornment: <InputAdornment position='end'>$</InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        <Typography className='mbs-2'>
          Your order ID will appear as <span style={{ fontFamily: 'var(--font-fira-code)' }}>#1001</span>,{' '}
          <span style={{ fontFamily: 'var(--font-fira-code)' }}>#1002</span>,{' '}
          <span style={{ fontFamily: 'var(--font-fira-code)' }}>#1003</span> ...
        </Typography>
      </CardContent>
    </Card>
  )
}

export default OrderIdFormat
