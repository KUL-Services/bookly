import Image from 'next/image'
import React from 'react'
import BaseImageProps from './base-image.props'
import { cn } from '@/bookly/lib/utils'

const BaseImage = ({
  src,
  loading = 'lazy',
  priority = false,
  width,
  height,
  alt,
  className,
  fill = !width || !height,
  style,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality,
  placeholder,
  onLoad,
  onError,
  ...restProps
}: BaseImageProps) => {
  return (
    <Image
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      fill={fill}
      className={cn('rounded overflow-clip object-cover', className)}
      style={style}
      sizes={sizes}
      quality={quality}
      loading={loading}
      priority={priority}
      placeholder={placeholder}
      onLoad={onLoad}
      onError={onError}
      {...restProps}
    />
  )
}

export default BaseImage
