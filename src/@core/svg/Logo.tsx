// React Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      {/* Letter B design for Bookly */}
      {/* Vertical left bar */}
      <rect
        x='4'
        y='4'
        width='4'
        height='24'
        rx='2'
        fill='var(--mui-palette-primary-main)'
      />

      {/* Top horizontal bar */}
      <rect
        x='8'
        y='4'
        width='12'
        height='4'
        rx='2'
        fill='var(--mui-palette-primary-main)'
      />

      {/* Middle horizontal bar */}
      <rect
        x='8'
        y='14'
        width='10'
        height='4'
        rx='2'
        fill='var(--mui-palette-primary-main)'
      />

      {/* Bottom horizontal bar */}
      <rect
        x='8'
        y='24'
        width='14'
        height='4'
        rx='2'
        fill='var(--mui-palette-primary-main)'
      />

      {/* Top right vertical bar */}
      <rect
        x='20'
        y='8'
        width='4'
        height='6'
        rx='2'
        fill='var(--mui-palette-primary-main)'
      />

      {/* Bottom right vertical bar */}
      <rect
        x='22'
        y='18'
        width='4'
        height='6'
        rx='2'
        fill='var(--mui-palette-primary-main)'
      />

      {/* Gradient overlays for depth */}
      <rect
        x='4'
        y='4'
        width='4'
        height='24'
        rx='2'
        fill='url(#paint0_linear_bookly)'
        fillOpacity='0.3'
      />

      <rect
        x='8'
        y='14'
        width='10'
        height='4'
        rx='2'
        fill='url(#paint1_linear_bookly)'
        fillOpacity='0.3'
      />

      <defs>
        <linearGradient
          id='paint0_linear_bookly'
          x1='6'
          y1='4'
          x2='6'
          y2='28'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='white' />
          <stop offset='1' stopColor='white' stopOpacity='0' />
        </linearGradient>
        <linearGradient
          id='paint1_linear_bookly'
          x1='13'
          y1='14'
          x2='13'
          y2='18'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='white' />
          <stop offset='1' stopColor='white' stopOpacity='0' />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default Logo
