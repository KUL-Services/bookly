'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
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
import { BookingService } from '@/lib/api/services/booking.service'
import { ReviewsService } from '@/lib/api/services/reviews.service'
import type { Business, Service, Branch, Staff } from '@/lib/api'
import type { Booking } from '@/bookly/data/types'
import type { Review } from '@/bookly/data/types'

// Component Imports
import { PageLoader, CardSkeleton, StatsSkeleton } from '@/components/LoadingStates'
import { BrandWatermark } from '@/bookly/components/atoms/brand-watermark'
import { BrandedSectionDivider } from '@/bookly/components/atoms/branded-section-divider'

// Fallback Imports
import { mockServices, mockBookings, mockReviews } from '@/bookly/data/mock-data'

// Helper: map API booking to the dashboard Booking shape
function mapApiBookingToLocal(apiBooking: any): Booking {
  const startTime = apiBooking.startTime ? new Date(apiBooking.startTime) : new Date()
  const userName = apiBooking.user
    ? `${apiBooking.user.firstName || ''} ${apiBooking.user.lastName || ''}`.trim()
    : apiBooking.customerName || 'Guest'

  return {
    id: apiBooking.id,
    businessId: apiBooking.businessId || '',
    branchId: apiBooking.branchId || '',
    branchName: apiBooking.branch?.name || '',
    businessName: userName,
    businessImage: apiBooking.user?.profilePhoto || '',
    serviceName: apiBooking.service?.name || 'Service',
    staffMemberName: apiBooking.resource?.name || '',
    customerName: userName,
    date: startTime,
    time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: apiBooking.service?.duration || 60,
    price: apiBooking.service?.price || 0,
    status: (apiBooking.status || 'pending').toLowerCase() as Booking['status'],
    notes: apiBooking.notes
  }
}

// Helper: map API review to the dashboard Review shape
function mapApiReviewToLocal(apiReview: any): Review {
  return {
    id: apiReview.id,
    authorName: apiReview.user
      ? `${apiReview.user.firstName || ''} ${apiReview.user.lastName || ''}`.trim()
      : 'Customer',
    authorImage: apiReview.user?.profilePhoto || '',
    rating: apiReview.rating || 0,
    comment: apiReview.comment || apiReview.review || '',
    date: new Date(apiReview.createdAt),
    businessId: apiReview.businessId || ''
  }
}

interface DashboardData {
  business: Business | null
  services: Service[]
  branches: Branch[]
  staff: Staff[]
  bookings: Booking[]
  reviews: Review[]
}

const DashboardBookly = ({ lang }: { lang: string }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    business: null,
    services: [],
    branches: [],
    staff: [],
    bookings: [],
    reviews: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [businessResponse, servicesResponse, branchesResponse, staffResponse, bookingsResponse, reviewsResponse] =
        await Promise.allSettled([
          BusinessService.getApprovedBusinesses({ pageSize: 1 }),
          ServicesService.getServices(),
          BranchesService.getBranches(),
          StaffService.getStaff(),
          BookingService.getBusinessBookings({ pageSize: 50, sortBy: 'startTime', sortOrder: 'desc' }),
          ReviewsService.getReviews()
        ])

      // Extract data from settled promises
      const business =
        businessResponse.status === 'fulfilled' && businessResponse.value.data
          ? Array.isArray(businessResponse.value.data)
            ? businessResponse.value.data[0] || null
            : businessResponse.value.data
          : null

      const services =
        servicesResponse.status === 'fulfilled' && servicesResponse.value.data
          ? servicesResponse.value.data
          : mockServices

      const branches =
        branchesResponse.status === 'fulfilled' && branchesResponse.value.data ? branchesResponse.value.data : []

      const staff = staffResponse.status === 'fulfilled' && staffResponse.value.data ? staffResponse.value.data : []

      // Map API bookings to local format, fallback to mock
      let bookings: Booking[] = mockBookings
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.data && Array.isArray(bookingsResponse.value.data) && bookingsResponse.value.data.length > 0) {
        bookings = bookingsResponse.value.data.map(mapApiBookingToLocal)
      }

      // Map API reviews to local format, fallback to mock
      let reviews: Review[] = mockReviews
      if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value.data && Array.isArray(reviewsResponse.value.data) && reviewsResponse.value.data.length > 0) {
        reviews = reviewsResponse.value.data.map(mapApiReviewToLocal)
      }

      setDashboardData({ business, services, branches, staff, bookings, reviews })
      setError(null)
    } catch (err) {
      console.warn('Dashboard API fetch failed, using fallback data:', err)
      setDashboardData({
        business: null,
        services: mockServices,
        branches: [],
        staff: [],
        bookings: mockBookings,
        reviews: mockReviews
      })
      setError(null)
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
          <StatsSkeleton />
        </Grid>
        <Grid item xs={12} md={8}>
          <CardSkeleton height='400px' />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardSkeleton height='400px' />
        </Grid>
        <Grid item xs={12} md={8}>
          <CardSkeleton height='300px' />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardSkeleton height='300px' />
        </Grid>
        <Grid item xs={12}>
          <CardSkeleton height='200px' />
        </Grid>
        <Grid item xs={12}>
          <CardSkeleton height='300px' />
        </Grid>
      </Grid>
    )
  }

  // Calculate stats from fetched data (API or fallback mock)
  const now = new Date()
  const upcoming = dashboardData.bookings
    .filter(b => new Date(b.date) >= now && (b.status === 'confirmed' || b.status === 'pending'))
    .slice(0, 6)
  const completedCount = dashboardData.bookings.filter(b => b.status === 'completed').length

  const recentReviews = [...dashboardData.reviews].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6)

  return (
    <div className='relative min-h-full'>
      <Grid container spacing={6} className='relative z-10'>
        {error && (
          <Grid item xs={12}>
            <Alert severity='warning'>{error} - Showing available data.</Alert>
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

        <Grid item xs={12}>
          <BrandedSectionDivider opacity={0.15} />
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
    </div>
  )
}

export default DashboardBookly
