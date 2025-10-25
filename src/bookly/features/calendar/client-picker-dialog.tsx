'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Box,
  Typography,
  InputAdornment,
  Chip
} from '@mui/material'
import { mockCustomers } from '@/bookly/data/mock-data'
import type { User } from '@/bookly/data/types'

interface ClientPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (client: User | null) => void
  selectedClientId?: string | null
}

export default function ClientPickerDialog({ open, onClose, onSelect, selectedClientId }: ClientPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter clients based on search query
  const filteredClients = mockCustomers.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.phone.includes(query)
    )
  })

  const handleSelect = (client: User) => {
    onSelect(client)
    setSearchQuery('')
    onClose()
  }

  const handleWalkIn = () => {
    onSelect(null)
    setSearchQuery('')
    onClose()
  }

  const handleCancel = () => {
    setSearchQuery('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Select Client</Typography>
          <Button variant="outlined" size="small" onClick={handleWalkIn} startIcon={<i className="ri-walk-line" />}>
            Walk-in
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search by name, email, or phone"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="ri-search-line" />
              </InputAdornment>
            )
          }}
        />

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredClients.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No clients found
              </Typography>
            </Box>
          ) : (
            filteredClients.map(client => (
              <ListItem key={client.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(client)}
                  selected={client.id === selectedClientId}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light'),
                      '&:hover': {
                        bgcolor: theme => (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light')
                      }
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={client.profileImage} alt={`${client.firstName} ${client.lastName}`}>
                      {client.firstName[0]}
                      {client.lastName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          {client.firstName} {client.lastName}
                        </Typography>
                        {client.totalBookings >= 10 && (
                          <Chip label="VIP" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {client.email}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {client.phone} • {client.totalBookings} booking{client.totalBookings !== 1 ? 's' : ''}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}
