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
import Avatar from '@mui/material/Avatar'

// Data Imports
import { mockStaff, mockBusinesses } from '@/bookly/data/mock-data'

const businessNameById = Object.fromEntries(mockBusinesses.map(b => [b.id, b.name]))

const BooklyStaffPage = async () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Staff' subheader='Mocked data' />
          <CardContent>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Business</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockStaff.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell className='flex items-center gap-3'>
                      <Avatar alt={s.name} src={s.photo} />
                      {s.name}
                    </TableCell>
                    <TableCell>{s.title}</TableCell>
                    <TableCell>{businessNameById[s.businessId]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BooklyStaffPage

