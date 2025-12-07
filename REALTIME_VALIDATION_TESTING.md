# Real-Time Shift Validation - Testing Guide

**Date**: December 7, 2025  
**Feature**: Real-time shift overlap validation with visual warnings

---

## Quick Test Instructions

### 🧪 Test 1: Staff Working Hours Modal - Basic Overlap

1. **Open the application**
2. Navigate to **Staff Management** → **Shifts** tab
3. Click any staff member's edit icon (✏️)
4. Select **"EDIT WORKING HOURS"** from the menu

5. **Create an overlap on Monday:**

   - Ensure Monday is enabled (toggle ON)
   - Set Shift 1: `9:00 AM` to `5:00 PM`
   - Click **"Add Another Shift"**
   - Set Shift 2: `3:00 PM` to `9:00 PM` ← **Overlaps with Shift 1!**

6. **Expected Results:**

   - ⚠️ Red warning box appears below "Add Another Shift" button
   - Warning shows: "Overlapping Shifts Detected"
   - Details: "Shift 1 and Shift 2 have overlapping times"
   - **SAVE button is DISABLED** (grayed out)

7. **Fix the overlap:**
   - Change Shift 2 start time to `5:00 PM`
   - Warning should disappear immediately
   - SAVE button should become enabled

---

### 🧪 Test 2: Staff Working Hours Modal - Invalid Time Range

1. Continue in the same modal
2. **Create invalid time range on Tuesday:**

   - Enable Tuesday
   - Set Shift 1: `9:00 AM` to `8:00 AM` ← **End before start!**

3. **Expected Results:**

   - ⚠️ Red warning appears under Tuesday's shifts
   - Warning: "Shift 1: End time must be after start time"
   - SAVE button disabled

4. **Fix the issue:**
   - Change end time to `5:00 PM`
   - Warning disappears
   - SAVE button enabled

---

### 🧪 Test 3: Staff Working Hours Modal - Multiple Days

1. Continue in the same modal
2. **Create overlaps on multiple days:**

   - Monday: Add overlapping shifts (9-5, 3-9)
   - Wednesday: Add non-overlapping shifts (9-1, 2-6)

3. **Expected Results:**

   - Warning appears only under Monday
   - Wednesday shows no warning (shifts are valid)
   - SAVE button still disabled (Monday has conflicts)

4. **Fix Monday only:**
   - Adjust Monday shifts to not overlap
   - Both days now valid
   - SAVE button enabled

---

### 🧪 Test 4: Room Schedule Editor - Basic Overlap

1. Navigate to **Staff Management** → **Rooms** tab (if available)
   - Or access via room scheduling feature
2. Open **Room Schedule Editor** for any room
3. Select a day (e.g., Monday)
4. Enable "Room Available on Mon"

5. **Create overlapping shifts:**

   - Add Shift 1: `9:00 AM` to `5:00 PM`
   - Click **"Add Shift"**
   - Add Shift 2: `4:00 PM` to `8:00 PM` ← **Overlaps!**

6. **Expected Results:**

   - ⚠️ Red warning box appears between shifts and tip box
   - Warning: "Overlapping Shifts Detected"
   - Details: "Shift 1 and Shift 2 have overlapping times"
   - **"Save Schedule" button DISABLED**

7. **Fix the overlap:**
   - Change Shift 2 to start at `5:00 PM`
   - Warning disappears
   - Save button enabled

---

### 🧪 Test 5: Room Schedule Editor - Three Shifts

1. Continue in Room Schedule Editor
2. **Add three shifts with various conflicts:**

   - Shift 1: `9:00 AM` to `1:00 PM`
   - Shift 2: `12:00 PM` to `5:00 PM` ← **Overlaps with Shift 1**
   - Shift 3: `4:30 PM` to `9:00 PM` ← **Overlaps with Shift 2**

3. **Expected Results:**

   - ⚠️ Warning shows both conflicts:
     - "Shift 1 and Shift 2 have overlapping times"
     - "Shift 2 and Shift 3 have overlapping times"
   - Save button disabled

4. **Fix all overlaps:**
   - Adjust Shift 2: `1:00 PM` to `4:30 PM`
   - Now all three shifts are valid (9-1, 1-4:30, 4:30-9)
   - Warning disappears
   - Save button enabled

---

## Visual Verification Checklist

### Warning Box Appearance

- [ ] Background: Light red (error.50)
- [ ] Border: 1px solid red (error.main)
- [ ] Icon: ⚠️ Warning icon in red
- [ ] Text: Bold heading "Overlapping Shifts Detected"
- [ ] Details: List of specific conflicts
- [ ] Layout: Icon on left, text on right

### Button States

- [ ] Save button disabled when overlaps exist
- [ ] Button appears grayed out (reduced opacity)
- [ ] Tooltip or visual indication that it's disabled
- [ ] Save button re-enables when overlaps fixed

### User Interaction

- [ ] Warning updates immediately as user changes times
- [ ] No lag or delay in validation
- [ ] Warning disappears as soon as conflict resolved
- [ ] No console errors during interaction

