'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import { BusinessCard } from '@/bookly/components/molecules/business-card/business-card.component'
import { categories as categoryList, mockBusinesses, mockServices } from '@/bookly/data/mock-data'

type SortKey = 'recommended' | 'rating_desc' | 'price_asc' | 'price_desc'

const getCategoryIdBySlug = (slug?: string | null) => {
  if (!slug) return undefined
  return categoryList.find(c => c.slug === slug)?.id
}

const businessMinPrice = (businessId: string) => {
  const prices = mockServices.filter(s => s.businessId === businessId).map(s => s.price)
  return prices.length ? Math.min(...prices) : undefined
}

const parseTime = (t: string) => {
  // t like '9:00 AM'
  const [time, mer] = t.trim().split(' ')
  const [h, m] = time.split(':').map(Number)
  const hour = (mer?.toLowerCase().startsWith('p') && h !== 12 ? h + 12 : h === 12 && mer?.toLowerCase().startsWith('a') ? 0 : h) || 0
  return hour * 60 + (m || 0)
}

const overlaps = (open: number, close: number, from: number, to: number) => Math.max(open, from) < Math.min(close, to)

const openTodayOverlaps = (rangeLabel: 'morning' | 'afternoon' | 'evening', hours?: string) => {
  if (!hours) return true
  const [openStr, closeStr] = hours.split('-').map(s => s.trim())
  if (!openStr || !closeStr) return true
  const open = parseTime(openStr)
  const close = parseTime(closeStr)
  const windows: Record<typeof rangeLabel, [number, number]> = {
    morning: [8 * 60, 12 * 60],
    afternoon: [12 * 60, 17 * 60],
    evening: [17 * 60, 21 * 60]
  }
  const [from, to] = windows[rangeLabel]
  return overlaps(open, close, from, to)
}

