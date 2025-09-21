'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Store Imports
import { useAuthStore } from '@/stores/auth.store'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const { logoutBusiness, userType, materializeUser } = useAuthStore()

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale as Locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      // Close the dropdown first
      setOpen(false)

      console.log('🔓 Starting logout process...')
      console.log('Current auth state:', { userType, materializeUser: !!materializeUser, session: !!session })

      // Always clear custom auth store if business user
      if (userType === 'business' && materializeUser) {
        console.log('🧹 Clearing business auth store...')
        logoutBusiness()
      }

      // Always clear NextAuth session if it exists
      if (session) {
        console.log('🧹 Clearing NextAuth session...')
        await signOut({ redirect: false })
      }

      // Clear any remaining localStorage items
      if (typeof window !== 'undefined') {
        console.log('🧹 Clearing all localStorage...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('bookly-auth-store')
        localStorage.removeItem('nextauth.message')
        // Clear all nextauth related items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('nextauth')) {
            localStorage.removeItem(key)
          }
        })
      }

      // Small delay to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 200))

      console.log('✅ Logout complete, redirecting to login...')
      // Force complete page reload to login
      window.location.href = getLocalizedUrl('/login', locale as Locale)

    } catch (error) {
      console.error('❌ Logout error:', error)

      // Force redirect even if there's an error
      window.location.href = getLocalizedUrl('/login', locale as Locale)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={materializeUser?.name || session?.user?.name || ''}
          src={session?.user?.image || ''}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={materializeUser?.name || session?.user?.name || ''} src={session?.user?.image || ''} />
                    <div className='flex items-start flex-col'>
                      <Typography variant='body2' className='font-medium' color='text.primary'>
                        {materializeUser?.name || session?.user?.name || ''}
                      </Typography>
                      <Typography variant='caption'>{materializeUser?.email || session?.user?.email || ''}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/pages/user-profile')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/pages/pricing')}>
                    <i className='ri-money-dollar-circle-line' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/pages/faq')}>
                    <i className='ri-question-line' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-1.5 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
