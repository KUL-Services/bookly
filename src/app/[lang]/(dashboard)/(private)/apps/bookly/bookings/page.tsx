'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Snackbar from '@mui/material/Snackbar'

// Icons
import { RefreshCcw, FilterX, MoreVertical, CheckCircle, XCircle, Clock, UserX } from 'lucide-react'

// Date Picker
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, isValid, parseISO } from 'date-fns'

// API Imports
import { BookingService } from '@/lib/api/services/booking.service'
import { StaffService } from '@/lib/api/services/staff.service'
import type { Booking, Staff } from '@/lib/api/types'

// Fallback mock data removed
// import { mockBookings } from '@/bookly/data/mock-data'

const statusColor = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'error',
  COMPLETED: 'default',
  NO_SHOW: 'warning'
} as const

const BooklyBookingsPage = () => {
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter State
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [staffFilter, setStaffFilter] = useState<string>('all')

  // Pagination State
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Action Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)
  const [actionBookingId, setActionBookingId] = useState<string | null>(null)
  const [actionBookingStatus, setActionBookingStatus] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Fetch Staff for Filter
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const result = await StaffService.getStaff()
        if (result.data) {
          setStaffList(result.data)
        }
      } catch (err) {
        console.warn('Failed to load staff list for filters', err)
      }
    }
    fetchStaff()
  }, [])

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      // Build params
      const params: any = {
        page: page + 1, // API is 1-indexed
        pageSize: rowsPerPage,
        sortBy: 'startTime',
        sortOrder: 'desc'
      }

      if (startDate && isValid(startDate)) {
        params.fromDate = format(startDate, 'yyyy-MM-dd')
      }
      if (endDate && isValid(endDate)) {
        params.toDate = format(endDate, 'yyyy-MM-dd')
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (staffFilter !== 'all') {
        params.staffId = staffFilter
      }

      const result = await BookingService.getBusinessBookings(params)

      if (result.data) {
        // Handle potential non-array response (e.g. wrapper object)
        const bookingsData = Array.isArray(result.data)
          ? result.data
          : (result.data as any).data && Array.isArray((result.data as any).data)
            ? (result.data as any).data
            : []

        setBookings(bookingsData as Booking[])

        // If API doesn't return total count, estimate navigation availability
        const count = bookingsData.length
        setTotalCount(count < rowsPerPage ? page * rowsPerPage + count : (page + 10) * rowsPerPage)
      } else if (result.error) {
        throw new Error(result.error)
      }
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err)
      setError(err.message || 'Failed to load bookings from API.')
      setBookings([]) // Clear mock data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, startDate, endDate, statusFilter, staffFilter])

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const clearFilters = () => {
    setStartDate(null)
    setEndDate(null)
    setStatusFilter('all')
    setStaffFilter('all')
    setPage(0)
  }

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, bookingId: string, currentStatus: string) => {
    setActionMenuAnchor(event.currentTarget)
    setActionBookingId(bookingId)
    setActionBookingStatus(currentStatus)
  }

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null)
    setActionBookingId(null)
    setActionBookingStatus(null)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!actionBookingId) return
    handleCloseActionMenu()

    try {
      const result = await BookingService.updateBookingStatus(actionBookingId, newStatus)
      if (result.error) {
        setSnackbar({ open: true, message: `Failed: ${result.error}`, severity: 'error' })
      } else {
        setSnackbar({ open: true, message: `Booking ${newStatus.toLowerCase()} successfully`, severity: 'success' })
        fetchBookings() // Refresh list
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update booking status', severity: 'error' })
    }
  }

  const getAvailableStatusActions = (currentStatus: string) => {
    const normalized = currentStatus?.toUpperCase()
    switch (normalized) {
      case 'PENDING':
        return [
          { status: 'CONFIRMED', label: 'Confirm', icon: <CheckCircle size={16} />, color: 'success.main' },
          { status: 'CANCELLED', label: 'Cancel', icon: <XCircle size={16} />, color: 'error.main' }
        ]
      case 'CONFIRMED':
        return [
          { status: 'COMPLETED', label: 'Complete', icon: <CheckCircle size={16} />, color: 'primary.main' },
          { status: 'NO_SHOW', label: 'No Show', icon: <UserX size={16} />, color: 'warning.main' },
          { status: 'CANCELLED', label: 'Cancel', icon: <XCircle size={16} />, color: 'error.main' }
        ]
      default:
        return []
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Bookings'
            subheader='Real-time booking data'
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  startIcon={<RefreshCcw size={16} />}
                  onClick={() => fetchBookings()}
                  variant='outlined'
                  size='small'
                >
                  Refresh
                </Button>
              </Box>
            }
          />
          <CardContent>
            {/* Filters Toolbar */}
            <Grid container spacing={4} sx={{ mb: 6 }} alignItems='center'>
              <Grid item xs={12} sm={3}>
                <Box sx={{ '.react-datepicker-wrapper': { width: '100%' } }}>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={update => {
                      setStartDate(update[0])
                      setEndDate(update[1])
                      if (update[0] && !update[1]) {
                        // partial selection
                      } else {
                        // full selection or clear, reset page
                        setPage(0)
                      }
                    }}
                    placeholderText='Filter by date range'
                    customInput={<TextField size='small' fullWidth label='Date Range' />}
                    isClearable={true}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label='Status'
                    onChange={e => {
                      setStatusFilter(e.target.value)
                      setPage(0)
                    }}
                  >
                    <MenuItem value='all'>All Statuses</MenuItem>
                    <MenuItem value='CONFIRMED'>Confirmed</MenuItem>
                    <MenuItem value='PENDING'>Pending</MenuItem>
                    <MenuItem value='CANCELLED'>Cancelled</MenuItem>
                    <MenuItem value='COMPLETED'>Completed</MenuItem>
                    <MenuItem value='NO_SHOW'>No Show</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Staff Member</InputLabel>
                  <Select
                    value={staffFilter}
                    label='Staff Member'
                    onChange={e => {
                      setStaffFilter(e.target.value)
                      setPage(0)
                    }}
                  >
                    <MenuItem value='all'>All Staff</MenuItem>
                    {staffList.map(staff => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {(startDate || statusFilter !== 'all' || staffFilter !== 'all') && (
                  <Button color='secondary' startIcon={<FilterX size={16} />} onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </Grid>
            </Grid>

            {/* Error Message */}
            {error && (
              <Alert severity='warning' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Table */}
            {!loading && (
              <>
                <TableContainer>
                  <Table size='small' sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Staff</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell align='right'>Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align='right'>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                            <Typography variant='body1' color='text.secondary'>
                              No bookings found matching your filters.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((row: any) => {
                          const isApiData = 'startTime' in row
                          const serviceName = isApiData ? row.service?.name || '-' : row.serviceName
                          const customerName = isApiData
                            ? row.user
                              ? `${row.user.firstName || ''} ${row.user.lastName || ''}`
                              : row.customerName || 'Guest'
                            : row.businessName
                          const staffName = isApiData ? row.resource?.name || '-' : row.staffMemberName

                          const dateObj = isApiData ? new Date(row.startTime) : new Date(row.date)
                          const dateStr = isValid(dateObj) ? format(dateObj, 'MMM dd, yyyy') : '-'
                          const timeStr = isValid(dateObj) ? format(dateObj, 'hh:mm a') : row.time || '-'

                          const price = isApiData ? row.service?.price : row.price
                          const status = row.status

                          return (
                            <TableRow key={row.id} hover>
                              <TableCell>
                                <Typography variant='body2' fontWeight='medium'>
                                  {serviceName}
                                </Typography>
                              </TableCell>
                              <TableCell>{customerName}</TableCell>
                              <TableCell>{staffName}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant='body2'>{dateStr}</Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {timeStr}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align='right'>{price ? `EGP ${price}` : '-'}</TableCell>
                              <TableCell>
                                <Chip
                                  size='small'
                                  variant='tonal'
                                  label={status}
                                  color={(statusColor as any)[status] || 'default'}
                                />
                              </TableCell>
                              <TableCell align='right'>
                                {isApiData && (status === 'PENDING' || status === 'CONFIRMED') ? (
                                  <IconButton size='small' onClick={e => handleOpenActionMenu(e, row.id, status)}>
                                    <MoreVertical size={16} />
                                  </IconButton>
                                ) : (
                                  <Typography variant='caption' color='text.secondary'>
                                    {status === 'COMPLETED' || status === 'completed' ? 'Done' : '-'}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component='div'
                  count={totalCount}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Status Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {actionBookingStatus &&
          getAvailableStatusActions(actionBookingStatus).map(action => (
            <MenuItem key={action.status} onClick={() => handleStatusUpdate(action.status)}>
              <ListItemIcon sx={{ color: action.color }}>{action.icon}</ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default BooklyBookingsPage
