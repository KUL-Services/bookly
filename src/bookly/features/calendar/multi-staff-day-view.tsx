'use client'

import { Box, Typography, IconButton, Avatar, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, addMinutes, isSameDay, isToday } from 'date-fns'
import { useState, useEffect } from 'react'
import { useCalendarStore } from './state'
import { getBranchName, buildEventColors } from './utils'
import type { CalendarEvent } from './types'

const adjustColorOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }
  if (color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`)
  }
  return color
}

interface MultiStaffDayViewProps {
  events: CalendarEvent[]
  staffMembers: Array<{ id: string; name: string; photo?: string; branchId?: string; workingHours?: string }>
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onStaffClick?: (staffId: string) => void
  onCellClick?: (staffId: string, date: Date) => void
}

export default function MultiStaffDayView({
  events,
  staffMembers,
  currentDate,
  onEventClick,
  onStaffClick,
  onCellClick
}: MultiStaffDayViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorScheme = useCalendarStore(state => state.colorScheme)

  // Filter events for current date
  const todayEvents = events.filter(event => isSameDay(new Date(event.start), currentDate))

  // Generate time slots (6 AM to 10 PM, 15 min intervals)
  const timeSlots: Date[] = []
  const startHour = 6
  const endHour = 22
  const minutesPerSlot = 15
  const baseDate = new Date(currentDate)
  baseDate.setHours(startHour, 0, 0, 0)

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += minutesPerSlot) {
      const slot = new Date(currentDate)
      slot.setHours(hour, minute, 0, 0)
      timeSlots.push(slot)
    }
  }

  // Current time tracking for live indicator
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Get events for a specific staff member
  const getStaffEvents = (staffId: string) => {
    return todayEvents.filter(event => event.extendedProps.staffId === staffId)
  }

  // Calculate event position and height
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const startMinutes = start.getHours() * 60 + start.getMinutes() - startHour * 60
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
    const slotHeight = 40 // 40px per 15 min slot
    const top = (startMinutes / minutesPerSlot) * slotHeight
    const height = (duration / minutesPerSlot) * slotHeight

    return { top, height }
  }

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    if (!isToday(currentDate)) return null

    const now = currentTime
    const currentMinutes = now.getHours() * 60 + now.getMinutes() - startHour * 60

    // Only show if within working hours
    if (currentMinutes < 0 || currentMinutes > (endHour - startHour) * 60) return null

    const slotHeight = 40 // 40px per 15 min slot
    const top = (currentMinutes / minutesPerSlot) * slotHeight

    return { top, time: format(now, 'h:mm a') }
  }

  const currentTimeIndicator = getCurrentTimePosition()

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Wrapper for horizontal scroll */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Box sx={{
          minWidth: { xs: `${60 + staffMembers.length * 150}px`, md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          {/* Header with staff columns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: `60px repeat(${staffMembers.length}, 150px)`,
                md: `60px repeat(${staffMembers.length}, minmax(180px, 1fr))`
              },
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              '& > *': {
                minWidth: 0,
                overflow: 'hidden'
              }
            }}
          >
        {/* Time column header */}
        <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider' }} />

        {/* Staff headers */}
        {staffMembers.map(staff => (
          <Box
            key={staff.id}
            sx={{
              p: 2,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
              }
            }}
            onClick={() => onStaffClick?.(staff.id)}
          >
            <Avatar
              src={staff.photo}
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {staff.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Typography variant="body2" fontWeight={600} textAlign="center" noWrap sx={{ maxWidth: '100%' }}>
              {staff.name}
            </Typography>
            {staff.branchId && (
              <Chip
                icon={<i className='ri-map-pin-line' style={{ fontSize: '0.7rem' }} />}
                label={getBranchName(staff.branchId)}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  '& .MuiChip-icon': { fontSize: '0.7rem', ml: 0.5 },
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                  color: theme => theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'
                }}
              />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {getStaffEvents(staff.id).length} appointments
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
              {staff.workingHours || '10:00 AM-7:00 PM'}
            </Typography>
          </Box>
          ))}
          </Box>

          {/* Content grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: `60px repeat(${staffMembers.length}, 150px)`,
                md: `60px repeat(${staffMembers.length}, minmax(180px, 1fr))`
              },
              position: 'relative',
              minHeight: '100%',
              '& > *': {
                minWidth: 0,
                overflow: 'hidden'
              }
            }}
          >
          {/* Time slots column */}
          <Box sx={{ borderRight: 1, borderColor: 'divider' }}>
            {timeSlots.map((slot, index) => {
              const minutes = slot.getMinutes()
              const showDashedLine = minutes === 15 || minutes === 30 || minutes === 45

              return (
                <Box
                  key={index}
                  sx={{
                    height: 40,
                    borderBottom: minutes === 0 ? 1 : 0,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    pt: minutes === 0 ? 0 : 0.5,
                    position: 'relative',
                    '&::after': showDashedLine ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundImage: isDark
                        ? 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.12) 100%)'
                        : 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.12) 100%)',
                      backgroundSize: '8px 1px',
                      backgroundRepeat: 'repeat-x'
                    } : {}
                  }}
                >
                  {minutes === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: -0.5 }}>
                      {format(slot, 'h a')}
                    </Typography>
                  )}
                </Box>
              )
            })}
          </Box>

          {/* Staff columns */}
          {staffMembers.map((staff, staffIndex) => (
            <Box
              key={staff.id}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                position: 'relative',
                bgcolor: staffIndex % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(144,202,249,0.05)' : 'rgba(25,118,210,0.05)'
                }
              }}
              onClick={(e) => {
                // Only navigate if clicking on empty space (not on an event)
                const target = e.target as HTMLElement
                if (target === e.currentTarget || !target.closest('.event-card')) {
                  onCellClick?.(staff.id, currentDate)
                }
              }}
            >
              {/* Time slot grid lines */}
              {timeSlots.map((slot, index) => {
                const minutes = slot.getMinutes()
                const showDashedLine = minutes === 15 || minutes === 30 || minutes === 45

                return (
                  <Box
                    key={index}
                    sx={{
                      height: 40,
                      borderBottom: minutes === 0 ? 1 : 0,
                      borderColor: 'divider',
                      position: 'relative',
                      '&::after': showDashedLine ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        backgroundImage: isDark
                          ? 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.12) 100%)'
                          : 'linear-gradient(to right, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.12) 100%)',
                        backgroundSize: '8px 1px',
                        backgroundRepeat: 'repeat-x'
                      } : {}
                    }}
                  />
                )
              })}

              {/* Current time indicator */}
              {currentTimeIndicator && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: `${currentTimeIndicator.top}px`,
                    left: 0,
                    right: 0,
                    height: '2px',
                    bgcolor: '#ef4444',
                    zIndex: 100,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#ef4444'
                    },
                    '&::after': {
                      content: `"${currentTimeIndicator.time}"`,
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: '#ef4444',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: 2
                    }
                  }}
                />
              )}

              {/* Events */}
              {getStaffEvents(staff.id).map(event => {
                const { top, height } = getEventStyle(event)
                const colors = buildEventColors(colorScheme, event.extendedProps.status)
                const baseFillOpacity = isDark ? 0.22 : 0.16
                const fillColor = adjustColorOpacity(colors.border, baseFillOpacity)
                const textColor = theme.palette.text.primary

                return (
                  <Box
                    key={event.id}
                    className="event-card"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    sx={{
                      position: 'absolute',
                      top: `${top}px`,
                      left: '8px',
                      right: '8px',
                      height: `${height}px`,
                      bgcolor: fillColor,
                      border: 'none',
                      borderLeft: `4px solid ${colors.border}`,
                      borderRadius: 2,
                      p: 1,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'scale(1.02)',
                        zIndex: 5
                      }
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontWeight: 600,
                        color: textColor,
                        fontSize: '0.7rem',
                        mb: 0.25,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: textColor,
                        fontSize: '0.8125rem',
                        lineHeight: 1.3,
                        mb: 0.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word'
                      }}
                    >
                      {event.extendedProps.starred && '⭐ '}
                      {event.extendedProps.customerName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: textColor,
                        fontSize: '0.7rem',
                        opacity: 0.9,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {event.extendedProps.serviceName || event.title}
                    </Typography>
                  </Box>
                )
              })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
