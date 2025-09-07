import { FontSize } from '@/bookly/constants/enums'
import { AppColor } from '@/bookly/types'
import { IconifyIconProperties } from '@iconify-icon/react/dist/iconify.mjs'

interface IconifyIconProps extends React.HTMLProps<HTMLElement>, IconifyIconProperties {
  rotate?: string | number
}

export type KulIconProps = Omit<IconifyIconProps, 'color'> & {
  wrapperClass?: string[] | string | undefined
  iconClass?: string[] | string | undefined
  iconColor?: AppColor
  fontSize?: FontSize
  testId?: string // used for debugging purposes.
}
