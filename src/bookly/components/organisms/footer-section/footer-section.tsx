import { H3, P } from '@/bookly/components/atoms'
import Link from 'next/link'

function FooterSection() {
  return (
    <footer className='bg-gray-900 text-white py-8 sm:py-10 lg:py-12'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8'>
          {/* Company Section */}
          <div>
            <div className='mb-3 sm:mb-4'>
              <H3 stringProps={{ plainText: 'Company' }} className='text-base sm:text-lg font-bold text-white' />
            </div>
            <ul className='space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400'>
              <li>
                <Link href='#' className='hover:text-white'>
                  About Us
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Careers
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* For Customers Section */}
          <div>
            <div className='mb-3 sm:mb-4'>
              <H3 stringProps={{ plainText: 'For Customers' }} className='text-base sm:text-lg font-bold text-white' />
            </div>

            <ul className='space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400'>
              <li>
                <Link href='#' className='hover:text-white'>
                  How it Works
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Reviews
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses Section */}
          <div>
            <div className='mb-3 sm:mb-4'>
              <H3 stringProps={{ plainText: 'For Businesses' }} className='text-base sm:text-lg font-bold text-white' />
            </div>
            <ul className='space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400'>
              <li>
                <Link href='#' className='hover:text-white'>
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Business App
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Marketing Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <div className='mb-3 sm:mb-4'>
              <H3 stringProps={{ plainText: 'Connect' }} className='text-base sm:text-lg font-bold text-white' />
            </div>

            <ul className='space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400'>
              <li>
                <Link href='#' className='hover:text-white'>
                  Facebook
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Instagram
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-white'>
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400'>
          <P stringProps={{ plainText: '© 2025 Zerv. All rights reserved.' }} className='text-xs sm:text-sm' />
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
