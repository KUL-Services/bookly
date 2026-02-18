# Integration Status Report

> Current state of frontend-backend integration as of today.

---

## ✅ Fully Integrated (Production Ready)

These features are connected to the live API, use correct data models, and are functioning as expected.

### 1. Customer Authentication

- **Login / Register / Verify Email**: Full flow working (`/auth/*`).
- **Password Reset**: Forgot/Reset password flows active.
- **Session Management**: JWT storage and `useAuthStore` hydration with 24-hour session expiry.
- **Mock Auth Fallback**: Configurable via `NEXT_PUBLIC_USE_MOCK_AUTH=true` for development.

### 2. Public Discovery & Search

- **Search Page**: Fetches real businesses via `BusinessService.getApprovedBusinesses()`.
- **Filtering**: Category (`categoryId`), Price (`priceFrom`, `priceTo`), and Search (`search`) filters working with API params.
- **Client-side Filtering**: Rating and sort order applied post-API call.
- **Business Cards**: Correctly mapping API response to UI components.

### 3. Customer Profile

- **View Profile**: Fetches real user details (`GET /auth/details`).
- **Edit Profile**: Updates forwarded to API (`PATCH /auth`).
- **Change Password**: Working via `PATCH /auth/password`.

### 4. Admin Authentication

- **Business Login/Register**: Working (`/admin/auth/*`).
- **SuperAdmin Login**: Working via `/superadmin/auth/login`.

### 5. Media Library

- **Uploads**: Full signed-URL flow implemented (`POST /media-lib` → S3 `PUT`).
- **Management**: Listing (`GET /media-lib`) and deleting (`DELETE /media-lib/{id}`) assets working.
- **Validation**: Client-side file type and size validation via `MediaService.validateImageFile()`.

### 6. Admin Services CRUD

- **List Services**: `GET /admin/services` — working.
- **Create/Update/Delete**: `POST /admin/services`, `PATCH /admin/services`, `DELETE /admin/services/{id}` — all correctly pathed.
- **Note**: Services & Branches dashboard pages redirect to `/settings?tab=services` and `/settings?tab=branches`.

### 7. Admin Branches CRUD

- **List Branches**: `GET /admin/branches` — working.
- **Create/Update/Delete**: All correctly pathed to `/admin/branches`.

### 8. Admin Staff CRUD

- **List Staff**: `GET /admin/staff` — working.
- **Create/Update/Delete**: All correctly pathed to `/admin/staff`.

### 9. Business Detail Page (Customer)

- **Fetches real data**: `GET /business/{id}` via `BusinessService.getBusiness()`.
- **Fallback**: Falls back to mock data if API fails (hybrid approach).

### 10. Landing Page (Customer)

- **Categories**: `ExploreSection` wired to `CategoriesService.getCategories()` with mock fallback.
- **Recommended Businesses**: `RecommendedSection` wired to `BusinessService.getApprovedBusinesses({ page: 1, pageSize: 4 })` with mock fallback.
- **Status**: Both components fetch real API data on mount and fall back to mock data on error.

### 11. Booking Modal — Availability & Creation

- **Availability Check**: `BookingModalV2Fixed` calls `BookingService.getAvailability()` with `{ serviceId, branchId, date, resourceId }`.
- **Create Booking**: `BookingModalV2Fixed` calls `BookingService.createBooking()` with `{ serviceId, branchId, resourceId, startTime, notes }`.
- **Fallback**: Falls back to mock-generated 30-minute time slots if API returns empty or errors.
- **Status**: Real API wired and functional. Guest booking flow implemented.

### 12. Customer Appointments / Bookings History

- **My Bookings**: Fetches real data via `BookingService.getUserBookings()`.
- **Cancel Booking**: Working via `BookingService.cancelBooking()`.
- **Split**: Bookings auto-split into upcoming/past based on date + status.
- **Fallback**: Loading spinner + error state with retry.
- **Favourites tab**: Still uses mock data (no API endpoint).
- **Reviews**: Customer can now leave reviews for past bookings (`POST /reviews`).

