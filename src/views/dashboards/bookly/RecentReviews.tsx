// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Types
import type { Review } from '@/bookly/data/types'

const RecentReviews = ({ items }: { items: Review[] }) => {
  return (
    <Card>
      <CardHeader title='Recent Reviews' />
      <CardContent>
        <List>
          {items.map(r => (
            <ListItem key={r.id} className='gap-4'>
              <ListItemAvatar>
                <Avatar alt={r.authorName} src={r.authorImage} />
              </ListItemAvatar>
              <ListItemText
                primary={r.authorName}
                secondary={
                  <>
                    <Typography variant='body2' color='text.secondary'>
                      {new Date(r.date).toLocaleDateString()} • {r.rating} ⭐
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
  )
}

export default RecentReviews

