'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Drawer,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  IconButton,
  Chip,
  Avatar
} from '@mui/material'
import { Calendar } from '@/bookly/components/ui/calendar'
import { useCalendarStore } from './state'
import { addWeeks } from './utils'
import { mockStaff, mockBusinesses } from '@/bookly/data/mock-data'
import type { BranchFilter, StaffFilter, HighlightFilters, PaymentStatus, AppointmentStatus, SelectionMethod } from './types'

interface CalendarSidebarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  isMobile: boolean
}

export default function CalendarSidebar({ currentDate, onDateChange, isMobile }: CalendarSidebarProps) {
  const isSidebarOpen = useCalendarStore(state => state.isSidebarOpen)
  const view = useCalendarStore(state => state.view)
  const setView = useCalendarStore(state => state.setView)
  const branchFilters = useCalendarStore(state => state.branchFilters)
  const staffFilters = useCalendarStore(state => state.staffFilters)
  const highlights = useCalendarStore(state => state.highlights)
  const previousStaffFilters = useCalendarStore(state => state.previousStaffFilters)
  const setBranchFilters = useCalendarStore(state => state.setBranchFilters)
  const setStaffFilters = useCalendarStore(state => state.setStaffFilters)
  const setHighlights = useCalendarStore(state => state.setHighlights)
  const clearHighlights = useCalendarStore(state => state.clearHighlights)
  const clearBranchFilters = useCalendarStore(state => state.clearBranchFilters)
  const goBackToAllStaff = useCalendarStore(state => state.goBackToAllStaff)
  const selectSingleStaff = useCalendarStore(state => state.selectSingleStaff)
  const toggleSidebar = useCalendarStore(state => state.toggleSidebar)

  const [pendingBranches, setPendingBranches] = useState<BranchFilter>(branchFilters)
  const [pendingStaff, setPendingStaff] = useState<StaffFilter>(staffFilters)
  const [pendingHighlights, setPendingHighlights] = useState<HighlightFilters>(highlights)

  useEffect(() => {
    setPendingBranches(branchFilters)
    setPendingStaff(staffFilters)
    setPendingHighlights(highlights)
  }, [branchFilters, staffFilters, highlights])

  // Get branches from mock data with staff counts
  const branches = useMemo(() => {
    const businessBranches = mockBusinesses[0]?.branches || []
    return businessBranches.map(branch => ({
      ...branch,
      staffCount: mockStaff.filter(s => s.branchId === branch.id).length
    }))
  }, [])

  // Filter staff by selected branches
  const availableStaff = useMemo(() => {
    if (pendingBranches.allBranches || pendingBranches.branchIds.length === 0) {
      return mockStaff.slice(0, 6)
    }
    return mockStaff.filter(staff =>
      pendingBranches.branchIds.includes(staff.branchId)
    ).slice(0, 10) // Show more staff when filtering by branch
  }, [pendingBranches])

  const handleJumpWeek = (weeks: number) => {
    const newDate = addWeeks(currentDate, weeks)
    onDateChange(newDate)
  }

  // Branch handlers
  const handleAllBranches = () => {
    const newAllBranches = !pendingBranches.allBranches
    setPendingBranches({
      allBranches: newAllBranches,
      branchIds: newAllBranches ? [] : pendingBranches.branchIds
    })
    // Reset staff selection when changing branches
    if (newAllBranches) {
      setPendingStaff({ ...pendingStaff, staffIds: [] })
    }
  }

  const handleBranchToggle = (branchId: string) => {
    const newBranchIds = pendingBranches.branchIds.includes(branchId)
      ? pendingBranches.branchIds.filter(id => id !== branchId)
      : [...pendingBranches.branchIds, branchId]

    setPendingBranches({
      allBranches: false, // Always uncheck "All Branches" when selecting individual branches
      branchIds: newBranchIds
    })

    // Reset staff selection when changing branches
    setPendingStaff({ ...pendingStaff, staffIds: [] })
  }

  const handleOnlyMeChange = (checked: boolean) => {
    setPendingStaff({ ...pendingStaff, onlyMe: checked, staffIds: checked ? [] : pendingStaff.staffIds })
  }

  const handleSelectAllStaff = () => {
    setPendingStaff({
      ...pendingStaff,
      onlyMe: false,
      staffIds: availableStaff.map(s => s.id)
    })
  }

  const handleStaffToggle = (staffId: string) => {
    const newIds = pendingStaff.staffIds.includes(staffId)
      ? pendingStaff.staffIds.filter(id => id !== staffId)
      : [...pendingStaff.staffIds, staffId]
    setPendingStaff({ ...pendingStaff, staffIds: newIds })
  }

  const handlePaymentToggle = (payment: PaymentStatus) => {
    const newPayments = pendingHighlights.payments.includes(payment)
      ? pendingHighlights.payments.filter(p => p !== payment)
      : [...pendingHighlights.payments, payment]
    setPendingHighlights({ ...pendingHighlights, payments: newPayments })
  }

  const handleStatusToggle = (status: AppointmentStatus) => {
    const newStatuses = pendingHighlights.statuses.includes(status)
      ? pendingHighlights.statuses.filter(s => s !== status)
      : [...pendingHighlights.statuses, status]
    setPendingHighlights({ ...pendingHighlights, statuses: newStatuses })
  }

  const handleSelectionToggle = (selection: SelectionMethod) => {
    const newSelection = pendingHighlights.selection.includes(selection)
      ? pendingHighlights.selection.filter(s => s !== selection)
      : [...pendingHighlights.selection, selection]
    setPendingHighlights({ ...pendingHighlights, selection: newSelection })
  }

  const handleDetailToggle = (detail: 'starred' | 'unstarred') => {
    const newDetails = pendingHighlights.details.includes(detail)
      ? pendingHighlights.details.filter(d => d !== detail)
      : [...pendingHighlights.details, detail]
    setPendingHighlights({ ...pendingHighlights, details: newDetails })
  }

  const handleApply = () => {
    setBranchFilters(pendingBranches)
    setStaffFilters(pendingStaff)
    setHighlights(pendingHighlights)
    if (isMobile) {
      toggleSidebar()
    }
  }

  const handleClear = () => {
    const clearedBranches: BranchFilter = { allBranches: true, branchIds: [] }
    const cleared: StaffFilter = { onlyMe: false, staffIds: [], selectedStaffId: null }
    const clearedHighlights: HighlightFilters = { payments: [], statuses: [], selection: [], details: [] }
    setPendingBranches(clearedBranches)
    setPendingStaff(cleared)
    setPendingHighlights(clearedHighlights)
    setBranchFilters(clearedBranches)
    setStaffFilters(cleared)
    setHighlights(clearedHighlights)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    // Switch to day view when clicking on a date
    if (view !== 'timeGridDay') {
      setView('timeGridDay')
    }

    onDateChange(date)
  }

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant='h6'>Filters</Typography>
          <IconButton onClick={toggleSidebar} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>
      )}

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Mini Calendar */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
            Calendar
          </Typography>
          <Box
            sx={{
              '& .rdp': {
                '--rdp-cell-size': '40px',
                '--rdp-accent-color': theme => theme.palette.primary.main,
                margin: 0
              },
              '& .rdp-months': {
                width: '100%'
              },
              '& .rdp-month': {
                width: '100%'
              },
              '& .rdp-caption': {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.5rem 0',
                marginBottom: '0.5rem'
              },
              '& .rdp-caption_label': {
                fontSize: '1rem',
                fontWeight: 600,
                color: theme => theme.palette.text.primary,
                padding: '0 1rem'
              },
              '& .rdp-nav': {
                display: 'flex',
                gap: '0.5rem'
              },
              '& .rdp-nav_button': {
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: 'none',
                color: theme => theme.palette.text.primary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                  color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)')
                }
              },
              '& .rdp-head_cell': {
                fontWeight: 600,
                fontSize: '0.75rem',
                color: theme => theme.palette.text.secondary,
                padding: '0.5rem 0',
                textTransform: 'uppercase'
              },
              '& .rdp-cell': {
                padding: '2px'
              },
              '& .rdp-day': {
                width: '40px',
                height: '40px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                color: theme => theme.palette.text.primary,
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover:not(.rdp-day_selected):not(.rdp-day_disabled)': {
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                  borderColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.2)',
                  color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)')
                }
              },
              '& .rdp-day_today:not(.rdp-day_selected)': {
                fontWeight: 700,
                color: theme => (theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'),
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                border: '1px solid',
                borderColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.2)'
              },
              '& .rdp-day_selected': {
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgb(20, 184, 166) !important' : 'rgb(20, 184, 166) !important',
                color: theme => (theme.palette.mode === 'dark' ? '#0f172a !important' : '#ffffff !important'),
                fontWeight: 700,
                border: 'none !important',
                '&:hover': {
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgb(13, 148, 136) !important' : 'rgb(13, 148, 136) !important'
                }
              },
              '& .rdp-day_outside': {
                color: theme => theme.palette.text.disabled,
                opacity: 0.3
              }
            }}
          >
            <Calendar mode='single' selected={currentDate} onSelect={handleDateSelect} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Jump By Week */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
            Jump By Week
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1 }}>
            {[1, 2, 3, 4, 5, 6].map(week => (
              <Button key={`plus-${week}`} variant='outlined' size='small' onClick={() => handleJumpWeek(week)}>
                +{week}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {[-1, -2, -3, -4, -5, -6].map(week => (
              <Button key={`minus-${week}`} variant='outlined' size='small' onClick={() => handleJumpWeek(week)}>
                {week}
              </Button>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Branches */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <i className='ri-map-pin-line' style={{ fontSize: '1.1rem' }} />
              Branches
            </Typography>
            {!pendingBranches.allBranches && pendingBranches.branchIds.length > 0 && (
              <Button
                variant='text'
                size='small'
                onClick={() => setPendingBranches({ allBranches: true, branchIds: [] })}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <i className='ri-close-circle-line' style={{ fontSize: '1.1rem' }} />
              </Button>
            )}
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pendingBranches.allBranches}
                  onChange={() => handleAllBranches()}
                />
              }
              label={<Typography variant='body2' sx={{ fontWeight: 500 }}>All Branches</Typography>}
            />
            {branches.map(branch => (
              <FormControlLabel
                key={branch.id}
                control={
                  <Checkbox
                    checked={pendingBranches.branchIds.includes(branch.id)}
                    onChange={() => handleBranchToggle(branch.id)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant='body2'>{branch.name}</Typography>
                    <Chip
                      label={`${branch.staffCount} staff`}
                      size='small'
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                        color: theme => theme.palette.mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)'
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Staff and Resources */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <i className='ri-user-line' style={{ fontSize: '1.1rem' }} />
            Staff Members
          </Typography>

          {/* Back to All Staff button (shown in single-staff view) */}
          {staffFilters.selectedStaffId && previousStaffFilters && (
            <Button
              variant='outlined'
              size='small'
              fullWidth
              onClick={goBackToAllStaff}
              startIcon={<i className='ri-arrow-left-line' />}
              sx={{ mb: 2 }}
            >
              Back to All Staff
            </Button>
          )}

          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={pendingStaff.onlyMe} onChange={e => handleOnlyMeChange(e.target.checked)} />}
              label={<Typography variant='body2' sx={{ fontWeight: 500 }}>Only me</Typography>}
            />
            <Button
              variant='text'
              size='small'
              onClick={handleSelectAllStaff}
              disabled={pendingStaff.onlyMe}
              sx={{ justifyContent: 'flex-start', mb: 1 }}
            >
              Select All
            </Button>
            {availableStaff.map(staff => {
              const branch = branches.find(b => b.id === staff.branchId)
              return (
                <FormControlLabel
                  key={staff.id}
                  control={
                    <Checkbox
                      checked={pendingStaff.staffIds.includes(staff.id)}
                      onChange={() => handleStaffToggle(staff.id)}
                      disabled={pendingStaff.onlyMe}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                      <Avatar
                        src={staff.photo}
                        alt={staff.name}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant='body2'>{staff.name}</Typography>
                      {branch && (
                        <Chip
                          icon={<i className='ri-map-pin-line' style={{ fontSize: '0.75rem' }} />}
                          label={branch.name}
                          size='small'
                          variant='outlined'
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            ml: 'auto',
                            '& .MuiChip-icon': { fontSize: '0.75rem', ml: 0.5 }
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              )
            })}
          </FormGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Highlight Filters */}
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
            Highlight
          </Typography>

          {/* Payments */}
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
            Payments
          </Typography>
          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pendingHighlights.payments.includes('paid')}
                  onChange={() => handlePaymentToggle('paid')}
                />
              }
              label={<Typography variant='body2'>Paid</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={pendingHighlights.payments.includes('unpaid')}
                  onChange={() => handlePaymentToggle('unpaid')}
                />
              }
              label={<Typography variant='body2'>Unpaid</Typography>}
            />
          </FormGroup>

          {/* Appointment Status */}
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
            Appointment Status
          </Typography>
          <FormGroup sx={{ mb: 2 }}>
            {[
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'need_confirm', label: 'Need confirm' },
              { value: 'no_show', label: 'No-show' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ].map(status => (
              <FormControlLabel
                key={status.value}
                control={
                  <Checkbox
                    checked={pendingHighlights.statuses.includes(status.value as AppointmentStatus)}
                    onChange={() => handleStatusToggle(status.value as AppointmentStatus)}
                  />
                }
                label={<Typography variant='body2'>{status.label}</Typography>}
              />
            ))}
          </FormGroup>

          {/* Details */}
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
            Details
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pendingHighlights.details.includes('starred')}
                  onChange={() => handleDetailToggle('starred')}
                />
              }
              label={<Typography variant='body2'>Starred</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={pendingHighlights.details.includes('unstarred')}
                  onChange={() => handleDetailToggle('unstarred')}
                />
              }
              label={<Typography variant='body2'>Unstarred</Typography>}
            />
          </FormGroup>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='outlined' fullWidth onClick={handleClear}>
            Clear
          </Button>
          <Button variant='contained' fullWidth onClick={handleApply}>
            Apply
          </Button>
        </Box>
      </Box>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer anchor='left' open={isSidebarOpen} onClose={toggleSidebar}>
        <Box sx={{ width: 320 }}>{SidebarContent}</Box>
      </Drawer>
    )
  }

  return (
    <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>{SidebarContent}</Box>
  )
}
