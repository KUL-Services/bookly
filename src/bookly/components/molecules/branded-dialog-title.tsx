'use client'

import { Box, Typography, IconButton, DialogTitle as MuiDialogTitle, DialogTitleProps } from '@mui/material'
import { BrandedLogo } from '@/bookly/components/atoms/branded-logo'

interface BrandedDialogTitleProps extends DialogTitleProps {
  onClose?: () => void
  startIcon?: React.ReactNode
  children: React.ReactNode
}

export const BrandedDialogTitle = ({ children, onClose, startIcon, sx, ...props }: BrandedDialogTitleProps) => {
  return (
    <MuiDialogTitle
      sx={{
        m: 0,
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        ...sx
      }}
      {...props}
    >
      {/* Background Graphic */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          opacity: 0.05,
          width: 150,
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0
        }}
      >
        <BrandedLogo sx={{ transform: 'rotate(-20deg) scale(1.5)' }} />
      </Box>

      {/* Title Content */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
        {/* Small Branded Logo Mark as Prefix if no icon provided */}
        {!startIcon && (
          <Box sx={{ width: 24, height: 24, color: 'primary.main', opacity: 0.8 }}>
            <BrandedLogo />
          </Box>
        )}

        {startIcon}

        <Box>{children}</Box>
      </Box>

      {/* Close Button */}
      {onClose && (
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            color: theme => theme.palette.grey[500],
            zIndex: 1
          }}
        >
          <i className='ri-close-line' />
        </IconButton>
      )}
    </MuiDialogTitle>
  )
}
