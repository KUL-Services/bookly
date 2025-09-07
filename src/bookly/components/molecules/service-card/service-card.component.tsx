import { BaseCard } from '@/bookly/components/atoms/base-card/base-card.component'
import { Service } from '@/bookly/types/api.types'
import { cn } from '@/bookly/lib/utils'

interface ServiceCardProps {
  service: Service
  className?: string
  onClick?: () => void
}

export const ServiceCard = ({ service, className, onClick }: ServiceCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn('hover:shadow-md transition-shadow', className)}
        titleProps={{ plainText: service.name }}
        descriptionProps={{ plainText: service.description }}
        contentClassName='p-4'
        footerClassName='flex items-center justify-between p-4 border-t'
        footerContent={
          <div className='flex justify-between w-full'>
            <div className='flex items-center space-x-2'>
              <span className='font-medium'>${service.price}</span>
            </div>
            <div className='text-gray-500'>{service.duration} min</div>
          </div>
        }
      />
    </div>
  )
}
