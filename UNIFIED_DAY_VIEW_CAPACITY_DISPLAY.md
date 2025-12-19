# Capacity Display Added to Unified Multi-Resource Views ✅

## Summary

Successfully added capacity display chips to event tiles in both the **Unified Multi-Resource Day View** and **Unified Multi-Resource Week View** for static/fixed staff bookings. The capacity now shows in format like "15/20" with color coding (green/yellow/red) based on availability.

## Changes Made

### File: `unified-multi-resource-day-view.tsx`

#### 1. Added Required State Hooks (Lines ~38-40)

```typescript
const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
const schedulingMode = useCalendarStore(state => state.schedulingMode)
```

#### 2. Added Capacity Display in Event Rendering (Lines ~365-398)

Added capacity chip rendering logic that:

- Only shows for static staff or fixed/static rooms
- Only displays in static scheduling mode
- Requires valid `slotId` from event
- Uses `isSlotAvailable(slotId, date)` to get capacity info
- Color-codes based on remaining capacity:
  - **Green** (success): > 50% capacity remaining
  - **Yellow** (warning): 20-50% capacity remaining
  - **Red** (error): < 20% capacity remaining

### Implementation Details

```typescript
{/* Capacity Display for Static/Fixed Resources */}
{(() => {
  // Only show capacity for static staff or fixed/static rooms
  const showCapacity = isStaff
    ? resource.staffType === 'static'
    : (resource.roomType === 'fixed' || resource.roomType === 'static')

  if (!showCapacity || schedulingMode !== 'static') return null

  // Get slot info
  const slotId = event.extendedProps?.slotId

  if (!slotId) return null

  // Get capacity info for this slot - only needs slotId and date
  const eventDate = new Date(event.start)
  const capacityInfo = isSlotAvailable(slotId, eventDate)

  if (!capacityInfo) return null

  // Calculate color based on remaining capacity
  const percentRemaining = (capacityInfo.remainingCapacity / capacityInfo.total) * 100
  const chipColor = percentRemaining > 50 ? 'success' : percentRemaining > 20 ? 'warning' : 'error'

  return (
    <Box sx={{ mt: 0.5 }}>
      <Chip
        icon={<i className='ri-user-line' style={{ fontSize: '0.7rem' }} />}
        label={`${capacityInfo.remainingCapacity}/${capacityInfo.total}`}
        color={chipColor}
        size='small'
        sx={{
          height: '16px',
          fontSize: '0.6rem',
          fontWeight: 600,
          '& .MuiChip-icon': {
            fontSize: '0.7rem',
            marginLeft: '2px'
          },
          '& .MuiChip-label': {
            padding: '0 4px'
          }
        }}
      />
    </Box>
  )
})()}
```

## Visual Result

Event tiles in the Unified Multi-Resource Day View now display:

```
┌─────────────────────────┐
│ 9:00 AM                 │
│ 🟢 Yoga Class           │
│ 👤 15/20                │  ← Capacity chip (green = good)
└─────────────────────────┘

┌─────────────────────────┐
│ 10:00 AM                │
│ 🟡 Spin Class           │
│ 👤 4/12                 │  ← Capacity chip (yellow = low)
└─────────────────────────┘

┌─────────────────────────┐
│ 11:00 AM                │
│ 🔴 HIIT Class           │
│ 👤 0/8                  │  ← Capacity chip (red = full)
└─────────────────────────┘
```

## Key Features

1. **Automatic Detection**: Only shows for static/fixed resources
2. **Color-Coded Status**: Visual indicator of availability
3. **Compact Display**: Small chip doesn't clutter the UI
4. **Consistent with FullCalendar**: Same logic and styling as FullCalendar view
5. **Reactive**: Updates automatically when bookings change

## Integration with State

Uses Zustand store's `isSlotAvailable()` function:

```typescript
const capacityInfo = isSlotAvailable(slotId, eventDate)
```

Returns:

```typescript
{
  available: boolean,
  remainingCapacity: number,
  total: number
}
```

## Validation

✅ No TypeScript errors  
✅ Consistent with existing FullCalendar implementation  
✅ Only displays for static/fixed resources  
✅ Respects scheduling mode  
✅ Handles missing data gracefully

## Files Modified

1. **`/Users/kareemgamal/Downloads/KUL/bookly/src/bookly/features/calendar/unified-multi-resource-day-view.tsx`**

   - Added `isSlotAvailable` and `schedulingMode` hooks (Lines ~38-40)
   - Added capacity chip rendering in event tiles (Lines ~395-435)

2. **`/Users/kareemgamal/Downloads/KUL/bookly/src/bookly/features/calendar/unified-multi-resource-week-view.tsx`**
   - Added `isSlotAvailable` and `schedulingMode` hooks (Lines ~35-36)
   - Added capacity chip rendering in event tiles (Lines ~333-374)

## Related Documentation

- See `SLOT_CAPACITY_DISPLAY_COMPLETE.md` for FullCalendar implementation
- See `CAPACITY_DISPLAY_ON_CALENDAR_EVENTS.md` for overall feature documentation

---

**Implementation Date**: December 2024  
**Status**: ✅ Complete
