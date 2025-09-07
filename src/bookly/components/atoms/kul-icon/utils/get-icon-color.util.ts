import { AppColor } from '@/bookly/types'
import { getColorCSS } from '@/bookly/utils'

const getIconColor = (iconColor?: AppColor) => {
  // if (!!iconColor) return  {color: getColorCSS(iconColor)};
  if (!!iconColor) return `text-${iconColor}`
  return undefined
}

export default getIconColor

// style="color:var(--color-secondary-400)"
