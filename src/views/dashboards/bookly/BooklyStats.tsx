// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import CardStatWithImage from '@components/card-statistics/Character'

type Props = {
  totalBusinesses: number
  totalBranches: number
  totalServices: number
  upcomingCount: number
  completedCount: number
}

const BooklyStats = ({ totalBusinesses, totalBranches, totalServices, upcomingCount, completedCount }: Props) => {
  const year = new Date().getFullYear()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatWithImage
          title='Businesses'
          stats={`${totalBusinesses}`}
          trendNumber=''
          chipText={`Year ${year}`}
          chipColor='primary'
          src='/images/illustrations/characters/10.png'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatWithImage
          title='Branches'
          stats={`${totalBranches}`}
          trendNumber=''
          chipText='Locations'
          chipColor='secondary'
          src='/images/illustrations/characters/14.png'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatWithImage
          title='Services'
          stats={`${totalServices}`}
          trendNumber=''
          chipText='Available'
          chipColor='success'
          src='/images/illustrations/characters/11.png'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatWithImage
          title='Upcoming Bookings'
          stats={`${upcomingCount}`}
          trendNumber=''
          chipText='Next 30 days'
          chipColor='info'
          src='/images/illustrations/characters/12.png'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardStatWithImage
          title='Completed Bookings'
          stats={`${completedCount}`}
          trendNumber=''
          chipText='Past 90 days'
          chipColor='warning'
          src='/images/illustrations/characters/13.png'
        />
      </Grid>
    </Grid>
  )
}

export default BooklyStats
