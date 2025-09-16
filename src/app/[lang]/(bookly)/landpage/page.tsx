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
    router.push(`/${params?.lang}/search` + (sp.toString() ? `?${sp.toString()}` : ''))
  }
  return (
    <div className='min-h-screen'>
      {/* Shared BooklyNavbar is rendered in the (bookly) layout */}

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
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholderProps={{
                  plainText: 'e.g. haircut, facial, massage'
                }}
                i18nTFn={t}
                className=''
              />
              <SearchInput
                value={loc}
                onChange={e => setLoc(e.target.value)}
                placeholderProps={{
                  plainText: 'Location'
                }}
                i18nTFn={t}
                leadingIcon={MapPin}
              />
              <Button onClick={goSearch} buttonText={{ plainText: 'Search' }} />
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

        {/* Footer */
        }
        <FooterSection />
      </main>
    </div>
  )
}

export default LandPage
