# Studio B & Station 1 - Complete Data Alignment Guide

**Last Updated**: 2025-12-15
**Status**: Complete Reference Guide

---

## Overview

The system manages two different business locations with different room types and scheduling approaches:

| Location | Room | Type | Business | Branch | Use Case |
|----------|------|------|----------|--------|----------|
| **Studio B** | room-1-1-2 | Static (Slot-Based) | Luxe Hair Studio | Oxford (1-1) | Group Fitness Classes |
| **Station 1** | room-2-1-1 | Static (Slot-Based) | Bliss Nail Bar | King's Road (2-1) | Individual Services |

---

## STUDIO B - Fitness Classes (Slot-Based)

### Location Details
```
Business: Luxe Hair Studio
Branch: Oxford Branch (1-1)
Room: Studio B (room-1-1-2)
Color: #4ECDC4 (Teal)
Room Type: Static (Slot-Based)
```

### Room Configuration
Studio B is assigned to **Sarah Johnson (Staff ID: 2)** for specific days:

```typescript
roomAssignments: [
  {
    roomId: 'room-1-1-2',
    roomName: 'Studio B',
    dayOfWeek: 'Mon',
    startTime: '09:00',
    endTime: '13:00',
    serviceIds: ['fitness-1', 'fitness-2']  // Yoga & Pilates
  },
  {
    roomId: 'room-1-1-2',
    roomName: 'Studio B',
    dayOfWeek: 'Wed',
    startTime: '10:00',
    endTime: '11:00',
    serviceIds: ['fitness-4']  // Personal Training
  },
  {
    roomId: 'room-1-1-2',
    roomName: 'Studio B',
    dayOfWeek: 'Thu',
    startTime: '09:00',
    endTime: '10:00',
    serviceIds: ['fitness-1']  // Yoga
  }
]
```

### Fitness Services Available

| Service ID | Service Name | Duration | Price | Instructor |
|------------|--------------|----------|-------|------------|
| fitness-1 | Morning Yoga Class | 60 min | $25 | Sarah Johnson (2) |
| fitness-2 | Pilates Class | 60 min | $30 | Sarah Johnson (2) |
| fitness-3 | Zumba Dance | 60 min | $28 | Lisa Chen (3) |
| fitness-4 | Personal Training Session | 60 min | $50 | Sarah Johnson (2) |

### Pre-Configured Slots

Studio B has pre-defined slots that function as CLASS SESSIONS with limited capacity:

**Monday Classes**:
```
Slot 1: Morning Yoga Class
  Time: 09:00 - 10:00
  Capacity: 12 people
  Instructor: Sarah Johnson (2)
  Price: $25
  Status: Accepting bookings

Slot 2: Pilates Class
  Time: 18:00 - 19:00
  Capacity: 15 people
  Instructor: Sarah Johnson (2)
  Price: $30
  Status: Accepting bookings

Slot 3: Zumba Dance
  Time: 19:30 - 20:30
  Capacity: 20 people
  Instructor: Lisa Chen (3)
  Price: $28
  Status: Accepting bookings
```

**Tuesday Classes**:
```
Slot 1: Pilates Class
  Time: 09:00 - 10:00
  Capacity: 15 people

Slot 2: Morning Yoga Class
  Time: 18:00 - 19:00
  Capacity: 12 people
```

**Wednesday Classes**:
```
Slot: Personal Training Session
  Time: 10:00 - 11:00
  Capacity: 2 people (Small capacity for testing full state)
  Price: $50
```

### Current Bookings for Studio B

**Booking Data for Monday Yoga (Slot: slot-fitness-mon-1)**:
```
ID: booking-static-1
Service: Morning Yoga Class
Date: Monday (2025-11-03)
Time: 9:00 AM - 10:00 AM
Duration: 60 min
Instructor: Sarah Johnson
Attendees:
  1. Emma Johnson (Regular attendee)
  2. Olivia (Beginner friendly)
  3. Sophia
  4-5. [2 more participants]
Party Size: 5 people total
Capacity Used: 5/12
```

### How Studio B Bookings Work

**In STATIC MODE (Slot-Based)**:

1. **Browse Available Slots**:
   ```
   Calendar → Select Branch (Oxford)
   → Select Room (Studio B)
   → Select Date
   → See available class slots
   ```

2. **View Slot Details**:
   ```
   Slot shows:
   - Service name (Morning Yoga Class)
   - Time (09:00 - 10:00)
   - Current capacity (5/12 available)
   - Color coding (Green = available, Yellow = filling up, Red = full)
   ```

