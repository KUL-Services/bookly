'use client'

import { useMemo } from 'react'
import { Box, Typography, Avatar, Chip, IconButton, Tooltip, Paper } from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { DayOfWeek } from '../calendar/types'

// Helper function to get 2 initials from a name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

interface ShiftsTimelineProps {
  viewMode: 'day' | 'week'
  selectedStaffIds: string[]
  selectedDate: Date
  branchId?: string  // The selected branch ID
  onEditBusinessHours: () => void
  onEditStaffShift: () => void
}

const DAY_NAMES: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function timeToPosition(time: string, startHour: number, hourRange: number): number {
  const [hours, minutes] = time.split(':').map(Number)
  const timeInHours = hours + minutes / 60
  return ((timeInHours - startHour) / hourRange) * 100
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const minutes = endHour * 60 + endMin - (startHour * 60 + startMin)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h${mins > 0 ? `${mins}m` : ''}`
}

export function ShiftsTimeline({
  viewMode,
  selectedStaffIds,
  selectedDate,
  branchId,
  onEditBusinessHours,
  onEditStaffShift
}: ShiftsTimelineProps) {
  const { getBusinessHours, getStaffWorkingHours, getTimeReservationsForStaff, getTimeOffForStaff } =
    useStaffManagementStore()

  const filteredStaff = mockStaff.filter(s => selectedStaffIds.includes(s.id))

  // Get current day
  const currentDay = DAY_NAMES[selectedDate.getDay()]

  // Days to show based on view mode
  const daysToShow = viewMode === 'day' ? [currentDay] : DAY_NAMES

  // Calculate dynamic hours based on branch business hours
  const { hours: HOURS, startHour, hourRange } = useMemo(() => {
    if (!branchId || branchId === 'all') {
      // Default to full 24 hours if no specific branch selected
      return { hours: Array.from({ length: 24 }, (_, i) => i), startHour: 0, hourRange: 24 }
    }

    // Find the earliest start and latest end across all days
    let earliestStart = 24
    let latestEnd = 0

    daysToShow.forEach(day => {
      const businessHours = getBusinessHours(branchId, day)
      if (businessHours.isOpen && businessHours.shifts.length > 0) {
        businessHours.shifts.forEach(shift => {
          const [startH] = shift.start.split(':').map(Number)
          const [endH] = shift.end.split(':').map(Number)
          earliestStart = Math.min(earliestStart, startH)
          latestEnd = Math.max(latestEnd, endH)
        })
      }
    })

    // If no business hours found, default to 9 AM - 6 PM
    if (earliestStart === 24 || latestEnd === 0) {
      earliestStart = 9
      latestEnd = 18
    }

    // Add padding (1 hour before and after)
    const paddedStart = Math.max(0, earliestStart - 1)
    const paddedEnd = Math.min(24, latestEnd + 1)
    const range = paddedEnd - paddedStart

    return {
      hours: Array.from({ length: range }, (_, i) => paddedStart + i),
      startHour: paddedStart,
      hourRange: range
    }
  }, [branchId, daysToShow, getBusinessHours])

  // Calculate totals for each staff member
  const staffTotals = useMemo(() => {
    const totals: Record<string, { daily: number; weekly: number; monthly: number }> = {}

    filteredStaff.forEach(staff => {
      let dailyMinutes = 0
      let weeklyMinutes = 0

      // Calculate daily
      const dayHours = getStaffWorkingHours(staff.id, currentDay)
      if (dayHours.isWorking) {
        dayHours.shifts.forEach(shift => {
          const [startH, startM] = shift.start.split(':').map(Number)
          const [endH, endM] = shift.end.split(':').map(Number)
          dailyMinutes += endH * 60 + endM - (startH * 60 + startM)

          // Subtract breaks
          if (shift.breaks) {
            shift.breaks.forEach(br => {
              const [bStartH, bStartM] = br.start.split(':').map(Number)
              const [bEndH, bEndM] = br.end.split(':').map(Number)
              dailyMinutes -= bEndH * 60 + bEndM - (bStartH * 60 + bStartM)
            })
          }
        })
      }

      // Calculate weekly
      DAY_NAMES.forEach(day => {
        const dayHours = getStaffWorkingHours(staff.id, day)
        if (dayHours.isWorking) {
          dayHours.shifts.forEach(shift => {
            const [startH, startM] = shift.start.split(':').map(Number)
            const [endH, endM] = shift.end.split(':').map(Number)
            let minutes = endH * 60 + endM - (startH * 60 + startM)

            // Subtract breaks
            if (shift.breaks) {
              shift.breaks.forEach(br => {
                const [bStartH, bStartM] = br.start.split(':').map(Number)
                const [bEndH, bEndM] = br.end.split(':').map(Number)
                minutes -= bEndH * 60 + bEndM - (bStartH * 60 + bStartM)
              })
            }

            weeklyMinutes += minutes
          })
        }
      })

      totals[staff.id] = {
        daily: dailyMinutes / 60,
        weekly: weeklyMinutes / 60,
        monthly: (weeklyMinutes * 4.33) / 60 // Average weeks per month
      }
    })

    return totals
  }, [filteredStaff, currentDay, getStaffWorkingHours])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with time labels */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: '2px solid',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ width: 200, flexShrink: 0, p: 2 }}>
          <Typography variant='subtitle2' fontWeight={600}>
            Schedule
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', flexGrow: 1, height: 40 }}>
          {HOURS.map((hour, index) => (
            <Box
              key={hour}
              sx={{
                position: 'absolute',
                left: `${(index / HOURS.length) * 100}%`,
                transform: 'translateX(-50%)',
                top: 8
              }}
            >
              <Typography variant='caption' color='text.secondary'>
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ width: 120, flexShrink: 0 }} /> {/* Totals column */}
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Business Hours Row */}
        <Box
          sx={{
            display: 'flex',
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 60,
            bgcolor: 'grey.900'
          }}
        >
          <Box
            sx={{
              width: 200,
              flexShrink: 0,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography variant='subtitle2' fontWeight={600} color='white'>
              Business Hours
            </Typography>
            <Tooltip title='Edit business hours'>
              <IconButton size='small' onClick={onEditBusinessHours} sx={{ color: 'white' }}>
                <i className='ri-edit-line' style={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ position: 'relative', flexGrow: 1 }}>
            {/* Hour grid lines */}
            {HOURS.map((hour, index) => (
              <Box
                key={hour}
                sx={{
                  position: 'absolute',
                  left: `${(index / HOURS.length) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            ))}

            {/* Business hours bars */}
            {branchId && branchId !== 'all' && daysToShow.map((day, index) => {
              const businessHours = getBusinessHours(branchId, day)

              if (!businessHours.isOpen) {
                // Show "Closed" indicator when business is closed
                return (
                  <Box
                    key={`${day}-closed`}
                    sx={{
                      position: 'absolute',
                      left: '0%',
                      width: '100%',
                      top: viewMode === 'week' ? `${(index / 7) * 100}%` : '10%',
                      height: viewMode === 'week' ? `${100 / 7}%` : '80%',
                      bgcolor: 'grey.700',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '1px dashed',
                      borderColor: 'grey.500',
                      '&:hover': {
                        bgcolor: 'grey.600'
                      }
                    }}
                    onClick={onEditBusinessHours}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={500}
                      sx={{
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {viewMode === 'week' && `${day}: `}
                      Closed
                    </Typography>
                  </Box>
                )
              }

              return businessHours.shifts.map((shift, shiftIndex) => (
                <Box
                  key={`${day}-${shiftIndex}`}
                  sx={{
                    position: 'absolute',
                    left: `${timeToPosition(shift.start, startHour, hourRange)}%`,
                    width: `${timeToPosition(shift.end, startHour, hourRange) - timeToPosition(shift.start, startHour, hourRange)}%`,
                    top: viewMode === 'week' ? `${(index / 7) * 100}%` : '10%',
                    height: viewMode === 'week' ? `${100 / 7}%` : '80%',
                    bgcolor: 'grey.800',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'grey.700'
                    }
                  }}
                  onClick={onEditBusinessHours}
                >
                  <Typography variant='caption' color='white' fontWeight={500}>
                    {viewMode === 'week' && `${day}: `}
                    {shift.start} - {shift.end}
                  </Typography>
                </Box>
              ))
            })}
          </Box>

          <Box sx={{ width: 120, flexShrink: 0 }} />
        </Box>

        {/* Staff Rows */}
        {filteredStaff.map(staff => {
          const totals = staffTotals[staff.id]
          const timeOff = getTimeOffForStaff(staff.id)
          const reservations = getTimeReservationsForStaff(staff.id)

          return (
            <Box
              key={staff.id}
              sx={{
                display: 'flex',
                borderBottom: '1px solid',
                borderColor: 'divider',
                minHeight: 80,
                bgcolor: 'background.paper'
              }}
            >
              {/* Staff Info */}
              <Box
                sx={{
                  width: 200,
                  flexShrink: 0,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar alt={staff.name} sx={{ width: 32, height: 32, bgcolor: staff.color }}>
                  {getInitials(staff.name)}
                </Avatar>
                <Box>
                  <Typography variant='body2' fontWeight={500}>
                    {staff.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {staff.title}
                  </Typography>
                </Box>
              </Box>

              {/* Timeline */}
              <Box sx={{ position: 'relative', flexGrow: 1 }}>
                {/* Hour grid lines */}
                {HOURS.map(hour => (
                  <Box
                    key={hour}
                    sx={{
                      position: 'absolute',
                      left: `${(hour / 24) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      bgcolor: 'divider'
                    }}
                  />
                ))}

                {/* Staff shifts */}
                {daysToShow.map((day, dayIndex) => {
                  const dayHours = getStaffWorkingHours(staff.id, day)
                  if (!dayHours.isWorking) return null

                  return dayHours.shifts.map((shift, shiftIndex) => (
                    <Box key={`${day}-${shiftIndex}`}>
                      {/* Shift bar */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${timeToPosition(shift.start, startHour, hourRange)}%`,
                          width: `${timeToPosition(shift.end, startHour, hourRange) - timeToPosition(shift.start, startHour, hourRange)}%`,
                          top: viewMode === 'week' ? `${(dayIndex / 7) * 100 + 10}%` : '20%',
                          height: viewMode === 'week' ? `${100 / 7 - 20}%` : '60%',
                          bgcolor: 'var(--mui-palette-customColors-sage)',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'var(--mui-palette-customColors-teal)'
                          }
                        }}
                        onClick={onEditStaffShift}
                      />

                      {/* Break chips */}
                      {shift.breaks?.map((breakRange, breakIndex) => (
                        <Chip
                          key={breakIndex}
                          label='Break'
                          size='small'
                          sx={{
                            position: 'absolute',
                            left: `${timeToPosition(breakRange.start, startHour, hourRange)}%`,
                            top: viewMode === 'week' ? `${(dayIndex / 7) * 100 + 15}%` : '25%',
                            height: 20,
                            fontSize: '0.65rem'
                          }}
                        />
                      ))}
                    </Box>
                  ))
                })}

                {/* Time off overlay */}
                {timeOff.map(off => {
                  const dayOfWeek = DAY_NAMES[off.range.start.getDay()]
                  if (!daysToShow.includes(dayOfWeek)) return null

                  return (
                    <Box
                      key={off.id}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        top: viewMode === 'week' ? `${(daysToShow.indexOf(dayOfWeek) / 7) * 100}%` : 0,
                        height: viewMode === 'week' ? `${100 / 7}%` : '100%',
                        bgcolor: 'rgba(232, 134, 130, 0.25)',
                        backgroundImage:
                          'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(232, 134, 130, 0.12) 10px, rgba(232, 134, 130, 0.12) 20px)',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Chip
                        label={`${off.reason} ${off.approved ? '✓' : '?'}`}
                        size='small'
                        sx={{
                          bgcolor: 'var(--mui-palette-customColors-coral)',
                          color: 'var(--mui-palette-common-white)',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>

              {/* Totals */}
              <Box
                sx={{
                  width: 120,
                  flexShrink: 0,
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 0.5
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  D: {totals.daily.toFixed(1)}h
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  W: {totals.weekly.toFixed(1)}h
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  M: {totals.monthly.toFixed(0)}h
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
