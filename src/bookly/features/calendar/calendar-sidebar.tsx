'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { format } from 'date-fns'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'

import { mockBusinesses, mockStaff } from '@/bookly/data/mock-data'
import { useCalendarStore } from './state'

import type { AppointmentStatus, BranchFilter, HighlightFilters, PaymentStatus, RoomFilter, SelectionMethod, StaffFilter } from './types'

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
  const roomFilters = useCalendarStore(state => state.roomFilters)
  const highlights = useCalendarStore(state => state.highlights)
  const previousStaffFilters = useCalendarStore(state => state.previousStaffFilters)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)
  const setBranchFilters = useCalendarStore(state => state.setBranchFilters)
  const setStaffFilters = useCalendarStore(state => state.setStaffFilters)
  const setRoomFilters = useCalendarStore(state => state.setRoomFilters)
  const setHighlights = useCalendarStore(state => state.setHighlights)
  const clearHighlights = useCalendarStore(state => state.clearHighlights)
  const clearBranchFilters = useCalendarStore(state => state.clearBranchFilters)
  const clearRoomFilters = useCalendarStore(state => state.clearRoomFilters)
  const goBackToAllStaff = useCalendarStore(state => state.goBackToAllStaff)
  const selectSingleStaff = useCalendarStore(state => state.selectSingleStaff)
  const getRoomsByBranch = useCalendarStore(state => state.getRoomsByBranch)
  const toggleSidebar = useCalendarStore(state => state.toggleSidebar)

  const [pendingBranches, setPendingBranches] = useState<BranchFilter>(branchFilters)
  const [pendingStaff, setPendingStaff] = useState<StaffFilter>(staffFilters)
  const [pendingRooms, setPendingRooms] = useState<RoomFilter>(roomFilters)
  const [pendingHighlights, setPendingHighlights] = useState<HighlightFilters>(highlights)

  // Accordion expansion state
  const [expandedAccordions, setExpandedAccordions] = useState<{ [key: string]: boolean }>({
    branches: true,
    staff: true,
    rooms: true,
    highlight: true
  })

  // Staff/Resources tab selection
  const [resourceTab, setResourceTab] = useState<'staff' | 'resources'>('staff')

  useEffect(() => {
    setPendingBranches(branchFilters)
    setPendingStaff(staffFilters)
    setPendingRooms(roomFilters)
    setPendingHighlights(highlights)
  }, [branchFilters, staffFilters, roomFilters, highlights])

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
      return mockStaff
    }
    return mockStaff.filter(staff => pendingBranches.branchIds.includes(staff.branchId))
  }, [pendingBranches])

  // Get available rooms based on selected branches
  const availableRooms = useMemo(() => {
    if (pendingBranches.allBranches || pendingBranches.branchIds.length === 0) {
      // Get rooms from all branches
      const allRooms = branches.flatMap(branch => getRoomsByBranch(branch.id))
      return allRooms
    }
    // Get rooms for all selected branches
    const allRooms = pendingBranches.branchIds.flatMap(branchId => getRoomsByBranch(branchId))
    return allRooms
  }, [pendingBranches, branches, getRoomsByBranch])


  // Branch handlers
  const handleAllBranches = () => {
    const newAllBranches = !pendingBranches.allBranches
    const newBranches = {
      allBranches: newAllBranches,
      branchIds: newAllBranches ? [] : pendingBranches.branchIds
    }
    const clearedStaff = newAllBranches ? { ...pendingStaff, staffIds: [] } : pendingStaff
    setPendingBranches(newBranches)
    setPendingStaff(clearedStaff)
    applyFilters(newBranches, clearedStaff, pendingRooms, pendingHighlights)
  }

  const handleBranchToggle = (branchId: string) => {
    const newBranchIds = pendingBranches.branchIds.includes(branchId)
      ? pendingBranches.branchIds.filter(id => id !== branchId)
      : [...pendingBranches.branchIds, branchId]

    const newBranches = {
      allBranches: false,
      branchIds: newBranchIds
    }
    const clearedStaff = { ...pendingStaff, staffIds: [] }
    setPendingBranches(newBranches)
    setPendingStaff(clearedStaff)
    applyFilters(newBranches, clearedStaff, pendingRooms, pendingHighlights)
  }

  const handleOnlyMeChange = (checked: boolean) => {
    const newStaff = { ...pendingStaff, onlyMe: checked, staffIds: checked ? [] : pendingStaff.staffIds }
    setPendingStaff(newStaff)
    applyFilters(pendingBranches, newStaff, pendingRooms, pendingHighlights)
  }

  const handleSelectAllStaff = () => {
    const newStaff = {
      ...pendingStaff,
      onlyMe: false,
      staffIds: availableStaff.map(s => s.id)
    }
    setPendingStaff(newStaff)
    applyFilters(pendingBranches, newStaff, pendingRooms, pendingHighlights)
  }

  const handleStaffToggle = (staffId: string) => {
    const newIds = pendingStaff.staffIds.includes(staffId)
      ? pendingStaff.staffIds.filter(id => id !== staffId)
      : [...pendingStaff.staffIds, staffId]
    const newStaff = { ...pendingStaff, staffIds: newIds }
    setPendingStaff(newStaff)
    applyFilters(pendingBranches, newStaff, pendingRooms, pendingHighlights)
  }

  // Room handlers
  const handleAllRooms = () => {
    const newRooms = { ...pendingRooms, allRooms: !pendingRooms.allRooms }
    setPendingRooms(newRooms)
    applyFilters(pendingBranches, pendingStaff, newRooms, pendingHighlights)
  }

  const handleSelectAllRooms = () => {
    const newRooms = {
      ...pendingRooms,
      allRooms: false,
      roomIds: availableRooms.map(r => r.id)
    }
    setPendingRooms(newRooms)
    applyFilters(pendingBranches, pendingStaff, newRooms, pendingHighlights)
  }

  const handleRoomToggle = (roomId: string) => {
    const newIds = pendingRooms.roomIds.includes(roomId)
      ? pendingRooms.roomIds.filter(id => id !== roomId)
      : [...pendingRooms.roomIds, roomId]
    const newRooms = { ...pendingRooms, allRooms: false, roomIds: newIds }
    setPendingRooms(newRooms)
    applyFilters(pendingBranches, pendingStaff, newRooms, pendingHighlights)
  }

  const handlePaymentToggle = (payment: PaymentStatus) => {
    const newPayments = pendingHighlights.payments.includes(payment)
      ? pendingHighlights.payments.filter(p => p !== payment)
      : [...pendingHighlights.payments, payment]
    const newHighlights = { ...pendingHighlights, payments: newPayments }
    setPendingHighlights(newHighlights)
    applyFilters(pendingBranches, pendingStaff, pendingRooms, newHighlights)
  }

  const handleStatusToggle = (status: AppointmentStatus) => {
    const newStatuses = pendingHighlights.statuses.includes(status)
      ? pendingHighlights.statuses.filter(s => s !== status)
      : [...pendingHighlights.statuses, status]
    const newHighlights = { ...pendingHighlights, statuses: newStatuses }
    setPendingHighlights(newHighlights)
    applyFilters(pendingBranches, pendingStaff, pendingRooms, newHighlights)
  }

  const handleSelectionToggle = (selection: SelectionMethod) => {
    const newSelection = pendingHighlights.selection.includes(selection)
      ? pendingHighlights.selection.filter(s => s !== selection)
      : [...pendingHighlights.selection, selection]
    const newHighlights = { ...pendingHighlights, selection: newSelection }
    setPendingHighlights(newHighlights)
    applyFilters(pendingBranches, pendingStaff, pendingRooms, newHighlights)
  }

  const handleDetailToggle = (detail: 'starred' | 'unstarred') => {
    const newDetails = pendingHighlights.details.includes(detail)
      ? pendingHighlights.details.filter(d => d !== detail)
      : [...pendingHighlights.details, detail]
    const newHighlights = { ...pendingHighlights, details: newDetails }
    setPendingHighlights(newHighlights)
    applyFilters(pendingBranches, pendingStaff, pendingRooms, newHighlights)
  }

  // Get staff available at current moment
  const getAvailableStaffNow = useCallback(() => {
    const now = new Date()
    return mockStaff.filter(staff => {
      // Check if staff is working right now
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()]
      const currentTime = format(now, 'HH:mm')

      // Check staff's working hours
      const schedule = staff.workingHours?.[dayOfWeek as keyof typeof staff.workingHours]
      if (!schedule || !schedule.isWorking) return false

      // Check if current time falls within any shift
      return schedule.shifts?.some((shift: any) => {
        const [startH, startM] = shift.start.split(':').map(Number)
        const [endH, endM] = shift.end.split(':').map(Number)
        const startMins = startH * 60 + startM
        const endMins = endH * 60 + endM
        const currentMins = now.getHours() * 60 + now.getMinutes()
        return currentMins >= startMins && currentMins < endMins
      })
    })
  }, [])

  const handleAvailableNowToggle = (checked: boolean) => {
    const newStaff = { ...pendingStaff, availableNow: checked }
    if (checked) {
      newStaff.staffIds = getAvailableStaffNow().map(s => s.id)
    }
    setPendingStaff(newStaff)
    applyFilters(pendingBranches, newStaff, pendingRooms, pendingHighlights)
  }

  // Room filter handlers
  const handleRoomAvailableNowToggle = (checked: boolean) => {
    const newRooms = { ...pendingRooms, availableNow: checked }
    setPendingRooms(newRooms)
    applyFilters(pendingBranches, pendingStaff, newRooms, pendingHighlights)
  }

  const handleRoomAvailableTodayToggle = (checked: boolean) => {
    const newRooms = { ...pendingRooms, availableToday: checked }
    setPendingRooms(newRooms)
    applyFilters(pendingBranches, pendingStaff, newRooms, pendingHighlights)
  }

  // Apply filters instantly without needing to click Apply button
  const applyFilters = (
    branches: BranchFilter,
    staff: StaffFilter,
    rooms: RoomFilter,
    highlights: HighlightFilters
  ) => {
    setBranchFilters(branches)
    setStaffFilters(staff)
    setRoomFilters(rooms)
    setHighlights(highlights)
  }

  const handleClear = () => {
    const clearedBranches: BranchFilter = { allBranches: true, branchIds: [] }
    const cleared: StaffFilter = {
      onlyMe: false,
      staffIds: [],
      selectedStaffId: null,
      workingStaffOnly: false,
      availableNow: false
    }
    const clearedRooms: RoomFilter = { allRooms: true, roomIds: [], availableNow: false, availableToday: false }
    const clearedHighlights: HighlightFilters = { payments: [], statuses: [], selection: [], details: [] }
    setPendingBranches(clearedBranches)
    setPendingStaff(cleared)
    setPendingRooms(clearedRooms)
    setPendingHighlights(clearedHighlights)
    setBranchFilters(clearedBranches)
    setStaffFilters(cleared)
    setRoomFilters(clearedRooms)
    setHighlights(clearedHighlights)
  }

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => ({ ...prev, [panel]: isExpanded }))
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

        {/* Branches */}
        <Accordion
          expanded={expandedAccordions.branches}
          onChange={handleAccordionChange('branches')}
          sx={{
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: 'none',
            bgcolor: 'transparent'
          }}
        >
          <AccordionSummary
            expandIcon={<i className='ri-arrow-down-s-line' style={{ fontSize: '1.25rem' }} />}
            sx={{
              minHeight: 48,
              px: 0,
              '& .MuiAccordionSummary-content': { my: 1 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-map-pin-line' style={{ fontSize: '1.1rem' }} />
                Branches
              </Typography>
              {!pendingBranches.allBranches && pendingBranches.branchIds.length > 0 && (
                <Button
                  variant='text'
                  size='small'
                  onClick={e => {
                    e.stopPropagation()
                    setPendingBranches({ allBranches: true, branchIds: [] })
                  }}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <i className='ri-close-circle-line' style={{ fontSize: '1.1rem' }} />
                </Button>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={pendingBranches.allBranches} onChange={() => handleAllBranches()} />}
                label={
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    All Branches
                  </Typography>
                }
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
                          bgcolor: theme =>
                            theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                          color: theme => (theme.palette.mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)')
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* Staff */}
          <Accordion
            expanded={expandedAccordions.staff}
            onChange={handleAccordionChange('staff')}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: 'none',
              bgcolor: 'transparent'
            }}
          >
            <AccordionSummary
              expandIcon={<i className='ri-arrow-down-s-line' style={{ fontSize: '1.25rem' }} />}
              sx={{
                minHeight: 48,
                px: 0,
                '& .MuiAccordionSummary-content': { my: 1 }
              }}
            >
              <Typography variant='subtitle2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='ri-user-line' style={{ fontSize: '1.1rem' }} />
                Staff Members
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
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
                  control={
                    <Checkbox checked={pendingStaff.onlyMe} onChange={e => handleOnlyMeChange(e.target.checked)} />
                  }
                  label={
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      Only me
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pendingStaff.availableNow || false}
                      onChange={e => handleAvailableNowToggle(e.target.checked)}
                    />
                  }
                  label={<Typography variant='body2'>Available now</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pendingStaff.workingStaffOnly}
                      onChange={e => setPendingStaff({ ...pendingStaff, workingStaffOnly: e.target.checked })}
                    />
                  }
                  label={<Typography variant='body2'>Working staff members</Typography>}
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
                          <Avatar src={staff.photo} alt={staff.name} sx={{ width: 24, height: 24 }} />
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
            </AccordionDetails>
          </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* Rooms */}
          <Accordion
            expanded={expandedAccordions.rooms}
            onChange={handleAccordionChange('rooms')}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: 'none',
              bgcolor: 'transparent'
            }}
          >
            <AccordionSummary
              expandIcon={<i className='ri-arrow-down-s-line' style={{ fontSize: '1.25rem' }} />}
              sx={{
                minHeight: 48,
                px: 0,
                '& .MuiAccordionSummary-content': { my: 1 }
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <i className='ri-door-line' style={{ fontSize: '1.1rem' }} />
                  Rooms
                </Typography>
                {!pendingRooms.allRooms && pendingRooms.roomIds.length > 0 && (
                  <Button
                    variant='text'
                    size='small'
                    onClick={e => {
                      e.stopPropagation()
                      setPendingRooms({ allRooms: true, roomIds: [] })
                    }}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <i className='ri-close-circle-line' style={{ fontSize: '1.1rem' }} />
                  </Button>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={pendingRooms.allRooms} onChange={handleAllRooms} />}
                  label={
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      All Rooms
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pendingRooms.availableNow || false}
                      onChange={e => handleRoomAvailableNowToggle(e.target.checked)}
                    />
                  }
                  label={<Typography variant='body2'>Available now</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pendingRooms.availableToday || false}
                      onChange={e => handleRoomAvailableTodayToggle(e.target.checked)}
                    />
                  }
                  label={<Typography variant='body2'>Available today</Typography>}
                />
                <Button
                  variant='text'
                  size='small'
                  onClick={handleSelectAllRooms}
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                >
                  Select All
                </Button>
                {availableRooms.map(room => {
                  const branch = branches.find(b => b.id === room.branchId)
                  return (
                    <FormControlLabel
                      key={room.id}
                      control={
                        <Checkbox
                          checked={pendingRooms.roomIds.includes(room.id)}
                          onChange={() => handleRoomToggle(room.id)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: room.color || 'var(--mui-palette-text-disabled)',
                              flexShrink: 0
                            }}
                          />
                          <Typography variant='body2'>{room.name}</Typography>
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
            </AccordionDetails>
          </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* Highlight Filters */}
        <Accordion
          expanded={expandedAccordions.highlight}
          onChange={handleAccordionChange('highlight')}
          sx={{
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: 'none',
            bgcolor: 'transparent'
          }}
        >
          <AccordionSummary
            expandIcon={<i className='ri-arrow-down-s-line' style={{ fontSize: '1.25rem' }} />}
            sx={{
              minHeight: 48,
              px: 0,
              '& .MuiAccordionSummary-content': { my: 1 }
            }}
          >
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              Highlight
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
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
                // { value: 'no_show', label: 'No-show' },
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

            {/* Staff Member Selected */}
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1, mt: 2 }}>
              Staff member selected
            </Typography>
            <FormGroup sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pendingHighlights.selection.includes('by_client')}
                    onChange={() => handleSelectionToggle('by_client')}
                  />
                }
                label={<Typography variant='body2'>By client</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pendingHighlights.selection.includes('automatically')}
                    onChange={() => handleSelectionToggle('automatically')}
                  />
                }
                label={<Typography variant='body2'>Automatically</Typography>}
              />
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
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant='outlined'
          fullWidth
          onClick={handleClear}
          startIcon={<i className='ri-delete-bin-line' />}
          sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.75rem' }}
        >
          Clear All Filters
        </Button>
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
