# Staff Grouping Visual Guide

## Day View Layout

### Before: 2-Category System
```
┌─────────────────────────────────────────────────────────┐
│ CALENDAR - DAY VIEW                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ STAFF                                                   │
│ ├─ DYNAMIC (3 staff)                                    │
│ │  ├─ Emma Johnson (with room: Studio A)               │
│ │  ├─ Maria Garcia (with room: Station 2)              │
│ │  └─ James Mitchell (no room)                          │
│ │                                                       │
│ └─ STATIC (2 staff grouped by room)                     │
│    ├─ Studio B                                          │
│    │  └─ Sarah Williams                                 │
│    └─ Station 1                                         │
│       └─ Lisa Chen                                      │
│                                                          │
│ ROOMS                                                   │
│ ├─ FIXED ROOMS                                          │
│ │  ├─ Studio A (+ Emma, Maria on their days)          │
│ │  ├─ Studio B (+ Sarah)                              │
│ │  └─ Station 1 (+ Lisa)                              │
│ │                                                       │
│ └─ FLEXIBLE ROOMS                                       │
│    └─ ...                                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Issue**: Dynamic and static staff mixed in one section, regardless of assignment status.

### After: 4-Category System
```
┌─────────────────────────────────────────────────────────┐
│ CALENDAR - DAY VIEW                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ STAFF                                                   │
│ ├─ DYNAMIC UNASSIGNED (3 staff)                         │
│ │  ├─ James Mitchell                                    │
│ │  ├─ David Brown                                       │
│ │  └─ Alex Thompson                                     │
│ │                                                       │
│ ├─ DYNAMIC ASSIGNED (2 staff)                           │
│ │  ├─ Emma Johnson (Studio A: Mon-Fri 9-5)            │
│ │  └─ Maria Garcia (Station 2: Mon,Wed,Fri 10-7)      │
│ │                                                       │
│ ├─ STATIC UNASSIGNED (2 staff)                          │
│ │  ├─ Rebecca Foster                                    │
│ │  └─ Oliver Price                                      │
│ │                                                       │
│ └─ STATIC ASSIGNED (2 staff grouped by room)            │
│    ├─ Studio B                                          │
│    │  └─ Sarah Williams (fixed slots)                  │
│    └─ Station 1                                         │
│       └─ Lisa Chen (fixed slots)                        │
│                                                          │
│ ROOMS                                                   │
│ ├─ FIXED ROOMS                                          │
│ │  ├─ Studio A                                          │
│ │  │  └─ Emma Johnson (9-5, Mon-Fri)                   │
│ │  ├─ Studio B                                          │
│ │  │  └─ Sarah Williams (fixed slots)                  │
│ │  └─ Station 1                                         │
│ │     ├─ Lisa Chen (fixed slots)                       │
│ │     └─ Maria Garcia (10-7, Mon/Wed/Fri)             │
│ │                                                       │
│ └─ FLEXIBLE ROOMS                                       │
│    └─ ...                                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Improvement**: Clear separation of 4 categories with better organization.

---

## Week View Layout

### Before: 2-Category System Headers
```
DYNAMIC STAFF (5)
├─ Emma Johnson
├─ Maria Garcia
├─ James Mitchell
├─ David Brown
└─ Alex Thompson

STATIC STAFF - ASSIGNED TO ROOMS (2)
└─ Studio B
   ├─ Sarah Williams
   └─ Station 1
      └─ Lisa Chen

FIXED CAPACITY ROOMS (4)
├─ Studio A
├─ Studio B
├─ ...
└─ ...

FLEXIBLE ROOMS (2)
├─ ...
└─ ...
```

**Issue**: Dynamic staff with and without rooms not distinguished.

### After: 4-Category System Headers
```
✨ DYNAMIC UNASSIGNED (3)                    ← Blue header
├─ James Mitchell
├─ David Brown
└─ Alex Thompson

🏠 DYNAMIC ASSIGNED TO ROOMS (2)            ← Green header + icon
├─ Emma Johnson
└─ Maria Garcia

🔧 STATIC UNASSIGNED (2)                    ← Purple header
├─ Rebecca Foster
└─ Oliver Price

🏠 STATIC ASSIGNED TO ROOMS (2)             ← Orange header + icon
├─ Studio B
│  └─ Sarah Williams
└─ Station 1
   └─ Lisa Chen

🎯 FIXED CAPACITY ROOMS (4)                 ← Green header
├─ Studio A
├─ Studio B
├─ ...
└─ ...

📍 FLEXIBLE ROOMS (2)                       ← Light green header
├─ ...
└─ ...
```

