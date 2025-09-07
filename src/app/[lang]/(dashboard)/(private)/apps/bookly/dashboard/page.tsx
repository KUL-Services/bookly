// MUI Imports
import Grid from '@mui/material/Grid'

// View Imports
import BooklyStats from '@views/dashboards/bookly/BooklyStats'
import UpcomingBookings from '@views/dashboards/bookly/UpcomingBookings'
import TopBusinesses from '@views/dashboards/bookly/TopBusinesses'
import RecentReviews from '@views/dashboards/bookly/RecentReviews'

// Data Imports
import { mockBusinesses, mockServices, mockBookings, mockReviews } from '@/bookly/data/mock-data'

const DashboardBookly = async () => {
  // Simple aggregations on mock data
  const now = new Date()
  const upcoming = mockBookings
    .filter(b => new Date(b.date) >= now && (b.status === 'confirmed' || b.status === 'pending'))
    .slice(0, 6)
  const completedCount = mockBookings.filter(b => b.status === 'completed').length

  const topBusinesses = [...mockBusinesses].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5)
  const recentReviews = [...mockReviews].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <BooklyStats
          totalBusinesses={mockBusinesses.length}
          totalServices={mockServices.length}
          upcomingCount={upcoming.length}
          completedCount={completedCount}
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <UpcomingBookings rows={upcoming} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TopBusinesses items={topBusinesses} />
      </Grid>

      <Grid item xs={12}>
        <RecentReviews items={recentReviews} />
      </Grid>
    </Grid>
  )
}

export default DashboardBookly

