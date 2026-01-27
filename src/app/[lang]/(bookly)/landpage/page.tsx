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
import { ZWatermark, ZDivider } from '@/bookly/components/atoms/zerv-assets'
import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'

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
        {/* Hero Section - Zerv Dark Brand */}
        <section className='relative pt-16 pb-32 sm:pt-20 sm:pb-40 md:pt-24 md:pb-48 lg:pt-32 lg:pb-56 overflow-hidden bg-[#0a2c24] shadow-2xl'>
          {/* Background Texture - Z Pattern */}
          <div className='absolute inset-0 opacity-[0.05] bg-zerv-pattern' />

          {/* Large Z-Ribbon Motif - Hero Backdrop - Reduced Opacity */}
          <div className='absolute right-[-10%] top-[-20%] h-[120%] w-[80%] pointer-events-none overflow-hidden opacity-[0.05]'>
            <div
              className='absolute inset-0 zerv-mask'
              style={{
                background: 'linear-gradient(135deg, #f7f8f9 0%, transparent 60%)',
                transform: 'rotate(-15deg) scale(1.5)'
              }}
            />
          </div>

          <div
            className='absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop')"
            }}
          />

          <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10'>
            <div className='text-center space-y-6 sm:space-y-8'>
              <h1 className='text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight pb-2 max-w-5xl mx-auto'>
                {t('landing.hero.titlePrefix')}
                <span className='relative inline-block px-4'>
                  <InlineZervLogo className='h-[2em] w-[2.25em] translate-y-[0.3em] text-white' />
                </span>
                {t('landing.hero.titleSuffix')}
              </h1>

              <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200/90 max-w-3xl mx-auto leading-relaxed font-light'>
                {t('landing.hero.subtitle')}
              </p>

              {/* Search Bar - Floating Pill */}
              <div className='w-full max-w-4xl mx-auto mt-12 relative z-20'>
                <div className='bg-white/95 backdrop-blur-md p-3 sm:p-2 rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.4)] transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-white/20'>
                  <div className='grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-3 md:gap-2 p-1 sm:p-2'>
                    <div className='flex-1 relative border-b border-gray-100 md:border-b-0 md:border-r bg-gray-50/50 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0'>
                      <SearchInput
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        onKeyDown={handleSearchKey}
                        placeholderProps={{
                          localeKey: 'landing.search.servicePlaceholder'
                        }}
                        i18nTFn={t}
                        className='w-full h-12 md:h-14 text-lg border-none bg-transparent focus:bg-transparent rounded-[2rem] focus:ring-0 font-medium text-gray-800 placeholder:text-gray-500 pl-10 md:pl-12 pr-4'
                      />
                    </div>
                    <div className='flex-1 relative bg-gray-50/50 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0'>
                      <SearchInput
                        value={loc}
                        onChange={e => setLoc(e.target.value)}
                        onKeyDown={handleSearchKey}
                        placeholderProps={{
                          localeKey: 'landing.search.locationPlaceholder'
                        }}
                        i18nTFn={t}
                        leadingIcon={MapPin}
                        className='w-full h-12 md:h-14 text-lg border-none bg-transparent focus:bg-transparent rounded-[2rem] focus:ring-0 font-medium text-gray-800 placeholder:text-gray-500 pl-10 md:pl-12 pr-4'
                      />
                    </div>
                    <Button
                      onClick={goSearch}
                      buttonText={{ localeKey: 'landing.search.button' }}
                      i18nTFn={t}
                      className='w-full md:w-auto bg-[#202c39] text-white px-8 lg:px-10 py-3 md:py-4 h-12 md:h-14 text-lg font-bold rounded-xl md:rounded-full shadow-lg hover:bg-[#0a2c24] transition-all duration-300 transform hover:scale-105 active:scale-95'
                    />
                  </div>
                </div>
              </div>

              {/* Trust indicators - Light on Dark */}
              <ScrollReveal delay={400} animation='fade-up'>
                <div className='flex flex-wrap justify-center items-center gap-8 sm:gap-12 pt-8 opacity-80'>
                  <div className='flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-300'>
                    <div className='w-2 h-2 bg-sage-400 rounded-full animate-pulse' />
                    <span className='text-sm font-medium tracking-wide'>{t('landing.stats.businesses')}</span>
                  </div>
                  <div className='flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-300'>
                    <div className='w-2 h-2 bg-teal-400 rounded-full animate-pulse' />
                    <span className='text-sm font-medium tracking-wide'>{t('landing.stats.customers')}</span>
                  </div>
                  <div className='flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-300'>
                    <div className='w-2 h-2 bg-coral-400 rounded-full animate-pulse' />
                    <span className='text-sm font-medium tracking-wide'>{t('landing.stats.rating')}</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
          {/* Bottom Curved Separator - Z-Swoosh */}
          <div className='absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none'>
            <svg
              className='relative block w-[calc(100%+1.3px)] h-[120px] sm:h-[200px]'
              data-name='Layer 1'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1200 120'
              preserveAspectRatio='none'
            >
              <path
                d='M1200 120L0 120 0 40C250 130 550 140 850 60C1000 20 1100 0 1200 0V120Z'
                fill='#f7f8f9'
                className='dark:fill-[#202c39]'
              />
            </svg>
          </div>
        </section>

        {/* Recommended Businesses Section */}
        <ScrollReveal animation='fade-up' delay={100} className='relative bg-gray-50/50 dark:bg-[#202c39]/30'>
          <ZDivider className='absolute top-0 transform -translate-y-1/2 z-10 text-white' />
          <RecommendedSection />
        </ScrollReveal>

        {/* Categories Section */}
        <ScrollReveal animation='fade-up' delay={200} className='relative bg-white dark:bg-[#202c39] py-16 sm:py-24'>
          <ZWatermark className='opacity-[0.02]' />
          <ExploreSection />
        </ScrollReveal>

        {/* Business Growth Banner */}
        <ScrollReveal animation='slide-in-left' delay={100}>
          <BusinessGrowthBanner />
        </ScrollReveal>

        {/* Features Section */}
        <div className='relative bg-[#f7f8f9] dark:bg-[#0a2c24] py-12 sm:py-16'>
          <ScrollReveal animation='fade-up'>
            <FeaturesSection />
          </ScrollReveal>
        </div>

        {/* App Download Section */}
        {/* <div className='relative bg-white dark:bg-[#202c39]'>
          <AppDownloadSection />
        </div> */}

        {/* Footer */}
        <div className='relative bg-[#0a2c24]'>
          <FooterSection />
        </div>
      </main>
    </div>
  )
}

export default LandPage
