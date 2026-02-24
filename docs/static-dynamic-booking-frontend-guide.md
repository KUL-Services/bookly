# STATIC vs DYNAMIC Booking Mode - Frontend Integration Guide

## Overview

The booking system supports two distinct booking modes for resources (staff/assets):

| Mode | Description | Example Use Cases |
|------|-------------|-------------------|
| **STATIC** | Pre-defined sessions that clients JOIN | Fitness classes, Group sessions, Doctor consultation slots |
| **DYNAMIC** | Flexible booking within operating hours | Barber appointments, Court rentals, Equipment booking |

### Key Difference: Capacity Handling

| Aspect | DYNAMIC Mode | STATIC Mode |
|--------|--------------|-------------|
| **Capacity Source** | `Resource.maxConcurrent` | `Session.maxParticipants` |
| **What it means** | Number of physical units (e.g., 3 chairs, 2 courts) | People who can join a session (e.g., 25 for Zumba) |
| **Booking consumes** | Resource slot | Session spot |
| **Resource role** | The bookable unit itself | Just a venue/host identifier |

**Example:**
- **DYNAMIC**: Barbershop has 3 chairs (`maxConcurrent: 3`), so 3 people can book the same time slot
- **STATIC**: Zumba class in Studio A has 25 spots (`maxParticipants: 25`), the studio itself is just where it happens

---

## API Endpoints Summary

### Session Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/sessions` | Create a new session |
| GET | `/admin/sessions` | List all sessions |
| GET | `/admin/sessions/:id` | Get session details |
| PATCH | `/admin/sessions/:id` | Update a session |
| DELETE | `/admin/sessions/:id` | Delete a session |

### Booking Flow (User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings/availability` | Get available slots (handles both modes) |
| POST | `/bookings` | Create a booking (authenticated) |
| POST | `/bookings/guest` | Create a guest booking |

---

## Data Models

### Resource (Updated)
```typescript
interface Resource {
  id: string;
  name: string;
  type: 'STAFF' | 'ASSET';
  bookingMode: 'STATIC' | 'DYNAMIC';  // NEW FIELD
  maxConcurrent: number;  // ONLY used in DYNAMIC mode (e.g., 3 chairs, 2 courts)
  // ... other fields
}
```

### Session (New) - For STATIC mode only
```typescript
interface Session {
  id: string;
  name: string;
  description?: string;
  
  // Recurrence (one OR the other, not both)
  date?: string;        // ISO date for one-time sessions
  dayOfWeek?: number;   // 0-6 for recurring sessions
  
  startTime: string;    // "14:00"
  endTime: string;      // "16:00"
  
  maxParticipants: number;  // Session capacity (e.g., 25 people for a class)
  resourceId: string;       // The venue/host (not consumed, just a reference)
  serviceId?: string;
  price?: number;
  isActive: boolean;
  
  // Computed in responses
  currentParticipants?: number;
  availableSpots?: number;
}
```

### TimeSlot (Updated Response)
```typescript
interface TimeSlot {
  startTime: string;    // ISO datetime
  endTime: string;      // ISO datetime
  resourceId: string;
  resourceName: string;
  resourceType: 'STAFF' | 'ASSET';
  
  // STATIC mode only (present when booking a session)
  sessionId?: string;
  sessionName?: string;
  maxParticipants?: number;     // From Session, NOT Resource
  currentParticipants?: number;
  availableSpots?: number;
  price?: number;
}
```

---

## Frontend Implementation Guide

### 1. Resource Creation/Edit (Admin)

When creating or editing a resource, add a toggle/dropdown for `bookingMode`:

```typescript
// Create Staff DTO
{
  name: "Dr. Ahmed",
  branchId: "branch-123",
  serviceIds: ["service-1", "service-2"],
  bookingMode: "STATIC"  // or "DYNAMIC"
}

// Create Asset DTO  
{
  name: "Studio A",
  subType: "ROOM",
  branchId: "branch-123",
  serviceIds: ["service-1"],
  bookingMode: "STATIC"  // or "DYNAMIC"
}
```

**UI Recommendation:**
```
┌─────────────────────────────────────────────┐
│ Booking Mode                                │
├─────────────────────────────────────────────┤
│ ○ Dynamic (Flexible booking)                │
│   Clients book any available time slot      │
│   within working hours.                     │
│                                             │
│ ● Static (Pre-defined sessions)             │
│   Clients book INTO specific sessions       │
│   you define (classes, consultation slots). │
└─────────────────────────────────────────────┘
```

### 2. Session Management (Admin)

For STATIC mode resources, admins need to create sessions:

```typescript
// POST /admin/sessions
{
  name: "Zumba Morning Class",
  description: "High-energy fitness class",
  dayOfWeek: 1,           // Monday (0=Sunday)
  startTime: "09:00",
  endTime: "10:00",
  maxParticipants: 25,
  resourceId: "studio-a-id",
  serviceId: "zumba-service-id",
  price: 15.00
}

// One-time session example
{
  name: "Special Yoga Workshop",
  date: "2026-03-15",     // Specific date
  startTime: "14:00",
  endTime: "17:00",
  maxParticipants: 20,
  resourceId: "studio-b-id"
}
```

