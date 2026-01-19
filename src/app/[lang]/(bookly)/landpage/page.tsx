'use client'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import { ExploreSection } from '@/bookly/components/organisms'
import AppDownloadSection from '@/bookly/components/organisms/app-download-section/app-download-section'
import { FeaturesSection } from '@/bookly/components/organisms/features-section/features-section.component'
import FooterSection from '@/bookly/components/organisms/footer-section/footer-section'
import { MapPin } from 'lucide-react'
import { RecommendedSection } from '@/bookly/components/organisms/recommended-section'
import { BusinessGrowthBanner } from '@/bookly/components/organisms/business-growth-banner'
import { useState, useEffect, type KeyboardEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { InlineZervLogo } from '@/bookly/components/atoms/inline-zerv-logo'

function LandPage() {
  const [q, setQ] = useState('')
  const [loc, setLoc] = useState('')
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()
  const params = useParams<{ lang: string }>()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      goSearch()
    }
  }

  const goSearch = () => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (loc) sp.set('loc', loc)
    router.push(`/${params?.lang}/search${sp.toString() ? `?${sp.toString()}` : ''}`)
  }
  return (
    <div className='min-h-screen bg-zerv-pattern dark:bg-[#0a2c24] font-sans'>
      {/* Shared BooklyNavbar is rendered in the (bookly) layout */}

      <main className='relative overflow-hidden'>
        {/* Hero Section - Full width with generous padding */}
        <section className='relative py-12 sm:py-16 md:py-20 lg:py-28'>
          <div
            className='absolute inset-0 bg-cover bg-center opacity-10'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop')"
            }}
          />
          <div className='absolute inset-0 pointer-events-none'>
            <div className='absolute -top-24 right-[-120px] h-64 w-64 rounded-full bg-gradient-to-br from-sage-200/40 via-teal-100/30 to-transparent blur-3xl dark:from-sage-800/30 dark:via-teal-900/20' />
            <div className='absolute bottom-[-120px] left-[-80px] h-72 w-72 rounded-full bg-gradient-to-tr from-coral-200/30 via-sage-100/20 to-transparent blur-3xl dark:from-coral-800/25 dark:via-sage-900/15' />
          </div>

          <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center space-y-4 sm:space-y-5 lg:space-y-6'>
              <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-900 dark:text-white leading-tight tracking-tight pb-2 max-w-4xl mx-auto'>
                {t('landing.hero.titlePrefix')}
                <InlineZervLogo className='h-[0.9em] w-[2.6em] -mx-[0.45em] translate-y-[0.1em]' />
                {t('landing.hero.titleSuffix')}
              </h1>

              <p className='text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed'>
                {t('landing.hero.subtitle')}
              </p>
              {/* Search Bar */}
              <div className='w-full max-w-3xl mx-auto mt-8'>
                <div className='glass-card p-2.5 sm:p-3 rounded-[22px] shadow-lg hover:shadow-xl transition-all duration-300'>
                  <div className='grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-2 sm:gap-3 p-1'>
                    <div className='flex-1'>
                      <SearchInput
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        onKeyDown={handleSearchKey}
                        placeholderProps={{
                          localeKey: 'landing.search.servicePlaceholder'
                        }}
                        i18nTFn={t}
                        className='w-full h-11 sm:h-12 text-base border-0 bg-white/70 dark:bg-[#202c39]/60 rounded-2xl focus-glow font-sans transition-all duration-300 hover:bg-white dark:hover:bg-[#202c39]'
                      />
                    </div>
                    <div className='flex-1'>
                      <SearchInput
                        value={loc}
                        onChange={e => setLoc(e.target.value)}
                        onKeyDown={handleSearchKey}
                        placeholderProps={{
                          localeKey: 'landing.search.locationPlaceholder'
                        }}
                        i18nTFn={t}
                        leadingIcon={MapPin}
                        className='w-full h-11 sm:h-12 text-base border-0 bg-white/70 dark:bg-[#202c39]/60 rounded-2xl focus-glow font-sans transition-all duration-300 hover:bg-white dark:hover:bg-[#202c39]'
                      />
                    </div>
                    <Button
                      onClick={goSearch}
                      buttonText={{ localeKey: 'landing.search.button' }}
                      i18nTFn={t}
                      className='w-full md:w-auto btn-primary-enhanced btn-press px-6 sm:px-7 py-2.5 h-11 sm:h-12 text-base font-semibold rounded-2xl hover:shadow-md active:scale-95 transition-all duration-300'
                    />
                  </div>
                </div>
              </div>

              {/* Trust indicators - Stretched with more spacing */}
              <div className='flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12 pt-4 sm:pt-6'>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 cursor-default'>
                  <div className='w-2.5 h-2.5 bg-sage-500 rounded-full animate-pulse-soft' />
                  <span className='text-xs sm:text-sm font-medium'>{t('landing.stats.businesses')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 cursor-default'>
                  <div className='w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse-soft' />
                  <span className='text-xs sm:text-sm font-medium'>{t('landing.stats.customers')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-coral-600 dark:hover:text-coral-400 transition-colors duration-300 cursor-default'>
                  <div className='w-2.5 h-2.5 bg-coral-500 rounded-full animate-pulse-soft' />
                  <span className='text-xs sm:text-sm font-medium'>{t('landing.stats.rating')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Businesses Section */}
        <div className='relative bg-white dark:bg-[#202c39]'>
          <RecommendedSection />
        </div>

        {/* Categories Section */}
        <div className='relative bg-white dark:bg-[#202c39]'>
          <ExploreSection />
        </div>

        {/* Features Section */}
        <div className='relative bg-[#f7f8f9] dark:bg-[#0a2c24]'>
          <FeaturesSection />
        </div>

        {/* Business Growth Banner */}
        <BusinessGrowthBanner />

        {/* App Download Section */}
        <div className='relative bg-white dark:bg-[#202c39]'>
          <AppDownloadSection />
        </div>

        {/* Footer */}
        <div className='relative bg-[#0a2c24]'>
          <FooterSection />
        </div>
      </main>
    </div>
  )
}

export default LandPage
