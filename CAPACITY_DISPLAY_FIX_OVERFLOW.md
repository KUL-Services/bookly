# Capacity Chip Display Fix - Overflow Issue

## Problem

Capacity chips were not displaying in the Unified Day/Week Views despite the logic being correctly implemented. The issue was caused by CSS constraints on the event boxes.

## Root Causes

### 1. **Overflow Hidden** (Day View)

```tsx
// BEFORE
sx={{
  overflow: 'hidden',  // ❌ Clipped the capacity chip
  // ...
}}
```

The `overflow: 'hidden'` property was clipping any content that extended beyond the event box boundaries, including the capacity chip.

### 2. **Insufficient Minimum Height**

```tsx
// BEFORE - Day View
height: Math.max(style.height, 30),  // ❌ Too small for time + service + chip

// BEFORE - Week View
// No minHeight set at all
```

Event boxes were too small to display:

- Time label (e.g., "9:00 AM")
- Service name with color dot
- Capacity chip

## Solution

### Day View Changes

`unified-multi-resource-day-view.tsx` (lines ~320-345)

```tsx
// AFTER
sx={{
  overflow: 'visible',           // ✅ Allow chip to be visible
  height: Math.max(style.height, 60),  // ✅ Double minimum height
  // ...
}}
```

### Week View Changes

`unified-multi-resource-week-view.tsx` (lines ~290-315)

```tsx
// AFTER
sx={{
  minHeight: 50,        // ✅ Ensure minimum height for content
  overflow: 'visible',  // ✅ Explicitly set overflow
  // ...
}}
```

## Changes Made

### File: `unified-multi-resource-day-view.tsx`

- Changed `overflow: 'hidden'` → `overflow: 'visible'`
- Changed `height: Math.max(style.height, 30)` → `height: Math.max(style.height, 60)`

### File: `unified-multi-resource-week-view.tsx`

- Added `minHeight: 50`
- Added `overflow: 'visible'`

## Expected Result

After these changes, capacity chips should now be visible on event tiles for:

- ✅ Static staff bookings
- ✅ Fixed/static room bookings
- ✅ Both Day and Week unified views

### Chip Display Format

- **Label**: `{remainingCapacity}/{totalCapacity}` (e.g., "15/20")
- **Icon**: User icon (`ri-user-line`)
- **Colors**:
  - 🟢 Green (>50% available)
  - 🟡 Yellow (20-50% available)
  - 🔴 Red (<20% available)

## Test Data

The mock data contains static bookings with slotIds scheduled for:

- **December 22-24, 2025** (Monday-Wednesday)
- Slots: `slot-fitness-mon-1`, `slot-fitness-mon-2`, `slot-fitness-wed-small`

To see the capacity chips:

1. Navigate to December 22-24, 2025
2. View Unified Day or Week view
3. Look for "Morning Yoga Class" bookings under Sarah Johnson (static staff)

## Visual Layout (Day View)

```
┌─────────────────────────────────┐
│ 9:00 AM                         │ ← Time
│ ● Morning Yoga Class            │ ← Service with color dot
│ [👤 15/20]                      │ ← Capacity chip (now visible!)
└─────────────────────────────────┘
```

## Visual Layout (Week View)

```
┌──────────────────────┐
│ 9:00 AM              │ ← Time
│ ● Yoga               │ ← Service (compact)
│ [👤 15/20]           │ ← Capacity chip (now visible!)
└──────────────────────┘
```

## Why This Works

1. **`overflow: 'visible'`** allows content to extend beyond the box boundaries without being clipped
2. **Increased minimum height** ensures there's physical space for all elements (time + service + chip)
3. The capacity chip logic was already correct - it just needed to be visible!

## Additional Notes

- The chip uses `mt: 0.5` (Day) / `mt: 0.25` (Week) to add spacing between service name and chip
- Smaller chip size in Week view (14px vs 16px) for compact display
- Only shows for static staff and fixed/static rooms (not dynamic bookings)
