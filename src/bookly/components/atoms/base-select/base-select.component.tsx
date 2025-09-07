import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/bookly/components/ui/select'
import { Label, P } from '../base-text/base-text.component'
import { StringProps } from '@/bookly/types'
import { cn } from '@/bookly/lib/utils'
import { i18n } from 'i18next'

export interface SelectOption {
  value: string
  labelProps: StringProps
}

interface BaseSelectProps {
  options: SelectOption[]
  label?: string
  placeholder?: StringProps
  error?: StringProps
  i18nTFn?: i18n['t']
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export const BaseSelect = ({
  options,
  label,
  placeholder,
  error,
  i18nTFn,
  value,
  onValueChange,
  className
}: BaseSelectProps) => {
  const translatedPlaceholder = placeholder
    ? 'plainText' in placeholder
      ? placeholder.plainText
      : i18nTFn?.(placeholder.localeKey!, placeholder.localeProps)
    : undefined

  return (
    <div className='w-full space-y-2'>
      {label && <Label stringProps={{ plainText: label }} />}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn('w-full bg-background', error && 'border-red-500', className)}>
          <SelectValue placeholder={translatedPlaceholder} />
        </SelectTrigger>
        <SelectContent
          className='bg-white dark:bg-zinc-950 border rounded-md shadow-md overflow-hidden min-w-[8rem]'
          position='popper'
        >
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              className='bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-default'
            >
              {'plainText' in option.labelProps
                ? option.labelProps.plainText
                : i18nTFn?.(option.labelProps.localeKey!, option.labelProps.localeProps)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <P stringProps={error} i18nTFn={i18nTFn} className='text-red-500 text-sm' />}
    </div>
  )
}
