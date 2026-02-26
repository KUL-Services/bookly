'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Checkbox,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { useBranchesStore } from './branches-store'
import { useStaffManagementStore } from '@/bookly/features/staff-management/staff-store'
import type { BranchFormData, BranchWorkingHours } from './types'
import { DEFAULT_BRANCH_FORM_DATA } from './types'
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'
import GooglePlacesAutocomplete from '@/views/RegisterWizard/components/GooglePlacesAutocomplete'
import GoogleMapPicker from '@/views/RegisterWizard/components/GoogleMapPicker'

export function BranchEditorDrawer() {
  const {
    isBranchEditorOpen,
    editingBranch,
    closeBranchEditor,
    createBranch,
    updateBranch,
    availableServices,
    fetchServices,
    fetchBranches
  } = useBranchesStore()
  const { staffMembers, fetchStaffFromApi, updateStaffMember } = useStaffManagementStore()

  const [formData, setFormData] = useState<BranchFormData>(DEFAULT_BRANCH_FORM_DATA)
  const [currentSection, setCurrentSection] = useState<'info' | 'services' | 'staff' | 'hours'>('info')
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [isAssigningStaff, setIsAssigningStaff] = useState<string | null>(null) // Track which staff is being assigned

  // Fetch real services and staff when drawer opens
  useEffect(() => {
    if (isBranchEditorOpen) {
      if (availableServices.length === 0) {
        setIsLoadingServices(true)
        fetchServices().finally(() => setIsLoadingServices(false))
      }
      if (staffMembers.length === 0) {
        setIsLoadingStaff(true)
        fetchStaffFromApi().finally(() => setIsLoadingStaff(false))
      }
    }
  }, [isBranchEditorOpen, availableServices.length, staffMembers.length, fetchServices, fetchStaffFromApi])

  // Use real staff from API with their branch info
  const availableStaff = staffMembers.map(s => ({
    id: s.id,
    name: s.name,
    title: s.title || s.role || '',
    color: s.color || '#0a2c24',
    branchId: s.branchId || ''
  }))

  // Check if a staff member is assigned to this branch
  const isStaffAssignedToThisBranch = (staffBranchId: string) => {
    return editingBranch ? staffBranchId === editingBranch.id : false
  }

  // Handle staff assignment to this branch
  const handleToggleStaffAssignment = async (staffId: string, currentBranchId: string) => {
    if (!editingBranch) return

    setIsAssigningStaff(staffId)
    try {
      if (currentBranchId === editingBranch.id) {
        // Staff is already assigned to this branch - we can't unassign without selecting another branch
        // For now, show a message or do nothing
        console.log('Staff is already assigned to this branch')
      } else {
        // Assign staff to this branch
        await updateStaffMember(staffId, { branchId: editingBranch.id })
        // Refresh staff and branches data
        await fetchStaffFromApi()
        await fetchBranches()
      }
    } catch (err) {
      console.error('Failed to assign staff to branch:', err)
    } finally {
      setIsAssigningStaff(null)
    }
  }

  // Reset form when drawer opens/closes or editing branch changes
  useEffect(() => {
    if (isBranchEditorOpen) {
      if (editingBranch) {
        setFormData({
          name: editingBranch.name,
          address: editingBranch.address,
          city: editingBranch.city,
          country: editingBranch.country,
          mobile: editingBranch.mobile,
          email: editingBranch.email || '',
          serviceIds: editingBranch.services.map(s => s.id),
          staffIds: editingBranch.staff.map(s => s.id),
          galleryUrls: editingBranch.galleryUrls,
          workingHours: editingBranch.workingHours,
          isActive: editingBranch.isActive,
          latitude: editingBranch.latitude,
          longitude: editingBranch.longitude,
          formattedAddress: editingBranch.formattedAddress,
          placeId: editingBranch.placeId
        })
      } else {
        setFormData(DEFAULT_BRANCH_FORM_DATA)
      }
      setCurrentSection('info')
    }
  }, [isBranchEditorOpen, editingBranch])

  const handleSubmit = () => {
    if (!formData.name.trim()) return

    if (editingBranch) {
      updateBranch(editingBranch.id, formData)
    } else {
      createBranch(formData)
    }

    closeBranchEditor()
  }

  const handleClose = () => {
    closeBranchEditor()
  }

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }))
  }

  const toggleStaff = (staffId: string) => {
    setFormData(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter(id => id !== staffId)
        : [...prev.staffIds, staffId]
    }))
  }

  const updateWorkingHours = (day: string, field: keyof BranchWorkingHours, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(h => (h.day === day ? { ...h, [field]: value } : h))
    }))
  }

  const steps = [
    { id: 'info', label: 'Information', icon: 'ri-information-line' },
    { id: 'services', label: 'Services', icon: 'ri-service-line' },
    ...(editingBranch ? [{ id: 'staff', label: 'Staff', icon: 'ri-team-line' }] : []),
    { id: 'hours', label: 'Working Hours', icon: 'ri-time-line' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentSection)
  const isLastStep = currentStepIndex === steps.length - 1
  const isFirstStep = currentStepIndex === 0

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentSection(steps[currentStepIndex + 1].id as typeof currentSection)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentSection(steps[currentStepIndex - 1].id as typeof currentSection)
    }
  }

  const handleSelectAllServices = () => {
    const allIds = availableServices.map(s => s.id)
    const allSelected = allIds.every(id => formData.serviceIds.includes(id))
    setFormData(prev => ({
      ...prev,
      serviceIds: allSelected ? [] : allIds
    }))
  }

  return (
    <Dialog
      open={isBranchEditorOpen}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          height: 'min(90vh, 800px)',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2
        }}
      >
        <Box>
          <Typography variant='h6' fontWeight={600}>
            {editingBranch ? 'Edit Branch' : 'New Branch'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {editingBranch ? 'Update branch information' : 'Add a new branch location'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>

      {/* Step Progress Indicator */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}
      >
        {steps.map((step, index) => {
          const isActive = currentSection === step.id
          const isCompleted = index < currentStepIndex
          return (
            <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {index > 0 && (
                <Box sx={{ width: 24, height: 1, bgcolor: isCompleted ? 'primary.main' : 'divider' }} />
              )}
              <Box
                onClick={() => setCurrentSection(step.id as typeof currentSection)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : isCompleted ? 'primary.lighter' : 'transparent',
                  color: isActive ? '#ffffff' : isCompleted ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: isActive ? 'primary.main' : 'action.hover' }
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    bgcolor: isActive ? 'rgba(255,255,255,0.2)' : isCompleted ? 'primary.main' : 'action.hover',
                    color: isActive ? '#ffffff' : isCompleted ? 'primary.contrastText' : 'text.secondary'
                  }}
                >
                  {isCompleted ? <i className='ri-check-line' style={{ fontSize: 14 }} /> : index + 1}
                </Box>
                <Typography
                  variant='caption'
                  fontWeight={isActive ? 700 : 500}
                  sx={{ color: isActive ? '#ffffff' : isCompleted ? 'primary.main' : 'text.secondary' }}
                >
                  {step.label}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {/* Information Section */}
        {currentSection === 'info' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label='Branch Name'
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <GooglePlacesAutocomplete
              value={formData.formattedAddress || formData.address || ''}
              onChange={value => setFormData(prev => ({ ...prev, address: value, formattedAddress: '' }))}
              onPlaceSelected={place => {
                const lat = place.geometry?.location?.lat()
                const lng = place.geometry?.location?.lng()
                const formattedAddress = place.formatted_address || ''
                const addressComponents = place.address_components || []

                const extractComponent = (type: string) => {
                  const component = addressComponents.find(comp => comp.types.includes(type))
                  return component?.long_name || ''
                }

                const city =
                  extractComponent('locality') ||
                  extractComponent('administrative_area_level_2') ||
                  extractComponent('sublocality')
                const country = extractComponent('country') || 'EG'
                const placeId = place.place_id || ''

                const streetNumber = extractComponent('street_number')
                const route = extractComponent('route')
                const premise = extractComponent('premise')

                let addressLine1 = ''
                if (streetNumber && route) {
                  addressLine1 = `${streetNumber} ${route}`.trim()
                } else if (route) {
                  addressLine1 = route
                } else if (premise) {
                  addressLine1 = premise
                } else {
                  addressLine1 = formattedAddress.split(',')[0] || ''
                }

                setFormData(prev => ({
                  ...prev,
                  address: addressLine1,
                  city,
                  country,
                  latitude: lat,
                  longitude: lng,
                  formattedAddress,
                  placeId
                }))
              }}
              label='Search Branch Address'
              error={false}
              helperText='Start typing to search for your address'
            />

            <GoogleMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lng, address) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                  formattedAddress: address,
                  address: address.split(',')[0] || address
                }))
              }}
              height='min(300px, 40vh)'
            />

            <TextField
              fullWidth
              label='Street Address'
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label='City'
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
              <TextField
                fullWidth
                label='Country'
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label='Mobile'
                value={formData.mobile}
                onChange={e => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              />
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Box>

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant='body1'>Branch Active</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Inactive branches won't accept new bookings
                  </Typography>
                </Box>
              }
            />
          </Box>
        )}

        {/* Services Section */}
        {currentSection === 'services' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Select services available at this branch
              </Typography>
              {availableServices.length > 0 && (
                <Button size='small' variant='text' onClick={handleSelectAllServices}>
                  {availableServices.every(s => formData.serviceIds.includes(s.id)) ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </Box>

            {isLoadingServices ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : availableServices.length === 0 ? (
              <Alert severity='info' sx={{ mb: 2 }}>
                No services found. Please create services first before assigning them to branches.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {availableServices.map(service => (
                  <Paper
                    key={service.id}
                    variant='outlined'
                    onClick={() => toggleService(service.id)}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      bgcolor: formData.serviceIds.includes(service.id) ? 'action.selected' : 'transparent',
                      borderColor: formData.serviceIds.includes(service.id) ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <Checkbox checked={formData.serviceIds.includes(service.id)} sx={{ mr: 1 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant='body1' fontWeight={500}>
                        {service.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {service.duration} min
                      </Typography>
                    </Box>
                    <Typography variant='body1' fontWeight={500} color='primary'>
                      EGP {service.price}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}

            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant='body2'>
                <strong>{formData.serviceIds.length}</strong> services selected
              </Typography>
            </Box>
          </Box>
        )}

        {/* Staff Section */}
        {currentSection === 'staff' && (
          <Box>
            {editingBranch ? (
              <>
                <Alert severity='info' sx={{ mb: 2 }}>
                  <Typography variant='body2'>
                    Click on a staff member to assign them to <strong>{editingBranch.name}</strong>. Staff can only be
                    assigned to one branch at a time.
                  </Typography>
                </Alert>

                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  Select staff members to assign to this branch:
                </Typography>
              </>
            ) : (
              <Alert severity='warning' sx={{ mb: 2 }}>
                <Typography variant='body2'>
                  Staff assignment is only available when editing an existing branch. Please save the branch first, then
                  edit it to assign staff.
                </Typography>
              </Alert>
            )}

            {isLoadingStaff ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : availableStaff.length === 0 ? (
              <Alert severity='warning'>No staff members found. Add staff in the Staff Management section first.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {availableStaff.map(staff => {
                  const isAssigned = isStaffAssignedToThisBranch(staff.branchId)
                  const isLoading = isAssigningStaff === staff.id

                  return (
                    <Paper
                      key={staff.id}
                      variant='outlined'
                      onClick={() =>
                        editingBranch && !isLoading && handleToggleStaffAssignment(staff.id, staff.branchId)
                      }
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        minWidth: 200,
                        cursor: editingBranch ? 'pointer' : 'default',
                        bgcolor: isAssigned ? 'action.selected' : 'transparent',
                        borderColor: isAssigned ? 'primary.main' : 'divider',
                        borderWidth: isAssigned ? 2 : 1,
                        transition: 'all 0.2s',
                        opacity: isLoading ? 0.6 : 1,
                        '&:hover': editingBranch
                          ? {
                              borderColor: 'primary.main',
                              bgcolor: isAssigned ? 'action.selected' : 'action.hover'
                            }
                          : {}
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={20} sx={{ mr: 0.5 }} />
                      ) : (
                        <Checkbox checked={isAssigned} size='small' disabled={!editingBranch} sx={{ p: 0, mr: 0.5 }} />
                      )}
                      <Avatar
                        sx={{ bgcolor: staff.color || 'primary.main', width: 36, height: 36, fontSize: '0.9rem' }}
                      >
                        {staff.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant='body2' fontWeight={500}>
                          {staff.name}
                        </Typography>
                        {staff.title && (
                          <Typography variant='caption' color='text.secondary'>
                            {staff.title}
                          </Typography>
                        )}
                      </Box>
                      {isAssigned && (
                        <Chip label='Assigned' size='small' color='primary' sx={{ fontSize: '0.7rem', height: 20 }} />
                      )}
                    </Paper>
                  )
                })}
              </Box>
            )}

            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant='body2'>
                <strong>{availableStaff.filter(s => isStaffAssignedToThisBranch(s.branchId)).length}</strong> staff
                members assigned to this branch
              </Typography>
            </Box>
          </Box>
        )}

        {/* Working Hours Section */}
        {currentSection === 'hours' && (
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Set working hours for each day of the week
            </Typography>
            <Alert severity='info' sx={{ mb: 2 }} icon={<i className='ri-information-line' />}>
              <Typography variant='caption'>
                These working hours will be used as the default schedule. You can customize them later in Management &gt; Shifts.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {formData.workingHours.map(hours => (
                <Paper key={hours.day} variant='outlined' sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={hours.isOpen}
                          onChange={e => updateWorkingHours(hours.day, 'isOpen', e.target.checked)}
                          size='small'
                        />
                      }
                      label={
                        <Typography variant='body1' fontWeight={500} sx={{ minWidth: 50 }}>
                          {hours.day}
                        </Typography>
                      }
                      sx={{ mr: 2 }}
                    />

                    {hours.isOpen ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                        <TimeSelectField
                          value={hours.openTime}
                          onChange={value => updateWorkingHours(hours.day, 'openTime', value)}
                          size='small'
                          sx={{ width: 130 }}
                        />
                        <Typography color='text.secondary'>to</Typography>
                        <TimeSelectField
                          value={hours.closeTime}
                          onChange={value => updateWorkingHours(hours.day, 'closeTime', value)}
                          size='small'
                          sx={{ width: 130 }}
                        />
                      </Box>
                    ) : (
                      <Chip label='Closed' size='small' color='error' variant='outlined' />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer - Step Navigation */}
      <Box
        sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Button variant='outlined' onClick={isFirstStep ? handleClose : handleBack}>
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isFirstStep && (
            <Button variant='text' onClick={handleClose}>
              Cancel
            </Button>
          )}
          {isLastStep ? (
            <Button variant='contained' onClick={handleSubmit} disabled={!formData.name.trim()}>
              {editingBranch ? 'Save Changes' : 'Create Branch'}
            </Button>
          ) : (
            <Button variant='contained' onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  )
}