### 13. Dashboard Bookings Page (Admin)

- **Listing**: Fetches from `BookingService.getBusinessBookings()` with mock fallback.
- **Features**: Pagination, Date Range Filter, Status Filter, Staff Filter all implemented.
- **Status**: Fully Wired and functional.

### 14. Reviews Management (Admin)

- **Listing**: Fetches from `ReviewsService.getReviews()` with compact mock fallback.
- **Reply/Flag**: UI Actions (Modals) fully implemented and wired to API.
- **Stats**: Filtering by rating (positive/neutral/negative) working.
- **Status**: Wired and functional.

### 15. Staff Store — API Hydration

- **Resources**: `useStaffManagementStore.fetchResourcesFromApi()` → `AssetsService.getAssets()` — replaces mock resources.
- **Schedules**: `useStaffManagementStore.fetchSchedulesFromApi()` → `SchedulingService.getSchedules()` — replaces mock working hours.
- **Commissions**: `useStaffManagementStore.fetchCommissionsFromApi()` → `CommissionsService.getCommissions()` — replaces mock policies.
- **Status**: Hydration actions added. Store initializes with mock data; calling hydration functions replaces with API data.

---

## ⚠️ Partially Integrated (Needs Fixes)

These features are connected but require specific fixes to be 100% functional.

### 1. Business Profile Update (Admin)

- **Issue**: `BusinessService.updateBusiness()` calls `PATCH /business` → should be `PATCH /admin/business`.
- **Impact**: Profile update requests may fail or route incorrectly.

### 2. SuperAdmin Business Management

- **Issue**: All SuperAdmin `BusinessService` methods use wrong base paths.
- **Mismatched Paths:**
  | Method | Current Path | Correct Path |
  | --- | --- | --- |
  | `getPendingBusinesses()` | `GET /business/pending` | `GET /superadmin/business/pending` |
  | `getPendingChangeRequests()` | `GET /business/pending-requests` | `GET /superadmin/business/pending-requests` |
  | `approveBusiness()` | `POST /business/approve` | `POST /superadmin/business/approve` |
  | `rejectBusiness()` | `POST /business/reject` | `POST /superadmin/business/reject` |
  | `approveChangeRequest()` | `POST /business/approve-request` | `POST /superadmin/business/approve-request` |
  | `rejectChangeRequest()` | `POST /business/reject-request` | `POST /superadmin/business/reject-request` |

### 3. SuperAdmin Categories CRUD

- **Issue**: `CategoriesService` uses `/categories` for create/update/delete → should be `/superadmin/categories`.
- **Impact**: CUD operations on categories will fail.

### 4. Booking Flow — Known Gaps (See backend-gap-analysis.md for full details)

- **branchId not reliably passed**: When user books from Services tab, `selectedBranch` is null → branchId is undefined.
- **Guest booking**: Backend endpoint `POST /bookings/guest` implemented. Frontend wiring pending.
- **Staff not filtered by service/branch**: All staff shown regardless of capability. No `GET /staff?serviceId=&branchId=` endpoint.
- **Multi-service booking**: Only first service's data is sent to API. Backend has no multi-service booking concept.
- **Customer review creation**: Backend endpoint `POST /reviews` implemented. Frontend wiring pending.
- **No payment flow**: No payment endpoint integrated.
- **Reschedule**: Backend endpoint `PATCH /bookings/{id}/reschedule` implemented. Frontend wiring pending.

---

## 🔴 Not Integrated (Mock / Missing)

These features are either using mock data or are completely missing backend support.

### 1. Calendar (Admin)

- **Status:** **Mock Only**
- **Gap:** Full calendar UI exists (`CalendarShell` with FullCalendar) supporting month/week/day/multi-resource views, but all events are from mock data via `useCalendarStore`.
- **Depends on:** Admin bookings wiring (now done) + scheduling management wiring.
- **Missing for full integration:**

  - Date range query: `GET /admin/bookings` supports `fromDate`/`toDate`.
  - Reschedule endpoint: `PATCH /admin/bookings/{id}/reschedule` implemented.

  - Resource color field on staff/assets for calendar rendering

