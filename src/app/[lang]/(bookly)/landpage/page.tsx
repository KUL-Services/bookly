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
  const [q, setQ] = useState('')
  const [loc, setLoc] = useState('')
  const params = useParams<{ lang: string }>()
  const router = useRouter()
  const goSearch = () => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (loc) sp.set('loc', loc)
    router.push(`/${params?.lang}/search${sp.toString() ? `?${sp.toString()}` : ''}`)
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20'>
      {/* Shared BooklyNavbar is rendered in the (bookly) layout */}

      <main className='relative overflow-hidden'>
        {/* Animated background elements */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 rounded-full blur-3xl animate-pulse' />
          <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/30 to-teal-200/20 rounded-full blur-3xl animate-pulse animation-delay-1000' />
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-teal-100/20 to-cyan-100/10 rounded-full blur-3xl animate-spin animation-duration-20000' />
        </div>
        {/* Hero Section */}
        <section className='relative py-24 md:py-32'>
          <div
            className='absolute inset-0 bg-cover bg-center opacity-15'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop')"
            }}
          />

          {/* Floating elements */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute top-20 left-10 w-3 h-3 bg-teal-400 rounded-full animate-bounce animation-delay-1000' />
            <div className='absolute top-40 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-2000' />
            <div className='absolute bottom-32 left-20 w-4 h-4 bg-emerald-400 rounded-full animate-bounce animation-delay-3000' />
            <div className='absolute bottom-20 right-10 w-2 h-2 bg-teal-500 rounded-full animate-bounce animation-delay-4000' />
          </div>
          <div className='relative max-w-6xl mx-auto px-6'>
            <div className='text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
              <H1
                stringProps={{
                  plainText: 'Find and book beauty & wellness services'
                }}
                className='text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-gray-900 bg-clip-text text-transparent leading-tight'
              />

              <p className='text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
                Discover and book appointments with top-rated salons, spas, and wellness professionals in your area
              </p>
              {/* Search Bar */}
              <div className='max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 animation-delay-500'>
                <div className='p-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300'>
                  <div className='flex flex-col md:flex-row gap-3 p-4'>
                    <div className='flex-1'>
                      <SearchInput
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholderProps={{
                          plainText: 'e.g. haircut, facial, massage'
                        }}
                        i18nTFn={t}
                        className='w-full border-0 focus:ring-2 focus:ring-teal-500 rounded-lg bg-gray-50/50'
                      />
                    </div>
                    <div className='flex-1'>
                      <SearchInput
                        value={loc}
                        onChange={e => setLoc(e.target.value)}
                        placeholderProps={{
                          plainText: 'Location'
                        }}
                        i18nTFn={t}
                        leadingIcon={MapPin}
                        className='w-full border-0 focus:ring-2 focus:ring-teal-500 rounded-lg bg-gray-50/50'
                      />
                    </div>
                    <Button
                      onClick={goSearch}
                      buttonText={{ plainText: 'Search' }}
                      className='bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
                    />
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className='flex flex-wrap justify-center items-center gap-8 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 animation-delay-1000'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                  <span className='text-sm font-medium'>1000+ Verified Businesses</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-500' />
                  <span className='text-sm font-medium'>50,000+ Happy Customers</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-1000' />
                  <span className='text-sm font-medium'>4.9★ Average Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <div className='relative bg-gradient-to-b from-transparent via-white/80 to-white'>
          <div className='animate-in fade-in slide-in-from-bottom-8 duration-1000 animation-delay-1500'>
            <ExploreSection />
          </div>
        </div>

        {/* Features Section */}
        <div className='relative bg-gradient-to-b from-white to-gray-50/50'>
          <div className='animate-in fade-in slide-in-from-bottom-8 duration-1000 animation-delay-2000'>
            <FeaturesSection />
          </div>
        </div>

        {/* App Download Section */}
        <div className='relative bg-gradient-to-b from-gray-50/50 to-white animate-in fade-in slide-in-from-bottom-8 duration-1000 animation-delay-2500'>
          <AppDownloadSection />
        </div>

        {/* Footer */}
        <div className='relative bg-gradient-to-t from-gray-900 to-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-1000 animation-delay-3000'>
          <FooterSection />
        </div>
      </main>
    </div>
  )
}

export default LandPage
