'use client'
import { H1 } from '@/bookly/components/atoms'
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900'>
      {/* Shared BooklyNavbar is rendered in the (bookly) layout */}

      <main className='relative overflow-hidden'>
        {/* Background elements - static to prevent flickering */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/15 to-cyan-200/8 dark:from-primary-800/10 dark:to-cyan-600/5 rounded-full blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/15 to-teal-200/8 dark:from-emerald-600/10 dark:to-sage-600/5 rounded-full blur-3xl' />
        </div>
        {/* Hero Section - Full width with generous padding */}
        <section className='relative py-12 sm:py-16 md:py-20 lg:py-28'>
          <div
            className='absolute inset-0 bg-cover bg-center opacity-15'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop')"
            }}
          />

          {/* Subtle decorative elements */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute top-16 left-8 w-2 h-2 bg-teal-400/60 dark:bg-primary-700/60 rounded-full' />
            <div className='absolute top-32 right-16 w-1.5 h-1.5 bg-cyan-400/60 dark:bg-cyan-500/60 rounded-full' />
            <div className='absolute bottom-24 left-16 w-2.5 h-2.5 bg-emerald-400/60 dark:bg-emerald-500/60 rounded-full' />
            <div className='absolute bottom-16 right-8 w-1.5 h-1.5 bg-primary-700/60 dark:bg-sage-400/60 rounded-full' />
          </div>
          <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div
              className={`text-center space-y-4 sm:space-y-5 lg:space-y-6 ${mounted ? 'opacity-0 animate-[fadeInUp_0.7s_ease-out_forwards]' : 'opacity-0'}`}
            >
              <H1
                stringProps={{
                  localeKey: 'landing.hero.title'
                }}
                i18nTFn={t}
                className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-gray-900 dark:from-white dark:via-teal-300 dark:to-white bg-clip-text text-transparent leading-tight'
              />

              <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed'>
                {t('landing.hero.subtitle')}
              </p>
              {/* Search Bar - Stretched to fill more width */}
              <div
                className={`w-full max-w-5xl mx-auto ${mounted ? 'opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]' : 'opacity-0'}`}
              >
                <div className='p-2 sm:p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50'>
                  <div className='flex flex-col md:flex-row gap-2 sm:gap-3 p-2 sm:p-3'>
                    <div className='flex-1'>
                      <SearchInput
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholderProps={{
                          localeKey: 'landing.search.servicePlaceholder'
                        }}
                        i18nTFn={t}
                        className='w-full h-12 sm:h-14 text-base border-0 focus:ring-2 focus:ring-primary-500 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 dark:text-white'
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
                        className='w-full h-12 sm:h-14 text-base border-0 focus:ring-2 focus:ring-primary-500 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 dark:text-white'
                      />
                    </div>
                    <Button
                      onClick={goSearch}
                      buttonText={{ localeKey: 'landing.search.button' }}
                      i18nTFn={t}
                      className='w-full md:w-auto bg-gradient-to-r from-primary-800 to-cyan-600 hover:from-primary-700 hover:to-cyan-700 px-8 sm:px-10 py-3 h-12 sm:h-14 text-base sm:text-lg text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200'
                    />
                  </div>
                </div>
              </div>

              {/* Trust indicators - Stretched with more spacing */}
              <div
                className={`flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12 pt-4 sm:pt-6 ${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards]' : 'opacity-0'}`}
              >
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <div className='w-2 h-2 bg-green-500 rounded-full' />
                  <span className='text-sm sm:text-base font-medium'>{t('landing.stats.businesses')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full' />
                  <span className='text-sm sm:text-base font-medium'>{t('landing.stats.customers')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full' />
                  <span className='text-sm sm:text-base font-medium'>{t('landing.stats.rating')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className='relative bg-gradient-to-b from-transparent via-white/90 to-white dark:via-gray-800/90 dark:to-gray-800'>
          <div className={`${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.5s_forwards]' : 'opacity-0'}`}>
            <ExploreSection />
          </div>
        </div>

        {/* Features Section */}
        <div className='relative bg-gradient-to-b from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-900/30'>
          <div className={`${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]' : 'opacity-0'}`}>
            <FeaturesSection />
          </div>
        </div>

        {/* App Download Section */}
        <div
          className={`relative bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-gray-800 ${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.7s_forwards]' : 'opacity-0'}`}
        >
          <AppDownloadSection />
        </div>

        {/* Footer */}
        <div
          className={`relative bg-gradient-to-t from-gray-900 to-gray-800 ${mounted ? 'opacity-0 animate-[fadeInUp_0.5s_ease-out_0.8s_forwards]' : 'opacity-0'}`}
        >
          <FooterSection />
        </div>
      </main>
    </div>
  )
}

export default LandPage
