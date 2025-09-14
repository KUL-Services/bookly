// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Data Imports
import { mockBookings } from '@/bookly/data/mock-data'

const ClientsActivity = () => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth = mockBookings.filter(b => new Date(b.date) >= monthStart && new Date(b.date) <= now)

  const total = thisMonth.length
  const completed = thisMonth.filter(b => b.status === 'completed').length
  const cancelled = thisMonth.filter(b => b.status === 'cancelled').length
  const activeBusinesses = new Set(thisMonth.map(b => b.businessId)).size
  const uniqueServices = new Set(thisMonth.map(b => b.serviceName)).size

  return (
    <Card>
      <CardHeader title='Client Activity' subheader='This month snapshot (proxy)' />
      <CardContent>
        <Box className='flex flex-wrap gap-2 mb-2'>
          <Chip label={`Bookings: ${total}`} color='primary' variant='tonal' />
          <Chip label={`Completed: ${completed}`} color='success' variant='tonal' />
          <Chip label={`Cancelled: ${cancelled}`} color='warning' variant='tonal' />
        </Box>
        <Typography variant='body2' color='text.secondary'>
          Active businesses: {activeBusinesses} • Unique services booked: {uniqueServices}
        </Typography>
        <Typography variant='caption' color='text.disabled' display='block' className='mt-2'>
          Note: true client metrics need customer identifiers; this is a proxy.
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ClientsActivity

