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
    <div onClick={onClick} role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick?.()}>
      <BaseCard
        className={cn(
          'group relative h-full overflow-hidden rounded-2xl border border-transparent bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1',
          'hover:border-primary-200 dark:hover:border-primary-700',
          className
        )}
        contentClassName='flex flex-col items-center justify-center p-6 space-y-4 text-center h-full z-10 relative'
      >
        {/* Background Gradient on Hover */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary-50/50 to-sage-50/50 dark:from-primary-900/10 dark:to-sage-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Icon with animated container */}
        <div className='relative p-3 rounded-xl bg-primary-50 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors duration-300 shadow-inner'>
          <i
            className={cn(
              category.icon,
              'text-3xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300'
            )}
          />
        </div>

        {/* Text */}
        <h3 className='text-gray-700 dark:text-gray-200 font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300'>
          {category.name}
        </h3>
      </BaseCard>
    </div>
  )
}

// className={cn("hover:scale-105 transition-transform cursor-pointer", className)}
//         contentClassName="flex flex-col items-center justify-center p-6 space-y-2"
