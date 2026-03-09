'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'
import type { FieldChange } from '@/bookly/components/molecules/confirm-changes-dialog'

interface TabSaveBarProps {
  isDirty: boolean
  changes: FieldChange[]
  isSaving: boolean
  saveLabel?: string
  onSave: () => void
  onCancel: () => void
}

export const TabSaveBar = ({
  isDirty,
  changes,
  isSaving,
  saveLabel = 'Save Changes',
  onSave,
  onCancel
}: TabSaveBarProps) => {
  return (
    <Collapse in={isDirty} unmountOnExit>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'warning.light',
          borderRadius: 2,
          bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,167,38,0.08)' : 'rgba(255,167,38,0.06)'),
          px: 2.5,
          py: 1.5,
          mb: 4,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        {/* Warning icon */}
        <Box sx={{ pt: 0.25 }}>
          <i
            className='ri-error-warning-line'
            style={{ fontSize: '1.1rem', color: 'var(--mui-palette-warning-main)' }}
          />
        </Box>

        {/* Change summary */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='body2' fontWeight={600} sx={{ mb: 0.75 }}>
            {changes.length} unsaved {changes.length === 1 ? 'change' : 'changes'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {changes.map(c => (
              <Chip
                key={c.field}
                size='small'
                variant='outlined'
                label={
                  <span>
                    <strong>{c.field}:</strong>{' '}
                    <span style={{ opacity: 0.7, textDecoration: 'line-through' }}>{c.from || '(empty)'}</span>
                    {' → '}
                    <strong>{c.to || '(empty)'}</strong>
                  </span>
                }
                sx={{ fontFamily: 'var(--font-fira-code)', fontSize: '0.72rem', height: 'auto', py: 0.25 }}
              />
            ))}
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          <Button size='small' variant='outlined' color='secondary' onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            size='small'
            variant='contained'
            onClick={onSave}
            disabled={isSaving}
            startIcon={isSaving ? <BrandedSpinner size={14} color='inherit' /> : <i className='ri-save-2-line' />}
          >
            {isSaving ? 'Saving...' : saveLabel}
          </Button>
        </Box>
      </Box>
    </Collapse>
  )
}
