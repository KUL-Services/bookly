'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
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
  Chip
} from '@mui/material'
import { useBranchesStore } from './branches-store'
import { availableServices, availableStaff } from './mock-data'
import type { BranchFormData, BranchWorkingHours } from './types'
import { DEFAULT_BRANCH_FORM_DATA } from './types'

export function BranchEditorDrawer() {
  const { isBranchEditorOpen, editingBranch, closeBranchEditor, createBranch, updateBranch } = useBranchesStore()

  const [formData, setFormData] = useState<BranchFormData>(DEFAULT_BRANCH_FORM_DATA)
  const [currentSection, setCurrentSection] = useState<'info' | 'services' | 'staff' | 'hours'>('info')

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
          isActive: editingBranch.isActive
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

  const sections = [
    { id: 'info', label: 'Information', icon: 'ri-information-line' },
    { id: 'services', label: 'Services', icon: 'ri-service-line' },
    { id: 'staff', label: 'Staff', icon: 'ri-team-line' },
    { id: 'hours', label: 'Working Hours', icon: 'ri-time-line' }
  ]

  return (
    <Drawer
      anchor='right'
      open={isBranchEditorOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600 } }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
        <IconButton onClick={handleClose}>
          <i className='ri-close-line' />
        </IconButton>
      </Box>

      {/* Section Tabs */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2
        }}
      >
        {sections.map(section => (
          <Box
            key={section.id}
            onClick={() => setCurrentSection(section.id as typeof currentSection)}
            sx={{
              px: 2,
              py: 1.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: 2,
              borderColor: currentSection === section.id ? 'primary.main' : 'transparent',
              color: currentSection === section.id ? 'primary.main' : 'text.secondary',
              transition: 'all 0.2s',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <i className={section.icon} style={{ fontSize: 18 }} />
            <Typography variant='body2' fontWeight={currentSection === section.id ? 600 : 400}>
              {section.label}
            </Typography>
          </Box>
        ))}
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

            <TextField
              fullWidth
              label='Address'
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              multiline
              rows={2}
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
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Select services available at this branch
            </Typography>

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
                    ${service.price}
                  </Typography>
                </Paper>
              ))}
            </Box>

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
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Select staff members assigned to this branch
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {availableStaff.map(staff => (
                <Paper
                  key={staff.id}
                  variant='outlined'
                  onClick={() => toggleStaff(staff.id)}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    minWidth: 200,
                    bgcolor: formData.staffIds.includes(staff.id) ? 'action.selected' : 'transparent',
                    borderColor: formData.staffIds.includes(staff.id) ? 'primary.main' : 'divider',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                >
                  <Checkbox checked={formData.staffIds.includes(staff.id)} size='small' />
                  <Avatar sx={{ bgcolor: staff.color || 'primary.main', width: 36, height: 36, fontSize: '0.9rem' }}>
                    {staff.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Avatar>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>
                      {staff.name}
                    </Typography>
                    {staff.title && (
                      <Typography variant='caption' color='text.secondary'>
                        {staff.title}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant='body2'>
                <strong>{formData.staffIds.length}</strong> staff members selected
              </Typography>
            </Box>
          </Box>
        )}

        {/* Working Hours Section */}
        {currentSection === 'hours' && (
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Set working hours for each day of the week
            </Typography>

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
                        <TextField
                          type='time'
                          size='small'
                          value={hours.openTime}
                          onChange={e => updateWorkingHours(hours.day, 'openTime', e.target.value)}
                          sx={{ width: 130 }}
                        />
                        <Typography color='text.secondary'>to</Typography>
                        <TextField
                          type='time'
                          size='small'
                          value={hours.closeTime}
                          onChange={e => updateWorkingHours(hours.day, 'closeTime', e.target.value)}
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

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}
      >
        <Button variant='outlined' onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={!formData.name.trim()}>
          {editingBranch ? 'Save Changes' : 'Create Branch'}
        </Button>
      </Box>
    </Drawer>
  )
}
