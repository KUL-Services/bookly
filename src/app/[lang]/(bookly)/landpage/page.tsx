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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900'>
      {/* Shared BooklyNavbar is rendered in the (bookly) layout */}

      <main className='relative overflow-hidden'>
        {/* Animated background elements */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 dark:from-primary-800/20 dark:to-cyan-600/10 rounded-full blur-3xl animate-pulse' />
          <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/30 to-teal-200/20 dark:from-emerald-600/20 dark:to-sage-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000' />
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-200/20 to-sage-200/10 dark:from-primary-800/10 dark:to-sage-800/5 rounded-full blur-3xl animate-spin animation-duration-20000' />
        </div>
        {/* Hero Section */}
        <section className='relative py-12 sm:py-16 md:py-24 lg:py-32'>
          <div
            className='absolute inset-0 bg-cover bg-center opacity-15'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop')"
            }}
          />

          {/* Floating elements */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute top-20 left-10 w-3 h-3 bg-teal-400 dark:bg-primary-700 rounded-full animate-bounce animation-delay-1000' />
            <div className='absolute top-40 right-20 w-2 h-2 bg-cyan-400 dark:bg-cyan-500 rounded-full animate-bounce animation-delay-2000' />
            <div className='absolute bottom-32 left-20 w-4 h-4 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce animation-delay-3000' />
            <div className='absolute bottom-20 right-10 w-2 h-2 bg-primary-700 dark:bg-sage-400 rounded-full animate-bounce animation-delay-4000' />
          </div>
          <div className='relative max-w-6xl mx-auto px-4 sm:px-6'>
            <div
              className={`text-center space-y-4 sm:space-y-6 lg:space-y-8 ${mounted ? 'opacity-0 animate-[fadeInUp_1s_ease-out_forwards]' : 'opacity-0'}`}
            >
              <H1
                stringProps={{
                  localeKey: 'landing.hero.title'
                }}
                i18nTFn={t}
                className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-gray-900 dark:from-white dark:via-teal-300 dark:to-white bg-clip-text text-transparent leading-tight px-4 sm:px-0'
              />

              <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0'>
                {t('landing.hero.subtitle')}
              </p>
              {/* Search Bar */}
              <div
                className={`max-w-4xl mx-auto px-4 sm:px-0 ${mounted ? 'opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]' : 'opacity-0'}`}
              >
                <div className='p-2 sm:p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300'>
                  <div className='flex flex-col md:flex-row gap-2 sm:gap-3 p-2 sm:p-4'>
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
                      className='w-full md:w-auto bg-gradient-to-r from-primary-800 to-cyan-600 hover:from-primary-700 hover:to-cyan-700 px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 text-base sm:text-lg text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
                    />
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div
                className={`flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 lg:pt-8 px-4 ${mounted ? 'opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]' : 'opacity-0'}`}
              >
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                  <span className='text-xs sm:text-sm font-medium'>{t('landing.stats.businesses')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-500' />
                  <span className='text-xs sm:text-sm font-medium'>{t('landing.stats.customers')}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-1000' />
                  <span className='text-xs sm:text-sm font-medium'>{t('landing.stats.rating')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className='relative bg-gradient-to-b from-transparent via-white/80 to-white dark:via-gray-800/80 dark:to-gray-800'>
          <div className={`${mounted ? 'opacity-0 animate-[fadeInUp_0.8s_ease-out_0.9s_forwards]' : 'opacity-0'}`}>
            <ExploreSection />
          </div>
        </div>

        {/* Features Section */}
        <div className='relative bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50'>
          <div className={`${mounted ? 'opacity-0 animate-[fadeInUp_0.8s_ease-out_1.2s_forwards]' : 'opacity-0'}`}>
            <FeaturesSection />
          </div>
        </div>

        {/* App Download Section */}
        <div
          className={`relative bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800 ${mounted ? 'opacity-0 animate-[fadeInUp_0.8s_ease-out_1.5s_forwards]' : 'opacity-0'}`}
        >
          <AppDownloadSection />
        </div>

        {/* Footer */}
        <div
          className={`relative bg-gradient-to-t from-gray-900 to-gray-800 ${mounted ? 'opacity-0 animate-[fadeInUp_0.8s_ease-out_1.8s_forwards]' : 'opacity-0'}`}
        >
          <FooterSection />
        </div>
      </main>
    </div>
  )
}

export default LandPage
