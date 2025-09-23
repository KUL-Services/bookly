'use client'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItem from '@mui/material/ListItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Types
import type { Business } from '@/bookly/data/types'

import { useState } from 'react'

const TopBusinesses = ({ items }: { items: Business[] }) => {
  const [selected, setSelected] = useState<Business | null>(null)
  const params = useParams<{ lang: string }>()

  const handleOpen = (business: Business) => setSelected(business)
  const handleClose = () => setSelected(null)

  return (
    <Card>
      <CardHeader title='Top Rated Businesses' subheader='Based on average rating' />
      <CardContent>
        <List aria-label='List of top rated businesses'>
          {items.map(b => (
            <ListItemButton key={b.id} className='gap-4' onClick={() => handleOpen(b)}>
              <ListItemAvatar>
                <Avatar alt={b.name} src={b.coverImageUrl || b.logoUrl} />
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={<Typography>{b.name}</Typography>}
                secondary={
                  <Typography variant='body2' color='text.secondary'>
                    {b.city} • {b.totalRatings} reviews
                  </Typography>
                }
              />
              <Typography>{b.averageRating.toFixed(1)} ⭐</Typography>
            </ListItemButton>
          ))}
        </List>
      </CardContent>

      <Dialog open={Boolean(selected)} onClose={handleClose} aria-labelledby='branch-dialog-title'>
        <DialogTitle id='branch-dialog-title'>{selected?.name} Branches</DialogTitle>
        <DialogContent dividers>
          <List>
            {selected?.branches.map(branch => (
              <ListItem key={branch.id} className='gap-4'>
                <ListItemText primary={branch.name} secondary={`${branch.address}, ${branch.city}`} />
                <Box className='flex items-center gap-2'>
                  <Button
                    size='small'
                    component={Link}
                    href={`/${params?.lang ?? 'en'}/apps/bookly/businesses/${selected?.id}/branches/${branch.id}`}
                    onClick={handleClose}
                  >
                    View details
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default TopBusinesses
