'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material'
import { format } from 'date-fns'

import { useStaffManagementStore } from './staff-store'
import { SessionEditorDrawer } from './session-editor-drawer'
import { BrandedEmptyState } from '@/bookly/components/molecules/branded-empty-state'
import { SessionsService } from '@/lib/api/services/sessions.service'
import type { Session } from '@/lib/api/types'
import type { Resource } from '../calendar/types'

type ViewMode = 'grid' | 'list'
type NavigationView = 'branch-selection' | 'resource-selection' | 'session-management'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Helper function to format time
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function SessionsTab() {
  const [navigationView, setNavigationView] = useState<NavigationView>('branch-selection')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)

  // Session data from API
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { resources, fetchResourcesFromApi, fetchServicesFromApi, fetchBranchesFromApi, apiBranches, apiServices } =
    useStaffManagementStore()

  // Fetch initial data on mount
  useEffect(() => {
    fetchResourcesFromApi()
    fetchServicesFromApi()
    fetchBranchesFromApi()
  }, [])

  // Fetch sessions when resource is selected
  useEffect(() => {
    if (selectedResourceId) {
      fetchSessions()
    }
  }, [selectedResourceId])

  const fetchSessions = async () => {
    if (!selectedResourceId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await SessionsService.getSessions({ resourceId: selectedResourceId })
      setSessions(result.data || [])
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      setError('Failed to load sessions. Please try again.')
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter resources to only show STATIC booking mode ones
  const staticResources = useMemo(() => {
    return resources.filter(r => (r as any).bookingMode === 'STATIC')
  }, [resources])

  // Filter resources by selected branch
  const branchStaticResources = useMemo(() => {
    if (!selectedBranchId) return []
    return staticResources.filter(r => r.branchId === selectedBranchId)
  }, [staticResources, selectedBranchId])

  // Get selected resource
  const selectedResource = useMemo(() => {
    return resources.find(r => r.id === selectedResourceId)
  }, [resources, selectedResourceId])

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions
    const query = searchQuery.toLowerCase()
    return sessions.filter(s => s.name.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query))
  }, [sessions, searchQuery])

  // Count resources with STATIC mode per branch
  const getStaticResourceCount = (branchId: string) => {
    return staticResources.filter(r => r.branchId === branchId).length
  }

  // Handle session save
  const handleSaveSession = async (data: any) => {
    if (editingSession) {
      // Update existing
      await SessionsService.updateSession(editingSession.id, data)
    } else {
      // Create new
      await SessionsService.createSession(data)
    }
    await fetchSessions()
  }

  // Handle session delete
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return

    try {
      await SessionsService.deleteSession(sessionToDelete.id)
      await fetchSessions()
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
    } catch (err) {
      console.error('Failed to delete session:', err)
      alert('Failed to delete session. Please try again.')
    }
  }

  // Navigation handlers
  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId)
    setNavigationView('resource-selection')
  }

  const handleSelectResource = (resourceId: string) => {
    setSelectedResourceId(resourceId)
    setNavigationView('session-management')
  }

  const handleBackToBranches = () => {
    setSelectedBranchId(null)
    setSelectedResourceId(null)
    setSessions([])
    setNavigationView('branch-selection')
  }

  const handleBackToResources = () => {
    setSelectedResourceId(null)
    setSessions([])
    setNavigationView('resource-selection')
  }

  // Render branch selection view
  const renderBranchSelection = () => (
    <Box>
      <Typography variant='h6' fontWeight={600} sx={{ mb: 3 }}>
        Select a Branch
      </Typography>

      {apiBranches.length === 0 ? (
        <BrandedEmptyState
          icon={<i className='ri-building-line' style={{ fontSize: 48 }} />}
          title='No Branches Found'
          description='Create a branch first to manage sessions.'
        />
      ) : (
        <Grid container spacing={2}>
          {apiBranches.map(branch => {
            const staticCount = getStaticResourceCount(branch.id)
            return (
              <Grid item xs={12} sm={6} md={4} key={branch.id}>
                <Card
                  sx={{
                    cursor: staticCount > 0 ? 'pointer' : 'default',
                    opacity: staticCount > 0 ? 1 : 0.6,
                    transition: 'all 0.2s',
                    '&:hover':
                      staticCount > 0
                        ? {
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          }
                        : {}
                  }}
                  onClick={() => staticCount > 0 && handleSelectBranch(branch.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <i className='ri-building-line' />
                      </Avatar>
                      <Box>
                        <Typography variant='subtitle1' fontWeight={600}>
                          {branch.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {branch.address || 'No address'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        size='small'
                        icon={<i className='ri-calendar-schedule-line' />}
                        label={`${staticCount} Static Resource${staticCount !== 1 ? 's' : ''}`}
                        color={staticCount > 0 ? 'primary' : 'default'}
                        variant={staticCount > 0 ? 'filled' : 'outlined'}
                      />
                    </Box>
                    {staticCount === 0 && (
                      <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                        No resources with STATIC booking mode
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )

  // Render resource selection view
  const renderResourceSelection = () => {
    const selectedBranch = apiBranches.find(b => b.id === selectedBranchId)

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton onClick={handleBackToBranches} size='small'>
            <i className='ri-arrow-left-line' />
          </IconButton>
          <Typography variant='h6' fontWeight={600}>
            {selectedBranch?.name} - Select Resource
          </Typography>
        </Box>

        {branchStaticResources.length === 0 ? (
          <BrandedEmptyState
            icon={<i className='ri-calendar-schedule-line' style={{ fontSize: 48 }} />}
            title='No Static Resources'
            description='Create a resource with STATIC booking mode to manage sessions.'
          />
        ) : (
          <Grid container spacing={2}>
            {branchStaticResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleSelectResource(resource.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <i className='ri-calendar-check-line' />
                      </Avatar>
                      <Box>
                        <Typography variant='subtitle1' fontWeight={600}>
                          {resource.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Capacity: {resource.capacity}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip size='small' label='STATIC Mode' color='info' variant='outlined' />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    )
  }

  // Render session card
  const renderSessionCard = (session: Session) => {
    const service = apiServices.find(s => s.id === session.serviceId)

    return (
      <Grid item xs={12} sm={6} md={4} key={session.id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity: session.isActive ? 1 : 0.7,
            borderLeft: 4,
            borderColor: session.isActive ? 'primary.main' : 'grey.400'
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant='subtitle1' fontWeight={600}>
                  {session.name}
                </Typography>
                {session.description && (
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                    {session.description}
                  </Typography>
                )}
              </Box>
              <Chip
                size='small'
                label={session.isActive ? 'Active' : 'Inactive'}
                color={session.isActive ? 'success' : 'default'}
                variant='outlined'
              />
            </Box>

            {/* Schedule Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <i className='ri-time-line' style={{ opacity: 0.6, fontSize: 16 }} />
              <Typography variant='body2'>
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <i className='ri-calendar-line' style={{ opacity: 0.6, fontSize: 16 }} />
              <Typography variant='body2'>
                {session.dayOfWeek !== undefined
                  ? `Every ${DAYS_OF_WEEK[session.dayOfWeek]}`
                  : session.date
                    ? format(new Date(session.date), 'MMM d, yyyy')
                    : 'No schedule'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <i className='ri-group-line' style={{ opacity: 0.6, fontSize: 16 }} />
              <Typography variant='body2'>
                {session.currentParticipants ?? 0} / {session.maxParticipants} participants
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {session.dayOfWeek !== undefined ? (
                <Chip size='small' label='Recurring' icon={<i className='ri-repeat-line' />} variant='outlined' />
              ) : (
                <Chip
                  size='small'
                  label='One-time'
                  icon={<i className='ri-calendar-event-line' />}
                  variant='outlined'
                />
              )}
              {service && <Chip size='small' label={service.name} variant='outlined' />}
              {session.price !== undefined && session.price > 0 && (
                <Chip size='small' label={`EGP ${session.price}`} color='primary' variant='outlined' />
              )}
            </Box>
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              size='small'
              startIcon={<i className='ri-edit-line' />}
              onClick={() => {
                setEditingSession(session)
                setIsEditorOpen(true)
              }}
            >
              Edit
            </Button>
            <Button
              size='small'
              color='error'
              startIcon={<i className='ri-delete-bin-line' />}
              onClick={() => {
                setSessionToDelete(session)
                setDeleteDialogOpen(true)
              }}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      </Grid>
    )
  }

  // Render session management view
  const renderSessionManagement = () => {
    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={handleBackToResources} size='small'>
            <i className='ri-arrow-left-line' />
          </IconButton>
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {selectedResource?.name} - Sessions
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Manage pre-defined sessions for this resource
            </Typography>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Search sessions...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
          <ToggleButtonGroup
            size='small'
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
          >
            <ToggleButton value='grid'>
              <i className='ri-grid-line' />
            </ToggleButton>
            <ToggleButton value='list'>
              <i className='ri-list-check' />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Loading State */}
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Error State */}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Sessions List */}
        {!isLoading && filteredSessions.length === 0 ? (
          <BrandedEmptyState
            icon={<i className='ri-calendar-schedule-line' style={{ fontSize: 48 }} />}
            title='No Sessions Yet'
            description='Create your first session to allow clients to book pre-defined time slots.'
            action={{
              label: 'Create Session',
              onClick: () => {
                setEditingSession(null)
                setIsEditorOpen(true)
              }
            }}
          />
        ) : (
          <Grid container spacing={2}>
            {filteredSessions.map(renderSessionCard)}
          </Grid>
        )}

        {/* FAB for adding new session */}
        {filteredSessions.length > 0 && (
          <Fab
            color='primary'
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
            onClick={() => {
              setEditingSession(null)
              setIsEditorOpen(true)
            }}
          >
            <i className='ri-add-line' style={{ fontSize: 24 }} />
          </Fab>
        )}
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 3, minHeight: 400 }}>
      {/* Info Banner */}
      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='body2'>
          <strong>Sessions</strong> are pre-defined time slots for STATIC booking mode resources. Clients can join
          available sessions instead of booking flexible time slots. Ideal for classes, group activities, and recurring
          appointments.
        </Typography>
      </Alert>

      {/* Navigation Views */}
      {navigationView === 'branch-selection' && renderBranchSelection()}
      {navigationView === 'resource-selection' && renderResourceSelection()}
      {navigationView === 'session-management' && renderSessionManagement()}

      {/* Session Editor Drawer */}
      <SessionEditorDrawer
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setEditingSession(null)
        }}
        session={editingSession}
        resources={staticResources}
        services={apiServices.map(s => ({ id: s.id, name: s.name, duration: s.duration }))}
        onSave={handleSaveSession}
        selectedResourceId={selectedResourceId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the session "{sessionToDelete?.name}"? This action cannot be undone and may
            affect existing bookings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSession} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
