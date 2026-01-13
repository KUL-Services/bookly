// Brand colors: Dark Green #0a2c24 | Navy Blue #202c39 | Off-White #f7f8f9
// Using CSS variables for brand consistency
export const buttonConfig = {
  base: 'rounded-md transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
  variant: {
    text: 'bg-transparent text-primary-800 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30',
    outlined:
      'border border-primary-800 dark:border-primary-400 text-primary-800 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:ring-primary-500',
    contained:
      'bg-primary-800 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:ring-primary-500 shadow-sm',
    containedRevers: 'bg-white text-primary-700 hover:bg-gray-50 focus:ring-primary-700 shadow-sm'
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2.5 text-lg'
  },
  state: {
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    fullWidth: 'w-full'
  }
}