**Improvement**: Color-coded headers make categories immediately obvious. Icons help visual scanning.

---

## Staff Examples

### 1. Emma Johnson - Dynamic Assigned
```
ID: '1'
Name: Emma Johnson
Type: DYNAMIC (flexible scheduling)
Assignment Status: ASSIGNED ✓

Room Assignments:
├─ Monday: Studio A (9:00-17:00) - Services: Hair services
├─ Tuesday: Studio A (9:00-17:00) - Services: Hair services
├─ Wednesday: Studio A (9:00-17:00) - Services: Hair services
├─ Thursday: Studio A (9:00-18:00) - Services: Hair services
└─ Friday: Studio A (9:00-18:00) - Services: Hair services

Calendar Display (Monday):
├─ Appears in: DYNAMIC ASSIGNED section
├─ Appears in: ROOMS → FIXED → Studio A column
├─ Can book: Any time 9-5 (flexible)
├─ Room shown: Studio A (informational)
└─ Can override room: Yes (if needed)
```

### 2. James Mitchell - Dynamic Unassigned
```
ID: '5'
Name: James Mitchell
Type: DYNAMIC (flexible scheduling)
Assignment Status: UNASSIGNED ✗

Room Assignments: None

Calendar Display (Any day):
├─ Appears in: DYNAMIC UNASSIGNED section
├─ Does NOT appear in: Room columns
├─ Can book: Any time in working hours (flexible)
├─ Room shown: User selects
└─ Can override room: Yes (freely)
```

### 3. Sarah Williams - Static Assigned
```
ID: '2'
Name: Sarah Williams
Type: STATIC (fixed slot scheduling)
Assignment Status: ASSIGNED ✓

Room Assignments:
├─ Monday: Studio B (09:00-13:00) - Services: [specialized services]
├─ Wednesday: Studio B (10:00-11:00) - Services: [specialized services]
└─ Thursday: Studio B (09:00-10:00) - Services: [specialized services]

Calendar Display (Monday):
├─ Appears in: STATIC ASSIGNED section
│  └─ Under: Studio B
├─ Appears in: ROOMS → FIXED → Studio B column
├─ Available bookings: Must book within her slots
├─ Capacity: Per-slot based
└─ Room shown: Studio B (required)
```

### 4. Rebecca Foster - Static Unassigned
```
ID: '8'
Name: Rebecca Foster
Type: STATIC (fixed slot scheduling)
Assignment Status: UNASSIGNED ✗

Room Assignments: None

Calendar Display (Any day):
├─ Appears in: STATIC UNASSIGNED section
├─ Does NOT appear in: Room columns
├─ Available bookings: Must book within her time slots
├─ Capacity: Per-slot based
├─ Room shown: User selects from available
└─ Notes: Can be assigned to any room as needed
```

---

## Filtering Examples

### Filter State 1: All Staff
```
Selected Staff: All 9 staff members
Display: All 4 categories visible

DYNAMIC UNASSIGNED (3):
├─ James Mitchell
├─ David Brown
└─ Alex Thompson

DYNAMIC ASSIGNED (2):
├─ Emma Johnson
└─ Maria Garcia

STATIC UNASSIGNED (2):
├─ Rebecca Foster
└─ Oliver Price

STATIC ASSIGNED (2):
├─ Sarah Williams
└─ Lisa Chen
```

### Filter State 2: Only Emma Johnson
```
Selected Staff: Emma Johnson only
Display: Only Emma's row visible

DYNAMIC ASSIGNED (1):
└─ Emma Johnson
```

### Filter State 3: Only Dynamic Staff
```
Selected Staff: James, David, Alex, Emma, Maria
Display: Both dynamic categories, static hidden

DYNAMIC UNASSIGNED (3):
├─ James Mitchell
├─ David Brown
└─ Alex Thompson

DYNAMIC ASSIGNED (2):
├─ Emma Johnson
└─ Maria Garcia

[STATIC categories hidden]
```

### Filter State 4: Only Assigned Staff
```
Selected Staff: Emma, Maria, Sarah, Lisa
Display: Both assigned categories, unassigned hidden

DYNAMIC ASSIGNED (2):
├─ Emma Johnson
└─ Maria Garcia

STATIC ASSIGNED (2):
├─ Sarah Williams
└─ Lisa Chen

[UNASSIGNED categories hidden]
```

---

