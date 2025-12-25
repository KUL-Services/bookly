import * as React from 'react'

import { cn } from '@/bookly/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  focusColor?: string
}

function Input({ className, type, focusColor = 'var(--mui-palette-primary-main)', ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground dark:placeholder:text-gray-400 selection:bg-primary selection:text-primary-foreground dark:bg-gray-700/50 dark:text-white border-input flex h-9 w-full min-w-0 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-6 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        `focus-visible:border-[${focusColor}] focus-visible:ring-[${focusColor}]/30 focus-visible:ring-[3px]`,
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Input }
