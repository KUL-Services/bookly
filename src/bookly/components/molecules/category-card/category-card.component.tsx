import { BaseCard } from '@/bookly/components/atoms/base-card/base-card.component'
import { Category } from '@/bookly/types/api.types'
import { cn } from '@/bookly/lib/utils'
import { ClassValue } from 'clsx'

// Define color variants for Zerv branding
export type CategoryCardVariant = 'sage' | 'coral' | 'teal' | 'default'

interface CategoryCardProps {
  category: Category
  className?: ClassValue
  onClick?: () => void
  variant?: CategoryCardVariant
}

const variantStyles: Record<CategoryCardVariant, string> = {
  default: 'bg-white dark:bg-[#202c39]',
  sage: 'bg-sage-100 dark:bg-sage-900/20',
  coral: 'bg-coral-100 dark:bg-coral-900/20',
  teal: 'bg-teal-100 dark:bg-teal-900/20'
}

const iconContainerStyles: Record<CategoryCardVariant, string> = {
  default: 'bg-[#f7f8f9] dark:bg-black/20',
  sage: 'bg-white/60 dark:bg-sage-500/20',
  coral: 'bg-white/60 dark:bg-coral-500/20',
  teal: 'bg-white/60 dark:bg-teal-500/20'
}

export const CategoryCard = ({ category, onClick, className, variant = 'default' }: CategoryCardProps) => {
  return (
    <div onClick={onClick} role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick?.()}>
      <BaseCard
        className={cn(
          'group relative h-full overflow-hidden rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer',
          variantStyles[variant],
          className
        )}
        contentClassName='flex flex-col items-center justify-center p-6 space-y-4 text-center h-full z-10 relative'
      >
        {/* Background Gradient on Hover */}
        <div className='absolute inset-0 bg-gradient-to-br from-[#f0fdf4] via-transparent to-[#fdf2f8] dark:from-[#0a2c24]/20 dark:to-[#831843]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Icon with animated container */}
        <div
          className={cn(
            'relative p-4 rounded-2xl group-hover:bg-white dark:group-hover:bg-[#202c39] transition-colors duration-300 shadow-sm group-hover:shadow-md',
            iconContainerStyles[variant]
          )}
        >
          <i
            className={cn(
              category.icon,
              'text-2xl sm:text-3xl text-[#0a2c24] dark:text-white group-hover:scale-110 transition-transform duration-300'
            )}
          />
        </div>

        {/* Text */}
        <h3 className='text-[#0a2c24] dark:text-gray-100 font-bold text-sm sm:text-base'>{category.name}</h3>
      </BaseCard>
    </div>
  )
}

// className={cn("hover:scale-105 transition-transform cursor-pointer", className)}
//         contentClassName="flex flex-col items-center justify-center p-6 space-y-2"
