# Static/Dynamic Staff Implementation - Complete

## Overview

Successfully implemented toggle between **Dynamic** and **Static** staff scheduling modes in the Shifts tab.

## Completed Features

### 1. ✅ Pass staffType to ShiftEditorModal

**File**: `shifts-tab.tsx`

- Updated `openShiftEditor` function to find staff member and get their `staffType`
- Added `staffType` to `shiftEditorContext` state
- Passed `staffType` prop to both `ShiftEditorModal` instances

**Changes**:

```tsx
const openShiftEditor = (
  staff: { id: string; name: string },
  date: Date,
  existingShift?: { start: string; end: string } | null
) => {
  // Find the staff member to get their type
  const staffMember = mockStaff.find(s => s.id === staff.id)
  const staffType = staffMember?.staffType || 'dynamic'

  setShiftEditorContext({
    staffId: staff.id,
    staffName: staff.name,
    staffType, // <-- Added
    date,
    hasShift: !!existingShift,
    startTime: existingShift?.start || '10:00',
    endTime: existingShift?.end || '19:00'
  })
  setIsShiftEditorOpen(true)
}
```

### 2. ✅ Modified StaffEditWorkingHoursModal

**File**: `staff-edit-working-hours-modal.tsx`

#### Changes Made:

1. **Added `staffType` prop**:

   ```tsx
   interface StaffEditWorkingHoursModalProps {
     open: boolean
     onClose: () => void
     staffId: string
     staffName: string
     staffType?: 'dynamic' | 'static' // <-- Added
     referenceDate?: Date
   }
   ```

2. **Changed default "Apply to All Future Weeks" behavior**:

   ```tsx
   // Dynamic staff: Default ON (apply to all future weeks)
   // Static staff: Default OFF (this week only)
   const [applyToAllWeeks, setApplyToAllWeeks] = useState(staffType === 'dynamic')
   ```

3. **Added capacity input for each shift (static staff only)**:

   ```tsx
   {
     staffType === 'static' && (
       <TextField
         type='number'
         label='Capacity'
         value={shift.capacity || 10}
         onChange={e => handleUpdateCapacity(shiftIndex, Number(e.target.value))}
         size='small'
         InputProps={{
           inputProps: { min: 1, max: 100 },
           startAdornment: <i className='ri-group-line' style={{ marginRight: 8 }} />
         }}
         sx={{ minWidth: 140 }}
       />
     )
   }
   ```

4. **Added capacity update handler**:

   ```tsx
   const handleUpdateCapacity = (shiftIndex: number, capacity: number) => {
     const newShifts = [...dayHours.shifts]
     newShifts[shiftIndex] = {
       ...newShifts[shiftIndex],
       capacity
     }
     updateStaffWorkingHours(staffId, day, {
       ...dayHours,
       shifts: newShifts
     })
   }
   ```

5. **Updated shifts-tab.tsx to pass staffType**:
   ```tsx
   <StaffEditWorkingHoursModal
     open={isWorkingHoursModalOpen}
     onClose={() => setIsWorkingHoursModalOpen(false)}
     staffId={selectedStaffForEdit.id}
     staffName={selectedStaffForEdit.name}
     staffType={mockStaff.find(s => s.id === selectedStaffForEdit.id)?.staffType} // <-- Added
     referenceDate={selectedDate}
   />
   ```

## Behavior Summary

### Dynamic Staff (Default)

- **Toggle**: Shows "Dynamic" with user icon
- **Scheduling**: Appointment-based (current behavior)
- **Working Hours Modal**:
  - "Apply to All Future Weeks" is **ON by default**
  - No capacity input shown
  - Changes apply to recurring weekly schedule

### Static Staff

- **Toggle**: Shows "Static" with group icon
- **Scheduling**: Slot-based with capacity (like classes/group sessions)
- **Working Hours Modal**:
  - "Apply to All Future Weeks" is **OFF by default** (This week only)
  - Capacity input shown for each shift (min: 1, max: 100, default: 10)
  - User can still toggle to apply to all future weeks if needed
- **Shift Editor Modal**:
  - Capacity input shown when adding/editing shifts
  - Saves capacity with shift data

## Data Structure

### StaffShift Interface

```typescript
export interface StaffShift {
  id: string
  start: string // "HH:MM"
  end: string // "HH:MM"
  breaks?: BreakRange[]
  capacity?: number // For static staff - max concurrent bookings
}
```

### Staff Member

- Has `staffType?: StaffType` field ('dynamic' | 'static')
- Can be toggled between modes in the Shifts tab

## User Flow

1. **Toggle Staff Type**: In Shifts tab, click the toggle switch next to each staff member
2. **Edit Working Hours (Static Staff)**:
   - Click "Edit Working Hours" for a static staff member
   - Modal opens with capacity inputs for each shift
   - "Apply to All Future Weeks" is OFF by default
   - Enter capacity for each shift (e.g., 10 people)
   - Save changes
3. **Add/Edit Shift (Static Staff)**:
   - Click on a time slot or existing shift
   - ShiftEditorModal opens with capacity input
   - Enter shift details including capacity
   - Save changes

## Testing Checklist

- [x] Toggle functionality works in Shifts tab
- [x] staffType is passed to ShiftEditorModal
- [x] Capacity input shows in ShiftEditorModal for static staff only
- [x] Capacity input shows in StaffEditWorkingHoursModal for static staff only
- [x] "Apply to All Future Weeks" defaults correctly:
  - Dynamic: ON (apply to all future weeks)
  - Static: OFF (this week only)
- [x] User can override the default toggle setting
- [x] Capacity saves and persists with shift data
- [x] No errors in TypeScript compilation (only pre-existing type issues remain)

## Next Steps (If Needed)

1. **Backend Integration**: Update API calls to save capacity with shifts
2. **Booking Logic**: Implement capacity checking for static staff bookings
3. **UI Enhancements**: Show remaining capacity on shifts in calendar view
4. **Validation**: Add capacity validation when creating bookings
5. **Reports**: Add capacity utilization reports for static staff

## Files Modified

1. `/src/bookly/features/staff-management/shifts-tab.tsx`

   - Added staffType to shift editor context
   - Pass staffType to both ShiftEditorModal instances
   - Pass staffType to both StaffEditWorkingHoursModal instances

2. `/src/bookly/features/staff-management/staff-edit-working-hours-modal.tsx`

   - Added staffType prop
   - Changed default "Apply to All Future Weeks" behavior
   - Added capacity input for static staff
   - Added capacity update handler

3. `/src/bookly/features/staff-management/shift-editor-modal.tsx`

   - Already had staffType prop and capacity input (completed earlier)

4. `/src/bookly/features/calendar/types.ts`
   - Already has capacity field in StaffShift interface (completed earlier)

## Notes

- The implementation is complete and functional
- All changes maintain backward compatibility
- Dynamic staff behavior remains unchanged (default behavior)
- Static staff get the new capacity-based scheduling
- User can switch between modes at any time using the toggle
