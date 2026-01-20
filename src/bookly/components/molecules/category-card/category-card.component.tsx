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
  default: 'bg-white dark:bg-[#202c39] hover:bg-[#0a2c24] dark:hover:bg-[#77b6a3]', // Default -> Dark Green
  sage: 'bg-sage-100 dark:bg-sage-900/20 hover:bg-[#77b6a3] dark:hover:bg-[#77b6a3]', // Sage -> Sage Solid
  coral: 'bg-coral-100 dark:bg-coral-900/20 hover:bg-[#e88682] dark:hover:bg-[#e88682]', // Coral -> Coral Solid
  teal: 'bg-teal-100 dark:bg-teal-900/20 hover:bg-[#51b4b7] dark:hover:bg-[#51b4b7]' // Teal -> Teal Solid
}

const iconContainerStyles: Record<CategoryCardVariant, string> = {
  default: 'bg-[#f7f8f9] dark:bg-black/20 group-hover:bg-white/10 dark:group-hover:bg-[#0a2c24]/20',
  sage: 'bg-white/60 dark:bg-sage-500/20 group-hover:bg-white/20',
  coral: 'bg-white/60 dark:bg-coral-500/20 group-hover:bg-white/20',
  teal: 'bg-white/60 dark:bg-teal-500/20 group-hover:bg-white/20'
}

export const CategoryCard = ({ category, onClick, className, variant = 'default' }: CategoryCardProps) => {
  return (
    <div onClick={onClick} role='button' tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick?.()}>
      <BaseCard
        className={cn(
          'group relative h-full overflow-hidden rounded-tl-[2rem] rounded-tr-[3.5rem] rounded-bl-[3.5rem] rounded-br-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-transparent',
          variantStyles[variant],
          className
        )}
        contentClassName='flex flex-col items-center justify-center p-8 space-y-6 text-center h-full z-10 relative'
      >
        {/* Decorative Z-Shape Background Element - Enhanced Visibility */}
        {/* Decorative Z-Logo Background Element */}
        <div className='absolute -top-6 -right-6 w-48 h-48 opacity-[0.05] group-hover:opacity-[0.12] transition-all duration-700 ease-out transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:rotate-[-5deg] pointer-events-none'>
          <img
            src='/brand/zerv-z.svg'
            alt=''
            className='w-full h-full object-contain filter brightness-0 dark:invert'
          />
        </div>

        {/* Icon with animated container */}
        <div
          className={cn(
            'relative p-5 rounded-[2rem] transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:scale-110',
            iconContainerStyles[variant]
          )}
        >
          <i
            className={cn(
              category.icon,
              'text-3xl sm:text-4xl text-[#0a2c24] dark:text-white group-hover:text-white transition-colors duration-300'
            )}
          />
        </div>

        {/* Text */}
        <h3 className='text-[#0a2c24] dark:text-gray-100 font-bold text-base sm:text-lg group-hover:text-white transition-colors duration-300 tracking-tight'>
          {category.name}
        </h3>
      </BaseCard>
    </div>
  )
}

// className={cn("hover:scale-105 transition-transform cursor-pointer", className)}
//         contentClassName="flex flex-col items-center justify-center p-6 space-y-2"
