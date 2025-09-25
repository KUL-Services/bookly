'use client'

import { useRef, useState, useEffect } from 'react'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

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
  },
  {
    value: 'system' as Theme,
    label: 'System',
    icon: Monitor
  }
]

const BooklyThemeToggle = () => {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)

    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === 'system') {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      // Use explicit theme
      root.classList.toggle('dark', newTheme === 'dark')
    }
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
    if (!mounted) return Monitor // Default icon during SSR

    if (theme === 'system') {
      return Monitor
    } else if (theme === 'dark') {
      return Moon
    } else {
      return Sun
    }
  }

  const getCurrentTheme = () => {
    return themeOptions.find(option => option.value === theme) || themeOptions[2]
  }

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg opacity-50">
        <Monitor className="w-4 h-4" />
      </div>
    )
  }

  const CurrentIcon = getCurrentIcon()
  const currentTheme = getCurrentTheme()

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50/60 dark:bg-teal-900/40 hover:bg-teal-100/80 dark:hover:bg-teal-800/50 text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 transition-all duration-200 touch-manipulation border border-teal-200/50 dark:border-teal-700/50"
        aria-label="Change theme"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="hidden sm:block text-sm font-medium capitalize">{currentTheme.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-teal-200/60 dark:border-teal-700/60 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
            {themeOptions.map(option => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-teal-50/80 dark:hover:bg-teal-900/40 transition-colors duration-200 touch-manipulation ${
                    theme === option.value
                      ? 'bg-teal-100/90 dark:bg-teal-800/60 text-teal-800 dark:text-teal-200 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                  {theme === option.value && (
                    <div className="ml-auto w-2 h-2 bg-teal-600 rounded-full shadow-sm"></div>
                  )}
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