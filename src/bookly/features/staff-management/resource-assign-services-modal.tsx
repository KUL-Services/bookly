'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Typography,
  Chip,
  Alert,
  Tooltip
} from '@mui/material'
import { mockServices, categories } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'

interface ResourceAssignServicesModalProps {
  open: boolean
  onClose: () => void
  resourceId: string
  resourceName: string
}

export function ResourceAssignServicesModal({
  open,
  onClose,
  resourceId,
  resourceName
}: ResourceAssignServicesModalProps) {
  const {
    getResourceServices,
    assignServicesToResource,
    isServiceAssigned,
    getResourceForService,
    resources,
    rooms
  } = useStaffManagementStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>(() =>
    getResourceServices(resourceId)
  )
  const [conflicts, setConflicts] = useState<string[]>([])

  // Filter services by search
  const filteredServices = useMemo(() => {
    return mockServices.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, typeof mockServices> = {}

    filteredServices.forEach(service => {
      if (!grouped[service.category]) {
        grouped[service.category] = []
      }
      grouped[service.category].push(service)
    })

    return grouped
  }, [filteredServices])

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
    // Clear conflicts when user changes selection
    setConflicts([])
  }

  const handleSave = () => {
    const result = assignServicesToResource(resourceId, selectedServices)

    if (!result.success && result.conflicts) {
      setConflicts(result.conflicts)
      return
    }

    onClose()
  }

  const handleCancel = () => {
    setSelectedServices(getResourceServices(resourceId))
    setConflicts([])
    onClose()
  }

  const isServiceInConflict = (serviceId: string) => {
    return isServiceAssigned(serviceId) && getResourceForService(serviceId) !== resourceId
  }

  const getConflictResourceName = (serviceId: string) => {
    const assignedResourceId = getResourceForService(serviceId)
    if (!assignedResourceId) return ''

    const resource = resources.find(r => r.id === assignedResourceId)
    if (resource) return resource.name

    const room = rooms.find(r => r.id === assignedResourceId)
    if (room) return room.name

    return 'Unknown'
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Assign Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign services to {resourceName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Conflict Alert */}
        {conflicts.length > 0 && (
          <Alert severity="error" sx={{ m: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Service Assignment Conflict
            </Typography>
            <Typography variant="body2">
              The following services are already assigned to other resources:
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
              {conflicts.map(serviceId => {
                const service = mockServices.find(s => s.id === serviceId)
                return (
                  <li key={serviceId}>
                    {service?.name} (assigned to {getConflictResourceName(serviceId)})
                  </li>
                )
              })}
            </Box>
          </Alert>
        )}

        {/* Search & Actions Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${selectedServices.length} selected`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        {/* Services by Category */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {Object.entries(servicesByCategory).map(([categoryName, services]) => {
            const categoryInfo = categories.find(c => c.name === categoryName)
            const allSelected = services.every(s => selectedServices.includes(s.id))
            const someSelected = services.some(s => selectedServices.includes(s.id))

            return (
              <Accordion
                key={categoryName}
                defaultExpanded
                sx={{ mb: 1, '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {categoryInfo?.icon} {categoryName}
                    </Typography>
                    <Chip
                      size="small"
                      label={services.length}
                      sx={{ ml: 'auto', mr: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {services.map((service) => {
                      const inConflict = isServiceInConflict(service.id)
                      const isDisabled = inConflict

                      return (
                        <Tooltip
                          key={service.id}
                          title={inConflict ? `Already assigned to ${getConflictResourceName(service.id)}` : ''}
                          placement="top"
                        >
                          <FormControlLabel
                            disabled={isDisabled}
                            control={
                              <Checkbox
                                checked={selectedServices.includes(service.id)}
                                onChange={() => handleToggleService(service.id)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {service.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {service.duration} min • ${service.price}
                                    {inConflict && (
                                      <Chip
                                        size="small"
                                        label={`Assigned to ${getConflictResourceName(service.id)}`}
                                        color="error"
                                        sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                                      />
                                    )}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{
                              ml: 0,
                              mr: 0,
                              py: 0.5,
                              px: 2,
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: isDisabled ? 'transparent' : 'action.hover'
                              },
                              opacity: isDisabled ? 0.5 : 1
                            }}
                          />
                        </Tooltip>
                      )
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" autoFocus>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
