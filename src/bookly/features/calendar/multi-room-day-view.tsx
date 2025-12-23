'use client'

import { Box, Typography, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { isSameDay } from 'date-fns'
import { useCalendarStore } from './state'
import { buildEventColors } from './utils'
import type { CalendarEvent, Room } from './types'

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

interface MultiRoomDayViewProps {
  events: CalendarEvent[]
  rooms: Room[]
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onSlotClick?: (slotId: string, date: Date) => void
}

export default function MultiRoomDayView({
  events,
  rooms,
  currentDate,
  onEventClick,
  onSlotClick
}: MultiRoomDayViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const getSlotsForDate = useCalendarStore(state => state.getSlotsForDate)
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const staticSlots = useCalendarStore(state => state.staticSlots) // Subscribe to slots for reactivity

  // Filter events for current date
  const todayEvents = events.filter(event => isSameDay(new Date(event.start), currentDate))

  // Get slots for today (now reactive to staticSlots changes)
  const todaySlots = getSlotsForDate(currentDate)

  // Generate time slots (6 AM to 10 PM, 30 min intervals)
  const timeSlots: Date[] = []
  const startHour = 6
  const endHour = 22

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slot = new Date(currentDate)
      slot.setHours(hour, minute, 0, 0)
      timeSlots.push(slot)
    }
  }

  // Get events for a specific room
  const getRoomEvents = (roomId: string) => {
    return todayEvents.filter(event => event.extendedProps.roomId === roomId)
  }

  // Get slots for a specific room
  const getRoomSlots = (roomId: string) => {
    return todaySlots.filter(slot => slot.roomId === roomId)
  }

  // Calculate event/slot position and height
  const getTimeBlockStyle = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    // Calculate minutes from start of day view (6 AM)
    const dayStartHour = 6
    const startMinutes = (startHour - dayStartHour) * 60 + startMin
    const endMinutes = (endHour - dayStartHour) * 60 + endMin
    const duration = endMinutes - startMinutes

    const slotHeight = 80 // 80px per 30 min slot
    const top = (startMinutes / 30) * slotHeight
    const height = (duration / 30) * slotHeight

    return { top, height }
  }

  // Get event style from event object
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const startTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
    const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
    return getTimeBlockStyle(startTime, endTime)
  }

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
          minWidth: { xs: `${60 + rooms.length * 150}px`, md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          {/* Header with room columns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: `60px repeat(${rooms.length}, 150px)`,
                md: `60px repeat(${rooms.length}, minmax(180px, 1fr))`
              },
              borderBottom: `1px solid ${theme.palette.divider}`,
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 10,
              '& > *': {
                minWidth: 0,
                overflow: 'hidden'
              }
            }}
          >
            {/* Empty corner cell */}
            <Box sx={{ p: 2 }} />

            {/* Room headers */}
            {rooms.map(room => (
              <Box
                key={room.id}
                sx={{
                  p: { xs: 1, md: 2 },
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Box
                  sx={{
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 },
                    borderRadius: '50%',
                    bgcolor: '#9E9E9E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  {room.name.substring(0, 2).toUpperCase()}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  textAlign="center"
                  sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                >
                  {room.name}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Time grid */}
          <Box sx={{ flex: 1, position: 'relative', display: 'grid', gridTemplateColumns: { xs: `60px repeat(${rooms.length}, 150px)`, md: `60px repeat(${rooms.length}, minmax(180px, 1fr))` }, '& > *': { minWidth: 0, overflow: 'hidden' } }}>
            {/* Time labels column */}
            <Box>
              {timeSlots.map((slot, idx) => (
                <Box
                  key={idx}
                  sx={{
                    height: '80px',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    pt: 0.5,
                    pr: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                    {slot.getMinutes() === 0 ? slot.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }) : ''}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Room columns */}
            {rooms.map(room => {
              const roomSlots = getRoomSlots(room.id)
              const roomEvents = getRoomEvents(room.id)

              return (
                <Box
                  key={room.id}
                  sx={{
                    position: 'relative',
                    borderLeft: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {/* Time grid cells */}
                  {timeSlots.map((slot, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        height: '80px',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: idx % 2 === 0 ? 'background.default' : 'action.hover'
                      }}
                    />
                  ))}

                  {/* Static service slots (background) */}
                  {roomSlots.map(slot => {
                    const { top, height } = getTimeBlockStyle(slot.startTime, slot.endTime)
                    const { available, remainingCapacity, total } = isSlotAvailable(slot.id, currentDate)
                    const isFull = !available

                    return (
                      <Box
                        key={slot.id}
                        onClick={() => available && onSlotClick?.(slot.id, currentDate)}
                        sx={{
                          position: 'absolute',
                          top: `${top}px`,
                          left: 0,
                          right: 0,
                          height: `${height}px`,
                          bgcolor: isFull ? 'rgba(244, 67, 54, 0.08)' : 'rgba(76, 175, 80, 0.1)',
                          border: `2px ${isFull ? 'solid' : 'dashed'} ${isFull ? '#F44336' : '#4CAF50'}`,
                          borderRadius: 1,
                          p: 1,
                          cursor: available ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s',
                          '&:hover': available ? {
                            bgcolor: 'rgba(76, 175, 80, 0.2)',
                            borderStyle: 'solid',
                            transform: 'scale(1.01)'
                          } : {},
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          overflow: 'hidden',
                          opacity: isFull ? 0.6 : 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{
                              fontSize: { xs: '0.65rem', md: '0.75rem' },
                              color: isFull ? 'error.main' : 'success.dark',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1
                            }}
                          >
                            {slot.serviceName}
                          </Typography>
                          {isFull && (
                            <Chip
                              label="FULL"
                              size="small"
                              color="error"
                              sx={{
                                height: { xs: 14, md: 16 },
                                fontSize: { xs: '0.55rem', md: '0.6rem' },
                                fontWeight: 700
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: { xs: '0.6rem', md: '0.7rem' },
                            color: 'text.secondary'
                          }}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Typography>
                        <Chip
                          icon={<i className="ri-user-line" style={{ fontSize: '0.75rem' }} />}
                          label={`${remainingCapacity}/${total} available`}
                          size="small"
                          color={isFull ? 'error' : remainingCapacity < total * 0.3 ? 'warning' : 'success'}
                          sx={{
                            height: { xs: 16, md: 18 },
                            fontSize: { xs: '0.6rem', md: '0.65rem' },
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              marginLeft: '4px'
                            }
                          }}
                        />
                      </Box>
                    )
                  })}

                  {/* Bookings (foreground) */}
                  {roomEvents.map(event => {
                    const { top, height } = getEventStyle(event)
                    const colors = buildEventColors(colorScheme, event.extendedProps.status)
                    const baseFillOpacity = isDark ? 0.22 : 0.16
                    const fillColor = adjustColorOpacity(colors.border, baseFillOpacity)
                    const textColor = theme.palette.text.primary

                    return (
                      <Box
                        key={event.id}
                        data-event-id={event.id}
                        onClick={() => onEventClick?.(event)}
                        sx={{
                          position: 'absolute',
                          top: `${top}px`,
                          left: '4px',
                          right: '4px',
                          height: `${height - 4}px`,
                          bgcolor: fillColor,
                          border: 'none',
                          borderLeft: `4px solid ${colors.border}`,
                          borderRadius: 1,
                          p: 1,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          zIndex: 5,
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{
                            color: textColor,
                            fontSize: { xs: '0.7rem', md: '0.8rem' },
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {event.extendedProps.customerName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: textColor,
                            fontSize: { xs: '0.65rem', md: '0.7rem' },
                            display: 'block',
                            opacity: 0.8,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {event.extendedProps.serviceName}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
