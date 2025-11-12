# Bookly Business Logic Documentation

**Last Updated**: January 2025
**Version**: 2.0

This document serves as the comprehensive source of truth for Bookly's business logic, data models, and core features. It covers both the customer-facing booking experience and the business dashboard calendar management system.

---

## Table of Contents

1. [Core Business Models](#core-business-models)
2. [Scheduling Modes](#scheduling-modes)
3. [Multi-Branch Architecture](#multi-branch-architecture)
4. [Room & Facility Management](#room--facility-management)
5. [Staff Management](#staff-management)
6. [Template System](#template-system)
7. [Calendar Features](#calendar-features)
8. [Booking Flow](#booking-flow)
9. [Registration Wizard](#registration-wizard)
10. [Data Models & Relationships](#data-models--relationships)
11. [State Management](#state-management)

---

## Core Business Models

### Business Types

Bookly supports various business verticals, each with different operational patterns:

| Business Type | Typical Scheduling | Examples |
|--------------|-------------------|----------|
| Salon & Spa | Dynamic (appointment-based) | Hair salons, day spas |
| Barbershop | Dynamic (appointment-based) | Traditional barbershops, grooming |
| Beauty | Dynamic (appointment-based) | Nail salons, beauty studios |
| Massage | Dynamic (appointment-based) | Massage therapy, bodywork |
| Fitness | Static (class-based) | Gyms, yoga studios, crossfit |
| Wellness | Static (class-based) | Meditation centers, wellness studios |
| Education | Static (class-based) | Dance schools, music lessons, tutoring |
| Pet Care | Dynamic (appointment-based) | Groomers, veterinarians |
| Healthcare | Dynamic (appointment-based) | Clinics, therapy practices |

### Business Entity Structure

```typescript
interface Business {
  id: string
  name: string
  email: string
  description: string
  categories: string[]

  // Approval workflow
  approved: boolean

  // Multi-branch support
  branches: Branch[]

  // Scheduling configuration
  schedulingMode: 'static' | 'dynamic'

  // Resources
  staff: StaffMember[]
  rooms?: Room[]  // Only for static mode

  // For static mode
  scheduleTemplates?: ScheduleTemplate[]
  staticSlots?: StaticServiceSlot[]

  // Media
  logo?: string
  coverImage?: string
  galleryImages: string[]

  // Contact & location
  phone?: string
  socialLinks?: string[]

  // Operating hours
  workingHours: {
    [day: string]: {
      open: string
      close: string
      isOpen: boolean
    }
  }

  // Settings
  acceptsOnlineBooking: boolean
  publicUrlSlug: string
  timezone: string
}
```

---

## Scheduling Modes

Bookly supports two fundamentally different scheduling approaches to accommodate different business models.

### Dynamic Scheduling (Appointment-Based)

**Best for**: Service-based businesses where customers book specific staff members for individual services.

**Characteristics**:
- **Staff-centric**: Appointments are assigned to specific staff members
- **Flexible timing**: Appointments can be scheduled at any available time
- **One-to-one or one-to-few**: Typically single customer, but can support overlapping appointments
- **Service-based**: Each appointment is for a specific service with defined duration and price

**How it works**:
1. Customer selects a service
2. System shows available staff members
3. Customer picks preferred date/time
4. Appointment is created and assigned to the chosen staff member
5. Staff member's availability is blocked for that time slot

**Examples**: Haircut at 2:00 PM with Sarah, Massage at 10:30 AM with John

**Calendar View**: Shows staff members as columns/rows with their individual appointments

### Static Scheduling (Class-Based)

**Best for**: Class-based businesses with fixed schedules and group sessions.

**Characteristics**:
- **Room-centric**: Classes are held in specific rooms/facilities
- **Fixed schedule**: Classes occur at predetermined times (e.g., "Yoga every Monday at 9 AM")
- **Capacity-based**: Each class has a maximum number of participants
- **Template-driven**: Weekly schedules are defined as templates that repeat
- **Group bookings**: Multiple customers book into the same class slot

**How it works**:
1. Business creates schedule templates defining weekly class patterns
2. Templates generate actual class slots for upcoming weeks
3. Customers browse available classes and time slots
4. Customer books a spot in a class (subject to capacity)
5. Class capacity decreases; when full, no more bookings allowed

**Examples**:
- Yoga Class (Mon 9-10 AM, Room A, 20/25 spots filled)
- Spin Class (Wed 6-7 PM, Room B, 12/15 spots filled)

**Calendar View**: Shows rooms as columns/rows with scheduled classes and capacity indicators

### Scheduling Mode Selection

During registration, businesses are guided to choose the appropriate mode:

```typescript
// Auto-suggestions based on business type
const SCHEDULING_MODE_SUGGESTIONS = {
  'Fitness': 'static',
  'Wellness': 'static',
  'Education': 'static',
  'Salon & Spa': 'dynamic',
  'Barbershop': 'dynamic',
  'Beauty': 'dynamic',
  'Massage': 'dynamic',
  'Pet Care': 'dynamic',
  'Healthcare': 'dynamic',
  'Other': 'dynamic'
}
```

The wizard provides clear explanations:

**Static Mode Features**:
- Fixed weekly class schedules
- Room-based organization
- Capacity management
- Recurring templates
- Group bookings

**Dynamic Mode Features**:
- Flexible appointment times
- Staff-based scheduling
- Individual service bookings
- Custom time slots
- One-on-one or small group sessions

---

## Multi-Branch Architecture

Bookly supports businesses operating across multiple physical locations.

### Branch Model

```typescript
interface Branch {
  id: string
  name: string

  // Address
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string

  // Contact
  phone?: string

  // Location data
  timezone: string
  latitude?: number
  longitude?: number
  placeId?: string  // Google Places ID
  formattedAddress?: string

  // Designation
  isMainBranch: boolean
}
```

### Multi-Branch Behavior

1. **During Registration**:
   - Business indicates if they have multiple branches
   - Main branch is created first (from location step)
   - Additional branches can be added via dialog
   - At least one branch is required

2. **Staff Assignment**:
   - Staff members can be assigned to one or more branches
   - Owner is automatically assigned to all branches
   - Each staff member has `branchIds: string[]`

3. **Room Assignment** (Static Mode Only):
   - Each room belongs to exactly one branch
   - Rooms cannot span multiple branches
   - Calendar can filter by branch to show room-specific schedules

4. **Calendar Filtering**:
   - "All Branches" shows combined schedule across locations
   - Single branch filter shows only that location's data
   - Useful for multi-location businesses to manage each location separately

### Branch Management in Calendar

The calendar header includes branch filters:

```typescript
interface BranchFilter {
  allBranches: boolean  // Show all branches
  branchIds: string[]   // Selected branch IDs
}
```

When filtering by branch:
- Staff filter automatically shows only staff assigned to selected branches
- Room filter shows only rooms in selected branches (static mode)
- Appointments/classes are filtered accordingly

---

## Room & Facility Management

**Only applicable in Static Scheduling Mode**

Rooms represent physical spaces where classes/group sessions are held.

### Room Model

```typescript
interface Room {
  id: string
  name: string

  // Capacity
  capacity: number  // Maximum participants

  // Branch assignment
  branchId: string  // Belongs to one branch

  // Location details
  floor?: string    // e.g., "1st Floor", "Basement"

  // Features
  amenities?: string[]  // e.g., ["Air Conditioning", "Mirrors", "Sound System"]

  // Calendar display
  color?: string    // Color coding for calendar views
}
```

### Room Features

**Amenities** (configurable during setup):
- Air Conditioning
- Heating
- Mirrors
- Sound System
- Projector
- Yoga Mats
- Weights
- Cardio Equipment
- Showers
- Lockers
- Water Fountain
- WiFi
- Parking
- Wheelchair Accessible

### Room-Based Scheduling

In static mode, the calendar can display:

1. **Multi-Room Day View**: All rooms as columns, showing daily schedule
2. **Multi-Room Week View**: All rooms as rows, showing weekly grid
3. **Single-Room Views**: Focus on one room's schedule

Each class/slot is assigned to a specific room:

```typescript
interface StaticServiceSlot {
  id: string
  roomId: string       // Which room
  branchId: string     // Which branch
  serviceId: string    // What class/service
  capacity: number     // Max participants
  // ... timing and other details
}
```

### Room Capacity Management

- Each room has a **maximum capacity**
- Each class slot inherits or overrides room capacity
- Bookings are tracked against slot capacity
- When a slot reaches capacity, it becomes unavailable for new bookings
- Visual indicators show remaining spots (e.g., "12/15 spots filled")

---

## Staff Management

Staff members can work in either scheduling mode but their role differs.

### Staff Model

```typescript
interface StaffMember {
  id: string
  name: string
  role: string          // e.g., "Owner", "Instructor", "Stylist"

  // Special designation
  isOwner?: boolean     // Business owner

  // Multi-branch assignment
  branchIds: string[]   // Can work at multiple locations

  // Contact
  email?: string
  phone?: string

  // Calendar display
  color?: string        // Color coding for appointments/classes

  // Availability
  workingHours?: WorkingHours

  // Skills
  specialization?: string[]  // Services they can provide
}
```

### Staff in Dynamic Mode

- **Primary resource**: Customers book appointments with specific staff
- **Availability**: Based on working hours and existing appointments
- **Calendar view**: Staff members shown as separate calendars/columns
- **Overlapping appointments**: Controlled by `maxConcurrentBookings` (default: 1)

### Staff in Static Mode

- **Instructor role**: Assigned to teach specific classes
- **Optional assignment**: Classes can have an instructor or be unassigned
- **Calendar view**: Shows which staff member is teaching each class
- **Multiple classes**: Staff can be assigned to multiple class slots

### Staff Color Coding

Each staff member is assigned a color for visual identification:

```typescript
const STAFF_COLORS = [
  '#1976d2', // Blue
  '#388e3c', // Green
  '#d32f2f', // Red
  '#f57c00', // Orange
  '#7b1fa2', // Purple
  '#0097a7', // Cyan
  '#c2185b', // Pink
  '#5d4037', // Brown
  '#455a64', // Blue Grey
  '#f9a825'  // Yellow
]
```

Colors are used consistently across:
- Calendar events
- Staff filters
- Staff management UI
- Appointment cards

### Staff Working Hours

```typescript
interface WorkingHours {
  [day: string]: {
    isWorking: boolean
    shifts: TimeSlot[]
  }
}

interface TimeSlot {
  start: string  // "09:00"
  end: string    // "17:00"
}
```

Working hours define when staff are available for bookings or classes.

---

## Template System

**Only applicable in Static Scheduling Mode**

Templates define recurring weekly class schedules that automatically generate class slots.

### Schedule Template Model

```typescript
interface ScheduleTemplate {
  id: string
  name: string              // e.g., "Fall 2025 Schedule"
  businessId: string
  branchId: string          // Template applies to one branch

  // Active period
  activeFrom: Date          // When template starts generating slots
  activeUntil: Date | null  // null = ongoing indefinitely
  isActive: boolean         // Master on/off switch

  // Weekly pattern
  weeklyPattern: WeeklySlotPattern[]

  // Metadata
  createdAt: Date
  updatedAt: Date
}
```

### Weekly Slot Pattern

Each template contains a weekly pattern of slots:

```typescript
interface WeeklySlotPattern {
  id: string                // Unique ID for this pattern slot
  dayOfWeek: DayOfWeek      // 'Mon' | 'Tue' | 'Wed' | ...
  startTime: string         // "09:00"
  endTime: string           // "10:00"

  // Class details
  serviceId: string
  serviceName: string

  // Location
  roomId: string            // Which room

  // Capacity
  capacity: number          // Max participants

  // Staff
  instructorStaffId?: string

  // Pricing
  price: number
}
```

### How Templates Work

1. **Template Creation**:
   - During registration or later in dashboard
   - Define weekly recurring schedule (e.g., "Yoga Mon/Wed/Fri 9-10 AM")
   - Set active period (start date, optional end date)

2. **Slot Generation**:
   - System automatically generates actual class slots from templates
   - Creates slots for visible date range (typically 2-3 months ahead)
   - Each generated slot links back to template via `templateId`

3. **Generated Static Slots**:

```typescript
interface StaticServiceSlot {
  id: string
  roomId: string
  branchId: string

  // Timing
  date?: string             // "2025-01-15" for specific date
  dayOfWeek?: DayOfWeek     // For recurring slots
  startTime: string         // "09:00"
  endTime: string           // "10:00"

  // Class details
  serviceId: string
  serviceName: string
  capacity: number
  instructorStaffId?: string
  price: number

  // Template relationship
  templateId?: string       // Links to parent template

  // Overrides
  isOverride?: boolean      // True if this overrides template for specific date
  isCancelled?: boolean     // True if cancelling template occurrence
  overrideDate?: string     // Specific date for override
}
```

4. **Template Overrides**:
   - Business can override a single occurrence (e.g., "Cancel Yoga on Dec 25")
   - Create `isOverride: true` slot for that specific date
   - Or `isCancelled: true` to remove a single occurrence

### Template Management

Templates can be managed through:

1. **Initial Setup** (during registration):
   - Basic template creation via [InitialTemplatesStep](src/views/RegisterWizard/steps/InitialTemplatesStep.tsx)
   - Define class name, room, instructor, schedule

2. **Template Dashboard** (post-registration):
   - Full CRUD operations on templates
   - Visual weekly grid editor
   - Bulk operations (activate/deactivate, clone, archive)

### Template Use Cases

**Fitness Studio Example**:
```
Template: "Spring 2025 Classes"
Active: Jan 1 - May 31, 2025

Weekly Pattern:
- Mon 9-10 AM: Yoga (Room A, 20 capacity, Instructor: Sarah)
- Mon 6-7 PM: Spin (Room B, 15 capacity, Instructor: Mike)
- Wed 9-10 AM: Yoga (Room A, 20 capacity, Instructor: Sarah)
- Wed 6-7 PM: HIIT (Room B, 12 capacity, Instructor: John)
- Fri 9-10 AM: Yoga (Room A, 20 capacity, Instructor: Sarah)
- Fri 6-7 PM: Spin (Room B, 15 capacity, Instructor: Mike)
```

This generates 18 class slots per week automatically, extending through May 2025.

---

## Calendar Features

The calendar is the central hub for viewing and managing bookings/classes.

### Calendar Views

Bookly uses custom calendar views built on FullCalendar:

| View Type | Code | Description | Best For |
|-----------|------|-------------|----------|
| Month | `dayGridMonth` | Month grid view | Overview, planning |
| Week | `timeGridWeek` | Week with time slots | Detailed scheduling |
| Day | `timeGridDay` | Single day timeline | Day-to-day operations |
| List | `listMonth` | List format | Mobile, simple view |

### Custom View Modes

Beyond standard FullCalendar views, Bookly implements custom views:

#### Dynamic Mode Views

1. **Single Staff Day View**: One staff member's daily schedule
2. **Single Staff Week View**: One staff member's weekly schedule
3. **Multi-Staff Day View**: All staff side-by-side for one day
4. **Multi-Staff Week View**: All staff in weekly grid

#### Static Mode Views

1. **Single Room Day View**: One room's daily class schedule
2. **Single Room Week View**: One room's weekly class schedule
3. **Multi-Room Day View**: All rooms side-by-side for one day
4. **Multi-Room Week View**: All rooms in weekly grid

### View Switching Logic

The calendar automatically switches between FullCalendar and custom views:

```typescript
// When to use custom views
const useCustomView =
  (schedulingMode === 'static') ||
  (schedulingMode === 'dynamic' && staffFilters.selectedStaffId)

// Custom view selection
const customViewType = schedulingMode === 'static'
  ? (roomFilters.roomIds.length === 1 ? 'single-room' : 'multi-room')
  : (staffFilters.selectedStaffId ? 'single-staff' : 'multi-staff')
```

### Calendar State

```typescript
interface CalendarState {
  // View configuration
  view: CalendarView
  displayMode: DisplayMode       // 'full' | 'fit'
  colorScheme: ColorScheme       // 'vivid' | 'pastel'

  // Date navigation
  visibleDateRange: { start: Date; end: Date } | null
  selectedDate: Date | null
  selectedDateRange: { start: Date; end: Date } | null

  // Filters
  branchFilters: BranchFilter
  staffFilters: StaffFilter
  roomFilters: RoomFilter       // Only for static mode
  highlights: HighlightFilters

  // Data
  events: CalendarEvent[]
  staticSlots: StaticServiceSlot[]  // Only for static mode
  scheduleTemplates: ScheduleTemplate[]  // Only for static mode
  rooms: Room[]                 // Only for static mode

  // UI state
  starredIds: Set<string>
  selectedEvent: CalendarEvent | null
  isSettingsOpen: boolean
  isNotificationsOpen: boolean
  isSidebarOpen: boolean
  isNewBookingOpen: boolean
  isAppointmentDrawerOpen: boolean
  isTemplateManagementOpen: boolean  // Only for static mode

  // Mode
  schedulingMode: SchedulingMode

  // Error handling
  lastActionError: string | null

  // Navigation
  previousStaffFilters: StaffFilter | null
}
```

### Filtering System

#### Branch Filters

```typescript
interface BranchFilter {
  allBranches: boolean  // Show all branches
  branchIds: string[]   // Specific branches to show
}
```

- Cascades to staff and room filters
- Selecting a branch filters staff/rooms to that location

#### Staff Filters

```typescript
interface StaffFilter {
  onlyMe: boolean           // Show only current user's appointments
  staffIds: string[]        // Show specific staff members
  selectedStaffId?: string  // Single-staff view mode (custom view)
}
```

- In dynamic mode, primary filter
- In static mode, filters classes by instructor

#### Room Filters (Static Mode Only)

```typescript
interface RoomFilter {
  allRooms: boolean     // Show all rooms
  roomIds: string[]     // Specific rooms to show
}
```

- Only visible in static mode
- Selecting single room enables single-room custom view

#### Highlight Filters

```typescript
interface HighlightFilters {
  payments: PaymentStatus[]          // 'paid' | 'unpaid'
  statuses: AppointmentStatus[]      // 'confirmed', 'pending', etc.
  selection: SelectionMethod[]       // 'by_client' | 'automatically'
  details: ('starred' | 'unstarred')[]
}
```

Highlights don't hide events; they visually emphasize matching criteria.

### Calendar Events

```typescript
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date

  extendedProps: {
    // Status
    status: AppointmentStatus
    paymentStatus: PaymentStatus

    // Staff
    staffId: string
    staffName: string

    // Service
    serviceName: string

    // Customer
    customerName: string

    // Booking method
    selectionMethod: SelectionMethod

    // Flags
    starred: boolean

    // Financial
    price: number

    // Additional
    notes?: string
    bookingId: string

    // Static mode specific
    slotId?: string       // Links to StaticServiceSlot
    roomId?: string       // Which room
    partySize?: number    // Group size (default 1)
  }
}
```

### Color Coding

**Dynamic Mode**: Events are colored by staff member
- Each staff has an assigned color
- All their appointments show in that color

**Static Mode**: Events are colored by room
- Each room has an assigned color
- All classes in that room show in that color

**Color Schemes**:
- **Vivid**: High-contrast, saturated colors
- **Pastel**: Soft, muted colors (easier on eyes for long sessions)

### Calendar Settings

Users can configure:

1. **View Preferences**:
   - Default view (month/week/day)
   - Display mode (full width vs fit content)
   - Color scheme

2. **Display Options**:
   - Show/hide weekends
   - Time slot duration
   - Start/end of business hours

3. **Filter Defaults**:
   - Default branch selection
   - Default staff selection (dynamic mode)
   - Default room selection (static mode)

Settings are persisted to localStorage and restored on load.

---

## Booking Flow

### Dynamic Mode Booking (Appointment-Based)

**Customer Journey**:

1. **Service Selection**:
   - Browse business profile
   - Select desired service (e.g., "Haircut - 45 min - $30")

2. **Staff Selection**:
   - View available staff members who provide this service
   - Optionally filter by specialization
   - Choose preferred staff or "First Available"

3. **Date/Time Selection**:
   - Calendar shows staff availability
   - Grey out unavailable slots
   - Select preferred date and time

4. **Booking Confirmation**:
   - Review: Service, Staff, Date, Time, Price
   - Add notes (optional)
   - Confirm booking

5. **Confirmation**:
   - Booking ID generated
   - Status: `pending` or `confirmed` (based on business settings)
   - Email/SMS confirmation sent

**Business Dashboard**:
- New appointment appears on staff member's calendar
- Staff is notified
- Appointment blocks staff availability for that time
- Business can edit, reschedule, or cancel

### Static Mode Booking (Class-Based)

**Customer Journey**:

1. **Class Browse**:
   - View class schedule (e.g., "Yoga Classes")
   - See upcoming class slots with dates/times

2. **Slot Selection**:
   - Choose specific class date/time
   - View capacity (e.g., "12/15 spots available")
   - View instructor, room, price

3. **Party Size**:
   - Specify number of attendees (default: 1)
   - Check against remaining capacity

4. **Booking Confirmation**:
   - Review: Class, Date, Time, Location (Room), Party Size, Total Price
   - Add notes (optional)
   - Confirm booking

5. **Confirmation**:
   - Booking ID generated
   - Slot capacity updated (e.g., now "13/15 spots")
   - Status: `confirmed`
   - Email/SMS confirmation sent

**Business Dashboard**:
- Booking appears in class slot on calendar
- Capacity indicator updates
- When capacity is reached, slot becomes unavailable
- Business can view attendee list, check-in participants

### Booking Statuses

```typescript
type AppointmentStatus =
  | 'pending'      // Awaiting business confirmation
  | 'confirmed'    // Confirmed by business
  | 'completed'    // Service completed
  | 'cancelled'    // Cancelled by customer or business
  | 'no_show'      // Customer didn't show up
  | 'need_confirm' // Requires customer confirmation
```

### Payment Statuses

```typescript
type PaymentStatus =
  | 'paid'    // Payment received
  | 'unpaid'  // Payment pending
```

### Booking Modifications

**Reschedule**:
- Customer or business can reschedule
- In dynamic mode: Find new available slot with same staff/service
- In static mode: Move to different class slot (subject to capacity)

**Cancel**:
- Customer or business can cancel
- Dynamic mode: Frees up staff time slot
- Static mode: Increases class capacity

**No-Show**:
- Business marks customer as no-show
- May trigger policies (e.g., charge cancellation fee, restrict future bookings)

---

## Registration Wizard

The registration wizard captures all necessary business information during onboarding.

### Wizard Flow

The wizard has **7 steps** that adapt based on scheduling mode:

#### Base Steps (All Businesses)

1. **Account** ([AccountStep.tsx](src/views/RegisterWizard/steps/AccountStep.tsx))
   - Owner name
   - Email
   - Password

2. **Mobile Verification** ([MobileVerificationStep.tsx](src/views/RegisterWizard/steps/MobileVerificationStep.tsx))
   - Phone number
   - OTP verification
   - *Note: Hidden for Egypt deployment*

3. **Business Basics** ([BusinessBasicsStep.tsx](src/views/RegisterWizard/steps/BusinessBasicsStep.tsx))
   - Business name
   - Business type (Salon, Fitness, etc.)
   - Staff count
   - Services offered

4. **Scheduling Mode** ([SchedulingModeStep.tsx](src/views/RegisterWizard/steps/SchedulingModeStep.tsx))
   - Choose: Static vs Dynamic
   - Auto-suggested based on business type
   - Clear explanation of differences

5. **Location** ([LocationStep.tsx](src/views/RegisterWizard/steps/LocationStep.tsx))
   - Google Maps address autocomplete
   - Multi-branch support
   - Main branch creation
   - Add additional branches via dialog

#### Conditional Steps (Static Mode Only)

6. **Rooms Setup** ([RoomsSetupStep.tsx](src/views/RegisterWizard/steps/RoomsSetupStep.tsx))
   - **Only shown if schedulingMode === 'static'**
   - Add rooms/facilities
   - Set capacity, floor, amenities
   - Assign to branches

#### Continuing Base Steps

7. **Business Profile** ([BusinessProfileStep.tsx](src/views/RegisterWizard/steps/BusinessProfileStep.tsx))
   - Public URL slug
   - Working hours
   - Online booking settings

8. **Staff Management** ([StaffManagementStep.tsx](src/views/RegisterWizard/steps/StaffManagementStep.tsx))
   - Owner auto-added
   - Add team members
   - Assign to branches
   - Set roles, colors

#### Conditional Steps (Static Mode Only)

9. **Initial Templates** ([InitialTemplatesStep.tsx](src/views/RegisterWizard/steps/InitialTemplatesStep.tsx))
   - **Only shown if schedulingMode === 'static'**
   - **Optional step** (can skip)
   - Create basic class schedule templates
   - Define weekly recurring classes

#### Final Step

10. **Legal** ([LegalStep.tsx](src/views/RegisterWizard/steps/LegalStep.tsx))
    - Accept Terms of Service
    - Accept Privacy Policy
    - Marketing opt-in

### Dynamic Step Generation

```typescript
const getSteps = (schedulingMode: 'static' | 'dynamic' | '') => {
  const steps = [...baseSteps]

  // Add rooms step for static mode
  if (schedulingMode === 'static') {
    steps.push(...staticModeSteps)  // Rooms Setup
  }

  steps.push(...profileAndStaffSteps)

  // Add templates step for static mode
  if (schedulingMode === 'static') {
    steps.push(...templateStep)  // Initial Templates
  }

  steps.push(...legalStep)
  return steps
}
```

This ensures:
- Dynamic mode businesses: 7 steps total
- Static mode businesses: 9 steps total (includes Rooms + Templates)

### Registration Data Model

Full structure captured during registration:

```typescript
interface BusinessRegistrationData {
  // Account (Step 1)
  email: string
  password: string
  ownerName: string

  // Mobile (Step 2)
  countryCode: string
  phone: string
  otp: string

  // Business Basics (Step 3)
  businessName: string
  businessType: string
  staffCount: string
  servicesOffered: string[]

  // Scheduling Mode (Step 4)
  schedulingMode: 'static' | 'dynamic' | ''

  // Location (Step 5)
  hasMultipleBranches: boolean
  branches: Branch[]
  // Legacy single branch fields for backward compatibility
  country: string
  addressLine1: string
  city: string
  // ... etc

  // Rooms (Step 6 - Static Only)
  rooms: Room[]

  // Profile (Step 7)
  publicUrlSlug: string
  timezone: string
  workingHours: {...}
  acceptsOnlineBooking: boolean

  // Staff (Step 8)
  staff: StaffMember[]

  // Templates (Step 9 - Static Only)
  initialTemplates: BasicTemplate[]

  // Legal (Step 10)
  acceptTerms: boolean
  acceptPrivacy: boolean
  marketingOptIn: boolean
}
```

### Post-Registration

After completing wizard:

1. **Approval Workflow**:
   - Business status: `approved: false`
   - Shows [ApprovalBanner](src/components/ApprovalBanner.tsx)
   - Super admin reviews and approves

2. **Pending State**:
   - Business can prepare: add services, configure staff, upload photos
   - Cannot receive customer bookings yet
   - Profile not visible in public search

3. **After Approval**:
   - `approved: true`
   - Business goes live
   - Appears in customer search
   - Can receive bookings
   - Public profile accessible

See [RegistrationSuccess.tsx](src/views/RegisterWizard/RegistrationSuccess.tsx) for post-registration messaging.

---

## Data Models & Relationships

### Entity Relationship Diagram

```
Business
  ├── has many Branches
  ├── has many Staff (assigned to branches)
  ├── has many Services
  ├── has Scheduling Mode (static | dynamic)
  │
  ├── IF Static Mode:
  │   ├── has many Rooms (per branch)
  │   ├── has many ScheduleTemplates
  │   └── has many StaticServiceSlots (generated from templates)
  │
  └── has many Bookings

Branch
  ├── belongs to Business
  ├── has many Rooms (if static mode)
  └── has many Staff (many-to-many)

Room (Static Mode Only)
  ├── belongs to Branch
  └── has many StaticServiceSlots

Staff
  ├── belongs to Business
  ├── assigned to many Branches (many-to-many)
  ├── IF Dynamic Mode: has many Appointments
  └── IF Static Mode: instructs many Classes

Service
  ├── belongs to Business
  ├── IF Dynamic Mode: bookable for Appointments
  └── IF Static Mode: offered as Classes in Slots

ScheduleTemplate (Static Mode Only)
  ├── belongs to Business
  ├── belongs to Branch
  └── generates many StaticServiceSlots

StaticServiceSlot (Static Mode Only)
  ├── belongs to Room
  ├── belongs to Branch
  ├── references Service
  ├── references Template (optional)
  └── has many Bookings (up to capacity)

Booking
  ├── belongs to Business
  ├── belongs to Branch
  ├── references Service
  ├── IF Dynamic Mode:
  │   └── assigned to Staff
  └── IF Static Mode:
      ├── assigned to StaticServiceSlot
      └── assigned to Room
```

### Key Relationships

**Business ↔ Branches** (One-to-Many)
- Every business has at least one branch (main branch)
- Each branch belongs to exactly one business

**Business ↔ Staff** (One-to-Many)
- Staff members belong to one business
- Business has multiple staff members

**Staff ↔ Branches** (Many-to-Many)
- Staff can work at multiple branches
- Each branch can have multiple staff members
- Stored as `staffMember.branchIds: string[]`

**Branch ↔ Rooms** (One-to-Many, Static Mode Only)
- Each room belongs to exactly one branch
- Branch can have multiple rooms

**Room ↔ StaticServiceSlots** (One-to-Many, Static Mode Only)
- Each slot is held in exactly one room
- Room hosts multiple slots over time

**ScheduleTemplate ↔ StaticServiceSlots** (One-to-Many, Static Mode Only)
- Template generates multiple slots
- Each generated slot references its template via `templateId`

**StaticServiceSlot ↔ Bookings** (One-to-Many, Static Mode Only)
- Each booking in static mode references a specific slot
- Slot can have multiple bookings (up to capacity)

**Staff ↔ Bookings** (One-to-Many, Dynamic Mode)
- Each booking/appointment is assigned to one staff member
- Staff member has multiple appointments

---

## State Management

Bookly uses **Zustand** for state management across the application.

### Calendar State Store

Location: [src/bookly/features/calendar/state.ts](src/bookly/features/calendar/state.ts)

```typescript
interface CalendarStore extends CalendarState {
  // Actions
  setView: (view: CalendarView) => void
  setDisplayMode: (mode: DisplayMode) => void
  setColorScheme: (scheme: ColorScheme) => void
  setVisibleDateRange: (range: { start: Date; end: Date } | null) => void

  // Branch filters
  setBranchFilters: (filters: BranchFilter) => void

  // Staff filters
  setStaffFilters: (filters: StaffFilter) => void
  selectStaffMember: (staffId: string | null) => void  // Single-staff view

  // Room filters (static mode)
  setRoomFilters: (filters: RoomFilter) => void

  // Highlights
  setHighlights: (highlights: HighlightFilters) => void

  // Events
  setEvents: (events: CalendarEvent[]) => void
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  // Static mode data
  setStaticSlots: (slots: StaticServiceSlot[]) => void
  setScheduleTemplates: (templates: ScheduleTemplate[]) => void
  setRooms: (rooms: Room[]) => void

  // UI state
  toggleStar: (eventId: string) => void
  setSelectedEvent: (event: CalendarEvent | null) => void
  openSettings: () => void
  closeSettings: () => void
  openNewBooking: () => void
  closeNewBooking: () => void
  openAppointmentDrawer: () => void
  closeAppointmentDrawer: () => void

  // Preferences
  savePreferences: () => void
  loadPreferences: () => void

  // Scheduling mode
  setSchedulingMode: (mode: SchedulingMode) => void
}
```

### Auth State Store

Location: `src/stores/authStore.ts` (or similar)

Manages user authentication and business context:

```typescript
interface AuthStore {
  user: User | null
  business: Business | null
  isOwner: boolean

  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setMaterializeUser: (user: User) => void
}
```

### Persistence

**Calendar Preferences**: Saved to localStorage
- View mode, color scheme, default filters
- Restored on app load
- Key: `calendar-preferences:${businessId}`

**Registration Draft**: Saved to localStorage
- Auto-saves wizard progress
- Restored if user returns before completing
- Key: `business-register-draft:v1:${lang}`

**Auth Token**: Saved to localStorage/cookies
- JWT token for authenticated requests
- Restored on page reload

---

## API Integration Points

### Business Registration

**Endpoint**: `POST /business/register`

**Payload**:
```typescript
{
  name: string
  owner: {
    name: string
    email: string
    password: string
  }
  email?: string
  description?: string
  socialLinks?: string[]
  logo?: string

  // Extended for static/dynamic mode
  schedulingMode: 'static' | 'dynamic'
  branches: Branch[]
  staff: StaffMember[]
  rooms?: Room[]  // If static mode
  initialTemplates?: BasicTemplate[]  // If static mode
}
```

### Calendar Data Fetching

**Dynamic Mode**:
- `GET /staff` - Fetch staff members
- `GET /branches` - Fetch branches
- `GET /bookings?from={date}&to={date}` - Fetch appointments

**Static Mode**:
- `GET /branches` - Fetch branches
- `GET /rooms` - Fetch rooms
- `GET /schedule-templates` - Fetch templates
- `GET /static-slots?from={date}&to={date}` - Fetch class slots
- `GET /bookings?from={date}&to={date}` - Fetch class bookings

### Booking Creation

**Dynamic Mode**:
```typescript
POST /bookings
{
  serviceId: string
  staffId: string
  date: string
  time: string
  duration: number
  customerId: string
  notes?: string
}
```

**Static Mode**:
```typescript
POST /bookings
{
  slotId: string      // Reference to StaticServiceSlot
  roomId: string
  partySize: number   // Number of attendees
  customerId: string
  notes?: string
}
```

---

## File Structure Reference

### Registration Wizard

```
src/views/RegisterWizard/
├── index.tsx                        # Main wizard container
├── types.ts                         # All type definitions
├── utils.ts                         # Validation, helpers
├── api-stubs.ts                     # API integration stubs
├── components/
│   └── GooglePlacesAutocomplete.tsx # Address autocomplete
└── steps/
    ├── AccountStep.tsx              # Step 1: Account
    ├── MobileVerificationStep.tsx   # Step 2: Mobile (optional)
    ├── BusinessBasicsStep.tsx       # Step 3: Business info
    ├── SchedulingModeStep.tsx       # Step 4: Static/Dynamic choice
    ├── LocationStep.tsx             # Step 5: Branches
    ├── RoomsSetupStep.tsx           # Step 6: Rooms (static only)
    ├── BusinessProfileStep.tsx      # Step 7: Profile
    ├── StaffManagementStep.tsx      # Step 8: Staff
    ├── InitialTemplatesStep.tsx     # Step 9: Templates (static only)
    └── LegalStep.tsx                # Step 10: Legal
```

### Calendar Features

```
src/bookly/features/calendar/
├── calendar-shell.tsx               # Main calendar container
├── calendar-header.tsx              # Navigation, filters
├── calendar-sidebar.tsx             # Quick actions, mini calendar
├── calendar-settings.tsx            # Settings drawer
├── fullcalendar-view.tsx            # FullCalendar wrapper
├── types.ts                         # Calendar type definitions
├── state.ts                         # Zustand store
├── utils.ts                         # Calendar utilities
├── new-appointment-drawer.tsx       # Create booking (dynamic)
├── edit-appointment-drawer.tsx      # Edit booking
├── appointment-drawer.tsx           # View/edit unified drawer
├── single-staff-day-view.tsx        # Custom view
├── single-staff-week-view.tsx       # Custom view
├── multi-staff-day-view.tsx         # Custom view
├── multi-staff-week-view.tsx        # Custom view
├── multi-room-day-view.tsx          # Custom view (static)
├── multi-room-week-view.tsx         # Custom view (static)
└── export-utils.ts                  # Export functionality
```

### Data Models

```
src/bookly/data/
├── types.ts                         # Core data types
└── mock-data.ts                     # Mock data for development
```

---

## Summary

This document provides a comprehensive overview of Bookly's business logic covering:

- **Two scheduling modes** (static for classes, dynamic for appointments)
- **Multi-branch architecture** (businesses with multiple locations)
- **Room management** (for static mode class-based scheduling)
- **Staff management** (multi-branch assignments, roles, availability)
- **Template system** (recurring weekly class schedules)
- **Calendar features** (custom views, filtering, color coding)
- **Booking flows** (different for static vs dynamic modes)
- **Registration wizard** (adaptive based on scheduling mode)
- **Data models & relationships** (complete entity structure)
- **State management** (Zustand stores and persistence)

**Key Architectural Decisions**:

1. **Mode-Based Differentiation**: Static and dynamic modes are fundamentally different and require different data structures, UI, and workflows
2. **Template-Driven Scheduling**: Static mode uses templates to generate recurring slots automatically
3. **Multi-Branch First**: Architecture supports multi-location from the start
4. **Custom Calendar Views**: Built custom views for better UX beyond FullCalendar's defaults
5. **Wizard Adaptability**: Registration flow changes based on business needs
6. **Approval Workflow**: New businesses are reviewed before going live

For specific implementation details, refer to the linked source files throughout this document.
