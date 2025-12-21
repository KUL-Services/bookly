'use client'

import { Box, Typography, Chip, Avatar } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format, isSameDay, startOfDay } from 'date-fns'
import { useMemo } from 'react'
import { useCalendarStore } from './state'
import { buildEventColors, getBranchName } from './utils'
import type { CalendarEvent } from './types'

interface AppointmentListViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

interface GroupedEvents {
  [date: string]: {
    [branchId: string]: {
      branchName: string
      events: CalendarEvent[]
    }
  }
}

// Helper to adjust color opacity for faded events
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

export default function AppointmentListView({ events, onEventClick }: AppointmentListViewProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const isEventMatchedBySearch = useCalendarStore(state => state.isEventMatchedBySearch)

  // Group events by date and then by branch
  const groupedEvents = useMemo(() => {
    const groups: GroupedEvents = {}

    events.forEach(event => {
      // Skip background events (time-off, reservations)
      if (event.extendedProps.type === 'timeOff' || event.extendedProps.type === 'reservation') {
        return
      }

      const dateKey = format(startOfDay(new Date(event.start)), 'yyyy-MM-dd')
      const branchId = event.extendedProps.branchId || 'unknown'
      const branchName = event.extendedProps.branchName || getBranchName(branchId) || 'Unknown Branch'

      if (!groups[dateKey]) {
        groups[dateKey] = {}
      }

      if (!groups[dateKey][branchId]) {
        groups[dateKey][branchId] = {
          branchName,
          events: []
        }
      }

      groups[dateKey][branchId].events.push(event)
    })

    // Sort events within each branch by time
    Object.values(groups).forEach(dateGroup => {
      Object.values(dateGroup).forEach(branchGroup => {
        branchGroup.events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      })
    })

    return groups
  }, [events])

  // Get sorted date keys
  const dateKeys = useMemo(() => {
    return Object.keys(groupedEvents).sort()
  }, [groupedEvents])

  if (dateKeys.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No appointments found
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        p: { xs: 2, md: 3 }
      }}
    >
      {dateKeys.map(dateKey => {
        const date = new Date(dateKey)
        const branchGroups = groupedEvents[dateKey]
        const branchIds = Object.keys(branchGroups)

        return (
          <Box key={dateKey} sx={{ mb: 4 }}>
            {/* Date Header */}
            <Box
              sx={{
                mb: 2,
                pb: 1,
                borderBottom: 2,
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {format(date, 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>

            {/* Branch Groups */}
            {branchIds.map(branchId => {
              const branchGroup = branchGroups[branchId]
              const eventCount = branchGroup.events.length

              return (
                <Box key={branchId} sx={{ mb: 3 }}>
                  {/* Branch Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5,
                      px: 2,
                      py: 1,
                      bgcolor: isDark ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)',
                      borderRadius: 2
                    }}
                  >
                    <i className="ri-map-pin-line" style={{ fontSize: '1rem' }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {branchGroup.branchName}
                    </Typography>
                    <Chip
                      label={`${eventCount} appointment${eventCount !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.15)',
                        color: theme => theme.palette.mode === 'dark' ? 'rgb(94, 234, 212)' : 'rgb(20, 184, 166)'
                      }}
                    />
                  </Box>

                  {/* Appointments List */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {branchGroup.events.map(event => {
                      const colors = buildEventColors(colorScheme, event.extendedProps.status)

                      // Search highlighting logic
                      const isMatchedBySearch = isEventMatchedBySearch(event.id)
                      const isFaded = isSearchActive && !isMatchedBySearch
                      const isHighlighted = isSearchActive && isMatchedBySearch

                      // Adjust colors for faded events
                      const effectiveBorderColor = isFaded ? adjustColorOpacity(colors.border, 0.3) : colors.border

                      return (
                        <Box
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            bgcolor: 'background.paper',
                            borderLeft: 4,
                            borderColor: effectiveBorderColor,
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: isFaded ? 0.4 : 1,
                            filter: isFaded ? 'grayscale(50%)' : 'none',
                            boxShadow: isHighlighted
                              ? '0px 0px 0px 3px rgba(20, 184, 166, 0.5), 0px 4px 12px rgba(0,0,0,0.15)'
                              : 'none',
                            transform: isHighlighted ? 'scale(1.01)' : 'none',
                            '&:hover': {
                              boxShadow: isHighlighted
                                ? '0px 0px 0px 3px rgba(20, 184, 166, 0.7), 0px 6px 16px rgba(0,0,0,0.2)'
                                : 2,
                              transform: isHighlighted ? 'scale(1.02) translateX(4px)' : 'translateX(4px)',
                              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                              opacity: isFaded ? 0.6 : 1
                            }
                          }}
                        >
                          {/* Time */}
                          <Box
                            sx={{
                              minWidth: 100,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start'
                            }}
                          >
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {format(new Date(event.start), 'h:mm a')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(event.end), 'h:mm a')}
                            </Typography>
                          </Box>

                          {/* Avatar/Dot */}
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: colors.border,
                              flexShrink: 0
                            }}
                          />

                          {/* Details */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" fontWeight={600} noWrap>
                                {event.extendedProps.starred && '⭐ '}
                                {event.extendedProps.customerName}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.25 }}>
                              {event.extendedProps.serviceName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              with {event.extendedProps.staffName}
                            </Typography>
                          </Box>

                          {/* Price & Status */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: 0.5,
                              flexShrink: 0
                            }}
                          >
                            <Typography variant="body2" fontWeight={700} color="primary.main">
                              ${event.extendedProps.price}
                            </Typography>
                            <Chip
                              label={event.extendedProps.status.replace('_', ' ')}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                textTransform: 'capitalize',
                                bgcolor: colors.bg,
                                color: colors.text,
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )
            })}
          </Box>
        )
      })}
    </Box>
  )
}
