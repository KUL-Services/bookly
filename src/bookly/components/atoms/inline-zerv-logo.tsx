import React from 'react'
import GreenWordLogo from '@assets/logos/words/Green_Word.png'
import WhiteWordLogo from '@assets/logos/words/White_Word.png'
import { cn } from '@/bookly/lib/utils'

interface InlineZervLogoProps {
  className?: string
  color?: 'white' | 'green'
}

export const InlineZervLogo = ({ className, color = 'white' }: InlineZervLogoProps) => {
  const logo = color === 'green' ? GreenWordLogo : WhiteWordLogo

  return (
    <span
      className={cn('inline-block relative h-[1em] w-[3em] align-baseline translate-y-[0.15em] -mx-[0.6em]', className)}
    >
      <img src={logo.src} alt='Zerv' className='block object-contain object-bottom w-full h-full' />
    </span>
  )
}
