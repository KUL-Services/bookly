import PressableProps from '@/bookly/components/atoms/pressable/pressable.props'
import { StringProps } from '@/bookly/types'
import { KulIconProps } from '@/bookly/components/atoms/kul-icon/kul-icon.props'

export type ButtonVariant = 'text' | 'outlined' | 'contained' | 'containedRevers'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  buttonText?: StringProps
  prefixIcon?: KulIconProps
  suffixIcon?: KulIconProps
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
}
