'use client'

import { Box, useTheme } from '@mui/material'
import { BrandWatermark } from '@/bookly/components/atoms/brand-watermark'

export default function BooklyAppsLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '100%' }}>
      {/* Global Background Watermark */}
      <BrandWatermark
        size='80vh'
        opacity={isDark ? 0.02 : 0.03}
        placement='center'
        sx={{
          pointerEvents: 'none',
          filter: 'grayscale(100%)', // Ensure it's subtle/neutral
          mixBlendMode: isDark ? 'screen' : 'multiply'
        }}
      />

      {/* Secondary Decorator - Bottom Right */}
      <BrandWatermark
        size={400}
        opacity={isDark ? 0.03 : 0.04}
        placement='bottom-right'
        offsetX='-5%'
        offsetY='-10%'
        rotate={-20}
        sx={{
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</Box>
    </Box>
  )
}