3. **Create Booking**:
   ```
   Click slot → Drawer opens in CREATE mode
   → Service pre-selected: "Morning Yoga Class"
   → Instructor shown: "Sarah Johnson"
   → Party size input (1-12)
   → Click "Create Booking"
   ```

4. **Edit Existing Booking**:
   ```
   Click booking in calendar
   → Drawer opens in EDIT mode
   → Slot shown (read-only)
   → Can change:
      - Client/Attendee name
      - Party size
      - Status (confirmed/pending/etc)
      - Payment status
      - Notes
   → Can delete booking
   ```

---

## STATION 1 - Nail Services (Slot-Based)

### Location Details
```
Business: Bliss Nail Bar
Branch: King's Road (2-1)
Room: Station 1 (room-2-1-1)
Color: #FFDAC1 (Peach)
Room Type: Static (Slot-Based)
```

### Room Configuration
Station 1 is assigned to **Rosa Garcia (Staff ID: 5)** for daily operations:

```typescript
roomAssignments: [
  {
    roomId: 'room-2-1-1',
    roomName: 'Station 1',
    dayOfWeek: 'Mon',
    startTime: '09:00',
    endTime: '20:00',
    serviceIds: ['4']  // Gel Manicure
  },
  {
    roomId: 'room-2-1-1',
    roomName: 'Station 1',
    dayOfWeek: 'Tue',
    startTime: '09:00',
    endTime: '20:00',
    serviceIds: ['4']
  },
  // ... (Wed-Sun same pattern)
]
```

### Nail Services Available

| Service ID | Service Name | Duration | Price | Available At |
|------------|--------------|----------|-------|--------------|
| 4 | Gel Manicure | 30 min | $30 | Station 1 |
| 5 | Gel Pedicure | 40 min | $40 | Station 1 |
| 6 | Nail Art Design | 45 min | $50 | Station 1 |

### Operating Hours
```
Monday - Sunday: 09:00 - 20:00
Station 1 is available: 11 hours per day
```

### Slot Strategy for Station 1

Unlike Studio B (which has group classes with fixed time blocks), **Station 1 uses flexible time slots** for individual appointments:

```
Station 1 can have multiple overlapping time slots
Example Monday:
  - 09:00 - 09:30 (Client A - Manicure)
  - 09:30 - 10:00 (Client B - Manicure)
  - 09:45 - 10:30 (Client C - Pedicure)
  - ... and so on throughout the day

Capacity: Typically 1-2 concurrent bookings
(One manicure + one pedicure possible if using different tools)
```

### Current Bookings for Station 1

Station 1 currently has flexible individual appointment bookings managed through the drawer.

---

## Data Alignment Architecture

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│            CALENDAR SHELL (calendar-shell.tsx)          │
│  - Manages UI state                                      │
│  - Handles click events                                  │
│  - Routes to correct drawer mode                         │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┬─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐    ┌──────────────┐    ┌────────┐
   │ Day View│    │ Unified      │    │ Zustand│
   │ Calendar│    │ Booking      │    │ Store  │
   │         │    │ Drawer       │    │(State) │
   └────┬────┘    └──────┬───────┘    └────┬───┘
        │                │                 │
        │  Shows:        │  Create/Edit:   │  Stores:
        │  - Studio B    │  - Service      │  - Filters
        │  - Station 1   │  - Slot/Time    │  - Events
        │  - Bookings    │  - Client       │  - Mode
        │                │  - Details      │
        └────────────────┼─────────────────┘
                         │
        ┌────────────────▼─────────────────┐
        │      MOCK DATA (mock-data.ts)    │
        │  - mockRooms (Studio B, Station 1)
        │  - mockStaff (Sarah, Rosa)       │
        │  - staticSlots (Pre-defined)     │
        │  - mockBookings (Appointments)   │
        │  - mockServices (Yoga, Manicure) │
        └─────────────────────────────────┘
```

### Data Relationships

**Studio B System**:
```
Room (Studio B, room-1-1-2)
  ├── Staff: Sarah Johnson (2)
  ├── Room Assignments: Mon 09:00-13:00, Wed 10:00-11:00, Thu 09:00-10:00
  ├── Pre-Defined Slots:
  │   ├── slot-fitness-mon-1: Morning Yoga (capacity: 12)
  │   ├── slot-fitness-mon-2: Pilates (capacity: 15)
  │   ├── slot-fitness-mon-3: Zumba (capacity: 20)
  │   └── ... (more slots)
  └── Current Bookings:
      ├── booking-static-1: Emma Johnson (Yoga)
      ├── booking-static-2: Olivia (Yoga)
      ├── booking-static-3: Sophia (Yoga)
      └── ... (more bookings)
