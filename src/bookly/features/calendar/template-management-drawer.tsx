'use client'

import { Drawer, Box, Typography, IconButton, Button, List, ListItem, Chip, Stack, Divider, Alert } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { format } from 'date-fns'
import { useCalendarStore } from './state'
import type { ScheduleTemplate } from './types'

export default function TemplateManagementDrawer() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const isOpen = useCalendarStore(state => state.isTemplateManagementOpen)
  const templates = useCalendarStore(state => state.scheduleTemplates)
  const toggleTemplateManagement = useCalendarStore(state => state.toggleTemplateManagement)
  const toggleTemplateActive = useCalendarStore(state => state.toggleTemplateActive)
  const deleteTemplate = useCalendarStore(state => state.deleteTemplate)
  const generateSlotsFromTemplate = useCalendarStore(state => state.generateSlotsFromTemplate)

  const handleGenerateSlots = (template: ScheduleTemplate) => {
    const startDate = new Date(template.activeFrom)
    const endDate = template.activeUntil ? new Date(template.activeUntil) : new Date()

    // For ongoing templates, generate for next 90 days
    if (!template.activeUntil) {
      endDate.setDate(endDate.getDate() + 90)
    }

    const generatedSlots = generateSlotsFromTemplate(template.id, startDate, endDate)

    // Show success message
    alert(`Successfully generated ${generatedSlots.length} slots from template "${template.name}"`)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This will remove all generated slots.')) {
      deleteTemplate(templateId)
    }
  }

  return (
    <Drawer
      anchor='right'
      open={isOpen}
      onClose={toggleTemplateManagement}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500 },
          bgcolor: 'background.default'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.paper'
          }}
        >
          <Box>
            <Typography variant='h6' fontWeight={600}>
              Schedule Templates
            </Typography>
            <Typography variant='caption' color='text.secondary' fontFamily='var(--font-fira-code)'>
              Manage recurring weekly schedules
            </Typography>
          </Box>
          <IconButton onClick={toggleTemplateManagement} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {templates.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: isDark ? 'rgba(10, 44, 36, 0.1)' : 'rgba(10, 44, 36, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i
                  className='ri-calendar-schedule-line'
                  style={{ fontSize: '2.5rem', color: theme.palette.primary.main }}
                />
              </Box>
              <Typography variant='h6' color='text.secondary' textAlign='center' fontFamily='var(--font-fira-code)'>
                No Templates Yet
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                textAlign='center'
                sx={{ maxWidth: 300, fontFamily: 'var(--font-fira-code)' }}
              >
                Create your first schedule template to automatically generate recurring weekly slots
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              <Alert severity='info' sx={{ mb: 1 }}>
                Templates define recurring weekly patterns. Generate slots to create bookable time slots from templates.
              </Alert>

              <List sx={{ p: 0 }}>
                {templates.map((template, index) => (
                  <Box key={template.id}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <ListItem
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2
                      }}
                    >
                      {/* Template Name and Status */}
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 0.5 }}>
                            {template.name}
                          </Typography>
                          <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
                            <Chip
                              label={template.isActive ? 'Active' : 'Inactive'}
                              size='small'
                              color={template.isActive ? 'success' : 'default'}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={`${template.weeklyPattern.length} weekly slots`}
                              size='small'
                              variant='outlined'
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Stack>
                        </Box>
                        <IconButton
                          size='small'
                          onClick={() => handleDeleteTemplate(template.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <i className='ri-delete-bin-line' />
                        </IconButton>
                      </Box>

                      {/* Date Range */}
                      <Box sx={{ width: '100%' }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ display: 'block', mb: 0.5, fontFamily: 'var(--font-fira-code)' }}
                        >
                          Active Period
                        </Typography>
                        <Typography variant='body2'>
                          {format(new Date(template.activeFrom), 'MMM dd, yyyy')}
                          {' → '}
                          {template.activeUntil ? format(new Date(template.activeUntil), 'MMM dd, yyyy') : 'Ongoing'}
                        </Typography>
                      </Box>

                      {/* Weekly Pattern Preview */}
                      <Box sx={{ width: '100%' }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ display: 'block', mb: 1, fontFamily: 'var(--font-fira-code)' }}
                        >
                          Weekly Pattern
                        </Typography>
                        <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const count = template.weeklyPattern.filter(p => p.dayOfWeek === day).length
                            return (
                              <Chip
                                key={day}
                                label={`${day}: ${count}`}
                                size='small'
                                variant={count > 0 ? 'filled' : 'outlined'}
                                color={count > 0 ? 'primary' : 'default'}
                                sx={{
                                  height: 24,
                                  fontSize: '0.7rem',
                                  opacity: count > 0 ? 1 : 0.5
                                }}
                              />
                            )
                          })}
                        </Stack>
                      </Box>

                      {/* Actions */}
                      <Stack direction='row' spacing={1} sx={{ width: '100%' }}>
                        <Button
                          size='small'
                          variant={template.isActive ? 'outlined' : 'contained'}
                          color={template.isActive ? 'warning' : 'success'}
                          onClick={() => toggleTemplateActive(template.id)}
                          startIcon={
                            <i className={template.isActive ? 'ri-pause-circle-line' : 'ri-play-circle-line'} />
                          }
                          sx={{ flex: 1 }}
                        >
                          {template.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => handleGenerateSlots(template)}
                          startIcon={<i className='ri-calendar-check-line' />}
                          sx={{ flex: 1 }}
                        >
                          Generate Slots
                        </Button>
                      </Stack>

                      {/* Metadata */}
                      <Box sx={{ width: '100%', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant='caption' color='text.secondary' fontFamily='var(--font-fira-code)'>
                          Created: {format(new Date(template.createdAt), 'MMM dd, yyyy')}
                          {' • '}
                          Updated: {format(new Date(template.updatedAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}
