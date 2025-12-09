# Dynamic vs Static Staff Implementation

**Date**: December 8, 2025  
**Status**: 🚧 **IN PROGRESS**

---

## 🎯 Feature Overview

Add the ability to toggle staff between **Dynamic** and **Static** scheduling modes in the Shifts tab.

### Key Differences

| Feature             | Dynamic Staff                       | Static Staff                      |
| ------------------- | ----------------------------------- | --------------------------------- |
| **Scheduling**      | Appointment-based                   | Slot-based with capacity          |
| **Capacity**        | Per-shift capacity                  | Each shift has capacity           |
| **Weekly Template** | Apply to all future weeks (default) | Apply to this week only (default) |
| **Use Case**        | Traditional 1-on-1 services         | Classes, group sessions           |

---

## 📋 Requirements

### 1. Toggle UI in Shifts Tab

- Add a toggle switch next to each staff member's name
- Visual indicator: "Dynamic" (blue) or "Static" (green)
- Persist toggle state to store

### 2. Capacity Input for Static Staff

- Show capacity input in:
  - `ShiftEditorModal` (single day shift editing)
  - `StaffEditWorkingHoursModal` (weekly hours editing)
- Only visible when staff is Static
- Default capacity: 10 people

### 3. Modified Default Behavior for Static Staff

- **Apply to Future Weeks**: Default OFF for static staff
- **Apply to Future Weeks**: Default ON for dynamic staff
- User can still override the default

---

## 🔧 Implementation Steps

### Step 1: Update Store

- Add `updateStaffType(staffId, staffType)` action
- Get staff type from store or mockStaff

### Step 2: Add Toggle UI

- Add toggle in staff row (Day view and Week view)
- Show "Dynamic" or "Static" label with icon
- Update on toggle change

### Step 3: Modify ShiftEditorModal

- Accept `staffType` prop
- Show capacity input when `staffType === 'static'`
- Save capacity with shift data

### Step 4: Modify StaffEditWorkingHoursModal

- Accept `staffType` prop
- Show capacity input for each shift when static
- Default "Apply to All Future Weeks" to OFF for static staff

### Step 5: Update Types

- ✅ Already added `capacity?: number` to `StaffShift`
- ✅ `StaffMember` already has `staffType?: StaffType`

---

## 📐 Component Changes

### `shifts-tab.tsx`

**Add:**

- State for tracking staff types
- Toggle switch component in staff rows
- Pass `staffType` to modals

### `shift-editor-modal.tsx`

**Add:**

- `staffType` prop
- Conditional capacity input
- Save capacity with shift

### `staff-edit-working-hours-modal.tsx`

**Add:**

- `staffType` prop
- Capacity input for each shift
- Change default "Apply to All Future Weeks" based on staffType

### `staff-store.ts`

**Add:**

- `updateStaffType(staffId, staffType)` action
- Store staff types in state

---

## 🎨 UI Design

### Toggle Switch in Staff Row

```
┌─────────────────────────────────────────┐
│ Emma Johnson              🔘 Dynamic ⋮  │
│ W 45h/45h  M 149h 45min                │
└─────────────────────────────────────────┘
```

### Capacity Input (Static Staff Only)

```
┌──────────────────────────────────┐
│ Shift 1                          │
│ ┌──────┐ — ┌──────┐  ⏱ 8h      │
│ │ 9:00 │   │ 17:00│              │
│ └──────┘   └──────┘              │
│                                   │
│ Capacity (people)                │
│ ┌─────────────────────┐          │
│ │ 10                  │          │
│ └─────────────────────┘          │
└──────────────────────────────────┘
```

---

## ✅ Testing Checklist

### Toggle Functionality

- [ ] Toggle appears for each staff member
- [ ] Toggle state persists when switching views
- [ ] Toggle updates immediately
- [ ] Correct label shows (Dynamic/Static)

### Capacity Input

- [ ] Capacity field shows for static staff in shift editor
- [ ] Capacity field shows for static staff in working hours modal
- [ ] Capacity saves correctly
- [ ] Default capacity is 10
- [ ] Capacity validation (min 1, max reasonable number)

### Default Behavior

- [ ] Dynamic staff: "Apply to All Future Weeks" defaults ON
- [ ] Static staff: "Apply to All Future Weeks" defaults OFF
- [ ] User can override default
- [ ] Override persists during session

---

## 🔄 Data Flow

```
User toggles Dynamic/Static
    ↓
updateStaffType(staffId, 'static')
    ↓
Store updates staff type
    ↓
UI refreshes with new mode
    ↓
User edits shifts
    ↓
Capacity input shows (if static)
    ↓
Save includes capacity data
```

---

## 📝 Code Examples

### Toggle Component

```tsx
<FormControlLabel
  control={
    <Switch
      checked={staff.staffType === 'static'}
      onChange={e => handleStaffTypeToggle(staff.id, e.target.checked ? 'static' : 'dynamic')}
      size='small'
    />
  }
  label={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <i className={staff.staffType === 'static' ? 'ri-group-line' : 'ri-user-line'} style={{ fontSize: 12 }} />
      <Typography variant='caption' fontSize='0.65rem'>
        {staff.staffType === 'static' ? 'Static' : 'Dynamic'}
      </Typography>
    </Box>
  }
  sx={{ ml: 0, mr: 1 }}
/>
```

### Capacity Input

```tsx
{
  staffType === 'static' && (
    <TextField
      type='number'
      label='Capacity (people)'
      value={capacity || 10}
      onChange={e => setCapacity(Number(e.target.value))}
      size='small'
      fullWidth
      InputProps={{
        inputProps: { min: 1, max: 100 }
      }}
      helperText='Maximum number of concurrent bookings for this shift'
    />
  )
}
```

---

## 🎉 Expected Outcome

Staff members can be toggled between Dynamic and Static modes, with:

- Different UI/UX for capacity management
- Appropriate default behaviors
- Clear visual indicators
- Persistent state management

---

## 📞 Next Steps

1. ✅ Update types (already done)
2. 🚧 Add toggle UI in shifts tab
3. ⏳ Modify shift editor modal
4. ⏳ Modify working hours modal
5. ⏳ Add store actions
6. ⏳ Test all functionality
