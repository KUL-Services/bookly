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
      className='block group bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all'
    >
      <div className='relative h-48 md:h-56 w-full overflow-hidden bg-gray-100'>
        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            image ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600' preserveAspectRatio='none'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath fill='%239ca3af' d='M400 250a50 50 0 1 1 0-100 50 50 0 0 1 0 100zm-100 150h200l-50-60-50 40-30-20z'/%3E%3C/svg%3E"
          }
          alt={name}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          onError={e => {
            const target = e.target as HTMLImageElement
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600' preserveAspectRatio='none'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath fill='%239ca3af' d='M400 250a50 50 0 1 1 0-100 50 50 0 0 1 0 100zm-100 150h200l-50-60-50 40-30-20z'/%3E%3C/svg%3E"
          }}
        />

        {/* Favourite Icon Overlay */}
        <button className='absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors'>
          <Heart className='w-4 h-4' />
        </button>

        {/* Promoted Badge */}
        {isPromoted && (
          <div className='absolute top-3 left-3 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide'>
            Promoted
          </div>
        )}
      </div>

      <div className='p-4'>
        <div className='flex justify-between items-start mb-1'>
          <h3 className='text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors'>
            {name}
          </h3>
          <div className='flex items-center bg-[#0a2c24]/5 px-2 py-1 rounded-md'>
            <span className='font-bold text-[#0a2c24] mr-1'>{rating}</span>
            <Star className='w-3 h-3 text-yellow-500 fill-yellow-500' />
          </div>
        </div>

        <div className='flex items-center gap-1 mb-3'>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn('w-3 h-3', i < Math.floor(rating) ? 'fill-teal-500 text-teal-500' : 'text-gray-300')}
              />
            ))}
          </div>
          <span className='text-xs text-gray-500'>({reviewCount} reviews)</span>
        </div>

        <div className='flex items-center text-sm text-gray-500'>
          <MapPin className='w-4 h-4 mr-1 shrink-0' />
          <span className='line-clamp-1'>{address}</span>
        </div>
      </div>
    </Link>
  )
}
