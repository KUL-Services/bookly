'use client'

import { Star, MapPin, Heart } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/bookly/lib/utils'

interface BusinessCardProps {
  id: string
  name: string
  rating: number
  reviewCount: number
  address: string
  image: string
  isPromoted?: boolean
}

export function BusinessCard({ id, name, rating, reviewCount, address, image, isPromoted }: BusinessCardProps) {
  return (
    <Link
      href={`/en/business/${id}`}
      className='block group bg-white dark:bg-[#202c39] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(10,44,36,0.15)] transition-all duration-500 relative transform hover:-translate-y-1 overflow-hidden'
    >
      {/* Z-Cut Inlay Mask - Subtle Luxury Feel */}
      <div
        className='pointer-events-none absolute right-[-40px] top-[-40px] h-[220px] w-[220px] opacity-[0.05] transition duration-500 group-hover:opacity-[0.1] z-20'
        style={{
          background: 'radial-gradient(circle at center, #0a2c24 0%, transparent 70%)'
        }}
      />

      {/* Glass sheen effect */}
      <div className='absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30' />

      <div className='relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-800'>
        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            image ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600' preserveAspectRatio='none'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath fill='%239ca3af' d='M400 250a50 50 0 1 1 0-100 50 50 0 0 1 0 100zm-100 150h200l-50-60-50 40-30-20z'/%3E%3C/svg%3E"
          }
          alt={name}
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform'
          onError={e => {
            const target = e.target as HTMLImageElement
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600' preserveAspectRatio='none'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath fill='%239ca3af' d='M400 250a50 50 0 1 1 0-100 50 50 0 0 1 0 100zm-100 150h200l-50-60-50 40-30-20z'/%3E%3C/svg%3E"
          }}
        />

        {/* Modern Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity duration-300' />

        {/* Favourite Icon - Minimalist Glass */}
        <button className='absolute top-3 right-3 p-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-red-500 transition-all shadow-lg'>
          <Heart className='w-4 h-4' />
        </button>

        {/* Promoted Badge - Premium Gradient */}
        {isPromoted && (
          <div className='absolute top-3 left-3 bg-gradient-to-r from-[#0a2c24] to-[#155b4a] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg'>
            Promoted
          </div>
        )}
      </div>

      <div className='p-6 relative z-10'>
        <div className='flex justify-between items-start mb-3'>
          <h3 className='font-bold text-xl text-gray-900 dark:text-white group-hover:text-[#0a2c24] dark:group-hover:text-[#77b6a3] transition-colors line-clamp-1'>
            {name}
          </h3>
          <div className='flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-lg'>
            <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
            <span className='font-bold text-sm text-gray-900 dark:text-white'>{rating}</span>
            <div className='hidden sm:flex items-center ml-1 space-x-0.5'>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-2 h-2',
                    i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className='text-xs text-gray-500 ml-1'>({reviewCount})</span>
          </div>
        </div>

        <p className='text-gray-500 dark:text-gray-400 text-sm mb-5 flex items-center gap-1.5'>
          <MapPin className='w-3.5 h-3.5 flex-shrink-0 opacity-70' />
          <span className='line-clamp-1'>{address}</span>
        </p>

        <div className='flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50'>
          <div className='text-xs font-medium text-gray-400 uppercase tracking-widest'>Next Available</div>
          <div className='text-[#0a2c24] dark:text-[#77b6a3] font-bold text-sm bg-[#0a2c24]/5 dark:bg-[#77b6a3]/10 px-3 py-1 rounded-full'>
            Today, 2:00 PM
          </div>
        </div>
      </div>
    </Link>
  )
}
