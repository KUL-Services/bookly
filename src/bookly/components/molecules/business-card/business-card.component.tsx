import { BaseCard } from '@/bookly/components/atoms/base-card/base-card.component'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { Business } from '@/bookly/types/api.types'
import { cn } from '@/bookly/lib/utils'
import Button from '../button/button.component'
import { KulIcon } from '@/bookly/components/atoms'
import { i18n } from 'i18next'

interface BusinessCardProps {
  business: Business
  className?: string
  onClick?: () => void
  i18nTFn?: i18n['t']
}

export const BusinessCard = ({ business, className, onClick, i18nTFn }: BusinessCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn('overflow-hidden', className)}
        customImageComponent={
          <BusinessAvatar
            businessName={business.name}
            imageSrc={business.coverImage}
            imageAlt={business.name}
            className='w-full h-full rounded-t-lg'
            size='xl'
          />
        }
        titleProps={{ plainText: business.name }}
        headerClassName='space-y-3'
        footerClassName='flex flex-col items-start gap-2'
        footerContent={
          <>
            <div className='flex justify-between w-full'>
              <div className='flex items-center space-x-2'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='text-yellow-400'>
                    ⭐
                  </span>
                ))}
                <span className='font-medium dark:text-white'>{business.averageRating}</span>
                <span className='text-gray-500 dark:text-gray-400'>({business.totalRatings})</span>
              </div>
            </div>
            <div className='flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-2'>
              <KulIcon icon={'lucide:map-pin'} />
              {business.city}
            </div>
            <Button
              buttonText={i18nTFn ? { i18nKey: 'business.book', i18nTFn } : { plainText: 'Book' }}
              variant='contained'
              className='w-full bg-teal-500 hover:bg-teal-600 text-white'
            />
          </>
        }
      />
    </div>
  )
}
