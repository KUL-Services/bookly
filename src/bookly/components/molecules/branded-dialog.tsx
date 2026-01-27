'use client'

import { Dialog, DialogContent, DialogProps, Box } from '@mui/material'
import { BrandedDialogTitle } from './branded-dialog-title'
import { BrandWatermark } from '@/bookly/components/atoms/brand-watermark'

interface BrandedDialogProps extends Omit<DialogProps, 'title'> {
  onClose: () => void // Make onClose required for the header button
  title: React.ReactNode
  startIcon?: React.ReactNode
  watermarkOpacity?: number
}

export const BrandedDialog = ({
  children,
  onClose,
  title,
  startIcon,
  watermarkOpacity = 0.03,
  PaperProps,
  ...props
}: BrandedDialogProps) => {
  return (
    <Dialog
      onClose={onClose}
      {...props}
      PaperProps={{
        ...PaperProps,
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          ...PaperProps?.sx
        }
      }}
    >
      <BrandedDialogTitle onClose={onClose} startIcon={startIcon}>
        {title}
      </BrandedDialogTitle>

      {/* Content wrapper with watermark */}
      <Box sx={{ position: 'relative', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <BrandWatermark
          size='100%'
          opacity={watermarkOpacity}
          placement='center'
          sx={{ pointerEvents: 'none', zIndex: 0 }}
        />
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1 }}>{children}</Box>
      </Box>
    </Dialog>
  )
}
