# Calendar Enhancements Progress Report

**Date**: 2025-12-14
**Status**: In Progress - 3 of 9 tasks completed

---

## ✅ Completed Tasks

### 1. Removed "Pending" Status from Filter
- **File**: `src/bookly/features/calendar/calendar-sidebar.tsx`
- **Changes**: Removed `{ value: 'pending', label: 'Pending' }` from status filter list
- **Result**: Users can no longer filter by "Pending" status
- **Lines Modified**: ~896-921

### 2. Removed Apply Button & Implemented Instant Filters
- **File**: `src/bookly/features/calendar/calendar-sidebar.tsx`
- **Changes**:
  - Removed "Apply" and "Clear" buttons from footer
  - Replaced with single "Clear All Filters" button
  - Updated all filter handlers to call `applyFilters()` immediately
  - Filters now apply in real-time as user checks/unchecks options

**Affected Handlers**:
  - `handleAllBranches()`
  - `handleBranchToggle()`
  - `handleOnlyMeChange()`
  - `handleSelectAllStaff()`
  - `handleStaffToggle()`
  - `handleAllRooms()`
  - `handleSelectAllRooms()`
  - `handleRoomToggle()`
  - `handlePaymentToggle()`
  - `handleStatusToggle()`
  - `handleSelectionToggle()`
  - `handleDetailToggle()`

### 3. Enhanced Mock Data with Today's Bookings
- **File**: `src/bookly/data/mock-data.ts`
- **Additions**: 11 new bookings for 2025-12-14 through 2025-12-17
- **Bookings Added**:
  - Today (2025-12-14): 6 bookings
    - Emma Johnson: 2 appointments (9:00 AM, 10:30 AM)
    - Sarah Williams: 1 appointment (2:00 PM)
    - Lisa Chen: 2 appointments (11:00 AM, 2:00 PM)
    - James Mitchell: 1 appointment (1:00 PM)

  - Tomorrow (2025-12-15): 3 bookings
    - Emma Johnson: 1 appointment (10:00 AM)
    - Sarah Williams: 1 appointment (1:00 PM)
    - Lisa Chen: 1 appointment (3:00 PM)

  - This Week (2025-12-16 to 2025-12-17): 2 bookings
    - James Mitchell: 1 appointment (4:00 PM)
    - Emma Johnson: 1 appointment (11:00 AM)

- **Lines Modified**: ~1486-1663

---

## ⏳ Pending Tasks

### 4. Add "Available Staff at Current Moment" Filter

**Location**: `src/bookly/features/calendar/calendar-sidebar.tsx`

**Implementation Plan**:
```typescript
// New handler to add in calendar-sidebar.tsx
const getAvailableStaffNow = useCallback(() => {
  const now = new Date()
  return mockStaff.filter(staff => {
    // Check if staff is working right now
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()]
    const currentTime = format(now, 'HH:mm')

    // Check staff's working hours
    const schedule = staff.workingHours?.[dayOfWeek]
    if (!schedule || !schedule.isWorking) return false

    // Check if current time falls within any shift
    return schedule.shifts?.some((shift: any) => {
      const [startH, startM] = shift.start.split(':').map(Number)
      const [endH, endM] = shift.end.split(':').map(Number)
      const startMins = startH * 60 + startM
      const endMins = endH * 60 + endM
      const currentMins = now.getHours() * 60 + now.getMinutes()
      return currentMins >= startMins && currentMins < endMins
    })
  })
}, [])

// Add checkbox in Staff section
<FormControlLabel
  control={
    <Checkbox
      checked={pendingStaff.availableNow || false}
      onChange={(e) => {
        const newStaff = { ...pendingStaff, availableNow: e.target.checked }
        if (e.target.checked) {
          newStaff.staffIds = getAvailableStaffNow().map(s => s.id)
        }
        setPendingStaff(newStaff)
        applyFilters(pendingBranches, newStaff, pendingRooms, pendingHighlights)
      }}
    />
  }
  label={<Typography variant='body2'>Available Now</Typography>}
/>
```

