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

type Row = {
  id: string
  name: string
  title: string
  business: string
  branch: string
  completed: number
  revenue: number
}

const StaffPerformance = ({ rows }: { rows: Row[] }) => {
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
                  EGP {r.revenue.toFixed(2)}
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
