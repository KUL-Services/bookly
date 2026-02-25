'use client'

import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

// View Imports
import BooklyStats from '@views/dashboards/bookly/BooklyStats'
import UpcomingBookings from '@views/dashboards/bookly/UpcomingBookings'
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
import { useAuthStore } from '@/stores/auth.store'

// Component Imports
import { CardSkeleton, StatsSkeleton } from '@/components/LoadingStates'
import { BrandedSectionDivider } from '@/bookly/components/atoms/branded-section-divider'

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

function extractArray<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload?.data)) return payload.data as T[]
  if (Array.isArray(payload?.items)) return payload.items as T[]
  return []
}

function extractObject<T>(payload: any): T | null {
  if (!payload) return null
  if (Array.isArray(payload)) return (payload[0] as T) || null
  if (payload?.data && !Array.isArray(payload.data)) return payload.data as T
  return payload as T
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
      const businessId = useAuthStore.getState().materializeUser?.business?.id

      const [businessResponse, branchesResponse, staffResponse, bookingsResponse, reviewsResponse] = await Promise.allSettled([
        businessId ? BusinessService.getBusiness(businessId) : BusinessService.getApprovedBusinesses({ pageSize: 1 }),
        BranchesService.getBranches(),
        StaffService.getStaff(),
        BookingService.getBusinessBookings({ pageSize: 50, sortBy: 'startTime', sortOrder: 'desc' }),
        ReviewsService.getReviews()
      ])

      // Extract data from settled promises
      const business =
        businessResponse.status === 'fulfilled' && businessResponse.value.data
          ? extractObject<Business>(businessResponse.value.data)
          : null

      let services: Service[] = Array.isArray(business?.services) ? business.services : []
      if (services.length === 0) {
        try {
          const servicesResponse = await ServicesService.getServices()
          services = extractArray<Service>(servicesResponse.data)
          if (businessId) {
            services = services.filter(service => service.businessId === businessId)
          }
        } catch (serviceErr) {
          console.warn('Dashboard services fallback fetch failed:', serviceErr)
          services = []
        }
      }

      const branches =
        branchesResponse.status === 'fulfilled' ? extractArray<Branch>(branchesResponse.value.data) : []
      const staff = staffResponse.status === 'fulfilled' ? extractArray<Staff>(staffResponse.value.data) : []
      const bookingsRaw = bookingsResponse.status === 'fulfilled' ? extractArray<any>(bookingsResponse.value.data) : []
      const bookings: Booking[] = bookingsRaw.map(mapApiBookingToLocal)
      const reviewsRaw = reviewsResponse.status === 'fulfilled' ? extractArray<any>(reviewsResponse.value.data) : []
      const reviews: Review[] = reviewsRaw.map(mapApiReviewToLocal)

      setDashboardData({ business, services, branches, staff, bookings, reviews })
      setError(null)
    } catch (err) {
      console.warn('Dashboard API fetch failed:', err)
      setDashboardData(prev => ({ ...prev, services: [], branches: [], staff: [], bookings: [], reviews: [] }))
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Calculate dashboard stats from fetched data
  const now = new Date()
  const upcoming = dashboardData.bookings
    .filter(b => new Date(b.date) >= now && (b.status === 'confirmed' || b.status === 'pending'))
    .slice(0, 6)
  const completedCount = dashboardData.bookings.filter(b => b.status === 'completed' || b.status === 'attended').length

  const recentReviews = [...dashboardData.reviews].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6)
  const staffPerformanceRows = useMemo(() => {
    const branchNameById = new Map<string, string>(
      dashboardData.branches.map((branch: any) => [branch.id, branch.name || branch.id])
    )
    const staffMetaByName = new Map<
      string,
      { id: string; title: string; branchId: string }
    >()

    dashboardData.staff.forEach((staff: any) => {
      const name = staff?.name || `${staff?.firstName || ''} ${staff?.lastName || ''}`.trim() || 'Staff'
      staffMetaByName.set(name, {
        id: staff?.id || name,
        title: staff?.title || staff?.role || '',
        branchId: staff?.branchId || ''
      })
    })

    const rowsByStaff = new Map<
      string,
      { id: string; name: string; title: string; business: string; branch: string; completed: number; revenue: number }
    >()

    dashboardData.bookings.forEach(booking => {
      const staffName = booking.staffMemberName || 'Unassigned'
      const meta = staffMetaByName.get(staffName)
      const existing = rowsByStaff.get(staffName) || {
        id: meta?.id || staffName,
        name: staffName,
        title: meta?.title || '',
        business: dashboardData.business?.name || '—',
        branch: meta?.branchId ? branchNameById.get(meta.branchId) || meta.branchId : '—',
        completed: 0,
        revenue: 0
      }

      if (booking.status === 'completed' || booking.status === 'attended') {
        existing.completed += 1
        existing.revenue += booking.price || 0
      }

      rowsByStaff.set(staffName, existing)
    })

    return Array.from(rowsByStaff.values()).sort((a, b) => b.revenue - a.revenue)
  }, [dashboardData.bookings, dashboardData.staff, dashboardData.branches, dashboardData.business?.name])

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
          <RevenueOverview bookings={dashboardData.bookings} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopServices bookings={dashboardData.bookings} />
        </Grid>

        <Grid item xs={12} md={8}>
          <UpcomingBookings rows={upcoming} lang={lang} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ClientsActivity bookings={dashboardData.bookings} />
        </Grid>

        <Grid item xs={12}>
          <StaffPerformance rows={staffPerformanceRows} />
        </Grid>

        <Grid item xs={12}>
          <RecentReviews items={recentReviews} />
        </Grid>
      </Grid>
    </div>
  )
}

export default DashboardBookly
