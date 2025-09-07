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
import { mockBusinesses, categories as booklyCategories } from '@/bookly/data/mock-data'

const BooklyBusinessesPage = async () => {
  const categoryNameById = Object.fromEntries(booklyCategories.map(c => [c.id, c.name]))

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Businesses' subheader='Mocked data' />
          <CardContent>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Business</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Categories</TableCell>
                  <TableCell align='right'>Rating</TableCell>
                  <TableCell align='right'>Reviews</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockBusinesses.map(b => (
                  <TableRow key={b.id} hover>
                    <TableCell className='flex items-center gap-3'>
                      <Avatar alt={b.name} src={b.coverImage} />
                      {b.name}
                    </TableCell>
                    <TableCell>{b.city}</TableCell>
                    <TableCell>
                      {b.categories.map(cid => categoryNameById[cid]).join(', ')}
                    </TableCell>
                    <TableCell align='right'>{b.averageRating.toFixed(1)}</TableCell>
                    <TableCell align='right'>{b.totalRatings}</TableCell>
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

export default BooklyBusinessesPage
