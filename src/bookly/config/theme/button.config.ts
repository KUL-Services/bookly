export const buttonConfig = {
  base: 'rounded-md transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
  variant: {
    text: 'bg-transparent text-teal-600 hover:bg-teal-50 focus:ring-teal-500',
    outlined: 'border border-teal-600 text-teal-600 hover:bg-teal-50 focus:ring-teal-500',
    contained: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm',
    containedRevers: 'bg-white-100 text-teal-700 hover:bg-teal-200 focus:ring-teal-700 shadow-sm'
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
