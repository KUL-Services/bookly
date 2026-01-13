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
import Link from 'next/link'
import Typography from '@mui/material/Typography'

// Types
import type { Booking } from '@/bookly/data/types'

const statusColor: Record<Booking['status'], 'success' | 'warning' | 'error' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'default'
}

const UpcomingBookings = ({ rows, lang }: { rows: Booking[]; lang?: string }) => {
  return (
    <Card>
      <CardHeader
        title='Upcoming Bookings'
        subheader={
          <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
            Based on mock Bookly data
          </Typography>
        }
      />
      <CardContent>
        <div className='overflow-x-auto'>
          <Table size='small' aria-label='Upcoming bookings table' sx={{ minWidth: { xs: 800, md: 'auto' } }}>
            <caption>Upcoming bookings with branch information</caption>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Business</TableCell>
                <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Branch</TableCell>
                <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Service</TableCell>
                <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Staff</TableCell>
                <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Date</TableCell>
                <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Time</TableCell>
                <TableCell align='right' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.businessName}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {lang ? (
                      <Link
                        href={`/${lang}/apps/bookly/businesses/${row.businessId}/branches/${row.branchId}`}
                        className='text-primary'
                      >
                        {row.branchName}
                      </Link>
                    ) : (
                      row.branchName
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.serviceName}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.staffMemberName}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.time}</TableCell>
                  <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                    ${row.price}
                  </TableCell>
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
  )
}

export default UpcomingBookings