### 2. Shifts / Scheduling (Admin)

- **Status:** **Hydration action added, full UI wiring pending**
- **Gap:** `SchedulingService` exists with all methods. `fetchSchedulesFromApi()` hydration added to Zustand store. `ShiftsTab` UI still operates primarily on local state.
- **Needs:** Wire `ShiftsTab` CRUD operations to `SchedulingService`. Frontend shift model needs mapping to backend `Schedule` model (split shifts = 2 schedule records).

### 3. Assets / Resources (Admin)

- **Status:** **Hydration action added, full UI wiring pending**
- **Gap:** `AssetsService` exists with CRUD methods. `fetchResourcesFromApi()` hydration added to Zustand store. `ResourcesTab` and `RoomsTab` CUD operations still use local state.
- **Needs:** Wire CRUD operations to `AssetsService`, distinguish STAFF vs ASSET resource types.

### 4. Commission Management

- **Status:** **Hydration action added, full UI wiring pending**
- **Gap:** `CommissionsService` exists with CRUD methods. `fetchCommissionsFromApi()` hydration added to Zustand store.
- **Model mismatch:** Frontend has complex model (scope, tiers, default rates per service category). Backend is simpler: `{ serviceId, resourceId, percentage }`.
- **Needs:** Simplify frontend model to match backend, or request backend enhancements.

### 5. Notifications

- **Status:** **Service wrapper created, UI not wired**
- **Gap:** `NotificationsService` exists with getNotifications and markAsRead methods.
- **Needs:** Wire to notification center UI. No WebSocket/polling for real-time updates yet.

### 9. Settings Tabs 4-9

- **Status:** **Backend Endpoints Ready**
- **Gap:** Backend `GET/PATCH /admin/settings` implemented. Frontend needs to switch from localStorage to API.
- **Tabs affected:**
  | Tab | Purpose | Backend Status |
  | --- | --- | --- |
  | 4. Booking Policies | Advance booking, cancellation, auto-confirm | ✅ Endpoint Ready |
  | 5. Payment Settings | Required payment, deposit, methods | ✅ Endpoint Ready |
  | 6. Notifications | Email/SMS/push toggles | ✅ Endpoint Ready |
  | 7. Scheduling Settings | Default hours, buffer time, slot duration | ✅ Endpoint Ready |
  | 8. Calendar Display | Default view, first day of week, time range | ✅ Endpoint Ready |
  | 9. Customer Options | Guest booking, profile requirements | ✅ Endpoint Ready |

### 10. SuperAdmin Approvals & Change Requests UI

- **Status:** **Mock Only**
- **Gap:** The approvals and change-requests pages exist with full UI but use hardcoded mock data. The `BusinessService` methods exist but have wrong paths (see Partially Integrated section).

### 11. Deleted Proxy Routes

- **Status:** Removed
- **Previously existed:** `addons/route.ts`, `coupons/validate/route.ts`, `payments/mock/route.ts`.
- **Impact:** Features depending on add-ons, coupons, or mock payments are not available. The `NewBookingModal` references add-ons and coupons but these proxy routes are gone.

---

## Service Wrappers Status

All located in `src/lib/api/services/`.

