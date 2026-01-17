import Link from 'next/link'

// Assets
import WhiteIconLogo from '@assets/logos/icons/White_Icon.png'

function FooterSection() {
  return (
    <footer className='bg-[#0a2c24] text-white py-12 sm:py-16 lg:py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Top section with logo and tagline */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 pb-8 border-b border-white/10'>
          <div className='flex items-center gap-4'>
            <img
              src={WhiteIconLogo.src}
              alt='Zerv'
              className='w-12 h-12 sm:w-14 sm:h-14 object-contain'
            />
            <div>
              <span className='text-xl sm:text-2xl font-bold text-white'>Zerv</span>
              <p className='text-[#77b6a3] text-sm mt-0.5'>Book with confidence</p>
            </div>
          </div>
          <p className='text-white/70 text-sm sm:text-base max-w-md'>
            Simplifying how people connect with beauty, wellness, grooming, and lifestyle providers.
          </p>
        </div>

        {/* Links grid */}
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12'>
          {/* Company Section */}
          <div>
            <h4 className='text-sm font-semibold text-white uppercase tracking-wider mb-4'>
              Company
            </h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  About Us
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Careers
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Press
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Customers Section */}
          <div>
            <h4 className='text-sm font-semibold text-white uppercase tracking-wider mb-4'>
              For Customers
            </h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  How it Works
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Reviews
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses Section */}
          <div>
            <h4 className='text-sm font-semibold text-white uppercase tracking-wider mb-4'>
              For Businesses
            </h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Business App
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Marketing Tools
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300'>
                  Partner Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h4 className='text-sm font-semibold text-white uppercase tracking-wider mb-4'>
              Connect
            </h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#51b4b7] transition-colors duration-300 flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z'/>
                  </svg>
                  Twitter
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#e88682] transition-colors duration-300 flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                  </svg>
                  Instagram
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#77b6a3] transition-colors duration-300 flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z'/>
                  </svg>
                  Facebook
                </Link>
              </li>
              <li>
                <Link href='#' className='text-white/60 hover:text-[#51b4b7] transition-colors duration-300 flex items-center gap-2'>
                  <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/>
                  </svg>
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className='border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <p className='text-white/50 text-xs sm:text-sm'>
            © 2025 Zerv. All rights reserved.
          </p>
          <div className='flex items-center gap-6 text-xs sm:text-sm text-white/50'>
            <Link href='#' className='hover:text-[#77b6a3] transition-colors duration-300'>
              Terms of Service
            </Link>
            <Link href='#' className='hover:text-[#77b6a3] transition-colors duration-300'>
              Privacy Policy
            </Link>
            <Link href='#' className='hover:text-[#77b6a3] transition-colors duration-300'>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
