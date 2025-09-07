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
import { categories as booklyCategories, mockBusinesses } from '@/bookly/data/mock-data'

const BooklyCategoriesPage = async () => {
  // Count businesses per category id
  const counts: Record<string, number> = {}
  for (const c of booklyCategories) counts[c.id] = 0
  for (const b of mockBusinesses) {
    for (const cid of b.categories) counts[cid] = (counts[cid] || 0) + 1
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Categories' subheader='Mocked data' />
          <CardContent>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Icon</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell align='right'>Businesses</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {booklyCategories.map(c => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.icon}</TableCell>
                    <TableCell>{c.slug}</TableCell>
                    <TableCell align='right'>{counts[c.id] || 0}</TableCell>
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

export default BooklyCategoriesPage