**Required Changes**:
- Add `availableNow` property to `StaffFilter` type in `types.ts`
- Update `getWorkingHoursFromSchedule()` function in mock-data.ts to properly populate hours
- Add checkbox in Staff filter section

---

### 5. Implement Capacity Logic for Dynamic Staff

**Concept**: Dynamic staff capacity is booking-based (maxConcurrentBookings)

**Implementation in Calendar Views**:

```typescript
// In unified-multi-resource-day-view.tsx and unified-multi-resource-week-view.tsx

// Calculate available capacity for a staff member at a specific time
const getStaffAvailableCapacity = (staffId: string, time: Date) => {
  const staff = mockStaff.find(s => s.id === staffId)
  if (!staff || staff.staffType !== 'dynamic') return null

  const maxCapacity = staff.maxConcurrentBookings || 1

  // Count how many bookings this staff has at this time
  const bookingsAtTime = mockBookings.filter(booking => {
    if (booking.staffMemberName !== staff.name) return false

    const bookingStart = new Date(booking.date)
    bookingStart.setHours(...booking.time.split(':').map(Number))

    const bookingEnd = new Date(bookingStart)
    bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.duration)

    return bookingStart <= time && time < bookingEnd
  }).length

  return maxCapacity - bookingsAtTime
}

// Display in day/week view headers
const availableCapacity = getStaffAvailableCapacity(staff.id, currentDate)
```

**Display in Views**:
- Show available capacity as a colored badge:
  - Red: 0 slots available
  - Yellow: 1 slot available
  - Green: 2+ slots available

---

### 6. Implement Slot-Based Capacity for Static Staff & Fixed Rooms

**Concept**: Each time slot or room has specific capacity limits

**Implementation**:

```typescript
// Create a structure to track capacity per slot
const getSlotCapacity = (roomId: string | staffId: string, date: Date, timeSlot: string) => {
  const slotKey = `${roomId}-${date.toISOString().split('T')[0]}-${timeSlot}`

  // Count how many bookings are in this slot
  const bookingsInSlot = mockBookings.filter(booking => {
    const isSameRoom = booking.roomId === roomId
    const isSameDate = new Date(booking.date).toDateString() === date.toDateString()
    return isSameRoom && isSameDate
  }).length

  // Get room or staff capacity
  const room = mockRooms.find(r => r.id === roomId)
  const maxCapacity = room?.capacity || 1

  return maxCapacity - bookingsInSlot
}

// Display in calendar
const remainingCapacity = getSlotCapacity(room.id, currentDate, currentTimeSlot)
<Chip
  label={`Cap: ${remainingCapacity}/${maxCapacity}`}
  color={remainingCapacity === 0 ? 'error' : remainingCapacity === 1 ? 'warning' : 'success'}
  size='small'
  variant='outlined'
/>
```

---

### 7. Implement Total Capacity Display for Dynamic Rooms

**Concept**: Dynamic rooms show total capacity (not per-slot)

**Implementation**:

```typescript
// For dynamic rooms, show only total capacity
const getDynamicRoomAvailability = (roomId: string) => {
  const room = mockRooms.find(r => r.id === roomId && r.roomType === 'dynamic')
  if (!room) return null

  return {
    totalCapacity: room.capacity,
    roomName: room.name,
    status: 'Available' // Always available if dynamic
  }
}

// Display in views
{room.roomType === 'dynamic' && (
  <Chip
    label={`Total: ${room.capacity}`}
    variant='outlined'
    size='small'
    color='success'
  />
)}
```

---

### 8. Align All Business Flows & Functionalities

**Areas to Align**:

1. **Staff Types**:
   - Dynamic: Show booking-based capacity
   - Static: Show slot-based capacity + room assignments

2. **Room Types**:
   - Fixed: Show slot-based capacity
   - Flexible: Show total capacity

3. **Booking Creation Flow**:
   - Dynamic staff: Check maxConcurrentBookings
   - Static staff: Check room assignment availability
   - Fixed rooms: Check slot capacity
   - Flexible rooms: Check total capacity

4. **Display Consistency**:
   - All capacity should be visible in day and week views
   - Color coding should match across views
   - Room assignments should be visible for static staff

