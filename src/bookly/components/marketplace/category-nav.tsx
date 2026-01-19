'use client'

import { Scissors, Sparkles, User, Palette, Heart, Dumbbell } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'hair', name: 'Hair', icon: Scissors },
  { id: 'barber', name: 'Barber', icon: User },
  { id: 'nails', name: 'Nails', icon: Palette },
  { id: 'skin', name: 'Skin Care', icon: Sparkles },
  { id: 'brows', name: 'Brows', icon: Heart }, // Eye icon approximation
  { id: 'massage', name: 'Massage', icon: Dumbbell }, // Wellness approximation
  { id: 'makeup', name: 'Makeup', icon: Palette },
  { id: 'spa', name: 'Spa', icon: Sparkles }
]

export function CategoryNav() {
  return (
    <div className='w-full bg-white border-b border-gray-100 py-4 shadow-sm sticky top-0 md:relative z-20'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Horizontal Scroll Container */}
        <div className='flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-2 md:pb-0'>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/en/search?category=${cat.id}`}
              className='flex flex-col items-center group min-w-[64px] shrink-0'
            >
              <div className='w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:border-teal-500 group-hover:bg-teal-50 transition-colors mb-2'>
                <cat.icon className='w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-teal-600 stroke-[1.5]' />
              </div>
              <span className='text-xs md:text-sm font-medium text-gray-600 group-hover:text-teal-700 whitespace-nowrap'>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
