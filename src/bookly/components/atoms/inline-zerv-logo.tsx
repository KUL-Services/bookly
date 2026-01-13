import React from 'react'
import GreenWordLogo from '@assets/logos/words/Green_Word.png'
import WhiteWordLogo from '@assets/logos/words/White_Word.png'

export const InlineZervLogo = () => {
  return (
    <span className='inline-block relative h-[1em] w-[3em] align-baseline translate-y-[0.15em] -mx-[0.6em]'>
      {/* Light Mode: Green Word */}
      <img
        src={GreenWordLogo.src}
        alt='Zerv'
        className='dark:hidden block object-contain object-bottom w-full h-full'
      />
      {/* Dark Mode: White Word */}
      <img
        src={WhiteWordLogo.src}
        alt='Zerv'
        className='hidden dark:block object-contain object-bottom w-full h-full'
      />
    </span>
  )
}
