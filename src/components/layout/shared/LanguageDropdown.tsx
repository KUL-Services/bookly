'use client'

// React Imports
import { useRef, useState } from 'react'

// Next Imports
import { useParams, usePathname, useRouter } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

type LanguageDataType = {
  langCode: Locale
  langName: string
}

const getLocalePath = (pathName: string, locale: string) => {
  if (!pathName) return '/'
  const segments = pathName.split('/')

  segments[1] = locale

  return segments.join('/')
}

const languageData: LanguageDataType[] = [
  {
    langCode: 'en',
    langName: 'English'
  },
  {
    langCode: 'fr',
    langName: 'French'
  },
  {
    langCode: 'ar',
    langName: 'Arabic'
  }
]

const LanguageDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const router = useRouter()
  const pathName = usePathname()
  const { settings } = useSettings()
  const { lang } = useParams()

  const handleClose = () => {
    setOpen(false)
  }

  const handleLanguageChange = async (locale: string) => {
    setIsChangingLanguage(true)

    // Update ultimate language protector preference
    if ((window as any).updateUltimateLanguagePreference) {
      (window as any).updateUltimateLanguagePreference(locale)
    }

    const newPath = getLocalePath(pathName, locale)

    // Add a small delay to show the loading state
    setTimeout(() => {
      router.push(newPath)
      handleClose()
      // Reset loading state after navigation
      setTimeout(() => setIsChangingLanguage(false), 1000)
    }, 150)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        className='text-textPrimary'
        disabled={isChangingLanguage}
      >
        {isChangingLanguage ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-textPrimary border-t-transparent" />
        ) : (
          <i className='ri-translate-2' />
        )}
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-is-[160px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  {languageData.map(locale => (
                    <MenuItem
                      key={locale.langCode}
                      onClick={() => handleLanguageChange(locale.langCode)}
                      selected={lang === locale.langCode}
                      disabled={isChangingLanguage}
                      className='pli-4'
                    >
                      <div className='flex items-center justify-between w-full'>
                        <span>{locale.langName}</span>
                        {isChangingLanguage && lang === locale.langCode && (
                          <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-textPrimary border-t-transparent" />
                        )}
                      </div>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default LanguageDropdown
