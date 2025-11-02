'use client'

import { Box, Typography, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { startOfWeek, addDays, isSameDay, format } from 'date-fns'
import { useCalendarStore } from './state'
import type { CalendarEvent, Room } from './types'

interface MultiRoomWeekViewProps {
  events: CalendarEvent[]
  rooms: Room[]
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onSlotClick?: (slotId: string, date: Date) => void
}

export default function MultiRoomWeekView({
  events,
  rooms,
  currentDate,
  onEventClick,
  onSlotClick
}: MultiRoomWeekViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const getSlotsForDate = useCalendarStore(state => state.getSlotsForDate)
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)

  // Get week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Get events for a specific room and date
  const getRoomDayEvents = (roomId: string, date: Date) => {
    return events.filter(
      event => event.extendedProps.roomId === roomId && isSameDay(new Date(event.start), date)
    )
  }

  // Get slots for a specific room and date
  const getRoomDaySlots = (roomId: string, date: Date) => {
    const daySlots = getSlotsForDate(date)
    return daySlots.filter(slot => slot.roomId === roomId)
  }

  // Count events for a room on a specific day
  const countRoomDayEvents = (roomId: string, date: Date) => {
    return getRoomDayEvents(roomId, date).length
  }

  // Count slots for a room on a specific day
  const countRoomDaySlots = (roomId: string, date: Date) => {
    return getRoomDaySlots(roomId, date).length
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Horizontal scroll wrapper */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        WebkitOverflowScrolling: 'touch'
      }}>
        {/* Inner container with minimum width */}
        <Box sx={{
          minWidth: { xs: `${220 + weekDays.length * 120}px`, md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          {/* Header row with days */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: `220px repeat(${weekDays.length}, 120px)`,
                md: `220px repeat(${weekDays.length}, 1fr)`
              },
              borderBottom: `1px solid ${theme.palette.divider}`,
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 10
            }}
          >
            {/* Room label */}
            <Box
              sx={{
                p: { xs: 1.5, md: 2 },
                display: 'flex',
                alignItems: 'center',
                borderRight: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', md: '1.125rem' } }}>
                Rooms
              </Typography>
            </Box>

            {/* Day headers */}
            {weekDays.map(day => {
              const isToday = isSameDay(day, new Date())
              return (
                <Box
                  key={day.toISOString()}
                  sx={{
                    p: { xs: 1, md: 2 },
                    borderRight: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: isToday ? 'primary.light' : 'transparent',
                    color: isToday ? 'primary.contrastText' : 'inherit'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.65rem', md: '0.75rem' },
                      textTransform: 'uppercase',
                      fontWeight: 500
                    }}
                  >
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                  >
                    {format(day, 'd')}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          {/* Room rows */}
          <Box sx={{ flex: 1 }}>
            {rooms.map(room => (
              <Box
                key={room.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: `220px repeat(${weekDays.length}, 120px)`,
                    md: `220px repeat(${weekDays.length}, 1fr)`
                  },
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  minHeight: { xs: '100px', md: '120px' }
                }}
              >
                {/* Room name cell */}
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    borderRight: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, md: 1.5 },
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 36, md: 48 },
                      height: { xs: 36, md: 48 },
                      borderRadius: '50%',
                      bgcolor: room.color || '#9E9E9E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      flexShrink: 0
                    }}
                  >
                    {room.name.substring(0, 2).toUpperCase()}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {room.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Day cells for this room */}
                {weekDays.map(day => {
                  const slotsCount = countRoomDaySlots(room.id, day)
                  const bookingsCount = countRoomDayEvents(room.id, day)
                  const isToday = isSameDay(day, new Date())
                  const slots = getRoomDaySlots(room.id, day)
                  const hasAvailableSlots = slots.some(slot => {
                    const { available } = isSlotAvailable(slot.id, day)
                    return available
                  })

                  return (
                    <Box
                      key={`${room.id}-${day.toISOString()}`}
                      sx={{
                        p: { xs: 0.5, md: 1 },
                        borderRight: `1px solid ${theme.palette.divider}`,
                        bgcolor: isToday ? 'action.hover' : 'background.default',
                        cursor: hasAvailableSlots ? 'pointer' : 'default',
                        transition: 'background-color 0.2s',
                        '&:hover': hasAvailableSlots ? {
                          bgcolor: isToday ? 'action.selected' : 'action.hover'
                        } : {},
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        overflow: 'hidden'
                      }}
                      onClick={() => {
                        if (hasAvailableSlots && slots.length > 0) {
                          onSlotClick?.(slots[0].id, day)
                        }
                      }}
                    >
                      {/* Slots indicator */}
                      {slotsCount > 0 && (
                        <Chip
                          label={`${slotsCount} ${slotsCount === 1 ? 'slot' : 'slots'}`}
                          size="small"
                          sx={{
                            height: { xs: 18, md: 20 },
                            fontSize: { xs: '0.65rem', md: '0.7rem' },
                            bgcolor: hasAvailableSlots ? 'success.light' : 'action.disabled',
                            color: hasAvailableSlots ? 'success.contrastText' : 'text.disabled'
                          }}
                        />
                      )}

                      {/* Bookings indicator */}
                      {bookingsCount > 0 && (
                        <Chip
                          label={`${bookingsCount} ${bookingsCount === 1 ? 'booking' : 'bookings'}`}
                          size="small"
                          sx={{
                            height: { xs: 18, md: 20 },
                            fontSize: { xs: '0.65rem', md: '0.7rem' },
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText'
                          }}
                        />
                      )}

                      {/* Show slot preview */}
                      {slots.slice(0, 2).map(slot => {
                        const { available, remainingCapacity, total } = isSlotAvailable(slot.id, day)
                        const isFull = !available
                        const isLowCapacity = available && remainingCapacity < total * 0.3

                        return (
                          <Box
                            key={slot.id}
                            sx={{
                              p: 0.5,
                              borderRadius: 0.5,
                              bgcolor: isFull ? 'rgba(244, 67, 54, 0.08)' : isLowCapacity ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                              border: `1px solid ${isFull ? '#F44336' : isLowCapacity ? '#FF9800' : '#4CAF50'}`,
                              opacity: isFull ? 0.7 : 1
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: { xs: '0.6rem', md: '0.65rem' },
                                  fontWeight: 600,
                                  color: isFull ? 'error.main' : isLowCapacity ? 'warning.dark' : 'success.dark',
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
                                    height: 12,
                                    fontSize: '0.5rem',
                                    fontWeight: 700,
                                    '& .MuiChip-label': { px: 0.5 }
                                  }}
                                />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: { xs: '0.55rem', md: '0.6rem' },
                                  color: 'text.secondary'
                                }}
                              >
                                {slot.startTime}
                              </Typography>
                              <Chip
                                icon={<i className="ri-user-line" style={{ fontSize: '0.6rem' }} />}
                                label={`${remainingCapacity}/${total}`}
                                size="small"
                                color={isFull ? 'error' : isLowCapacity ? 'warning' : 'success'}
                                sx={{
                                  height: 14,
                                  fontSize: { xs: '0.55rem', md: '0.6rem' },
                                  fontWeight: 600,
                                  '& .MuiChip-label': { px: 0.5 },
                                  '& .MuiChip-icon': { marginLeft: '2px', marginRight: '-2px' }
                                }}
                              />
                            </Box>
                          </Box>
                        )
                      })}

                      {/* More indicator */}
                      {slots.length > 2 && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: { xs: '0.6rem', md: '0.65rem' },
                            color: 'text.secondary',
                            textAlign: 'center'
                          }}
                        >
                          +{slots.length - 2} more
                        </Typography>
                      )}

                      {/* Empty state */}
                      {slotsCount === 0 && bookingsCount === 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: { xs: '0.65rem', md: '0.7rem' },
                            color: 'text.disabled',
                            textAlign: 'center',
                            py: { xs: 1, md: 2 }
                          }}
                        >
                          No slots
                        </Typography>
                      )}
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