**UI Recommendation - Session Calendar View:**
```
┌────────────────────────────────────────────────────────┐
│  February 2026               < Week >   [+ Add Session]│
├────────────────────────────────────────────────────────┤
│ Mon 23     │ Tue 24     │ Wed 25     │ Thu 26         │
├────────────────────────────────────────────────────────┤
│ ┌────────┐ │            │ ┌────────┐ │                │
│ │Zumba   │ │            │ │Zumba   │ │                │
│ │9-10am  │ │            │ │9-10am  │ │                │
│ │15/25 ✓ │ │            │ │22/25 ✓ │ │                │
│ └────────┘ │            │ └────────┘ │                │
│            │ ┌────────┐ │            │ ┌────────┐     │
│            │ │Yoga    │ │            │ │Yoga    │     │
│            │ │7-8am   │ │            │ │7-8pm   │     │
│            │ │8/15 ✓  │ │            │ │12/15 ✓ │     │
│            │ └────────┘ │            │ └────────┘     │
└────────────────────────────────────────────────────────┘
```

### 3. Availability Query (User Booking Flow)

The `/bookings/availability` endpoint automatically returns appropriate data based on resource mode:

```typescript
// GET /bookings/availability?serviceId=xxx&branchId=xxx&date=2026-02-24

// Response for DYNAMIC resource:
[
  {
    startTime: "2026-02-24T09:00:00.000Z",
    endTime: "2026-02-24T09:30:00.000Z",
    resourceId: "barber-1",
    resourceName: "John the Barber",
    resourceType: "STAFF"
  },
  // ... more time slots
]

// Response for STATIC resource:
[
  {
    startTime: "2026-02-24T09:00:00.000Z",
    endTime: "2026-02-24T10:00:00.000Z",
    resourceId: "studio-a",
    resourceName: "Studio A",
    resourceType: "ASSET",
    sessionId: "session-123",
    sessionName: "Zumba Morning Class",
    maxParticipants: 25,
    currentParticipants: 15,
    availableSpots: 10,
    price: 15.00
  }
]
```

**UI Differentiation:**

For **DYNAMIC** slots - show as time-based grid:
```
┌─────────────────────────────────────┐
│ Select a time with John             │
├─────────────────────────────────────┤
│ [9:00] [9:30] [10:00] [10:30]       │
│ [11:00] [11:30] ░░░░░░ [13:00]      │
│ [13:30] [14:00] [14:30] [15:00]     │
└─────────────────────────────────────┘
```

For **STATIC** sessions - show as class/session cards:
```
┌─────────────────────────────────────────────┐
│ Available Classes on Feb 24                 │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 🏃 Zumba Morning Class                  │ │
│ │ 9:00 AM - 10:00 AM • Studio A           │ │
│ │ 10 spots available (15/25)              │ │
│ │ $15.00                    [Book Now]    │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🧘 Evening Yoga                         │ │
│ │ 6:00 PM - 7:00 PM • Studio B            │ │
│ │ 3 spots available (12/15)               │ │
│ │ $12.00                    [Book Now]    │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 4. Creating a Booking

**DYNAMIC mode booking:**
```typescript
// POST /bookings
{
  serviceId: "haircut-service",
  branchId: "branch-123",
  resourceId: "barber-1",        // Optional - auto-assigned if not provided
  startTime: "2026-02-24T09:00:00.000Z"
}
```

**STATIC mode booking (with session):**
```typescript
// POST /bookings
{
  serviceId: "zumba-service",
  branchId: "branch-123",
  sessionId: "session-123",      // Required for STATIC mode
  startTime: "2026-02-24T09:00:00.000Z"
}
```

**Error Handling:**
```typescript
// If user tries DYNAMIC booking on STATIC resource without sessionId:
{
  "statusCode": 400,
  "message": "This resource uses STATIC booking mode. Please select a specific session to book."
}

// If session is full:
{
  "statusCode": 400,
  "message": "This session is fully booked (25/25 spots taken)"
}
```

---

## Frontend Flow Decision Tree

```
User selects a service
         │
         ▼
┌─────────────────────┐
│ Fetch availability  │
│ for selected date   │
└─────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Check response: sessionId present?  │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
   YES        NO
    │         │
    ▼         ▼
┌─────────┐  ┌─────────┐
│ STATIC  │  │ DYNAMIC │
│ Mode    │  │ Mode    │
└─────────┘  └─────────┘
    │         │
    ▼         ▼
Show session  Show time
cards with    slot grid
capacity      
    │         │
    ▼         ▼