5. **Filter Integration**:
   - Available staff filter should respect working hours
   - Branch selection should filter all staff/rooms
   - Status filters should apply consistently

---

## Implementation Priority

**Phase 1** (Current - High Priority):
- [ ] Task 4: Add "Available Now" filter
- [ ] Task 5: Implement dynamic staff capacity logic
- [ ] Task 6: Implement fixed room capacity display

**Phase 2** (Medium Priority):
- [ ] Task 7: Dynamic room capacity display
- [ ] Task 8: Complete business flow alignment

---

## Technical Notes

### Key Data Structures

```typescript
// Staff with capacity
{
  id: '1',
  name: 'Emma Johnson',
  staffType: 'dynamic',
  maxConcurrentBookings: 2,  // Can handle 2 overlapping bookings
  workingHours: {
    Mon: { isWorking: true, shifts: [{start: '09:00', end: '18:00'}] },
    // ...
  }
}

// Static staff with room assignments
{
  id: '2',
  name: 'Sarah Williams',
  staffType: 'static',
  roomAssignments: [{
    roomName: 'Studio B',
    dayOfWeek: 'Mon',
    startTime: '09:00',
    endTime: '13:00'
  }]
}

// Rooms
{
  id: 'room-1',
  name: 'Main Studio',
  roomType: 'static',  // 'static' | 'dynamic'
  capacity: 20
}

// Bookings
{
  id: 'booking-1',
  staffMemberName: 'Emma Johnson',
  date: new Date('2025-12-14'),
  time: '9:00 AM',
  duration: 60,
  roomId?: 'room-1'
}
```

### Helper Functions Needed

```typescript
// Get staff working hours for a specific day
export function getWorkingHoursForDay(staffId: string, day: Date): { start: string, end: string } | null

// Get available slots for a staff member
export function getAvailableSlotsForStaff(staffId: string, date: Date): string[]

// Get available slots for a room
export function getAvailableSlotsForRoom(roomId: string, date: Date): string[]

// Check if slot is available
export function isSlotAvailable(staffId: string | roomId: string, date: Date, time: string, duration: number): boolean
```

---

## Files to Modify

### Core Files
- [x] `src/bookly/features/calendar/calendar-sidebar.tsx`
- [ ] `src/bookly/features/calendar/unified-multi-resource-day-view.tsx`
- [ ] `src/bookly/features/calendar/unified-multi-resource-week-view.tsx`
- [ ] `src/bookly/features/calendar/utils.ts`
- [ ] `src/bookly/features/calendar/types.ts`
- [ ] `src/bookly/data/mock-data.ts`
- [x] `src/bookly/data/staff-management-mock-data.ts`

### Type Definitions to Update
```typescript
// In types.ts
interface StaffFilter {
  onlyMe: boolean
  staffIds: string[]
  selectedStaffId: string | null
  workingStaffOnly: boolean
  availableNow?: boolean  // NEW
}
```

---

## Testing Checklist

- [ ] Filters apply instantly without Apply button
- [ ] "Pending" status is not visible in filter list
- [ ] Bookings show for today and upcoming dates
- [ ] "Available Now" filter shows only staff currently working
- [ ] Dynamic staff show booking-based capacity
- [ ] Static staff show room assignments and times
- [ ] Fixed rooms show slot-based capacity
- [ ] Flexible rooms show total capacity
- [ ] Colors reflect availability (red/yellow/green)
- [ ] All views (day, week) display consistent capacity info
- [ ] Branch filtering works across all resources
- [ ] No console errors or warnings

---

## Build Status

✅ **Latest Build**: SUCCESSFUL
- All TypeScript types validated
- No linting errors in modified files
- All imports and dependencies resolved

---

## Next Steps

1. Implement "Available Now" filter (Task 4)
2. Add capacity calculation helpers to utils.ts
3. Update calendar views to display capacity information
4. Add visual indicators (color coding) for availability
5. Test capacity logic with actual bookings
6. Ensure business flows are consistent across all staff/room types

---

**Last Updated**: 2025-12-14 23:15
**Status**: Ready for next phase
**Estimated Remaining Time**: 2-3 hours
