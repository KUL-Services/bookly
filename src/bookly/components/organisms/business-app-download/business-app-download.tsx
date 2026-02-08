'use client'

import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { Button } from '@/bookly/components/molecules'

export const BusinessAppDownload = () => {
  return (
    <section className='py-24 bg-[#0a2c24] text-white overflow-hidden relative'>
      <div className='max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16 relative z-10'>
        {/* Text Content */}
        <div className='flex-1 space-y-8 '>
          <ScrollReveal animation='slide-in-left'>
            <h2 className='text-4xl md:text-5xl font-bold leading-tight'>
              Run your business from <span className='text-[#77b6a3]'>anywhere</span>.
            </h2>
            <p className='text-xl text-gray-300 max-w-xl leading-relaxed'>
              Manage your calendar, check analytics, and communicate with clients directly from any device. The Zerv
              Business platform keeps you connected and in control.
            </p>

            <div className='flex flex-wrap gap-4 pt-6'>
              <Button
                className='bg-[#77b6a3] hover:bg-[#5da891] text-white px-8 py-4 rounded-full font-bold shadow-[0_10px_30px_-10px_rgba(119,182,163,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(119,182,163,0.5)] transform hover:-translate-y-1 transition-all duration-300 text-lg'
                buttonText={{ plainText: 'Get Started Free' }}
              />
              <Button
                variant='outlined'
                className='bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white px-8 py-4 rounded-full font-semibold transition-all duration-300 text-lg flex items-center gap-2'
                buttonText={{ plainText: 'Explore Features' }}
                prefixIcon={{ icon: 'ri-arrow-right-line', className: 'text-xl' }}
              />
            </div>

            <div className='pt-8 flex items-center gap-4 text-sm text-gray-300'>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map(i => (
                  <i key={i} className='ri-star-fill text-yellow-400 text-lg'></i>
                ))}
              </div>
              <p className='font-medium'>Trusted by 2,000+ businesses</p>
            </div>
          </ScrollReveal>
        </div>

        {/* Laptop Mockup */}
        <div className='flex-1 w-full max-w-xl mx-auto md:max-w-none md:ml-auto relative flex justify-center items-center'>
          <ScrollReveal animation='slide-in-right' delay={200} className='w-full'>
            <div className='relative w-full'>
              {/* Laptop Body */}
              <div className='relative z-20'>
                {/* Screen Lid */}
                <div className='relative bg-gray-900 rounded-t-xl border-[8px] border-gray-800 shadow-2xl overflow-hidden aspect-[16/10]'>
                  {/* Camera */}
                  <div className='absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-800 rounded-b-md z-30 flex justify-center items-center'>
                    <div className='w-1.5 h-1.5 rounded-full bg-black/60'></div>
                  </div>

                  {/* Dashboard Content */}
                  <div className='absolute inset-0 bg-[#0f172a] flex overflow-hidden'>
                    {/* Sidebar */}
                    <div className='w-16 bg-[#1e293b] border-r border-white/5 flex flex-col items-center py-4 space-y-4 shrink-0'>
                      <div className='w-8 h-8 rounded-lg bg-[#77b6a3] flex items-center justify-center text-[#0a2c24] shadow-lg shadow-[#77b6a3]/20'>
                        <i className='ri-command-fill text-sm'></i>
                      </div>
                      <div className='w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center text-gray-400'>
                        <i className='ri-dashboard-line'></i>
                      </div>
                      <div className='w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center text-gray-400'>
                        <i className='ri-calendar-line'></i>
                      </div>
                      <div className='w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center text-gray-400'>
                        <i className='ri-user-line'></i>
                      </div>
                    </div>

                    {/* Main Area */}
                    <div className='flex-1 p-5 space-y-5 overflow-hidden flex flex-col'>
                      {/* Header */}
                      <div className='flex justify-between items-center shrink-0'>
                        <div>
                          <div className='h-5 w-32 bg-white/10 rounded mb-2'></div>
                          <div className='h-3 w-20 bg-white/5 rounded'></div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-full bg-white/10 border border-white/5'></div>
                          <div className='w-8 h-8 rounded-full bg-[#77b6a3] border border-white/5'></div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className='grid grid-cols-2 gap-4 shrink-0'>
                        <div className='bg-[#1e293b] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group/stat'>
                          <div className='text-xs text-gray-400 font-medium mb-1'>Total Revenue</div>
                          <div className='text-xl font-bold text-white group-hover/stat:text-[#77b6a3] transition-colors'>
                            E£12,450
                          </div>
                          <div className='text-[10px] text-[#77b6a3] mt-1'>+12.5% vs last week</div>
                        </div>
                        <div className='bg-[#77b6a3] p-4 rounded-xl shadow-lg shadow-[#77b6a3]/10 transform hover:scale-[1.02] transition-transform'>
                          <div className='text-xs text-[#0a2c24]/80 font-bold mb-1'>Active Bookings</div>
                          <div className='text-xl font-bold text-[#0a2c24]'>142</div>
                          <div className='text-[10px] text-[#0a2c24] mt-1 font-medium'>+8 new today</div>
                        </div>
                      </div>

                      {/* Chart Area */}
                      <div className='flex-1 bg-[#1e293b] rounded-xl border border-white/5 w-full relative overflow-hidden group/chart'>
                        <div className='absolute inset-0 bg-gradient-to-t from-[#77b6a3]/5 to-transparent'></div>
                        {/* Chart Grid Lines */}
                        <div className='absolute inset-x-0 bottom-4 h-[1px] bg-white/5'></div>
                        <div className='absolute inset-x-0 bottom-1/2 h-[1px] bg-white/5'></div>

                        {/* Chart bars */}
                        <div className='absolute bottom-0 inset-x-0 flex items-end justify-between px-6 pb-0 pt-8 gap-2 h-full'>
                          {[35, 55, 45, 75, 50, 85, 60, 90, 65, 80].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: h + '%' }}
                              className='w-full bg-[#77b6a3] rounded-t-sm opacity-80 group-hover/chart:opacity-100 transition-all duration-500 ease-out transform origin-bottom hover:scale-y-110'
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyboard Base */}
                <div className='relative mx-auto w-[120%] h-4 bg-gray-800 rounded-b-xl shadow-2xl z-10 -mt-1'>
                  <div className='absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-gray-700 rounded-b-md'></div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