export default function SearchPage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const searchParams = useSearchParams()

  const [q, setQ] = useState<string>(searchParams.get('q') || '')
  const [loc, setLoc] = useState<string>(searchParams.get('loc') || '')
  const [priceMin, setPriceMin] = useState<number>(Number(searchParams.get('min') || 0))
  const [priceMax, setPriceMax] = useState<number>(Number(searchParams.get('max') || 9999))
  const [sort, setSort] = useState<SortKey>((searchParams.get('sort') as SortKey) || 'recommended')
  const [timeMorning, setTimeMorning] = useState<boolean>(searchParams.get('tm') === '1')
  const [timeAfternoon, setTimeAfternoon] = useState<boolean>(searchParams.get('ta') === '1')
  const [timeEvening, setTimeEvening] = useState<boolean>(searchParams.get('te') === '1')

  const categorySlug = searchParams.get('category')
  const categoryId = useMemo(() => getCategoryIdBySlug(categorySlug), [categorySlug])

  const applyToUrl = () => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (loc) sp.set('loc', loc)
    if (priceMin) sp.set('min', String(priceMin))
    if (priceMax !== 9999) sp.set('max', String(priceMax))
    if (categorySlug) sp.set('category', categorySlug)
    if (sort && sort !== 'recommended') sp.set('sort', sort)
    if (timeMorning) sp.set('tm', '1')
    if (timeAfternoon) sp.set('ta', '1')
    if (timeEvening) sp.set('te', '1')
    router.push(`/${params?.lang}/search?` + sp.toString())
  }

  const filtered = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
    const todayKey = dayNames[new Date().getDay()]
    let list = mockBusinesses.filter(b => {
      // Category filter
      if (categoryId && !b.categories.includes(categoryId)) return false

      // Query filter
      const hay = (b.name + ' ' + b.about).toLowerCase()
      const serviceHay = mockServices
        .filter(s => s.businessId === b.id)
        .map(s => s.name.toLowerCase())
        .join(' ')
      const matchesQ = q ? hay.includes(q.toLowerCase()) || serviceHay.includes(q.toLowerCase()) : true
      if (!matchesQ) return false

      // Location filter (simple city match)
      const matchesLoc = loc ? b.city.toLowerCase().includes(loc.toLowerCase()) : true
      if (!matchesLoc) return false

      // Price filter
      const minPrice = businessMinPrice(b.id)
      if (minPrice === undefined) return true
      if (minPrice < priceMin) return false
      if (minPrice > priceMax) return false

      // Time of day filter (overlap windows using today's hours)
      const hours = b.openingHours?.[todayKey]
      const passesMorning = timeMorning ? openTodayOverlaps('morning', hours) : true
      const passesAfternoon = timeAfternoon ? openTodayOverlaps('afternoon', hours) : true
      const passesEvening = timeEvening ? openTodayOverlaps('evening', hours) : true
      if (!(passesMorning && passesAfternoon && passesEvening)) return false

      return true
    })

    // Sorting
    const withPrice = list.map(b => ({ b, p: businessMinPrice(b.id) ?? 9999 }))
    switch (sort) {
      case 'rating_desc':
        withPrice.sort((a, b) => b.b.averageRating - a.b.averageRating)
        break
      case 'price_asc':
        withPrice.sort((a, b) => a.p - b.p)
        break
      case 'price_desc':
        withPrice.sort((a, b) => b.p - a.p)
        break
      default:
        withPrice.sort((a, b) => b.b.totalRatings - a.b.totalRatings)
    }
    return withPrice.map(x => x.b)
  }, [categoryId, q, loc, priceMin, priceMax, sort, timeMorning, timeAfternoon, timeEvening])

  return (
    <div className='min-h-screen w-full surface-muted'>
      {/* Top search bar */}
      <div className='bg-white border-b'>
        <div className='mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row gap-3'>
          <SearchInput
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholderProps={{ plainText: "What are you looking for? (e.g. haircut, nails)" }}
            className='flex-1'
          />
          <SearchInput
            value={loc}
            onChange={e => setLoc(e.target.value)}
            placeholderProps={{ plainText: 'Location' }}
            className='flex-1'
          />
          <Button onClick={applyToUrl} buttonText={{ plainText: 'Search' }} />
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6'>
        {/* Filters */}
        <aside className='surface-card border rounded-lg p-4 h-max'>
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-1'>Sort by</label>
            <select
              className='w-full border rounded-md px-2 py-2'
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
            >
              <option value='recommended'>Recommended</option>
              <option value='rating_desc'>Rating: High to Low</option>
              <option value='price_asc'>Price: Low to High</option>
              <option value='price_desc'>Price: High to Low</option>
            </select>
          </div>

          <div className='mb-4'>
            <div className='text-sm text-gray-700 mb-2'>Time of day</div>
            <label className='flex items-center gap-2 mb-1'>
              <input type='checkbox' checked={timeMorning} onChange={e => setTimeMorning(e.target.checked)} /> Morning
            </label>
            <label className='flex items-center gap-2 mb-1'>
              <input type='checkbox' checked={timeAfternoon} onChange={e => setTimeAfternoon(e.target.checked)} />
              Afternoon
            </label>
            <label className='flex items-center gap-2'>
              <input type='checkbox' checked={timeEvening} onChange={e => setTimeEvening(e.target.checked)} /> Evening
            </label>
          </div>

          <div className='mb-4'>
            <div className='text-sm text-gray-700 mb-2'>Price range</div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={priceMin}
                onChange={e => setPriceMin(Number(e.target.value || 0))}
                className='w-24 border rounded-md px-2 py-1'
                min={0}
              />
              <span>-</span>
              <input
                type='number'
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value || 0))}
                className='w-24 border rounded-md px-2 py-1'
                min={0}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <Button onClick={applyToUrl} variant='contained' buttonText={{ plainText: 'Apply' }} />
            <Button
              variant='outlined'
              buttonText={{ plainText: 'Reset' }}
              onClick={() => {
                setQ('')
                setLoc('')
                setPriceMin(0)
                setPriceMax(9999)
                setTimeMorning(false)
                setTimeAfternoon(false)
                setTimeEvening(false)
                setSort('recommended')
                router.push(`/${params?.lang}/search`)
              }}
            />
          </div>
        </aside>

        {/* Results */}
        <section className='space-y-4'>
          <div className='text-sm text-gray-600'>Showing {filtered.length} results</div>
          <div className='space-y-4'>
            {filtered.map(b => (
              <div key={b.id} className='surface-card border rounded-lg p-3'>
                <BusinessCard
                  business={b}
                  className='shadow-none border-none'
                  onClick={() => router.push(`/${params?.lang}/business/${encodeURIComponent(b.name.toLowerCase().replace(/\s+/g, '-'))}`)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
