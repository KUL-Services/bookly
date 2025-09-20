// Global console error suppression for Zod validation errors
let originalConsoleError: typeof console.error | null = null

export const suppressZodConsoleErrors = () => {
  if (originalConsoleError) return // Already suppressed

  originalConsoleError = console.error
  console.error = (...args: any[]) => {
    // Check if any argument contains Zod error patterns
    const hasZodError = args.some(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          const str = JSON.stringify(arg)
          return (
            str.includes('ZodError') ||
            str.includes('"code":"too_small"') ||
            str.includes('"code":"invalid_string"') ||
            str.includes('"code":"invalid_format"') ||
            str.includes('"code":"custom"') ||
            str.includes('"origin":"string"') ||
            str.includes('"format":"email"') ||
            str.includes('"minimum":') ||
            str.includes('"maximum":') ||
            str.includes('"path":') ||
            arg.name === 'ZodError' ||
            (arg.issues && Array.isArray(arg.issues))
          )
        } catch {
          return false
        }
      }
      if (typeof arg === 'string') {
        return (
          arg.includes('ZodError') ||
          arg.includes('validation') ||
          arg.includes('too_small') ||
          arg.includes('invalid_format')
        )
      }
      return false
    })

    // Only log if it's not a Zod error
    if (!hasZodError && originalConsoleError) {
      originalConsoleError.apply(console, args)
    }
  }
}

export const restoreConsoleErrors = () => {
  if (originalConsoleError) {
    console.error = originalConsoleError
    originalConsoleError = null
  }
}