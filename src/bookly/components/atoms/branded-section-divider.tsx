'use client'

import { Box, BoxProps } from '@mui/material'
import { BrandedLogo } from './branded-logo'

interface BrandedSectionDividerProps extends BoxProps {
  opacity?: number
  height?: number | string
}

export const BrandedSectionDivider = ({ opacity = 1, height = 60, sx, ...props }: BrandedSectionDividerProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        overflow: 'hidden',
        position: 'relative',
        ...sx
      }}
      {...props}
    >
      {/* Decorative lines */}
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', opacity: 0.5 }} />

      {/* Central Brand Mark */}
      <Box sx={{ mx: 4, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <BrandedLogo
          sx={{
            width: 120,
            height: 'auto',
            color: 'primary.main',
            opacity: opacity
          }}
        />
      </Box>

      {/* Decorative lines */}
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', opacity: 0.5 }} />
    </Box>
  )
}
