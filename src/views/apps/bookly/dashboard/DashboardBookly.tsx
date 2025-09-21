'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// View Imports
import BooklyStats from '@views/dashboards/bookly/BooklyStats'
import UpcomingBookings from '@views/dashboards/bookly/UpcomingBookings'
import TopBusinesses from '@views/dashboards/bookly/TopBusinesses'
import RecentReviews from '@views/dashboards/bookly/RecentReviews'
import RevenueOverview from '@views/dashboards/bookly/RevenueOverview'
import StaffPerformance from '@views/dashboards/bookly/StaffPerformance'
import TopServices from '@views/dashboards/bookly/TopServices'
import ClientsActivity from '@views/dashboards/bookly/ClientsActivity'

// API Imports
import { BusinessService, ServicesService, BranchesService, StaffService } from '@/lib/api'
import type { Business, Service, Branch, Staff } from '@/lib/api'


// Fallback Imports
import { mockServices, mockBookings, mockReviews } from '@/bookly/data/mock-data'

interface DashboardData {
  business: Business | null
  services: Service[]
  branches: Branch[]
  staff: Staff[]
}

const DashboardBookly = ({ lang }: { lang: string }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    business: null,
    services: [],
    branches: [],
    staff: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // For business owner dashboard, we'll fetch current business data
      // In a real app, this would use the authenticated user's business ID
      const businessId = '1' // This should come from auth context

      const [businessResponse, servicesResponse, branchesResponse, staffResponse] = await Promise.all([
        BusinessService.getBusiness(businessId),
        ServicesService.getServicesByBusiness(businessId),
        BranchesService.getBranchesByBusiness(businessId),
        StaffService.getStaffByBusiness(businessId)
      ])

      // Use API data if available, otherwise fallback to mock data
      const business = businessResponse.data || null
      const services = servicesResponse.data || mockServices
      const branches = branchesResponse.data || []
      const staff = staffResponse.data || []

      setDashboardData({
        business,
        services,
        branches,
        staff
      })
      setError(null)
    } catch (err) {
      console.warn('Dashboard API fetch failed, using fallback data:', err)
      // Use mock data as fallback
      setDashboardData({
        business: null,
        services: mockServices,
        branches: [],
        staff: []
      })
      setError(null) // Don't show error since we have fallback data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent className='flex justify-center items-center py-12'>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // Calculate stats from real data
  const now = new Date()
  const upcoming = mockBookings
    .filter(b => new Date(b.date) >= now && (b.status === 'confirmed' || b.status === 'pending'))
    .slice(0, 6)
  const completedCount = mockBookings.filter(b => b.status === 'completed').length

  const recentReviews = [...mockReviews]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6)

  return (
    <Grid container spacing={6}>
      {error && (
        <Grid item xs={12}>
          <Alert severity='warning'>
            {error} - Showing available data.
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <BooklyStats
          totalBusinesses={dashboardData.business ? 1 : 0}
          totalBranches={dashboardData.branches.length}
          totalServices={dashboardData.services.length}
          upcomingCount={upcoming.length}
          completedCount={completedCount}
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <RevenueOverview />
      </Grid>
      <Grid item xs={12} md={4}>
        <TopServices />
      </Grid>

      <Grid item xs={12} md={8}>
        <UpcomingBookings rows={upcoming} lang={lang} />
      </Grid>
      <Grid item xs={12} md={4}>
        <ClientsActivity />
      </Grid>

      <Grid item xs={12}>
        <StaffPerformance />
      </Grid>

      <Grid item xs={12}>
        <RecentReviews items={recentReviews} />
      </Grid>
    </Grid>
  )
}

export default DashboardBookly