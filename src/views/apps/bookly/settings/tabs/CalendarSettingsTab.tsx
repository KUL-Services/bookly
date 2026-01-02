'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Divider from '@mui/material/Divider'

// Components
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'

// Store
import { useBusinessSettingsStore } from '@/stores/business-settings.store'

const CalendarSettingsTab = () => {
  const { calendarSettings, updateCalendarSettings } = useBusinessSettingsStore()

  return (
    <Grid container spacing={6}>
      {/* View Preferences */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Default View' subheader='Choose the default calendar view when opening the calendar' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ToggleButtonGroup
                value={calendarSettings.defaultView}
                exclusive
                onChange={(_, value) => value && updateCalendarSettings({ defaultView: value })}
                fullWidth
              >
                <ToggleButton value='month'>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                    <i className='ri-calendar-line' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='caption'>Month</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value='week'>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                    <i className='ri-calendar-2-line' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='caption'>Week</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value='day'>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                    <i className='ri-calendar-check-line' style={{ fontSize: '1.5rem' }} />
                    <Typography variant='caption'>Day</Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>

              <Divider />

              <FormControl fullWidth size='small'>
                <InputLabel>Start of Week</InputLabel>
                <Select
                  value={calendarSettings.startOfWeek}
                  label='Start of Week'
                  onChange={e => updateCalendarSettings({ startOfWeek: e.target.value as 'sunday' | 'monday' })}
                >
                  <MenuItem value='sunday'>Sunday</MenuItem>
                  <MenuItem value='monday'>Monday</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={calendarSettings.showWeekends}
                    onChange={e => updateCalendarSettings({ showWeekends: e.target.checked })}
                  />
                }
                label={
                  <Box>
                    <Typography variant='body1'>Show Weekends</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Display Saturday and Sunday in calendar views
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Time Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Time Settings' subheader='Configure time display and slot duration' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Time Format</InputLabel>
                <Select
                  value={calendarSettings.timeFormat}
                  label='Time Format'
                  onChange={e => updateCalendarSettings({ timeFormat: e.target.value as '12h' | '24h' })}
                >
                  <MenuItem value='12h'>12-hour (9:00 AM)</MenuItem>
                  <MenuItem value='24h'>24-hour (09:00)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size='small'>
                <InputLabel>Time Slot Duration</InputLabel>
                <Select
                  value={calendarSettings.timeSlotDuration}
                  label='Time Slot Duration'
                  onChange={e => updateCalendarSettings({ timeSlotDuration: e.target.value as 15 | 30 | 60 })}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                </Select>
              </FormControl>

              <Divider />

              <Typography variant='body2' color='text.secondary'>
                Working Hours Display Range
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TimeSelectField
                    label='Start Time'
                    value={calendarSettings.workingHoursStart}
                    onChange={value => updateCalendarSettings({ workingHoursStart: value })}
                    size='small'
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TimeSelectField
                    label='End Time'
                    value={calendarSettings.workingHoursEnd}
                    onChange={value => updateCalendarSettings({ workingHoursEnd: value })}
                    size='small'
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Color Scheme */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Color Scheme' subheader='Choose how events and bookings are displayed' />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  variant='outlined'
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderColor: calendarSettings.colorScheme === 'vivid' ? 'primary.main' : 'divider',
                    borderWidth: calendarSettings.colorScheme === 'vivid' ? 2 : 1
                  }}
                  onClick={() => updateCalendarSettings({ colorScheme: 'vivid' })}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {['#51b4b7', '#e88682', '#77b6a3', '#202c39'].map(color => (
                        <Box
                          key={color}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: color
                          }}
                        />
                      ))}
                    </Box>
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        Vivid Colors
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        High-contrast, saturated colors for clear visibility
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  variant='outlined'
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderColor: calendarSettings.colorScheme === 'pastel' ? 'primary.main' : 'divider',
                    borderWidth: calendarSettings.colorScheme === 'pastel' ? 2 : 1
                  }}
                  onClick={() => updateCalendarSettings({ colorScheme: 'pastel' })}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {['#a8d5d8', '#f4b4b2', '#b8d9c9', '#8a9ba8'].map(color => (
                        <Box
                          key={color}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: color
                          }}
                        />
                      ))}
                    </Box>
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        Pastel Colors
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Soft, muted colors that are easier on the eyes
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Preview */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Preview' subheader='How your calendar will look with current settings' />
          <CardContent>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.default'
              }}
            >
              <Grid container spacing={1}>
                {/* Header */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='h6'>January 2026</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          bgcolor: calendarSettings.defaultView === 'month' ? 'primary.main' : 'action.hover',
                          color: calendarSettings.defaultView === 'month' ? 'white' : 'text.primary',
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        Month
                      </Box>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          bgcolor: calendarSettings.defaultView === 'week' ? 'primary.main' : 'action.hover',
                          color: calendarSettings.defaultView === 'week' ? 'white' : 'text.primary',
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        Week
                      </Box>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          bgcolor: calendarSettings.defaultView === 'day' ? 'primary.main' : 'action.hover',
                          color: calendarSettings.defaultView === 'day' ? 'white' : 'text.primary',
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        Day
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Sample time slots */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 60, textAlign: 'right', pr: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                      {calendarSettings.timeFormat === '12h' ? '9:00 AM' : '09:00'}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        height: 40,
                        bgcolor: calendarSettings.colorScheme === 'vivid' ? '#51b4b7' : '#a8d5d8',
                        borderRadius: 1,
                        px: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ color: calendarSettings.colorScheme === 'vivid' ? 'white' : 'text.primary' }}
                      >
                        Sample Booking
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 60, textAlign: 'right', pr: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                      {calendarSettings.timeFormat === '12h' ? '10:00 AM' : '10:00'}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        height: 40,
                        bgcolor: calendarSettings.colorScheme === 'vivid' ? '#e88682' : '#f4b4b2',
                        borderRadius: 1,
                        px: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ color: calendarSettings.colorScheme === 'vivid' ? 'white' : 'text.primary' }}
                      >
                        Another Booking
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CalendarSettingsTab
