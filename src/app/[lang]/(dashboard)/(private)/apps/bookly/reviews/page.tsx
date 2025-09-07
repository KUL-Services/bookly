// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Data Imports
import { mockReviews, mockBusinesses } from '@/bookly/data/mock-data'

const businessNameById = Object.fromEntries(mockBusinesses.map(b => [b.id, b.name]))

const BooklyReviewsPage = async () => {
  const items = [...mockReviews].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Reviews' subheader='Latest reviews' />
          <CardContent>
            <List>
              {items.map(r => (
                <ListItem key={r.id} className='gap-4'>
                  <ListItemAvatar>
                    <Avatar alt={r.authorName} src={r.authorImage} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${r.authorName} • ${r.rating} ⭐`}
                    secondary={
                      <>
                        <Typography variant='body2' color='text.secondary'>
                          {new Date(r.date).toLocaleDateString()} • {businessNameById[r.businessId]}
                        </Typography>
                        <Typography variant='body2'>{r.comment}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BooklyReviewsPage

