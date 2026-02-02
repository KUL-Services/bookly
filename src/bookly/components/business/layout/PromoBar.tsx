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
        className='hidden sm:block absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors'
      >
        <i className='ri-close-line text-lg'></i>
      </button>
    </div>
  )
}
