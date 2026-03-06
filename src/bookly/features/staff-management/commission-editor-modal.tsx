'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert
} from '@mui/material'

import { useStaffManagementStore } from './staff-store'
import type { CommissionPolicy } from '../calendar/types'

interface CommissionEditorModalProps {
  open: boolean
  onClose: () => void
  policy: CommissionPolicy | null
  scope: CommissionPolicy['scope'] | null
  selectedStaffId: string
}

export function CommissionEditorModal({ open, onClose, policy, scope, selectedStaffId }: CommissionEditorModalProps) {
  const { createCommissionPolicy, updateCommissionPolicy, staffMembers } = useStaffManagementStore()

  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState(40)
  const [appliesTo, setAppliesTo] = useState<'serviceProvider' | 'seller'>('serviceProvider')
  const [staffScope, setStaffScope] = useState<'all' | string[]>('all')
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'error'
  })

  // Load policy data if editing
  useEffect(() => {
    if (policy) {
      setType(policy.type)
      setValue(policy.value)
      setAppliesTo(policy.appliesTo)
      setStaffScope(policy.staffScope === 'all' ? 'all' : policy.staffScope.staffIds)
    } else {
      // Reset for new policy
      setType('percent')
      setValue(scope === 'serviceCategory' || scope === 'service' ? 40 : 20)
      setAppliesTo('serviceProvider')
      setStaffScope(selectedStaffId === 'all' ? 'all' : [selectedStaffId])
    }
  }, [policy, scope, selectedStaffId, open])

  const handleSave = async () => {
    if (!scope) return

    const policyData: Omit<CommissionPolicy, 'id'> = {
      scope,
      type,
      value,
      appliesTo,
      staffScope: staffScope === 'all' ? ('all' as const) : { staffIds: staffScope as string[] }
    }

    try {
      if (policy) {
        // Update existing
        await updateCommissionPolicy(policy.id, policyData)
      } else {
        // Create new
        await createCommissionPolicy(policyData as Omit<CommissionPolicy, 'id'>)
      }
      onClose()
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to save commission policy', severity: 'error' })
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const handleStaffScopeChange = (e: any) => {
    const value = e.target.value
    setStaffScope(typeof value === 'string' ? value.split(',') : value)
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Typography variant='h5' fontWeight={600}>
          {policy ? 'Edit Commission Policy' : 'New Commission Policy'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Set commission rate and application rules
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Type Selection */}
          <Box>
            <Typography variant='subtitle2' gutterBottom fontWeight={600}>
              Commission Type *
            </Typography>
            <ToggleButtonGroup value={type} exclusive onChange={(_, newType) => newType && setType(newType)} fullWidth>
              <ToggleButton value='percent'>
                <i className='ri-percent-line' style={{ marginRight: 8 }} />
                Percentage of Sale
              </ToggleButton>
              <ToggleButton value='fixed'>
                <i className='ri-money-dollar-circle-line' style={{ marginRight: 8 }} />
                Fixed Amount
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Value Input */}
          <TextField
            type='number'
            label={type === 'percent' ? 'Percentage' : 'Amount'}
            value={value}
            onChange={e => setValue(Number(e.target.value))}
            InputProps={{
              startAdornment: type === 'percent' ? '%' : '$',
              endAdornment: type === 'percent' ? ' of sale' : ' per transaction'
            }}
            helperText={type === 'percent' ? 'Enter percentage (e.g., 40 for 40%)' : 'Enter fixed dollar amount'}
            required
            fullWidth
          />

          {/* Preview */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.main'
            }}
          >
            <Typography variant='caption' color='primary.dark'>
              <strong>Example:</strong> For a EGP {type === 'percent' ? '100' : '50'} sale, the commission would be{' '}
              <strong>EGP {type === 'percent' ? ((value / 100) * 100).toFixed(2) : value.toFixed(2)}</strong>
            </Typography>
          </Box>

          {/* Applies To */}
          <Box>
            <Typography variant='subtitle2' gutterBottom fontWeight={600}>
              Applies To *
            </Typography>
            <RadioGroup value={appliesTo} onChange={e => setAppliesTo(e.target.value as 'serviceProvider' | 'seller')}>
              <FormControlLabel
                value='serviceProvider'
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant='body2' fontWeight={500}>
                      Service Provider
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Person who performs the service
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value='seller'
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant='body2' fontWeight={500}>
                      Seller
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Person who made the sale (products, gift cards, etc.)
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Box>

          {/* Staff Scope */}
          <Box>
            <Typography variant='subtitle2' gutterBottom fontWeight={600}>
              Staff Application
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Apply to</InputLabel>
              {staffScope === 'all' ? (
                <Select
                  value='all'
                  onChange={e => setStaffScope(e.target.value === 'all' ? 'all' : [])}
                  label='Apply to'
                >
                  <MenuItem value='all'>All Staff (Default Policy)</MenuItem>
                  <MenuItem value='custom'>Specific Staff Members</MenuItem>
                </Select>
              ) : (
                <Select
                  multiple
                  value={staffScope}
                  onChange={handleStaffScopeChange}
                  input={<OutlinedInput label='Apply to' />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map(staffId => {
                        const staff = staffMembers.find(s => s.id === staffId)
                        return <Chip key={staffId} label={staff?.name} size='small' />
                      })}
                    </Box>
                  )}
                >
                  {staffMembers.map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
              {staffScope === 'all'
                ? 'This policy will apply to all staff members by default'
                : `This policy will only apply to ${(staffScope as string[]).length} selected staff member${(staffScope as string[]).length !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleSave} variant='contained'>
          {policy ? 'Save Changes' : 'Create Policy'}
        </Button>
      </DialogActions>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}