```

**Station 1 System**:
```
Room (Station 1, room-2-1-1)
  ├── Staff: Rosa Garcia (5)
  ├── Room Assignments: Daily 09:00-20:00
  ├── Slot Strategy: Individual appointment slots (flexible)
  └── Current Bookings:
      ├── booking-*: Client A (Manicure)
      ├── booking-*: Client B (Pedicure)
      └── ... (more bookings)
```

---

## How Data Stays Aligned

### 1. Mock Data Structure
```
Location Properties (mockRooms):
├── room-1-1-2 (Studio B)
│   └── Capacity: Slot-specific (12-20)
├── room-2-1-1 (Station 1)
    └── Capacity: Slot-specific (1-2)

Staff Properties (mockStaff):
├── Sarah Johnson (2)
│   ├── branchId: '1-1'
│   ├── roomAssignments: [Studio B slots]
│   └── staffType: 'static'
├── Rosa Garcia (5)
│   ├── branchId: '2-1'
│   ├── roomAssignments: [Station 1 slots]
│   └── staffType: 'static'

Slot Properties (staticSlots):
├── slot-fitness-*: Studio B fitness classes
│   ├── roomId: 'room-1-1-2'
│   ├── serviceId: fitness-1/2/3/4
│   ├── capacity: 12-20
│   └── instructorStaffId: 2 or 3
├── station-1-*: Station 1 appointments
    ├── roomId: 'room-2-1-1'
    ├── serviceId: 4/5/6
    └── capacity: 1-2

Booking Properties (mockBookings):
├── Fitness classes (Studio B):
│   ├── roomId: 'room-1-1-2'
│   ├── slotId: 'slot-fitness-mon-1'
│   ├── serviceName: 'Morning Yoga Class'
│   └── staffMemberName: 'Sarah Johnson'
├── Nail services (Station 1):
    ├── roomId: 'room-2-1-1'
    ├── slotId: 'slot-station-*'
    ├── serviceName: 'Gel Manicure'
    └── staffMemberName: 'Rosa Garcia'
```

### 2. Calendar Display

**When viewing Studio B**:
```
Calendar loads:
1. Filter branch: '1-1' (Oxford)
2. Filter room: 'room-1-1-2' (Studio B)
3. Load staticSlots where roomId = 'room-1-1-2'
4. Load mockBookings where roomId = 'room-1-1-2'
5. Display: Class time blocks with current capacity

