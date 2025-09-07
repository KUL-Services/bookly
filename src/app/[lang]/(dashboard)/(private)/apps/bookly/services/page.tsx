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

// Data Imports
import { mockServices, mockBusinesses } from '@/bookly/data/mock-data'

const businessNameById = Object.fromEntries(mockBusinesses.map(b => [b.id, b.name]))

const BooklyServicesPage = async () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Services' subheader='Mocked data' />
          <CardContent>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align='right'>Duration</TableCell>
                  <TableCell align='right'>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockServices.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{businessNameById[s.businessId]}</TableCell>
                    <TableCell>{s.category}</TableCell>
                    <TableCell align='right'>{s.duration} min</TableCell>
                    <TableCell align='right'>${s.price}</TableCell>
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

export default BooklyServicesPage

