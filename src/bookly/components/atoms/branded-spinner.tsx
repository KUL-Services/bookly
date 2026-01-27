'use client'

import { Box, BoxProps } from '@mui/material'
import { BrandedLogo } from './branded-logo'

interface BrandedSpinnerProps extends BoxProps {
  size?: number | string
  color?: string
}

export const BrandedSpinner = ({ size = 40, color = 'primary.main', sx, ...props }: BrandedSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        },
        ...sx
      }}
      {...props}
    >
      <BrandedLogo
        sx={{
          width: size,
          height: 'auto',
          color: color
        }}
      />
    </Box>
  )
}
