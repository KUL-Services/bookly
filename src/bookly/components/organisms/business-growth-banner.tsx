'use client'

import { Button } from '@/bookly/components/molecules'
import { CheckCircle } from 'lucide-react'

export function BusinessGrowthBanner() {
  return (
    <section className='py-12 sm:py-16 md:py-20 relative overflow-hidden'>
      {/* Background with Zerv Gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#0a2c24] to-[#1e4a3d]'>
        <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-10'></div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Content */}
          <div className='text-white space-y-6'>
            <div className='inline-flex items-center gap-2 rounded-full bg-sage-500/20 px-3 py-1 text-sm font-semibold text-sage-300 border border-sage-500/30'>
              <span className='w-2 h-2 rounded-full bg-sage-400 animate-pulse'></span>
              For Business Owners
            </div>

            <h2 className='text-3xl md:text-5xl font-bold leading-tight'>
              Grow your business with <span className='text-sage-400'>Bookly</span>
            </h2>

            <p className='text-lg text-gray-300 max-w-lg'>
              Manage appointments, reduce no-shows, and get discovered by new clients. The all-in-one platform for
              wellness professionals.
            </p>

            <ul className='space-y-3'>
              {['Free calendar management', 'Automated SMS reminders', 'Marketing tools included'].map((item, i) => (
                <li key={i} className='flex items-center gap-3 text-gray-200'>
                  <CheckCircle className='w-5 h-5 text-sage-400' />
                  {item}
                </li>
              ))}
            </ul>

            <div className='pt-4'>
              <Button
                buttonText={{ plainText: 'List Your Business' }}
                className='bg-sage-500 hover:bg-sage-400 text-white border-none py-3 px-8 text-lg font-bold rounded-xl shadow-lg shadow-sage-900/20 transform transition hover:-translate-y-1'
              />
            </div>
          </div>

          {/* Visual/Image Placeholder */}
          <div className='hidden lg:block relative'>
            <div className='absolute -inset-4 bg-gradient-to-tr from-sage-500/20 to-coral-500/20 rounded-full blur-3xl'></div>
            <div className='relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <div className='text-white/60 text-sm'>Total Revenue</div>
                  <div className='text-2xl font-bold text-white'>$12,450</div>
                </div>
                <div className='bg-sage-500/20 p-2 rounded-lg text-sage-300'>+24%</div>
              </div>
              <div className='space-y-4'>
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className='flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5'>
                    <div className='w-10 h-10 rounded-full bg-gray-600/50'></div>
                    <div className='flex-1'>
                      <div className='h-2 w-24 bg-gray-500/50 rounded mb-2'></div>
                      <div className='h-2 w-16 bg-gray-600/50 rounded'></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
