'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Tooltip,
  Grid
} from '@mui/material'
import { useServicesStore } from './services-store'
import type {
  ExtendedService,
  ServiceFormData,
  PaddingTimeRule,
  TaxRate,
  BookingInterval,
  PaddingTime,
  ProcessingTime,
  ClientQuestion,
  ClientQuestionType
} from './types'
import {
  DEFAULT_SERVICE_FORM_DATA,
  DEFAULT_CLIENT_SETTINGS,
  PADDING_RULE_OPTIONS,
  TAX_RATE_OPTIONS,
  MINUTES_OPTIONS,
  HOURS_OPTIONS,
  INTERVAL_MINUTES_OPTIONS,
  TOOLTIPS
} from './types'
import { SERVICE_COLORS } from './mock-data'

// Tooltip icon component
const TooltipIcon = ({ title }: { title: string }) => (
  <Tooltip
    title={title}
    placement='top'
    arrow
    slotProps={{
      tooltip: {
        sx: {
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 3,
          p: 2,
          maxWidth: 280,
          fontSize: '0.875rem',
          lineHeight: 1.5,
          border: '1px solid',
          borderColor: 'divider'
        }
      },
      arrow: {
        sx: {
          color: 'background.paper',
          '&::before': {
            border: '1px solid',
            borderColor: 'divider'
          }
        }
      }
    }}
  >
    <IconButton size='small' sx={{ ml: 0.5, p: 0.5 }}>
      <i className='ri-question-line' style={{ fontSize: 16, color: 'var(--mui-palette-text-disabled)' }} />
    </IconButton>
  </Tooltip>
)

