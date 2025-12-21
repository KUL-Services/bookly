'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  InputBase,
  IconButton,
  Paper,
  Typography,
  Chip,
  Fade,
  ClickAwayListener,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useCalendarStore } from './state'

export default function CalendarSearch() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isDark = theme.palette.mode === 'dark'

  const searchQuery = useCalendarStore(state => state.searchQuery)
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const searchMatchedEventIds = useCalendarStore(state => state.searchMatchedEventIds)
  const setSearchQuery = useCalendarStore(state => state.setSearchQuery)
  const clearSearch = useCalendarStore(state => state.clearSearch)

  const [isExpanded, setIsExpanded] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local query with store query
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setSearchQuery(localQuery)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [localQuery, setSearchQuery])

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleCollapse = () => {
    if (!localQuery) {
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    setLocalQuery('')
    clearSearch()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (localQuery) {
        handleClear()
      } else {
        setIsExpanded(false)
        inputRef.current?.blur()
      }
    }
  }

  const matchCount = searchMatchedEventIds.size

  // Collapsed state - just show search icon
  if (!isExpanded && !isSearchActive) {
    return (
      <IconButton
        onClick={handleExpand}
        size="small"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: isDark ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)'
          }
        }}
        title="Search bookings (Ref, Name, Phone, Email)"
      >
        <i className="ri-search-line" style={{ fontSize: '1.25rem' }} />
      </IconButton>
    )
  }

  return (
    <ClickAwayListener onClickAway={handleCollapse}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            border: 1,
            borderColor: isSearchActive
              ? 'primary.main'
              : isDark
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(0,0,0,0.12)',
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
            width: isMobile ? 180 : 260,
            '&:focus-within': {
              borderColor: 'primary.main',
              bgcolor: isDark ? 'rgba(20, 184, 166, 0.05)' : 'rgba(20, 184, 166, 0.02)'
            }
          }}
        >
          <i
            className="ri-search-line"
            style={{
              fontSize: '1rem',
              color: isSearchActive ? theme.palette.primary.main : theme.palette.text.secondary
            }}
          />

          <InputBase
            inputRef={inputRef}
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ref, Name, Phone, Email..."
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              '& input': {
                p: 0,
                '&::placeholder': {
                  opacity: 0.6,
                  fontSize: '0.8rem'
                }
              }
            }}
          />

          {localQuery && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                p: 0.25,
                color: 'text.secondary',
                '&:hover': { color: 'error.main' }
              }}
            >
              <i className="ri-close-line" style={{ fontSize: '1rem' }} />
            </IconButton>
          )}
        </Paper>

        {/* Match count badge */}
        <Fade in={isSearchActive}>
          <Chip
            label={matchCount}
            size="small"
            color={matchCount > 0 ? 'primary' : 'default'}
            sx={{
              ml: 1,
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        </Fade>
      </Box>
    </ClickAwayListener>
  )
}