---

## Edge Cases to Test

### Edge Case 1: Adjacent Shifts (Not Overlapping)

- Shift 1: `9:00 AM` to `1:00 PM`
- Shift 2: `1:00 PM` to `5:00 PM`
- **Expected**: No warning (end of 1 = start of 2 is OK)

### Edge Case 2: Multiple Overlaps Same Shift

- Shift 1: `9:00 AM` to `3:00 PM`
- Shift 2: `10:00 AM` to `2:00 PM` (contained in Shift 1)
- Shift 3: `1:00 PM` to `4:00 PM` (overlaps both)
- **Expected**: Multiple warnings shown

### Edge Case 3: Same Start Time

- Shift 1: `9:00 AM` to `5:00 PM`
- Shift 2: `9:00 AM` to `1:00 PM`
- **Expected**: Warning (same start = overlap)

### Edge Case 4: Exact Same Shift

- Shift 1: `9:00 AM` to `5:00 PM`
- Shift 2: `9:00 AM` to `5:00 PM`
- **Expected**: Warning (complete overlap)

---

## Browser Compatibility

Test in:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Performance Test

1. Add 5+ shifts to a single day
2. Edit shift times rapidly
3. **Verify:**
   - [ ] No lag in UI updates
   - [ ] Warning appears/disappears smoothly
   - [ ] No console warnings or errors
   - [ ] Save button state updates correctly

---

## Accessibility Test

- [ ] Warning message readable by screen readers
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works (Tab through fields)
- [ ] Save button properly indicates disabled state
- [ ] Error icon has proper aria-label

---

## Integration Test

### With Existing Features:

1. **Business Hours Validation** (save-time only)

   - Staff shifts outside business hours still work
   - Real-time validation only for overlaps

2. **Break System**

   - Breaks within shifts still function
   - Adding breaks doesn't trigger overlap warning

3. **Time Off**

   - Time off requests unaffected
   - Shift validation independent of time off

4. **Bulk Edit**
   - Bulk operations still work
   - Validation applies to each staff individually

---

## Regression Test

Ensure these still work:

- [ ] Saving valid shifts (no overlaps)
- [ ] Adding/removing breaks
- [ ] Toggling working days on/off
- [ ] Switching between "All Weeks" and "This Week Only"
- [ ] Closing modal without saving
- [ ] Business hours editing
- [ ] Room service assignments

---

## Success Criteria

### ✅ All Tests Pass When:

1. Warning appears **immediately** when overlap created
2. Warning shows **specific** conflict information
3. Save button **disabled** with overlaps present
4. Warning **disappears** when conflict resolved
5. Save button **re-enables** automatically
6. Visual style **matches** existing error patterns
7. **No breaking changes** to existing features
8. **Smooth** user experience (no lag/flicker)

---

## Known Limitations

1. **Pre-existing TypeScript errors** in parent file (not from our changes)
2. **Business Hours Modal** has save-time validation only (not real-time)
3. **Break overlap validation** not implemented (future enhancement)
4. **Performance** with 10+ shifts per day not tested

---

## Troubleshooting

### Issue: Warning doesn't appear

- **Check**: Are there actually overlapping shifts?
- **Check**: Is this Staff/Room modal (not Business Hours)?
- **Fix**: Refresh page, try again

### Issue: Save button doesn't disable

- **Check**: Browser console for errors
- **Check**: Multiple days might have issue in Staff modal
- **Fix**: Check validation logic in browser DevTools

### Issue: Warning doesn't disappear

- **Check**: Are shifts truly non-overlapping?
- **Check**: Time format correct (HH:MM)?
- **Fix**: Try setting times with more gap between shifts

---

## Testing Checklist Summary

- [ ] Test 1: Basic overlap - Staff modal ✓
- [ ] Test 2: Invalid time range ✓
- [ ] Test 3: Multiple days ✓
- [ ] Test 4: Basic overlap - Room modal ✓
- [ ] Test 5: Three shifts with conflicts ✓
- [ ] Visual verification ✓
- [ ] Edge cases (4 scenarios) ✓
- [ ] Browser compatibility ✓
- [ ] Performance test ✓
- [ ] Accessibility test ✓
- [ ] Integration test ✓
- [ ] Regression test ✓

---

**Total Tests**: 12 core + 4 edge cases + 7 integration checks = **23 test scenarios**

**Estimated Testing Time**: 30-45 minutes for complete validation

**Priority Tests** (if time limited):

1. Test 1 (Basic overlap - Staff)
2. Test 4 (Basic overlap - Room)
3. Visual verification
4. Regression test (existing features work)

---

## Next Steps After Testing

1. ✅ If all tests pass → Feature complete
2. 🐛 If bugs found → Document and fix
3. 📝 Update documentation with any findings
4. 🚀 Ready for user acceptance testing (UAT)

---

**Document Version**: 1.0  
**Last Updated**: December 7, 2025  
**Status**: Ready for Testing
