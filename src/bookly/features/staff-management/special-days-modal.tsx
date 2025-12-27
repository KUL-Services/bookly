import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Paper,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { format } from 'date-fns'
import { useStaffManagementStore, SpecialRule } from './staff-store'
import { DatePickerField } from './date-picker-field'
import { TimeSelectField } from './time-select-field'

interface SpecialDaysModalProps {
  open: boolean
  onClose: () => void
}

export function SpecialDaysModal({ open, onClose }: SpecialDaysModalProps) {
  const { specialRules, addSpecialRule, updateSpecialRule, deleteSpecialRule } = useStaffManagementStore()

  const [view, setView] = useState<'list' | 'edit'>('list')
  const [editingRule, setEditingRule] = useState<Partial<SpecialRule> | null>(null)

  // Reset view when modal closes
  const handleClose = () => {
    setView('list')
    setEditingRule(null)
    onClose()
  }

  const handleAddNew = () => {
    setEditingRule({
      name: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      type: 'closed',
      shifts: [] // Empty for closed by default
    })
    setView('edit')
  }

  const handleEdit = (rule: SpecialRule) => {
    setEditingRule({ ...rule })
    setView('edit')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      deleteSpecialRule(id)
    }
  }

  const handleSave = () => {
    if (!editingRule || !editingRule.name || !editingRule.startDate || !editingRule.endDate) return

    // Ensure shifts array exists and is valid
    const ruleToSave = {
      ...editingRule,
      shifts: editingRule.type === 'custom' && editingRule.shifts?.length
        ? editingRule.shifts
        : []
    }

    if (editingRule.id) {
      updateSpecialRule(editingRule.id, ruleToSave)
    } else {
      addSpecialRule(ruleToSave as Omit<SpecialRule, 'id'>)
    }
    handleBackToList()
  }

  const handleBackToList = () => {
    setView('list')
    setEditingRule(null)
  }

  const renderList = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Empty State */}
      {specialRules.length === 0 ? (
        <Box 
          sx={{ 
            py: 8, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'action.hover', 
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              bgcolor: 'background.paper', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2,
              boxShadow: 1
            }}
          >
            <i className='ri-calendar-event-line' style={{ fontSize: 24, opacity: 0.6 }} />
          </Box>
          <Typography variant='subtitle1' fontWeight={600} gutterBottom>
            No Special Days Defined
          </Typography>
          <Typography variant='body2' color='text.secondary' align='center' sx={{ maxWidth: 300, mb: 3 }}>
            Create rules for holidays, closed periods, or special business hours (e.g., Ramadan).
          </Typography>
          <Button 
            variant='contained' 
            onClick={handleAddNew} 
            startIcon={<i className='ri-add-line' />}
          >
            Add Special Day
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
             <Button variant='contained' size='small' onClick={handleAddNew} startIcon={<i className='ri-add-line' />}>
                Add Rule
             </Button>
          </Box>

          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {specialRules.map(rule => (
              <Paper 
                key={rule.id} 
                variant='outlined' 
                sx={{ 
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                }}
              >
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size='small' onClick={() => handleEdit(rule)}>
                        <i className='ri-pencil-line' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDelete(rule.id)}>
                        <i className='ri-delete-bin-line' />
                        </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Typography variant='subtitle1' fontWeight={600}>{rule.name}</Typography>
                            <Chip 
                                label={rule.type === 'closed' ? 'Closed' : 'Custom Hours'} 
                                size='small' 
                                color={rule.type === 'closed' ? 'error' : 'warning'} 
                                variant='filled'
                                sx={{ height: 22, fontWeight: 600, fontSize: '0.7rem' }}
                            />
                        </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontSize: '0.85rem' }}>
                            <i className='ri-calendar-line' style={{ fontSize: 16, opacity: 0.7 }} />
                            <span>{format(new Date(rule.startDate), 'MMM d, yyyy')} — {format(new Date(rule.endDate), 'MMM d, yyyy')}</span>
                        </Box>
                        {rule.type === 'custom' && rule.shifts && rule.shifts.length > 0 && (
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.8rem' }}>
                               <i className='ri-time-line' style={{ fontSize: 16, opacity: 0.7 }} />
                               <span>{rule.shifts.map(s => `${s.start} - ${s.end}`).join(', ')}</span>
                           </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        </>
      )}
    </Box>
  )

  const renderEdit = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      <TextField
        label='Rule Name'
        fullWidth
        value={editingRule?.name}
        onChange={e => setEditingRule({ ...editingRule!, name: e.target.value })}
        placeholder='e.g., Ramadan, National Day'
        helperText="Internal name for this rule"
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
         <DatePickerField
            label='Start Date'
            value={editingRule?.startDate ? new Date(editingRule.startDate) : new Date()}
            onChange={date => {
                const newStart = format(date, 'yyyy-MM-dd');
                setEditingRule({ 
                    ...editingRule!, 
                    startDate: newStart,
                    // Auto-adjust end date if start is after it
                    endDate: editingRule?.endDate && newStart > editingRule.endDate ? newStart : editingRule?.endDate 
                })
            }}
            fullWidth
            sx={{ flex: 1 }}
        />
        <DatePickerField
            label='End Date'
            value={editingRule?.endDate ? new Date(editingRule.endDate) : new Date()}
            onChange={date => setEditingRule({ ...editingRule!, endDate: format(date, 'yyyy-MM-dd') })}
            fullWidth
            sx={{ flex: 1 }}
        />
      </Box>

      <Box>
        <Typography variant='subtitle2' gutterBottom fontWeight={600}>Rule Type</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
            {[
                { value: 'closed', label: 'Business Closed', icon: 'ri-store-3-line', color: 'error' },
                { value: 'custom', label: 'Custom Hours', icon: 'ri-time-line', color: 'warning' }
            ].map((option) => (
                <Paper
                    key={option.value}
                    variant='outlined'
                    onClick={() => {
                        const newType = option.value as 'closed' | 'custom'
                        setEditingRule({
                            ...editingRule!,
                            type: newType,
                            // Initialize shifts array when switching to custom, clear it for closed
                            shifts: newType === 'custom'
                                ? (editingRule?.shifts?.length ? editingRule.shifts : [{ start: '10:00', end: '16:00' }])
                                : []
                        })
                    }}
                    sx={{
                        flex: 1,
                        p: 2,
                        cursor: 'pointer',
                        borderColor: editingRule?.type === option.value ? `${option.color}.main` : 'divider',
                        bgcolor: editingRule?.type === option.value ? `${option.color}.lighter` : 'background.paper',
                        borderWidth: editingRule?.type === option.value ? 2 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgColor: 'action.hover'
                        }
                    }}
                >
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: editingRule?.type === option.value ? `${option.color}.main` : 'action.selected',
                        color: editingRule?.type === option.value ? 'common.white' : 'text.secondary',
                        display: 'flex'
                    }}>
                        <i className={option.icon} style={{ fontSize: 20 }} />
                    </Box>
                    <Typography fontWeight={600} color={editingRule?.type === option.value ? 'text.primary' : 'text.secondary'}>
                        {option.label}
                    </Typography>
                </Paper>
            ))}
        </Box>
      </Box>

      {editingRule?.type === 'custom' && (
        <Paper variant='outlined' sx={{ p: 2, bgcolor: 'warning.50', borderColor: 'warning.main' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' fontWeight={600} color='warning.dark'>
                    <i className='ri-time-line' style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Working Hours
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    These hours will apply to ALL days within the selected date range.
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TimeSelectField
                    label='Start Time'
                    value={editingRule.shifts?.[0]?.start || '10:00'}
                    onChange={val => {
                        const newShifts = [...(editingRule.shifts || [])];
                        if(!newShifts[0]) newShifts[0] = { start: '10:00', end: '16:00' };
                        newShifts[0].start = val;
                        setEditingRule({ ...editingRule!, shifts: newShifts });
                    }}
                    sx={{ flex: 1 }}
                />
                <Typography color='text.secondary'>to</Typography>
                <TimeSelectField
                    label='End Time'
                    value={editingRule.shifts?.[0]?.end || '16:00'}
                    onChange={val => {
                        const newShifts = [...(editingRule.shifts || [])];
                        if(!newShifts[0]) newShifts[0] = { start: '10:00', end: '16:00' };
                        newShifts[0].end = val;
                        setEditingRule({ ...editingRule!, shifts: newShifts });
                    }}
                    sx={{ flex: 1 }}
                />
            </Box>
        </Paper>
      )}
    </Box>
  )

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography variant='h6' fontWeight={600}>
                    {view === 'list' ? 'Special Days & Holidays' : editingRule?.id ? 'Edit Special Rule' : 'Add Special Rule'}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                    {view === 'list'
                        ? 'Manage holidays and special business hours'
                        : 'Define custom hours overrides for date ranges'}
                </Typography>
            </Box>
            <IconButton size='small' onClick={handleClose}>
                <i className='ri-close-line' />
            </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, minHeight: 400 }}>
        {view === 'list' ? renderList() : renderEdit()}
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        {view === 'list' ? (
          <Button onClick={handleClose}>Close</Button>
        ) : (
          <>
            <Button onClick={handleBackToList}>Cancel</Button>
            <Button variant='contained' onClick={handleSave}>Save Rule</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
