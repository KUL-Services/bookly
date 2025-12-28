'use client'

import { useState, useRef } from 'react'
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  Divider,
  Menu,
  MenuItem
} from '@mui/material'
import { useServicesStore } from './services-store'
import { ServicesFAB } from './services-fab'
import { CategoryDialog } from './category-dialog'
import { ServiceEditorDrawer } from './service-editor-drawer'

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

export function ServicesManagement() {
  const {
    categories,
    services,
    selectedCategoryId,
    searchQuery,
    selectedServiceId,
    getFilteredServices,
    setSelectedCategory,
    setSearchQuery,
    setSelectedService,
    openServiceDialog,
    openCategoryDialog,
    deleteCategory,
    deleteService,
    reorderCategories,
    isServiceDialogOpen,
    isCategoryDialogOpen,
    editingService,
    editingCategory,
    closeServiceDialog,
    closeCategoryDialog
  } = useServicesStore()

  // Context menu for categories
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState<string | null>(null)

  // Context menu for services
  const [serviceMenuAnchor, setServiceMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedServiceForMenu, setSelectedServiceForMenu] = useState<string | null>(null)

  // Drag and drop state - use refs for values needed in event handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const draggedIndexRef = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)

  const filteredServices = getFilteredServices()

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    draggedIndexRef.current = index
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndexRef.current !== null && draggedIndexRef.current !== index) {
      dragOverIndexRef.current = index
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    // Perform reorder if we have valid indices
    if (draggedIndexRef.current !== null && dragOverIndexRef.current !== null && draggedIndexRef.current !== dragOverIndexRef.current) {
      reorderCategories(draggedIndexRef.current, dragOverIndexRef.current)
    }

    // Reset state
    draggedIndexRef.current = null
    dragOverIndexRef.current = null
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Count uncategorized services
  const uncategorizedCount = services.filter(s => !s.categoryId).length

  const handleCategoryContextMenu = (event: React.MouseEvent, categoryId: string) => {
    event.preventDefault()
    event.stopPropagation()
    setCategoryMenuAnchor(event.currentTarget as HTMLElement)
    setSelectedCategoryForMenu(categoryId)
  }

  const handleServiceContextMenu = (event: React.MouseEvent, serviceId: string) => {
    event.preventDefault()
    event.stopPropagation()
    setServiceMenuAnchor(event.currentTarget as HTMLElement)
    setSelectedServiceForMenu(serviceId)
  }

  const handleEditCategory = () => {
    if (selectedCategoryForMenu) {
      const category = categories.find(c => c.id === selectedCategoryForMenu)
      if (category) {
        openCategoryDialog(category)
      }
    }
    setCategoryMenuAnchor(null)
    setSelectedCategoryForMenu(null)
  }

  const handleDeleteCategory = () => {
    if (selectedCategoryForMenu) {
      deleteCategory(selectedCategoryForMenu)
      if (selectedCategoryId === selectedCategoryForMenu) {
        setSelectedCategory(null)
      }
    }
    setCategoryMenuAnchor(null)
    setSelectedCategoryForMenu(null)
  }

  const handleEditService = () => {
    if (selectedServiceForMenu) {
      const service = services.find(s => s.id === selectedServiceForMenu)
      if (service) {
        openServiceDialog(service)
      }
    }
    setServiceMenuAnchor(null)
    setSelectedServiceForMenu(null)
  }

  const handleDeleteService = () => {
    if (selectedServiceForMenu) {
      deleteService(selectedServiceForMenu)
    }
    setServiceMenuAnchor(null)
    setSelectedServiceForMenu(null)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header with back button and search */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <IconButton size='small'>
          <i className='ri-arrow-left-line' style={{ fontSize: 20 }} />
        </IconButton>

        <Typography variant='h6' fontWeight={600} sx={{ flexGrow: 1 }}>
          Services & Combo Services
        </Typography>

        <TextField
          size='small'
          placeholder='Search in services...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='ri-search-line' style={{ color: 'var(--mui-palette-text-secondary)' }} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Categories sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
            {/* All Categories */}
            <ListItemButton
              selected={selectedCategoryId === null}
              onClick={() => setSelectedCategory(null)}
              sx={{
                py: 1.5,
                borderLeft: 3,
                borderColor: selectedCategoryId === null ? 'primary.main' : 'transparent'
              }}
            >
              <ListItemText
                primary='All Categories'
                primaryTypographyProps={{ fontWeight: selectedCategoryId === null ? 600 : 400 }}
              />
            </ListItemButton>

            {/* Not categorized */}
            <ListItemButton
              selected={selectedCategoryId === 'uncategorized'}
              onClick={() => setSelectedCategory('uncategorized')}
              sx={{
                py: 1.5,
                borderLeft: 3,
                borderColor: selectedCategoryId === 'uncategorized' ? 'primary.main' : 'transparent'
              }}
            >
              <ListItemText
                primary='Not categorized'
                primaryTypographyProps={{
                  fontWeight: selectedCategoryId === 'uncategorized' ? 600 : 400,
                  color: 'text.secondary'
                }}
                secondary={uncategorizedCount > 0 ? `${uncategorizedCount} services` : undefined}
              />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            {/* Category list */}
            {categories.map((category, index) => {
              const serviceCount = services.filter(s => s.categoryId === category.id).length
              const isDragging = draggedIndex === index
              const isDragOver = dragOverIndex === index

              return (
                <Box
                  key={category.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragEnter={e => handleDragEnter(e, index)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  sx={{
                    transition: 'background-color 0.2s',
                    bgcolor: isDragOver ? 'action.hover' : 'transparent',
                    borderTop: isDragOver && draggedIndex !== null && draggedIndex > index ? '2px solid' : 'none',
                    borderBottom: isDragOver && draggedIndex !== null && draggedIndex < index ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    opacity: isDragging ? 0.5 : 1
                  }}
                >
                  <ListItemButton
                    selected={selectedCategoryId === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    onContextMenu={e => handleCategoryContextMenu(e, category.id)}
                    sx={{
                      py: 1.5,
                      borderLeft: 3,
                      borderColor: selectedCategoryId === category.id ? 'primary.main' : 'transparent',
                      cursor: 'grab',
                      '&:active': { cursor: 'grabbing' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <i
                        className='ri-menu-line'
                        style={{
                          fontSize: 18,
                          color: 'var(--mui-palette-text-disabled)',
                          cursor: 'grab'
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={category.name}
                      primaryTypographyProps={{ fontWeight: selectedCategoryId === category.id ? 600 : 400 }}
                      secondary={serviceCount > 0 ? `${serviceCount} services` : undefined}
                    />
                    <i className='ri-arrow-right-s-line' style={{ color: 'var(--mui-palette-text-disabled)' }} />
                  </ListItemButton>
                </Box>
              )
            })}
          </List>
        </Paper>

        {/* Services list */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {filteredServices.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <i className='ri-service-line' style={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant='body1' sx={{ mt: 2 }}>
                No services found
              </Typography>
              <Typography variant='body2'>
                {searchQuery ? 'Try a different search term' : 'Create your first service to get started'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredServices.map(service => (
                <ListItem
                  key={service.id}
                  disablePadding
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemButton
                    onClick={() => openServiceDialog(service)}
                    onContextMenu={e => handleServiceContextMenu(e, service.id)}
                    sx={{ py: 2 }}
                  >
                    {/* Color indicator */}
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

                    {/* Service info */}
                    <ListItemText
                      primary={service.name}
                      primaryTypographyProps={{ fontWeight: 500 }}
                      sx={{ flexGrow: 1 }}
                    />

                    {/* Duration */}
                    <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80, textAlign: 'right' }}>
                      {formatDuration(service.duration)}
                    </Typography>

                    {/* Price */}
                    <Typography variant='body2' fontWeight={500} sx={{ minWidth: 70, textAlign: 'right', ml: 2 }}>
                      ${service.price.toFixed(2)}
                    </Typography>

                    {/* Arrow */}
                    <i
                      className='ri-arrow-right-s-line'
                      style={{ marginLeft: 8, color: 'var(--mui-palette-text-disabled)' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* FAB */}
      <ServicesFAB />

      {/* Category Dialog */}
      <CategoryDialog />

      {/* Service Editor Drawer */}
      <ServiceEditorDrawer />

      {/* Category Context Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => {
          setCategoryMenuAnchor(null)
          setSelectedCategoryForMenu(null)
        }}
      >
        <MenuItem onClick={handleEditCategory}>
          <ListItemIcon>
            <i className='ri-edit-line' style={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText>Edit Category</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteCategory} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <i className='ri-delete-bin-line' style={{ fontSize: 18, color: 'var(--mui-palette-error-main)' }} />
          </ListItemIcon>
          <ListItemText>Delete Category</ListItemText>
        </MenuItem>
      </Menu>

      {/* Service Context Menu */}
      <Menu
        anchorEl={serviceMenuAnchor}
        open={Boolean(serviceMenuAnchor)}
        onClose={() => {
          setServiceMenuAnchor(null)
          setSelectedServiceForMenu(null)
        }}
      >
        <MenuItem onClick={handleEditService}>
          <ListItemIcon>
            <i className='ri-edit-line' style={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText>Edit Service</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteService} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <i className='ri-delete-bin-line' style={{ fontSize: 18, color: 'var(--mui-palette-error-main)' }} />
          </ListItemIcon>
          <ListItemText>Delete Service</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}
