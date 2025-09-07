import { BaseCard } from '@/bookly/components/atoms/base-card/base-card.component'
import { StaffMember } from '@/bookly/types/api.types'
import { cn } from '@/bookly/lib/utils'
import { getInitials } from '@/bookly/utils'

interface StaffCardProps {
  staff: StaffMember
  className?: string
  onClick?: () => void
}

export const StaffCard = ({ staff, className, onClick }: StaffCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn('hover:shadow-md transition-shadow', className)}
        imageSrc={staff.photo || undefined}
        imageAlt={staff.name}
        titleProps={{ plainText: staff.name }}
        descriptionProps={{ plainText: staff.title }}
        contentClassName='p-4'
      >
        {!staff.photo && (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-2xl font-medium rounded-t-lg'>
            {getInitials(staff.name)}
          </div>
        )}
      </BaseCard>
    </div>
  )
}
