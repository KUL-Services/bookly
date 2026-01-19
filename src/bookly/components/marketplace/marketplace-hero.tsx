'use client'

import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/bookly/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/bookly/lib/utils'

export function MarketplaceHero() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Harrow') // Default as per context usually
  const [date, setDate] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('loc', location)
    if (date) params.set('date', date)
    router.push(`/en/search?${params.toString()}`)
  }

  return (
    <div className='relative w-full'>
      {/* 
        DESKTOP LAYOUT (md+) 
        Hero Image + Overlay + Centered Search 
      */}
      <div className='hidden md:block relative h-[500px] w-full overflow-hidden'>
        {/* Hero Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2670&auto=format&fit=crop")',
            filter: 'brightness(0.7)'
          }}
        />

        {/* Overlay Content */}
        <div className='absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10'>
          <h1 className='text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-md'>
            Discover and book beauty & wellness <br /> professionals near you.
          </h1>
          <p className='text-lg text-white/90 mb-8 max-w-2xl drop-shadow-sm font-medium'>
            The easiest way to book your next appointment.
          </p>

          {/* Desktop Search Bar */}
          <div className='bg-white rounded-lg p-2 shadow-xl flex items-center w-full max-w-4xl'>
            {/* Service / Business Input */}
            <div className='flex-1 flex items-center px-4 border-r border-gray-200'>
              <Search className='w-5 h-5 text-gray-400 mr-3' />
              <input
                type='text'
                placeholder='Service, business, or treatment'
                className='w-full p-2 outline-none text-gray-800 placeholder:text-gray-400 font-medium'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Location Input */}
            <div className='flex-1 flex items-center px-4 border-r border-gray-200'>
              <MapPin className='w-5 h-5 text-gray-400 mr-3' />
              <input
                type='text'
                placeholder='City, zip, or neighborhood'
                className='w-full p-2 outline-none text-gray-800 placeholder:text-gray-400 font-medium'
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            {/* Date Input (Optional) */}
            <div className='flex-1 flex items-center px-4'>
              <Calendar className='w-5 h-5 text-gray-400 mr-3' />
              <input
                type='text'
                placeholder='Any time'
                className='w-full p-2 outline-none text-gray-800 placeholder:text-gray-400 font-medium'
                // Simple text for now, could be a DatePicker trigger
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            {/* Search Button */}
            <Button
              size='lg'
              className='bg-[#0a2c24] hover:bg-[#0a2c24]/90 text-white font-bold px-8 rounded-lg ml-2 h-12 shadow-lg'
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* 
        MOBILE LAYOUT (< md) 
        Dark Gradient Header + Simple Search
      */}
      <div className='md:hidden bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 pb-8'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Bookly</h1>
          <button className='text-sm font-medium text-white/80 hover:text-white'>List your business</button>
        </div>

        <h2 className='text-3xl font-bold mb-6 leading-tight'>
          Be confident using <br /> <span className='text-emerald-400'>Bookly</span>
        </h2>

        {/* Mobile Search Input */}
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-gray-400' />
          </div>
          <input
            type='text'
            className='block w-full pl-10 pr-3 py-4 border-none rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0a2c24] shadow-lg text-base'
            placeholder='Book your next appointment'
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>
    </div>
  )
}
