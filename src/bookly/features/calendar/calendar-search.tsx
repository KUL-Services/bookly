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
  useTheme,
  Popper,
  List,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material'
import { format } from 'date-fns'
import { useCalendarStore } from './state'
import type { CalendarEvent } from './types'

export default function CalendarSearch() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isDark = theme.palette.mode === 'dark'

  const searchQuery = useCalendarStore(state => state.searchQuery)
  const isSearchActive = useCalendarStore(state => state.isSearchActive)
  const searchMatchedEventIds = useCalendarStore(state => state.searchMatchedEventIds)
  const events = useCalendarStore(state => state.events)
  const getSearchMatchedFields = useCalendarStore(state => state.getSearchMatchedFields)
  const setSearchQuery = useCalendarStore(state => state.setSearchQuery)
  const clearSearch = useCalendarStore(state => state.clearSearch)
  const openAppointmentDrawer = useCalendarStore(state => state.openAppointmentDrawer)

  const [isExpanded, setIsExpanded] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Get matched events for dropdown
  const matchedEvents = events.filter(e => searchMatchedEventIds.has(e.id)).slice(0, 8) // Limit to 8 results

  // Helper to get the matched field value to display
  const getMatchedFieldDisplay = (event: CalendarEvent) => {
    const matchedFields = getSearchMatchedFields(event.id)
    const props = event.extendedProps

    // Show the first matched field value
    for (const field of matchedFields) {
      switch (field) {
        case 'Ref':
          return { field: 'Ref', value: props.bookingReference || props.bookingId || '' }
        case 'Name':
          return { field: 'Client', value: props.customerName || '' }
        case 'Phone':
          return { field: 'Phone', value: props.customerPhone || '' }
        case 'Email':
          return { field: 'Email', value: props.customerEmail || '' }
        case 'Staff':
          return { field: 'Staff', value: props.staffName || '' }
        case 'Service':
          return { field: 'Service', value: props.serviceName || '' }
      }
    }
    return null
  }

  // Handle clicking on a search result
  const handleResultClick = (event: CalendarEvent) => {
    openAppointmentDrawer(event)
    setShowResults(false)
  }

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
      // Show results dropdown when search is active
      if (localQuery.trim()) {
        setShowResults(true)
      }
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
    setShowResults(false)
    if (!localQuery) {
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    setLocalQuery('')
    clearSearch()
    setShowResults(false)
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
            bgcolor: isDark ? 'rgba(10, 44, 36, 0.12)' : 'rgba(10, 44, 36, 0.08)'
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
        ref={containerRef}
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
              bgcolor: isDark ? 'rgba(10, 44, 36, 0.05)' : 'rgba(10, 44, 36, 0.02)'
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
            onFocus={() => isSearchActive && setShowResults(true)}
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
            onClick={() => setShowResults(!showResults)}
            sx={{
              ml: 1,
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        </Fade>

        {/* Search Results Dropdown */}
        <Popper
          open={showResults && matchedEvents.length > 0}
          anchorEl={containerRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300 }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              width: isMobile ? 300 : 400,
              maxHeight: 400,
              overflow: 'hidden',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider'
            }}
          >
            {/* Header */}
            <Box sx={{
              p: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: isDark ? 'rgba(10, 44, 36, 0.05)' : 'rgba(10, 44, 36, 0.03)'
            }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {matchCount} result{matchCount !== 1 ? 's' : ''} found
              </Typography>
              <IconButton size="small" onClick={() => setShowResults(false)}>
                <i className="ri-close-line" style={{ fontSize: '0.875rem' }} />
              </IconButton>
            </Box>

            {/* Results List */}
            <List sx={{ maxHeight: 320, overflow: 'auto', p: 0 }}>
              {matchedEvents.map((event, index) => {
                const matchedField = getMatchedFieldDisplay(event)
                const eventDate = new Date(event.start)

                return (
                  <Box key={event.id}>
                    {index > 0 && <Divider />}
                    <ListItemButton
                      onClick={() => handleResultClick(event)}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(10, 44, 36, 0.08)' : 'rgba(10, 44, 36, 0.05)'
                        }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Service name and date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {event.extendedProps.serviceName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(eventDate, 'MMM d, h:mm a')}
                          </Typography>
                        </Box>

                        {/* Matched field highlight */}
                        {matchedField && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={matchedField.field}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                height: 18,
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                '& .MuiChip-label': { px: 0.75 }
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: 'primary.main',
                                bgcolor: isDark ? 'rgba(10, 44, 36, 0.15)' : 'rgba(10, 44, 36, 0.08)',
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 0.5
                              }}
                            >
                              {matchedField.value}
                            </Typography>
                          </Box>
                        )}

                        {/* Customer name if not the matched field */}
                        {matchedField?.field !== 'Client' && event.extendedProps.customerName && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {event.extendedProps.customerName}
                          </Typography>
                        )}
                      </Box>

                      <IconButton size="small" sx={{ ml: 1 }}>
                        <i className="ri-arrow-right-s-line" />
                      </IconButton>
                    </ListItemButton>
                  </Box>
                )
              })}
            </List>

            {/* Footer if more results */}
            {matchCount > 8 && (
              <Box sx={{
                p: 1.5,
                borderTop: 1,
                borderColor: 'divider',
                textAlign: 'center',
                bgcolor: isDark ? 'rgba(10, 44, 36, 0.03)' : 'rgba(10, 44, 36, 0.02)'
              }}>
                <Typography variant="caption" color="text.secondary">
                  Showing 8 of {matchCount} results. Refine your search for more specific results.
                </Typography>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}
