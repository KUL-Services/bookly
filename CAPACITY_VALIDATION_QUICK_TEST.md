# Capacity Validation - Quick Test Guide

**Time Required**: 3-5 minutes  
**Feature**: Prevent adding clients when slot reaches maximum capacity

---

## Quick Test Steps

### Test 1: Fill Slot to Capacity (2 minutes)

1. **Open Calendar**

   - Navigate to the calendar view
   - Look for appointments with static staff (Sarah Williams, Lisa Chen, Ryan Thompson, or Amanda White)

2. **Click on Static Slot**

   - Click any appointment for static staff
   - Booking drawer opens with slot management interface

3. **Check Current Capacity**

   - Look for "Capacity Status" section (color-coded box)
   - Note current capacity (e.g., "15/20" means 5 spots available)

4. **Add Clients**

   - Click "Add Client to Slot" button
   - Enter client details (name required)
   - Click "Add Client to Slot" in the form
   - Repeat until capacity shows "0/20"

5. **Verify Button Disabled** ✅
   - Button should now be disabled (grayed out)
   - Text should read: "Slot Full - Cannot Add Clients"
   - Button cannot be clicked

---

### Test 2: Validation Error (1 minute)

**Note**: This test is only possible if you bypass the disabled button in code (for testing purposes).

1. **At Full Capacity**

   - Slot shows "0/20" capacity
   - Button is disabled

2. **Attempt to Add** (if you could bypass UI)
   - Try to add a client through code/console
   - Error should appear: "Cannot add client: Slot is at maximum capacity"
   - Client should NOT be added to list

---

### Test 3: Remove & Re-add (1 minute)

1. **Remove One Client**

   - In a full slot (0/20), click "Remove" on any client
   - Capacity updates to "1/20"

2. **Verify Button Enabled** ✅

   - Button should now be enabled
   - Text should read: "Add Client to Slot"
   - Button should be clickable again

3. **Add Client Again**
   - Click button and add a new client
   - Slot returns to "0/20"
   - Button becomes disabled again

---

## Visual Checklist

### When Slot Has Available Capacity

- [ ] Capacity box is green or yellow
- [ ] "X spots remaining" shows number > 0
- [ ] "Add Client to Slot" button is enabled
- [ ] Button text is "Add Client to Slot"
- [ ] Can click button to open form

### When Slot is at Maximum Capacity

- [ ] Capacity box is red
- [ ] "0 spots remaining" is displayed
- [ ] "Add Client to Slot" button is disabled (grayed out)
- [ ] Button text is "Slot Full - Cannot Add Clients"
- [ ] Cannot click button

---

## Color Code Reference

| Capacity        | Color     | Status  |
| --------------- | --------- | ------- |
| > 30% available | 🟢 Green  | Healthy |
| < 30% available | 🟡 Yellow | Low     |
| 0 available     | 🔴 Red    | Full    |

---

## Expected Results

✅ **Pass Criteria**:

- Button disabled when at capacity
- Button text changes to indicate full status
- Cannot add clients when slot is full
- Error message appears if validation fails
- Button re-enables when client is removed

❌ **Fail Criteria**:

- Can add clients when at capacity
- Button remains enabled when full
- No error message shown
- Capacity exceeds maximum (e.g., 21/20)

---

## Quick Debug

If tests fail, check:

1. Are you clicking on a **static staff** appointment? (Sarah, Lisa, Ryan, or Amanda)
2. Is the drawer showing slot management UI (with client list)?
3. Does the capacity display show "X/20" format?
4. Check browser console for errors

---

## Success ✅

If all three tests pass:

- ✅ Capacity validation is working correctly
- ✅ UI prevents overbooking
- ✅ Error handling is functional
- ✅ Feature is ready for use