Include      Standard
sessionId    booking
in booking   request
```

---

## Seed Data Examples

The database includes sample businesses demonstrating both modes:

| Business | Resource | Mode | Description |
|----------|----------|------|-------------|
| FitLife Gym | Studio A | STATIC | Zumba classes (25 participants) |
| FitLife Gym | Studio B | STATIC | Yoga sessions (15 participants) |
| FitLife Gym | Spin Studio | DYNAMIC | Bike booking (20 bikes) |
| MediCare Clinic | Dr. Ahmed | STATIC | Pre-defined consultation slots |
| MediCare Clinic | Dr. Sara | DYNAMIC | Flexible booking |
| PadelZone | Courts 1-3 | DYNAMIC | 90-min slot booking |

---

## Testing Checklist

### Admin Dashboard
- [ ] Can create STATIC mode resource
- [ ] Can create DYNAMIC mode resource
- [ ] Can switch resource mode (warning if has bookings)
- [ ] Can view pending mode transition status
- [ ] Can cancel pending mode transition
- [ ] Can create recurring session (dayOfWeek)
- [ ] Can create one-time session (date)
- [ ] Can view session participant list
- [ ] Can edit session details
- [ ] Can deactivate/delete session
- [ ] Can create split shifts (multiple schedules per day)
- [ ] Can add breaks to each shift

### User Booking
- [ ] Availability shows session cards for STATIC resources
- [ ] Availability shows time grid for DYNAMIC resources
- [ ] Booking includes sessionId for STATIC mode
- [ ] Error shown if STATIC resource booked without session
- [ ] Capacity indicator shows spots remaining
- [ ] Full sessions are hidden or shown as unavailable

---

## Booking Mode Transitions

### Overview
Staff can be switched between STATIC and DYNAMIC modes, but mode changes **take effect after existing bookings complete**.

### New Resource Fields
```typescript
interface Resource {
  // ... existing fields
  bookingMode: 'STATIC' | 'DYNAMIC';
  
  // NEW: Transition fields
  pendingBookingMode?: 'STATIC' | 'DYNAMIC';  // Scheduled new mode
  bookingModeEffectiveDate?: string;           // When change takes effect
}
```

### API Endpoints for Mode Transition

#### Update Staff Booking Mode
```bash
PATCH /admin/staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id": "staff-uuid",
  "bookingMode": "STATIC",
  "bookingModeEffectiveDate": "2026-03-01"  // Optional
}
```

**Response (immediate change - no future bookings):**
```json
{
  "id": "staff-uuid",
  "bookingMode": "STATIC",
  "pendingBookingMode": null,
  "bookingModeEffectiveDate": null
}
```

**Response (scheduled change - has future bookings):**
```json
{
  "id": "staff-uuid",
  "bookingMode": "DYNAMIC",
  "pendingBookingMode": "STATIC",
  "bookingModeEffectiveDate": "2026-03-01T00:00:00.000Z"
}
```

#### Get Booking Mode Status
```bash
GET /admin/staff/:id/booking-mode-status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "currentMode": "DYNAMIC",
  "pendingMode": "STATIC",
  "effectiveDate": "2026-03-01T00:00:00.000Z",
  "futureBookingsCount": 5,
  "futureSessionBookingsCount": 0,
  "canChangeImmediately": false
}
```

#### Cancel Pending Mode Transition
```bash
DELETE /admin/staff/:id/booking-mode-transition
Authorization: Bearer <admin_token>
```

### UI Recommendation for Mode Transition
```
┌────────────────────────────────────────────────────────────┐
│ Dr. Ahmed - Edit Staff                                     │
├────────────────────────────────────────────────────────────┤
│ Current Booking Mode: DYNAMIC                              │
│                                                            │
│ ⚠️ Pending Mode Change                                     │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Scheduled to change to: STATIC                         │ │
│ │ Effective Date: March 1, 2026                          │ │
│ │ Reason: 5 existing bookings must complete first        │ │
│ │                                                        │ │
│ │ [Cancel Scheduled Change]                              │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Change Booking Mode:                                       │
│ ◉ DYNAMIC - Flexible time booking                          │
│ ○ STATIC  - Pre-defined session slots                      │
│                                                            │
│ [Save Changes]                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Split Shifts (Multiple Shifts Per Day)

Staff can have multiple work shifts per day (e.g., 9am-12pm AND 5pm-9pm):

```bash
# Create morning shift
POST /admin/scheduling/schedules
{
  "resourceId": "staff-uuid",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "12:00"
}

# Create evening shift (same day)
POST /admin/scheduling/schedules
{
  "resourceId": "staff-uuid",
  "dayOfWeek": 1,
  "startTime": "17:00",
  "endTime": "21:00"
}
```

Each shift can have its own breaks:
```bash
POST /admin/scheduling/breaks
{
  "resourceId": "staff-uuid",
  "dayOfWeek": 1,
  "startTime": "10:30",
  "endTime": "10:45",
  "name": "Morning Break"
}
```

---

## API Quick Reference

### Create Session
```bash
POST /admin/sessions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Zumba Class",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "10:00",
  "maxParticipants": 25,
  "resourceId": "resource-id",
  "serviceId": "service-id",
  "price": 15
}
```

### List Sessions
```bash
GET /admin/sessions?resourceId=xxx
Authorization: Bearer <admin_token>
```

### Book Static Session
```bash
POST /bookings
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "serviceId": "service-id",
  "branchId": "branch-id",
  "sessionId": "session-id",
  "startTime": "2026-02-24T09:00:00.000Z"
}
```
