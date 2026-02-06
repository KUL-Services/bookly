'use client'

import { useState } from 'react'

export const PromoBar = () => {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className='bg-[#0a2c24] text-white py-2 px-4 text-center text-xs sm:text-sm font-medium relative z-[60]'>
      <span className='opacity-90'>
        🎉 <span className='font-bold text-[#77b6a3]'>New:</span> Get 30% off your first 3 months with annual billing!
      </span>
      <button
        onClick={() => setVisible(false)}
        className='hidden sm:flex absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <line x1='18' y1='6' x2='6' y2='18'></line>
          <line x1='6' y1='6' x2='18' y2='18'></line>
        </svg>
      </button>
    </div>
  )
}
