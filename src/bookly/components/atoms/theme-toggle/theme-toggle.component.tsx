'use client'

import { useRef, useState, useEffect } from 'react'
import { Sun, Moon, ChevronDown } from 'lucide-react'

type Theme = 'light' | 'dark'

const themeOptions = [
  {
    value: 'light' as Theme,
    label: 'Light',
    icon: Sun
  },
  {
    value: 'dark' as Theme,
    label: 'Dark',
    icon: Moon
  }
]

const BooklyThemeToggle = () => {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)

    // Get theme from localStorage or detect from system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    let initialTheme: Theme

    if (savedTheme === 'light' || savedTheme === 'dark') {
      initialTheme = savedTheme
    } else {
      // Detect system preference and set to light or dark
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      localStorage.setItem('theme', initialTheme)
    }

    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    root.classList.toggle('dark', newTheme === 'dark')
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const getCurrentIcon = () => {
    if (!mounted) return Sun // Default icon during SSR

    return theme === 'dark' ? Moon : Sun
  }

  const getCurrentTheme = () => {
    return themeOptions.find(option => option.value === theme) || themeOptions[0]
  }

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return (
      <div className='flex items-center gap-2 px-3 py-2 rounded-lg opacity-50'>
        <Sun className='w-4 h-4' />
      </div>
    )
  }

  const CurrentIcon = getCurrentIcon()
  const currentTheme = getCurrentTheme()

  return (
    <div className='relative'>
      <button
        ref={anchorRef}
        onClick={handleToggle}
        className='flex items-center gap-2 px-3 py-2.5 h-10 rounded-lg bg-primary-100/60 dark:bg-primary-900/40 hover:bg-primary-200/80 dark:hover:bg-primary-800/50 text-primary-900 dark:text-sage-300 hover:text-primary-900 dark:hover:text-sage-200 transition-all duration-200 touch-manipulation border border-primary-200/50 dark:border-primary-700/50'
        aria-label='Change theme'
      >
        <CurrentIcon className='w-4 h-4' />
        <span className='hidden sm:block text-sm font-medium capitalize'>{currentTheme.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className='fixed inset-0 z-40' onClick={handleClose} />

          {/* Dropdown */}
          <div className='absolute right-0 mt-2 w-40 bg-slate-800 dark:bg-slate-800 rounded-xl shadow-xl border border-slate-600 dark:border-slate-600 p-1 z-50 animate-in slide-in-from-top-2 duration-200'>
            {themeOptions.map(option => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all duration-200 touch-manipulation rounded-lg ${
                    theme === option.value
                      ? 'bg-primary-700 text-white shadow-md font-semibold'
                      : 'bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <IconComponent className='w-4 h-4' />
                  <span className='text-sm font-medium'>{option.label}</span>
                  {theme === option.value && <div className='ml-auto w-1.5 h-1.5 bg-white rounded-full'></div>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default BooklyThemeToggle
