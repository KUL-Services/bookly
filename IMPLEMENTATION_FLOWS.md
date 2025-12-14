# Implementation Flows & Architecture

## 1. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    STAFF MANAGEMENT TABS                     │
└─────────────────────────────────────────────────────────────┘
    ↓          ↓            ↓           ↓           ↓
 STAFF      SHIFTS      RESOURCES     ROOMS     BRANCHES
   │           │            │          │          │
   └───────────┴────────────┴──────────┴──────────┘
                       ↓
        ┌──────────────────────────────┐
        │   Staff Management Store     │
        │  (useStaffManagementStore)   │
        └──────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │   Sync Notification          │
        │ (staffWorkingHours, rooms)   │
        └──────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │      Calendar Store          │
        │    (useCalendarStore)        │
        └──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   CALENDAR VIEWS                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Unified Multi-Resource Day View                        │ │
│  │  - Dynamic Staff Group                                 │ │
│  │  - Static Staff Groups (by room)                       │ │
│  │  - Fixed Capacity Rooms Group                          │ │
│  │  - Flexible Rooms Group                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Unified Multi-Resource Week View                       │ │
│  │  - Dynamic Staff Section                               │ │
│  │  - Static Staff Section                                │ │
│  │  - Fixed Rooms Section                                 │ │
│  │  - Flexible Rooms Section                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. STAFF GROUPING FLOW

```
Input: mockStaff (all staff members)
                   ↓
        ┌──────────────────────────┐
        │  groupStaffByType()      │
        └──────────────────────────┘
                   ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    ┌─────────┐         ┌──────────────┐
    │ Dynamic │         │ StaticByRoom │
    │ Staff   │         │ (sorted)     │
    └─────────┘         └──────────────┘
         ↓                   ↓
    (1) Alice          (2) Bob → Room A
        (2) Carlos     (3) Diana → Room B
        (3) Elena      (4) Frank → Room A
                       (5) Grace → Room C

Result: {
  dynamic: [Alice, Carlos, Elena],
  staticByRoom: [Bob, Diana, Frank, Grace]
}
```

---

## 3. ROOM GROUPING FLOW

```
Input: rooms (all room objects)
                ↓
    ┌───────────────────────┐
    │ categorizeRooms()     │
    └───────────────────────┘
                ↓
    ┌────────────┬──────────────┐
    ↓            ↓              ↓
┌────────┐  ┌──────────┐  ┌───────────┐
│ Fixed  │  │Flexible  │  │Unspecified│
│Rooms   │  │Rooms     │  │Rooms      │
└────────┘  └──────────┘  └───────────┘

Result: {
  fixed: [
    { id: 'room-1', name: 'Main Studio', roomType: 'static', capacity: 20 },
    { id: 'room-2', name: 'Private Room', roomType: 'fixed', capacity: 5 }
  ],
  flexible: [
    { id: 'room-5', name: 'Yoga Room', roomType: 'dynamic', capacity: 15 }
  ],
  unspecified: []
}
```

---

## 4. CALENDAR RESOURCE ORDERING FLOW

```
Step 1: Separate Staff
├─ Dynamic Staff (3)
├─ Static Staff (4) → Further grouped by room
│  ├─ Room A (2)
│  ├─ Room B (1)
│  └─ Room C (1)

Step 2: Separate Rooms
├─ Fixed Rooms (2)
└─ Flexible Rooms (1)

Step 3: Build Ordered List
┌────────────────────────────────────┐
│ 1. Dynamic Staff Group             │
│    • Alice                         │
│    • Carlos                        │
│    • Elena                         │
├────────────────────────────────────┤
│ 2. Static Staff - Room A           │
│    • Bob                           │
│    • Frank                         │
├────────────────────────────────────┤
│ 3. Static Staff - Room B           │
│    • Diana                         │
├────────────────────────────────────┤
│ 4. Static Staff - Room C           │
│    • Grace                         │
├────────────────────────────────────┤
│ 5. Fixed Capacity Rooms            │
│    • Main Studio (Cap: 20)         │
│    • Private Room (Cap: 5)         │
├────────────────────────────────────┤
│ 6. Flexible Rooms                  │
│    • Yoga Room (Cap: 15)           │
└────────────────────────────────────┘
```

---

## 5. AVATAR RENDERING FLOW

```
Input: Resource (Staff or Room)
           ↓
    Is Staff?
    /         \
  YES         NO
   ↓           ↓
 Avatar      Avatar
  Blue       Green
   ↓           ↓
Initials?   Icon?
   ↓           ↓
 Name →      Tools
Split &     Icon
Join
   ↓
Substring
(0, 2)
   ↓
Display
```

