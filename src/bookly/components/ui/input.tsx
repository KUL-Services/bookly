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
        'file:text-foreground placeholder:text-muted-foreground dark:placeholder:text-gray-400 selection:bg-primary selection:text-primary-foreground dark:bg-gray-700/50 dark:text-white border-input flex h-11 w-full min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/10 px-4 py-2 text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        `focus-visible:border-[${focusColor}] focus-visible:ring-[${focusColor}]/30 focus-visible:ring-[3px]`,
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Input }
