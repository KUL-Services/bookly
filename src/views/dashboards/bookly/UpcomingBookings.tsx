// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'

// Types
import type { Booking } from '@/bookly/data/types'

const statusColor: Record<Booking['status'], 'success' | 'warning' | 'error' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'default'
}

const UpcomingBookings = ({ rows }: { rows: Booking[] }) => {
  return (
    <Card>
      <CardHeader title='Upcoming Bookings' subheader='Based on mock Bookly data' />
      <CardContent>
        <Table size='small'>
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
                <TableCell>{row.businessName}</TableCell>
                <TableCell>{row.serviceName}</TableCell>
                <TableCell>{row.staffMemberName}</TableCell>
                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell align='right'>${row.price}</TableCell>
                <TableCell>
                  <Chip size='small' variant='tonal' label={row.status} color={statusColor[row.status]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default UpcomingBookings

