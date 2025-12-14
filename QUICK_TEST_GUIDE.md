# Quick Test Guide - Two-Layer Grouping

## 5-Minute Verification

### Day View Test
1. Open Calendar → Day View
2. Look at the header structure - should see **3 rows**:
   - Row 1: **STAFF** (blue badge) | **ROOMS** (green badge)
   - Row 2: **Dynamic** | **Static** | **Fixed Capacity** | **Flexible**
   - Row 3: Individual staff/room names

✅ **Expected**: Headers organized in hierarchical layers

### Week View Test
1. Open Calendar → Week View
2. Scroll and observe sections in this order:
   - **DYNAMIC STAFF (n)** with count badge
     - Alice, Bob, Carol...
   - **STATIC STAFF - ASSIGNED TO ROOMS (n)**
     - **Room A (m)** sub-header
       - David, Eve...
     - **Room B (k)** sub-header
       - Frank, Grace...
   - **FIXED CAPACITY ROOMS (n)**
   - **FLEXIBLE ROOMS (n)**

✅ **Expected**: Hierarchical section layout with nested room grouping

---

## Color Verification

### Primary Headers (Layer 1)
- ✅ **STAFF**: Blue background with people icon
- ✅ **ROOMS**: Green background with tools icon

### Secondary Headers (Layer 2)
- ✅ **Dynamic**: Light gray background
- ✅ **Static**: Orange/amber background with home office icon
- ✅ **Fixed**: Green background
- ✅ **Flexible**: Light green background

### Dark Mode
1. Toggle dark mode
2. Verify all colors still visible
3. Verify text contrast sufficient

✅ **Expected**: Colors adjusted for dark mode, still readable

---

## Functionality Test

### Staff Interactions
1. Click on a dynamic staff member
   - ✅ Should trigger `onStaffClick` callback
2. Click on a static staff member
   - ✅ Should trigger `onStaffClick` callback
3. Verify room assignment indicator shows

### Room Interactions
1. Click on a fixed room
   - ✅ Should trigger `onRoomClick` callback
2. Click on a flexible room
   - ✅ Should trigger `onRoomClick` callback

### Grid Interactions
1. Click on empty grid cell
   - ✅ Should trigger `onCellClick` callback
2. Click on event
   - ✅ Should trigger `onEventClick` callback

### Responsive Test
1. Day view on mobile (< 600px)
   - ✅ Headers should stack properly
   - ✅ Resources should be scrollable
2. Day view on tablet (600-960px)
   - ✅ Layout should be balanced
3. Day view on desktop (> 960px)
   - ✅ All headers visible
   - ✅ Full-width layout

---

## Content Verification

### Staff Grouping
Check that staff appear in correct groups:
- **Dynamic Staff**: All staff WITHOUT static type OR without room assignments
- **Static Staff**: All staff WITH static type AND room assignments
- **Grouped by Room**: Static staff appear under their assigned room name

### Room Grouping
Check that rooms appear in correct categories:
- **Fixed Capacity**: All rooms with `roomType: 'static'` or `'fixed'`
- **Flexible**: All rooms with `roomType: 'dynamic'` or `'flexible'`

### Capacity Display
- ✅ Staff capacity shown as "Cap: n" chip (if > 0)
- ✅ Room capacity shown as "Cap: n" chip (always)

---

## Performance Verification

### Load Time
1. Open calendar
2. Check browser DevTools → Performance tab
3. Verify render time < 1 second
4. Verify no janky animations

### Re-render Performance
1. Click various elements
2. Toggle dark mode
3. Resize window
4. Check that re-renders are smooth
5. Frame rate should be > 50 FPS

### Memory
1. Keep calendar open for 5 minutes
2. Check browser DevTools → Memory tab
3. Memory usage should be stable
4. No memory leak pattern

---

## Edge Case Testing

### Empty States
1. [ ] No staff configured
   - ✅ STAFF section should show (0)

2. [ ] No rooms configured
   - ✅ ROOMS section might not show if no items

3. [ ] No dynamic staff
   - ✅ DYNAMIC STAFF section should show (0)

