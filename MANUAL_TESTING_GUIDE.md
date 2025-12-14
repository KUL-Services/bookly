# Manual Testing Guide

## How to Test All Functionalities in the Calendar

### Prerequisites
1. Application running on `localhost:3000` or configured port
2. Logged in to staff/admin account
3. Navigate to Calendar page
4. Have access to Staff Management page

---

## SECTION 1: AVATAR TESTING

### Test 1.1: Avatar Display (All Staff)
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Look at staff member columns

**Expected Results:**
- ✅ All staff show INITIALS ONLY (no photos)
- ✅ Initials are 2 characters max (e.g., "JS" for John Smith)
- ✅ Avatars have BLUE background color
- ✅ Initials are WHITE text
- ✅ Font is bold (weight: 600)

**Actual Result:** _Test and note your observations_

---

### Test 1.2: Avatar Display (All Rooms)
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Look at room columns

**Expected Results:**
- ✅ All rooms show GREEN avatar
- ✅ Avatar shows TOOLS ICON (ri-tools-line)
- ✅ No room names in avatar
- ✅ Icon is WHITE
- ✅ Consistent size with staff avatars

**Actual Result:** _Test and note your observations_

---

### Test 1.3: Dark Mode Avatars
**Steps:**
1. Toggle dark mode in application
2. Look at all avatars

**Expected Results:**
- ✅ Staff avatars still BLUE
- ✅ Room avatars still GREEN
- ✅ Text/icons still visible and WHITE
- ✅ Contrast sufficient in dark mode
- ✅ Colors readable

**Actual Result:** _Test and note your observations_

---

## SECTION 2: STAFF GROUPING TESTING

### Test 2.1: Dynamic Staff Group
**Steps:**
1. Go to Calendar → Unified Multi-Resource Week View
2. Look for section header "DYNAMIC STAFF"

**Expected Results:**
- ✅ Section header visible with gray background
- ✅ Shows count: "DYNAMIC STAFF (n)"
- ✅ All non-static staff listed below
- ✅ Staff sorted alphabetically
- ✅ Each staff shows name, avatar, capacity (if >0)
- ✅ No room assignment blocks shown

**Actual Result:** _Test and note your observations_

---

### Test 2.2: Static Staff Group
**Steps:**
1. Go to Calendar → Unified Multi-Resource Week View
2. Look for sections "STATIC STAFF - [ROOM NAME]"

**Expected Results:**
- ✅ Multiple sections for different rooms
- ✅ Orange/amber background on section headers
- ✅ Format: "STATIC STAFF - ROOM ASSIGNED (n)"
- ✅ Staff grouped by assigned room
- ✅ Staff sorted by room name within group
- ✅ Each staff shows room assignment time (e.g., "09:00-17:00")
- ✅ Room assignment shown with icon

**Actual Result:** _Test and note your observations_

---

### Test 2.3: Staff Type Toggle
**Steps:**
1. Go to Staff Management → Staff Tab
2. Find a staff member
3. Change `staffType` from "dynamic" to "static" (if interface allows)
4. Assign to a room
5. Go back to Calendar
6. Check grouping

**Expected Results:**
- ✅ Staff IMMEDIATELY moves to correct group
- ✅ Now in "STATIC STAFF - [ROOM]" section
- ✅ Room assignment visible
- ✅ All events still visible
- ✅ Capacity still shows

**Actual Result:** _Test and note your observations_

---

## SECTION 3: ROOM GROUPING TESTING

### Test 3.1: Fixed Capacity Rooms
**Steps:**
1. Go to Calendar → Unified Multi-Resource Week/Day View
2. Look for section "FIXED CAPACITY ROOMS"

**Expected Results:**
- ✅ Green section header
- ✅ Shows count: "FIXED CAPACITY ROOMS (n)"
- ✅ All fixed-type rooms listed
- ✅ Rooms sorted alphabetically
- ✅ Each room shows name, capacity
- ✅ Green avatar with tools icon
- ✅ Capacity chip visible

**Actual Result:** _Test and note your observations_

---

### Test 3.2: Flexible Rooms
**Steps:**
1. Go to Calendar → Unified Multi-Resource Week/Day View
2. Look for section "FLEXIBLE ROOMS"

