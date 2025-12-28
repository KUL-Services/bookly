'use client'

import { useState } from 'react'
import {
  Box,
  Fab,
  Paper,
  Typography,
  Divider,
  ClickAwayListener,
  Fade
} from '@mui/material'
import { useServicesStore } from './services-store'

export function ServicesFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const { openServiceDialog, openCategoryDialog, openComboServiceDialog } = useServicesStore()

  const handleNewService = () => {
    openServiceDialog()
    setIsOpen(false)
  }

  const handleNewComboService = () => {
    openComboServiceDialog()
    setIsOpen(false)
  }

  const handleNewCategory = () => {
    openCategoryDialog()
    setIsOpen(false)
  }

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Menu */}
        <Fade in={isOpen}>
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              bottom: 70,
              right: 0,
              width: 280,
              overflow: 'hidden',
              borderRadius: 2,
              display: isOpen ? 'block' : 'none'
            }}
          >
            {/* New Service */}
            <Box
              onClick={handleNewService}
              sx={{
                p: 3,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Typography variant='subtitle1' fontWeight={600} textAlign='center'>
                NEW SERVICE
              </Typography>
            </Box>

            <Divider />

            {/* New Combo Service */}
            <Box
              onClick={handleNewComboService}
              sx={{
                p: 3,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Typography variant='subtitle1' fontWeight={600} textAlign='center'>
                NEW COMBO SERVICE
              </Typography>
            </Box>

            <Divider />

            {/* New Category */}
            <Box
              onClick={handleNewCategory}
              sx={{
                p: 3,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Typography variant='subtitle1' fontWeight={600} textAlign='center'>
                NEW CATEGORY
              </Typography>
            </Box>

            {/* Arrow pointer */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -10,
                right: 24,
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid',
                borderTopColor: 'background.paper'
              }}
            />
          </Paper>
        </Fade>

        {/* FAB Button */}
        <Fab
          color={isOpen ? 'default' : 'primary'}
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            boxShadow: 4,
            bgcolor: isOpen ? 'background.paper' : 'primary.main',
            color: isOpen ? 'text.primary' : 'primary.contrastText',
            border: isOpen ? '1px solid' : 'none',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: isOpen ? 'action.hover' : 'primary.dark'
            }
          }}
        >
          {isOpen ? (
            <i className='ri-close-line' style={{ fontSize: 24 }} />
          ) : (
            <i className='ri-add-line' style={{ fontSize: 24 }} />
          )}
        </Fab>
      </Box>
    </ClickAwayListener>
  )
}
