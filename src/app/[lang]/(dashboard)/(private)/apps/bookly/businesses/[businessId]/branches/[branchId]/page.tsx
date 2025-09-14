// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'

// Data Imports
import { mockBusinesses, mockBookings, mockServices, mockStaff } from '@/bookly/data/mock-data'

type PageProps = {
  params: { businessId: string; branchId: string; lang: string }
}

const BranchDetailsPage = ({ params }: PageProps) => {
  const business = mockBusinesses.find(b => b.id === params.businessId)
  const branch = business?.branches.find(br => br.id === params.branchId)

  if (!business || !branch) {
    return (
      <Typography variant='h6' color='error'>
        Branch not found
      </Typography>
    )
  }

  const staff = mockStaff.filter(s => s.businessId === business.id && s.branchId === branch.id)
  const services = mockServices.filter(s => s.businessId === business.id)
  const upcoming = mockBookings
    .filter(b => b.branchId === branch.id && new Date(b.date) >= new Date())
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 5)
  const completed = mockBookings.filter(b => b.branchId === branch.id && b.status === 'completed')
  const revenue = completed.reduce((sum, b) => sum + b.price, 0)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={branch.name} subheader={`${branch.address}, ${branch.city}`} />
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              Business: {business.name}
            </Typography>
            <div className='mt-4 flex flex-wrap gap-2'>
              <Chip label={`Upcoming: ${upcoming.length}`} color='info' variant='tonal' />
              <Chip label={`Completed: ${completed.length}`} color='success' variant='tonal' />
              <Chip label={`Revenue: $${revenue.toFixed(2)}`} color='primary' variant='tonal' />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Staff at this branch' />
          <CardContent>
            {staff.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>No staff assigned</Typography>
            ) : (
              <List>
                {staff.map(s => (
                  <ListItem key={s.id}>
                    <ListItemText primary={s.name} secondary={s.title} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Services offered' />
          <CardContent>
            {services.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>No services configured</Typography>
            ) : (
              <List>
                {services.map(s => (
                  <ListItem key={s.id}>
                    <ListItemText primary={`${s.name} — $${s.price}`} secondary={`${s.duration} min • ${s.category}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title='Upcoming bookings' subheader='Next few appointments at this branch' />
          <CardContent>
            {upcoming.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>No upcoming bookings</Typography>
            ) : (
              <List>
                {upcoming.map(b => (
                  <ListItem key={b.id}>
                    <ListItemText
                      primary={`${b.serviceName} with ${b.staffMemberName} — ${new Date(b.date).toLocaleDateString()} at ${b.time}`}
                      secondary={`Duration: ${b.duration} min • Price: $${b.price}`}
                    />
                    <Chip size='small' label={b.status} variant='tonal' color={b.status === 'confirmed' ? 'info' : b.status === 'pending' ? 'warning' : 'default'} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Opening hours' />
          <CardContent>
            <List>
              {Object.entries(business.openingHours).map(([day, hours]) => (
                <ListItem key={day} className='py-1'>
                  <ListItemText primary={day} secondary={hours} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Location' subheader='Open in Maps' />
          <CardContent>
            <Typography variant='body2' color='text.secondary' className='mb-2'>
              Lat: {branch.location.latitude}, Lng: {branch.location.longitude}
            </Typography>
            <a
              className='text-primary'
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.address}, ${branch.city}`)}`}
              target='_blank'
              rel='noreferrer'
            >
              View on Google Maps
            </a>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BranchDetailsPage

