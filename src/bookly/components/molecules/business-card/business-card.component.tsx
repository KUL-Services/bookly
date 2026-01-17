import { BaseCard } from '@/bookly/components/atoms/base-card/base-card.component'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { Business } from '@/bookly/types/api.types'
import { cn } from '@/bookly/lib/utils'
import { KulIcon } from '@/bookly/components/atoms'
import { i18n } from 'i18next'

interface BusinessCardProps {
  business: Business
  className?: string
  onClick?: () => void
  i18nTFn?: i18n['t']
}

export const BusinessCard = ({ business, className, onClick, i18nTFn }: BusinessCardProps) => {
  const bookLabel = i18nTFn ? i18nTFn('business.book') : 'Book'

  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn(
          'overflow-hidden rounded-[24px] border border-[#0a2c24]/10 dark:border-white/10 bg-white/90 dark:bg-gray-800/90 shadow-sm hover:shadow-lg transition-all duration-300',
          className
        )}
        customImageComponent={
          <BusinessAvatar
            businessName={business.name}
            imageSrc={business.coverImage}
            imageAlt={business.name}
            className='w-full h-full rounded-t-[24px]'
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
            <div className='inline-flex items-center gap-2 text-primary-700 dark:text-primary-300 font-semibold text-sm'>
              <span>{bookLabel}</span>
              <KulIcon icon={'lucide:arrow-up-right'} iconClass='h-4 w-4' />
            </div>
          </>
        }
      />
    </div>
  )
}
