'use client'

import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { Button } from '@/bookly/components/molecules'

export default function WhyZervPage() {
  return (
    <div className='bg-white dark:bg-[#0a2c24] min-h-screen'>
      {/* Hero */}
      <section className='pt-32 pb-48 bg-[#0a2c24] text-center px-4 relative'>
        <div className='max-w-4xl mx-auto z-10 relative'>
          <ScrollReveal animation='fade-up'>
            <h1 className='text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight'>
              It all starts with a booking.
            </h1>
            <p className='text-xl text-gray-300 mb-10 max-w-2xl mx-auto'>
              See why over 50,000 independant professionals choose Zerv to power their passion.
            </p>
            <Button
              className='bg-[#77b6a3] text-white px-8 py-4 rounded-full font-bold text-lg'
              buttonText={{ plainText: 'Join the Community' }}
            />
          </ScrollReveal>
        </div>

        {/* Abstract Map Graphic */}
        <div className='absolute bottom-0 left-0 w-full h-1/2 overflow-hidden opacity-20 pointer-events-none'>
          {/* Simplified connection lines representation */}
          <svg className='w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
            <path d='M0 100 Q 50 0 100 100' stroke='#77b6a3' strokeWidth='0.5' fill='none' />
            <path d='M10 100 Q 60 20 90 100' stroke='#77b6a3' strokeWidth='0.3' fill='none' />
            <path d='M-10 100 Q 40 40 110 100' stroke='#77b6a3' strokeWidth='0.4' fill='none' />
          </svg>
        </div>
      </section>

      {/* Features List */}
      <section className='py-24 max-w-7xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16 items-center'>
          <div>
            <ScrollReveal animation='slide-in-left'>
              <h2 className='text-3xl font-bold text-[#202c39] dark:text-white mb-6'>More than just a calendar</h2>
              <ul className='space-y-6'>
                {[
                  { title: 'Reduce No-Shows', desc: 'Automated SMS reminders cut no-shows by up to 30%.' },
                  { title: 'Fill Gaps', desc: 'Waitlist features help you fill cancellations instantly.' },
                  { title: 'Boost Revenue', desc: 'Integrated marketing tools bring clients back more often.' }
                ].map((item, idx) => (
                  <li key={idx} className='flex gap-4'>
                    <div className='w-12 h-12 rounded-full bg-[#f7f8f9] dark:bg-[#202c39] flex items-center justify-center text-[#77b6a3] text-xl flex-shrink-0'>
                      <i className='ri-check-line'></i>
                    </div>
                    <div>
                      <h3 className='font-bold text-lg text-[#202c39] dark:text-white'>{item.title}</h3>
                      <p className='text-gray-500'>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
          <div className='relative h-[600px] bg-gray-100 dark:bg-[#202c39] rounded-3xl overflow-hidden'>
            <img
              src='https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80'
              alt='Community'
              className='absolute inset-0 w-full h-full object-cover opacity-80'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-[#0a2c24] to-transparent flex items-end p-8'>
              <p className='text-white text-lg font-medium'>
                "Zerv changed my life. I have more time for my family and my business is booming."
                <br />
                <span className='text-[#77b6a3] block mt-2'>- Sarah J., Hair Stylist</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
