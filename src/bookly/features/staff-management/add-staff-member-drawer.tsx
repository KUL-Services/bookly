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
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput
} from '@mui/material'
import { mockBranches } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'

interface AddStaffMemberDrawerProps {
  open: boolean
  onClose: () => void
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

const SKILLS_OPTIONS = [
  'Hair Coloring',
  'Hair Cutting',
  'Hair Styling',
  'Balayage',
  'Keratin Treatment',
  'Hair Extensions',
  'Men\'s Grooming',
  'Beard Trimming',
  'Facial Treatments',
  'Waxing',
  'Manicure',
  'Pedicure',
  'Gel Nails',
  'Acrylic Nails',
  'Massage',
  'Deep Tissue',
  'Swedish Massage',
  'Hot Stone',
  'Yoga',
  'Pilates',
  'Personal Training',
  'Nutrition Coaching'
]

export function AddStaffMemberDrawer({ open, onClose }: AddStaffMemberDrawerProps) {
  const { createStaffMember } = useStaffManagementStore()

  // Basic Information
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [customTitle, setCustomTitle] = useState('')

  // Work Information
  const [branchId, setBranchId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [color, setColor] = useState('#1976d2')

  // Skills & Specialties
  const [skills, setSkills] = useState<string[]>([])
  const [bio, setBio] = useState('')

  // Contact & Emergency
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  // Settings
  const [canBookOnline, setCanBookOnline] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)

  // Photo upload (mock for now)
  const [photoPreview, setPhotoPreview] = useState('')

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setTitle('')
      setCustomTitle('')
      setBranchId(mockBranches[0]?.id || '')
      setEmployeeId('')
      setStartDate(new Date().toISOString().split('T')[0])
      setColor('#1976d2')
      setSkills([])
      setBio('')
      setEmergencyContact('')
      setEmergencyPhone('')
      setCanBookOnline(true)
      setIsActive(true)
      setSendWelcomeEmail(true)
      setPhotoPreview('')
    }
  }, [open])

  const handleSave = () => {
    // Validation
    if (!firstName || !lastName || !email || !branchId) {
      alert('Please fill in all required fields (First Name, Last Name, Email, Branch)')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address')
      return
    }

    const staffData = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone,
      title: title === 'Other' ? customTitle : title,
      branchId,
      employeeId,
      startDate,
      color,
      skills,
      bio,
      emergencyContact,
      emergencyPhone,
      canBookOnline,
      isActive,
      photo: photoPreview || undefined
    }

    createStaffMember(staffData)

    if (sendWelcomeEmail) {
      console.log('Sending welcome email to:', email)
      // TODO: Implement email sending
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
      anchor="right"
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 520 } }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Add Staff Member
          </Typography>
          <IconButton onClick={handleCancel}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Photo Upload Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={photoPreview}
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
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<i className="ri-upload-2-line" />}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </Button>
          </Box>

          <Divider />

          {/* Basic Information Section */}
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Basic Information
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
              placeholder="John"
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
              placeholder="Doe"
            />
          </Box>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            placeholder="john.doe@example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-mail-line" />
                </InputAdornment>
              )
            }}
          />

          <TextField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            placeholder="+1 (555) 123-4567"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-phone-line" />
                </InputAdornment>
              )
            }}
          />

          <Divider />

          {/* Work Information Section */}
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Work Information
          </Typography>

          <FormControl fullWidth required>
            <InputLabel>Job Title</InputLabel>
            <Select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              label="Job Title"
            >
              {TITLE_OPTIONS.map((titleOption) => (
                <MenuItem key={titleOption} value={titleOption}>
                  {titleOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {title === 'Other' && (
            <TextField
              label="Custom Title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter custom job title"
              fullWidth
            />
          )}

          <FormControl fullWidth required>
            <InputLabel>Branch</InputLabel>
            <Select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              label="Branch"
            >
              {mockBranches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="EMP-001"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-barcode-line" />
                </InputAdornment>
              )
            }}
          />

          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel>Calendar Color</InputLabel>
            <Select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              label="Calendar Color"
              renderValue={(value) => (
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
              {COLOR_OPTIONS.map((colorOption) => (
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

          {/* Skills & Specialties Section */}
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Skills & Specialties
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Skills</InputLabel>
            <Select
              multiple
              value={skills}
              onChange={(e) => setSkills(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {SKILLS_OPTIONS.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Bio / About"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Write a brief description about this staff member..."
          />

          <Divider />

          {/* Emergency Contact Section */}
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Emergency Contact
          </Typography>

          <TextField
            label="Emergency Contact Name"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            fullWidth
            placeholder="Jane Doe"
          />

          <TextField
            label="Emergency Contact Phone"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            fullWidth
            placeholder="+1 (555) 987-6543"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-phone-line" />
                </InputAdornment>
              )
            }}
          />

          <Divider />

          {/* Settings Section */}
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={canBookOnline}
                onChange={(e) => setCanBookOnline(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Accept Online Bookings
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Allow customers to book appointments with this staff member online
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Active Status
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Set staff member as active and available for scheduling
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Send Welcome Email
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Send an automated welcome email with login credentials
                </Typography>
              </Box>
            }
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
            <Typography variant="caption" color="info.dark">
              <strong>Note:</strong> After adding the staff member, you can configure their working hours,
              assign services, and set up their schedule in the Staff Management section.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
          >
            Add Staff Member
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
