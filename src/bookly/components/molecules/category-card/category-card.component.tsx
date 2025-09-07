import { BaseCard } from '@/bookly/components/atoms/base-card/base-card.component'
import { Category } from '@/bookly/types/api.types'
import { cn } from '@/bookly/lib/utils'
import { ClassValue } from 'clsx'

interface CategoryCardProps {
  category: Category
  className?: ClassValue
  onClick?: () => void
}

export const CategoryCard = ({ category, onClick, className }: CategoryCardProps) => {
  return (
    <div onClick={onClick}>
      <BaseCard
        className={cn('rounded-2xl hover:scale-105 transition-transform cursor-pointer', className)}
        contentClassName='flex flex-col items-center justify-center p-6 space-y-2'
      >
        <span className='text-2xl'>{category.icon}</span>
        <h3 className='text-gray-700 font-medium'>{category.name}</h3>
      </BaseCard>
    </div>
  )
}

// className={cn("hover:scale-105 transition-transform cursor-pointer", className)}
//         contentClassName="flex flex-col items-center justify-center p-6 space-y-2"
