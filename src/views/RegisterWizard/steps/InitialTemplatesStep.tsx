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
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { useMediaQuery, useTheme } from '@mui/material'
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'

import type { StepProps, BasicTemplate } from '../types'
import { CLASS_DURATIONS, DAYS_OF_WEEK } from '../types'

const InitialTemplatesStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [tempTemplate, setTempTemplate] = useState<Partial<BasicTemplate>>({
    name: '',
    roomId: '',
    instructorStaffId: '',
    capacity: 10,
    duration: 60,
    description: '',
    weeklySchedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
  })

  const availableRooms = formData.rooms || []
  const availableStaff = formData.staff || []

  const validate = (): boolean => {
    return true
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleOpenDialog = (template?: BasicTemplate) => {
    if (template) {
      setEditingTemplateId(template.id)
      setTempTemplate(template)
    } else {
      setEditingTemplateId(null)
      setTempTemplate({
        name: '',
        roomId: availableRooms[0]?.id || '',
        instructorStaffId: availableStaff[0]?.id || '',
        capacity: availableRooms[0]?.capacity || 10,
        duration: 60,
        description: '',
        weeklySchedule: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        }
      })
    }
    setActiveTab(0)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTemplateId(null)
    setActiveTab(0)
  }

  const handleAddTimeToDay = (day: string, time: string) => {
    if (!time) return

    const currentTimes = tempTemplate.weeklySchedule?.[day] || []
    if (currentTimes.includes(time)) return // Prevent duplicates

    setTempTemplate(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule!,
        [day]: [...currentTimes, time].sort()
      }
    }))
  }

  const handleRemoveTimeFromDay = (day: string, time: string) => {
    setTempTemplate(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule!,
        [day]: (prev.weeklySchedule?.[day] || []).filter(t => t !== time)
      }
    }))
  }

  const handleRoomChange = (roomId: string) => {
    const room = availableRooms.find(r => r.id === roomId)
    setTempTemplate(prev => ({
      ...prev,
      roomId,
      capacity: room?.capacity || 10
    }))
  }

  const handleSaveTemplate = () => {
    if (!tempTemplate.name || !tempTemplate.roomId || !tempTemplate.instructorStaffId) {
      return
    }

    const hasTimeSlots = Object.values(tempTemplate.weeklySchedule || {}).some(slots => slots.length > 0)
    if (!hasTimeSlots) {
      alert('Please add at least one time slot to the weekly schedule')
      return
    }

    const currentTemplates = formData.initialTemplates || []

    if (editingTemplateId) {
      const updatedTemplates = currentTemplates.map(t =>
        t.id === editingTemplateId ? ({ ...tempTemplate, id: editingTemplateId } as BasicTemplate) : t
      )
      updateFormData({ initialTemplates: updatedTemplates })
    } else {
      const newTemplate: BasicTemplate = {
        ...tempTemplate,
        id: `template-${Date.now()}`,
        capacity: tempTemplate.capacity || 10,
        duration: tempTemplate.duration || 60
      } as BasicTemplate
      updateFormData({ initialTemplates: [...currentTemplates, newTemplate] })
    }

    handleCloseDialog()
  }

  const handleDeleteTemplate = (id: string) => {
    if (!formData.initialTemplates) return
    const updatedTemplates = formData.initialTemplates.filter(t => t.id !== id)
    updateFormData({ initialTemplates: updatedTemplates })
  }

  const getRoomName = (roomId: string) => {
    return availableRooms.find(r => r.id === roomId)?.name || 'Unknown Room'
  }

  const getStaffName = (staffId: string) => {
    return availableStaff.find(s => s.id === staffId)?.name || 'Unknown Instructor'
  }

  const getScheduleSummary = (template: BasicTemplate) => {
    const daysWithSlots = Object.entries(template.weeklySchedule)
      .filter(([_, slots]) => slots.length > 0)
      .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1, 3))

    return daysWithSlots.length > 0 ? daysWithSlots.join(', ') : 'No schedule'
  }

  const DayScheduleInput = ({ day }: { day: string }) => {
    const [newTime, setNewTime] = useState('')
    const slots = tempTemplate.weeklySchedule?.[day] || []
    const hasSlots = slots.length > 0

    return (
      <Accordion
        defaultExpanded={!isMobile && ['monday', 'tuesday', 'wednesday'].includes(day)}
        sx={{
          '&:before': { display: 'none' },
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          '&:not(:last-child)': { mb: 1 }
        }}
      >
        <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />} sx={{ minHeight: { xs: 48, sm: 56 } }}>
          <Box className='flex items-center justify-between w-full pr-2'>
            <Typography className='capitalize font-medium'>{day}</Typography>
            {hasSlots && (
              <Chip
                label={`${slots.length} ${slots.length === 1 ? 'time' : 'times'}`}
                size='small'
                color='primary'
                variant='outlined'
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box className='flex flex-col gap-3'>
            {/* Time input */}
            <Box className='flex gap-2'>
              <TimeSelectField
                label='Add Time'
                value={newTime}
                onChange={value => setNewTime(value)}
                size='small'
                fullWidth
              />
              <Button
                variant='contained'
                size='small'
                onClick={() => {
                  handleAddTimeToDay(day, newTime)
                  setNewTime('')
                }}
                disabled={!newTime}
                sx={{ minWidth: { xs: 70, sm: 80 } }}
              >
                Add
              </Button>
            </Box>

            {/* Display added times */}
            {hasSlots && (
              <Box className='flex flex-wrap gap-2'>
                {slots.map(time => (
                  <Chip
                    key={time}
                    label={time}
                    size='medium'
                    onDelete={() => handleRemoveTimeFromDay(day, time)}
                    color='primary'
                    variant='outlined'
                  />
                ))}
              </Box>
            )}

            {!hasSlots && (
              <Typography variant='caption' color='text.secondary' className='text-center py-2'>
                No times added for this day
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    )
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='text-center mb-2'>
        <Typography variant='h5' className='mb-2'>
          Create Your First Class Template
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Optional: Set up recurring class schedules to get started faster
        </Typography>
      </div>

      <Alert severity='info' icon={<i className='ri-information-line' />}>
        <Typography variant='body2'>
          Templates define recurring weekly classes. You can skip this step and create templates later in the calendar
          settings.
        </Typography>
      </Alert>

      {/* Templates List */}
      {formData.initialTemplates && formData.initialTemplates.length > 0 && (
        <div className='flex flex-col gap-3'>
          {formData.initialTemplates.map(template => (
            <Card key={template.id} variant='outlined' className='shadow-sm'>
              <CardContent className='p-4'>
                <Box className='flex items-start justify-between gap-3'>
                  <Box className='flex items-start gap-3 flex-1'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0'>
                      <i className='ri-calendar-event-line text-xl' />
                    </div>
                    <Box className='flex-1 min-w-0'>
                      <Typography variant='body1' className='font-medium mb-1'>
                        {template.name}
                      </Typography>
                      <Box className='flex flex-wrap gap-1 mb-2'>
                        <Chip label={`${template.duration} min`} size='small' variant='outlined' />
                        <Chip label={`Cap: ${template.capacity}`} size='small' variant='outlined' />
                      </Box>
                      <Typography variant='body2' color='text.secondary' className='text-sm'>
                        {getRoomName(template.roomId)} • {getStaffName(template.instructorStaffId)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' className='text-xs'>
                        {getScheduleSummary(template)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className='flex gap-1 flex-shrink-0'>
                    <IconButton size='small' onClick={() => handleOpenDialog(template)} className='text-primary'>
                      <i className='ri-pencil-line' />
                    </IconButton>
                    <IconButton size='small' onClick={() => handleDeleteTemplate(template.id)} className='text-error'>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Template Button */}
      <Button
        fullWidth
        variant='outlined'
        onClick={() => handleOpenDialog()}
        startIcon={<i className='ri-add-line' />}
        className='border-2 border-dashed'
        disabled={availableRooms.length === 0 || availableStaff.length === 0}
        sx={{ py: { xs: 1.5, sm: 1 } }}
      >
        Create Class Template
      </Button>

      {(availableRooms.length === 0 || availableStaff.length === 0) && (
        <Alert severity='warning'>You need at least one room and one staff member to create templates.</Alert>
      )}

      {/* Add/Edit Template Dialog - Mobile Optimized */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='md' fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box className='flex items-center justify-between'>
            <Typography variant='h6'>{editingTemplateId ? 'Edit Template' : 'Create Class Template'}</Typography>
            {isMobile && (
              <IconButton onClick={handleCloseDialog} size='small'>
                <i className='ri-close-line' />
              </IconButton>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label='Basic Info' />
            <Tab label='Schedule' />
          </Tabs>

          {/* Tab 1: Basic Information */}
          {activeTab === 0 && (
            <div className='flex flex-col gap-4'>
              <TextField
                fullWidth
                label='Class Name'
                value={tempTemplate.name}
                onChange={e => setTempTemplate({ ...tempTemplate, name: e.target.value })}
                placeholder='e.g., Morning Yoga, HIIT Class'
                required
                autoFocus={!isMobile}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label='Description (Optional)'
                value={tempTemplate.description || ''}
                onChange={e => setTempTemplate({ ...tempTemplate, description: e.target.value })}
                placeholder='Brief description of this class...'
              />

              <FormControl fullWidth required>
                <InputLabel>Room / Facility</InputLabel>
                <Select
                  value={tempTemplate.roomId || ''}
                  label='Room / Facility'
                  onChange={e => handleRoomChange(e.target.value)}
                >
                  {availableRooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name} (Cap: {room.capacity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Instructor</InputLabel>
                <Select
                  value={tempTemplate.instructorStaffId || ''}
                  label='Instructor'
                  onChange={e => setTempTemplate({ ...tempTemplate, instructorStaffId: e.target.value })}
                >
                  {availableStaff.map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={tempTemplate.duration || 60}
                    label='Duration'
                    onChange={e => setTempTemplate({ ...tempTemplate, duration: e.target.value as number })}
                  >
                    {CLASS_DURATIONS.map(duration => (
                      <MenuItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type='number'
                  label='Max Capacity'
                  value={tempTemplate.capacity}
                  onChange={e => setTempTemplate({ ...tempTemplate, capacity: parseInt(e.target.value) || 10 })}
                  inputProps={{
                    min: 1,
                    max: availableRooms.find(r => r.id === tempTemplate.roomId)?.capacity || 100
                  }}
                />
              </Box>

              {!isMobile && (
                <Alert severity='info' icon={<i className='ri-information-line' />}>
                  Click on the "Schedule" tab to add weekly recurring times for this class.
                </Alert>
              )}
            </div>
          )}

          {/* Tab 2: Weekly Schedule */}
          {activeTab === 1 && (
            <div className='flex flex-col gap-2'>
              <Typography variant='subtitle2' className='mb-2'>
                Add class times for each day of the week
              </Typography>

              {DAYS_OF_WEEK.map(day => (
                <DayScheduleInput key={day} day={day} />
              ))}

              {Object.values(tempTemplate.weeklySchedule || {}).every(slots => slots.length === 0) && (
                <Alert severity='warning' className='mt-3'>
                  Please add at least one time slot to create this template.
                </Alert>
              )}
            </div>
          )}
        </DialogContent>

        <DialogActions className='p-4 gap-2'>
          <Button onClick={handleCloseDialog} fullWidth={isMobile}>
            Cancel
          </Button>
          {activeTab === 0 && (
            <Button variant='outlined' onClick={() => setActiveTab(1)} fullWidth={isMobile}>
              Next: Add Schedule
            </Button>
          )}
          {activeTab === 1 && (
            <>
              <Button variant='outlined' onClick={() => setActiveTab(0)} fullWidth={isMobile}>
                Back
              </Button>
              <Button
                variant='contained'
                onClick={handleSaveTemplate}
                disabled={!tempTemplate.name || !tempTemplate.roomId || !tempTemplate.instructorStaffId}
                fullWidth={isMobile}
              >
                {editingTemplateId ? 'Save Changes' : 'Create Template'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Navigation */}
      <Box className='flex flex-col sm:flex-row gap-3 justify-between mt-4'>
        <Button variant='outlined' onClick={handlePrev} fullWidth={isMobile}>
          Back
        </Button>
        <Box className='flex gap-2'>
          <Button variant='outlined' onClick={handleSkip} fullWidth={isMobile}>
            Skip for Now
          </Button>
          <Button variant='contained' onClick={handleContinue} fullWidth={isMobile}>
            Continue
          </Button>
        </Box>
      </Box>
    </div>
  )
}

export default InitialTemplatesStep
