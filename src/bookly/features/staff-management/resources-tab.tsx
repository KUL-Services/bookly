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
  Avatar
} from '@mui/material'
import { mockBranches } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { ResourceEditorDrawer } from './resource-editor-drawer'
import type { Resource } from '../calendar/types'

type ViewMode = 'grid' | 'list'

export function ResourcesTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)

  const { resources, deleteResource, openResourceEditor, closeResourceEditor } = useStaffManagementStore()

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesBranch = selectedBranchId === 'all' || resource.branchId === selectedBranchId
      return matchesSearch && matchesBranch
    })
  }, [resources, searchQuery, selectedBranchId])

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView)
    }
  }

  const handleAddResource = () => {
    setEditingResource(null)
    setIsEditorOpen(true)
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource)
    setIsEditorOpen(true)
  }

  const handleDeleteResource = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingResource(null)
  }

  const getBranchName = (branchId: string) => {
    const branch = mockBranches.find(b => b.id === branchId)
    return branch?.name || 'Unknown Branch'
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header Controls */}
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
          size="small"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="ri-search-line" />
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />

        {/* Branch Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Branch</InputLabel>
          <Select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            label="Branch"
          >
            <MenuItem value="all">All Branches</MenuItem>
            {mockBranches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        {/* View Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="grid">
            <i className="ri-grid-line" />
          </ToggleButton>
          <ToggleButton value="list">
            <i className="ri-list-check" />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Results Count */}
        <Chip
          label={`${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''}`}
          variant="outlined"
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
              <i className="ri-door-line" style={{ fontSize: 64, opacity: 0.3 }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                No resources found
              </Typography>
              <Typography variant="body2">
                {searchQuery || selectedBranchId !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first room or facility'}
              </Typography>
              {!searchQuery && selectedBranchId === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<i className="ri-add-line" />}
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
            {filteredResources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card
                  variant="outlined"
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
                          bgcolor: resource.color || 'primary.main',
                          width: 48,
                          height: 48
                        }}
                      >
                        <i className="ri-door-line" />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {resource.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getBranchName(resource.branchId)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        size="small"
                        icon={<i className="ri-group-line" />}
                        label={`${resource.capacity} capacity`}
                        variant="outlined"
                      />
                      {resource.floor && (
                        <Chip
                          size="small"
                          label={resource.floor}
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {resource.amenities.slice(0, 4).map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                      {resource.amenities.length > 4 && (
                        <Chip
                          label={`+${resource.amenities.length - 4}`}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<i className="ri-edit-line" />}
                      onClick={() => handleEditResource(resource)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <i className="ri-delete-bin-line" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredResources.map((resource) => (
              <Paper
                key={resource.id}
                variant="outlined"
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
                    bgcolor: resource.color || 'primary.main',
                    width: 40,
                    height: 40
                  }}
                >
                  <i className="ri-door-line" />
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {resource.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getBranchName(resource.branchId)}
                    {resource.floor && ` • ${resource.floor}`}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  icon={<i className="ri-group-line" />}
                  label={`${resource.capacity} capacity`}
                  variant="outlined"
                />

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {resource.amenities.slice(0, 3).map((amenity) => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                  {resource.amenities.length > 3 && (
                    <Chip
                      label={`+${resource.amenities.length - 3}`}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<i className="ri-edit-line" />}
                  onClick={() => handleEditResource(resource)}
                >
                  Edit
                </Button>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteResource(resource.id)}
                >
                  <i className="ri-delete-bin-line" />
                </IconButton>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Add Resource FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24
        }}
        onClick={handleAddResource}
      >
        <i className="ri-add-line" />
      </Fab>

      {/* Resource Editor Drawer */}
      <ResourceEditorDrawer
        open={isEditorOpen}
        onClose={handleCloseEditor}
        resource={editingResource}
      />
    </Box>
  )
}
