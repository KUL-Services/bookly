'use client'

import { Box, Typography, Button, ButtonProps } from '@mui/material'
import { BrandedLogo } from '@/bookly/components/atoms/branded-logo'

interface BrandedEmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    props?: ButtonProps
  }
  icon?: React.ReactNode // Optional overwrite if we sometimes want an icon + logo, but default is logo
  scale?: number
}

export const BrandedEmptyState = ({ title, description, action, scale = 1 }: BrandedEmptyStateProps) => {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Logo Watermark - subtle */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-10deg)',
          opacity: 0.03, // Very subtle background
          width: 500 * scale,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <BrandedLogo />
      </Box>

      {/* Foreground Content */}
      <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {/* Main Logo Icon */}
        <Box
          sx={{
            mb: 1,
            color: 'primary.main',
            opacity: 0.8,
            width: 80 * scale,
            height: 'auto'
          }}
        >
          <BrandedLogo />
        </Box>

        <Typography variant='h6' fontWeight={600} color='text.primary'>
          {title}
        </Typography>

        {description && (
          <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 400 * scale, mb: 1 }}>
            {description}
          </Typography>
        )}

        {action && (
          <Button variant='contained' onClick={action.onClick} sx={{ mt: 2 }} {...action.props}>
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  )
}
