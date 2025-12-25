'use client'

import {
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Paper
} from '@mui/material'

interface QuickActionMenuProps {
  open: boolean
  anchorPosition?: { top: number; left: number }
  onClose: () => void
  onNewAppointment: () => void
  onTimeReservation: () => void
  onTimeOff: () => void
}

export default function QuickActionMenu({
  open,
  anchorPosition,
  onClose,
  onNewAppointment,
  onTimeReservation,
  onTimeOff
}: QuickActionMenuProps) {
  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <Popover
      open={open}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      onClose={onClose}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'visible',
          mt: 0,
          ml: 2,
          minWidth: 320
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          {/* New Appointment */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleAction(onNewAppointment)}
              sx={{
                borderRadius: 1.5,
                mb: 1,
                py: 2,
                border: theme => `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(10, 44, 36, 0.08)'
                    : 'rgba(10, 44, 36, 0.04)',
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? 'rgb(20, 184, 166)'
                    : 'rgb(13, 148, 136)'
                }
              }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(10, 44, 36, 0.12)'
                      : 'rgba(10, 44, 36, 0.08)',
                    color: theme => theme.palette.mode === 'dark'
                      ? 'rgb(20, 184, 166)'
                      : 'rgb(13, 148, 136)'
                  }}
                >
                  <i className="ri-calendar-check-line" style={{ fontSize: '24px' }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>
                    New Appointment
                  </Typography>
                }
                secondary="Book a service for a client"
              />
            </ListItemButton>
          </ListItem>

          {/* Add Time Reservation */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleAction(onTimeReservation)}
              sx={{
                borderRadius: 1.5,
                mb: 1,
                py: 2,
                border: theme => `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(10, 44, 36, 0.08)'
                    : 'rgba(10, 44, 36, 0.04)',
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? 'rgb(144, 202, 249)'
                    : 'rgb(25, 118, 210)'
                }
              }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(10, 44, 36, 0.12)'
                      : 'rgba(10, 44, 36, 0.08)',
                    color: theme => theme.palette.mode === 'dark'
                      ? 'rgb(144, 202, 249)'
                      : 'rgb(25, 118, 210)'
                  }}
                >
                  <i className="ri-time-line" style={{ fontSize: '24px' }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>
                    Add Time Reservation
                  </Typography>
                }
                secondary="Block time for meetings or training"
              />
            </ListItemButton>
          </ListItem>

          {/* Add Time Off */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleAction(onTimeOff)}
              sx={{
                borderRadius: 1.5,
                py: 2,
                border: theme => `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(121, 85, 72, 0.08)'
                    : 'rgba(121, 85, 72, 0.04)',
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? 'rgb(188, 170, 164)'
                    : 'rgb(121, 85, 72)'
                }
              }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(121, 85, 72, 0.12)'
                      : 'rgba(121, 85, 72, 0.08)',
                    color: theme => theme.palette.mode === 'dark'
                      ? 'rgb(188, 170, 164)'
                      : 'rgb(121, 85, 72)'
                  }}
                >
                  <i className="ri-calendar-close-line" style={{ fontSize: '24px' }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem' }}>
                    Add Time Off
                  </Typography>
                }
                secondary="Mark vacation or personal time"
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Popover>
  )
}
