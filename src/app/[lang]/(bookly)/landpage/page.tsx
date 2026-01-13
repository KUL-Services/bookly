'use client'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import { ExploreSection } from '@/bookly/components/organisms'
import AppDownloadSection from '@/bookly/components/organisms/app-download-section/app-download-section'
import { FeaturesSection } from '@/bookly/components/organisms/features-section/features-section.component'
import FooterSection from '@/bookly/components/organisms/footer-section/footer-section'
import { MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import initTranslations from '@/app/i18n/i18n'
import { InlineZervLogo } from '@/bookly/components/atoms/inline-zerv-logo'

function LandPage() {
  const [q, setQ] = useState('')
  const [loc, setLoc] = useState('')
  const [mounted, setMounted] = useState(false)
  const [t, setT] = useState<any>(() => (key: string) => key)
  const params = useParams<{ lang: string }>()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(params.lang || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [params.lang])
  const goSearch = () => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (loc) sp.set('loc', loc)
    router.push(`/${params?.lang}/search${sp.toString() ? `?${sp.toString()}` : ''}`)
  }
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 font-sans'>
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

          <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div
              className={`text-center space-y-4 sm:space-y-5 lg:space-y-6 ${mounted ? 'opacity-0 animate-[fadeInUp_0.7s_ease-out_forwards]' : 'opacity-0'}`}
            >
              <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-primary-800 dark:text-white leading-tight pb-2'>
                {t('landing.hero.titlePrefix')}
                <InlineZervLogo />
                {t('landing.hero.titleSuffix')}
              </h1>

              <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed'>
                {t('landing.hero.subtitle')}
              </p>
              {/* Search Bar */}
              <div
                className={`w-full max-w-4xl mx-auto mt-8 ${mounted ? 'opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]' : 'opacity-0'}`}
              >
                <div className='glass-card p-2 sm:p-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300'>
                  <div className='flex flex-col md:flex-row gap-2 sm:gap-3 p-1'>
                    <div className='flex-1'>
                      <SearchInput
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholderProps={{
                          localeKey: 'landing.search.servicePlaceholder'
                        }}
                        i18nTFn={t}
                        className='w-full h-12 sm:h-14 text-lg border-0 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl focus-glow font-mono'
                      />
                    </div>
                    <div className='flex-1'>
                      <SearchInput
                        value={loc}
                        onChange={e => setLoc(e.target.value)}
                        placeholderProps={{
                          localeKey: 'landing.search.locationPlaceholder'
                        }}
                        i18nTFn={t}
                        leadingIcon={MapPin}
                        className='w-full h-12 sm:h-14 text-lg border-0 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl focus-glow font-mono'
                      />
                    </div>
                    <Button
                      onClick={goSearch}
                      buttonText={{ localeKey: 'landing.search.button' }}
                      i18nTFn={t}
                      className='w-full md:w-auto btn-primary-enhanced btn-press px-8 sm:px-10 py-3 h-12 sm:h-14 text-lg font-semibold rounded-xl'
                    />
                  </div>
                </div>
              </div>

              {/* Trust indicators - Stretched with more spacing */}
              <div
                className={`flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12 pt-4 sm:pt-6 ${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards]' : 'opacity-0'}`}
              >
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300 stagger-1 animate-slide-up-fade'>
                  <div className='w-2.5 h-2.5 bg-sage-500 rounded-full animate-pulse-soft' />
                  <span className='text-sm sm:text-base font-medium font-mono'>{t('landing.stats.businesses')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300 stagger-2 animate-slide-up-fade'>
                  <div className='w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse-soft' />
                  <span className='text-sm sm:text-base font-medium font-mono'>{t('landing.stats.customers')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300 stagger-3 animate-slide-up-fade'>
                  <div className='w-2.5 h-2.5 bg-coral-500 rounded-full animate-pulse-soft' />
                  <span className='text-sm sm:text-base font-medium font-mono'>{t('landing.stats.rating')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className='relative bg-white dark:bg-gray-800'>
          <div className={`${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.5s_forwards]' : 'opacity-0'}`}>
            <ExploreSection />
          </div>
        </div>

        {/* Features Section */}
        <div className='relative bg-gray-50 dark:bg-gray-900'>
          <div className={`${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]' : 'opacity-0'}`}>
            <FeaturesSection />
          </div>
        </div>

        {/* App Download Section */}
        <div
          className={`relative bg-white dark:bg-gray-800 ${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.7s_forwards]' : 'opacity-0'}`}
        >
          <AppDownloadSection />
        </div>

        {/* Footer */}
        <div
          className={`relative bg-gray-900 ${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.8s_forwards]' : 'opacity-0'}`}
        >
          <FooterSection />
        </div>
      </main>
    </div>
  )
}

export default LandPage
