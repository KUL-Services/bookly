'use client'

import { useEffect, useMemo, useState } from 'react'

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
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// API Imports
import { BusinessService } from '@/lib/api/services/business.service'
import { BranchesService } from '@/lib/api/services/branches.service'
import { ServicesService } from '@/lib/api/services/services.service'
import { StaffService } from '@/lib/api/services/staff.service'
import { BookingService } from '@/lib/api/services/booking.service'
import type { Booking, Branch, Business, Service, Staff } from '@/lib/api/types'

type PageProps = {
  params: { businessId: string; branchId: string; lang: string }
}

function extractArray<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload?.data)) return payload.data as T[]
  if (Array.isArray(payload?.items)) return payload.items as T[]
  return []
}

const BranchDetailsPage = ({ params }: PageProps) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [businessRes, branchesRes, staffRes, servicesRes, bookingsRes] = await Promise.all([
          BusinessService.getBusiness(params.businessId),
          BranchesService.getBranches(),
          StaffService.getStaff(),
          ServicesService.getServices(),
          BookingService.getBusinessBookings({
            branchId: params.branchId,
            pageSize: 200,
            sortBy: 'startTime',
            sortOrder: 'asc'
          })
        ])

        if (businessRes.error) {
          throw new Error(businessRes.error)
        }
        if (branchesRes.error) {
          throw new Error(branchesRes.error)
        }
        if (staffRes.error) {
          throw new Error(staffRes.error)
        }
        if (servicesRes.error) {
          throw new Error(servicesRes.error)
        }
        if (bookingsRes.error) {
          throw new Error(bookingsRes.error)
        }

        const allBranches = extractArray<Branch>(branchesRes.data)
        const allStaff = extractArray<Staff>(staffRes.data)
        const allServices = extractArray<Service>(servicesRes.data)
        const allBookings = extractArray<Booking>(bookingsRes.data)

        const targetBranch =
          allBranches.find(br => br.id === params.branchId && br.businessId === params.businessId) ||
          allBranches.find(br => br.id === params.branchId) ||
          null

        if (!targetBranch) {
          setError('Branch not found')
          setBranch(null)
          setBusiness(null)
          setStaff([])
          setServices([])
          setBookings([])
          return
        }

        const branchStaff = allStaff.filter(member => member.branchId === targetBranch.id)
        const branchServices = allServices.filter(service => {
          const explicitBranchMatch = service.branches?.some(br => br.id === targetBranch.id)
          const sameBusinessFallback = service.businessId === params.businessId
          return !!explicitBranchMatch || sameBusinessFallback
        })

        setBusiness((businessRes.data as Business) || null)
        setBranch(targetBranch)
        setStaff(branchStaff)
        setServices(branchServices)
        setBookings(allBookings)
      } catch (fetchErr: any) {
        setError(fetchErr?.message || 'Failed to load branch details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.branchId, params.businessId])

  const now = new Date()
  const upcoming = useMemo(() => {
    return bookings
      .filter(booking => {
        const start = new Date(booking.startTime)
        return start >= now && booking.status !== 'CANCELLED'
      })
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
      .slice(0, 5)
  }, [bookings, now])

  const completed = useMemo(() => {
    return bookings.filter(
      booking => booking.status === 'COMPLETED' || booking.appointmentStatus === 'attended'
    )
  }, [bookings])

  const revenue = useMemo(() => {
    return completed.reduce((sum, booking) => sum + (booking.service?.price || 0), 0)
  }, [completed])

  if (loading) {
    return (
      <Box className='flex items-center justify-center min-h-[240px]'>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !branch) {
    return <Alert severity='error'>{error || 'Branch not found'}</Alert>
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={branch.name} subheader={branch.address || 'No branch address'} />
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              Business: {business?.name || params.businessId}
            </Typography>
            <div className='mt-4 flex flex-wrap gap-2'>
              <Chip label={`Upcoming: ${upcoming.length}`} color='info' variant='tonal' />
              <Chip label={`Completed: ${completed.length}`} color='success' variant='tonal' />
              <Chip label={`Revenue: EGP ${revenue.toFixed(2)}`} color='primary' variant='tonal' />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Staff at this branch' />
          <CardContent>
            {staff.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                No staff assigned
              </Typography>
            ) : (
              <List>
                {staff.map(member => (
                  <ListItem key={member.id}>
                    <ListItemText primary={member.name} secondary={member.mobile || 'No phone'} />
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
              <Typography variant='body2' color='text.secondary'>
                No services configured
              </Typography>
            ) : (
              <List>
                {services.map(service => (
                  <ListItem key={service.id}>
                    <ListItemText
                      primary={`${service.name} — EGP ${service.price}`}
                      secondary={`${service.duration} min`}
                    />
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
              <Typography variant='body2' color='text.secondary'>
                No upcoming bookings
              </Typography>
            ) : (
              <List>
                {upcoming.map(booking => (
                  <ListItem key={booking.id}>
                    <ListItemText
                      primary={`${booking.service?.name || 'Service'} with ${booking.staffName || booking.resource?.name || 'Staff'} — ${new Date(booking.startTime).toLocaleDateString()} at ${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      secondary={`Duration: ${booking.service?.duration || 0} min • Price: EGP ${booking.service?.price || 0}`}
                    />
                    <Chip
                      size='small'
                      label={booking.appointmentStatus || booking.status}
                      variant='tonal'
                      color={booking.status === 'CONFIRMED' ? 'info' : booking.status === 'PENDING' ? 'warning' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Location' subheader='Open in Maps' />
          <CardContent>
            <Typography variant='body2' color='text.secondary' className='mb-2'>
              {branch.address || 'No address available'}
            </Typography>
            {branch.address && (
              <a
                className='text-primary'
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`}
                target='_blank'
                rel='noreferrer'
              >
                View on Google Maps
              </a>
            )}
            {(branch.latitude !== undefined || branch.longitude !== undefined) && (
              <Typography variant='body2' color='text.secondary' className='mt-2'>
                Lat: {branch.latitude ?? 'N/A'}, Lng: {branch.longitude ?? 'N/A'}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BranchDetailsPage