## Capacity Indicators

### Dynamic Staff Row Header
```
Emma Johnson    [dynamic] [1/2 available]
│
├─ Type badge: Shows "dynamic"
├─ Capacity chip: Shows available concurrent bookings
│  └─ Red: 0/2 (full)
│  └─ Yellow: 1/2 (limited)
│  └─ Green: 2/2 (available)
└─ Room shown as secondary info (if assigned)
```

### Static Staff Row Header
```
Sarah Williams    [static] [Cap: 1]
│
├─ Type badge: Shows "static"
├─ Capacity chip: Shows max bookings per slot
│  └─ Usually small number (1-3)
└─ Room shown if assigned (Studio B)
```

---

## Booking Drawer Behavior

### When Selecting Dynamic Assigned Staff
```
1. User clicks to create booking
2. Booking drawer opens (CREATE mode)
3. Date is pre-filled: Monday, Dec 16
4. User selects staff: "Emma Johnson"
   └─ Auto-populates: Room = "Studio A"
5. User sees:
   └─ Room field: "Studio A" (editable)
6. User can:
   ├─ Keep Studio A (suggested)
   ├─ Override to different room
   └─ Complete booking with either
```

### When Selecting Dynamic Unassigned Staff
```
1. User clicks to create booking
2. Booking drawer opens (CREATE mode)
3. Date is pre-filled: Monday, Dec 16
4. User selects staff: "James Mitchell"
   └─ No auto-population (no assignments)
5. User sees:
   └─ Room field: Empty (user selects)
6. User must:
   ├─ Choose room manually
   └─ Complete booking with selected room
```

---

## Visual Color Scheme

### Category Header Colors

| Category | Background | Text | Icon | Badge |
|----------|------------|------|------|-------|
| Dynamic Unassigned | Light blue (info) | Dark blue | None | - |
| Dynamic Assigned | Light green (success) | Dark green | 🏠 Home | Green chip |
| Static Unassigned | Light purple (secondary) | Dark purple | None | - |
| Static Assigned | Light orange (warning) | Dark orange | 🏠 Home | Orange chip |
| Fixed Rooms | Light green (success) | Dark green | - | - |
| Flexible Rooms | Very light green | Gray | - | - |

### Row Alternation
- Odd rows: Transparent
- Even rows: Subtle background (0.01-0.05 opacity)
- Dark mode: Adjusted opacity for visibility
- Hover: Consistent highlight across all rows

---

## Summary Table

| Aspect | Dynamic Unassigned | Dynamic Assigned | Static Unassigned | Static Assigned |
|--------|-------------------|------------------|------------------|-----------------|
| **Scheduling** | Flexible times | Flexible times | Fixed slots | Fixed slots |
| **Room Assignment** | Optional | ✅ Required | Optional | ✅ Required |
| **Calendar Section** | Staff → Dynamic Unassigned | Staff → Dynamic Assigned | Staff → Static Unassigned | Staff → Static Assigned |
| **Room Section** | Never appears | If assigned today | Never appears | Always appears |
| **Capacity Type** | Concurrent bookings | Concurrent bookings | Per-slot | Per-slot |
| **Booking Flexibility** | Any time, any room | Any time, assigned room(s) | Within slots, any room | Within slots, assigned room |
| **Example** | James Mitchell | Emma Johnson | Rebecca Foster | Sarah Williams |
| **Header Color** | 🔵 Blue | 🟢 Green | 🟣 Purple | 🟠 Orange |

---

## Configuration & Customization

### Styling

To customize category colors, edit in each view component:
```tsx
// Week view example
DYNAMIC UNASSIGNED:
  bgcolor: isDark ? 'rgba(33, 150, 243, 0.08)' : 'rgba(33, 150, 243, 0.05)'
  color: 'info.dark'

DYNAMIC ASSIGNED:
  bgcolor: isDark ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.1)'
  color: 'success.dark'
  icon: 🏠
```

### Icons

Currently using Remix Icons:
- Home office: `ri-home-office-line` (🏠)
- Customize by changing class name in JSX

### Labels

Labels are hardcoded in component JSX:
```tsx
'DYNAMIC UNASSIGNED'
'DYNAMIC ASSIGNED TO ROOMS'
'STATIC UNASSIGNED'
'STATIC ASSIGNED TO ROOMS'
```

To change labels, update Typography `label` props.

---

**Last Updated**: 2025-12-16
**System**: Four-Category Staff Grouping
**Status**: Production Ready ✅
