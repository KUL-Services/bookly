'use client'

import { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

import type { StepProps, RegistrationService } from '../types'
import { DEFAULT_SERVICE_CATEGORIES, SERVICE_DURATIONS, SERVICE_COLORS } from '../types'

const ServicesSetupStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempService, setTempService] = useState<Partial<RegistrationService>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    categoryId: DEFAULT_SERVICE_CATEGORIES[0].id,
    color: SERVICE_COLORS[0],
    branchIds: [],
    staffIds: [],
    roomIds: []
  })

  const availableBranches = formData.branches || []
  const availableStaff = formData.staff || []
  const availableRooms = formData.rooms || []

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.services || formData.services.length === 0) {
      errors.services = 'Please add at least one service you offer'
    }

    // Validate each service has branches and staff assigned
    if (formData.services) {
      const serviceWithoutBranch = formData.services.find(s => !s.branchIds || s.branchIds.length === 0)
      if (serviceWithoutBranch) {
        errors.services = 'All services must be assigned to at least one branch'
      }

      // All services should have at least one staff member
      const serviceWithoutStaff = formData.services.find(s => !s.staffIds || s.staffIds.length === 0)
      if (serviceWithoutStaff) {
        errors.services = 'All services must have at least one staff member who can provide it'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  const handleOpenDialog = (service?: RegistrationService) => {
    if (service) {
      setEditingId(service.id)
      setTempService(service)
    } else {
      setEditingId(null)
      // Pick an unused color
      const usedColors = (formData.services || []).map(s => s.color).filter(Boolean)
      const availableColor = SERVICE_COLORS.find(c => !usedColors.includes(c)) || SERVICE_COLORS[0]

      setTempService({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        categoryId: DEFAULT_SERVICE_CATEGORIES[0].id,
        color: availableColor,
        branchIds: availableBranches.length > 0 ? [availableBranches[0].id] : [],
        staffIds: availableStaff.length > 0 ? [availableStaff[0].id] : [],
        roomIds: []
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingId(null)
    setTempService({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      categoryId: DEFAULT_SERVICE_CATEGORIES[0].id,
      color: SERVICE_COLORS[0],
      branchIds: [],
      staffIds: [],
      roomIds: []
    })
  }

  const handleSaveService = () => {
    if (!tempService.name?.trim() || !tempService.branchIds || tempService.branchIds.length === 0) {
      return
    }

    // Require staff assignment for all services
    if (!tempService.staffIds || tempService.staffIds.length === 0) {
      return
    }

    const currentServices = formData.services || []

    if (editingId) {
      // Edit existing service
      const updatedServices = currentServices.map(s =>
        s.id === editingId ? ({ ...tempService, id: editingId } as RegistrationService) : s
      )
      updateFormData({ services: updatedServices })
    } else {
      // Add new service
      const newService: RegistrationService = {
        ...tempService,
        id: `service-${Date.now()}`,
        price: tempService.price || 0,
        duration: tempService.duration || 30,
        branchIds: tempService.branchIds || [],
        staffIds: tempService.staffIds || [],
        roomIds: tempService.roomIds || []
      } as RegistrationService
      updateFormData({ services: [...currentServices, newService] })
    }

    handleCloseDialog()
  }

  const handleDeleteService = (id: string) => {
    if (!formData.services) return
    const updatedServices = formData.services.filter(s => s.id !== id)
    updateFormData({ services: updatedServices })
  }

  const getBranchNames = (branchIds: string[]) => {
    return (
      branchIds
        .map(id => availableBranches.find(b => b.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'No branches'
    )
  }

  const getStaffNames = (staffIds: string[]) => {
    return (
      staffIds
        .map(id => availableStaff.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'No staff'
    )
  }

  const getCategoryName = (categoryId?: string) => {
    const category = DEFAULT_SERVICE_CATEGORIES.find(c => c.id === categoryId)
    return category?.name || 'Uncategorized'
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='text-center mb-2'>
        <Typography variant='h5' className='mb-2'>
          Set Up Your Services
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Define the services your staff will provide to clients
        </Typography>
      </div>

      {validationErrors.services && <Alert severity='error'>{validationErrors.services}</Alert>}

      <Alert severity='info' icon={<i className='ri-information-line' />}>
        <Typography variant='body2'>
          Assign services to staff members who can perform them. Clients will book based on staff availability.
        </Typography>
      </Alert>

      {/* Services List */}
      <div className='flex flex-col gap-3'>
        {formData.services &&
          formData.services.map(service => (
            <Card key={service.id} variant='outlined' className='shadow-sm'>
              <CardContent className='flex items-center justify-between gap-3 p-4'>
                <Box className='flex items-center gap-3 flex-1'>
                  <div
                    className='flex items-center justify-center w-10 h-10 rounded-full text-white font-medium'
                    style={{ backgroundColor: service.color || '#6366f1' }}
                  >
                    <i className='ri-service-line text-lg' />
                  </div>
                  <Box className='flex-1'>
                    <Typography variant='body1' className='font-medium'>
                      {service.name}
                      <Chip
                        label={getCategoryName(service.categoryId)}
                        size='small'
                        variant='outlined'
                        className='ml-2'
                      />
                    </Typography>
                    <Typography variant='body2' color='text.secondary' className='text-sm'>
                      {formatPrice(service.price)} • {formatDuration(service.duration)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' className='text-xs'>
                      {getBranchNames(service.branchIds)}
                      {service.staffIds && service.staffIds.length > 0 && (
                        <> • Staff: {getStaffNames(service.staffIds)}</>
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Box className='flex gap-1'>
                  <IconButton size='small' onClick={() => handleOpenDialog(service)} className='text-primary'>
                    <i className='ri-pencil-line' />
                  </IconButton>
                  <IconButton size='small' onClick={() => handleDeleteService(service.id)} className='text-error'>
                    <i className='ri-delete-bin-line' />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Add Service Button */}
      <Button
        fullWidth
        variant='outlined'
        onClick={() => handleOpenDialog()}
        startIcon={<i className='ri-add-line' />}
        className='border-2 border-dashed'
      >
        Add Service
      </Button>

      {/* Add/Edit Service Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{editingId ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent className='pt-4'>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              label='Service Name'
              value={tempService.name || ''}
              onChange={e => setTempService({ ...tempService, name: e.target.value })}
              placeholder='e.g., Haircut, Massage, Yoga Class'
              helperText='What do you call this service?'
              autoFocus
              required
            />

            <TextField
              fullWidth
              label='Description (Optional)'
              value={tempService.description || ''}
              onChange={e => setTempService({ ...tempService, description: e.target.value })}
              placeholder='Brief description of this service'
              multiline
              rows={2}
            />

            <Box className='flex gap-3'>
              <TextField
                fullWidth
                type='number'
                label='Price'
                value={tempService.price || ''}
                onChange={e => setTempService({ ...tempService, price: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
                inputProps={{ min: 0, step: 1 }}
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={tempService.duration || 30}
                  label='Duration'
                  onChange={e => setTempService({ ...tempService, duration: Number(e.target.value) })}
                >
                  {SERVICE_DURATIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={tempService.categoryId || DEFAULT_SERVICE_CATEGORIES[0].id}
                label='Category'
                onChange={e => setTempService({ ...tempService, categoryId: e.target.value })}
              >
                {DEFAULT_SERVICE_CATEGORIES.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box className='flex items-center gap-2'>
                      <div className='w-4 h-4 rounded-full' style={{ backgroundColor: category.color }} />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Available At (Branches)</InputLabel>
              <Select
                multiple
                value={tempService.branchIds || []}
                onChange={e => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                  setTempService({ ...tempService, branchIds: value })
                }}
                input={<OutlinedInput label='Available At (Branches)' />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(branchId => {
                      const branch = availableBranches.find(b => b.id === branchId)
                      return <Chip key={branchId} label={branch?.name || branchId} size='small' />
                    })}
                  </Box>
                )}
              >
                {availableBranches.map(branch => (
                  <MenuItem key={branch.id} value={branch.id}>
                    <Checkbox checked={(tempService.branchIds || []).includes(branch.id)} />
                    <ListItemText primary={branch.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Provided By (Staff)</InputLabel>
              <Select
                multiple
                value={tempService.staffIds || []}
                onChange={e => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                  setTempService({ ...tempService, staffIds: value })
                }}
                input={<OutlinedInput label='Provided By (Staff)' />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(staffId => {
                      const staff = availableStaff.find(s => s.id === staffId)
                      return <Chip key={staffId} label={staff?.name || staffId} size='small' />
                    })}
                  </Box>
                )}
              >
                {availableStaff.map(staff => (
                  <MenuItem key={staff.id} value={staff.id}>
                    <Checkbox checked={(tempService.staffIds || []).includes(staff.id)} />
                    <Box className='flex items-center gap-2 ml-1'>
                      <div
                        className='w-6 h-6 rounded-full flex items-center justify-center text-white text-xs'
                        style={{ backgroundColor: staff.color || '#0a2c24' }}
                      >
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <ListItemText primary={staff.name} secondary={staff.isOwner ? 'You' : undefined} />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {availableRooms.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Available In (Rooms)</InputLabel>
                <Select
                  multiple
                  value={tempService.roomIds || []}
                  onChange={e => {
                    const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                    setTempService({ ...tempService, roomIds: value })
                  }}
                  input={<OutlinedInput label='Available In (Rooms)' />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(roomId => {
                        const room = availableRooms.find(r => r.id === roomId)
                        return <Chip key={roomId} label={room?.name || roomId} size='small' />
                      })}
                    </Box>
                  )}
                >
                  {availableRooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>
                      <Checkbox checked={(tempService.roomIds || []).includes(room.id)} />
                      <ListItemText primary={room.name} secondary={`Capacity: ${room.capacity}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Service Color</InputLabel>
              <Select
                value={tempService.color || SERVICE_COLORS[0]}
                label='Service Color'
                onChange={e => setTempService({ ...tempService, color: e.target.value })}
              >
                {SERVICE_COLORS.map(color => (
                  <MenuItem key={color} value={color}>
                    <Box className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full' style={{ backgroundColor: color }} />
                      <span>{color}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions className='p-4'>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSaveService}
            disabled={
              !tempService.name?.trim() ||
              !tempService.branchIds ||
              tempService.branchIds.length === 0 ||
              !tempService.staffIds ||
              tempService.staffIds.length === 0
            }
          >
            {editingId ? 'Save Changes' : 'Add Service'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Start Suggestions */}
      {(!formData.services || formData.services.length === 0) && (
        <Box className='p-4 bg-primary/5 rounded-lg border border-primary/20'>
          <Typography variant='body2' className='font-medium mb-2'>
            Popular services for {formData.businessType || 'your business'}:
          </Typography>
          <Box className='flex flex-wrap gap-2'>
            {getQuickStartServices(formData.businessType).map((suggestion, index) => (
              <Button
                key={index}
                size='small'
                variant='outlined'
                onClick={() => {
                  setTempService({
                    name: suggestion.name,
                    price: suggestion.price,
                    duration: suggestion.duration,
                    categoryId:
                      DEFAULT_SERVICE_CATEGORIES.find(c => c.name === suggestion.category)?.id ||
                      DEFAULT_SERVICE_CATEGORIES[0].id,
                    color: SERVICE_COLORS[index % SERVICE_COLORS.length],
                    branchIds: availableBranches.length > 0 ? [availableBranches[0].id] : [],
                    staffIds: availableStaff.length > 0 ? [availableStaff[0].id] : [],
                    roomIds: []
                  })
                  setDialogOpen(true)
                }}
              >
                + {suggestion.name}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <Box className='flex gap-3 justify-between mt-4'>
        <Button variant='outlined' onClick={handlePrev}>
          Back
        </Button>
        <Button
          variant='contained'
          onClick={handleContinue}
          disabled={!formData.services || formData.services.length === 0}
        >
          Continue
        </Button>
      </Box>
    </div>
  )
}

// Helper function to get quick start service suggestions based on business type
function getQuickStartServices(
  businessType?: string
): Array<{ name: string; price: number; duration: number; category: string }> {
  const suggestions: Record<string, Array<{ name: string; price: number; duration: number; category: string }>> = {
    'Salon & Spa': [
      { name: 'Haircut', price: 35, duration: 30, category: 'Hair' },
      { name: 'Hair Coloring', price: 85, duration: 90, category: 'Hair' },
      { name: 'Blowout', price: 45, duration: 45, category: 'Hair' },
      { name: 'Manicure', price: 25, duration: 30, category: 'Nails' }
    ],
    Barbershop: [
      { name: "Men's Haircut", price: 25, duration: 30, category: 'Hair' },
      { name: 'Beard Trim', price: 15, duration: 15, category: 'Hair' },
      { name: 'Hot Towel Shave', price: 30, duration: 30, category: 'Hair' },
      { name: 'Haircut + Beard', price: 35, duration: 45, category: 'Hair' }
    ],
    Beauty: [
      { name: 'Facial Treatment', price: 75, duration: 60, category: 'Skin' },
      { name: 'Eyebrow Threading', price: 15, duration: 15, category: 'Other' },
      { name: 'Makeup Application', price: 65, duration: 45, category: 'Other' },
      { name: 'Lash Extensions', price: 150, duration: 120, category: 'Other' }
    ],
    Massage: [
      { name: 'Swedish Massage', price: 80, duration: 60, category: 'Massage' },
      { name: 'Deep Tissue Massage', price: 100, duration: 60, category: 'Massage' },
      { name: 'Hot Stone Massage', price: 120, duration: 90, category: 'Massage' },
      { name: 'Sports Massage', price: 90, duration: 60, category: 'Massage' }
    ],
    Fitness: [
      { name: 'Yoga Class', price: 20, duration: 60, category: 'Fitness' },
      { name: 'Spin Class', price: 25, duration: 45, category: 'Fitness' },
      { name: 'HIIT Training', price: 25, duration: 45, category: 'Fitness' },
      { name: 'Personal Training', price: 75, duration: 60, category: 'Fitness' }
    ],
    Wellness: [
      { name: 'Meditation Session', price: 30, duration: 45, category: 'Other' },
      { name: 'Acupuncture', price: 85, duration: 60, category: 'Other' },
      { name: 'Reiki Session', price: 70, duration: 60, category: 'Other' },
      { name: 'Consultation', price: 50, duration: 30, category: 'Other' }
    ]
  }

  return (
    suggestions[businessType || ''] || [
      { name: 'Basic Service', price: 30, duration: 30, category: 'Other' },
      { name: 'Premium Service', price: 60, duration: 60, category: 'Other' },
      { name: 'Consultation', price: 25, duration: 30, category: 'Other' }
    ]
  )
}

export default ServicesSetupStep
