import React from 'react'
import { ButtonProps } from './button.props'
import { H5, KulIcon, Pressable } from '@/bookly/components/atoms'
import { cn } from '@/bookly/lib/utils'
import { buttonConfig } from '@/bookly/config/theme/button.config'

const Button = ({
  buttonText,
  prefixIcon,
  suffixIcon,
  variant = 'contained',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className,
  ...restProps
}: ButtonProps) => {
  return (
    <Pressable
      className={cn(
        buttonConfig.base,
        buttonConfig.variant[variant],
        buttonConfig.size[size],
        disabled && buttonConfig.state.disabled,
        fullWidth && buttonConfig.state.fullWidth,
        className
      )}
      disabled={disabled}
      {...restProps}
    >
      <div className='inline-flex items-center justify-center gap-2'>
        {prefixIcon && <KulIcon {...prefixIcon} className={cn('h-4 w-4', prefixIcon.className)} />}
        {buttonText && (
          <span className='relative top-[0.5px]'>
            <H5 stringProps={buttonText} className='font-medium' />
          </span>
        )}
        {suffixIcon && <KulIcon {...suffixIcon} className={cn('h-4 w-4', suffixIcon.className)} />}
      </div>
    </Pressable>
  )
}

export default Button
