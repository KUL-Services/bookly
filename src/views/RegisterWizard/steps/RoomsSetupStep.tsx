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

import type { StepProps, Room } from '../types'
import { ROOM_AMENITIES } from '../types'

const RoomsSetupStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [tempRoom, setTempRoom] = useState<Partial<Room>>({
    name: '',
    capacity: 10,
    branchId: '',
    floor: '',
    amenities: []
  })

  const availableBranches = formData.branches || []

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.rooms || formData.rooms.length === 0) {
      errors.rooms = 'Please add at least one room/facility for your classes or sessions'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoomId(room.id)
      setTempRoom(room)
    } else {
      setEditingRoomId(null)
      setTempRoom({
        name: '',
        capacity: 10,
        branchId: availableBranches[0]?.id || '',
        floor: '',
        amenities: []
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRoomId(null)
    setTempRoom({
      name: '',
      capacity: 10,
      branchId: '',
      floor: '',
      amenities: []
    })
  }

  const handleSaveRoom = () => {
    if (!tempRoom.name || !tempRoom.branchId || !tempRoom.capacity || tempRoom.capacity < 1) {
      return
    }

    const currentRooms = formData.rooms || []

    if (editingRoomId) {
      // Edit existing room
      const updatedRooms = currentRooms.map(r =>
        r.id === editingRoomId ? { ...tempRoom, id: editingRoomId } as Room : r
      )
      updateFormData({ rooms: updatedRooms })
    } else {
      // Add new room
      const newRoom: Room = {
        ...tempRoom,
        id: `room-${Date.now()}`,
        capacity: tempRoom.capacity || 10
      } as Room
      updateFormData({ rooms: [...currentRooms, newRoom] })
    }

    handleCloseDialog()
  }

  const handleDeleteRoom = (id: string) => {
    if (!formData.rooms) return

    const updatedRooms = formData.rooms.filter(r => r.id !== id)
    updateFormData({ rooms: updatedRooms })
  }

  const getBranchName = (branchId: string) => {
    const branch = availableBranches.find(b => b.id === branchId)
    return branch?.name || 'Unknown Branch'
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Set Up Your Rooms & Facilities
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define the spaces where your classes or sessions will take place
        </Typography>
      </div>

      {validationErrors.rooms && (
        <Alert severity="error">{validationErrors.rooms}</Alert>
      )}

      <Alert severity="info" icon={<i className="ri-information-line" />}>
        <Typography variant="body2">
          Rooms are used in static scheduling mode to manage class capacity and booking locations.
          Each room can host multiple sessions throughout the day.
        </Typography>
      </Alert>

      {/* Rooms List */}
      <div className="flex flex-col gap-3">
        {formData.rooms && formData.rooms.map((room) => (
          <Card key={room.id} variant="outlined" className="shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <Box className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                  <i className="ri-door-open-line text-xl" />
                </div>
                <Box className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    {room.name}
                    <Chip
                      label={`Capacity: ${room.capacity}`}
                      size="small"
                      variant="outlined"
                      className="ml-2"
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="text-sm">
                    {getBranchName(room.branchId)}
                    {room.floor && ` • ${room.floor}`}
                    {room.amenities && room.amenities.length > 0 && ` • ${room.amenities.length} amenities`}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex gap-1">
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(room)}
                  className="text-primary"
                >
                  <i className="ri-pencil-line" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteRoom(room.id)}
                  className="text-error"
                >
                  <i className="ri-delete-bin-line" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Room Button */}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => handleOpenDialog()}
        startIcon={<i className="ri-add-line" />}
        className="border-2 border-dashed"
      >
        Add Room / Facility
      </Button>

      {/* Add/Edit Room Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRoomId ? 'Edit Room' : 'Add Room / Facility'}</DialogTitle>
        <DialogContent className="pt-4">
          <div className="flex flex-col gap-4">
            <TextField
              fullWidth
              label="Room Name"
              value={tempRoom.name}
              onChange={(e) => setTempRoom({ ...tempRoom, name: e.target.value })}
              placeholder="e.g., Main Studio, Yoga Room 1, Cardio Area"
              helperText="Give this room a descriptive name"
              autoFocus
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Location (Branch)</InputLabel>
              <Select
                value={tempRoom.branchId || ''}
                label="Location (Branch)"
                onChange={(e) => setTempRoom({ ...tempRoom, branchId: e.target.value })}
              >
                {availableBranches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Maximum Capacity"
              value={tempRoom.capacity}
              onChange={(e) => setTempRoom({ ...tempRoom, capacity: parseInt(e.target.value) || 10 })}
              inputProps={{ min: 1, max: 500 }}
              helperText="Maximum number of participants this room can accommodate"
              required
            />

            <TextField
              fullWidth
              label="Floor / Level (Optional)"
              value={tempRoom.floor || ''}
              onChange={(e) => setTempRoom({ ...tempRoom, floor: e.target.value })}
              placeholder="e.g., 1st Floor, Ground Level, Basement"
              helperText="Help customers find this room easily"
            />

            <FormControl fullWidth>
              <InputLabel>Amenities (Optional)</InputLabel>
              <Select
                multiple
                value={tempRoom.amenities || []}
                onChange={(e) => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                  setTempRoom({ ...tempRoom, amenities: value })
                }}
                input={<OutlinedInput label="Amenities (Optional)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {ROOM_AMENITIES.map((amenity) => (
                  <MenuItem key={amenity} value={amenity}>
                    {amenity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveRoom}
            disabled={!tempRoom.name || !tempRoom.branchId || !tempRoom.capacity || tempRoom.capacity < 1}
          >
            {editingRoomId ? 'Save Changes' : 'Add Room'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Add Presets (Optional Helper) */}
      {(!formData.rooms || formData.rooms.length === 0) && availableBranches.length > 0 && (
        <Box className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <Typography variant="body2" className="font-medium mb-2">
            Quick Start Suggestions:
          </Typography>
          <Box className="flex flex-wrap gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setTempRoom({
                  name: 'Main Studio',
                  capacity: 20,
                  branchId: availableBranches[0].id,
                  amenities: ['Mirrors', 'Sound System', 'Air Conditioning']
                })
                setDialogOpen(true)
              }}
            >
              + Main Studio (20 capacity)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setTempRoom({
                  name: 'Yoga Room',
                  capacity: 15,
                  branchId: availableBranches[0].id,
                  amenities: ['Yoga Mats', 'Mirrors', 'Air Conditioning']
                })
                setDialogOpen(true)
              }}
            >
              + Yoga Room (15 capacity)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setTempRoom({
                  name: 'Private Room',
                  capacity: 5,
                  branchId: availableBranches[0].id,
                  amenities: ['Air Conditioning']
                })
                setDialogOpen(true)
              }}
            >
              + Private Room (5 capacity)
            </Button>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <Box className="flex gap-3 justify-between mt-4">
        <Button variant="outlined" onClick={handlePrev}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!formData.rooms || formData.rooms.length === 0}
        >
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default RoomsSetupStep
