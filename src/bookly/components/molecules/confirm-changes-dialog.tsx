'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'

export interface FieldChange {
  field: string
  from: string
  to: string
}

interface ConfirmChangesDialogProps {
  open: boolean
  title: string
  changes: FieldChange[]
  onConfirm: () => void
  onCancel: () => void
  isSaving?: boolean
}

export const ConfirmChangesDialog = ({
  open,
  title,
  changes,
  onConfirm,
  onCancel,
  isSaving = false
}: ConfirmChangesDialogProps) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <i className='ri-save-2-line' style={{ fontSize: '1.25rem' }} />
          {title}
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Review the following changes before saving:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {changes.map(change => (
            <Box
              key={change.field}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                overflow: 'hidden'
              }}
            >
              {/* Field name header */}
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  bgcolor: 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {change.field}
                </Typography>
              </Box>

              {/* Before / After */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {/* Before */}
                <Box sx={{ px: 2, py: 1, borderRight: '1px solid', borderColor: 'divider' }}>
                  <Chip label='Before' size='small' color='default' sx={{ mb: 0.5, height: 18, fontSize: '0.65rem' }} />
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontStyle: change.from ? 'normal' : 'italic'
                    }}
                  >
                    {change.from || '(empty)'}
                  </Typography>
                </Box>

                {/* After */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Chip label='After' size='small' color='primary' sx={{ mb: 0.5, height: 18, fontSize: '0.65rem' }} />
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 500 }}>
                    {change.to || '(empty)'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant='outlined' color='secondary' onClick={onCancel} disabled={isSaving}>
          Go Back
        </Button>
        <Button
          variant='contained'
          onClick={onConfirm}
          disabled={isSaving}
          startIcon={isSaving ? <BrandedSpinner size={16} color='inherit' /> : <i className='ri-save-2-line' />}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
