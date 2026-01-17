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
          'group relative h-full overflow-hidden rounded-[26px] rounded-br-[12px] rounded-tl-[32px] border border-[#0a2c24]/10 dark:border-white/10 bg-white/90 dark:bg-gray-800/90 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer',
          'hover:border-primary-200/80 dark:hover:border-primary-700/60',
          className
        )}
        contentClassName='flex flex-col items-center justify-center p-5 sm:p-6 space-y-3 text-center h-full z-10 relative'
      >
        {/* Background Gradient on Hover - Using brand accent colors */}
        <div className='absolute inset-0 bg-gradient-to-br from-sage-100/60 via-teal-50/40 to-coral-50/30 dark:from-sage-900/20 dark:via-teal-900/10 dark:to-coral-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Icon with animated container */}
        <div className='relative p-3 rounded-[18px] bg-primary-50 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors duration-300 shadow-inner'>
          <i
            className={cn(
              category.icon,
              'text-2xl sm:text-3xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300'
            )}
          />
        </div>

        {/* Text */}
        <h3 className='text-gray-700 dark:text-gray-200 font-semibold text-sm sm:text-base group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300'>
          {category.name}
        </h3>
      </BaseCard>
    </div>
  )
}

// className={cn("hover:scale-105 transition-transform cursor-pointer", className)}
//         contentClassName="flex flex-col items-center justify-center p-6 space-y-2"
