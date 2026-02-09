import { BaseImage } from '@/bookly/components/atoms'
import { H6, P } from '@/bookly/components/atoms'
import { Card, CardContent } from '@/bookly/components/ui/card'
import KulIcon from '@/bookly/components/atoms/kul-icon/kul-icon.component'
import { cn } from '@/bookly/lib/utils'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Building2, ChevronRight } from 'lucide-react'

interface BusinessCardProps {
  id: string
  name: string
  rating: number
  reviewCount: number
  address: string
  image: string
  isPromoted?: boolean
  className?: string
  /** Use compact horizontal layout for mobile */
  mobile?: boolean
}

export function BusinessCard({
  id,
  name,
  rating,
  reviewCount,
  address,
  image,
  isPromoted,
  className,
  mobile = false
}: BusinessCardProps) {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(false)

  // Mobile horizontal compact variant
  if (mobile) {
    return (
      <Link href={`/en/business/${id}`} className='block'>
        <div
          className={cn(
            'flex items-center gap-4 p-3 bg-white dark:bg-[#202c39] rounded-2xl',
            'border border-gray-100 dark:border-white/10 hover:border-[#0a2c24] dark:hover:border-[#77b6a3]',
            'shadow-sm hover:shadow-md transition-all duration-300 group touch-manipulation',
            isPromoted && 'ring-1 ring-[#0a2c24] dark:ring-[#77b6a3]',
            className
          )}
        >
          {/* Compact Image */}
          <div className='w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative'>
            {!imgError && image ? (
              <BaseImage
                src={image}
                alt={name}
                className='object-cover w-full h-full'
                unoptimized={true}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className='absolute inset-0 flex items-center justify-center bg-[#0a2c24]/5 dark:bg-[#77b6a3]/10'>
                <Building2 className='w-8 h-8 text-[#0a2c24]/20 dark:text-[#77b6a3]/20' />
              </div>
            )}
            {isPromoted && (
              <div className='absolute top-1 left-1 bg-[#0a2c24] px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase'>
                Ad
              </div>
            )}
          </div>

          {/* Details */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <h3 className='text-base font-bold text-[#0a2c24] dark:text-white line-clamp-1 group-hover:text-[#2a9d8f] dark:group-hover:text-[#77b6a3] transition-colors'>
                {name}
              </h3>
              <div className='flex items-center gap-1 flex-shrink-0'>
                <KulIcon icon='lucide:star' iconClass='w-3.5 h-3.5 text-yellow-500 fill-current' />
                <span className='text-sm font-bold text-[#0a2c24] dark:text-white'>{rating}</span>
              </div>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{reviewCount} reviews</p>
            <div className='flex items-center gap-1 mt-2 text-gray-500 dark:text-gray-400'>
              <KulIcon icon='lucide:map-pin' iconClass='w-3 h-3 text-[#2a9d8f] flex-shrink-0' />
              <span className='text-xs line-clamp-1'>{address}</span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className='w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#0a2c24] dark:group-hover:text-[#77b6a3] transition-colors flex-shrink-0' />
        </div>
      </Link>
    )
  }

  // Desktop vertical card (original)
  return (
    <Link href={`/en/business/${id}`} className='block h-full'>
      <Card
        className={cn(
          'h-full shadow-none hover:shadow-[0_30px_60px_rgba(10,44,36,0.2)] transition-all duration-300 group overflow-hidden bg-white dark:bg-[#202c39] border border-gray-200 dark:border-white/10 hover:border-[#0a2c24] dark:hover:border-[#77b6a3] rounded-tl-[2rem] rounded-tr-[3.5rem] rounded-bl-[3.5rem] rounded-br-[2rem] relative z-0 isolate',
          isPromoted && 'ring-2 ring-[#0a2c24] dark:ring-[#77b6a3]',
          className
        )}
      >
        <div className='relative h-48 w-full overflow-hidden rounded-tl-[2rem] rounded-tr-[3.5rem] bg-gray-100 dark:bg-gray-800'>
          {!imgError && image ? (
            <BaseImage
              src={image}
              alt={name}
              className='object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 transform-gpu'
              unoptimized={true}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center bg-[#0a2c24]/5 dark:bg-[#77b6a3]/10'>
              <Building2 className='w-12 h-12 text-[#0a2c24]/20 dark:text-[#77b6a3]/20' />
            </div>
          )}

          {isPromoted && (
            <div className='absolute top-4 right-4 bg-white/90 dark:bg-[#0a2c24]/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg z-10'>
              <P
                className='text-xs font-bold text-[#0a2c24] dark:text-[#77b6a3] uppercase tracking-wider'
                stringProps={{ plainText: 'Promoted' }}
              />
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
        </div>

        <CardContent className='p-6 space-y-4'>
          <div>
            <div className='flex justify-between items-start gap-2 mb-1'>
              <H6
                className='text-xl text-[#0a2c24] dark:text-white line-clamp-1 group-hover:text-[#2a9d8f] dark:group-hover:text-[#77b6a3] transition-colors'
                stringProps={{ plainText: name }}
              />
              <div className='flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg'>
                <KulIcon icon='lucide:star' iconClass='w-4 h-4 text-yellow-500 fill-current' />
                <span className='text-sm font-bold text-[#0a2c24] dark:text-white'>{rating}</span>
              </div>
            </div>
            <P
              className='text-sm text-gray-500 dark:text-gray-400'
              stringProps={{ plainText: `${reviewCount} reviews` }}
            />
          </div>

          <div className='flex items-start gap-2 text-gray-600 dark:text-gray-300'>
            <KulIcon icon='lucide:map-pin' iconClass='w-4 h-4 mt-1 text-[#2a9d8f] dark:text-[#77b6a3] flex-shrink-0' />
            <P className='text-sm line-clamp-2' stringProps={{ plainText: address }} />
          </div>

          <div className='pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/10'>
            <span className='text-xs font-medium text-[#2a9d8f] dark:text-[#77b6a3] group-hover:underline'>
              View details
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
