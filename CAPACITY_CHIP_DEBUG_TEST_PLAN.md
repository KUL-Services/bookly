# Capacity Chip Debug Test Plan

## Issue

Capacity chips are not displaying in Unified Day/Week Views despite overflow and height fixes.

## Debug Logging Added

Added console.log statements to both views to diagnose the issue:

### Day View Debug Logs

`unified-multi-resource-day-view.tsx` lines ~393-445

### Week View Debug Logs

`unified-multi-resource-week-view.tsx` lines ~360-410

## Test Instructions

### 1. Open Calendar in Browser

Navigate to: http://localhost:3000/bookly/calendar

### 2. Switch to Unified Views

- Click Unified Day View or Unified Week View

### 3. Navigate to December 22-24, 2025

This is when the test data with slotIds exists

### 4. Open Browser Console

Press F12 or Cmd+Option+I

### 5. Look for Debug Logs

You should see logs like:

```
🔍 DAY VIEW Capacity Check: {
  eventId: "booking-static-1",
  resourceId: "2",
  resourceName: "Sarah Williams",
  isStaff: true,
  staffType: "static",
  roomType: undefined,
  isStaticStaff: true,
  isFixedRoom: false,
  slotId: "slot-fitness-mon-1",
  extendedProps: { ... }
}
```

## Expected Outcomes

### If slotId is missing:

```
❌ No slotId found
```

**Fix**: Check mock data - bookings need slotId property

### If capacityInfo is null:

```
📊 Capacity Info: { slotId: "slot-fitness-mon-1", eventDate: ..., capacityInfo: null }
❌ No capacity info returned
```

**Fix**: Check if static slot exists with this ID

### If chip should render:

```
✅ RENDERING CHIP: { remainingCapacity: 15, total: 20, chipColor: "success" }
```

**Expected**: Chip should be visible on event tile

## Test Data

### Static Staff with Bookings

- **Sarah Williams** (ID: '2')
  - staffType: 'static'
  - Has room assignments with slots

### Bookings with slotIds

Located in mock-data.ts lines ~1290-1590:

- booking-static-1 through booking-static-17
- All assigned to "Morning Yoga Class"
- All have slotId: 'slot-fitness-mon-1' or 'slot-fitness-mon-2' or 'slot-fitness-wed-small'
- Dates: December 22-24, 2025

### Static Slots

Check if these slot IDs exist in mockStaticServiceSlots:

- slot-fitness-mon-1
- slot-fitness-mon-2
- slot-fitness-wed-small

## Potential Issues to Check

1. **Missing Static Slots**: The slotIds in bookings don't match any slots in mockStaticServiceSlots
2. **Wrong Date**: Calendar not showing December 22-24, 2025
3. **Event not mapped**: Events not being created from bookings correctly
4. **isSlotAvailable returning null**: Function failing to find slot

## Next Steps Based on Logs

### If "No slotId found":

- Check if booking was mapped to event correctly
- Verify slotId is in extendedProps

### If "No capacity info returned":

- Check if slot exists in staticSlots store
- Verify slot ID matches exactly
- Check if getSlotsForDate is working

### If "RENDERING CHIP" but still not visible:

- CSS issue (z-index, positioning)
- Chip being rendered outside viewport
- Parent container clipping despite overflow:visible

## Files with Debug Logs

1. `/unified-multi-resource-day-view.tsx` (lines ~393-445)
2. `/unified-multi-resource-week-view.tsx` (lines ~360-410)

## Removing Debug Logs

Once issue is found, remove all console.log statements:

- Search for: `console.log('🔍`
- Search for: `console.log('❌`
- Search for: `console.log('📊`
- Search for: `console.log('✅`
