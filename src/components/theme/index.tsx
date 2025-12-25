'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  lighten,
  darken
} from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import type {} from '@mui/material/themeCssVarsAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import type {} from '@mui/lab/themeAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build

// Third-party Imports
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Type Imports
import type { ChildrenType, Direction, SystemMode } from '@core/types'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

type Props = ChildrenType & {
  direction: Direction
  systemMode: SystemMode
}

const ThemeProvider = (props: Props) => {
  // Props
  const { children, direction, systemMode } = props

  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Vars
  const isServer = typeof window === 'undefined'
  let currentMode: SystemMode

  if (isServer) {
    currentMode = systemMode
  } else {
    if (settings.mode === 'system') {
      currentMode = isDark ? 'dark' : 'light'
    } else {
      currentMode = settings.mode as SystemMode
    }
  }

  // Merge the primary color scheme override with the core theme
  // Brand colors: Dark Green #0a2c24 | Navy Blue #202c39 | Off-White #f7f8f9
  // Accents: Coral #e88682 | Sage Green #77b6a3 | Teal #51b4b7
  const theme = useMemo(() => {
    const newColorScheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor as string, 0.3),
              dark: darken(settings.primaryColor as string, 0.15)
            },
            // Bookly surfaces & greys (light) - derived from Navy Blue
            background: {
              default: '#f7f8f9', // Off-White
              paper: '#FFFFFF'
            },
            text: {
              primary: '#0a2c24', // Dark Green for primary text
              secondary: '#3d4a5a' // Navy Blue light for secondary
            },
            grey: {
              50: '#f7f8f9', // Off-White
              100: '#f0f2f4',
              200: '#e4e7eb',
              300: '#d1d5db',
              400: '#9ca3af',
              500: '#6b7280',
              600: '#4b5563',
              700: '#374151',
              800: '#202c39', // Navy Blue
              900: '#0a2c24' // Dark Green
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor as string, 0.3),
              dark: darken(settings.primaryColor as string, 0.15)
            },
            // Bookly surfaces & greys (dark) - Navy Blue base
            background: {
              default: '#202c39', // Navy Blue
              paper: '#283444'
            },
            text: {
              primary: '#f7f8f9', // Off-White
              secondary: '#d1d5db'
            },
            grey: {
              50: '#141c27',
              100: '#1a2430',
              200: '#202c39', // Navy Blue
              300: '#283444',
              400: '#3d4a5a',
              500: '#535f6f',
              600: '#9ca3af',
              700: '#d1d5db',
              800: '#e4e7eb',
              900: '#f7f8f9' // Off-White
            }
          }
        }
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(settings, currentMode, direction), newColorScheme)

    return extendTheme(coreTheme)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, currentMode])

  return (
    <AppRouterCacheProvider
      options={{
        prepend: true,
        ...(direction === 'rtl' && {
          key: 'rtl',
          stylisPlugins: [stylisRTLPlugin]
        })
      }}
    >
      <CssVarsProvider
        theme={theme}
        defaultMode={systemMode}
        modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
      >
        <>
          <ModeChanger systemMode={systemMode} />
          <CssBaseline />
          {children}
        </>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}

export default ThemeProvider
