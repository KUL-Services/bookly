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

import type { StepProps } from '../types'
import type { StaffMember } from '../types'

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
  const [editingId, setEditingId] = useState<string | null>(null)

  // Initialize owner as first staff member
  useEffect(() => {
    // Initialize staff array if undefined or add owner if empty
    if ((!formData.staff || formData.staff.length === 0) && formData.ownerName) {
      const ownerStaff: StaffMember = {
        id: 'owner',
        name: formData.ownerName,
        role: 'Owner',
        isOwner: true
      }
      updateFormData({ staff: [ownerStaff] })
    }
  }, [formData.ownerName, formData.staff, updateFormData])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.staff || formData.staff.length === 0) {
      errors.staff = 'At least one staff member (you) is required'
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
    } else {
      setEditingId(null)
      setNewStaffName('')
      setNewStaffRole('')
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setNewStaffName('')
    setNewStaffRole('')
    setEditingId(null)
  }

  const handleSaveStaff = () => {
    if (!newStaffName.trim() || !newStaffRole.trim()) return

    const currentStaff = formData.staff || []

    if (editingId) {
      // Edit existing staff
      const updatedStaff = currentStaff.map((s) =>
        s.id === editingId ? { ...s, name: newStaffName, role: newStaffRole } : s
      )
      updateFormData({ staff: updatedStaff })
    } else {
      // Add new staff
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: newStaffName,
        role: newStaffRole,
        isOwner: false
      }
      updateFormData({ staff: [...currentStaff, newStaff] })
    }

    handleCloseDialog()
  }

  const handleDeleteStaff = (id: string) => {
    if (!formData.staff) return

    // Prevent deleting owner
    const staffMember = formData.staff.find((s) => s.id === id)
    if (staffMember?.isOwner) return

    const updatedStaff = formData.staff.filter((s) => s.id !== id)
    updateFormData({ staff: updatedStaff })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Add Staff Members
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Who will be providing services at your business?
        </Typography>
      </div>

      {validationErrors.staff && (
        <Alert severity="error">{validationErrors.staff}</Alert>
      )}

      {/* Staff List */}
      <div className="flex flex-col gap-3">
        {formData.staff && formData.staff.map((staff) => (
          <Card key={staff.id} variant="outlined" className="shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <Box className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <Box className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    {staff.name}
                    {staff.isOwner && (
                      <Chip
                        label="You"
                        size="small"
                        color="primary"
                        className="ml-2"
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="text-sm">
                    {staff.role}
                  </Typography>
                </Box>
              </Box>

              {!staff.isOwner && (
                <Box className="flex gap-1">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(staff)}
                    className="text-primary"
                  >
                    <i className="ri-pencil-line" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="text-error"
                  >
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Staff Button */}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => handleOpenDialog()}
        startIcon={<i className="ri-user-add-line" />}
        className="border-2 border-dashed"
      >
        Add Staff Member
      </Button>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
        <DialogContent className="pt-4">
          <div className="flex flex-col gap-4">
            <TextField
              fullWidth
              label="Full Name"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              placeholder="e.g., Ahmed Hassan"
              autoFocus
            />
            <TextField
              fullWidth
              label="Role / Position"
              value={newStaffRole}
              onChange={(e) => setNewStaffRole(e.target.value)}
              placeholder="e.g., Barber, Stylist, Manager"
              helperText="The role or specialty of this staff member"
            />
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveStaff}
            disabled={!newStaffName.trim() || !newStaffRole.trim()}
          >
            {editingId ? 'Save Changes' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation */}
      <Box className="flex gap-3 justify-between mt-4">
        <Button variant="outlined" onClick={handlePrev}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!formData.staff || formData.staff.length === 0}
        >
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default StaffManagementStep
