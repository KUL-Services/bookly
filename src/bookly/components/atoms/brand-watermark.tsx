import type { BoxProps } from '@mui/material'

export interface BrandWatermarkProps extends Omit<BoxProps, 'position'> {
  opacity?: number
  size?: number | string
  rotate?: number
  placement?: 'top-right' | 'bottom-right' | 'center'
  offsetX?: string | number
  offsetY?: string | number
}

export const BrandWatermark = (_props: BrandWatermarkProps) => null
