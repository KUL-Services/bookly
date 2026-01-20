import React from 'react'
import { cn } from '@/bookly/lib/utils'

/**
 * A reusable background watermark of the Z logo.
 * Placing this absolutely in a relative container will add that "Zerv" brand feel.
 */
export const ZWatermark = ({ className }: { className?: string }) => {
  return (
    <div className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}>
      <div
        className='absolute opacity-[0.03] dark:opacity-[0.05] w-[120%] h-[120%] -top-[10%] -left-[10%]'
        style={{
          backgroundImage: 'url(/brand/zerv-z.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          transform: 'rotate(-5deg)'
        }}
      />
    </div>
  )
}

/**
 * A section divider that mimics the "ribbon" stroke.
 * Since the original SVG is complex, we use a CSS-masked or simple SVG representation
 * that gives the "feel" of the ribbon swoosh.
 */
export const ZDivider = ({ className }: { className?: string }) => {
  return (
    <div className={cn('w-full h-16 sm:h-24 relative overflow-hidden', className)}>
      <div className='absolute inset-x-0 bottom-0 h-full w-full text-[#f7f8f9] dark:text-[#0a2c24] fill-current'>
        <svg viewBox='0 0 1440 120' preserveAspectRatio='none' className='w-full h-full'>
          {/* A smooth, ribbon-like wave path */}
          <path d='M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z' />
        </svg>
      </div>
    </div>
  )
}

/**
 * A luxury card wrapper that replaces heavy borders with depth and shadows.
 */
export const ZCard = ({
  children,
  className,
  onClick
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-[#202c39] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  )
}
