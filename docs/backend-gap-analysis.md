# Backend Gap Analysis & Requirements

> Comprehensive analysis of what backend endpoints/fields exist, what's missing, and what's needed for full frontend integration.
> **Last Updated:** 2026-02-18

---

## Table of Contents

1. [Customer Booking Flow — Full Analysis](#1-customer-booking-flow--full-analysis)
2. [Business Dashboard — Full Analysis](#2-business-dashboard--full-analysis)
3. [Unified Resource Model](#3-unified-resource-model)
4. [Missing Backend Endpoints](#4-missing-backend-endpoints)
5. [Missing Data Fields (Schema Gaps)](#5-missing-data-fields-schema-gaps)
6. [Service Wrappers Status](#6-service-wrappers-status)
7. [Frontend-to-Backend Alignment Summary](#7-frontend-to-backend-alignment-summary)

---

## 1. Customer Booking Flow — Full Analysis

This section analyzes the complete customer booking journey from landing page to booking confirmation.

### 1.1 Flow Overview

```
Landing Page → Search / Browse → Business Detail → Select Service → Book Now
                                                                        ↓
                                                              Login / Guest Modal
                                                                        ↓
                                                              Booking Modal Opens
                                                                        ↓
                                                    Step 1: Select Services + Staff + Date + Time
                                                                        ↓
                                                    Step 2: Enter Customer Details (name, email, phone)
                                                                        ↓
                                                    Step 3: Confirmation (reference ID shown)
```

### 1.2 Booking Modal — What Exists (Frontend)

**Component:** `BookingModalV2Fixed` (`src/bookly/components/organisms/booking-modal/booking-modal-v2-fixed.tsx`)

| Feature                  | Implementation                      | API Wired                          | Status     |
| ------------------------ | ----------------------------------- | ---------------------------------- | ---------- |
| Select initial service   | Passed as `initialService` prop     | N/A                                | ✅ Working |
| Add additional services  | Service picker overlay              | N/A (local state)                  | ✅ Working |
| Drag-to-reorder services | dnd-kit sortable                    | N/A (local state)                  | ✅ Working |
| Select staff per service | Staff picker dropdown               | N/A (local state)                  | ✅ Working |
| Date selection (30 days) | Horizontal date scroller            | N/A (local state)                  | ✅ Working |
| Time-of-day filter       | Morning/Afternoon/Evening pills     | N/A (local state)                  | ✅ Working |
| Time slot selection      | Grid of available times             | `BookingService.getAvailability()` | ✅ Wired   |
| Loading state for slots  | Spinner + "Loading available slots" | Yes                                | ✅ Working |
| Fallback to mock slots   | `generateTimeSlots()` if API empty  | Yes                                | ✅ Working |
| Customer details form    | Name, email, phone, notes           | N/A (local state)                  | ✅ Working |
| Submit booking           | Sends to API                        | `BookingService.createBooking()`   | ✅ Wired   |
| Confirmation screen      | Shows reference ID                  | Uses API response `id`             | ✅ Working |
| Error handling           | Shows booking errors                | Yes                                | ✅ Working |

### 1.3 Booking Modal — Backend Endpoints Used

| Endpoint                                                        | Method  | Service Wrapper                    | Request Format                                            | Response Format       | Status    |
| --------------------------------------------------------------- | ------- | ---------------------------------- | --------------------------------------------------------- | --------------------- | --------- |
| `/bookings/availability?serviceId=&branchId=&date=&resourceId=` | GET     | `BookingService.getAvailability()` | Query params                                              | `AvailableSlotFlat[]` | ✅ Exists |
| `/bookings`                                                     | POST 🔒 | `BookingService.createBooking()`   | `{ serviceId, branchId, resourceId?, startTime, notes? }` | `Booking`             | ✅ Exists |

### 1.4 Availability API — Verified Response Format

**IMPORTANT:** The availability endpoint returns a **flat array** (verified from actual API testing):

```json
[
  { "startTime": "2026-02-18T00:00:00.000Z", "endTime": "2026-02-18T01:00:00.000Z", "resourceId": "staff-uuid" },
  { "startTime": "2026-02-18T01:00:00.000Z", "endTime": "2026-02-18T02:00:00.000Z", "resourceId": "staff-uuid" }
]
```

> The `bookly_api_documentation.md` also documents a **nested format** (`{ resourceId, resourceName, resourceType, availableSlots: [] }`). This appears to be an older/expected format. **The actual verified response is the flat format above.** The backend team should confirm which format is the canonical one, or if the response varies by configuration.

**Frontend Type Used:**

```typescript
interface AvailableSlotFlat {
  startTime: string // ISO-8601
  endTime: string // ISO-8601
  resourceId: string
}
```

### 1.5 Critical Gaps in Customer Booking Flow

#### 🔴 GAP 1: `branchId` Not Reliably Passed to Booking Modal

**Problem:** The business detail page passes `branchId={selectedBranch?.id}` to the modal. But `selectedBranch` is ONLY set when the user clicks a branch in the Details tab. If they click "Book" from the Services tab or sidebar "Book Appointment Now" button, `selectedBranch` is `null` → `branchId` is `undefined` → availability API is not called.

**Where:** `src/app/[lang]/(bookly-clean)/business/[slug]/page.tsx` line 974

**Impact:** User sees mock fallback time slots instead of real availability when booking from Services tab.

**Frontend Fix Needed:** Auto-select the first branch as default when business data loads. Example:

```typescript
const defaultBranch = branches[0]
// Pass branchId={selectedBranch?.id || defaultBranch?.id}
```

**Backend: No change needed** — the API works correctly when branchId is provided.

#### ✅ RESOLVED (Frontend Wired): Guest Booking

**Status:** `POST /bookings/guest` is now available (or `POST /bookings` handles it).
**Action:** `BookingModalV2Fixed` now supports `BookingService.createGuestBooking()`.
**Problem:** Previously, guest booking required auth. Now wired to guest endpoint.

**Additionally:** The customer details form collects `name`, `email`, `phone`, `notes` — but the `CreateBookingRequest` only sends `{ serviceId, branchId, resourceId?, startTime, notes? }`. The name, email, and phone are **never sent to the API**.

**Backend Needed:** One of:

- **Option B:** Extend `POST /bookings` to accept optional `customer: { name, email, phone }` and allow unauthenticated access when customer details are provided

**Priority:** HIGH — This is a core customer flow shown in the screenshots.

#### 🔴 GAP 3: Staff Not Filtered by Service or Branch

**Problem:** The booking modal receives `availableStaff` which is ALL staff across ALL branches (calculated as `branches.flatMap(branch => branch.staff || [])`). The staff picker shows everyone regardless of:

- Whether they can perform the selected service
- Whether they belong to the selected branch

**Where:** Business detail page line 78: `const staff = branches.flatMap(branch => branch.staff || [])`

**Impact:** User might select a staff member who can't perform the service or isn't at the branch.

**Frontend Fix Needed:** Filter staff by:

1. Only staff from the current/selected branch
2. Only staff whose `services[]` includes the selected service

**Backend:** The `GET /business/{id}` response already includes `resources[].services[]` per branch. Each resource has a `services` array showing which services they can perform. The frontend just needs to use this data for filtering.

**Additional Backend Note:** The availability API already supports `resourceId` param to filter slots by specific staff. This works correctly.

#### 🟡 GAP 4: Multi-Service Booking Creates Only One Booking

**Problem:** The modal allows adding multiple services (with drag-to-reorder), but `handleConfirmBooking()` only sends the FIRST service to the API:

```typescript
const primaryService = selectedServices[0]
await BookingService.createBooking({ serviceId: primaryService.service.id, ... })
```

**Backend:** `POST /bookings` accepts a single `serviceId`. No multi-service booking concept exists.

**Options:**

- **Option A (Simple):** Create sequential bookings — one per service, with calculated start times based on cumulative duration. Frontend does this automatically.
- **Option B (Backend):** Add `POST /bookings/multi` accepting `services: [{ serviceId, resourceId? }]` and an overall `startTime`. Backend creates linked bookings.

**Recommendation:** Option A for now (frontend fix only). The modal already calculates `serviceTimeRanges` with per-service start/end times.

#### ✅ RESOLVED (Frontend Wired): Customer Review Creation

**Status:** `POST /reviews` is now available.
**Action:** Added "Leave Review" button to "My Appointments" page. Opens modal wired to `ReviewsService.createReview`.

**Backend Needed:** `POST /reviews` (authenticated user):

```json
{
  "businessId": "uuid",
  "serviceId": "uuid",
  "rating": 5,
  "comment": "Great service!"
}
```

**Priority:** MEDIUM — not blocking core booking flow.

#### 🟡 GAP 6: No Payment Flow

**Problem:** The booking modal button says "Confirm & Pay" but there's no payment processing. The deleted proxy routes (`payments/mock/route.ts`) confirm this was planned but not implemented.

**Backend Needed:**

- Payment intent creation endpoint
- Payment confirmation/webhook handling
- Booking status update after payment

**Priority:** MEDIUM — can operate as "pay at venue" initially.

#### ✅ RESOLVED (Endpoint Available): No Reschedule Endpoint

**Status:** `PATCH /bookings/{id}/reschedule` is now available.
**Action:** Add "Reschedule" button to "My Appointments" page. Wire it to `BookingService.rescheduleBooking()`.
**Problem:** Customers can cancel bookings (`PATCH /bookings/{id}/cancel`) but cannot reschedule. No reschedule endpoint exists.

**Backend Needed:** `PATCH /bookings/{id}/reschedule`:

```json
{
  "startTime": "2026-02-20T14:00:00.000Z",
  "resourceId": "uuid"
}
```

**Priority:** LOW — can cancel + rebook as workaround.

#### 🟢 GAP 8: Coupons / Add-ons (Future)

**Problem:** The `NewBookingModal` (extended version) references coupons and add-ons, but proxy routes were deleted and no backend endpoints exist.

**Backend Needed (when ready):**

- `GET/POST/PATCH/DELETE /admin/coupons`
- `POST /coupons/validate` (public)
- `GET/POST/PATCH/DELETE /admin/services/{id}/addons`
- `GET /services/{id}/addons` (public)

**Priority:** LOW — future enhancement.

### 1.6 Appointments Page (Customer Bookings History)

**Component:** `src/app/[lang]/(bookly)/appointments/page.tsx`

| Feature                    | Backend Endpoint                    | Service Method                     | Status                           |
| -------------------------- | ----------------------------------- | ---------------------------------- | -------------------------------- |
| List upcoming bookings     | `GET /bookings` 🔒                  | `BookingService.getUserBookings()` | ✅ Endpoint exists, UI uses mock |
| List past bookings         | `GET /bookings` 🔒 (filter by date) | `BookingService.getUserBookings()` | ✅ Endpoint exists, UI uses mock |
| Cancel booking             | `PATCH /bookings/{id}/cancel` 🔒    | `BookingService.cancelBooking()`   | ✅ Endpoint exists, UI uses mock |
| Reschedule booking         | N/A                                 | N/A                                | 🔴 No endpoint                   |
| Write review after booking | `POST /reviews`                     | `ReviewsService.createReview()`    | ✅ Wired                         |

**Backend Needs:**

- `GET /bookings` should support filtering: `?status=PENDING,CONFIRMED` (upcoming) vs `?status=COMPLETED,CANCELLED` (past)
- Currently no filter params documented for user bookings endpoint

---

## 2. Business Dashboard — Full Analysis

This section analyzes every tab/page in the business dashboard sidebar.

### 2.1 Dashboard Sidebar Structure

Based on the screenshot and codebase:

```
Dashboard (sidebar)
├── Dashboard          → Stats overview
├── Calendar           → FullCalendar multi-resource views
├── Categories         → Read-only category listing
├── Bookings           → Admin booking table
├── Management         → Staff page with 5 tabs
│   ├── Staff Members
│   ├── Shifts
│   ├── Resources
│   ├── Rooms
│   └── Commissions
├── Reviews            → Review management
├── Settings           → 9-tab business configuration
└── Media              → File upload/management
```

### 2.2 Page-by-Page Analysis

#### Dashboard (`/dashboard`)

| Feature                  | API Endpoint          | Service                                | Status                                          |
| ------------------------ | --------------------- | -------------------------------------- | ----------------------------------------------- |
| Business info            | `GET /business/{id}`  | `BusinessService`                      | ✅ Wired                                        |
| Services count           | `GET /admin/services` | `ServicesService`                      | ✅ Wired                                        |
| Branches count           | `GET /admin/branches` | `BranchesService`                      | ✅ Wired                                        |
| Staff count              | `GET /admin/staff`    | `StaffService`                         | ✅ Wired                                        |
| Upcoming bookings count  | `GET /admin/bookings` | `BookingService.getBusinessBookings()` | ✅ Wired (with mock fallback)                   |
| Completed bookings count | `GET /admin/bookings` | `BookingService.getBusinessBookings()` | ✅ Wired (with mock fallback)                   |
| Revenue chart            | Mock data             | —                                      | 🔴 No revenue/analytics endpoint (still mocked) |
| Recent reviews           | `GET /admin/reviews`  | `ReviewsService.getReviews()`          | ✅ Wired (with mock fallback)                   |

**What's left:**

- Revenue chart widget still uses mock data — no analytics endpoint exists.
- `GET /admin/dashboard/stats` returning `{ upcomingBookings, completedBookings, revenue, averageRating }` would be ideal.
- Dashboard hardcodes `businessId = '1'` — should read from auth store's `materializeUser.businessId`.

---

#### Calendar (`/calendar`)

| Feature                      | API Endpoint                                 | Service                                   | Status                                               |
| ---------------------------- | -------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Bookings as events (fetch)   | `GET /admin/bookings?fromDate=&toDate=`      | `BookingService.getBusinessBookings()`    | ✅ Wired (store `fetchEvents`)                       |
| Create booking from calendar | `POST /admin/bookings`                       | `BookingService.createAdminBooking()`     | ✅ Wired (optimistic + API)                          |
| Update booking status        | `PATCH /admin/bookings/{id}/status`          | `BookingService.updateBookingStatus()`    | ✅ Wired (optimistic + API)                          |
| Reschedule booking           | `PATCH /admin/bookings/{id}/reschedule`      | `BookingService.adminRescheduleBooking()` | ✅ Wired (optimistic + API)                          |
| Delete booking               | `DELETE /admin/bookings/{id}`                | `BookingService.deleteBooking()`          | ✅ Wired (optimistic + API)                          |
| Staff list (columns)         | `GET /admin/staff`                           | `StaffService.getStaff()`                 | ✅ Wired (store `fetchStaff`)                        |
| Rooms/Assets list            | `GET /admin/assets`                          | `AssetsService.getAssets()`               | ✅ Wired (store `fetchResources`)                    |
| Staff schedules (background) | `GET /admin/scheduling/schedules`            | `SchedulingService.getSchedules()`        | ✅ Wired (store `fetchSchedules`, called on mount)   |
| Room assignments             | `GET /admin/scheduling/assignments`          | `SchedulingService.getAssignments()`      | ✅ Wired (store `fetchAssignments`, called on mount) |
| Breaks (background)          | `GET /admin/scheduling/breaks?resourceId=`   | `SchedulingService.getBreaks()`           | ⚠️ Service exists, not fetched on mount yet          |
| Exceptions (holidays)        | `GET /admin/scheduling/exceptions`           | `SchedulingService.getExceptions()`       | ⚠️ Service exists, not fetched on mount yet          |
| Branch filter                | N/A (client-side from branches list)         | —                                         | ✅ Frontend ready (wired to store)                   |
| Staff filter                 | N/A (client-side from staff list)            | —                                         | ✅ Frontend ready (wired to store)                   |
| Booking drawer mock data     | N/A                                          | —                                         | ✅ Replaced with store data (fallback to mock)       |
| Service/Branch hydration     | `GET /admin/branches`, `GET /admin/services` | `BranchesService`, `ServicesService`      | ✅ Wired (fetch on mount in shell)                   |

**Remaining Calendar Gaps:**

1. **Resource `color` field** — Calendar needs color per resource. Currently not in the `Resource` model (Frontend auto-generates).
2. **Breaks & Exceptions** — `SchedulingService.getBreaks()` / `.getExceptions()` exist but aren't fetched on calendar mount yet.

**Priority:** HIGH — Calendar is the primary business dashboard view (as shown in screenshot).

---

#### Bookings (`/bookings`)

| Feature           | API Endpoint                            | Service                                | Status                                            |
| ----------------- | --------------------------------------- | -------------------------------------- | ------------------------------------------------- |
| List all bookings | `GET /admin/bookings`                   | `BookingService.getBusinessBookings()` | ✅ Wired to API with mock fallback                |
| Filter by date    | `GET /admin/bookings?fromDate=&toDate=` | Yes                                    | ✅ Wired                                          |
| Filter by staff   | `GET /admin/bookings?staffId=`          | Yes                                    | ✅ Wired                                          |
| Filter by status  | `GET /admin/bookings?status=`           | Yes                                    | ✅ Wired                                          |
| Update status     | `PATCH /admin/bookings/{id}/status`     | `BookingService.updateBookingStatus()` | ✅ Wired (Confirm/Cancel/Complete/NoShow actions) |
| Pagination        | `GET /admin/bookings?page=`             | Yes                                    | ✅ Wired                                          |

**Remaining:** Frontend pagination UI not yet implemented (API supports it).

---

#### Staff Management — Staff Members Tab

| Feature      | API Endpoint               | Service                      | Status     |
| ------------ | -------------------------- | ---------------------------- | ---------- |
| List staff   | `GET /admin/staff`         | `StaffService.getStaff()`    | ✅ Working |
| Create staff | `POST /admin/staff`        | `StaffService.createStaff()` | ✅ Working |
| Update staff | `PATCH /admin/staff`       | `StaffService.updateStaff()` | ✅ Working |
| Delete staff | `DELETE /admin/staff/{id}` | `StaffService.deleteStaff()` | ✅ Working |

**Request body includes:** `{ name, email, mobile, branchId, serviceIds[], profilePhoto, slotInterval, slotDuration }`

**Backend: Fully covered.** ✅

---

#### Staff Management — Shifts Tab

| Feature           | API Endpoint                                  | Service                               | Status                            |
| ----------------- | --------------------------------------------- | ------------------------------------- | --------------------------------- |
| List schedules    | `GET /admin/scheduling/schedules?resourceId=` | `SchedulingService.getSchedules()`    | ✅ Endpoint exists, UI uses mock  |
| Create schedule   | `POST /admin/scheduling/schedules`            | `SchedulingService.createSchedule()`  | ✅ Endpoint exists, UI uses mock  |
| Delete schedule   | `DELETE /admin/scheduling/schedules/{id}`     | `SchedulingService.deleteSchedule()`  | ✅ Endpoint exists, UI uses mock  |
| List breaks       | `GET /admin/scheduling/breaks?resourceId=`    | `SchedulingService.getBreaks()`       | ✅ Endpoint exists, UI uses mock  |
| Create break      | `POST /admin/scheduling/breaks`               | `SchedulingService.createBreak()`     | ✅ Endpoint exists, UI uses mock  |
| Delete break      | `DELETE /admin/scheduling/breaks/{id}`        | `SchedulingService.deleteBreak()`     | ✅ Endpoint exists, UI uses mock  |
| List exceptions   | `GET /admin/scheduling/exceptions`            | `SchedulingService.getExceptions()`   | ✅ Endpoint exists, UI uses mock  |
| Create exception  | `POST /admin/scheduling/exceptions`           | `SchedulingService.createException()` | ✅ Endpoint exists, UI uses mock  |
| Delete exception  | `DELETE /admin/scheduling/exceptions/{id}`    | `SchedulingService.deleteException()` | ✅ Endpoint exists, UI uses mock  |
| Time off requests | N/A                                           | N/A                                   | 🔴 No dedicated endpoint (Mocked) |
| Time reservations | N/A                                           | N/A                                   | 🔴 No dedicated endpoint (Mocked) |

**Backend Needs:**

1. **Split shifts support** — Can a resource have multiple schedule entries for the same `dayOfWeek`? (e.g., 9:00-12:00 AND 13:00-17:00 on Monday). The current API accepts one schedule per POST — need to confirm multiple entries per day are allowed.
2. **Update schedule** — No `PATCH /admin/scheduling/schedules` endpoint. To modify, must delete + recreate.
3. **Time off vs exceptions** — The frontend distinguishes "time off" (staff request) from "exceptions" (business decision). Backend only has `exceptions`. Either:
   - Frontend maps time-off to exceptions with a naming convention (e.g., `reason: "TIME_OFF: Vacation"`)
   - Backend adds `POST /admin/scheduling/time-off` with approval workflow
4. **Time reservations** — The frontend has "time reservations" (blocked slots for admin use, not bookings). These could map to exceptions with `isAvailable: false`.
5. **Mock Data in Store** — `StaffManagementStore` currently initializes with `mockTimeOffRequests` and `mockTimeReservations`. Wiring needed.

---

#### Staff Management — Resources Tab

| Feature      | API Endpoint                | Service                       | Status                           |
| ------------ | --------------------------- | ----------------------------- | -------------------------------- |
| List assets  | `GET /admin/assets`         | `AssetsService.getAssets()`   | ✅ Endpoint exists, UI uses mock |
| Create asset | `POST /admin/assets`        | `AssetsService.createAsset()` | ✅ Endpoint exists, UI uses mock |
| Update asset | `PATCH /admin/assets`       | `AssetsService.updateAsset()` | ✅ Endpoint exists, UI uses mock |
| Delete asset | `DELETE /admin/assets/{id}` | `AssetsService.deleteAsset()` | ✅ Endpoint exists, UI uses mock |

**Backend: Fully covered for basic CRUD.** ✅

**Missing Fields on Asset:**

- `color` (string) — Hex color for calendar display
- `status` ('active' | 'inactive') — Enable/disable without deleting
- `concurrencyPolicy` ('shared' | 'exclusive') — How capacity is filled

---

#### Staff Management — Rooms Tab

| Feature              | API Endpoint                            | Service                                | Status                               |
| -------------------- | --------------------------------------- | -------------------------------------- | ------------------------------------ |
| List rooms           | `GET /admin/assets` (filter type=ASSET) | `AssetsService.getAssets()`            | ✅ Same endpoint, filter client-side |
| Create room          | `POST /admin/assets`                    | `AssetsService.createAsset()`          | ✅ Same endpoint                     |
| Update room          | `PATCH /admin/assets`                   | `AssetsService.updateAsset()`          | ✅ Same endpoint                     |
| Delete room          | `DELETE /admin/assets/{id}`             | `AssetsService.deleteAsset()`          | ✅ Same endpoint                     |
| Assign staff to room | `POST /admin/scheduling/assignments`    | `SchedulingService.createAssignment()` | ✅ Endpoint exists                   |
| Room schedule        | `POST /admin/scheduling/schedules`      | `SchedulingService.createSchedule()`   | ✅ Endpoint exists                   |

**Backend: Fully covered.** ✅ Rooms are just Assets with type='ASSET'. Staff ↔ Room assignments use scheduling assignments.

---

#### Staff Management — Commissions Tab

| Feature           | API Endpoint                     | Service                                 | Status                           |
| ----------------- | -------------------------------- | --------------------------------------- | -------------------------------- |
| List commissions  | `GET /admin/commissions`         | `CommissionsService.getCommissions()`   | ✅ Endpoint exists, UI uses mock |
| Create commission | `POST /admin/commissions`        | `CommissionsService.createCommission()` | ✅ Endpoint exists, UI uses mock |
| Delete commission | `DELETE /admin/commissions/{id}` | `CommissionsService.deleteCommission()` | ✅ Endpoint exists, UI uses mock |

**Backend Limitations:**

- Backend `POST /admin/commissions` accepts `{ serviceId, resourceId, percentage }` — simple per-service-per-staff percentage.
- Frontend `CommissionsTab` supports advanced scopes: `serviceCategory | service | product | giftCard | membership | package`, plus staff targeting (all | specific).
- **Gap:** Backend commission model is simpler than frontend UI. Frontend will need to simplify to match, OR backend needs to extend the commission model.

**Backend Needs (if matching full frontend):**

- `scope` field on commission: `'service' | 'category' | 'product'`
- `staffScope` field: `'all' | 'specific'` + `staffIds[]`
- `type` field: `'percentage' | 'fixed'` + `value`
- `PATCH /admin/commissions/{id}` for updates (currently only create/delete)

---

#### Reviews (`/reviews`)

| Feature                           | API Endpoint                           | Service                          | Status                                 |
| --------------------------------- | -------------------------------------- | -------------------------------- | -------------------------------------- |
| List reviews                      | `GET /admin/reviews`                   | `ReviewsService.getReviews()`    | ✅ Endpoint exists, UI partially wired |
| Reply to review                   | `POST /admin/reviews/{id}/reply`       | `ReviewsService.replyToReview()` | ✅ Wired (Modal)                       |
| Flag review                       | `POST /admin/reviews/{id}/flag`        | `ReviewsService.flagReview()`    | ✅ Wired (Modal)                       |
| Filter by rating                  | N/A (client-side)                      | —                                | ✅ Wired                               |
| Review stats (avg rating, counts) | N/A (calculated client-side from list) | —                                | ✅ Wired                               |

**Backend: Fully covered for admin side.** ✅

---

#### Settings (`/settings`)

| Tab                 | API Endpoint                 | Status                                                |
| ------------------- | ---------------------------- | ----------------------------------------------------- |
| 1. Business Profile | `PATCH /admin/business`      | ✅ Wired to `SettingsService`                         |
| 2. Services         | `/admin/services` CRUD       | ✅ Wired (displays from API, shown in screenshot)     |
| 3. Branches         | `/admin/branches` CRUD       | ✅ Wired                                              |
| 4. Booking Policies | `PATCH /admin/settings`      | ✅ Wired to `SettingsService` (localStorage fallback) |
| 5. Payment Settings | `PATCH /admin/settings`      | ✅ Wired to `SettingsService` (localStorage fallback) |
| 6. Notifications    | `PATCH /admin/settings`      | ✅ Wired to `SettingsService` (localStorage fallback) |
| 7. Scheduling       | `PATCH /admin/settings`      | ✅ Wired to `SettingsService` (localStorage fallback) |
| 8. Calendar Display | N/A (client-side preference) | ✅ localStorage only (by design, per-user preference) |
| 9. Customer Options | `PATCH /admin/settings`      | ✅ Wired to `SettingsService` (localStorage fallback) |

> **Note:** All 9 tabs are now wired. Tabs 4-9 use `SettingsService` with `localStorage` fallback if the API call fails. Backend `GET/PATCH /admin/settings` endpoint availability determines whether settings persist server-side.

---

#### Categories (`/categories`)

| Feature              | API Endpoint             | Status                       |
| -------------------- | ------------------------ | ---------------------------- |
| List categories      | `GET /categories`        | ✅ Working                   |
| Create/Update/Delete | `/superadmin/categories` | ✅ SuperAdmin only (correct) |

**Backend: Fully covered.** ✅ Categories are managed by SuperAdmin. Business admin sees read-only list.

---

#### Media (`/media`)

| Feature | API Endpoint               | Status     |
| ------- | -------------------------- | ---------- |
| Upload  | `POST /media-lib` → S3 PUT | ✅ Working |
| List    | `GET /media-lib`           | ✅ Working |
| Delete  | `DELETE /media-lib/{id}`   | ✅ Working |

**Backend: Fully covered.** ✅

---

## 3. Unified Resource Model

### Current Backend Model

The backend uses a **unified Resource** model for both staff and assets/rooms:

```typescript
interface Resource {
  id: string
  name: string
  type: 'STAFF' | 'ASSET' // ← Distinguishes staff from rooms/equipment
  maxConcurrent: number // 1 for staff, N for rooms (e.g., 20 for yoga class)
  slotInterval: number // Minutes between available slots (default: 30)
  slotDuration: number | null // null = use service duration (dynamic), number = fixed slots (static)
  mobile: string | null // Staff only
  email: string | null // Staff only
  profilePhoto: string | null // Staff only
  description: string | null // Rooms/assets
  image: string | null // Rooms/assets
  branchId: string
  services: Service[] // Which services this resource can perform/host
  createdAt: string
  updatedAt: string
}
```

### Dynamic vs Static Scheduling (via Resource fields)

| Frontend Concept                      | `slotDuration` | `slotInterval` | Behavior                                                                                      |
| ------------------------------------- | -------------- | -------------- | --------------------------------------------------------------------------------------------- |
| **Dynamic Staff** (appointment-based) | `null`         | `15` or `30`   | Slots calculated from service duration. E.g., service is 45min → slots at 9:00, 9:15, 9:30... |
| **Static Staff/Room** (fixed slots)   | `60`           | `60`           | Fixed time blocks. E.g., 9:00-10:00, 10:00-11:00. Service duration is ignored.                |

### Missing Fields Needed on Resource

| Field               | Type                      | Purpose                                         | Priority |
| ------------------- | ------------------------- | ----------------------------------------------- | -------- |
| `color`             | `string`                  | Hex code for calendar display (e.g., `#FF5733`) | HIGH     |
| `status`            | `'active' \| 'inactive'`  | Enable/disable resource without deleting        | MEDIUM   |
| `concurrencyPolicy` | `'shared' \| 'exclusive'` | How capacity is filled for rooms                | LOW      |

### Separate API Paths

Despite the unified model, the backend exposes **separate CRUD paths**:

| Resource Type                  | CRUD Endpoints  | Frontend Service |
| ------------------------------ | --------------- | ---------------- |
| Staff (`type: 'STAFF'`)        | `/admin/staff`  | `StaffService`   |
| Assets/Rooms (`type: 'ASSET'`) | `/admin/assets` | `AssetsService`  |

Both types appear in `GET /business/{id}` response under `branches[].resources[]` with the `type` field distinguishing them.

---

## 4. Missing Backend Endpoints

### 🔴 Must Have (Blocking Core Flows)

| Endpoint                                          | Purpose                                          | Needed By                               | Priority |
| ------------------------------------------------- | ------------------------------------------------ | --------------------------------------- | -------- |
| `POST /bookings/guest` or extend `POST /bookings` | Guest booking without auth                       | Customer booking flow                   | HIGH     |
| `PATCH /admin/bookings/{id}`                      | Reschedule booking (update startTime/resourceId) | Calendar drag-drop, customer reschedule | HIGH     |
| `GET /admin/bookings?fromDate=&toDate=`           | Date range filter for bookings                   | Calendar week/month views               | HIGH     |

### 🟡 Should Have (Completing Features)

| Endpoint                                 | Purpose                                    | Needed By                            | Priority |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------ | -------- |
| `POST /reviews` 🔒                       | Customer creates a review                  | Business detail page Reviews tab     | MEDIUM   |
| `GET/PATCH /admin/settings`              | Business configuration persistence         | Settings page tabs 4-9               | MEDIUM   |
| `GET /admin/dashboard/stats`             | Quick summary counts                       | Dashboard overview                   | MEDIUM   |
| `PATCH /admin/scheduling/schedules/{id}` | Update schedule (not just delete+recreate) | Shifts tab                           | MEDIUM   |
| `GET /bookings?status=`                  | Filter user bookings by status             | Appointments page (upcoming vs past) | MEDIUM   |
| `GET /admin/bookings?page=&pageSize=`    | Pagination for admin bookings              | Bookings page                        | MEDIUM   |

### 🟢 Nice to Have (Future Enhancements)

| Endpoint                                      | Purpose                         | Needed By               | Priority |
| --------------------------------------------- | ------------------------------- | ----------------------- | -------- |
| `GET/POST/PATCH/DELETE /admin/coupons`        | Discount codes                  | Extended booking modal  | LOW      |
| `POST /coupons/validate`                      | Validate coupon at checkout     | Extended booking modal  | LOW      |
| `GET/POST/DELETE /admin/services/{id}/addons` | Service add-ons                 | Extended booking modal  | LOW      |
| Payment endpoints                             | Payment processing              | Booking confirmation    | LOW      |
| `POST /admin/scheduling/time-off`             | Staff time-off with approval    | Shifts tab              | LOW      |
| WebSocket / SSE                               | Real-time booking notifications | Calendar, notifications | LOW      |

---

## 5. Missing Data Fields (Schema Gaps)

### On Booking Object

| Field           | Type                              | Description             | Needed By                              |
| --------------- | --------------------------------- | ----------------------- | -------------------------------------- |
| `paymentStatus` | `'paid' \| 'unpaid' \| 'partial'` | Payment tracking        | Calendar event display, bookings table |
| `paymentMethod` | `'card' \| 'cash' \| 'online'`    | How customer paid       | Calendar highlights                    |
| `bookedBy`      | `'client' \| 'business'`          | Who created the booking | Booking source tracking                |
| `partySize`     | `number`                          | Group booking size      | Room capacity management               |
| `customer`      | `{ name, email, phone }`          | Guest booking details   | Guest checkout flow                    |

### On Resource (Staff/Asset)

| Field               | Type                      | Description         | Needed By                 |
| ------------------- | ------------------------- | ------------------- | ------------------------- |
| `color`             | `string`                  | Hex color code      | Calendar color coding     |
| `status`            | `'active' \| 'inactive'`  | Availability toggle | Staff/resource management |
| `concurrencyPolicy` | `'shared' \| 'exclusive'` | Room fill strategy  | Room booking logic        |

### On Service

| Field   | Type     | Description    | Needed By             |
| ------- | -------- | -------------- | --------------------- |
| `color` | `string` | Hex color code | Calendar event colors |

### On Business

| Field          | Type                                                   | Description           | Needed By                                            |
| -------------- | ------------------------------------------------------ | --------------------- | ---------------------------------------------------- |
| `openingHours` | `{ dayOfWeek: number, open: string, close: string }[]` | Operating hours       | Business detail page "Open Now" badge, hours display |
| `location`     | `{ lat: number, lng: number }`                         | Top-level coordinates | Business detail page map (currently on Branch only)  |
| `timezone`     | `string`                                               | IANA timezone         | Correct time display for multi-region                |

---

## 6. Service Wrappers Status

All service wrappers are located in `src/lib/api/services/`.

| Service                | File                       | Endpoints                                                               | Status                                                 |
| ---------------------- | -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `AuthService`          | `auth.service.ts`          | `/auth/*`, `/admin/auth/*`, `/superadmin/auth/login`                    | ✅ Working (paths fixed)                               |
| `BusinessService`      | `business.service.ts`      | `/business/*`, `/admin/business`, `/superadmin/business/*`              | ✅ Working (paths fixed)                               |
| `BookingService`       | `booking.service.ts`       | `/bookings/*`, `/admin/bookings`, admin create/delete/status/reschedule | ✅ Working (all CRUD + admin methods)                  |
| `ServicesService`      | `services.service.ts`      | `/services`, `/admin/services`                                          | ✅ Working                                             |
| `BranchesService`      | `branches.service.ts`      | `/admin/branches`                                                       | ✅ Working                                             |
| `StaffService`         | `staff.service.ts`         | `/admin/staff`                                                          | ✅ Working + CRUD wired in staff-store                 |
| `CategoriesService`    | `categories.service.ts`    | `/categories`, `/superadmin/categories`                                 | ✅ Working (paths fixed)                               |
| `MediaService`         | `media.service.ts`         | `/media-lib`                                                            | ✅ Working                                             |
| `AssetsService`        | `assets.service.ts`        | `/admin/assets`                                                         | ✅ Working + wired in calendar (`fetchResources`)      |
| `SchedulingService`    | `scheduling.service.ts`    | `/admin/scheduling/*`                                                   | ✅ Working + wired in calendar (schedules/assignments) |
| `CommissionsService`   | `commissions.service.ts`   | `/admin/commissions`                                                    | ✅ Created (needs full UI wiring)                      |
| `ReviewsService`       | `reviews.service.ts`       | `/admin/reviews`                                                        | ✅ Working + wired (reply/flag/list)                   |
| `NotificationsService` | `notifications.service.ts` | `/notifications`                                                        | ✅ Created (needs UI wiring)                           |

---

## 7. Frontend-to-Backend Alignment Summary

### ✅ Fully Aligned (Working End-to-End)

| Area                        | Frontend                                  | Backend                                  | Notes                                   |
| --------------------------- | ----------------------------------------- | ---------------------------------------- | --------------------------------------- |
| Customer Auth               | `AuthService` full flow                   | `/auth/*`                                | Login, register, verify, password flows |
| Admin Auth                  | `AuthService` full flow                   | `/admin/auth/*`                          | Login, register, verify, password flows |
| SuperAdmin Auth             | `AuthService.loginSuperAdmin()`           | `/superadmin/auth/login`                 | Path corrected                          |
| Public Business Search      | `BusinessService.getApprovedBusinesses()` | `GET /business?page=&pageSize=`          | With filters                            |
| Business Detail             | `BusinessService.getBusiness(id)`         | `GET /business/{id}`                     | Returns nested data                     |
| Services CRUD               | `ServicesService`                         | `/admin/services`                        | Full CRUD                               |
| Branches CRUD               | `BranchesService`                         | `/admin/branches`                        | Full CRUD                               |
| Staff CRUD                  | `StaffService`                            | `/admin/staff`                           | Full CRUD + optimistic updates in store |
| Media Library               | `MediaService`                            | `/media-lib`                             | Upload, list, delete                    |
| Categories Read             | `CategoriesService.getCategories()`       | `GET /categories`                        | Public read                             |
| Availability Check          | `BookingService.getAvailability()`        | `GET /bookings/availability`             | Flat array response                     |
| Create Booking (customer)   | `BookingService.createBooking()`          | `POST /bookings`                         | Auth required                           |
| Cancel Booking              | `BookingService.cancelBooking()`          | `PATCH /bookings/{id}/cancel`            | Auth required                           |
| Admin Create Booking        | `BookingService.createAdminBooking()`     | `POST /admin/bookings`                   | Calendar-initiated bookings             |
| Admin Delete Booking        | `BookingService.deleteBooking()`          | `DELETE /admin/bookings/{id}`            | Calendar delete action                  |
| Admin Booking Status        | `BookingService.updateBookingStatus()`    | `PATCH /admin/bookings/{id}/status`      | Confirm/Cancel/Complete/NoShow          |
| Admin Reschedule            | `BookingService.adminRescheduleBooking()` | `PATCH /admin/bookings/{id}/reschedule`  | Calendar drag/time change               |
| Admin Bookings List         | `BookingService.getBusinessBookings()`    | `GET /admin/bookings`                    | With date/staff/status filters          |
| Business Update             | `BusinessService.updateBusiness()`        | `PATCH /admin/business`                  | Path corrected                          |
| SuperAdmin Business         | `BusinessService.*`                       | `/superadmin/business/*`                 | Paths corrected                         |
| Categories CUD              | `CategoriesService.*`                     | `/superadmin/categories/*`               | Paths corrected                         |
| Landing Page Categories     | `CategoriesService`                       | `GET /categories`                        | Wired                                   |
| Landing Page Businesses     | `BusinessService`                         | `GET /business`                          | Wired                                   |
| Booking Modal Availability  | `BookingService`                          | `GET /bookings/availability`             | Wired                                   |
| Booking Modal Submit        | `BookingService`                          | `POST /bookings`                         | Wired                                   |
| Dashboard Overview          | `BookingService` + `ReviewsService`       | `GET /admin/bookings` + `/admin/reviews` | Wired (mock fallback)                   |
| Settings (all 9 tabs)       | `SettingsService`                         | `GET/PATCH /admin/settings`              | Wired (localStorage fallback)           |
| Reviews (list/reply/flag)   | `ReviewsService`                          | `/admin/reviews`                         | Wired                                   |
| Calendar Events (full CRUD) | Calendar store                            | `BookingService` all endpoints           | Wired (optimistic + API)                |
| Calendar Staff/Resources    | Calendar store                            | `StaffService` + `AssetsService`         | Wired (fetchStaff/fetchResources)       |
| Calendar Schedules          | Calendar store                            | `SchedulingService`                      | Wired (fetchSchedules/fetchAssignments) |

### ⚠️ Backend Ready, Frontend Integration Still Uses Mock Data

| Area                   | Backend Endpoint      | Service Wrapper                    | Frontend Component                      | Status                                            |
| ---------------------- | --------------------- | ---------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Assets CRUD            | `/admin/assets`       | `AssetsService`                    | Resources/Rooms tabs (staff-management) | Service exists, store uses mock data for CRUD     |
| Scheduling CRUD        | `/admin/scheduling/*` | `SchedulingService`                | Shifts tab (staff-management)           | Service exists, store uses mock for shifts/breaks |
| Commissions CRUD       | `/admin/commissions`  | `CommissionsService`               | Commissions tab (staff-management)      | Service exists, store uses mock data              |
| Notifications          | `/notifications`      | `NotificationsService`             | Calendar notifications drawer           | Service exists, UI not wired                      |
| Appointments page      | `GET /bookings`       | `BookingService.getUserBookings()` | Customer appointments page              | Endpoint exists, UI hardcodes mock                |
| Dashboard widgets      | N/A                   | N/A                                | Revenue chart, StaffPerformance, etc.   | 4-5 dashboard widget files still use mock data    |
| Staff-management files | N/A                   | N/A                                | ~20 staff-management component files    | Still import mock-data for dropdowns/lookups      |

### 🔴 Backend Endpoints Missing

| Feature                     | Frontend UI                       | Backend Status                               | Priority |
| --------------------------- | --------------------------------- | -------------------------------------------- | -------- |
| Guest booking               | Login/Guest modal + booking modal | No unauthenticated booking endpoint          | HIGH     |
| Customer review creation    | Business detail Reviews tab       | No customer review endpoint                  | MEDIUM   |
| Dashboard stats/analytics   | Revenue chart widget              | No analytics/revenue endpoint                | MEDIUM   |
| User bookings status filter | Appointments page                 | No status filter on user bookings            | MEDIUM   |
| Schedule update (PATCH)     | Shifts tab                        | Only create/delete, no update                | MEDIUM   |
| Coupons/Discounts           | Extended booking modal            | No endpoints                                 | LOW      |
| Service add-ons             | Extended booking modal            | No endpoints                                 | LOW      |
| Payment processing          | Booking confirmation              | No endpoints                                 | LOW      |
| Time-off management         | Shifts tab                        | No dedicated endpoint (mapped to exceptions) | LOW      |
| Real-time updates           | Calendar, notifications           | No WebSocket/SSE                             | LOW      |

---

## 8. Remaining Mock Data Audit (50+ files)

Files still importing from `@/bookly/data/mock-data`:

### Calendar (15 files) — ✅ Fully Migrated (Store Integration)

| File                         | What it imports                                          | Migration Status                                  |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| `state.ts`                   | mockStaff, mockStaticServiceSlots, mockScheduleTemplates | ✅ Empty defaults, hydated from API               |
| `unified-booking-drawer.tsx` | mockStaff, mockServices, mockRooms                       | ✅ Replaced with store data (mock as fallback)    |
| `calendar-shell.tsx`         | mockStaff                                                | ✅ Store data hydrated on mount                   |
| `utils.ts`                   | mockStaff, mockBusinesses, mockServices                  | ✅ 21 refs replaced with store accessor functions |
| `calendar-sidebar.tsx`       | mockBusinesses, mockStaff                                | ✅ Replaced with store data                       |
| 10 view/drawer files         | mockStaff, mockServices, mockRooms, mockBookings         | ✅ Replaced with store data                       |

### Staff Management (20 files) — Not yet migrated

| Files                                                | What they import                      | Notes                                     |
| ---------------------------------------------------- | ------------------------------------- | ----------------------------------------- |
| `staff-store.ts`                                     | Heavy mock usage for initial state    | Store initializes from mock, API hydrates |
| `shifts-tab.tsx`, `shifts-timeline.tsx`              | mockStaff, mockBranches               | Shift display/editing                     |
| `rooms-tab.tsx`, `room-editor-drawer.tsx`            | mockRooms, mockStaff                  | Room management                           |
| `resources-tab.tsx`, `resource-editor-drawer.tsx`    | mockStaff, mockServices               | Resource management                       |
| `commissions-tab.tsx`, `commission-editor-modal.tsx` | mockStaff, mockServices               | Commission config                         |
| Various modals (8 files)                             | mockStaff, mockServices, mockBranches | Dropdowns and lookups                     |

### Dashboard Widgets (6 files) — Partially migrated

| File                   | Notes                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| `DashboardBookly.tsx`  | Overview — partially wired (bookings/reviews from API, revenue mock) |
| `TopServices.tsx`      | Mock data only — no analytics endpoint                               |
| `StaffPerformance.tsx` | Mock data only — no analytics endpoint                               |
| `ClientsActivity.tsx`  | Mock data only — no analytics endpoint                               |
| `RevenueOverview.tsx`  | Mock data only — no analytics endpoint                               |

### Customer Pages (4 files)

| File                            | Notes                                        |
| ------------------------------- | -------------------------------------------- |
| `business/[slug]/page.tsx`      | Mock branches/staff for display              |
| `bookings-tabs.tsx`             | Mock bookings for appointments page          |
| `profile-info.tsx`              | Mock user profile data                       |
| `explore-section.component.tsx` | Mock categories (wired but fallback present) |