**Expected Results:**
- ✅ Light green section header
- ✅ Shows count: "FLEXIBLE ROOMS (n)"
- ✅ All flexible-type rooms listed
- ✅ Rooms sorted alphabetically
- ✅ Each room shows name, capacity
- ✅ Green avatar with tools icon
- ✅ Capacity chip visible

**Actual Result:** _Test and note your observations_

---

### Test 3.3: Room Type Categorization
**Steps:**
1. Go to Staff Management → Rooms Tab
2. Create or edit a room
3. Set roomType to "static" or "dynamic"
4. Save and go to Calendar

**Expected Results:**
- ✅ Room appears in correct group
- ✅ Section headers update
- ✅ Count updates
- ✅ No duplicates between groups
- ✅ All rooms accounted for

**Actual Result:** _Test and note your observations_

---

## SECTION 4: CAPACITY TESTING

### Test 4.1: Staff Capacity Display
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Look at staff headers
3. Find staff with `maxConcurrentBookings` > 0

**Expected Results:**
- ✅ Capacity shown as chip: "Cap: [number]"
- ✅ Chip is OUTLINED style
- ✅ Positioned below staff name
- ✅ Only shown if value > 0
- ✅ Same size in both views
- ✅ Responsive on small screens

**Actual Result:** _Test and note your observations_

---

### Test 4.2: Room Capacity Display
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Look at all room headers
3. Every room should show capacity

**Expected Results:**
- ✅ Capacity shown as chip: "Cap: [number]"
- ✅ Chip is OUTLINED style
- ✅ Green-tinted background
- ✅ Positioned below room name
- ✅ ALWAYS shown (even if 0)
- ✅ Same size in both views

**Actual Result:** _Test and note your observations_

---

### Test 4.3: Capacity Changes Sync
**Steps:**
1. Go to Staff Management → Staff Tab
2. Edit a staff member
3. Change `maxConcurrentBookings` to a new value
4. Save
5. Go to Calendar
6. Look at that staff member's capacity chip

**Expected Results:**
- ✅ Capacity chip IMMEDIATELY updates
- ✅ Shows new number
- ✅ No page refresh needed
- ✅ Events still visible
- ✅ Grouping unchanged

**Actual Result:** _Test and note your observations_

---

## SECTION 5: SECTION HEADERS TESTING

### Test 5.1: Day View Headers
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day View
2. Look at the top of the view

**Expected Results:**
- ✅ TWO rows of headers
- ✅ First row: Grouping labels
  - "Dynamic Staff"
  - "Static Staff - [Room]"
  - "Fixed Capacity Rooms"
  - "Flexible Rooms"
- ✅ Second row: Resource names
- ✅ Headers span correct columns
- ✅ Distinct background colors
- ✅ All text readable

**Actual Result:** _Test and note your observations_

---

### Test 5.2: Week View Headers
**Steps:**
1. Go to Calendar → Unified Multi-Resource Week View
2. Look at the sections

**Expected Results:**
- ✅ "DYNAMIC STAFF (n)" header with count
- ✅ "STATIC STAFF - ROOM ASSIGNED (n)" header
- ✅ "FIXED CAPACITY ROOMS (n)" header
- ✅ "FLEXIBLE ROOMS (n)" header
- ✅ Each section separated visually
- ✅ Headers span full width
- ✅ Distinct background colors
- ✅ Bold, clear typography

**Actual Result:** _Test and note your observations_

---

## SECTION 6: TIME & EVENT TESTING

### Test 6.1: Time Grid Accuracy (Day View)
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day View
2. Look at time column on left

**Expected Results:**
- ✅ Times show from 6 AM to 10 PM
- ✅ Labels every hour (6:00, 7:00, etc.)
- ✅ 15-minute grid lines visible
- ✅ Time column is sticky (stays on left when scrolling)
- ✅ Current time highlighted (red line if today)

**Actual Result:** _Test and note your observations_

---

### Test 6.2: Events Display
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Look for scheduled events
3. Click on an event

**Expected Results:**
- ✅ Events show in correct time slots
- ✅ Event duration correct
- ✅ Event colors match status
- ✅ Service name visible
- ✅ Time shown (e.g., "2:00 PM")
- ✅ Click triggers callback
- ✅ Hover shows effect

