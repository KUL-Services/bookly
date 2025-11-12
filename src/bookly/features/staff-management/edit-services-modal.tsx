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
  Divider
} from '@mui/material'
import { mockServices, categories } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'

interface EditServicesModalProps {
  open: boolean
  onClose: () => void
  staffId: string
  staffName: string
}

export function EditServicesModal({
  open,
  onClose,
  staffId,
  staffName
}: EditServicesModalProps) {
  const { getStaffServices, assignServicesToStaff } = useStaffManagementStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>(() =>
    getStaffServices(staffId)
  )

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
  }

  const handleSelectAll = () => {
    setSelectedServices(filteredServices.map(s => s.id))
  }

  const handleClearSelection = () => {
    setSelectedServices([])
  }

  const handleSave = () => {
    assignServicesToStaff(staffId, selectedServices)
    onClose()
  }

  const handleCancel = () => {
    // Reset to original selection
    setSelectedServices(getStaffServices(staffId))
    onClose()
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
            Edit Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign services for {staffName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
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
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAll}
              startIcon={<i className="ri-check-double-line" />}
            >
              Select All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleClearSelection}
              startIcon={<i className="ri-close-line" />}
            >
              Clear Selection
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              label={`${selectedServices.length} selected`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        {/* Services by Category */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {Object.keys(servicesByCategory).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <i className="ri-search-line" style={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                No services found
              </Typography>
              <Typography variant="body2">
                Try a different search term
              </Typography>
            </Box>
          ) : (
            Object.entries(servicesByCategory).map(([categoryName, services]) => {
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
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          if (allSelected) {
                            setSelectedServices(prev =>
                              prev.filter(id => !services.map(s => s.id).includes(id))
                            )
                          } else {
                            setSelectedServices(prev => [
                              ...prev.filter(id => !services.map(s => s.id).includes(id)),
                              ...services.map(s => s.id)
                            ])
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
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
                      {services.map((service) => (
                        <FormControlLabel
                          key={service.id}
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
                              bgcolor: 'action.hover'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )
            })
          )}
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
