# Rooms Data Guide - Updated for Calendar Display

## Summary

All 8 rooms from the staff management system now have proper `roomType` properties set and will display in the calendar views with correct categorization.

---

## Rooms Available in Calendar

### FIXED CAPACITY ROOMS (6 rooms)

#### 1. Main Studio
- **ID**: `room-1`
- **Branch**: Luxe Hair Studio Oxford (1-1)
- **Capacity**: 20
- **Type**: Fixed
- **Floor**: 1st Floor
- **Amenities**: Air Conditioning, Mirrors, Sound System, WiFi
- **Services**: Haircut & Style, Color Treatment

#### 2. Private Room
- **ID**: `room-3`
- **Branch**: Luxe Hair Studio Oxford (1-1)
- **Capacity**: 5
- **Type**: Fixed
- **Floor**: 1st Floor
- **Amenities**: Air Conditioning, Mirrors
- **Services**: Color Treatment

#### 3. Station 1 (Nail Bar)
- **ID**: `room-5`
- **Branch**: Bliss Nail Bar King's Road (2-1)
- **Capacity**: 1
- **Type**: Fixed
- **Floor**: Main Floor
- **Amenities**: UV Lamp, Massage Chair, Music
- **Services**: Gel Manicure

#### 4. Station 2 (Nail Bar)
- **ID**: `room-6`
- **Branch**: Bliss Nail Bar King's Road (2-1)
- **Capacity**: 1
- **Type**: Fixed
- **Floor**: Main Floor
- **Amenities**: UV Lamp, Massage Chair, Music
- **Services**: Luxury Pedicure

#### 5. Chair 1 (Barber)
- **ID**: `room-7`
- **Branch**: Urban Barber Shoreditch (3-1)
- **Capacity**: 1
- **Type**: Fixed
- **Floor**: Ground Floor
- **Amenities**: Hot Towel Station, Shaving Tools, Music
- **Services**: Classic Cut, Hot Towel Shave

#### 6. Chair 2 (Barber)
- **ID**: `room-8`
- **Branch**: Urban Barber Brixton (3-2)
- **Capacity**: 1
- **Type**: Fixed
- **Floor**: Ground Floor
- **Amenities**: Hot Towel Station, Shaving Tools, Music
- **Services**: Classic Cut

---

### FLEXIBLE CAPACITY ROOMS (2 rooms)

#### 1. Yoga Room
- **ID**: `room-2`
- **Branch**: Luxe Hair Studio Oxford (1-1)
- **Capacity**: 15
- **Type**: Flexible
- **Floor**: 2nd Floor
- **Amenities**: Air Conditioning, Yoga Mats, Mirrors, Sound System
- **Services**: Highlights

#### 2. Spin Studio
- **ID**: `room-4`
- **Branch**: Luxe Hair Studio Soho (1-2)
- **Capacity**: 12
- **Type**: Flexible
- **Floor**: Ground Floor
- **Amenities**: Air Conditioning, Sound System, Lockers, Showers, WiFi
- **Services**: Haircut & Highlights

---

## Calendar Display Structure

Now in the calendar, you will see:

### Week View
```
STAFF SECTION
├── DYNAMIC STAFF (n)
└── STATIC STAFF - ASSIGNED TO ROOMS (n)

═══════════════════════════════════════════════════════════

ROOMS SECTION
├── FIXED CAPACITY ROOMS (6)
│   ├── Main Studio (Cap: 20)
│   ├── Private Room (Cap: 5)
│   ├── Station 1 (Cap: 1)
│   ├── Station 2 (Cap: 1)
│   ├── Chair 1 (Cap: 1)
│   └── Chair 2 (Cap: 1)
└── FLEXIBLE ROOMS (2)
    ├── Yoga Room (Cap: 15)
    └── Spin Studio (Cap: 12)
```

### Day View
```
┌────┬─────────────────────────────────────┬─────────────────────────────────────┐
│ TIME│        STAFF (Blue)                 │        ROOMS (Green)               │
│    ├──────────┬──────────────────────┬───┼───────────────┬──────────────────────┤
│    │ Dynamic  │ Static Staff         │   │ Fixed Cap.    │ Flexible             │
│    │          │ (grouped by room)    │   │               │                      │
└────┴──────────┴──────────────────────┴───┴───────────────┴──────────────────────┘
```

---

## What Changed

