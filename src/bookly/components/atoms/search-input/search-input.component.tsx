import { LucideIcon, Search } from 'lucide-react'
import { BaseInput } from '../base-input/base-input.component'
import { i18n } from 'i18next'
import { StringProps } from '@/bookly/types'

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder' | 'error'> {
  errorProps?: StringProps
  placeholderProps?: StringProps
  i18nTFn?: i18n['t']
  label?: string
  leadingIcon?: LucideIcon
}

export const SearchInput = ({ className, placeholderProps, leadingIcon, i18nTFn, ...props }: SearchInputProps) => {
  const defaultPlaceholder = i18nTFn ? { localeKey: 'search.placeholder' } : { plainText: 'Search...' }

  return (
    <BaseInput
      LeadingIcon={leadingIcon || Search}
      type='search'
      placeholderProps={placeholderProps || defaultPlaceholder}
      i18nTFn={i18nTFn}
      className={`${className} transition-all duration-300 focus:ring-2 focus:ring-sage-400/20`}
      {...props}
    />
  )
}
