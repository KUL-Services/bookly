import { H3, P } from '@/bookly/components/atoms'
import Link from 'next/link'

function FooterSection() {
  return (
    <footer className='bg-gray-900 text-white py-12'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid md:grid-cols-4 gap-8'>
          {/* Company Section */}
          <div>
            <div className='mb-4'>
              <H3 stringProps={{ plainText: 'Company' }} className='text-lg font-bold text-white' />
            </div>
            <ul className='space-y-2 text-gray-400'>
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
            <div className='mb-4'>
              <H3 stringProps={{ plainText: 'For Customers' }} className='text-lg font-bold text-white' />
            </div>

            <ul className='space-y-2 text-gray-400'>
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
            <div className='mb-4'>
              <H3 stringProps={{ plainText: 'For Businesses' }} className='text-lg font-bold text-white' />
            </div>
            <ul className='space-y-2 text-gray-400'>
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
            <div className='mb-4'>
              <H3 stringProps={{ plainText: 'Connect' }} className='text-lg font-bold text-white' />
            </div>

            <ul className='space-y-2 text-gray-400'>
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
        <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
          <P stringProps={{ plainText: '© 2025 Bookly. All rights reserved.' }} />
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
