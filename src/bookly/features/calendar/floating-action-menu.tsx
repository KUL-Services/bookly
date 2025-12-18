'use client'

import { useState } from 'react'
import {
  Box,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material'

interface FloatingActionMenuProps {
  onNewAppointment: () => void
  onTimeReservation: () => void
  onTimeOff: () => void
}

export default function FloatingActionMenu({
  onNewAppointment,
  onTimeReservation,
  onTimeOff
}: FloatingActionMenuProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleFabClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNewAppointment = () => {
    onNewAppointment()
    handleMenuClose()
  }

  const handleTimeReservation = () => {
    onTimeReservation()
    handleMenuClose()
  }

  const handleTimeOff = () => {
    onTimeOff()
    handleMenuClose()
  }

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color='primary'
        aria-label='add'
        onClick={handleFabClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 32 },
          right: { xs: 24, md: 32 },
          zIndex: 999,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6
          }
        }}
      >
        <i className='ri-add-line' style={{ fontSize: '1.5rem' }} />
      </Fab>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            boxShadow: 3,
            minWidth: 240
          }
        }}
      >
        <MenuItem onClick={handleNewAppointment}>
          <ListItemIcon>
            <i
              className='ri-calendar-event-line'
              style={{
                fontSize: '1.25rem',
                color: theme.palette.primary.main
              }}
            />
          </ListItemIcon>
          <ListItemText primary='New Appointment' />
        </MenuItem>
        <MenuItem onClick={handleTimeReservation}>
          <ListItemIcon>
            <i
              className='ri-time-line'
              style={{
                fontSize: '1.25rem',
                color: theme.palette.info.main
              }}
            />
          </ListItemIcon>
          <ListItemText primary='Add Time Reservation' />
        </MenuItem>
        <MenuItem onClick={handleTimeOff}>
          <ListItemIcon>
            <i
              className='ri-calendar-close-line'
              style={{
                fontSize: '1.25rem',
                color: theme.palette.warning.main
              }}
            />
          </ListItemIcon>
          <ListItemText primary='Add Time Off' />
        </MenuItem>
      </Menu>
    </>
  )
}
