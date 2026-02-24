# Bookly Frontend Integration Guide
## STATIC vs DYNAMIC Booking Modes - Complete API Reference

**Last Updated:** February 21, 2026  
**Version:** 1.0

---

## Table of Contents
1. [Concept Overview](#1-concept-overview)
2. [Capacity Model - CRITICAL](#2-capacity-model---critical)
3. [Database Schema Changes](#3-database-schema-changes)
4. [API Endpoints](#4-api-endpoints)
5. [Admin Workflows](#5-admin-workflows)
6. [User Booking Flow](#6-user-booking-flow)
7. [Response Examples](#7-response-examples)
8. [UI/UX Recommendations](#8-uiux-recommendations)
9. [Error Handling](#9-error-handling)
10. [Migration Notes](#10-migration-notes)
11. [Booking Mode Transitions](#11-booking-mode-transitions-static--dynamic)
12. [Multiple Shifts (Split Shifts)](#12-multiple-shifts-split-shifts)
13. [Branch Operating Hours](#13-branch-operating-hours)
14. [Booking Details Management](#14-booking-details-management)
15. [Branch Coordinates & Map Display](#15-branch-coordinates--map-display)

---

## 1. Concept Overview

### What Changed?
Resources (Staff & Assets) now have a `bookingMode` field that determines HOW clients book them:

| Mode | Description | Use Cases |
|------|-------------|-----------|
| **DYNAMIC** | Clients book ANY available time within working hours | Barber, Massage therapist, Padel court rental |
| **STATIC** | Clients JOIN pre-defined sessions created by admin | Fitness classes, Group therapy, Doctor consultation slots |

### Visual Comparison

```
DYNAMIC MODE (Barber):
┌─────────────────────────────────────────────┐
│ John's Schedule: 9am - 5pm                  │
│                                             │
│ [9:00] [9:30] [10:00] [10:30] [11:00] ...   │
│                                             │
│ Client picks ANY 30-min slot                │
└─────────────────────────────────────────────┘

STATIC MODE (Fitness Class):
┌─────────────────────────────────────────────┐
│ Studio A Sessions:                          │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🏃 Zumba Class                          │ │
│ │ 9:00 AM - 10:00 AM                      │ │
│ │ 15/25 spots taken                       │ │
│ │                          [Join Class]   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Client joins a PRE-DEFINED session          │
└─────────────────────────────────────────────┘
```

---

## 2. Capacity Model - CRITICAL

### ⚠️ This is the most important distinction to understand:

| Aspect | DYNAMIC Mode | STATIC Mode |
|--------|--------------|-------------|
| **Capacity Field** | `Resource.maxConcurrent` | `Session.maxParticipants` |
| **Resource Consumed?** | ✅ YES | ❌ NO (just a venue reference) |
| **What capacity means** | Concurrent bookings allowed | People who can join session |
| **Scheduling** | Uses resource working hours | Uses pre-defined session times |
| **Booking target** | Book a TIME SLOT on resource | Book INTO a SESSION |

### How DYNAMIC Mode Works (Resource-Based)

In DYNAMIC mode, **the resource itself is consumed**. Each booking takes up a "slot" of the resource.

```
┌─────────────────────────────────────────────────────────────────┐
│ DYNAMIC: Resource slots are CONSUMED                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Barber (maxConcurrent: 1)         Padel Court (maxConcurrent: 1)│
│ ┌───────────────────────┐         ┌───────────────────────┐     │
│ │ 9:00  [Client A     ] │         │ 9:00  [Team A - 90min] │     │
│ │ 9:30  [  OCCUPIED   ] │         │ 10:00 [  OCCUPIED    ] │     │
│ │ 10:00 [Client B     ] │         │ 10:30 [Team B - 90min] │     │
│ └───────────────────────┘         └───────────────────────┘     │
│                                                                 │
│ Barbershop Floor (maxConcurrent: 3 chairs)                      │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 9:00 AM: [Client A] [Client B] [Client C] ← FULL (3/3)    │   │
│ │ 9:30 AM: [Client D] [  FREE  ] [  FREE  ] ← 2 available   │   │
│ └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### How STATIC Mode Works (Session-Based)

In STATIC mode, **the resource is NOT consumed** - it's just a venue/host reference. Capacity is per SESSION.

```
┌─────────────────────────────────────────────────────────────────┐
│ STATIC: Resource is just a VENUE, sessions have capacity        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Studio A hosts "Zumba Class" (Session.maxParticipants: 25)      │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 9:00-10:00 AM                                             │   │
│ │ 👤👤👤👤👤👤👤👤👤👤👤👤👤👤👤 (15 joined)                │   │
│ │ ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ (10 spots left)                      │   │
│ │                                                           │   │
│ │ Resource.maxConcurrent: IGNORED (not used in STATIC)      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ Dr. Ahmed (STATIC) - Pre-defined consultation slots             │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Session 1: 9:00-9:30   (maxParticipants: 1) ← 1 patient   │   │
│ │ Session 2: 9:30-10:00  (maxParticipants: 1) ← 1 patient   │   │
│ │ Session 3: 10:00-10:30 (maxParticipants: 1) ← 1 patient   │   │
│ │                                                           │   │
│ │ (Doctor defines their available slots as sessions)        │   │
│ └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Reference Table

| Scenario | Mode | Capacity Field | Value | Meaning |
|----------|------|----------------|-------|---------|
| Barber | DYNAMIC | `Resource.maxConcurrent` | 1 | 1 client at a time |
| Padel Court | DYNAMIC | `Resource.maxConcurrent` | 1 | 1 booking per court |
| 3-Chair Barbershop | DYNAMIC | `Resource.maxConcurrent` | 3 | 3 concurrent clients |
| Spin Studio (bikes) | DYNAMIC | `Resource.maxConcurrent` | 20 | 20 bikes available |
| Zumba Class | STATIC | `Session.maxParticipants` | 25 | 25 people per class |
| Doctor Slot | STATIC | `Session.maxParticipants` | 1 | 1 patient per slot |

### Key Takeaway
- **DYNAMIC**: `Resource.maxConcurrent` controls capacity (resource is consumed)
- **STATIC**: `Session.maxParticipants` controls capacity (resource is just a venue)

---

## 3. Database Schema Changes

### New Enum: BookingMode
```typescript
enum BookingMode {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC'
}
```

### Updated Resource Model
```typescript
interface Resource {
  id: string;
  name: string;
  type: 'STAFF' | 'ASSET';
  subType?: 'ROOM' | 'EQUIPMENT';  // Only for ASSET
  
  // NEW FIELD
  bookingMode: 'STATIC' | 'DYNAMIC';  // Default: 'DYNAMIC'
  
  // Capacity - ONLY relevant for DYNAMIC mode
  maxConcurrent: number;  // e.g., 3 barber chairs
  
  // Scheduling
  slotInterval: number;   // minutes between slots (DYNAMIC only)
  slotDuration?: number;  // override service duration (DYNAMIC only)
  
  branchId: string;
  // ... other fields
}
```

### New Session Model (STATIC mode only)
```typescript
interface Session {
  id: string;
  name: string;           // "Zumba Morning Class"
  description?: string;
  
  // Schedule - ONE of these, not both
  date?: string;          // "2026-03-15" for one-time sessions
  dayOfWeek?: number;     // 0-6 (Sunday-Saturday) for recurring
  
  startTime: string;      // "09:00"
  endTime: string;        // "10:00"
  
  // Capacity - THIS controls how many can book
  maxParticipants: number;
  
  // References
  resourceId: string;     // The venue/instructor (not consumed)
  serviceId?: string;     // Optional linked service
  price?: number;         // Override service price
  
  isActive: boolean;
  
  // Computed fields (in responses)
  currentParticipants?: number;
  availableSpots?: number;
  bookings?: Booking[];
}
```

### Updated Booking Model
```typescript
interface Booking {
  id: string;
  userId?: string;
  serviceId: string;
  branchId: string;
  resourceId: string;
  
  // NEW FIELD - for STATIC mode bookings
  sessionId?: string;     // Which session they're joining
  
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  // ... other fields
}
```

---

## 4. API Endpoints

### 4.1 Resource Management (Updated)

#### Create Staff
```http
POST /admin/staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Smith",
  "branchId": "branch-123",
  "serviceIds": ["service-1", "service-2"],
  "bookingMode": "DYNAMIC",        // NEW - or "STATIC"
  "maxConcurrent": 1,              // For DYNAMIC: how many can book same time
  "slotInterval": 30,
  "mobile": "+1234567890",
  "email": "john@example.com"
}
```

#### Create Asset
```http
POST /admin/assets
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Studio A",
  "subType": "ROOM",
  "branchId": "branch-123",
  "serviceIds": ["zumba-service"],
  "bookingMode": "STATIC",         // NEW - Classes, not individual bookings
  "maxConcurrent": 1,              // IGNORED for STATIC mode
  "description": "Main fitness studio"
}
```

### 4.2 Session Management (NEW - Admin Only)

#### Create Session
```http
POST /admin/sessions
Authorization: Bearer <admin_token>
Content-Type: application/json

# Recurring Session (every Monday)
{
  "name": "Zumba Morning Class",
  "description": "High-energy fitness class",
  "dayOfWeek": 1,                  // Monday (0=Sunday, 6=Saturday)
  "startTime": "09:00",
  "endTime": "10:00",
  "maxParticipants": 25,
  "resourceId": "studio-a-id",
  "serviceId": "zumba-service-id",
  "price": 15.00                   // Optional price override
}

# One-time Session (specific date)
{
  "name": "Special Yoga Workshop",
  "date": "2026-03-15",            // Specific date
  "startTime": "14:00",
  "endTime": "17:00",
  "maxParticipants": 20,
  "resourceId": "studio-b-id"
}
```

**Response:**
```json
{
  "id": "session-123",
  "name": "Zumba Morning Class",
  "description": "High-energy fitness class",
  "dayOfWeek": 1,
  "date": null,
  "startTime": "09:00",
  "endTime": "10:00",
  "maxParticipants": 25,
  "resourceId": "studio-a-id",
  "serviceId": "zumba-service-id",
  "price": 15.00,
  "isActive": true,
  "resource": { "id": "studio-a-id", "name": "Studio A", ... },
  "service": { "id": "zumba-service-id", "name": "Zumba", ... }
}
```

#### List Sessions
```http
GET /admin/sessions
GET /admin/sessions?resourceId=studio-a-id
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "id": "session-123",
    "name": "Zumba Morning Class",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "10:00",
    "maxParticipants": 25,
    "resource": { "name": "Studio A" },
    "service": { "name": "Zumba" },
    "bookings": [{ "id": "b1" }, { "id": "b2" }]  // Count these for current participants
  }
]
```

#### Get Session Details
```http
GET /admin/sessions/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "id": "session-123",
  "name": "Zumba Morning Class",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "10:00",
  "maxParticipants": 25,
  "currentParticipants": 15,       // Computed
  "availableSpots": 10,            // Computed
  "resource": { ... },
  "service": { ... },
  "bookings": [
    {
      "id": "booking-1",
      "user": { "id": "user-1", "name": "Alice", "email": "alice@example.com" }
    },
    // ... more participants
  ]
}
```

#### Update Session
```http
PATCH /admin/sessions/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Zumba HIIT Class",
  "maxParticipants": 30,
  "price": 18.00
}
```

#### Delete Session
```http
DELETE /admin/sessions/:id
Authorization: Bearer <admin_token>
```

**Error if has bookings:**
```json
{
  "statusCode": 400,
  "message": "Cannot delete session with 5 upcoming booking(s). Cancel the bookings first or mark the session as inactive."
}
```

### 4.3 Availability (Updated)

#### Get Available Slots
```http
GET /bookings/availability?serviceId=xxx&branchId=xxx&date=2026-02-24
GET /bookings/availability?serviceId=xxx&branchId=xxx&date=2026-02-24&resourceId=xxx
```

**Response differs based on resource booking mode:**

##### DYNAMIC Mode Response:
```json
[
  {
    "startTime": "2026-02-24T09:00:00.000Z",
    "endTime": "2026-02-24T09:30:00.000Z",
    "resourceId": "barber-john",
    "resourceName": "John the Barber",
    "resourceType": "STAFF"
  },
  {
    "startTime": "2026-02-24T09:30:00.000Z",
    "endTime": "2026-02-24T10:00:00.000Z",
    "resourceId": "barber-john",
    "resourceName": "John the Barber",
    "resourceType": "STAFF"
  }
  // ... more time slots
]
```

##### STATIC Mode Response:
```json
[
  {
    "startTime": "2026-02-24T09:00:00.000Z",
    "endTime": "2026-02-24T10:00:00.000Z",
    "resourceId": "studio-a",
    "resourceName": "Studio A",
    "resourceType": "ASSET",
    
    // STATIC-specific fields:
    "sessionId": "session-123",
    "sessionName": "Zumba Morning Class",
    "maxParticipants": 25,
    "currentParticipants": 15,
    "availableSpots": 10,
    "price": 15.00
  }
]
```

### 4.4 Create Booking (Updated)

#### DYNAMIC Mode Booking
```http
POST /bookings
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "serviceId": "haircut-service",
  "branchId": "branch-123",
  "resourceId": "barber-john",     // Optional - auto-assigned if not provided
  "startTime": "2026-02-24T09:00:00.000Z"
}
```

#### STATIC Mode Booking (Session)
```http
POST /bookings
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "serviceId": "zumba-service",
  "branchId": "branch-123",
  "sessionId": "session-123",       // REQUIRED for STATIC mode
  "startTime": "2026-02-24T09:00:00.000Z"
}
```

#### Guest Booking (Both Modes)
```http
POST /bookings/guest
Content-Type: application/json

# DYNAMIC
{
  "serviceId": "haircut-service",
  "branchId": "branch-123",
  "startTime": "2026-02-24T09:00:00.000Z",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890"
}

# STATIC
{
  "serviceId": "zumba-service",
  "branchId": "branch-123",
  "sessionId": "session-123",
  "startTime": "2026-02-24T09:00:00.000Z",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com"
}
```

---

## 5. Admin Workflows

### 5.1 Creating a STATIC Mode Resource

```
Step 1: Create the Resource
POST /admin/assets
{
  "name": "Fitness Studio A",
  "subType": "ROOM",
  "branchId": "branch-123",
  "serviceIds": ["zumba", "yoga", "pilates"],
  "bookingMode": "STATIC"           // ← Key setting
}

Step 2: Create Sessions for the Resource
POST /admin/sessions
{
  "name": "Zumba Monday Morning",
  "dayOfWeek": 1,                   // Every Monday
  "startTime": "09:00",
  "endTime": "10:00",
  "maxParticipants": 25,
  "resourceId": "<studio-a-id>",
  "serviceId": "<zumba-service-id>",
  "price": 15
}

POST /admin/sessions
{
  "name": "Yoga Tuesday Evening",
  "dayOfWeek": 2,                   // Every Tuesday
  "startTime": "18:00",
  "endTime": "19:00",
  "maxParticipants": 15,
  "resourceId": "<studio-a-id>",
  "serviceId": "<yoga-service-id>"
}
```

### 5.2 Admin UI Recommendations

#### Resource Form
```
┌─────────────────────────────────────────────────────────────┐
│ Create New Resource                                         │
├─────────────────────────────────────────────────────────────┤
│ Name: [Fitness Studio A          ]                          │
│                                                             │
│ Type: ○ Staff  ● Asset                                      │
│ Sub-type: ● Room  ○ Equipment                               │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ BOOKING MODE                                                │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ ○ Dynamic Booking                                           │
│   Clients book any available time slot within your          │
│   working hours. Good for: appointments, rentals.           │
│   Capacity: [3] units (e.g., 3 treatment rooms)             │
│                                                             │
│ ● Static Sessions                                           │
│   You create fixed sessions that clients join.              │
│   Good for: classes, group sessions, consultation slots.    │
│   → After saving, create sessions with their own capacity.  │
│                                                             │
│                                      [Cancel] [Save]        │
└─────────────────────────────────────────────────────────────┘
```

#### Session Management View
```
┌─────────────────────────────────────────────────────────────┐
│ Sessions for: Studio A                    [+ Add Session]   │
├─────────────────────────────────────────────────────────────┤
│ RECURRING SESSIONS                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏃 Zumba Morning          Every Monday 9:00-10:00       │ │
│ │    25 max participants    Linked: Zumba Service         │ │
│ │    $15.00                 [Edit] [Disable] [Delete]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🧘 Yoga Evening           Every Tuesday 18:00-19:00     │ │
│ │    15 max participants    Linked: Yoga Service          │ │
│ │    Service price          [Edit] [Disable] [Delete]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ONE-TIME SESSIONS                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎯 Special Workshop       March 15, 2026 14:00-17:00    │ │
│ │    20 max participants    12 booked                     │ │
│ │    $50.00                 [View Participants] [Edit]    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. User Booking Flow

### 6.1 Flow Decision Logic

```typescript
// After fetching availability
const slots = await fetch('/bookings/availability?...');

// Check if this is STATIC or DYNAMIC based on response
const isStaticMode = slots.some(slot => slot.sessionId);

if (isStaticMode) {
  // Show session cards UI
  renderSessionCards(slots);
} else {
  // Show time slot grid UI
  renderTimeSlotGrid(slots);
}
```

### 6.2 Frontend Implementation

```typescript
// Types
interface TimeSlot {
  startTime: string;
  endTime: string;
  resourceId: string;
  resourceName: string;
  resourceType: 'STAFF' | 'ASSET';
  
  // Only present for STATIC mode
  sessionId?: string;
  sessionName?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  availableSpots?: number;
  price?: number;
}

interface CreateBookingPayload {
  serviceId: string;
  branchId: string;
  startTime: string;
  resourceId?: string;
  sessionId?: string;  // Required for STATIC mode
}

// Booking function
async function createBooking(slot: TimeSlot, serviceId: string, branchId: string) {
  const payload: CreateBookingPayload = {
    serviceId,
    branchId,
    startTime: slot.startTime,
  };

  if (slot.sessionId) {
    // STATIC mode - include sessionId
    payload.sessionId = slot.sessionId;
  } else {
    // DYNAMIC mode - include resourceId
    payload.resourceId = slot.resourceId;
  }

  return fetch('/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}
```

### 6.3 UI Components

#### DYNAMIC Mode - Time Slot Picker
```tsx
function TimeSlotGrid({ slots, onSelect }) {
  // Group by time
  const timeSlots = groupByTime(slots);
  
  return (
    <div className="time-grid">
      <h3>Select a time</h3>
      <div className="slots">
        {timeSlots.map(slot => (
          <button 
            key={slot.startTime}
            onClick={() => onSelect(slot)}
            className="time-slot"
          >
            {formatTime(slot.startTime)}
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### STATIC Mode - Session Cards
```tsx
function SessionCards({ slots, onSelect }) {
  return (
    <div className="session-list">
      <h3>Available Classes</h3>
      {slots.map(slot => (
        <div key={slot.sessionId} className="session-card">
          <div className="session-header">
            <h4>{slot.sessionName}</h4>
            <span className="time">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </span>
          </div>
          
          <div className="session-details">
            <span className="location">📍 {slot.resourceName}</span>
            <span className="capacity">
              {slot.availableSpots} spots left 
              ({slot.currentParticipants}/{slot.maxParticipants})
            </span>
            {slot.price && <span className="price">${slot.price}</span>}
          </div>
          
          <div className="session-actions">
            <div className="capacity-bar">
              <div 
                className="filled" 
                style={{ 
                  width: `${(slot.currentParticipants / slot.maxParticipants) * 100}%` 
                }}
              />
            </div>
            <button 
              onClick={() => onSelect(slot)}
              disabled={slot.availableSpots === 0}
            >
              {slot.availableSpots > 0 ? 'Book Now' : 'Full'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 7. Response Examples

### 7.1 GET /bookings/availability - Mixed Results

When a service has both DYNAMIC and STATIC resources:

```json
[
  // DYNAMIC resource slots
  {
    "startTime": "2026-02-24T09:00:00.000Z",
    "endTime": "2026-02-24T09:30:00.000Z",
    "resourceId": "trainer-mike",
    "resourceName": "Mike (Personal Training)",
    "resourceType": "STAFF"
  },
  
  // STATIC resource sessions
  {
    "startTime": "2026-02-24T09:00:00.000Z",
    "endTime": "2026-02-24T10:00:00.000Z",
    "resourceId": "studio-a",
    "resourceName": "Studio A",
    "resourceType": "ASSET",
    "sessionId": "session-zumba-mon",
    "sessionName": "Zumba Morning",
    "maxParticipants": 25,
    "currentParticipants": 18,
    "availableSpots": 7,
    "price": 15.00
  }
]
```

### 7.2 POST /bookings - Success Response

```json
{
  "id": "booking-abc123",
  "userId": "user-456",
  "serviceId": "zumba-service",
  "branchId": "branch-123",
  "resourceId": "studio-a",
  "sessionId": "session-zumba-mon",
  "startTime": "2026-02-24T09:00:00.000Z",
  "endTime": "2026-02-24T10:00:00.000Z",
  "status": "PENDING",
  "service": {
    "id": "zumba-service",
    "name": "Zumba Class",
    "price": 15.00
  },
  "branch": {
    "id": "branch-123",
    "name": "Downtown Fitness"
  },
  "resource": {
    "id": "studio-a",
    "name": "Studio A"
  },
  "session": {
    "id": "session-zumba-mon",
    "name": "Zumba Morning",
    "maxParticipants": 25
  }
}
```

---

## 8. UI/UX Recommendations

### 8.1 Visual Indicators

| Element | DYNAMIC | STATIC |
|---------|---------|--------|
| **Icon** | 🕐 Clock/Time | 👥 Group/Class |
| **Primary Info** | Time slot | Session name |
| **Capacity Display** | Usually hidden | Always show (X/Y spots) |
| **Selection UI** | Time grid/buttons | Session cards |

### 8.2 Capacity Visualization

```
STATIC Mode - Show capacity prominently:

┌─────────────────────────────────────────┐
│ Zumba Morning Class                     │
│ 9:00 AM - 10:00 AM                      │
│                                         │
│ ████████████████░░░░░░░░░  18/25        │
│                                         │
│ 7 spots remaining          [Book Now]  │
└─────────────────────────────────────────┘

When almost full (< 20% remaining):
┌─────────────────────────────────────────┐
│ Yoga Evening                            │
│ 6:00 PM - 7:00 PM                       │
│                                         │
│ ██████████████████████████░  23/25      │
│                                         │
│ ⚠️ Only 2 spots left!       [Book Now]  │
└─────────────────────────────────────────┘

When full:
┌─────────────────────────────────────────┐
│ HIIT Training                           │
│ 7:00 AM - 8:00 AM                       │
│                                         │
│ ████████████████████████████  20/20     │
│                                         │
│ 🚫 Session Full            [Join Wait] │
└─────────────────────────────────────────┘
```

### 8.3 Admin Resource Form Decision Tree

```
Is this resource for group activities?
│
├─ YES → Use STATIC mode
│        Examples: Fitness classes, group therapy,
│                  workshops, consultation slots
│        
│        After creation, create Sessions with:
│        - Name (what the class is called)
│        - Schedule (recurring day or specific date)
│        - Capacity (how many can join)
│        - Price (optional override)
│
└─ NO → Use DYNAMIC mode
        Examples: Barber appointments, personal training,
                  court/room rental by the hour
        
        Set maxConcurrent:
        - 1 for one-on-one services
        - N for N identical resources (chairs, courts)
```

---

## 9. Error Handling

### 9.1 Common Errors

| Error | Cause | User Message |
|-------|-------|--------------|
| `Session not found` | Invalid sessionId | "This session no longer exists" |
| `Session is fully booked` | maxParticipants reached | "Sorry, this class is full" |
| `Session is no longer available` | isActive = false | "This session has been cancelled" |
| `STATIC booking mode requires sessionId` | Missing sessionId for STATIC resource | "Please select a specific class to book" |
| `Session does not belong to this branch` | Wrong branchId | "Invalid booking request" |
| `Cannot delete session with bookings` | Trying to delete session with active bookings | "Cancel existing bookings first" |

### 9.2 Error Response Format

```json
{
  "statusCode": 400,
  "message": "This session is fully booked (25/25 spots taken)",
  "error": "Bad Request"
}
```

### 9.3 Frontend Error Handling

```typescript
async function handleBooking(slot: TimeSlot) {
  try {
    const result = await createBooking(slot);
    showSuccess('Booking confirmed!');
    redirectToConfirmation(result.id);
  } catch (error) {
    if (error.message.includes('fully booked')) {
      // Refresh availability - someone else took the last spot
      showError('Sorry, this class just filled up. Refreshing...');
      await refreshAvailability();
    } else if (error.message.includes('no longer available')) {
      showError('This session has been cancelled.');
      await refreshAvailability();
    } else {
      showError('Booking failed. Please try again.');
    }
  }
}
```

---

## 10. Migration Notes

### 10.1 Existing Resources
All existing resources default to `bookingMode: 'DYNAMIC'`, so existing functionality is preserved.

### 10.2 Breaking Changes
None - the API is backward compatible. New fields are optional.

### 10.3 New Required Fields

For STATIC mode bookings:
- `sessionId` is **required** when booking a STATIC mode resource

### 10.4 Testing Checklist

#### Admin Tests
- [ ] Create DYNAMIC mode resource
- [ ] Create STATIC mode resource
- [ ] Create recurring session (dayOfWeek)
- [ ] Create one-time session (date)
- [ ] Edit session capacity
- [ ] Deactivate session
- [ ] Delete session (should fail if has bookings)
- [ ] View session participants

#### User Tests
- [ ] View DYNAMIC availability (time slots)
- [ ] View STATIC availability (session cards)
- [ ] Book DYNAMIC slot
- [ ] Book STATIC session
- [ ] Attempt to book full session (should fail)
- [ ] Guest booking for both modes

---

## 11. Booking Mode Transitions (STATIC ↔ DYNAMIC)

### 11.1 Overview

Staff members can be switched between STATIC and DYNAMIC booking modes. However, the change takes effect **after all existing bookings are completed** to prevent disruption.

### 11.2 Transition Rules

| Scenario | Behavior |
|----------|----------|
| No future bookings | Mode changes immediately |
| Has future bookings | Mode change is **scheduled** for after the last booking |
| Admin specifies `bookingModeEffectiveDate` | Must be after last booking date |

### 11.3 API Endpoints

#### Update Staff Booking Mode
```http
PATCH /admin/staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id": "staff-123",
  "bookingMode": "STATIC",
  "bookingModeEffectiveDate": "2026-03-01"  // Optional - system calculates if not provided
}
```

**Response (if immediate):**
```json
{
  "id": "staff-123",
  "name": "Dr. Ahmed",
  "bookingMode": "STATIC",
  "pendingBookingMode": null,
  "bookingModeEffectiveDate": null
}
```

**Response (if scheduled):**
```json
{
  "id": "staff-123",
  "name": "Dr. Ahmed",
  "bookingMode": "DYNAMIC",
  "pendingBookingMode": "STATIC",
  "bookingModeEffectiveDate": "2026-03-01T00:00:00.000Z"
}
```

#### Get Booking Mode Status
```http
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
```http
DELETE /admin/staff/:id/booking-mode-transition
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "id": "staff-123",
  "bookingMode": "DYNAMIC",
  "pendingBookingMode": null,
  "bookingModeEffectiveDate": null
}
```

### 11.4 UI Recommendations

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

### 11.5 Important Notes

1. **Rooms/Assets**: Typically don't need mode transitions (a room is either always for classes or always for individual bookings)
2. **Sessions**: When switching from STATIC to DYNAMIC, existing sessions remain but become inactive. Admin should manually deactivate them.
3. **Automatic Application**: Pending mode changes are automatically applied when staff data is fetched after the effective date.

---

## 12. Multiple Shifts (Split Shifts)

### 12.1 Overview

Staff can have **multiple work shifts per day** (e.g., morning 9am-12pm AND evening 5pm-9pm). Each shift is a separate `Schedule` record.

### 12.2 Creating Split Shifts

```http
POST /admin/scheduling/schedules
Authorization: Bearer <admin_token>
Content-Type: application/json

# Morning shift
{
  "resourceId": "staff-alex",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "12:00"
}

# Evening shift (same staff, same day)
{
  "resourceId": "staff-alex",
  "dayOfWeek": 1,
  "startTime": "17:00",
  "endTime": "21:00"
}
```

### 12.3 Breaks Within Shifts

Each shift can have its own breaks:

```http
POST /admin/scheduling/breaks
Authorization: Bearer <admin_token>
Content-Type: application/json

# Morning break
{
  "resourceId": "staff-alex",
  "dayOfWeek": 1,
  "startTime": "10:30",
  "endTime": "10:45",
  "name": "Morning Break"
}

# Evening break
{
  "resourceId": "staff-alex",
  "dayOfWeek": 1,
  "startTime": "19:00",
  "endTime": "19:15",
  "name": "Evening Break"
}
```

### 12.4 Availability Response with Split Shifts

When a staff has split shifts, the availability endpoint returns slots only within working hours:

```json
[
  // Morning slots (9:00-10:30, then 10:45-12:00)
  { "startTime": "09:00", "endTime": "09:30", "resourceId": "staff-alex" },
  { "startTime": "09:30", "endTime": "10:00", "resourceId": "staff-alex" },
  { "startTime": "10:00", "endTime": "10:30", "resourceId": "staff-alex" },
  // Break 10:30-10:45 - NO SLOTS
  { "startTime": "10:45", "endTime": "11:15", "resourceId": "staff-alex" },
  { "startTime": "11:15", "endTime": "11:45", "resourceId": "staff-alex" },
  
  // Gap 12:00-17:00 - NO SLOTS
  
  // Evening slots (17:00-19:00, then 19:15-21:00)
  { "startTime": "17:00", "endTime": "17:30", "resourceId": "staff-alex" },
  { "startTime": "17:30", "endTime": "18:00", "resourceId": "staff-alex" },
  // ... more evening slots
]
```

### 12.5 UI for Split Shifts

```
┌─────────────────────────────────────────────────────────────┐
│ Alex Split-Shift - Monday Schedule                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Morning Shift                Evening Shift                 │
│  ┌─────────────────────┐     ┌─────────────────────┐        │
│  │ 09:00 - 12:00       │     │ 17:00 - 21:00       │        │
│  │                     │     │                     │        │
│  │ Break: 10:30-10:45  │     │ Break: 19:00-19:15  │        │
│  │                     │     │                     │        │
│  │ [Edit] [Delete]     │     │ [Edit] [Delete]     │        │
│  └─────────────────────┘     └─────────────────────┘        │
│                                                             │
│  [+ Add Another Shift]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Branch Operating Hours

### 13.1 Overview

Each branch has its own operating hours that vary by day. Staff schedules must fall within branch hours.

### 13.2 Branch Schedule API

```http
# Create branch schedule (one per day)
POST /admin/scheduling/schedules
{
  "branchId": "downtown-branch",
  "dayOfWeek": 1,  // Monday
  "startTime": "09:00",
  "endTime": "21:00"
}

# Weekend can have different hours
POST /admin/scheduling/schedules
{
  "branchId": "downtown-branch",
  "dayOfWeek": 6,  // Saturday
  "startTime": "10:00",
  "endTime": "18:00"
}
```

### 13.3 Seed Data Examples

The seed includes branches with varied hours:

| Branch | Mon-Fri | Sat | Sun |
|--------|---------|-----|-----|
| Downtown Spa | 9am-9pm | 10am-8pm | Closed |
| Zamalek Spa | 10am-10pm | 10am-10pm | Closed |
| Barbershop | 8am-8pm | 9am-6pm | 10am-4pm |
| FitLife Gym | 6am-10pm | 8am-8pm | 8am-6pm |
| MediCare Clinic | 8am-6pm | 9am-2pm | Closed |
| PadelZone | 7am-11pm | 6am-12am | 6am-10pm |

### 13.4 Closed Days

Days without a schedule record are considered **closed**. The availability endpoint returns empty for closed days.

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING MODES                            │
├──────────────────────────┬──────────────────────────────────┤
│        DYNAMIC           │           STATIC                 │
├──────────────────────────┼──────────────────────────────────┤
│ Capacity:                │ Capacity:                        │
│ Resource.maxConcurrent   │ Session.maxParticipants          │
├──────────────────────────┼──────────────────────────────────┤
│ Booking payload:         │ Booking payload:                 │
│ { resourceId, startTime }│ { sessionId, startTime }         │
├──────────────────────────┼──────────────────────────────────┤
│ Availability response:   │ Availability response:           │
│ Time slots only          │ Includes sessionId, sessionName, │
│                          │ maxParticipants, availableSpots  │
├──────────────────────────┼──────────────────────────────────┤
│ UI: Time picker grid     │ UI: Session cards with capacity  │
├──────────────────────────┼──────────────────────────────────┤
│ Use for:                 │ Use for:                         │
│ - Appointments           │ - Classes                        │
│ - Rentals                │ - Group sessions                 │
│ - One-on-one services    │ - Workshops                      │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 14. Booking Details Management

For comprehensive documentation on the Booking Details modal (updating status, payment, notes, starring), see:

📄 **[Booking Details Frontend Guide](./booking-details-frontend-guide.md)**

### Quick Reference

#### Booking Status Options
| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting confirmation |
| `NEEDS_CONFIRMATION` | Requires admin review |
| `CONFIRMED` | Booking confirmed |
| `ATTENDED` | Customer attended |
| `NO_SHOW` | Customer did not show up |
| `CANCELLED` | Booking cancelled |
| `COMPLETED` | Service completed |

#### Payment Status Options
| Status | Description |
|--------|-------------|
| `UNPAID` | Payment pending |
| `PAID` | Fully paid |
| `REFUNDED` | Payment refunded |
| `PARTIALLY_PAID` | Partial payment received |

#### Key Endpoints
```bash
# Get booking details
GET /admin/bookings/:id

# Update booking (status, payment, notes, starred)
PATCH /admin/bookings/:id
{
  "status": "ATTENDED",
  "paymentStatus": "PAID",
  "paymentReference": "TXN-123456",
  "isStarred": true,
  "businessNotes": "VIP customer"
}

# Quick status update only
PATCH /admin/bookings/:id/status
{
  "status": "CONFIRMED"
}
```

---

## 15. Branch Coordinates & Map Display

### Overview
Each branch has `latitude` and `longitude` coordinates for map display. These can be used to show branch locations on a map in both admin and client-facing apps.

### Schema Fields
```typescript
interface Branch {
  id: string;
  name: string;
  address?: string;
  mobile?: string;
  latitude?: number;   // e.g., 30.0444 (Cairo)
  longitude?: number;  // e.g., 31.2357 (Cairo)
  gallery: string[];
  galleryUrls?: string[];  // Resolved URLs
  // ... other fields
}
```

### Admin Endpoints

#### Get All Branches (with coordinates)
```bash
GET /admin/branches
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "branch-uuid",
    "name": "Downtown Branch",
    "address": "123 Main St, Downtown",
    "mobile": "+201000000001",
    "latitude": 30.0444,
    "longitude": 31.2357,
    "gallery": [],
    "galleryUrls": []
  }
]
```

#### Create Branch with Coordinates
```bash
POST /admin/branches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Branch",
  "address": "456 Another St",
  "mobile": "+201000000003",
  "latitude": 30.0500,
  "longitude": 31.2400,
  "serviceIds": ["service-uuid-1"]
}
```

#### Update Branch Coordinates
```bash
PATCH /admin/branches
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "branch-uuid",
  "name": "Downtown Branch",
  "latitude": 30.0500,
  "longitude": 31.2400
}
```

### Public Endpoints (Client App)

#### Get Business Details (includes branches with coordinates)
```bash
GET /business/:businessId
```

**Response:**
```json
{
  "id": "business-uuid",
  "name": "Luxe Spa & Wellness",
  "branches": [
    {
      "id": "branch-uuid-1",
      "name": "Downtown Branch",
      "address": "123 Main St, Downtown",
      "latitude": 30.0444,
      "longitude": 31.2357,
      "resources": [...],
      "services": [...]
    },
    {
      "id": "branch-uuid-2",
      "name": "Zamalek Branch",
      "address": "Abu El Feda St, Zamalek",
      "latitude": 30.064,
      "longitude": 31.223,
      "resources": [...],
      "services": [...]
    }
  ]
}
```

### Sample Coordinates (Egypt)
| Location | Latitude | Longitude |
|----------|----------|-----------|
| Cairo Downtown | 30.0444 | 31.2357 |
| Zamalek | 30.064 | 31.223 |
| Heliopolis | 30.0866 | 31.3225 |
| Maadi | 29.9602 | 31.2569 |
| 6th October City | 29.9285 | 30.9188 |
| Alexandria | 31.2001 | 29.9187 |

### Validation Notes
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- For Egypt: Latitude ~22-32, Longitude ~25-35
- Coordinates are optional - branches can exist without them

---

## Support

For questions or issues, contact the backend team.

**API Base URL:** `http://localhost:5050` (development)
