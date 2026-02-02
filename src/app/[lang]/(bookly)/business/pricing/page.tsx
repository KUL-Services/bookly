'use client'

import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { Button } from '@/bookly/components/molecules'
import { ZWatermark } from '@/bookly/components/atoms/zerv-assets'

export default function PricingPage() {
  return (
    <div className='bg-[#f7f8f9] dark:bg-[#0a2c24] min-h-screen'>
      {/* Pricing Hero */}
      <section className='pt-20 pb-32 bg-[#0a2c24] text-white relative overflow-hidden'>
        <ZWatermark className='opacity-[0.05] top-0 left-1/2 transform -translate-x-1/2' />
        <div className='max-w-7xl mx-auto px-4 text-center relative z-10'>
          <ScrollReveal animation='fade-up'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6'>Simple, transparent pricing</h1>
            <p className='text-xl text-gray-300 mb-12 max-w-2xl mx-auto'>
              No hidden fees. No contracts. Just everything you need to grow.
            </p>
          </ScrollReveal>

          {/* Main Plan Card */}
          <ScrollReveal animation='fade-up' delay={200}>
            <div className='max-w-md mx-auto bg-gradient-to-b from-[#202c39] to-[#1a2530] rounded-3xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden group'>
              <div className='absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#77b6a3] to-blue-500' />

              <h3 className='text-2xl font-bold mb-2'>Pro Plan</h3>
              <div className='flex items-baseline justify-center gap-1 my-6'>
                <span className='text-5xl font-bold'>$29.99</span>
                <span className='text-gray-400'>/mo</span>
              </div>

              <Button
                className='w-full bg-[#77b6a3] hover:bg-[#5da891] text-white py-4 rounded-xl font-bold mb-8 transition-transform hover:scale-105'
                buttonText={{ plainText: 'Start Free Trial' }}
              />

              <ul className='text-left space-y-4 text-gray-300'>
                {[
                  'Unlimited Appointments',
                  'Client Management',
                  'Marketing Tools',
                  'No-Show Protection',
                  'Mobile App for Staff'
                ].map(feat => (
                  <li key={feat} className='flex items-center gap-3'>
                    <i className='ri-check-line text-[#77b6a3] text-xl'></i>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Hardware Section */}
      <section className='py-24 bg-white dark:bg-[#202c39]'>
        <div className='max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16'>
          <div className='flex-1'>
            <ScrollReveal animation='slide-in-left'>
              <img
                src='https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=800&q=80'
                alt='Card Reader'
                className='rounded-2xl shadow-xl rotate-1 hover:rotate-0 transition-all duration-500'
              />
            </ScrollReveal>
          </div>
          <div className='flex-1 space-y-6'>
            <ScrollReveal animation='slide-in-right'>
              <h2 className='text-3xl md:text-4xl font-bold text-[#202c39] dark:text-white'>
                Hardware that looks as good as you do
              </h2>
              <p className='text-lg text-gray-500 dark:text-gray-300'>
                Accept payments in style with our sleek card readers. Fully integrated with your Zerv app for seamless
                checkout.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4'>
                <div className='p-4 bg-gray-50 dark:bg-[#0a2c24] rounded-xl border border-gray-100 dark:border-gray-700'>
                  <h4 className='font-bold text-[#202c39] dark:text-white'>Zerv Reader M2</h4>
                  <p className='text-[#77b6a3] font-bold'>$59</p>
                </div>
                <div className='p-4 bg-gray-50 dark:bg-[#0a2c24] rounded-xl border border-gray-100 dark:border-gray-700'>
                  <h4 className='font-bold text-[#202c39] dark:text-white'>Zerv POS Terminal</h4>
                  <p className='text-[#77b6a3] font-bold'>$249</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Fees Mosaic */}
      <section className='py-24 bg-[#f7f8f9] dark:bg-[#0a2c24]'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold text-[#202c39] dark:text-white'>Transparent Processing Fees</h2>
            <p className='text-gray-500 mt-4'>Keep more of what you earn with our competitive rates.</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <ScrollReveal className='bg-white dark:bg-[#202c39] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6'>
              <div className='w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl'>
                <i className='ri-smartphone-line'></i>
              </div>
              <div>
                <h3 className='text-xl font-bold text-[#202c39] dark:text-white'>Mobile Payments</h3>
                <p className='text-2xl font-bold text-[#77b6a3] mt-1'>2.6% + 10¢</p>
                <p className='text-sm text-gray-400'>per transaction</p>
              </div>
            </ScrollReveal>

            <ScrollReveal
              delay={100}
              className='bg-white dark:bg-[#202c39] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6'
            >
              <div className='w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl'>
                <i className='ri-bank-card-line'></i>
              </div>
              <div>
                <h3 className='text-xl font-bold text-[#202c39] dark:text-white'>Card Reader</h3>
                <p className='text-2xl font-bold text-[#77b6a3] mt-1'>2.4% + 5¢</p>
                <p className='text-sm text-gray-400'>per transaction</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className='py-24 bg-white dark:bg-[#202c39]'>
        <div className='max-w-3xl mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12 text-[#202c39] dark:text-white'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            {[
              {
                q: 'Is there a long-term contract?',
                a: 'No, Zerv is a month-to-month service. You can cancel at any time without penalty.'
              },
              {
                q: 'Can I import my existing client data?',
                a: 'Absolutely! We offer free data migration assistance to help you move from your old system.'
              },
              {
                q: 'Do you charge for multiple staff members?',
                a: 'Our Pro plan includes 1 staff member. Additional staff seats are $10/month each.'
              }
            ].map((item, idx) => (
              <div key={idx} className='border-b border-gray-100 dark:border-gray-800 pb-4'>
                <h4 className='text-lg font-bold text-[#202c39] dark:text-white mb-2'>{item.q}</h4>
                <p className='text-gray-500 dark:text-gray-400'>{item.a}</p>
              </div>
            ))}
          </div>
          <div className='text-center mt-12'>
            <Button
              variant='outlined'
              className='border-[#0a2c39] text-[#0a2c39] dark:border-white dark:text-white'
              buttonText={{ plainText: 'Visit Help Center' }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