| File                       | Class                  | Status                       | Endpoints                                                            | Notes                                      |
| -------------------------- | ---------------------- | ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `auth.service.ts`          | `AuthService`          | ✅ Working                   | `/auth/*`, `/admin/auth/*`, `/superadmin/auth/login`                 | 15 methods                                 |
| `business.service.ts`      | `BusinessService`      | ⚠️ Path fixes needed         | `/business/*` (needs `/admin/business`, `/superadmin/business/*`)    | 10 methods                                 |
| `booking.service.ts`       | `BookingService`       | ✅ Working                   | `/bookings/*` (customer) + `/admin/bookings` (admin)                 | 6 methods (4 customer + 2 admin)           |
| `services.service.ts`      | `ServicesService`      | ✅ Working                   | `/services` (public), `/admin/services` (admin)                      | 5 methods                                  |
| `branches.service.ts`      | `BranchesService`      | ✅ Working                   | `/admin/branches`                                                    | 4 methods                                  |
| `staff.service.ts`         | `StaffService`         | ✅ Working                   | `/admin/staff`                                                       | 4 methods                                  |
| `categories.service.ts`    | `CategoriesService`    | ⚠️ Path fixes needed         | `/categories` (GET ok), CUD needs `/superadmin/categories`           | 4 methods                                  |
| `media.service.ts`         | `MediaService`         | ✅ Working                   | `/media-lib`                                                         | 8 methods                                  |
| `assets.service.ts`        | `AssetsService`        | ✅ Created + Store hydration | `/admin/assets` CRUD                                                 | 5 methods, UI not wired                    |
| `scheduling.service.ts`    | `SchedulingService`    | ✅ Created + Store hydration | `/admin/scheduling/schedules`, `breaks`, `exceptions`, `assignments` | 9+ methods, UI not wired                   |
| `commissions.service.ts`   | `CommissionsService`   | ✅ Created + Store hydration | `/admin/commissions` CRUD                                            | 3 methods, UI not wired                    |
| `reviews.service.ts`       | `ReviewsService`       | ✅ Wired                     | `/admin/reviews`, reply, flag                                        | 3 methods (get, reply, flag), UI not wired |
| `notifications.service.ts` | `NotificationsService` | ✅ Created                   | `/notifications`, mark read                                          | 2 methods, UI not wired                    |

---

## Dashboard Pages — Route Reference

| Dashboard Page   | Route              | Status                   | Notes                                                                  |
| ---------------- | ------------------ | ------------------------ | ---------------------------------------------------------------------- |
| Dashboard        | `dashboard`        | Partial                  | Fetches real data + mock fallback                                      |
| Business Profile | `business-profile` | ⚠️ Wrong path            | `PATCH /business` → needs `/admin/business`                            |
| Services         | `services`         | Redirect                 | Redirects to `settings?tab=services`                                   |
| Branches         | `branches`         | Redirect                 | Redirects to `settings?tab=branches`                                   |
| Staff            | `staff`            | ✅ Working               | Tabbed: Staff / Shifts / Resources / Rooms                             |
| Staff Management | `staff-management` | ✅ Working               | Enhanced duplicate of `staff` with same tabs                           |
| Resources        | `resources`        | ⚠️ Store hydration added | `fetchResourcesFromApi()` added, CRUD ops still local                  |
| Bookings         | `bookings`         | ✅ Wired                 | Fetches from `BookingService.getBusinessBookings()` with mock fallback |
| Calendar         | `calendar`         | Mock                     | Full FullCalendar UI, mock events                                      |
| Shifts           | `shifts`           | ⚠️ Store hydration added | `fetchSchedulesFromApi()` added, full wiring pending                   |
| Commissions      | `commissions`      | ⚠️ Store hydration added | `fetchCommissionsFromApi()` added, CRUD ops still local                |
| Reviews          | `reviews`          | ✅ Wired                 | Fetches from `ReviewsService.getReviews()` with mock fallback          |
| Media            | `media`            | ✅ Working               | Full S3 upload/delete flow                                             |
| Settings         | `settings`         | ✅ Working (tabs 1-3)    | Tabs 4-9 use local state only                                          |
| Approvals        | `approvals`        | Mock                     | SuperAdmin — mock pending businesses                                   |
| Categories       | `categories`       | ✅ Read-only             | Fetches from `GET /categories`                                         |
| Businesses       | `businesses`       | ✅ Working               | SuperAdmin listing via `GET /business`                                 |
| Change Requests  | `change-requests`  | Mock                     | SuperAdmin — mock change requests                                      |