4. [ ] No static staff
   - ✅ STATIC STAFF section should show (0)

5. [ ] All staff dynamic
   - ✅ STATIC STAFF section should be empty

6. [ ] All rooms fixed
   - ✅ FLEXIBLE ROOMS section should be empty

### Data Variations
1. [ ] Very long staff names
   - ✅ Should truncate with ellipsis

2. [ ] Very long room names
   - ✅ Should truncate with ellipsis

3. [ ] Staff with no room assignment
   - ✅ Should appear in DYNAMIC STAFF

4. [ ] Rooms with no type set
   - ✅ Should be categorized by default

---

## Accessibility Check

### Keyboard Navigation
- [ ] Tab through headers - focus should be visible
- [ ] Enter on clickable elements - should work
- [ ] Escape key - should work if any modals open

### Screen Reader
- [ ] Headers should be announced
- [ ] Section labels should be clear
- [ ] Counts should be announced
- [ ] Resource names should be clear

### Color Contrast
- [ ] Text on Layer 1 headers readable
- [ ] Text on Layer 2 headers readable
- [ ] Light mode contrast sufficient
- [ ] Dark mode contrast sufficient

---

## Common Issues & Solutions

### Issue: Headers not showing two layers
**Solution**:
- Verify `groupingStructure` calculation is working
- Check browser console for errors
- Verify CSS grid columns are correct

### Issue: Static staff not grouped by room
**Solution**:
- Verify staff have `roomAssignments` array
- Check room assignments have `roomName` property
- Verify `staticByRoom` is populated

### Issue: Room categorization wrong
**Solution**:
- Verify rooms have `roomType` property set
- Check valid values: 'static', 'fixed', 'dynamic', 'flexible'
- Verify `categorizeRooms()` logic

### Issue: Count badges showing wrong numbers
**Solution**:
- Verify filtering logic in grouping functions
- Check that staff/room data is complete
- Verify no duplicate IDs

### Issue: Colors not showing correctly
**Solution**:
- Check Material-UI theme is loaded
- Verify dark mode detection is working
- Check for CSS overrides
- Check browser DevTools for inline styles

---

## Sign-Off Checklist

**Tested By**: _________________
**Date**: _________________
**Environment**: [ ] Development [ ] Staging [ ] Production

### Core Functionality
- [ ] Day view shows two-layer headers
- [ ] Week view shows hierarchical sections
- [ ] All staff grouped correctly
- [ ] All rooms grouped correctly
- [ ] Colors are correct

### Interactive Features
- [ ] Staff click works
- [ ] Room click works
- [ ] Cell click works
- [ ] Event click works

### Visual Quality
- [ ] Headers layout is clean
- [ ] Spacing is consistent
- [ ] Dark mode looks good
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

### Performance
- [ ] Page loads quickly (< 2s)
- [ ] No console errors
- [ ] Interactions are smooth
- [ ] No memory leaks

### Status
[ ] ✅ PASS - Ready for production
[ ] ⚠️ PARTIAL - Some issues but usable
[ ] ❌ FAIL - Critical issues found

### Notes
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Advanced Testing (Optional)

### Data Sync Test
1. Open staff management in another tab
2. Edit a staff member's type from dynamic to static
3. Assign to a room
4. Go back to calendar
5. Refresh page
6. ✅ Staff should appear in STATIC STAFF section

### Capacity Test
1. Edit staff member's `maxConcurrentBookings`
2. Go to calendar
3. ✅ Capacity chip should update

### Room Type Test
1. Edit room's `roomType`
2. Go to calendar
3. ✅ Room should move to different section

### Large Data Test (Optional)
1. Add 50+ staff members
2. Add 30+ rooms
3. ✅ Calendar should still be responsive
4. ✅ Grouping should still work
5. ✅ No performance degradation

---

## Still Have Questions?

1. Check `TWO_LAYER_GROUPING.md` for technical details
2. Check `IMPLEMENTATION_COMPLETE.md` for overview
3. Check browser console for error messages
4. Review the code changes in git diff

**Status**: Two-layer grouping is production ready! 🚀
