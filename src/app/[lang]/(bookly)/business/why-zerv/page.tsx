'use client'

import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { Button } from '@/bookly/components/molecules'

export default function WhyZervPage() {
  return (
    <div className='bg-primary-800 min-h-screen text-white overflow-hidden'>
      {/* 1. Hero Section: The Zerv Advantage */}
      <section className='relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden'>
        <div className='relative z-10 max-w-5xl mx-auto'>
          <ScrollReveal animation='fade-up'>
            <div className='inline-block px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur-md mb-8'>
              <span className='text-teal-300 font-bold text-sm tracking-widest uppercase'>The Zerv Advantage</span>
            </div>
            <h1 className='text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-tight'>
              Don't just run <br /> your business.{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-sage-500 to-teal-400'>
                Elevate it.
              </span>
            </h1>
            <p className='text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed'>
              The only platform designed to maximize your revenue, reclaim your time, and give you complete financial
              control.
            </p>
            <div className='flex flex-col sm:flex-row gap-6 justify-center'>
              <Button
                className='bg-sage-500 hover:bg-sage-600 text-primary-800 px-10 py-5 rounded-full text-xl font-bold shadow-[0_0_40px_-10px_rgba(119,182,163,0.5)] transition-all transform hover:scale-105'
                buttonText={{ plainText: 'Start Your Legacy' }}
              />
              {/* <Button
                variant='outlined'
                className='border-white/20 text-white hover:bg-white/5 px-10 py-5 rounded-full text-xl font-bold transition-all backdrop-blur-sm'
                buttonText={{ plainText: 'See the Difference' }}
                prefixIcon={{ icon: 'ri-arrow-down-line', className: 'mr-2' }}
              /> */}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Pillar 1: Unstoppable Growth */}
      <section className='py-32 relative bg-white'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex flex-col md:flex-row items-center gap-20'>
            <div className='flex-1'>
              <ScrollReveal animation='slide-in-left'>
                <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl mb-8 shadow-lg shadow-teal-500/20'>
                  <i className='ri-rocket-fill'></i>
                </div>
                <h2 className='text-4xl md:text-6xl font-bold mb-6 text-secondary-600'>Unstoppable Growth</h2>
                <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                  Stop chasing clients. Zerv's integrated marketing suite works 24/7 to fill your calendar. From
                  automated email blasts to smart waitlists, we turn empty slots into revenue.
                </p>
                <div className='space-y-6'>
                  <div className='flex gap-4 items-start group'>
                    <div className='w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors'>
                      <i className='ri-mail-send-fill text-lg'></i>
                    </div>
                    <div>
                      <h3 className='text-xl font-bold mb-1 text-secondary-600'>Automated Campaigns</h3>
                      <p className='text-gray-500 text-sm'>
                        Re-engage clients who haven't visited in 60 days automatically.
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-4 items-start group'>
                    <div className='w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors'>
                      <i className='ri-coupon-3-fill text-lg'></i>
                    </div>
                    <div>
                      <h3 className='text-xl font-bold mb-1 text-secondary-600'>Smart Promotions</h3>
                      <p className='text-gray-500 text-sm'>Fill slow days with targeted flash sales and promo codes.</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <div className='flex-1 relative'>
              <ScrollReveal animation='slide-in-right'>
                <div className='relative bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl'>
                  <div className='flex items-center justify-between mb-8'>
                    <div>
                      <div className='text-sm text-gray-500 uppercase tracking-widest'>Campaign Performance</div>
                      <div className='text-3xl font-bold text-secondary-600 mt-1'>Summer Glow</div>
                    </div>
                    <div className='px-4 py-2 bg-teal-500/20 text-teal-600 rounded-full font-bold text-sm'>Active</div>
                  </div>
                  <div className='grid grid-cols-2 gap-4 mb-8'>
                    <div className='bg-gray-50 p-4 rounded-xl border border-gray-100'>
                      <div className='text-gray-500 text-xs mb-1'>Open Rate</div>
                      <div className='text-2xl font-bold text-secondary-600'>68.4%</div>
                      <div className='text-xs text-teal-600'>+12% vs avg</div>
                    </div>
                    <div className='bg-gray-50 p-4 rounded-xl border border-gray-100'>
                      <div className='text-gray-500 text-xs mb-1'>Revenue Generated</div>
                      <div className='text-2xl font-bold text-teal-600'>E£4,250</div>
                    </div>
                  </div>
                  <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div className='h-full w-[70%] bg-gradient-to-r from-teal-500 to-teal-300'></div>
                  </div>
                  <div className='mt-4 flex justify-between text-xs text-gray-500'>
                    <span>Goal: E£6,000</span>
                    <span>70% Reached</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pillar 2: Ultimate Freedom */}
      <section className='py-32 bg-secondary-800 relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex flex-col md:flex-row items-center gap-20'>
            <div className='flex-1 order-2 md:order-1 relative'>
              <ScrollReveal animation='slide-in-left'>
                <div className='relative h-[500px] w-full'>
                  {/* Graphic: The Night Shift */}
                  <div className='absolute inset-0 bg-secondary-700 rounded-3xl border border-white/5 p-8 overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-b from-transparent to-secondary-800/90 z-10'></div>
                    <div className='space-y-6 relative z-0 opacity-50'>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className='flex gap-4 items-center'>
                          <div className='w-12 h-12 rounded-full bg-secondary-600'></div>
                          <div className='h-4 w-3/4 bg-secondary-600 rounded'></div>
                        </div>
                      ))}
                    </div>

                    {/* Floating "Events" */}
                    <div className='absolute top-1/4 left-10 z-20 bg-white text-secondary-800 p-4 rounded-xl shadow-xl animate-bounce duration-[4000ms]'>
                      <div className='flex items-center gap-2 font-bold'>
                        <i className='ri-moon-clear-fill text-secondary-600'></i> 11:42 PM
                      </div>
                      <div className='text-sm'>New Booking: Sarah J.</div>
                    </div>

                    <div className='absolute top-1/2 right-10 z-20 bg-teal-500 text-white p-4 rounded-xl shadow-xl animate-bounce duration-[5000ms] delay-700'>
                      <div className='flex items-center gap-2 font-bold'>
                        <i className='ri-flashlight-fill text-yellow-300'></i> 2:15 AM
                      </div>
                      <div className='text-sm'>Deposit Received: E£50</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <div className='flex-1 order-1 md:order-2'>
              <ScrollReveal animation='slide-in-right'>
                <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center text-white text-3xl mb-8 shadow-lg shadow-sage-500/20'>
                  <i className='ri-flight-takeoff-fill'></i>
                </div>
                <h2 className='text-4xl md:text-6xl font-bold mb-6'>Ultimate Freedom</h2>
                <p className='text-xl text-gray-300 mb-8 leading-relaxed'>
                  Wake up to a full schedule and money in the bank. Zerv works while you sleep, handling bookings,
                  deposits, and reminders so you can focus on your craft—or your life.
                </p>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='bg-secondary-700/50 p-6 rounded-2xl border border-white/5'>
                    <div className='text-3xl font-bold text-white mb-1'>30%</div>
                    <div className='text-sm text-gray-400'>Fewer No-Shows</div>
                  </div>
                  <div className='bg-secondary-700/50 p-6 rounded-2xl border border-white/5'>
                    <div className='text-3xl font-bold text-white mb-1'>5hrs+</div>
                    <div className='text-sm text-gray-400'>Saved Per Week</div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pillar 3: Financial Command */}
      <section className='py-32 relative bg-white'>
        <div className='max-w-4xl mx-auto px-4 text-center mb-16'>
          <ScrollReveal animation='fade-up'>
            <h2 className='text-4xl md:text-6xl font-bold mb-6 text-secondary-600'>Total Financial Control</h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Say goodbye to messy spreadsheets. Track every penny, manage commissions, and get paid instantly with our
              pro-grade financial suite.
            </p>
          </ScrollReveal>
        </div>

        <div className='max-w-6xl mx-auto px-4'>
          <ScrollReveal animation='fade-up' delay={200}>
            <div className='relative bg-white rounded-[3rem] border border-gray-200 p-2 md:p-4 shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent rounded-[3rem] pointer-events-none'></div>
              <div className='bg-white rounded-[2.5rem] overflow-hidden p-8 md:p-12 relative border border-gray-100'>
                <div className='flex justify-between items-end mb-12'>
                  <div>
                    <div className='text-gray-500 uppercase tracking-widest text-sm mb-2'>Net Revenue (This Month)</div>
                    <div className='text-5xl md:text-7xl font-bold text-secondary-600'>E£12,450.00</div>
                  </div>
                  <div className='hidden md:block text-right'>
                    <div className='text-teal-600 font-bold text-xl'>+15.3%</div>
                    <div className='text-gray-500 text-sm'>vs last month</div>
                  </div>
                </div>

                {/* Chart Graphic */}
                <div className='h-[300px] w-full flex items-end gap-2 md:gap-4'>
                  {[40, 60, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className='flex-1 bg-gray-100 rounded-t-lg relative group h-full overflow-hidden'>
                      <div
                        className='absolute bottom-0 w-full bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-500'
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. The Switch comparison */}
      {/* <section className='py-32 bg-secondary-800'>
        <div className='max-w-5xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold mb-6'>Why Pros Switch to Zerv</h2>
          </div>

          <div className='overflow-x-auto'>
            <div className='min-w-[700px]'>
              <div className='grid grid-cols-3 gap-8 mb-8 px-8'>
                <div className='text-2xl font-bold text-gray-500 pt-8'>Other Apps</div>
                <div className='relative bg-primary-800 rounded-t-3xl p-8 pb-0 text-center border-t border-x border-teal-500/30'>
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-primary-800 px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-teal-500/20'>
                    THE CHOICE
                  </div>
                  <div className='text-3xl font-bold text-white'>Zerv_</div>
                </div>
                <div className='text-2xl font-bold text-gray-500 pt-8 text-right'>Notebook</div>
              </div>

              <div className='space-y-4'>
                {[
                  { label: 'Booking Fees', zerv: '0%', other: '2-5%', manual: 'N/A' },
                  { label: 'Marketing Suite', zerv: 'Included', other: 'Extra fees', manual: 'None' },
                  { label: 'Instant Payouts', zerv: 'Yes', other: '2-3 Days', manual: 'Cash Only' },
                  { label: 'Client App', zerv: 'No Download', other: 'Required', manual: 'None' },
                  { label: 'Support', zerv: '24/7 Priority', other: 'Email Only', manual: 'None' }
                ].map((row, i) => (
                  <div
                    key={i}
                    className='grid grid-cols-3 gap-8 py-6 border-b border-white/5 items-center px-8 hover:bg-white/5 transition-colors rounded-xl'
                  >
                    <div className='font-bold text-gray-300'>{row.label}</div>
                    <div className='text-center font-bold text-teal-400 text-xl'>{row.zerv}</div>
                    <div className='text-right text-gray-500'>{row.other}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* 6. Final CTA */}
      <section className='py-32 bg-gradient-to-br from-primary-800 to-primary-600 relative overflow-hidden'>
        <div className='max-w-4xl mx-auto px-4 text-center relative z-10'>
          <h2 className='text-5xl md:text-7xl font-bold mb-8 leading-tight'>Your empire starts here.</h2>
          <p className='text-xl text-gray-200 mb-12 max-w-2xl mx-auto'>
            Join 50,000+ top-tier professionals who have already made the switch. No setup fees. No contracts. Just
            results.
          </p>
          <Button
            className='bg-white text-primary-800 hover:bg-gray-100 px-12 py-6 rounded-full text-2xl font-bold shadow-2xl transform hover:-translate-y-1 transition-all'
            buttonText={{ plainText: 'Start Free Trial' }}
          />
          <p className='mt-6 text-sm text-gray-400 font-medium'>No credit card required • Cancel anytime</p>
        </div>
      </section>
    </div>
  )
}
