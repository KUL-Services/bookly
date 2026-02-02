'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import GreenWordLogo from '@/assets/logos/words/Green_Word.png'
import WhiteWordLogo from '@/assets/logos/words/White_Word.png'
import { i18nConfig } from '@/bookly/i18nConfig'

export const BusinessFooter = () => {
  const params = useParams<{ lang: string }>()
  const { t } = useTranslation()
  const currentLang = params?.lang || i18nConfig.defaultLocale

  return (
    <footer className='bg-[#0a2c24] text-white pt-16 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16'>
          {/* Brand Column */}
          <div className='space-y-6'>
            <div className='h-10 w-auto'>
              <img src={WhiteWordLogo.src} alt='Zerv' className='block object-contain h-full brightness-0 invert' />
            </div>
            <p className='text-gray-300 text-sm leading-relaxed max-w-xs'>
              {t(
                'business.footer.tagline',
                'The all-in-one booking platform for your business. Schedule, manage, and grow with ease.'
              )}
            </p>
            <div className='flex items-center space-x-4'>
              {/* Social Icons Placeholder */}
              <div className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors'>
                <i className='ri-instagram-line text-white'></i>
              </div>
              <div className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors'>
                <i className='ri-facebook-fill text-white'></i>
              </div>
              <div className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors'>
                <i className='ri-linkedin-fill text-white'></i>
              </div>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className='text-lg font-semibold mb-6 text-white'>{t('business.footer.product', 'Product')}</h3>
            <ul className='space-y-4'>
              <li>
                <Link
                  href={`/${currentLang}/business/features`}
                  className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLang}/business/pricing`}
                  className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLang}/business/why-zerv`}
                  className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'
                >
                  Why Zerv
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className='text-lg font-semibold mb-6 text-white'>{t('business.footer.company', 'Company')}</h3>
            <ul className='space-y-4'>
              <li>
                <a href='#' className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'>
                  About Us
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'>
                  Careers
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className='text-lg font-semibold mb-6 text-white'>{t('business.footer.legal', 'Legal')}</h3>
            <ul className='space-y-4'>
              <li>
                <a href='#' className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-300 hover:text-[#77b6a3] transition-colors text-sm'>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-gray-400 text-xs'>&copy; {new Date().getFullYear()} Zerv. All rights reserved.</p>
          <p className='text-gray-500 text-xs'>
            Made with <i className='ri-heart-fill text-[#77b6a3] mx-1'></i> for business owners everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
