'use client'

import { useMemo } from 'react'
import { Box, Typography, Avatar, Chip, IconButton, Tooltip, Paper } from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { DayOfWeek } from '../calendar/types'

interface ShiftsTimelineProps {
  viewMode: 'day' | 'week'
  selectedStaffIds: string[]
  selectedDate: Date
  onEditBusinessHours: () => void
  onEditStaffShift: () => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0-23
const DAY_NAMES: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function timeToPosition(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return ((hours + minutes / 60) / 24) * 100
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
          {HOURS.map(hour => (
            <Box
              key={hour}
              sx={{
                position: 'absolute',
                left: `${(hour / 24) * 100}%`,
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
            {HOURS.map(hour => (
              <Box
                key={hour}
                sx={{
                  position: 'absolute',
                  left: `${(hour / 24) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            ))}

            {/* Business hours bars */}
            {daysToShow.map((day, index) => {
              const businessHours = getBusinessHours(day)

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
                    left: `${timeToPosition(shift.start)}%`,
                    width: `${timeToPosition(shift.end) - timeToPosition(shift.start)}%`,
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
                <Avatar src={staff.photo} alt={staff.name} sx={{ width: 32, height: 32, bgcolor: staff.color }}>
                  {staff.name[0]}
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
                          left: `${timeToPosition(shift.start)}%`,
                          width: `${timeToPosition(shift.end) - timeToPosition(shift.start)}%`,
                          top: viewMode === 'week' ? `${(dayIndex / 7) * 100 + 10}%` : '20%',
                          height: viewMode === 'week' ? `${100 / 7 - 20}%` : '60%',
                          bgcolor: '#d4a574',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: '#c49564'
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
                            left: `${timeToPosition(breakRange.start)}%`,
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
                        bgcolor: 'rgba(121, 85, 72, 0.3)',
                        backgroundImage:
                          'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(121, 85, 72, 0.1) 10px, rgba(121, 85, 72, 0.1) 20px)',
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
                          bgcolor: '#795548',
                          color: 'white',
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
