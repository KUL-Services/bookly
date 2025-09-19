import { useState } from 'react'
import { cn } from '@/bookly/lib/utils'

interface BusinessAvatarProps {
  businessName: string
  imageSrc?: string
  imageAlt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-lg'
}

export const BusinessAvatar = ({
  businessName,
  imageSrc,
  imageAlt,
  className,
  size = 'md'
}: BusinessAvatarProps) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(!!imageSrc)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const generateColorFromName = (name: string) => {
    // Generate a consistent color based on the business name
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]

    return colors[Math.abs(hash) % colors.length]
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const shouldShowFallback = !imageSrc || imageError

  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-lg overflow-hidden',
      sizeClasses[size],
      className
    )}>
      {!shouldShowFallback && (
        <>
          {isLoading && (
            <div className={cn(
              'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
              sizeClasses[size]
            )}>
              <div className="w-1/3 h-1/3 bg-gray-300 rounded"></div>
            </div>
          )}
          <img
            src={imageSrc}
            alt={imageAlt || businessName}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </>
      )}

      {shouldShowFallback && (
        <div className={cn(
          'w-full h-full flex items-center justify-center text-white font-semibold',
          generateColorFromName(businessName)
        )}>
          {getInitials(businessName)}
        </div>
      )}
    </div>
  )
}