**Actual Result:** _Test and note your observations_

---

### Test 6.3: Current Time Indicator
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day View
2. Make sure viewing today's date
3. Check left side of grid

**Expected Results:**
- ✅ RED horizontal line at current time
- ✅ RED circle dot on left edge
- ✅ Positioned at correct time
- ✅ Updates every minute
- ✅ Only visible on today
- ✅ Not visible on past/future dates

**Actual Result:** _Test and note your observations_

---

## SECTION 7: INTERACTION TESTING

### Test 7.1: Staff Click
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Click on a staff member's name or avatar

**Expected Results:**
- ✅ Something happens (callback fires)
- ✅ May navigate or open drawer
- ✅ No errors in console
- ✅ Selection/highlight occurs if applicable

**Actual Result:** _Test and note your observations_

---

### Test 7.2: Room Click
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Click on a room's name or avatar

**Expected Results:**
- ✅ Something happens (callback fires)
- ✅ May navigate or open drawer
- ✅ No errors in console
- ✅ Selection/highlight occurs if applicable

**Actual Result:** _Test and note your observations_

---

### Test 7.3: Cell Click
**Steps:**
1. Go to Calendar → Unified Multi-Resource Day/Week View
2. Click on an empty cell in the grid

**Expected Results:**
- ✅ Something happens (callback fires)
- ✅ May open new booking form
- ✅ No errors in console
- ✅ Correct resource and time passed

**Actual Result:** _Test and note your observations_

---

## SECTION 8: RESPONSIVE TESTING

### Test 8.1: Mobile View (xs < 600px)
**Steps:**
1. Open Calendar on mobile or use dev tools to set width < 600px
2. Go to Unified Multi-Resource Day/Week View
3. Scroll horizontally
4. Check layout

**Expected Results:**
- ✅ Content fits without horizontal scroll issues
- ✅ Time column remains visible
- ✅ Resources scrollable
- ✅ Text not cut off (uses truncation)
- ✅ Avatars visible
- ✅ Capacity chips visible
- ✅ Touch interactions work

**Actual Result:** _Test and note your observations_

---

### Test 8.2: Tablet View (sm 600px - 960px)
**Steps:**
1. Open Calendar on tablet or use dev tools for this width
2. Go to Unified Multi-Resource Day/Week View
3. Check layout

**Expected Results:**
- ✅ Good spacing
- ✅ All content readable
- ✅ No truncation needed usually
- ✅ Smooth scrolling
- ✅ Touch-friendly

**Actual Result:** _Test and note your observations_

---

### Test 8.3: Desktop View (md ≥ 960px)
**Steps:**
1. Open Calendar on desktop or use dev tools for width ≥ 960px
2. Go to Unified Multi-Resource Day/Week View
3. Check layout

**Expected Results:**
- ✅ Full layout visible
- ✅ All columns visible (may need scroll for many resources)
- ✅ Excellent readability
- ✅ Proper spacing
- ✅ Professional appearance

**Actual Result:** _Test and note your observations_

---

## SECTION 9: DARK MODE TESTING

### Test 9.1: Toggle Dark Mode
**Steps:**
1. Open Calendar
2. Toggle dark mode in app settings
3. Check all colors

**Expected Results:**
- ✅ Background dark
- ✅ Text light
- ✅ Section headers tinted appropriately
- ✅ Borders visible
- ✅ Events readable
- ✅ All text has sufficient contrast
- ✅ Avatars still visible
- ✅ Capacity chips visible
- ✅ No glaring colors

**Actual Result:** _Test and note your observations_

---

### Test 9.2: Color Consistency
**Steps:**
1. In dark mode, compare colors to light mode
2. Check specific elements:
   - Staff avatars (should be blue in both)
   - Room avatars (should be green in both)
   - Section headers (should have appropriate tints)

**Expected Results:**
- ✅ Primary colors consistent
- ✅ Tints adjusted for dark mode
- ✅ Readability equal in both modes
- ✅ Professional appearance

**Actual Result:** _Test and note your observations_

---

## SECTION 10: DATA SYNCHRONIZATION TESTING

