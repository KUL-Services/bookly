import { BaseImage } from '@/bookly/components/atoms'
import { H6, P } from '@/bookly/components/atoms'
import { Card, CardContent } from '@/bookly/components/ui/card'
import KulIcon from '@/bookly/components/atoms/kul-icon/kul-icon.component'
import { cn } from '@/bookly/lib/utils'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Building2 } from 'lucide-react'

interface BusinessCardProps {
  id: string
  name: string
  rating: number
  reviewCount: number
  address: string
  image: string
  isPromoted?: boolean
  className?: string
}

export function BusinessCard({
  id,
  name,
  rating,
  reviewCount,
  address,
  image,
  isPromoted,
  className
}: BusinessCardProps) {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(false)

  return (
    <Link href={`/en/business/${id}`} className='block h-full'>
      <Card
        className={cn(
          'h-full border-none shadow-[0_15px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(10,44,36,0.2)] transition-all duration-300 group overflow-hidden bg-white dark:bg-[#202c39] rounded-tl-[2rem] rounded-tr-[3.5rem] rounded-bl-[3.5rem] rounded-br-[2rem] relative z-0 isolate',
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
