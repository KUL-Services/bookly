import { AppColor } from '@/bookly/types'

/**
 *
 * @param colorString
 * @returns The `colorString` wrapped in a var() ready to be put into CSS;
 */
function getColorCSS(colorString?: AppColor) {
  if (!!colorString) return `var(--color-${colorString})`
  return undefined
}

export default getColorCSS
