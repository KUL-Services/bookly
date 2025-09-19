'use client'

import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// Types
import type { CreateStaffRequest, Branch } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateStaffRequest & { branchIds: string[] }) => void
  branches: Branch[]
}

const CreateStaffDialog = ({ open, onClose, onSubmit, branches }: Props) => {
  const [formData, setFormData] = useState<CreateStaffRequest & { branchIds: string[] }>({
    name: '',
    mobile: '',
    branchIds: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Staff name is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      mobile: '',
      branchIds: []
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Staff Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Full Name'
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Mobile Number'
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder='e.g., +1234567890'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign to Branches</InputLabel>
                <Select
                  multiple
                  value={formData.branchIds}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchIds: e.target.value as string[] }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((branchId) => {
                        const branch = branches.find(b => b.id === branchId)
                        return (
                          <Chip key={branchId} label={branch?.name || branchId} size="small" />
                        )
                      })}
                    </Box>
                  )}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' variant='contained'>
            Add Staff Member
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateStaffDialog