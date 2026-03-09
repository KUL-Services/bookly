'use client'

// MUI
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

// Draft infra
import { useTabDraft } from '@/bookly/hooks/use-tab-draft'
import { TabSaveBar } from '@/bookly/components/molecules/tab-save-bar'
import { ConfirmChangesDialog } from '@/bookly/components/molecules/confirm-changes-dialog'

const LABELS: Record<string, string> = {
  defaultView: 'Default calendar view',
  startOfWeek: 'Start of week',
  showWeekends: 'Show weekends',
  timeFormat: 'Time format',
  timeSlotDuration: 'Time slot duration (min)',
  workingHoursStart: 'Working hours start',
  workingHoursEnd: 'Working hours end',
  colorScheme: 'Color scheme'
}

const CalendarSettingsTab = () => {
  const { calendarSettings, updateCalendarSettings, saveCalendarSettings, isSaving } = useBusinessSettingsStore()

  const { draft, setDraft, isDirty, changes, confirmOpen, setConfirmOpen, handleCancel, handleConfirm } = useTabDraft({
    tabId: 'calendar',
    labels: LABELS,
    saved: calendarSettings as unknown as Record<string, unknown>,
    applyDraft: d => updateCalendarSettings(d as unknown as typeof calendarSettings),
    saveAction: saveCalendarSettings
  })

  const set = (patch: Partial<typeof calendarSettings>) =>
    setDraft(prev => ({ ...prev, ...patch }) as unknown as Record<string, unknown>)

  const cs = draft as unknown as typeof calendarSettings

  return (
    <Grid container spacing={6}>
      {/* Inline dirty bar */}
      <Grid item xs={12}>
        <TabSaveBar
          isDirty={isDirty}
          changes={changes}
          isSaving={isSaving}
          saveLabel='Save Calendar Settings'
          onSave={() => setConfirmOpen(true)}
          onCancel={handleCancel}
        />
      </Grid>

      {/* View Preferences */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Default View' subheader='Choose the default calendar view when opening the calendar' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ToggleButtonGroup
                value={cs.defaultView}
                exclusive
                onChange={(_, value) => value && set({ defaultView: value })}
                fullWidth
              >
                {[
                  { value: 'month', icon: 'ri-calendar-line', label: 'Month' },
                  { value: 'week', icon: 'ri-calendar-2-line', label: 'Week' },
                  { value: 'day', icon: 'ri-calendar-check-line', label: 'Day' }
                ].map(v => (
                  <ToggleButton key={v.value} value={v.value}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                      <i className={v.icon} style={{ fontSize: '1.5rem' }} />
                      <Typography variant='caption'>{v.label}</Typography>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Divider />

              <FormControl fullWidth size='small'>
                <InputLabel>Start of Week</InputLabel>
                <Select
                  value={cs.startOfWeek}
                  label='Start of Week'
                  onChange={e => set({ startOfWeek: e.target.value as 'sunday' | 'monday' })}
                >
                  <MenuItem value='sunday'>Sunday</MenuItem>
                  <MenuItem value='monday'>Monday</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch checked={cs.showWeekends} onChange={e => set({ showWeekends: e.target.checked })} />}
                label={
                  <Box>
                    <Typography variant='body1'>Show Weekends</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Display Friday and Saturday in calendar views
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
                  value={cs.timeFormat}
                  label='Time Format'
                  onChange={e => set({ timeFormat: e.target.value as '12h' | '24h' })}
                >
                  <MenuItem value='12h'>12-hour (9:00 AM)</MenuItem>
                  <MenuItem value='24h'>24-hour (09:00)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size='small'>
                <InputLabel>Time Slot Duration</InputLabel>
                <Select
                  value={cs.timeSlotDuration}
                  label='Time Slot Duration'
                  onChange={e => set({ timeSlotDuration: e.target.value as 15 | 30 | 60 })}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                </Select>
              </FormControl>

              <Divider />

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Working Hours Display Range
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  This controls which hours are visible in the calendar view, not your actual business hours.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TimeSelectField
                    label='Start Time'
                    value={cs.workingHoursStart}
                    onChange={value => set({ workingHoursStart: value })}
                    size='small'
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TimeSelectField
                    label='End Time'
                    value={cs.workingHoursEnd}
                    onChange={value => set({ workingHoursEnd: value })}
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
              {[
                {
                  value: 'vivid',
                  title: 'Vivid Colors',
                  desc: 'High-contrast, saturated colors for clear visibility',
                  colors: ['#51b4b7', '#e88682', '#77b6a3', '#202c39']
                },
                {
                  value: 'pastel',
                  title: 'Pastel Colors',
                  desc: 'Soft, muted colors that are easier on the eyes',
                  colors: ['#a8d5d8', '#f4b4b2', '#b8d9c9', '#8a9ba8']
                }
              ].map(scheme => (
                <Grid item xs={12} md={6} key={scheme.value}>
                  <Card
                    variant='outlined'
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderColor: cs.colorScheme === scheme.value ? 'primary.main' : 'divider',
                      borderWidth: cs.colorScheme === scheme.value ? 2 : 1
                    }}
                    onClick={() => set({ colorScheme: scheme.value as 'vivid' | 'pastel' })}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {scheme.colors.map(color => (
                          <Box key={color} sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: color }} />
                        ))}
                      </Box>
                      <Box>
                        <Typography variant='body1' fontWeight={600}>
                          {scheme.title}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {scheme.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
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
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'background.default' }}
            >
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='h6'>January 2026</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['month', 'week', 'day'].map(v => (
                        <Box
                          key={v}
                          sx={{
                            px: 2,
                            py: 0.5,
                            bgcolor: cs.defaultView === v ? 'primary.main' : 'action.hover',
                            color: cs.defaultView === v ? 'white' : 'text.primary',
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {[
                  {
                    time: '9:00',
                    time24: '09:00',
                    color: cs.colorScheme === 'vivid' ? '#51b4b7' : '#a8d5d8',
                    label: 'Sample Booking'
                  },
                  {
                    time: '10:00',
                    time24: '10:00',
                    color: cs.colorScheme === 'vivid' ? '#e88682' : '#f4b4b2',
                    label: 'Another Booking'
                  }
                ].map(slot => (
                  <Grid item xs={12} key={slot.label}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ width: 60, textAlign: 'right', pr: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                        {cs.timeFormat === '12h' ? `${slot.time} AM` : slot.time24}
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          height: 40,
                          bgcolor: slot.color,
                          borderRadius: 1,
                          px: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Typography
                          variant='caption'
                          sx={{ color: cs.colorScheme === 'vivid' ? 'white' : 'text.primary' }}
                        >
                          {slot.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <ConfirmChangesDialog
        open={confirmOpen}
        title='Save Calendar Settings'
        changes={changes}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Grid>
  )
}

export default CalendarSettingsTab
