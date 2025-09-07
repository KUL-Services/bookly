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
import type { Business } from '@/bookly/data/types'

const TopBusinesses = ({ items }: { items: Business[] }) => {
  return (
    <Card>
      <CardHeader title='Top Rated Businesses' subheader='Based on average rating' />
      <CardContent>
        <List>
          {items.map(b => (
            <ListItem key={b.id} className='gap-4'>
              <ListItemAvatar>
                <Avatar alt={b.name} src={b.coverImage} />
              </ListItemAvatar>
              <ListItemText
                primary={b.name}
                secondary={
                  <Typography variant='body2' color='text.secondary'>
                    {b.city} • {b.totalRatings} reviews
                  </Typography>
                }
              />
              <Typography>{b.averageRating.toFixed(1)} ⭐</Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default TopBusinesses

