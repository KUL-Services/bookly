'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  Fab,
  CircularProgress,
  Alert
} from '@mui/material'
import { useServicesStore } from '@/bookly/features/services/services-store'
import { ServiceEditorDrawer } from '@/bookly/features/services/service-editor-drawer'
import { CategoryDialog } from '@/bookly/features/services/category-dialog'
import type { ExtendedService } from '@/bookly/features/services/types'

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

// Helper to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}min`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}min`
  }
}

export function ServicesTab() {
  const [currentTab, setCurrentTab] = useState(0)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<ExtendedService | null>(null)

  // Category context menu state
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState<string | null>(null)
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const {
    categories,
    services,
    isLoading,
    error,
    selectedCategoryId,
    searchQuery,
    fetchServices,
    fetchCategories,
    getFilteredServices,
    setSelectedCategory,
    setSearchQuery,
    openServiceDialog,
    openCategoryDialog,
    deleteService,
    deleteCategory,
    isServiceDialogOpen,
    isCategoryDialogOpen
  } = useServicesStore()

  useEffect(() => {
    const load = async () => {
      await fetchServices()
      await fetchCategories()
    }
    load()
  }, [])

  const filteredServices = getFilteredServices()
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const selectedService = services.find(s => s.id === selectedServiceId)

  // Count uncategorized services
  const uncategorizedCount = services.filter(s => !s.categoryId).length
  const categoryServiceCounts = useMemo(() => {
    const counts = new Map<string, number>()
    services.forEach(service => {
      if (!service.categoryId) return
      counts.set(service.categoryId, (counts.get(service.categoryId) || 0) + 1)
    })
    return counts
  }, [services])

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(event.currentTarget)
  }

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null)
  }

  const handleMenuAction = (action: 'edit' | 'delete') => {
    handleCloseActionMenu()
    if (!selectedService) return

    switch (action) {
      case 'edit':
        openServiceDialog(selectedService)
        break
      case 'delete':
        setServiceToDelete(selectedService)
        setDeleteDialogOpen(true)
        break
    }
  }

  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id)
      if (selectedServiceId === serviceToDelete.id) {
        setSelectedServiceId(null)
      }
    }
    setDeleteDialogOpen(false)
    setServiceToDelete(null)
  }

  const getDisplayCategoryName = (name?: string) => {
    if (!name) return 'Other'
    return name.trim().toLowerCase() === 'uncategorized' ? 'Other' : name
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Other'
    const category = categories.find(c => c.id === categoryId)
    return getDisplayCategoryName(category?.name || 'Unknown')
  }

  // Category context menu handlers
  const handleCategoryContextMenu = (event: React.MouseEvent<HTMLElement>, categoryId: string) => {
    event.preventDefault()
    event.stopPropagation()
    setCategoryMenuAnchor(event.currentTarget)
    setSelectedCategoryForMenu(categoryId)
  }

  const handleCloseCategoryMenu = () => {
    setCategoryMenuAnchor(null)
    setSelectedCategoryForMenu(null)
  }

  const handleEditCategory = () => {
    if (selectedCategoryForMenu) {
      const category = categories.find(c => c.id === selectedCategoryForMenu)
      if (category) {
        openCategoryDialog(category)
      }
    }
    handleCloseCategoryMenu()
  }

  const handleDeleteCategoryClick = () => {
    if (selectedCategoryForMenu) {
      setCategoryToDelete(selectedCategoryForMenu)
      setDeleteCategoryDialogOpen(true)
    }
    handleCloseCategoryMenu()
  }

  const handleDeleteCategoryConfirm = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete)
      if (selectedCategoryId === categoryToDelete) {
        setSelectedCategory(null)
      }
    }
    setDeleteCategoryDialogOpen(false)
    setCategoryToDelete(null)
  }

  // Get info for category being deleted
  const categoryBeingDeleted = categoryToDelete ? categories.find(c => c.id === categoryToDelete) : null
  const servicesInCategoryToDelete = categoryToDelete
    ? services.filter(s => s.categoryId === categoryToDelete).length
    : 0

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
      {/* Left Sidebar - Categories & Services List */}
      <Paper
        elevation={0}
        sx={{
          width: 320,
          flexShrink: 0,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <TextField
            fullWidth
            size='small'
            placeholder='Search services...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Categories - Stable vertical list */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', maxHeight: 260, overflow: 'auto', py: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 0.5, pb: 1 }}>
            <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ textTransform: 'uppercase' }}>
              Categories
            </Typography>
            <IconButton size='small' onClick={() => openCategoryDialog()}>
              <i className='ri-add-line' style={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <List disablePadding sx={{ px: 1 }}>
            <ListItemButton
              selected={selectedCategoryId === null}
              onClick={() => setSelectedCategory(null)}
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'primary.dark'
                },
                '&.Mui-selected .MuiTypography-root': {
                  color: 'inherit'
                }
              }}
            >
              <ListItemText
                primary='All Services'
                secondary={`${services.length} services`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: selectedCategoryId === null ? 700 : 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Box
                className='category-count'
                sx={{
                  minWidth: 26,
                  px: 0.75,
                  py: 0.125,
                  borderRadius: 10,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: selectedCategoryId === null ? 'rgba(255,255,255,0.2)' : 'action.selected',
                  color: selectedCategoryId === null ? '#fff' : 'text.secondary'
                }}
              >
                {services.length}
              </Box>
            </ListItemButton>
            <ListItemButton
              selected={selectedCategoryId === 'uncategorized'}
              onClick={() => setSelectedCategory('uncategorized')}
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'primary.dark'
                },
                '&.Mui-selected .MuiTypography-root': {
                  color: 'inherit'
                }
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled', mr: 1.5, flexShrink: 0 }} />
              <ListItemText
                primary='Other'
                secondary={`${uncategorizedCount} service${uncategorizedCount === 1 ? '' : 's'}`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: selectedCategoryId === 'uncategorized' ? 700 : 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Box
                className='category-count'
                sx={{
                  minWidth: 26,
                  px: 0.75,
                  py: 0.125,
                  borderRadius: 10,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: selectedCategoryId === 'uncategorized' ? 'rgba(255,255,255,0.2)' : 'action.selected',
                  color: selectedCategoryId === 'uncategorized' ? '#fff' : 'text.secondary'
                }}
              >
                {uncategorizedCount}
              </Box>
            </ListItemButton>
            {categories.map(category => {
              const count = categoryServiceCounts.get(category.id) || 0
              const isSelected = selectedCategoryId === category.id
              return (
                <ListItemButton
                  key={category.id}
                  selected={isSelected}
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    mb: 0.5,
                    '& .category-actions': { opacity: 0, transition: 'opacity 0.15s ease' },
                    '&:hover .category-actions': { opacity: 1 },
                    '&.Mui-selected .category-actions': { opacity: 1 },
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText'
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'primary.dark'
                    },
                    '&.Mui-selected .MuiTypography-root': {
                      color: 'inherit'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: category.color || 'primary.main',
                      mr: 1.5,
                      flexShrink: 0
                    }}
                  />
                  <ListItemText
                    primary={getDisplayCategoryName(category.name)}
                    secondary={`${count} service${count === 1 ? '' : 's'}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 700 : 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Box
                    className='category-count'
                    sx={{
                      minWidth: 26,
                      px: 0.75,
                      py: 0.125,
                      borderRadius: 10,
                      textAlign: 'center',
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'action.selected',
                      color: isSelected ? '#fff' : 'text.secondary'
                    }}
                  >
                    {count}
                  </Box>
                  <Box className='category-actions' sx={{ display: 'flex', gap: 0.25, ml: 0.5 }}>
                    <IconButton
                      size='small'
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        openCategoryDialog(category)
                      }}
                      sx={{
                        p: 0.25,
                        color: isSelected ? 'rgba(255,255,255,0.92)' : 'text.secondary'
                      }}
                    >
                      <i className='ri-edit-line' style={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        setCategoryToDelete(category.id)
                        setDeleteCategoryDialogOpen(true)
                      }}
                      sx={{
                        p: 0.25,
                        color: isSelected ? 'rgba(255,255,255,0.92)' : 'text.secondary',
                        '&:hover': { color: 'error.main' }
                      }}
                    >
                      <i className='ri-close-line' style={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </ListItemButton>
              )
            })}
          </List>
        </Box>

        {/* Services List */}
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {error && (
            <Alert severity='error' sx={{ m: 1 }}>
              {error}
            </Alert>
          )}
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={28} />
              <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
                Loading services...
              </Typography>
            </Box>
          ) : filteredServices.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <i className='ri-service-line' style={{ fontSize: 40, opacity: 0.3 }} />
              <Typography variant='body2' sx={{ mt: 1 }}>
                No services found
              </Typography>
            </Box>
          ) : (
            filteredServices.map(service => (
              <ListItemButton
                key={service.id}
                selected={selectedServiceId === service.id}
                onClick={() => setSelectedServiceId(service.id)}
                sx={{
                  borderLeft: 3,
                  borderColor: selectedServiceId === service.id ? 'primary.main' : 'transparent',
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: service.color || '#ccc',
                    mr: 2,
                    flexShrink: 0
                  }}
                />
                <ListItemText
                  primary={service.name}
                  secondary={
                    <Box component='span' sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant='caption'>{formatDuration(service.duration)}</Typography>
                      <Typography variant='caption'>•</Typography>
                      <Typography variant='caption' fontWeight={500}>
                        EGP {service.price}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      {/* Right Panel - Service Details */}
      {selectedService ? (
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 64,
                  borderRadius: 1,
                  bgcolor: selectedService.color || '#ccc',
                  flexShrink: 0
                }}
              />

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant='h5' fontWeight={600}>
                  {selectedService.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {getCategoryName(selectedService.categoryId)}
                </Typography>

                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Duration
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {formatDuration(selectedService.duration)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Price
                    </Typography>
                    <Typography variant='body1' fontWeight={500} color='primary'>
                      EGP {selectedService.price.toFixed(2)}
                    </Typography>
                  </Box>
                  {selectedService.taxRate && selectedService.taxRate !== 'tax_free' && (
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Tax Rate
                      </Typography>
                      <Typography variant='body1' fontWeight={500}>
                        {selectedService.taxRate}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Action Menu */}
              <IconButton onClick={handleOpenActionMenu}>
                <i className='ri-more-2-fill' />
              </IconButton>

              <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleCloseActionMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => handleMenuAction('edit')}>
                  <i className='ri-edit-line' style={{ marginRight: 8 }} />
                  Edit Service
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                  <i className='ri-delete-bin-line' style={{ marginRight: 8 }} />
                  Delete Service
                </MenuItem>
              </Menu>
            </Box>

            {/* Tabs */}
            <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mt: 3 }}>
              <Tab label='General Details' />
              <Tab label='Staff & Rooms' />
              <Tab label='Resources' />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* General Details Tab */}
            <TabPanel value={currentTab} index={0}>
              <Box sx={{ px: 3 }}>
                {/* Main Details */}
                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                  Main Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Service Name
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>{selectedService.name}</Typography>
                  </Paper>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Category
                    </Typography>
                    <Typography variant='body1'>{getCategoryName(selectedService.categoryId)}</Typography>
                  </Paper>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Price
                    </Typography>
                    <Typography variant='body1' fontWeight={500} color='primary'>
                      EGP {selectedService.price.toFixed(2)}
                    </Typography>
                  </Paper>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Duration
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {formatDuration(selectedService.duration)}
                    </Typography>
                  </Paper>
                </Box>

                {/* Booking Settings */}
                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                  Booking Settings
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                  {selectedService.bookingInterval && (
                    <Paper variant='outlined' sx={{ p: 2 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Booking Interval
                      </Typography>
                      <Typography variant='body1'>
                        {selectedService.bookingInterval.hours > 0 || selectedService.bookingInterval.minutes > 0
                          ? `${selectedService.bookingInterval.hours}h ${selectedService.bookingInterval.minutes}min`
                          : 'Not set'}
                      </Typography>
                    </Paper>
                  )}
                  {selectedService.paddingTime && (
                    <Paper variant='outlined' sx={{ p: 2 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Padding Time
                      </Typography>
                      <Typography variant='body1'>
                        {selectedService.paddingTime.rule !== 'none'
                          ? `${selectedService.paddingTime.minutes}min ${selectedService.paddingTime.rule.replace('_', ' ')}`
                          : 'Not set'}
                      </Typography>
                    </Paper>
                  )}
                  {selectedService.taxRate && (
                    <Paper variant='outlined' sx={{ p: 2 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Tax Rate
                      </Typography>
                      <Typography variant='body1'>
                        {selectedService.taxRate === 'custom'
                          ? `${selectedService.customTaxRate || 0}%`
                          : selectedService.taxRate !== 'tax_free'
                            ? `${selectedService.taxRate}%`
                            : 'Tax Free'}
                      </Typography>
                    </Paper>
                  )}
                </Box>

                {/* Additional Details */}
                {(selectedService.description || selectedService.color) && (
                  <>
                    <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                      Additional Details
                    </Typography>
                    {selectedService.description && (
                      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Description
                        </Typography>
                        <Typography variant='body2'>{selectedService.description}</Typography>
                      </Paper>
                    )}
                    {selectedService.color && (
                      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
                        <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>
                          Color
                        </Typography>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: selectedService.color,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                      </Paper>
                    )}
                  </>
                )}

                {/* Client Settings */}
                {selectedService.clientSettings && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                      Client Settings
                    </Typography>
                    {selectedService.clientSettings.message && (
                      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Message to Client
                        </Typography>
                        <Typography variant='body2'>{selectedService.clientSettings.message}</Typography>
                      </Paper>
                    )}
                    {selectedService.clientSettings.questions &&
                      selectedService.clientSettings.questions.length > 0 && (
                        <Paper variant='outlined' sx={{ p: 2 }}>
                          <Typography variant='caption' color='text.secondary'>
                            Client Questions
                          </Typography>
                          <Typography variant='body1'>
                            {selectedService.clientSettings.questions.length} question(s)
                          </Typography>
                        </Paper>
                      )}
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Staff & Rooms Tab */}
            <TabPanel value={currentTab} index={1}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <i className='ri-team-line' style={{ fontSize: 48, opacity: 0.3 }} />
                  <Typography variant='body1' sx={{ mt: 2, mb: 1 }}>
                    Staff & Room Assignments
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Manage which staff members and rooms are assigned to this service.
                  </Typography>
                  <Button
                    variant='outlined'
                    startIcon={<i className='ri-settings-3-line' />}
                    onClick={() => openServiceDialog(selectedService)}
                  >
                    Manage Assignments
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            {/* Resources Tab */}
            <TabPanel value={currentTab} index={2}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <i className='ri-archive-line' style={{ fontSize: 48, opacity: 0.3 }} />
                  <Typography variant='body1' sx={{ mt: 2, mb: 1 }}>
                    Resource Assignments
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    Manage resources (equipment, tools, etc.) assigned to this service.
                  </Typography>
                  <Button
                    variant='outlined'
                    startIcon={<i className='ri-settings-3-line' />}
                    onClick={() => openServiceDialog(selectedService)}
                  >
                    Manage Resources
                  </Button>
                </Box>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      ) : (
        // No service selected
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <i className='ri-service-line' style={{ fontSize: 64, opacity: 0.3 }} />
            <Typography variant='h6' sx={{ mt: 2 }}>
              Select a service
            </Typography>
            <Typography variant='body2'>Choose a service from the list to view details</Typography>
          </Box>
        </Paper>
      )}

      {/* Service Editor Drawer */}
      <ServiceEditorDrawer />

      {/* Category Dialog */}
      <CategoryDialog />

      {/* Delete Service Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{serviceToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Context Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={handleCloseCategoryMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleEditCategory}>
          <i className='ri-edit-line' style={{ marginRight: 8, fontSize: 16 }} />
          Edit Category
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteCategoryClick} sx={{ color: 'error.main' }}>
          <i className='ri-delete-bin-line' style={{ marginRight: 8, fontSize: 16 }} />
          Delete Category
        </MenuItem>
      </Menu>

      {/* Delete Category Confirmation Dialog */}
      <Dialog
        open={deleteCategoryDialogOpen}
        onClose={() => setDeleteCategoryDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>&quot;{getDisplayCategoryName(categoryBeingDeleted?.name)}&quot;</strong>?
            {servicesInCategoryToDelete > 0 && (
              <>
                <br />
                <br />
                <Typography component='span' color='warning.main' sx={{ fontWeight: 500 }}>
                  {servicesInCategoryToDelete} service{servicesInCategoryToDelete > 1 ? 's' : ''} will be moved to
                  &quot;Other&quot;.
                </Typography>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteCategoryDialogOpen(false)} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDeleteCategoryConfirm} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Add Button */}
      <Fab
        color='primary'
        onClick={() => openServiceDialog()}
        sx={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          zIndex: 1050,
          boxShadow: 4
        }}
      >
        <i className='ri-add-line' style={{ fontSize: 24 }} />
      </Fab>
    </Box>
  )
}
