# Quick Testing Guide - Static Slot Detection Fix

## 🎯 Quick Test (2 minutes)

### Test Static Staff Appointment

1. **Open calendar** in Day or Week view
2. **Find an appointment** for a staff member with `staffType: 'static'`
3. **Click on the appointment**
4. **Expected Result**: Modal opens showing:
   - ✅ "Capacity Status" section at top
   - ✅ "Client List" with editable fields
   - ✅ "Add Client" button
   - ✅ Each client has status dropdown
   - ✅ Each client has arrival time picker

### Test Fixed/Static Room Booking

1. **Switch to static/fixed scheduling mode** (if not already)
2. **Find a room booking** in the calendar
3. **Click on the booking**
4. **Expected Result**: Same as above - static slot UI with client list

### Test Dynamic Staff Appointment (Should Still Work)

1. **Find an appointment** for a staff member with `staffType: 'dynamic'`
2. **Click on the appointment**
3. **Expected Result**: Modal opens showing:
   - ✅ Read-only booking details
   - ✅ Editable status dropdown
   - ✅ Star/favorite checkbox
   - ❌ NO client list (this is correct)
   - ❌ NO capacity display (this is correct)

---

## 🔍 Where to Find Static Staff in Mock Data

Look for staff members with this property:

```typescript
{
  staffType: 'static' // This makes them a static/class instructor
}
```

Common examples:

- Yoga instructors
- Fitness class leaders
- Workshop facilitators
- Group session hosts

---

## 🔍 Where to Find Fixed Rooms

Look for rooms with this property:

```typescript
{
  roomType: 'static' // Fixed capacity, group bookings
}
```

Common examples:

- Yoga studio
- Spin class room
- Workshop room
- Training facility

---

## ✅ Success Criteria

### Static Slot Opens Correctly

- [ ] Capacity shows (e.g., "15/20")
- [ ] Client list is visible
- [ ] Can edit each client's status
- [ ] Can edit each client's arrival time
- [ ] Can add new clients
- [ ] Can remove clients

### Dynamic Appointment Still Works

- [ ] Shows read-only booking info
- [ ] Can edit status
- [ ] Can toggle starred
- [ ] Does NOT show client list

---

## 🐛 If It Doesn't Work

### Check 1: Staff Type

```typescript
// In browser console or mock-data.ts
mockStaff.find(s => s.id === 'STAFF_ID_HERE')?.staffType
// Should return 'static' or 'dynamic'
```

### Check 2: Event Properties

```typescript
// When clicking appointment, check:
existingEvent?.extendedProps?.staffId
// Should match a staff member in mockStaff
```

### Check 3: Console Logs

Add temporary logging:

```typescript
console.log('Staff Type:', eventStaff?.staffType)
console.log('Is Static:', isStaticSlotEvent)
console.log('Effective Mode:', effectiveSchedulingMode)
```

---

## 📋 Detailed Test Checklist

### Static Slot - View Mode

- [ ] Opens modal on click
- [ ] Shows slot date and time
- [ ] Shows service name
- [ ] Shows capacity with color coding
- [ ] Lists all booked clients
- [ ] Each client shows name, email, phone
- [ ] Each client shows booking timestamp

### Static Slot - Edit Status

- [ ] Can change client status to "Confirmed"
- [ ] Can change client status to "No Show"
- [ ] Can change client status to "Completed"
- [ ] Status dropdown reflects current value
- [ ] Multiple clients can have different statuses

### Static Slot - Edit Arrival

- [ ] Can set arrival time for each client
- [ ] Time picker shows 15-minute intervals
- [ ] Time picker shows 12-hour format (AM/PM)
- [ ] Each client can have different arrival time
- [ ] Arrival time persists on save

### Static Slot - Add Client

- [ ] "Add Client" button visible when capacity available
- [ ] Can enter client name (required)
- [ ] Can enter client email (optional)
- [ ] Can enter client phone (optional)
- [ ] New client appears in list after adding
- [ ] Capacity count decreases after adding
- [ ] Cannot add when at full capacity

### Static Slot - Remove Client

- [ ] Each client has "Remove" button
- [ ] Client is removed from list on click
- [ ] Capacity count increases after removing
- [ ] Can re-add client after removing
- [ ] Removal persists on save

### Dynamic Appointment - View Mode

- [ ] Opens modal on click
- [ ] Shows booking reference number
- [ ] Shows client details (read-only)
- [ ] Shows service with price and duration
- [ ] Shows staff name
- [ ] Shows date and time
- [ ] Shows "Requested by client" checkbox (disabled)

### Dynamic Appointment - Edit Mode

- [ ] Can edit status
- [ ] Can toggle starred/favorites
- [ ] Cannot edit client details
- [ ] Cannot edit service
- [ ] Cannot edit staff
- [ ] Cannot edit date/time
- [ ] Save button works
- [ ] Cancel button works

---

## 🎯 Quick Verification Commands

### Check Staff Types

```bash
# In terminal, search for static staff
grep -r "staffType.*static" src/bookly/data/mock-data.ts
```

### Check Room Types

```bash
# Search for static/fixed rooms
grep -r "roomType.*static" src/bookly/data/mock-data.ts
```

---

## 📊 Expected Results Summary

| Appointment Type | Scheduling Mode   | Opens As        | Client List | Editable       |
| ---------------- | ----------------- | --------------- | ----------- | -------------- |
| Static Staff     | Dynamic or Static | **Static Slot** | ✅ Yes      | ✅ Full Edit   |
| Fixed Room       | Static            | **Static Slot** | ✅ Yes      | ✅ Full Edit   |
| Dynamic Staff    | Dynamic           | Dynamic Appt    | ❌ No       | ⚠️ Status Only |
| Dynamic Room     | Dynamic           | Dynamic Appt    | ❌ No       | ⚠️ Status Only |

---

## 🚀 Quick Start Testing

**One-liner test:**

```
1. Open calendar → 2. Click any class/group appointment → 3. See client list ✓
```

**Expected:** Modal shows "Capacity" and "Client List" sections  
**Time:** < 30 seconds to verify

---

## 💡 Pro Tips

1. **Look for classes**: Yoga, Spin, Bootcamp classes are usually static
2. **Check group events**: Multiple people in one timeslot = static
3. **Capacity indicator**: If you see "X/Y" anywhere, it's static
4. **Individual appointments**: One-on-one bookings are usually dynamic

---

**Status**: ✅ Ready to test  
**Estimated Test Time**: 2-5 minutes  
**Confidence Level**: High (detection logic is robust)
