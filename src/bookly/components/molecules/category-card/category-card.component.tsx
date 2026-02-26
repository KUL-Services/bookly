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
  /** Use circular mobile-optimized layout */
  mobile?: boolean
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

// Circular mobile variant gradient backgrounds
const mobileGradients: Record<string, string> = {
  beauty: 'from-pink-400/80 to-rose-500/80',
  fitness: 'from-orange-400/80 to-amber-500/80',
  education: 'from-cyan-400/80 to-teal-500/80',
  services: 'from-emerald-400/80 to-green-500/80',
  home: 'from-purple-400/80 to-violet-500/80',
  auto: 'from-blue-400/80 to-indigo-500/80',
  dental: 'from-teal-400/80 to-cyan-500/80',
  legal: 'from-amber-400/80 to-yellow-600/80',
  default: 'from-[#0a2c24]/80 to-[#77b6a3]/80'
}

export const CategoryCard = ({
  category,
  onClick,
  className,
  variant = 'default',
  mobile = false
}: CategoryCardProps) => {
  // Map slugs to specific background/text colors based on the design requirement
  const getCardStyle = (slug: string) => {
    switch (slug) {
      case 'education':
        return 'bg-[#e0f7fa] text-[#006064] hover:bg-[#b2ebf2]' // Light Cyan
      case 'services':
        return 'bg-[#66bb6a] text-white hover:bg-[#43a047]' // Green
      case 'beauty':
        return 'bg-[#f8bbd0] text-[#880e4f] hover:bg-[#f48fb1]' // Pink
      case 'fitness':
        return 'bg-[#ffcc80] text-[#e65100] hover:bg-[#ffb74d]' // Orange
      case 'home':
        return 'bg-[#d1c4e9] text-[#4a148c] hover:bg-[#b39ddb]' // Purple
      case 'auto':
        return 'bg-[#90caf9] text-[#0d47a1] hover:bg-[#64b5f6]' // Blue
      case 'dental':
        return 'bg-[#80cbc4] text-[#004d40] hover:bg-[#4db6ac]' // Teal
      case 'legal':
        return 'bg-[#bcaaa4] text-[#3e2723] hover:bg-[#a1887f]' // Brown
      default:
        // Default blended glass style if no specific color
        return 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
    }
  }

  const getMobileGradient = (slug: string) => mobileGradients[slug] || mobileGradients.default

  // Mobile circular variant - for grid layout on mobile
  if (mobile) {
    return (
      <div
        onClick={onClick}
        role='button'
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onClick?.()}
        className={cn(
          'group relative w-[108px] rounded-[24px] px-3 py-3.5 cursor-pointer touch-manipulation',
          'bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.24)]',
          'transition-all duration-300 hover:bg-white/[0.14] hover:-translate-y-0.5 active:scale-[0.97]',
          className
        )}
      >
        <div className='pointer-events-none absolute inset-x-2 bottom-2 h-8 rounded-2xl bg-gradient-to-t from-black/25 to-transparent opacity-60' />

        {/* Icon Container */}
        <div
          className={cn(
            'relative mx-auto w-12 h-12 rounded-2xl flex items-center justify-center',
            'bg-gradient-to-br border border-white/25 shadow-[0_6px_18px_rgba(0,0,0,0.28)]',
            'transition-all duration-300 group-hover:scale-110',
            getMobileGradient(category.slug)
          )}
        >
          <i className={cn(category.icon, 'text-[22px] text-white drop-shadow-sm')} />
        </div>

        {/* Label */}
        <span className='relative mt-2.5 block min-h-8 text-[12px] font-semibold text-white text-center leading-tight line-clamp-2 tracking-[0.01em]'>
          {category.name}
        </span>
      </div>
    )
  }

  // Desktop rectangular variant (original)
  return (
    <div
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      className={cn(
        'group relative flex flex-col items-center justify-center p-6 h-48 w-full transition-all duration-300',
        'rounded-[2.5rem] hover:-translate-y-1 cursor-pointer',
        getCardStyle(category.slug),
        className
      )}
    >
      <div className='mb-4 p-4 rounded-full bg-white/20 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-300'>
        <i className={cn(category.icon, 'text-3xl')} />
      </div>

      <span className='text-lg font-bold text-center leading-tight tracking-tight'>{category.name}</span>
    </div>
  )
}