// Field label with optional tooltip
const FieldLabel = ({ label, tooltip }: { label: string; tooltip?: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    {tooltip && <TooltipIcon title={tooltip} />}
  </Box>
)

export function ServiceEditorDrawer() {
  const { isServiceDialogOpen, editingService, closeServiceDialog, createService, updateService, categories } =
    useServicesStore()

  const [formData, setFormData] = useState<ServiceFormData>(DEFAULT_SERVICE_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when dialog opens
  useEffect(() => {
    if (isServiceDialogOpen) {
      if (editingService) {
        setFormData({
          name: editingService.name,
          description: editingService.description || '',
          price: editingService.price,
          duration: editingService.duration,
          categoryId: editingService.categoryId || '',
          color: editingService.color || SERVICE_COLORS[0],
          bookingInterval: editingService.bookingInterval || { hours: 0, minutes: 15 },
          paddingTime: editingService.paddingTime || { rule: 'none', minutes: 0 },
          processingTime: editingService.processingTime || {
            during: { hours: 0, minutes: 0 },
            after: { hours: 0, minutes: 0 }
          },
          taxRate: editingService.taxRate || 'tax_free',
          parallelClients: editingService.parallelClients || 1,
          clientSettings: editingService.clientSettings || DEFAULT_CLIENT_SETTINGS
        })
      } else {
        setFormData(DEFAULT_SERVICE_FORM_DATA)
      }
      setErrors({})
    }
  }, [isServiceDialogOpen, editingService])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required'
    }

    const price = Number(formData.price)
    if (!formData.price || price < 0) {
      newErrors.price = 'Price must be 0 or greater'
    }

    const duration = Number(formData.duration)
    if (!formData.duration || duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const serviceData: Omit<ExtendedService, 'id'> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: Number(formData.price),
      duration: Number(formData.duration),
      categoryId: formData.categoryId || undefined,
      color: formData.color,
      bookingInterval: formData.bookingInterval,
      paddingTime: formData.paddingTime,
      processingTime: formData.processingTime,
      taxRate: formData.taxRate,
      parallelClients: formData.parallelClients,
      clientSettings: formData.clientSettings
    }

    if (editingService) {
      updateService(editingService.id, serviceData)
    } else {
      createService(serviceData)
    }

    closeServiceDialog()
  }

  const handleClose = () => {
    closeServiceDialog()
    setFormData(DEFAULT_SERVICE_FORM_DATA)
    setErrors({})
  }

  const updateBookingInterval = (field: 'hours' | 'minutes', value: number) => {
    setFormData(prev => ({
      ...prev,
      bookingInterval: { ...prev.bookingInterval, [field]: value }
    }))
  }

  const updatePaddingTime = (field: 'rule' | 'minutes', value: PaddingTimeRule | number) => {
    setFormData(prev => ({
      ...prev,
      paddingTime: { ...prev.paddingTime, [field]: value }
    }))
  }

  const updateProcessingTime = (timeType: 'during' | 'after', field: 'hours' | 'minutes', value: number) => {
    setFormData(prev => ({
      ...prev,
      processingTime: {
        ...prev.processingTime,
        [timeType]: { ...prev.processingTime[timeType], [field]: value }
      }
    }))
  }

  return (
    <Drawer
      anchor='right'
      open={isServiceDialogOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 }, maxWidth: '100%' }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant='h6' fontWeight={600}>
            {editingService ? 'Edit Service' : 'New Service'}
          </Typography>
          <IconButton onClick={handleClose}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Info Section */}
            <Grid item xs={12}>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                Basic Information
              </Typography>
            </Grid>

            {/* Service Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Service Name'
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Description'
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>

            {/* Price and Duration */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                type='number'
                label='Price'
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type='number'
                label='Duration'
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                error={!!errors.duration}
                helperText={errors.duration}
                InputProps={{
                  endAdornment: <InputAdornment position='end'>min</InputAdornment>
                }}
                required
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  label='Category'
                >
                  <MenuItem value=''>
                    <em>Not categorized</em>
                  </MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Color */}
            <Grid item xs={12}>
              <FieldLabel label='Service Color' />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SERVICE_COLORS.map(color => (
                  <Box
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: 3,
                      borderColor: formData.color === color ? 'primary.main' : 'transparent',
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: formData.color === color ? 'primary.main' : 'action.hover'
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Booking Settings Section */}
            <Grid item xs={12}>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                Booking Settings
              </Typography>
            </Grid>

            {/* Booking Intervals */}
            <Grid item xs={12}>
              <FieldLabel label='Booking Intervals' tooltip={TOOLTIPS.bookingInterval} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>hour...</InputLabel>
                    <Select
                      value={formData.bookingInterval.hours}
                      onChange={e => updateBookingInterval('hours', Number(e.target.value))}
                      label='hour...'
                    >
                      {HOURS_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>minutes</InputLabel>
                    <Select
                      value={formData.bookingInterval.minutes}
                      onChange={e => updateBookingInterval('minutes', Number(e.target.value))}
                      label='minutes'
                    >
                      {INTERVAL_MINUTES_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Padding Time */}
            <Grid item xs={12}>
              <FieldLabel label='Padding Time' tooltip={TOOLTIPS.paddingTime} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Rule</InputLabel>
                    <Select
                      value={formData.paddingTime.rule}
                      onChange={e => updatePaddingTime('rule', e.target.value as PaddingTimeRule)}
                      label='Rule'
                    >
                      {PADDING_RULE_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>minutes</InputLabel>
                    <Select
                      value={formData.paddingTime.minutes}
                      onChange={e => updatePaddingTime('minutes', Number(e.target.value))}
                      label='minutes'
                      disabled={formData.paddingTime.rule === 'none'}
                    >
                      {MINUTES_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Processing Time During */}
            {/* <Grid item xs={12}>
              <FieldLabel label='Processing time during the service' tooltip={TOOLTIPS.processingTimeDuring} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>hour...</InputLabel>
                    <Select
                      value={formData.processingTime.during.hours}
                      onChange={e => updateProcessingTime('during', 'hours', Number(e.target.value))}
                      label='hour...'
                    >
                      {HOURS_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>minutes</InputLabel>
                    <Select
                      value={formData.processingTime.during.minutes}
                      onChange={e => updateProcessingTime('during', 'minutes', Number(e.target.value))}
                      label='minutes'
                    >
                      {MINUTES_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid> */}

            {/* Processing Time After */}
            {/* <Grid item xs={12}>
              <FieldLabel label='Processing time after the service' tooltip={TOOLTIPS.processingTimeAfter} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>hour...</InputLabel>
                    <Select
                      value={formData.processingTime.after.hours}
                      onChange={e => updateProcessingTime('after', 'hours', Number(e.target.value))}
                      label='hour...'
                    >
                      {HOURS_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>minutes</InputLabel>
                    <Select
                      value={formData.processingTime.after.minutes}
                      onChange={e => updateProcessingTime('after', 'minutes', Number(e.target.value))}
                      label='minutes'
                    >
                      {MINUTES_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid> */}

            {/* Parallel Clients */}
            {/* <Grid item xs={12}>
              <FieldLabel label='Parallel Clients' tooltip={TOOLTIPS.parallelClients} />
              <TextField
                fullWidth
                size='small'
                type='number'
                value={formData.parallelClients}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    parallelClients: Math.max(1, parseInt(e.target.value) || 1)
                  }))
                }
                inputProps={{ min: 1 }}
              />
            </Grid> */}

            {/* Tax Rate */}
            <Grid item xs={12}>
              <FieldLabel label='Tax Rate' tooltip={TOOLTIPS.taxRate} />
              <FormControl fullWidth size='small'>
                <Select
                  value={formData.taxRate}
                  onChange={e => setFormData(prev => ({ ...prev, taxRate: e.target.value as TaxRate }))}
                >
                  {TAX_RATE_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* For Client Section */}
            <Grid item xs={12}>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                For Client
              </Typography>
            </Grid>

            {/* Message to Client */}
            <Grid item xs={12}>
              <Typography variant='body1' fontWeight={500} sx={{ mb: 1 }}>
                Message to Client
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder='E.g. Please do not eat 1 hour before the appointment.'
                value={formData.clientSettings.message}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    clientSettings: { ...prev.clientSettings, message: e.target.value }
                  }))
                }
              />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                This message will be sent to your client before the appointment.
              </Typography>
            </Grid>

            {/* Questions to Client */}
            <Grid item xs={12}>
              <Typography variant='body1' fontWeight={500} sx={{ mb: 2 }}>
                Questions to Client
              </Typography>

              {/* Existing questions */}
              {formData.clientSettings.questions.map((question, index) => (
                <Box
                  key={question.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 2,
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='body2' fontWeight={500}>
                      {question.question}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {question.type === 'text' && 'Short answer'}
                      {question.type === 'textarea' && 'Long answer'}
                      {question.type === 'select' && `Dropdown (${question.options?.join(', ')})`}
                      {question.type === 'checkbox' && 'Checkbox'}
                      {question.required && ' • Required'}
                    </Typography>
                  </Box>
                  <IconButton
                    size='small'
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        clientSettings: {
                          ...prev.clientSettings,
                          questions: prev.clientSettings.questions.filter((_, i) => i !== index)
                        }
                      }))
                    }}
                  >
                    <i className='ri-delete-bin-line' style={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}

              {/* Add Question Button */}
              <Button
                variant='text'
                startIcon={<i className='ri-add-line' />}
                onClick={() => {
                  const newQuestion: ClientQuestion = {
                    id: `q-${Date.now()}`,
                    question: 'New Question',
                    type: 'text',
                    required: false
                  }
                  setFormData(prev => ({
                    ...prev,
                    clientSettings: {
                      ...prev.clientSettings,
                      questions: [...prev.clientSettings.questions, newQuestion]
                    }
                  }))
                }}
                sx={{ color: 'text.primary' }}
              >
                Add Question
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button fullWidth variant='outlined' onClick={handleClose}>
            Cancel
          </Button>
          <Button fullWidth variant='contained' onClick={handleSubmit}>
            {editingService ? 'Save Changes' : 'Create Service'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