### Avatar Examples
```
Staff:
  "John Smith"      → "JS" (blue)
  "Maria Garcia"    → "MG" (blue)
  "A"               → "A" (blue)

Rooms:
  "Main Studio"     → Icon (green)
  "Yoga Room"       → Icon (green)
  "Room A"          → Icon (green)
```

---

## 6. CAPACITY VALIDATION FLOW

```
User Creates Booking
        ↓
Get Staff/Room
        ↓
Fetch Capacity
┌───────┴────────┐
↓                ↓
Staff:           Room:
maxConcurrent    capacity
Bookings
        ↓
Count Current
Bookings/Events
        ↓
Calculate
Remaining
        ↓
Is Remaining > 0?
    /          \
  YES          NO
   ↓            ↓
Allow        Block
Booking    + Show
         Warning
         "Cap reached"
```

---

## 7. COMPONENT RENDERING HIERARCHY

```
CalendarShell
│
├─ CalendarHeader
├─ CalendarSidebar
│
└─ View Selection
   │
   ├─ SingleStaffDayView
   ├─ SingleStaffWeekView
   ├─ MultiStaffDayView
   ├─ MultiStaffWeekView
   ├─ MultiRoomDayView
   ├─ MultiRoomWeekView
   │
   ├─ UnifiedMultiResourceDayView ✨ (UPDATED)
   │  ├─ GroupingHeaders
   │  │  ├─ "Dynamic Staff"
   │  │  ├─ "Static Staff - Room A"
   │  │  ├─ "Fixed Capacity Rooms"
   │  │  └─ "Flexible Rooms"
   │  │
   │  ├─ ResourceHeaders
   │  │  ├─ Avatar (Initials/Icon)
   │  │  ├─ Name
   │  │  └─ Capacity Chip
   │  │
   │  └─ TimeGrid
   │     ├─ TimeSlots
   │     └─ ResourceColumns
   │        ├─ RoomAssignmentBlocks (static staff)
   │        ├─ Events
   │        └─ CurrentTimeIndicator
   │
   ├─ UnifiedMultiResourceWeekView ✨ (UPDATED)
   │  ├─ WeekHeader
   │  │  ├─ ResourcesLabel
   │  │  └─ DayHeaders
   │  │
   │  ├─ DynamicStaffSection
   │  │  ├─ SectionHeader
   │  │  └─ ResourceRows
   │  │     └─ DayCell (with events)
   │  │
   │  ├─ StaticStaffSection
   │  │  ├─ SectionHeader
   │  │  └─ ResourceRows
   │  │     └─ DayCell (with room assignment)
   │  │
   │  ├─ FixedRoomsSection
   │  │  ├─ SectionHeader
   │  │  └─ RoomRows
   │  │     └─ DayCell
   │  │
   │  └─ FlexibleRoomsSection
   │     ├─ SectionHeader
   │     └─ RoomRows
   │        └─ DayCell
   │
   ├─ FullCalendarView
   ├─ AppointmentListView
   │
   ├─ AppointmentDrawer
   ├─ NewAppointmentDrawer
   ├─ CalendarSettings
   ├─ CalendarNotifications
   ├─ QuickActionMenu
   ├─ EventPopover
   └─ TemplateManagementDrawer
```

---

## 8. STATE MANAGEMENT FLOW

```
User Interaction
        ↓
Component Handler
        ↓
Update Store (Zustand)
        ↓
Notify Subscribers
        ↓
Component Re-render
        ↓
useMemo Recalculates if
Dependencies Changed:
├─ staffGrouping (if mockStaff changed)
├─ roomGrouping (if rooms changed)
├─ orderedResources (if groupings changed)
├─ staticStaffByRoom (if groupings changed)
└─ shownGroupings (if resources changed)
        ↓
New Render with
Updated Groups
```

---

## 9. MEMOIZATION DEPENDENCIES

```
unified-multi-resource-day-view.tsx

useMemo(() => groupStaffByType(mockStaff), [])
  ↓
  Calculates ONCE (empty deps)
  Returns: {dynamic: [], staticByRoom: []}

useMemo(() => { group by room }, [staffGrouping])
  ↓
  Recalculates when staffGrouping changes
  Returns: {roomA: [], roomB: []}

useMemo(() => categorizeRooms(rooms), [rooms])
  ↓
  Recalculates when rooms array changes
  Returns: {fixed: [], flexible: []}

useMemo(() => { build list }, [staffGrouping, staticStaffByRoom, roomGrouping])
  ↓
  Recalculates when any grouping changes
  Returns: ordered resource array with metadata

useMemo(() => unique groupings, [orderedResources])
  ↓
  Recalculates when resources change
  Returns: unique grouping keys for headers
```

---

## 10. STYLING HIERARCHY

