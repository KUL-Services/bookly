'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Avatar,
  InputAdornment,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material'
import { mockBranches, mockStaff, mockServices } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'

interface StaffMember {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  photo?: string
  color?: string
  branchId: string
}

interface AddStaffMemberDrawerProps {
  open: boolean
  onClose: () => void
  editingStaff?: StaffMember | null // If provided, we're in edit mode
}

const COLOR_OPTIONS = [
  { value: '#1976d2', label: 'Blue' },
  { value: '#388e3c', label: 'Green' },
  { value: '#d32f2f', label: 'Red' },
  { value: '#f57c00', label: 'Orange' },
  { value: '#7b1fa2', label: 'Purple' },
  { value: '#0097a7', label: 'Cyan' },
  { value: '#c2185b', label: 'Pink' },
  { value: '#5d4037', label: 'Brown' },
  { value: '#455a64', label: 'Blue Grey' },
  { value: '#f9a825', label: 'Yellow' }
]

const TITLE_OPTIONS = [
  'Stylist',
  'Senior Stylist',
  'Barber',
  'Massage Therapist',
  'Esthetician',
  'Nail Technician',
  'Yoga Instructor',
  'Personal Trainer',
  'Receptionist',
  'Manager',
  'Owner',
  'Other'
]

export function AddStaffMemberDrawer({ open, onClose, editingStaff }: AddStaffMemberDrawerProps) {
  const { createStaffMember, updateStaffMember } = useStaffManagementStore()
  const isEditMode = !!editingStaff

  // Basic Information
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [customTitle, setCustomTitle] = useState('')

  // Work Information
  const [branchId, setBranchId] = useState('') // Main branch (for backward compat)
  const [branchIds, setBranchIds] = useState<string[]>([]) // All assigned branches
  const [mainBranchId, setMainBranchId] = useState('') // Main branch for shifts
  const [employeeId, setEmployeeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [color, setColor] = useState('#1976d2')

  // Contact & Emergency
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  // Photo upload (mock for now)
  const [photoPreview, setPhotoPreview] = useState('')

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      if (editingStaff) {
        // Edit mode - load existing values
        const nameParts = editingStaff.name.split(' ')
        setFirstName(nameParts[0] || '')
        setLastName(nameParts.slice(1).join(' ') || '')
        setEmail(editingStaff.email || '')
        setPhone(editingStaff.phone || '')
        setTitle(TITLE_OPTIONS.includes(editingStaff.title) ? editingStaff.title : 'Other')
        setCustomTitle(TITLE_OPTIONS.includes(editingStaff.title) ? '' : editingStaff.title)

        // Handle branch assignments - support both old (branchId) and new (mainBranchId + branchIds) formats
        const staffMainBranch = (editingStaff as any).mainBranchId || editingStaff.branchId || mockBranches[0]?.id || ''
        const staffBranchIds = (editingStaff as any).branchIds || [editingStaff.branchId] || [mockBranches[0]?.id || '']

        // Ensure main branch is set
        if (staffMainBranch) {
          setMainBranchId(staffMainBranch)
          setBranchId(staffMainBranch)
        }
        // Additional branches exclude main
        setBranchIds(staffBranchIds.filter((id: string) => id !== staffMainBranch))

        setColor(editingStaff.color || '#1976d2')
        setPhotoPreview(editingStaff.photo || '')
        // Keep other fields at defaults for edit
        setEmployeeId('')
        setStartDate(new Date().toISOString().split('T')[0])
        setEmergencyContact('')
        setEmergencyPhone('')
      } else {
        // Add mode - reset all fields
        setFirstName('')
        setLastName('')
        setEmail('')
        setPhone('')
        setTitle('')
        setCustomTitle('')
        const defaultBranch = mockBranches[0]?.id || ''
        setBranchId(defaultBranch)
        setBranchIds([defaultBranch])
        setMainBranchId(defaultBranch)
        setEmployeeId('')
        setStartDate(new Date().toISOString().split('T')[0])
        setColor('#1976d2')
        setEmergencyContact('')
        setEmergencyPhone('')
        setPhotoPreview('')
      }
    }
  }, [open, editingStaff])

  const handleSave = () => {
    // Validation - only first name, last name, and main branch are required
    if (!firstName || !lastName || !mainBranchId) {
      alert('Please fill in all required fields (First Name, Last Name, Main Branch)')
      return
    }

    // Email validation only if email is provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address')
        return
      }
    }

    // Combine main branch with additional branches
    const allBranchIds = [mainBranchId, ...branchIds].filter(Boolean)

    const staffData = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: email || undefined,
      phone,
      title: title === 'Other' ? customTitle : title || '',
      branchId: mainBranchId, // Main branch as primary (for backward compatibility)
      branchIds: allBranchIds, // All assigned branches (main + additional)
      mainBranchId: mainBranchId, // Main branch for shifts
      employeeId,
      startDate,
      color,
      emergencyContact,
      emergencyPhone,
      photo: photoPreview || undefined
    }

    if (isEditMode && editingStaff) {
      updateStaffMember(editingStaff.id, staffData)
    } else {
      createStaffMember(staffData)
    }

    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = () => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 520 } }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant='h5' fontWeight={600}>
            {isEditMode ? 'Edit Staff Member' : 'Add Staff Member'}
          </Typography>
          <IconButton onClick={handleCancel}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Photo Upload Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: color,
                fontSize: '2rem',
                fontWeight: 600
              }}
            >
              {getInitials()}
            </Avatar>
            <Button component='label' variant='outlined' size='small' startIcon={<i className='ri-upload-2-line' />}>
              Upload Photo
              <input type='file' hidden accept='image/*' onChange={handlePhotoUpload} />
            </Button>
          </Box>

          <Divider />

          {/* Basic Information Section */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Basic Information
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label='First Name'
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              fullWidth
              placeholder='John'
            />
            <TextField
              label='Last Name'
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              fullWidth
              placeholder='Doe'
            />
          </Box>

          <TextField
            label='Email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            placeholder='john.doe@example.com'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-mail-line' />
                </InputAdornment>
              )
            }}
          />

          <TextField
            label='Phone Number'
            value={phone}
            onChange={e => setPhone(e.target.value)}
            fullWidth
            placeholder='+1 (555) 123-4567'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-phone-line' />
                </InputAdornment>
              )
            }}
          />

          <Divider />

          {/* Work Information Section */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Work Information
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Job Title</InputLabel>
            <Select value={title} onChange={e => setTitle(e.target.value)} label='Job Title'>
              {TITLE_OPTIONS.map(titleOption => (
                <MenuItem key={titleOption} value={titleOption}>
                  {titleOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {title === 'Other' && (
            <TextField
              label='Custom Title'
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              placeholder='Enter custom job title'
              fullWidth
            />
          )}

          {/* Main Branch - Required Single Select */}
          <FormControl fullWidth required>
            <InputLabel>Main Branch</InputLabel>
            <Select
              value={mainBranchId}
              onChange={e => {
                const newMainBranch = e.target.value
                setMainBranchId(newMainBranch)
                setBranchId(newMainBranch)
                // Remove from additional branches if it was there
                setBranchIds(branchIds.filter(id => id !== newMainBranch))
              }}
              label='Main Branch'
            >
              {mockBranches.map(branch => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
              Primary branch for this staff member's schedule and shifts
            </Typography>
          </FormControl>

          {/* Additional Branches - Optional Multi-Select */}
          <FormControl fullWidth>
            <InputLabel>Additional Branches (Optional)</InputLabel>
            <Select
              multiple
              value={branchIds}
              onChange={e => {
                const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                // Ensure main branch is not in additional branches
                setBranchIds(value.filter(id => id !== mainBranchId))
              }}
              input={<OutlinedInput label='Additional Branches (Optional)' />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                      None
                    </Typography>
                  ) : (
                    selected.map(value => {
                      const branch = mockBranches.find(b => b.id === value)
                      return <Chip key={value} label={branch?.name} size='small' />
                    })
                  )}
                </Box>
              )}
            >
              {mockBranches
                .filter(branch => branch.id !== mainBranchId) // Exclude main branch
                .map(branch => (
                  <MenuItem key={branch.id} value={branch.id}>
                    <Checkbox checked={branchIds.includes(branch.id)} />
                    <ListItemText primary={branch.name} />
                  </MenuItem>
                ))}
            </Select>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
              Staff member can work at these branches in addition to their main branch
            </Typography>
          </FormControl>

          <TextField
            label='Employee ID'
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            placeholder='EMP-001'
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-barcode-line' />
                </InputAdornment>
              )
            }}
          />

          <TextField
            label='Start Date'
            type='date'
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel>Calendar Color</InputLabel>
            <Select
              value={color}
              onChange={e => setColor(e.target.value)}
              label='Calendar Color'
              renderValue={value => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 1,
                      bgcolor: value,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  {COLOR_OPTIONS.find(c => c.value === value)?.label}
                </Box>
              )}
            >
              {COLOR_OPTIONS.map(colorOption => (
                <MenuItem key={colorOption.value} value={colorOption.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        bgcolor: colorOption.value,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    {colorOption.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          {/* Emergency Contact Section */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Emergency Contact
          </Typography>

          <TextField
            label='Emergency Contact Name'
            value={emergencyContact}
            onChange={e => setEmergencyContact(e.target.value)}
            fullWidth
            placeholder='Jane Doe'
          />

          <TextField
            label='Emergency Contact Phone'
            value={emergencyPhone}
            onChange={e => setEmergencyPhone(e.target.value)}
            fullWidth
            placeholder='+1 (555) 987-6543'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-phone-line' />
                </InputAdornment>
              )
            }}
          />

          {/* Info Box */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'info.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.main'
            }}
          >
            <Typography variant='caption' color='info.dark'>
              <strong>Note:</strong> After adding the staff member, you can configure their working hours, assign
              services, and set up their schedule in the Staff Management section.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' onClick={handleCancel} fullWidth>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSave} fullWidth>
            {isEditMode ? 'Save Changes' : 'Add Staff Member'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