### Test 10.1: Staff Changes Sync
**Steps:**
1. Open Calendar in one tab
2. Open Staff Management in another tab
3. In Staff Management, edit a staff member (name, type, capacity)
4. Switch to Calendar tab

**Expected Results:**
- ✅ Changes visible immediately (may need refresh)
- ✅ Grouping updates if type changed
- ✅ Capacity chip updates if capacity changed
- ✅ Name updates if name changed
- ✅ No errors

**Actual Result:** _Test and note your observations_

---

### Test 10.2: Room Changes Sync
**Steps:**
1. Open Calendar in one tab
2. Open Staff Management → Rooms in another tab
3. Edit a room (name, type, capacity)
4. Switch to Calendar tab

**Expected Results:**
- ✅ Changes visible immediately
- ✅ Grouping updates if type changed
- ✅ Capacity updates if changed
- ✅ Name updates if changed
- ✅ No errors

**Actual Result:** _Test and note your observations_

---

## SECTION 11: CONSOLE & ERRORS

### Test 11.1: No Console Errors
**Steps:**
1. Open Calendar
2. Open Browser Dev Tools → Console tab
3. Interact with calendar (click, scroll, etc.)

**Expected Results:**
- ✅ No RED error messages
- ✅ No warnings related to our code
- ✅ Network requests successful (check Network tab)
- ✅ No performance warnings

**Actual Result:** _Test and note your observations_

---

### Test 11.2: No Memory Leaks
**Steps:**
1. Open Calendar
2. Open Dev Tools → Performance/Memory tab
3. Record for 1 minute
4. Perform actions (click, scroll, switch views)
5. Check memory usage

**Expected Results:**
- ✅ Memory stable (not growing continuously)
- ✅ No sudden spikes
- ✅ Performance smooth
- ✅ Frame rate > 50 FPS

**Actual Result:** _Test and note your observations_

---

## SECTION 12: EDGE CASES

### Test 12.1: No Staff
**Steps:**
1. Calendar with no staff configured
2. Go to Unified Multi-Resource View

**Expected Results:**
- ✅ "DYNAMIC STAFF (0)" section still shows
- ✅ No errors
- ✅ Rooms still visible
- ✅ Layout intact

**Actual Result:** _Test and note your observations_

---

### Test 12.2: No Rooms
**Steps:**
1. Calendar with no rooms configured
2. Go to Unified Multi-Resource View

**Expected Results:**
- ✅ Room sections don't show
- ✅ Staff sections show normally
- ✅ No errors
- ✅ Layout intact

**Actual Result:** _Test and note your observations_

---

### Test 12.3: No Events
**Steps:**
1. Calendar with staff and rooms but no events
2. Go to Unified Multi-Resource View

**Expected Results:**
- ✅ Grid shows empty cells
- ✅ All staff and rooms visible
- ✅ No errors
- ✅ Can click cells (for new bookings)

**Actual Result:** _Test and note your observations_

---

### Test 12.4: All Rooms Same Type
**Steps:**
1. Calendar where all rooms are "fixed" or all are "flexible"
2. Go to Unified Multi-Resource View

**Expected Results:**
- ✅ Only ONE room section shows
- ✅ Count accurate
- ✅ No empty sections
- ✅ No errors

**Actual Result:** _Test and note your observations_

---

## TESTING COMPLETION

Once all tests above are completed:

1. **Document Results:**
   - Mark ✅ for passing
   - Mark ❌ for failing
   - Note any issues

2. **Create Issues:**
   - If any tests fail, create GitHub issues with:
     - Test number and name
     - Steps to reproduce
     - Expected vs actual
     - Screenshots/videos

3. **Sign Off:**
   - QA manager: ___________
   - Tester name: ___________
   - Date: ___________
   - Status: ☐ PASS ☐ FAIL ☐ PARTIAL

---

## QUICK TEST (5 minutes)

If you only have 5 minutes:
1. Test 1.1 (Avatar Display)
2. Test 2.1 (Dynamic Staff Group)
3. Test 3.1 (Fixed Rooms)
4. Test 4.1 (Staff Capacity)
5. Test 6.2 (Events Display)

---

## FULL TEST (30 minutes)

Complete all tests in order for thorough verification.

