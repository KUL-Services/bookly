# Static/Dynamic Booking Mode Integration - Completion Summary

## Date: February 20, 2026

## Status: ✅ COMPLETE

## Overview

This document summarizes the frontend integration of the STATIC vs DYNAMIC booking mode feature. This allows resources (staff, rooms, equipment) to use either:

- **STATIC mode**: Pre-defined sessions that clients join (e.g., fitness classes, group sessions)
- **DYNAMIC mode**: Flexible time slot booking within operating hours (e.g., appointments)

---

## Completed Tasks

### 1. API Types Updated (`src/lib/api/types.ts`)

- ✅ Added `BookingMode = 'STATIC' | 'DYNAMIC'` type
- ✅ Added `bookingMode` field to `Resource`, `Staff`, `Asset` interfaces
- ✅ Added `bookingMode` to create/update request interfaces
- ✅ Added `sessionId` to booking request interfaces
- ✅ Added `Session` interface with all fields
- ✅ Added `CreateSessionRequest` and `UpdateSessionRequest` interfaces
- ✅ Added `AvailabilitySlot` interface with session info for STATIC mode

### 2. Sessions API Service Created (`src/lib/api/services/sessions.service.ts`)

- ✅ `getSessions()` - List all sessions with optional filters
- ✅ `getSession(id)` - Get specific session
- ✅ `createSession(data)` - Create new session
- ✅ `updateSession(id, data)` - Update session
- ✅ `deleteSession(id)` - Delete session
- ✅ `getSessionsForDate()` - Get sessions for specific date
- ✅ `getSessionParticipants()` - Get participants for a session

### 3. Staff Form Updated (`src/bookly/features/staff-management/add-staff-member-drawer.tsx`)

- ✅ Added `bookingMode` state variable with default `'DYNAMIC'`
- ✅ Added loading of `bookingMode` from existing staff when editing
- ✅ Added reset of `bookingMode` to `'DYNAMIC'` when creating new staff
- ✅ Added Booking Mode dropdown with descriptive options
- ✅ Included `bookingMode` in the `staffData` object sent to API

### 4. Resource Form Updated (`src/bookly/features/staff-management/resource-editor-drawer.tsx`)

- ✅ Added `bookingMode` state variable
- ✅ Added Booking Mode dropdown with Static/Dynamic options
- ✅ Added info alert explaining each mode
- ✅ Included `bookingMode` in save data

### 5. Room Form Updated (`src/bookly/features/staff-management/room-editor-drawer.tsx`)

- ✅ Added `bookingMode` state variable
- ✅ Added Booking Mode toggle (separate from Capacity Mode)
- ✅ Added info alert explaining each mode
- ✅ Included `bookingMode` in save data

### 6. Calendar Types Updated (`src/bookly/features/calendar/types.ts`)

- ✅ Added `bookingMode` to Resource interface
- ✅ Added `sessionId` and `sessionName` to CalendarEvent extendedProps

### 7. Session Management UI Created

- ✅ Created `session-editor-drawer.tsx` - Full session CRUD form
  - Session name and description
  - Resource selection (filtered to STATIC mode only)
  - Service linking (optional)
  - Session type: Recurring (day of week) or One-time (specific date)
  - Time range selection
  - Max participants and price
  - Active/Inactive toggle for editing
- ✅ Created `sessions-tab.tsx` - Admin session management tab
  - Branch selection navigation
  - Resource selection (only shows STATIC mode resources)
  - Session list with grid/list view
  - Session cards showing schedule, capacity, price
  - Create/Edit/Delete functionality
  - Capacity progress indicators

### 8. Sessions Tab Integrated (`src/views/apps/bookly/staff/StaffManagement.tsx`)

- ✅ Added SessionsTab import
- ✅ Added SESSIONS tab to tabs list
- ✅ Added TabPanel for SessionsTab

### 9. Session Selector Component (`src/bookly/features/calendar/session-selector.tsx`)

- ✅ Created component to display available sessions for a date
- ✅ Fetches sessions from API based on resource and date
- ✅ Shows session cards with time, capacity, price
- ✅ Capacity progress bar
- ✅ Selection state management

### 10. Unified Booking Drawer Updated (`src/bookly/features/calendar/unified-booking-drawer.tsx`)

- ✅ Added SessionSelector import
- ✅ Added `selectedSession` state
- ✅ Added `isStaffStaticBookingMode` computed property
- ✅ Conditional rendering: SessionSelector for STATIC, time slots for DYNAMIC
- ✅ Auto-fill time/price from selected session
- ✅ Session validation in handleSave
- ✅ Include `sessionId` and `sessionName` in event data
- ✅ Reset `selectedSession` when drawer opens

---

## File Changes Summary

### New Files Created:

1. `/src/lib/api/services/sessions.service.ts`
2. `/src/bookly/features/staff-management/session-editor-drawer.tsx`
3. `/src/bookly/features/staff-management/sessions-tab.tsx`
4. `/src/bookly/features/calendar/session-selector.tsx`

### Modified Files:

1. `/src/lib/api/types.ts`
2. `/src/lib/api/services/booking.service.ts`
3. `/src/bookly/features/staff-management/add-staff-member-drawer.tsx`
4. `/src/bookly/features/staff-management/resource-editor-drawer.tsx`
5. `/src/bookly/features/staff-management/room-editor-drawer.tsx`
6. `/src/bookly/features/calendar/types.ts`
7. `/src/bookly/features/calendar/unified-booking-drawer.tsx`
8. `/src/views/apps/bookly/staff/StaffManagement.tsx`

---

## Usage Guide

### Admin: Setting Up STATIC Mode Resource

1. Go to Staff Management
2. Create or edit a staff member/resource/room
3. Set **Booking Mode** to "Static (Pre-defined Sessions)"
4. Save the resource

### Admin: Creating Sessions

1. Go to Staff Management → Sessions tab
2. Select a branch
3. Select a resource with STATIC booking mode
4. Click "Create Session"
5. Fill in:
   - Session name
   - Optional description
   - Select recurring (day of week) or one-time (specific date)
   - Set start/end time
   - Set max participants
   - Optional: link to a service and/or set price
6. Save

### Client: Booking a STATIC Mode Resource

1. Select a staff/resource with STATIC booking mode
2. Select a service
3. Select a date
4. Available sessions for that date will be displayed
5. Click on a session card to select it
6. Complete client information
7. Save booking

The booking will include the `sessionId` linking it to the pre-defined session.

---

## Notes

- Resources with `bookingMode: 'DYNAMIC'` continue to work as before (flexible time slots)
- Resources with `bookingMode: 'STATIC'` require sessions to be created before clients can book
- The booking drawer automatically detects the mode and shows appropriate UI
- Session capacity is enforced - full sessions cannot be booked
- Sessions can be recurring (weekly) or one-time (specific date)
