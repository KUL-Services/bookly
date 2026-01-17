'use client'
import { H2, P } from '@/bookly/components/atoms'

function AppDownloadSection() {
  return (
    <section className='py-8 sm:py-12 lg:py-16 bg-primary-700'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center'>
          <div className='flex flex-col items-center md:items-start text-white text-center md:text-left'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80 mb-4'>
              Mobile app coming soon
            </div>
            <H2
              stringProps={{ plainText: 'Book faster, anywhere' }}
              className='text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 sm:mb-4'
            />
            <P
              stringProps={{
                plainText: 'We are polishing the mobile experience. For now, use the web booking flow with the same services and availability.'
              }}
              className='text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 opacity-90 max-w-md'
            />
            <div className='flex flex-wrap items-center gap-3 text-white/80 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full bg-coral-400' />
                <span>No store listings yet</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full bg-sage-300' />
                <span>Web booking is live</span>
              </div>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='bg-white/15 backdrop-blur-sm rounded-[28px] p-5 sm:p-7 lg:p-8'>
              <div className='bg-white rounded-[20px] p-5 sm:p-7 text-center'>
                <div className='text-lg sm:text-2xl font-semibold text-primary-700 mb-1 sm:mb-2'>Bookly</div>
                <div className='text-xs sm:text-sm text-gray-600'>Mobile app preview</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadSection
