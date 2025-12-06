'use client'

import { useState, useMemo } from 'react'
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
  DialogContentText
} from '@mui/material'
import { mockBranches } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { ResourceEditorDrawer } from './resource-editor-drawer'
import { ResourceAssignServicesModal } from './resource-assign-services-modal'
import type { Resource } from '../calendar/types'

type ViewMode = 'grid' | 'list'
type NavigationView = 'branch-selection' | 'resource-management'

export function ResourcesTab() {
  const [navigationView, setNavigationView] = useState<NavigationView>('branch-selection')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isAssignServicesOpen, setIsAssignServicesOpen] = useState(false)
  const [assigningResource, setAssigningResource] = useState<{ id: string; name: string } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<{ id: string; name: string } | null>(null)

  const { resources, deleteResource, getResourceServices } = useStaffManagementStore()

  // Filter resources for selected branch
  const filteredResources = useMemo(() => {
    if (!selectedBranchId) return []

    return resources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBranch = resource.branchId === selectedBranchId
      return matchesSearch && matchesBranch
    })
  }, [resources, searchQuery, selectedBranchId])

  // Get resource counts per branch
  const branchResourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mockBranches.forEach(branch => {
      counts[branch.id] = resources.filter(r => r.branchId === branch.id).length
    })
    return counts
  }, [resources])

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView)
    }
  }

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId)
    setNavigationView('resource-management')
    setSearchQuery('') // Reset search when entering branch
  }

  const handleBackToBranches = () => {
    setNavigationView('branch-selection')
    setSelectedBranchId(null)
    setSearchQuery('')
  }

  const handleAddResource = () => {
    setEditingResource(null)
    setIsEditorOpen(true)
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource)
    setIsEditorOpen(true)
  }

  const handleDeleteResource = (resource: { id: string; name: string }) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (resourceToDelete) {
      deleteResource(resourceToDelete.id)
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setResourceToDelete(null)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingResource(null)
  }

  const handleAssignServices = (resource: Resource) => {
    setAssigningResource({ id: resource.id, name: resource.name })
    setIsAssignServicesOpen(true)
  }

  const handleCloseAssignServices = () => {
    setIsAssignServicesOpen(false)
    setAssigningResource(null)
  }

  const getBranchName = (branchId: string) => {
    const branch = mockBranches.find(b => b.id === branchId)
    return branch?.name || 'Unknown Branch'
  }

  const selectedBranch = selectedBranchId ? mockBranches.find(b => b.id === selectedBranchId) : null

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Branch Selection View */}
      {navigationView === 'branch-selection' && (
        <>
          {/* Branch Selection Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant='h5' fontWeight={600} gutterBottom>
              Select a Branch
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Choose a branch to view and manage its resources
            </Typography>
          </Paper>

          {/* Branch Cards */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
              p: 3
            }}
          >
            <Grid container spacing={3}>
              {mockBranches.map(branch => (
                <Grid item xs={12} sm={6} md={4} key={branch.id}>
                  <Card
                    variant='outlined'
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: 'primary.main'
                      }
                    }}
                    onClick={() => handleSelectBranch(branch.id)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56
                          }}
                        >
                          <i className='ri-building-line' style={{ fontSize: 28 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant='h6' fontWeight={600}>
                            {branch.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {branch.address}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Chip
                          size='small'
                          icon={<i className='ri-door-line' />}
                          label={`${branchResourceCounts[branch.id] || 0} resources`}
                          color='primary'
                          variant='outlined'
                        />
                        <Chip
                          size='small'
                          icon={<i className='ri-map-pin-line' />}
                          label={branch.city}
                          variant='outlined'
                        />
                      </Box>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        fullWidth
                        variant='contained'
                        endIcon={<i className='ri-arrow-right-line' />}
                        onClick={() => handleSelectBranch(branch.id)}
                      >
                        View Resources
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}

      {/* Resource Management View */}
      {navigationView === 'resource-management' && selectedBranch && (
        <>
          {/* Header with Back Button */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Button
              variant='outlined'
              startIcon={<i className='ri-arrow-left-line' />}
              onClick={handleBackToBranches}
              sx={{ textTransform: 'none' }}
            >
              Back to All Branches
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-building-line' style={{ fontSize: 20, opacity: 0.6 }} />
              <Typography variant='h6' fontWeight={600}>
                {selectedBranch.name}
              </Typography>
            </Box>
          </Paper>

          {/* Resource Controls */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            {/* Search */}
            <TextField
              size='small'
              placeholder='Search resources...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line' />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
            />

            <Box sx={{ flexGrow: 1 }} />

            {/* View Toggle */}
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size='small'>
              <ToggleButton value='grid'>
                <i className='ri-grid-line' />
              </ToggleButton>
              <ToggleButton value='list'>
                <i className='ri-list-check' />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Results Count */}
            <Chip
              label={`${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''}`}
              variant='outlined'
            />
          </Paper>

          {/* Resources Content */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
              p: 3
            }}
          >
            {filteredResources.length === 0 ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <i className='ri-tools-line' style={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant='h6' sx={{ mt: 2 }}>
                    No resources found
                  </Typography>
                  <Typography variant='body2'>
                    {searchQuery ? 'Try adjusting your search' : `Add your first equipment to ${selectedBranch.name}`}
                  </Typography>
                  {!searchQuery && (
                    <Button
                      variant='contained'
                      startIcon={<i className='ri-add-line' />}
                      onClick={handleAddResource}
                      sx={{ mt: 3 }}
                    >
                      Add Resource
                    </Button>
                  )}
                </Box>
              </Box>
            ) : viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredResources.map(resource => (
                  <Grid item xs={12} sm={6} md={4} key={resource.id}>
                    <Card
                      variant='outlined'
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              width: 48,
                              height: 48
                            }}
                          >
                            <i className='ri-tools-line' />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant='h6' fontWeight={600}>
                              {resource.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {selectedBranch.name}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            size='small'
                            icon={<i className='ri-group-line' />}
                            label={`${resource.capacity} capacity`}
                            variant='outlined'
                          />
                          <Chip
                            size='small'
                            icon={<i className='ri-service-line' />}
                            label={`${getResourceServices(resource.id).length} services`}
                            color='primary'
                            variant='outlined'
                          />
                        </Box>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Button
                          size='small'
                          startIcon={<i className='ri-service-line' />}
                          onClick={() => handleAssignServices(resource)}
                        >
                          Services
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size='small'
                            startIcon={<i className='ri-edit-line' />}
                            onClick={() => handleEditResource(resource)}
                          >
                            Edit
                          </Button>
                          <IconButton size='small' color='error' onClick={() => handleDeleteResource({ id: resource.id, name: resource.name })}>
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredResources.map(resource => (
                  <Paper
                    key={resource.id}
                    variant='outlined'
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40
                      }}
                    >
                      <i className='ri-tools-line' />
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant='subtitle1' fontWeight={600}>
                        {resource.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {selectedBranch.name}
                      </Typography>
                    </Box>

                    <Chip
                      size='small'
                      icon={<i className='ri-group-line' />}
                      label={`${resource.capacity} capacity`}
                      variant='outlined'
                    />

                    <Chip
                      size='small'
                      icon={<i className='ri-service-line' />}
                      label={`${getResourceServices(resource.id).length} services`}
                      color='primary'
                      variant='outlined'
                    />

                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<i className='ri-service-line' />}
                      onClick={() => handleAssignServices(resource)}
                    >
                      Services
                    </Button>

                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<i className='ri-edit-line' />}
                      onClick={() => handleEditResource(resource)}
                    >
                      Edit
                    </Button>

                    <IconButton size='small' color='error' onClick={() => handleDeleteResource({ id: resource.id, name: resource.name })}>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>

          {/* Add Resource FAB - only in resource management view */}
          <Fab
            color='primary'
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24
            }}
            onClick={handleAddResource}
          >
            <i className='ri-add-line' />
          </Fab>
        </>
      )}

      {/* Resource Editor Drawer */}
      <ResourceEditorDrawer
        open={isEditorOpen}
        onClose={handleCloseEditor}
        resource={editingResource}
        selectedBranchId={selectedBranchId}
      />

      {/* Resource Assign Services Modal */}
      {assigningResource && (
        <ResourceAssignServicesModal
          open={isAssignServicesOpen}
          onClose={handleCloseAssignServices}
          resourceId={assigningResource.id}
          resourceName={assigningResource.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{resourceToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
