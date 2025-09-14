'use client'
import { H1 } from '@/bookly/components/atoms'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import { ExploreSection } from '@/bookly/components/organisms'
import AppDownloadSection from '@/bookly/components/organisms/app-download-section/app-download-section'
import { FeaturesSection } from '@/bookly/components/organisms/features-section/features-section.component'
import FooterSection from '@/bookly/components/organisms/footer-section/footer-section'
import { t } from 'i18next'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

function LandPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const params = useParams<{ lang: string }>()
  const router = useRouter()
  const goToProfile = () => router.push(`/${params?.lang}/profile`)
  return (
    <div className='min-h-screen'>
      <header className='flex items-center justify-between px-6 py-6 bg-white relative shadow-md'>
        <div className='text-2xl font-bold text-teal-500'>Bookly</div>
        <nav className='hidden md:flex items-center space-x-8'>
          <Button
            className='text-gray-600 hover:text-gray-800'
            variant='text'
            size='md'
            buttonText={{ plainText: 'For Businesses' }}
          />
          <Button variant='text' size='md' buttonText={{ plainText: 'Help' }} />
          <Button variant='text' size='md' onClick={goToProfile} buttonText={{ localeKey: 'nav.profile' }} />
        </nav>
        <div className='hidden md:flex items-center space-x-4'>
          <Button variant='outlined' size='md' buttonText={{ plainText: 'Sign In' }} />
          <Button variant='contained' size='md' buttonText={{ plainText: 'Sign Up' }} />
        </div>
        <Button
          className='md:hidden '
          aria-label='Toggle menu'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          prefixIcon={isMobileMenuOpen ? { icon: 'lucide:x' } : { icon: 'lucide:menu' }}
        />

        {isMobileMenuOpen && (
          <div className='absolute top-full left-0 right-0 bg-white shadow-lg border-t md:hidden z-50 '>
            <nav className='flex flex-col items-center p-4 space-y-4  '>
              <Button
                className='w-full text-start text-gray-600 hover:text-gray-800  '
                variant='text'
                size='md'
                buttonText={{ plainText: 'For Businesses' }}
              />
              <Button className='w-full text-start' variant='text' size='md' buttonText={{ plainText: 'Help' }} />
              <Button className='w-full text-start' variant='text' size='md' onClick={goToProfile} buttonText={{ localeKey: 'nav.profile' }} />
              <div className=' w-full flex items-start space-x-3 pt-4 border-t border-gray-200 '>
                <Button variant='outlined' size='md' buttonText={{ plainText: 'Sign In' }} />
                <Button variant='contained' size='md' buttonText={{ plainText: 'Sign Up' }} />
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className='relative var(--foreground) py-20'>
          <div
            className='absolute inset-0 bg-cover bg-center opacity-20'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop')"
            }}
          />
          <div className='relative max-w-4xl mx-auto px-6'>
            <H1
              stringProps={{
                plainText: 'Find and book beauty & wellness services'
              }}
              className='text-4xl text-center md:text-5xl font-bold text-gray-900 mb-8'
            />
            {/* Search Bar */}
            <div className='px-8 py-6 max-w-full mx-auto flex flex-col md:flex-row  bg-white rounded-2xl shadow-lg overflow-hidden gap-4'>
              <SearchInput
                placeholderProps={{
                  plainText: 'e.g. haircut, facial, massage'
                }}
                i18nTFn={t}
                className=''
              />
              <SearchInput
                placeholderProps={{
                  plainText: 'Location'
                }}
                i18nTFn={t}
                leadingIcon={MapPin}
              />
              <Button buttonText={{ plainText: 'Search' }} />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className='var(--background)'>
          <ExploreSection />
        </div>

        {/* Features Section */}
        <div className=''>
          <FeaturesSection />
        </div>

        {/* App Download Section */}
        <AppDownloadSection />

        {/* Footer */}
        <FooterSection />
      </main>
    </div>
  )
}

export default LandPage