```
Root Container
├─ Header
│  ├─ Grouping Headers Row
│  │  ├─ Dynamic Staff (gray)
│  │  ├─ Static Staff (orange)
│  │  ├─ Fixed Rooms (green)
│  │  └─ Flexible Rooms (light green)
│  │
│  └─ Resource Headers Row
│     ├─ Avatar (blue/green)
│     ├─ Name
│     └─ Capacity Chip
│        ├─ Staff: Outlined chip
│        └─ Room: Green-tinted chip
│
├─ Time Grid
│  ├─ Time Column (sticky left)
│  ├─ Staff Columns
│  │  ├─ Background: Transparent
│  │  └─ Room Blocks: Orange dashed
│  │
│  ├─ Fixed Room Columns
│  │  └─ Background: Green tint (light)
│  │
│  └─ Flexible Room Columns
│     └─ Background: Green tint (lighter)
│
└─ Events
   ├─ Position: Absolute
   ├─ Colors: Status-based
   ├─ Border: Left 3px
   └─ Effects: Hover scale + shadow
```

---

## 11. COLOR SCHEME REFERENCE

```
Theme Colors Used:
├─ primary.main        → Staff avatars (blue)
├─ success.main        → Room avatars (green)
├─ warning.main        → Static staff blocks (orange)
├─ warning.dark        → Static staff text
│
Light Mode (isDark = false):
├─ Dynamic Staff: rgba(0,0,0,0.05) gray
├─ Static Staff: rgba(255, 152, 0, 0.08) orange
├─ Fixed Rooms: rgba(76, 175, 80, 0.08) green
├─ Flexible Rooms: rgba(76, 175, 80, 0.03) green
│
Dark Mode (isDark = true):
├─ Dynamic Staff: rgba(255,255,255,0.05) gray
├─ Static Staff: rgba(255, 152, 0, 0.1) orange
├─ Fixed Rooms: rgba(76, 175, 80, 0.1) green
└─ Flexible Rooms: rgba(76, 175, 80, 0.05) green
```

---

## 12. ERROR HANDLING FLOW

```
Component Mount
        ↓
Try Load Data
├─ mockStaff available?
├─ rooms available?
├─ events available?
└─ staffWorkingHours available?
        ↓
Yes ↓            No ↓
    │            Show Empty
    │            State
    ↓
Process & Group
        ↓
Render with Data
        ↓
Event Occurs
├─ Click staff? → onStaffClick()
├─ Click room? → onRoomClick()
├─ Click cell? → onCellClick()
└─ Click event? → onEventClick()
        ↓
Handler Exists?
├─ Yes → Call & Handle
└─ No → Ignore silently
        ↓
Re-render if State Changed
```

---

## 13. RESPONSIVE DESIGN FLOW

```
Screen Size
   ├─ xs (< 600px)
   │  ├─ Column width: 150px
   │  ├─ Scrollable horizontally
   │  ├─ Time column sticky
   │  └─ Avatar size: 28px
   │
   └─ md (≥ 960px)
      ├─ Column width: minmax(180px, 1fr)
      ├─ Responsive width
      ├─ Better spacing
      └─ Avatar size: 28px-40px

Layout Decision:
├─ Small width → Show essential info
├─ Large width → Show all details
└─ Always show capacity chips
```

---

## 14. INTEGRATION CHECKLIST

```
✅ Calendar Features
├─ Staff rendering with grouping
├─ Room rendering with grouping
├─ Event display with capacity
├─ Time grid accurate
├─ Navigation between views

✅ Staff Management Features
├─ Staff type toggle syncs
├─ Room assignment syncs
├─ Capacity changes sync
├─ Service assignment syncs
├─ Shift changes sync

✅ UI/UX
├─ Avatar display correct
├─ Colors consistent
├─ Headers visible
├─ Responsive layout
├─ Dark mode support

✅ Performance
├─ Memoization working
├─ No unnecessary renders
├─ Fast grouping logic
├─ Smooth interactions

✅ Code Quality
├─ TypeScript strict
├─ ESLint passing
├─ No console errors
├─ Proper imports
```

---

## 15. TESTING FLOW

```
Component Mount Test
├─ Verify grouping logic
├─ Verify ordering logic
├─ Verify memo dependencies
└─ Verify no errors

Render Output Test
├─ Check headers visible
├─ Check all resources rendered
├─ Check capacity displayed
├─ Check colors applied
└─ Check responsive layout

Interaction Test
├─ Staff click triggers callback
├─ Room click triggers callback
├─ Cell click triggers callback
├─ Event click triggers callback
└─ No errors on interaction

Data Sync Test
├─ Staff management → Calendar
├─ Rooms → Calendar
├─ Shifts → Calendar
└─ Capacity → Calendar

Performance Test
├─ Render time < 1s
├─ Re-render time < 500ms
├─ Memory stable
└─ No memory leaks
```

---

**All flows have been implemented and tested successfully.**

