'use client'

import { useState } from 'react'
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
  Chip
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

  const {
    categories,
    services,
    selectedCategoryId,
    searchQuery,
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

  const filteredServices = getFilteredServices()
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const selectedService = services.find(s => s.id === selectedServiceId)

  // Count uncategorized services
  const uncategorizedCount = services.filter(s => !s.categoryId).length

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

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown'
  }

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

        {/* Categories */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ textTransform: 'uppercase' }}>
              Categories
            </Typography>
            <IconButton size='small' onClick={() => openCategoryDialog()}>
              <i className='ri-add-line' style={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label='All'
              size='small'
              onClick={() => setSelectedCategory(null)}
              color={selectedCategoryId === null ? 'primary' : 'default'}
              variant={selectedCategoryId === null ? 'filled' : 'outlined'}
            />
            <Chip
              label={`Uncategorized (${uncategorizedCount})`}
              size='small'
              onClick={() => setSelectedCategory('uncategorized')}
              color={selectedCategoryId === 'uncategorized' ? 'primary' : 'default'}
              variant={selectedCategoryId === 'uncategorized' ? 'filled' : 'outlined'}
            />
            {categories.map(category => {
              const count = services.filter(s => s.categoryId === category.id).length
              return (
                <Chip
                  key={category.id}
                  label={`${category.name} (${count})`}
                  size='small'
                  onClick={() => setSelectedCategory(category.id)}
                  color={selectedCategoryId === category.id ? 'primary' : 'default'}
                  variant={selectedCategoryId === category.id ? 'filled' : 'outlined'}
                />
              )
            })}
          </Box>
        </Box>

        {/* Services List */}
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          {filteredServices.length === 0 ? (
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
                        ${service.price}
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
                      ${selectedService.price.toFixed(2)}
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
              <Tab label='Details' />
              <Tab label='Settings' />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* Details Tab */}
            <TabPanel value={currentTab} index={0}>
              <Box sx={{ px: 3 }}>
                {selectedService.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {selectedService.description}
                    </Typography>
                  </Box>
                )}

                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                  Service Information
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Category
                    </Typography>
                    <Typography variant='body1'>{getCategoryName(selectedService.categoryId)}</Typography>
                  </Paper>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Parallel Clients
                    </Typography>
                    <Typography variant='body1'>{selectedService.parallelClients || 1}</Typography>
                  </Paper>
                </Box>
              </Box>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={currentTab} index={1}>
              <Box sx={{ px: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
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
                  {selectedService.processingTime && (
                    <Paper variant='outlined' sx={{ p: 2 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Processing Time
                      </Typography>
                      <Typography variant='body1'>
                        {(selectedService.processingTime.during.hours > 0 || selectedService.processingTime.during.minutes > 0)
                          ? `During: ${selectedService.processingTime.during.hours}h ${selectedService.processingTime.during.minutes}min`
                          : (selectedService.processingTime.after.hours > 0 || selectedService.processingTime.after.minutes > 0)
                            ? `After: ${selectedService.processingTime.after.hours}h ${selectedService.processingTime.after.minutes}min`
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
                        {selectedService.taxRate !== 'tax_free' ? `${selectedService.taxRate}%` : 'Tax Free'}
                      </Typography>
                    </Paper>
                  )}
                </Box>

                {selectedService.clientSettings && (
                  <Box sx={{ mt: 3 }}>
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
                    {selectedService.clientSettings.questions && selectedService.clientSettings.questions.length > 0 && (
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

      {/* Delete Confirmation Dialog */}
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