Shows:
┌─────────────────────┐
│ Mon 09:00 - 10:00   │
│ Morning Yoga        │ ← Service from slot
│ 5/12 booked         │ ← Capacity from bookings
│ Sarah Johnson       │ ← Instructor from slot
└─────────────────────┘
```

**When viewing Station 1**:
```
Calendar loads:
1. Filter branch: '2-1' (King's Road)
2. Filter room: 'room-2-1-1' (Station 1)
3. Load staticSlots where roomId = 'room-2-1-1'
4. Load mockBookings where roomId = 'room-2-1-1'
5. Display: Individual appointment slots

Shows:
┌─────────────────────┐
│ Mon 09:00 - 09:30   │
│ Gel Manicure        │ ← Service from slot
│ 1/1 booked          │ ← Capacity from booking
│ Rosa Garcia         │ ← Staff from room assignment
└─────────────────────┘
```

### 3. Booking Creation

**For Studio B**:
```
User clicks slot → Drawer opens in CREATE mode
1. Service pre-selected: "Morning Yoga Class"
   (from staticSlots.serviceName)
2. Time: 09:00 - 10:00 (from staticSlots.startTime/endTime)
3. Instructor: "Sarah Johnson" (from staticSlots.instructorStaffId)
4. Slot ID: 'slot-fitness-mon-1' (from staticSlots.id)
5. Room ID: 'room-1-1-2' (from staticSlots.roomId)
6. User enters: Client name, party size, notes
7. Click "Create Booking" → New booking added to mockBookings
8. Calendar refreshes → Shows updated capacity
```

**For Station 1**:
```
User clicks available time → Drawer opens in CREATE mode
1. Service selected: "Gel Manicure" (from available services)
2. Time: User selects start/end (e.g., 09:00 - 09:30)
3. Staff: "Rosa Garcia" (from roomAssignments)
4. Room ID: 'room-2-1-1' (pre-filled)
5. User enters: Client name, notes
6. Click "Create Booking" → New booking added to mockBookings
7. Calendar refreshes → Shows new appointment
```

### 4. Booking Editing

**For Both Studio B and Station 1**:
```
User clicks existing booking → Drawer opens in EDIT mode
1. All fields pre-populate from mockBookings data
2. Slot shown but NOT editable:
   "Selected Slot (Read-Only): Morning Yoga 09:00-10:00"
3. Editable fields:
   - Client name
   - Party size
   - Status
   - Payment status
   - Notes
   - Starred
4. Click "Save Changes" → mockBookings updated
5. Calendar refreshes → Shows updated info
```

---

## Complete Alignment Checklist

✅ **Room Setup**:
- Studio B: room-1-1-2 ✓
- Station 1: room-2-1-1 ✓

✅ **Staff Assignment**:
- Sarah Johnson (2) → Studio B ✓
- Rosa Garcia (5) → Station 1 ✓

✅ **Room Assignments**:
- Define days, times, services for each staff ✓

✅ **Slots Definition**:
- Studio B: Fitness class slots with capacities ✓
- Station 1: Individual appointment slots ✓

✅ **Services**:
- Fitness services (yoga, pilates, zumba, training) ✓
- Nail services (manicure, pedicure, art) ✓

✅ **Bookings**:
- Studio B: Multiple people per slot (party size) ✓
- Station 1: Individual appointments ✓

✅ **Calendar Display**:
- Shows correct room, staff, service ✓
- Shows correct capacity and bookings ✓
- Shows correct slot information ✓

✅ **Drawer Functionality**:
- Service pre-selection ✓
- Slot read-only display ✓
- Booking creation ✓
- Booking editing ✓
- Booking deletion ✓

---

## Testing Scenarios

### Scenario 1: Book a Yoga Class at Studio B
```
1. Open Calendar
2. Select branch: "Luxe Hair Studio - Oxford"
3. Select room: "Studio B"
4. Navigate to Monday
5. Click "Morning Yoga Class" slot (09:00-10:00)
6. Drawer opens with:
   - Service: "Morning Yoga Class" (pre-selected)
   - Time: 09:00 - 10:00 (read-only)
   - Instructor: "Sarah Johnson" (display)
   - Capacity: 5/12 available
7. Enter client name: "John Doe"
8. Set party size: 1
9. Click "Create Booking"
10. Verify: Calendar shows updated capacity (6/12)
```

### Scenario 2: Book a Manicure at Station 1
```
1. Open Calendar
2. Select branch: "Bliss Nail Bar - King's Road"
3. Select room: "Station 1"
4. Navigate to Monday
5. Click available time slot (e.g., 09:00)
6. Drawer opens with:
   - Service: Can select from services dropdown
   - Time: 09:00 - 09:30 (editable)
   - Staff: "Rosa Garcia" (display)
7. Select service: "Gel Manicure"
8. Enter client name: "Jane Smith"
9. Click "Create Booking"
10. Verify: Calendar shows new appointment
```

### Scenario 3: Edit Studio B Booking
```
1. Click existing "Morning Yoga Class" booking
2. Drawer opens in EDIT mode with:
   - Service: "Morning Yoga Class" (display)
   - Slot: (Read-Only) "09:00 - 10:00"
   - Client name: "John Doe"
   - Party size: 1
3. Change party size to 2
4. Change status to "need_confirm"
5. Add notes: "Customer requested change"
6. Click "Save Changes"
7. Verify: Calendar refreshes, shows updated data
```

---

## Key Points to Remember

1. **Static Slots**: Both Studio B and Station 1 use pre-defined slots
   - Slots cannot be edited in the drawer
   - Slots are managed in the Shifts/Rooms management tabs
   - Bookings inside slots are what users edit

2. **Service Pre-Selection**: When clicking a slot, the service is automatically selected in the drawer

3. **Capacity Tracking**:
   - Studio B: Group capacity (multiple people per slot)
   - Station 1: Individual appointments (usually 1-2 per slot)

4. **Room Assignments**: Define which staff work in which rooms on which days

5. **Data Consistency**: All data flows from mock-data.ts through Zustand state to the UI

---

## Troubleshooting Alignment

If Studio B or Station 1 bookings don't show correctly:

1. **Check mock-data.ts**:
   - Verify room IDs match
   - Verify slot IDs in bookings match defined slots
   - Verify service IDs exist

2. **Check Calendar View**:
   - Verify correct branch is selected
   - Verify correct room is selected
   - Verify date filter includes booking dates

3. **Check Drawer State**:
   - Verify service pre-selection triggering on slot click
   - Verify all fields populating correctly

4. **Check Bookings Update**:
   - Verify Zustand state updates after save
   - Verify calendar refreshes after changes

---

**Ready to use!** Studio B and Station 1 are fully configured and aligned throughout the system. 🎯
