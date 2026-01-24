import { Box, BoxProps } from '@mui/material'

export interface BrandWatermarkProps extends Omit<BoxProps, 'position'> {
  opacity?: number
  size?: number | string
  rotate?: number
  placement?: 'top-right' | 'bottom-right' | 'center'
  offsetX?: string | number
  offsetY?: string | number
}

export const BrandWatermark = ({
  opacity = 0.03,
  size = 600,
  rotate = -15,
  placement = 'top-right',
  offsetX = 0,
  offsetY = 0,
  sx,
  ...props
}: BrandWatermarkProps) => {
  const positionStyles = {
    'top-right': { top: offsetY, right: offsetX },
    'bottom-right': { bottom: offsetY, right: offsetX },
    center: { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${rotate}deg)` }
  }

  const activePosition = placement === 'center' ? {} : positionStyles[placement]

  return (
    <Box
      className='pointer-events-none'
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        zIndex: 0,
        opacity: opacity,
        backgroundImage: "url('/brand/zerv-z.svg')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        transform: placement !== 'center' ? `rotate(${rotate}deg)` : undefined,
        ...activePosition,
        ...sx
      }}
      {...props}
    />
  )
}
