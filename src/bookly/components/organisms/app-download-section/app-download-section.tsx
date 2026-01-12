'use client'
import { H2, P } from '@/bookly/components/atoms'
import { Button } from '@/bookly/components/molecules'

function AppDownloadSection() {
  return (
    <section className='py-8 sm:py-12 lg:py-16 bg-primary-700'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center'>
          <div className='flex flex-col items-center md:items-start text-white text-center md:text-left'>
            <H2 stringProps={{ plainText: 'Book on the go' }} className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4' />
            <P
              stringProps={{
                plainText: 'Download our app for easy booking anytime, anywhere'
              }}
              className='text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-md'
            />
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto'>
              <Button
                buttonText={{ plainText: 'App Store' }}
                variant='containedRevers'
                prefixIcon={{ icon: 'lucide:apple' }}
                onClick={() => console.log('Download Button clicked')}
                className='w-full sm:w-auto touch-manipulation'
              />
              <Button
                buttonText={{ plainText: 'Google Play' }}
                variant='containedRevers'
                prefixIcon={{ icon: 'lucide:play' }}
                onClick={() => console.log('Download Button clicked')}
                className='w-full sm:w-auto touch-manipulation'
              />
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8'>
              <div className='bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 text-center'>
                <div className='text-xl sm:text-2xl font-bold text-primary-700 mb-1 sm:mb-2'>Bookly</div>
                <div className='text-xs sm:text-sm text-gray-600'>Mobile App</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppDownloadSection
