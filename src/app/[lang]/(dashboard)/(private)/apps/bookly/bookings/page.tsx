// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'

// Data Imports
import { mockBookings } from '@/bookly/data/mock-data'

const statusColor = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'default'
} as const

const BooklyBookingsPage = async () => {
  const rows = [...mockBookings].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='All Bookings' subheader='Mocked data' />
          <CardContent>
            <div className='overflow-x-auto'>
              <Table size='small' sx={{ minWidth: { xs: 700, md: 'auto' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Business</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Staff</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell align='right'>Price</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.businessName}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.serviceName}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.staffMemberName}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.time}</TableCell>
                      <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>${row.price}</TableCell>
                      <TableCell>
                        <Chip size='small' variant='tonal' label={row.status} color={statusColor[row.status]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BooklyBookingsPage

