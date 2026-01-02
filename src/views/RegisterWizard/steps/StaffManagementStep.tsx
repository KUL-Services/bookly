'use client'

import { useState, useEffect } from 'react'
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
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

import type { StepProps, StaffMember } from '../types'

const STAFF_COLORS = [
  '#0a2c24',
  '#77b6a3',
  '#51b4b7',
  '#e88682',
  '#202c39',
  '#1d7460',
  '#3d4a5a',
  '#c9a47b',
  '#8b9ba8',
  '#6d8f82'
]

const StaffManagementStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffRole, setNewStaffRole] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffPhone, setNewStaffPhone] = useState('')
  const [newStaffBranchIds, setNewStaffBranchIds] = useState<string[]>([])
  const [newStaffColor, setNewStaffColor] = useState(STAFF_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)

  const availableBranches = formData.branches || []

  // Initialize owner as first staff member
  useEffect(() => {
    if ((!formData.staff || formData.staff.length === 0) && formData.ownerName) {
      const ownerStaff: StaffMember = {
        id: 'owner',
        name: formData.ownerName,
        role: 'Owner',
        isOwner: true,
        branchIds: availableBranches.map(b => b.id),
        email: formData.email,
        color: STAFF_COLORS[0]
      }
      updateFormData({ staff: [ownerStaff] })
    }
  }, [formData.ownerName, formData.email])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.staff || formData.staff.length === 0) {
      errors.staff = 'At least one staff member (you) is required'
    }

    // Validate that all staff have at least one branch assigned
    if (formData.staff) {
      const staffWithoutBranch = formData.staff.find(s => !s.branchIds || s.branchIds.length === 0)
      if (staffWithoutBranch) {
        errors.staff = 'All staff members must be assigned to at least one branch'
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

  const handleOpenDialog = (staff?: StaffMember) => {
    if (staff) {
      setEditingId(staff.id)
      setNewStaffName(staff.name)
      setNewStaffRole(staff.role)
      setNewStaffEmail(staff.email || '')
      setNewStaffPhone(staff.phone || '')
      setNewStaffBranchIds(staff.branchIds || [])
      setNewStaffColor(staff.color || STAFF_COLORS[0])
    } else {
      setEditingId(null)
      setNewStaffName('')
      setNewStaffRole('')
      setNewStaffEmail('')
      setNewStaffPhone('')
      setNewStaffBranchIds(availableBranches.length > 0 ? [availableBranches[0].id] : [])
      // Pick a color that's not used yet
      const usedColors = (formData.staff || []).map(s => s.color).filter(Boolean)
      const availableColor = STAFF_COLORS.find(c => !usedColors.includes(c)) || STAFF_COLORS[0]
      setNewStaffColor(availableColor)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setNewStaffName('')
    setNewStaffRole('')
    setNewStaffEmail('')
    setNewStaffPhone('')
    setNewStaffBranchIds([])
    setNewStaffColor(STAFF_COLORS[0])
    setEditingId(null)
  }

  const handleSaveStaff = () => {
    if (!newStaffName.trim() || !newStaffRole.trim() || newStaffBranchIds.length === 0) return

    const currentStaff = formData.staff || []

    if (editingId) {
      // Edit existing staff
      const updatedStaff = currentStaff.map(s =>
        s.id === editingId
          ? {
              ...s,
              name: newStaffName,
              role: newStaffRole,
              email: newStaffEmail,
              phone: newStaffPhone,
              branchIds: newStaffBranchIds,
              color: newStaffColor
            }
          : s
      )
      updateFormData({ staff: updatedStaff })
    } else {
      // Add new staff
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: newStaffName,
        role: newStaffRole,
        email: newStaffEmail,
        phone: newStaffPhone,
        isOwner: false,
        branchIds: newStaffBranchIds,
        color: newStaffColor
      }
      updateFormData({ staff: [...currentStaff, newStaff] })
    }

    handleCloseDialog()
  }

  const handleDeleteStaff = (id: string) => {
    if (!formData.staff) return

    // Prevent deleting owner
    const staffMember = formData.staff.find(s => s.id === id)
    if (staffMember?.isOwner) return

    const updatedStaff = formData.staff.filter(s => s.id !== id)
    updateFormData({ staff: updatedStaff })
  }

  const getBranchNames = (branchIds: string[]) => {
    return (
      branchIds
        .map(id => availableBranches.find(b => b.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'No branches'
    )
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='text-center mb-2'>
        <Typography variant='h5' className='mb-2'>
          Add Staff Members
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Who will be providing services at your business?
        </Typography>
      </div>

      {validationErrors.staff && <Alert severity='error'>{validationErrors.staff}</Alert>}

      {/* Staff List */}
      <div className='flex flex-col gap-3'>
        {formData.staff &&
          formData.staff.map(staff => (
            <Card key={staff.id} variant='outlined' className='shadow-sm'>
              <CardContent className='flex items-center justify-between gap-3 p-4'>
                <Box className='flex items-center gap-3 flex-1'>
                  <div
                    className='flex items-center justify-center w-10 h-10 rounded-full text-white font-medium'
                    style={{ backgroundColor: staff.color || '#0a2c24' }}
                  >
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <Box className='flex-1'>
                    <Typography variant='body1' className='font-medium'>
                      {staff.name}
                      {staff.isOwner && <Chip label='You' size='small' color='primary' className='ml-2' />}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' className='text-sm'>
                      {staff.role}
                      {staff.branchIds && staff.branchIds.length > 0 && <> • {getBranchNames(staff.branchIds)}</>}
                    </Typography>
                    {staff.email && (
                      <Typography variant='caption' color='text.secondary' className='text-xs'>
                        {staff.email}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {!staff.isOwner && (
                  <Box className='flex gap-1'>
                    <IconButton size='small' onClick={() => handleOpenDialog(staff)} className='text-primary'>
                      <i className='ri-pencil-line' />
                    </IconButton>
                    <IconButton size='small' onClick={() => handleDeleteStaff(staff.id)} className='text-error'>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Box>
                )}
                {staff.isOwner && (
                  <IconButton size='small' onClick={() => handleOpenDialog(staff)} className='text-primary'>
                    <i className='ri-pencil-line' />
                  </IconButton>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Add Staff Button */}
      <Button
        fullWidth
        variant='outlined'
        onClick={() => handleOpenDialog()}
        startIcon={<i className='ri-user-add-line' />}
        className='border-2 border-dashed'
      >
        Add Staff Member
      </Button>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
        <DialogContent className='pt-4'>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              label='Full Name'
              value={newStaffName}
              onChange={e => setNewStaffName(e.target.value)}
              placeholder='e.g., Ahmed Hassan'
              autoFocus
              required
            />
            <TextField
              fullWidth
              label='Role / Position'
              value={newStaffRole}
              onChange={e => setNewStaffRole(e.target.value)}
              placeholder='e.g., Barber, Stylist, Manager, Instructor'
              helperText='The role or specialty of this staff member'
              required
            />

            <TextField
              fullWidth
              label='Email (Optional)'
              type='email'
              value={newStaffEmail}
              onChange={e => setNewStaffEmail(e.target.value)}
              placeholder='staff@example.com'
              helperText='For login and notifications'
            />

            <TextField
              fullWidth
              label='Phone (Optional)'
              value={newStaffPhone}
              onChange={e => setNewStaffPhone(e.target.value)}
              placeholder='+20 123 456 7890'
            />

            <FormControl fullWidth required>
              <InputLabel>Works At (Branches)</InputLabel>
              <Select
                multiple
                value={newStaffBranchIds}
                onChange={e => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                  setNewStaffBranchIds(value)
                }}
                input={<OutlinedInput label='Works At (Branches)' />}
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
                    <Checkbox checked={newStaffBranchIds.includes(branch.id)} />
                    <ListItemText primary={branch.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Calendar Color</InputLabel>
              <Select value={newStaffColor} label='Calendar Color' onChange={e => setNewStaffColor(e.target.value)}>
                {STAFF_COLORS.map(color => (
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
            onClick={handleSaveStaff}
            disabled={!newStaffName.trim() || !newStaffRole.trim() || newStaffBranchIds.length === 0}
          >
            {editingId ? 'Save Changes' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info about availability */}
      <Alert severity='info' icon={<i className='ri-information-line' />}>
        <Typography variant='caption'>
          You can configure detailed working hours, scheduling mode (appointments or classes), and availability for each
          staff member later in the staff management settings.
        </Typography>
      </Alert>

      {/* Navigation */}
      <Box className='flex gap-3 justify-between mt-4'>
        <Button variant='outlined' onClick={handlePrev}>
          Back
        </Button>
        <Button variant='contained' onClick={handleContinue} disabled={!formData.staff || formData.staff.length === 0}>
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default StaffManagementStep
