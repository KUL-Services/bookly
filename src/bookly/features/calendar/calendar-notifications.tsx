'use client'

import { Drawer, Box, Typography, IconButton, Button } from '@mui/material'

interface CalendarNotificationsProps {
  open: boolean
  onClose: () => void
  onOpenFilters?: () => void
}

export default function CalendarNotifications({ open, onClose, onOpenFilters }: CalendarNotificationsProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 360 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box className="flex items-center justify-between p-4 border-b border-divider">
          <Typography variant="h6" className="font-semibold">
            Notifications
          </Typography>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line text-xl" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box className="flex-1 overflow-y-auto">
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-actionHover flex items-center justify-center mb-4">
              <i className="ri-notification-off-line text-4xl text-textSecondary" />
            </div>
            <Typography variant="h6" className="font-semibold mb-2">
              No notifications
            </Typography>
            <Typography variant="body2" className="text-textSecondary mb-6 max-w-xs">
              You're all caught up! You'll see notifications for upcoming appointments and important updates here.
            </Typography>

            {/* Filters Button */}
            <Button
              variant="outlined"
              startIcon={<i className="ri-filter-3-line" />}
              onClick={() => {
                onClose()
                onOpenFilters?.()
              }}
            >
              Open Filters
            </Button>
          </div>
        </Box>
      </Box>
    </Drawer>
  )
}
