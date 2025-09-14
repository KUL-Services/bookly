// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'

// Data Imports
import { mockBookings, mockServices, mockBusinesses } from '@/bookly/data/mock-data'

type Row = {
  key: string
  serviceName: string
  business: string
  avgPrice: number
  bookings: number
  revenue: number
}

const TopServices = () => {
  const map = new Map<string, Row>() // key: businessId|serviceName

  mockBookings.forEach(b => {
    const key = `${b.businessId}|${b.serviceName}`
    const businessName = mockBusinesses.find(x => x.id === b.businessId)?.name || '—'
    const row = map.get(key) || {
      key,
      serviceName: b.serviceName,
      business: businessName,
      avgPrice: 0,
      bookings: 0,
      revenue: 0
    }
    row.bookings += 1
    row.revenue += b.price
    map.set(key, row)
  })

  // Compute avg price using mockServices if possible
  for (const row of map.values()) {
    const svc = mockServices.find(s => s.name === row.serviceName && mockBusinesses.find(b => b.id === s.businessId)?.name === row.business)
    row.avgPrice = svc ? svc.price : row.revenue / Math.max(1, row.bookings)
  }

  const rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6)

  return (
    <Card>
      <CardHeader title='Top Performing Services' subheader='By revenue' />
      <CardContent>
        <Table size='small' aria-label='Top services table'>
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Business</TableCell>
              <TableCell align='right'>Bookings</TableCell>
              <TableCell align='right'>Avg Price</TableCell>
              <TableCell align='right'>Revenue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.key}>
                <TableCell>{r.serviceName}</TableCell>
                <TableCell>{r.business}</TableCell>
                <TableCell align='right'>{r.bookings}</TableCell>
                <TableCell align='right'>${r.avgPrice.toFixed(2)}</TableCell>
                <TableCell align='right'>${r.revenue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default TopServices