### Before
- Rooms were not displayed in calendar (only 8 basic room names)
- No room categorization
- Missing room properties like capacity and type

### After
- ✅ All 8 rooms from staff management now appear
- ✅ Rooms properly categorized as Fixed or Flexible
- ✅ Each room shows capacity
- ✅ Correct branch association
- ✅ Floor, amenities, and services visible
- ✅ Clean two-layer separation in calendar

---

## Data Synchronization

The rooms are now synchronized between:
1. **Staff Management** → Rooms Tab
2. **Calendar** → Room display in both views
3. **useStaffManagementStore** → Used for calendar data

### Update Flow
```
Staff Management (Staff Management UI)
        ↓
mockManagedRooms (with roomType)
        ↓
useStaffManagementStore (rooms property)
        ↓
Calendar Views (day & week)
        ↓
Displayed with grouping & categorization
```

---

## Room Type Details

### Fixed Capacity Rooms (`roomType: 'fixed'`)
- Specific, fixed capacity number
- Typically single-person workstations or small rooms
- Examples: Barber chairs (1), Nail stations (1), Private rooms (5)
- Color: Green background in calendar

### Flexible Capacity Rooms (`roomType: 'flexible'`)
- Variable capacity
- Can accommodate groups
- Examples: Yoga Room (15), Spin Studio (12)
- Color: Light Green background in calendar

---

## Testing the Rooms

### Quick Visual Test

**Week View:**
1. ✅ Open Calendar → Week View
2. ✅ Scroll to ROOMS SECTION
3. ✅ See "FIXED CAPACITY ROOMS (6)" header
4. ✅ See "FLEXIBLE ROOMS (2)" header
5. ✅ All 8 rooms listed with capacity

**Day View:**
1. ✅ Open Calendar → Day View
2. ✅ Look at header row 2 (Layer 2)
3. ✅ See "Fixed Cap." and "Flexible" sections
4. ✅ Scroll right to see all rooms
5. ✅ Each shows capacity chip

### Verification Steps

1. **Correct Count?**
   - Fixed Rooms: 6 (Main Studio, Private Room, Station 1, Station 2, Chair 1, Chair 2)
   - Flexible Rooms: 2 (Yoga Room, Spin Studio)
   - Total: 8 rooms

2. **Correct Capacity?**
   - Main Studio: 20
   - Yoga Room: 15
   - Spin Studio: 12
   - Private Room: 5
   - All others (Station 1/2, Chair 1/2): 1

3. **Correct Separation?**
   - Fixed rooms grouped together (green)
   - Flexible rooms grouped together (light green)
   - Clear visual divider from staff section

4. **Avatar Display?**
   - All rooms show green avatar with tools icon (🔧)
   - No photos
   - Initials not applicable to rooms

---

## File Changes

### Modified Files

**`src/bookly/data/staff-management-mock-data.ts`**
- Added `roomType: 'fixed'` to rooms:
  - room-1 (Main Studio)
  - room-3 (Private Room)
  - room-5 (Station 1)
  - room-6 (Station 2)
  - room-7 (Chair 1)
  - room-8 (Chair 2)

- Added `roomType: 'flexible'` to rooms:
  - room-2 (Yoga Room)
  - room-4 (Spin Studio)

### No Changes Needed
- Calendar views (already using `useStaffManagementStore`)
- Calendar utilities (already support roomType)
- Staff management system (unchanged)

---

## Rooms in Sync Across the App

Now both the staff management tabs and calendar display the same rooms with consistent categorization:

### Staff Management
- Rooms Tab → Shows all 8 rooms with types
- Can edit room properties
- Can assign services to rooms

### Calendar
- Day View → Shows rooms in two-layer structure
- Week View → Shows rooms grouped by type
- Click interactions available

---

## Summary

✅ **All 8 rooms now properly displayed in calendar**
✅ **Rooms categorized as Fixed or Flexible**
✅ **Clear visual separation from staff section**
✅ **Two-layer grouping implemented**
✅ **Data synchronized with staff management**
✅ **No breaking changes**

The calendar now shows the complete picture:
- **STAFF**: Dynamic and Static (by room)
- **ROOMS**: Fixed and Flexible capacity

All organized in a clear, hierarchical structure! 🎉

---

**Status**: ✅ Rooms integrated and verified
**Rooms Displayed**: 8/8
**Type Coverage**: 100% (6 fixed, 2 flexible)
**Data Sync**: Active (from staff management store)
