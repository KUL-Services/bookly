'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Skeleton
} from '@mui/material'
import { format, parseISO } from 'date-fns'
import type { Session } from '@/lib/api/types'
import { SessionsService } from '@/lib/api/services/sessions.service'

interface SessionSelectorProps {
  resourceId: string
  date: Date
  selectedSessionId: string | null
  onSelectSession: (session: Session | null) => void
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Helper function to format time
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function SessionSelector({ resourceId, date, selectedSessionId, onSelectSession }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch sessions for the selected date and resource
  useEffect(() => {
    const fetchSessions = async () => {
      if (!resourceId || !date) {
        setSessions([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const dateStr = format(date, 'yyyy-MM-dd')
        const result = await SessionsService.getSessionsForDate({
          date: dateStr,
          resourceId
        })

        // Filter to only active sessions with available spots
        const availableSessions = (result.data || []).filter(
          s => s.isActive && (s.availableSpots === undefined || s.availableSpots > 0)
        )

        setSessions(availableSessions)
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
        setError('Failed to load available sessions')
        setSessions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [resourceId, date])

  // Clear selection when resource or date changes
  useEffect(() => {
    onSelectSession(null)
  }, [resourceId, date])

  if (isLoading) {
    return (
      <Box>
        <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1.5 }}>
          Available Sessions
        </Typography>
        <Grid container spacing={1.5}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} key={i}>
              <Skeleton variant='rounded' height={80} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mt: 1 }}>
        {error}
      </Alert>
    )
  }

  if (sessions.length === 0) {
    return (
      <Alert severity='info' sx={{ mt: 1 }}>
        <Typography variant='body2'>No sessions available for {format(date, 'EEEE, MMMM d, yyyy')}.</Typography>
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1.5 }}>
        Available Sessions for {format(date, 'EEEE, MMM d')}
      </Typography>

      <Grid container spacing={1.5}>
        {sessions.map(session => {
          const isSelected = selectedSessionId === session.id
          const isFull = session.availableSpots !== undefined && session.availableSpots <= 0
          const remainingSpots =
            session.availableSpots !== undefined
              ? session.availableSpots
              : Math.max(session.maxParticipants - (session.currentParticipants || 0), 0)
          const occupancyPercent =
            session.maxParticipants > 0 ? ((session.currentParticipants || 0) / session.maxParticipants) * 100 : 0

          return (
            <Grid item xs={12} key={session.id}>
              <Card
                variant={isSelected ? 'elevation' : 'outlined'}
                sx={{
                  opacity: isFull ? 0.6 : 1,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderWidth: isSelected ? 2 : 1,
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s'
                }}
              >
                <CardActionArea
                  onClick={() => !isFull && onSelectSession(isSelected ? null : session)}
                  disabled={isFull}
                >
                  <CardContent sx={{ py: 1.5, px: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant='subtitle2' fontWeight={600}>
                          {session.name}
                        </Typography>
                        {session.description && (
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                            {session.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        {session.price !== undefined && session.price > 0 && (
                          <Chip size='small' label={`EGP ${session.price}`} color='primary' variant='outlined' />
                        )}
                        <Chip
                          size='small'
                          label={`${remainingSpots} left`}
                          color={remainingSpots === 0 ? 'error' : remainingSpots <= 2 ? 'warning' : 'success'}
                          variant='outlined'
                        />
                        {isFull && <Chip size='small' label='Full' color='error' variant='filled' />}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <i className='ri-time-line' style={{ fontSize: 14, opacity: 0.6 }} />
                        <Typography variant='body2'>
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <i className='ri-group-line' style={{ fontSize: 14, opacity: 0.6 }} />
                        <Typography variant='body2'>
                          {session.currentParticipants || 0}/{session.maxParticipants} spots
                        </Typography>
                      </Box>
                    </Box>

                    {/* Capacity Progress Bar */}
                    <LinearProgress
                      variant='determinate'
                      value={Math.min(occupancyPercent, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor:
                            occupancyPercent >= 90
                              ? 'error.main'
                              : occupancyPercent >= 70
                                ? 'warning.main'
                                : 'success.main'
                        }
                      }}
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {selectedSessionId && (
        <Alert severity='success' sx={{ mt: 2 }}>
          <Typography variant='body2'>Session selected! Click "Save" to complete the booking.</Typography>
        </Alert>
      )}
    </Box>
  )
}
