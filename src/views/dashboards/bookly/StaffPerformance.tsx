// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Typography from '@mui/material/Typography'

// Data Imports
import { mockBookings, mockStaff, mockBusinesses } from '@/bookly/data/mock-data'

type Row = {
  id: string
  name: string
  title: string
  business: string
  branch: string
  completed: number
  revenue: number
}

const StaffPerformance = () => {
  const rows: Row[] = mockStaff.map(st => {
    const staffBookings = mockBookings.filter(b => b.staffMemberName === st.name)
    const completed = staffBookings.filter(b => b.status === 'completed')
    const revenue = completed.reduce((sum, b) => sum + b.price, 0)
    const businessName = mockBusinesses.find(b => b.id === st.businessId)?.name || '—'
    const branchName = businessName
      ? mockBusinesses.find(b => b.id === st.businessId)?.branches.find(br => br.id === st.branchId)?.name || '—'
      : '—'

    return {
      id: st.id,
      name: st.name,
      title: st.title,
      business: businessName,
      branch: branchName,
      completed: completed.length,
      revenue
    }
  })

  // Sort by revenue desc
  rows.sort((a, b) => b.revenue - a.revenue)

  return (
    <Card>
      <CardHeader
        title='Staff Performance'
        subheader={
          <Typography variant='body2' color='text.secondary' sx={{ fontFamily: 'var(--font-fira-code)' }}>
            Completed bookings and revenue
          </Typography>
        }
      />
      <CardContent>
        <Table size='small' aria-label='Staff performance table'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Staff</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Title</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Business</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-fira-code)' }}>Branch</TableCell>
              <TableCell align='right' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                Completed
              </TableCell>
              <TableCell align='right' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                Revenue
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.business}</TableCell>
                <TableCell>{r.branch}</TableCell>
                <TableCell align='right' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                  {r.completed}
                </TableCell>
                <TableCell align='right' sx={{ fontFamily: 'var(--font-fira-code)' }}>
                  ${r.revenue.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default StaffPerformance
