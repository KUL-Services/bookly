# API Flow Map — Bookly / Zerv Platform

> Complete mapping of Bookly API endpoints to client codebase structure.
> **Base URL:** `http://46.101.97.43` (configurable via `BOOKLY_API_URL` env) • **Proxy:** `/api/proxy` • **Auth:** Bearer JWT

---

## Table of Contents

1. [Public Endpoints](#1-public-endpoints)
2. [Customer Auth](#2-customer-auth)
3. [Customer Features](#3-customer-features)
4. [Business Dashboard — Auth](#4-business-dashboard--auth)
5. [Business Dashboard — Core Management](#5-business-dashboard--core-management)
6. [Business Dashboard — Scheduling](#6-business-dashboard--scheduling)
7. [Business Dashboard — Bookings](#7-business-dashboard--bookings)
8. [SuperAdmin Dashboard](#8-superadmin-dashboard)
9. [Media Library](#9-media-library)
10. [Proxy Routes](#10-proxy-routes)
11. [Service Wrapper Reference](#11-service-wrapper-reference)
12. [Integration Status & Gaps](#12-integration-status--gaps)
13. [Assets (Resources)](#13-assets-resources)
14. [Commissions](#14-commissions)
15. [Reviews](#15-reviews)
16. [Notifications](#16-notifications)
17. [Asset Assignments](#17-asset-assignments)

---

## 1. Public Endpoints

No authentication required. Used by customer-facing pages.

| API Endpoint                                                        | Method | Service Wrapper                           | Page / Component                              | Route                                  | Status                   |
| ------------------------------------------------------------------- | ------ | ----------------------------------------- | --------------------------------------------- | -------------------------------------- | ------------------------ |
| `/categories`                                                       | GET    | `CategoriesService.getCategories()`       | `SearchPage` filter sidebar, `ExploreSection` | `(bookly)/search`, `(bookly)/landpage` | ✅ Working               |
| `/business?page=&pageSize=&search=&categoryId=&priceFrom=&priceTo=` | GET    | `BusinessService.getApprovedBusinesses()` | `SearchPage`, `RecommendedSection`            | `(bookly)/search`, `(bookly)/landpage` | ✅ Working               |
| `/business/{id}`                                                    | GET    | `BusinessService.getBusiness(id)`         | `BusinessDetailPage`                          | `(bookly-clean)/business/[slug]`       | ✅ Working               |
| `/services`                                                         | GET    | `ServicesService.getServices()`           | `ServiceDetailPage`                           | `(bookly)/service/[id]`                | ✅ Working               |
| `/services/{id}`                                                    | GET    | `ServicesService.getService(id)`          | `ServiceDetailPage`                           | `(bookly)/service/[id]`                | ✅ Working               |
| `/bookings/availability?serviceId=&branchId=&date=&resourceId=`     | GET    | `BookingService.getAvailability()`        | `BookingModalV2Fixed`                         | `(bookly-clean)/business/[slug]`       | ✅ Wired (mock fallback) |

> **Landing Page:** `ExploreSection` fetches categories via `CategoriesService.getCategories()` and `RecommendedSection` fetches businesses via `BusinessService.getApprovedBusinesses({ page: 1, pageSize: 4 })`. Both fall back to mock data on error.

**Availability Response Format (Verified):**

```json
[{ "startTime": "2025-06-15T09:00:00.000Z", "endTime": "2025-06-15T09:30:00.000Z", "resourceId": "uuid" }]
```

> The availability response is a **flat array** of `{ startTime, endTime, resourceId }` with ISO-8601 timestamps. It is NOT the previously documented nested format with `availableSlots`.

---

## 2. Customer Auth

Routes under `(bookly)/(auth)/customer/`.

| Page            | Route                      | API Endpoint            | Method | Service Wrapper                    | Status     |
| --------------- | -------------------------- | ----------------------- | ------ | ---------------------------------- | ---------- |
| Login           | `customer/login`           | `/auth/login`           | POST   | `AuthService.loginUser()`          | ✅ Working |
| Register        | `customer/register`        | `/auth/register`        | POST   | `AuthService.registerUser()`       | ✅ Working |
| Verify Email    | `customer/verify`          | `/auth/verify`          | POST   | `AuthService.verifyUser()`         | ✅ Working |
| Forgot Password | `customer/forgot-password` | `/auth/forget-password` | POST   | `AuthService.forgotPasswordUser()` | ✅ Working |
| Reset Password  | `customer/reset-password`  | `/auth/reset-password`  | POST   | `AuthService.resetPasswordUser()`  | ✅ Working |

**Login Request Format:** `application/x-www-form-urlencoded` (`email`, `password` as URLSearchParams)

**Login Response Shape:**

```json
{ "accessToken": "jwt...", "user": { "id", "firstName", "lastName", "email", "mobile", "profilePhoto" } }
```

**State Management:** `useAuthStore` → `booklyUser` (Zustand, persisted to `localStorage` key `bookly-auth-store`)

**Session Management:** 24-hour session expiry with auto-cleanup. Mock auth available via `NEXT_PUBLIC_USE_MOCK_AUTH=true`.

---

## 3. Customer Features

Routes under `(bookly)/` and `(bookly-clean)/`.

### Profile

| Page            | Route              | API Endpoint           | Method   | Service Wrapper                | Status     |
| --------------- | ------------------ | ---------------------- | -------- | ------------------------------ | ---------- |
| View Profile    | `profile`          | `/auth/details`        | GET 🔒   | `AuthService.getUserDetails()` | ✅ Working |
| Edit Profile    | `profile/settings` | `PATCH /auth`          | PATCH 🔒 | `AuthService.updateUser()`     | ✅ Working |
| Change Password | `profile/settings` | `PATCH /auth/password` | PATCH 🔒 | `AuthService.changePassword()` | ✅ Working |

### Booking

| Action             | API Endpoint             | Method   | Service Wrapper                       | Component             | Status                   |
| ------------------ | ------------------------ | -------- | ------------------------------------- | --------------------- | ------------------------ |
| Check Availability | `/bookings/availability` | GET      | `BookingService.getAvailability()`    | `BookingModalV2Fixed` | ✅ Wired (mock fallback) |
| Create Booking     | `/bookings`              | POST 🔒  | `BookingService.createBooking()`      | `BookingModalV2Fixed` | ✅ Wired                 |
| My Bookings        | `/bookings`              | GET 🔒   | `BookingService.getUserBookings()`    | `appointments/page`   | ✅ Wired                 |
| Cancel Booking     | `/bookings/{id}/cancel`  | PATCH 🔒 | `BookingService.cancelBooking()`      | `appointments/page`   | ✅ Wired                 |
| Guest Booking      | `/bookings/guest`        | POST     | `BookingService.createGuestBooking()` | `BookingModalV2Fixed` | ✅ Wired                 |
| Create Review      | `/reviews`               | POST 🔒  | `ReviewsService.createReview()`       | `appointments/page`   | ✅ Wired                 |

**Create Booking Request:**

```json
{ "serviceId": "uuid", "branchId": "uuid", "resourceId?": "uuid", "startTime": "ISO-8601", "notes?": "string" }
```

**Availability Response (Verified — Flat Array Format):**

```json
[{ "startTime": "2025-06-15T09:00:00.000Z", "endTime": "2025-06-15T09:30:00.000Z", "resourceId": "uuid" }]
```

> **IMPORTANT:** The verified response is a flat array of `{ startTime, endTime, resourceId }` with full ISO-8601 timestamps. This replaces the previously documented nested format with `availableSlots` and `HH:mm` times.

**Booking Flow Gaps (See backend-gap-analysis.md Section 1 for full details):**

- branchId not reliably passed when booking from Services tab
- Guest booking unsupported (POST /bookings requires auth, customer details not sent)
- Staff not filtered by service/branch
- Multi-service booking only sends first service
- No customer review creation endpoint
- No payment flow
- No reschedule endpoint

### Booking Modal Versions

| Version               | File                         | Status                 | Features                                                                                         |
| --------------------- | ---------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| `BookingModalV2Fixed` | `booking-modal-v2-fixed.tsx` | **Current/Production** | Multi-service, drag reorder, date/time, customer form. **Wired to real API** with mock fallback. |
| `NewBookingModal`     | `new-booking-modal.tsx`      | Extended               | Adds: add-ons, coupons, payment methods, ICS download. Proxy routes deleted.                     |
| `BookingModalV2`      | `booking-modal-v2.tsx`       | Legacy                 | Older version.                                                                                   |
| `BookingModal`        | `booking-modal.tsx`          | Legacy                 | Basic 3-step flow.                                                                               |

### Other Pages

| Page             | Route                              | Data Source                                                            | Status      |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------- | ----------- |
| Landing Page     | `landpage`                         | `CategoriesService` + `BusinessService` (mock fallback)                | ✅ Wired    |
| Search           | `search`                           | `BusinessService.getApprovedBusinesses()` + `CategoriesService`        | ✅ Working  |
| Category Browser | `category/[slug]`                  | Redirects to `/search?category={slug}`                                 | ✅ Redirect |
| Business Detail  | `business/[slug]` _(bookly-clean)_ | `BusinessService.getBusiness()` with mock fallback                     | ✅ Hybrid   |
| Service Detail   | `service/[id]`                     | `ServicesService.getService()`                                         | ✅ Working  |
| Appointments     | `appointments`                     | `BookingService.getUserBookings()` + `cancelBooking()` (mock fallback) | ✅ Wired    |
| Demo Booking     | `demo/booking`                     | Mock data (local JSON)                                                 | Demo only   |

---

## 4. Business Dashboard — Auth

Routes under `(blank-layout-pages)/(guest-only)/`.

| Page            | Route             | API Endpoint                  | Method | Service Wrapper                     | Status     |
| --------------- | ----------------- | ----------------------------- | ------ | ----------------------------------- | ---------- |
| Admin Login     | `login`           | `/admin/auth/login`           | POST   | `AuthService.loginAdmin()`          | ✅ Working |
| Admin Register  | `register`        | `/admin/auth/register`        | POST   | `AuthService.registerAdmin()`       | ✅ Working |
| Admin Verify    | `verify`          | `/admin/auth/verify`          | POST   | `AuthService.verifyAdmin()`         | ✅ Working |
| Forgot Password | `forgot-password` | `/admin/auth/forget-password` | POST   | `AuthService.forgotPasswordAdmin()` | ✅ Working |
| Reset Password  | `reset-password`  | `/admin/auth/reset-password`  | POST   | `AuthService.resetPasswordAdmin()`  | ✅ Working |
| Admin Details   | —                 | `/admin/auth/details`         | GET 🔒 | `AuthService.getAdminDetails()`     | ✅ Working |

**Login Response Shape:**

```json
{ "accessToken": "jwt...", "admin": { "id", "name", "email", "businessId" } }
```

**State Management:** `useAuthStore` → `materializeUser` (Zustand, persisted to `localStorage`)

---

## 5. Business Dashboard — Core Management

Routes under `(dashboard)/(private)/apps/bookly/`. All require admin auth 🔒.

### Dashboard

| Route       | View Component    | Service Wrappers                                                        | API Endpoints                                                                          | Status  |
| ----------- | ----------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------- |
| `dashboard` | `DashboardBookly` | `BusinessService`, `ServicesService`, `BranchesService`, `StaffService` | `GET /business/{id}`, `GET /admin/services`, `GET /admin/branches`, `GET /admin/staff` | Partial |

> Dashboard fetches real data from these services but uses mock fallback for stats, bookings, and reviews displays. **Note:** businessId is hardcoded to `'1'` — should use `materializeUser.businessId` from auth store.

---

### Business Profile

| Route              | View Component     | API Endpoint | Method   | Service Wrapper                    | Status        |
| ------------------ | ------------------ | ------------ | -------- | ---------------------------------- | ------------- |
| `business-profile` | `BusinessProfile`  | `/business`  | PATCH 🔒 | `BusinessService.updateBusiness()` | ⚠️ Wrong path |
| `settings`         | `BusinessSettings` | `/business`  | PATCH 🔒 | `BusinessService.updateBusiness()` | ⚠️ Wrong path |

> **Path mismatch**: `BusinessService.updateBusiness()` calls `PATCH /business`. The API expects `PATCH /admin/business`.

---

### Services

| Route      | View Component        | API Endpoint           | Method    | Service Wrapper                   | Status     |
| ---------- | --------------------- | ---------------------- | --------- | --------------------------------- | ---------- |
| `services` | **Redirect**          | —                      | —         | —                                 | Redirect   |
| —          | Via `settings` page   | `/admin/services`      | GET 🔒    | `ServicesService.getServices()`   | ✅ Working |
| —          | `CreateServiceDialog` | `/admin/services`      | POST 🔒   | `ServicesService.createService()` | ✅ Working |
| —          | `EditServiceDialog`   | `/admin/services`      | PATCH 🔒  | `ServicesService.updateService()` | ✅ Working |
| —          | —                     | `/admin/services/{id}` | DELETE 🔒 | `ServicesService.deleteService()` | ✅ Working |

> The `/services` route **redirects** to `/settings?tab=services`. All CRUD happens within the Settings page.

**Request body:** `{ name, description, location, price, duration, categoryIds[], branchIds[], gallery[] }`

---

### Branches

| Route      | View Component       | API Endpoint           | Method    | Service Wrapper                  | Status     |
| ---------- | -------------------- | ---------------------- | --------- | -------------------------------- | ---------- |
| `branches` | **Redirect**         | —                      | —         | —                                | Redirect   |
| —          | Via `settings` page  | `/admin/branches`      | GET 🔒    | `BranchesService.getBranches()`  | ✅ Working |
| —          | `CreateBranchDialog` | `/admin/branches`      | POST 🔒   | `BranchesService.createBranch()` | ✅ Working |
| —          | `EditBranchDialog`   | `/admin/branches`      | PATCH 🔒  | `BranchesService.updateBranch()` | ✅ Working |
| —          | —                    | `/admin/branches/{id}` | DELETE 🔒 | `BranchesService.deleteBranch()` | ✅ Working |

> The `/branches` route **redirects** to `/settings?tab=branches`. All CRUD happens within the Settings page.

**Request body:** `{ name, address, mobile, serviceIds[], gallery[] }`

> Note: `BranchesService` strips unsupported `staff` field from requests before sending.

---

### Staff

| Route   | View Component      | API Endpoint        | Method    | Service Wrapper              | Status     |
| ------- | ------------------- | ------------------- | --------- | ---------------------------- | ---------- |
| `staff` | `StaffManagement`   | `/admin/staff`      | GET 🔒    | `StaffService.getStaff()`    | ✅ Working |
| —       | `CreateStaffDialog` | `/admin/staff`      | POST 🔒   | `StaffService.createStaff()` | ✅ Working |
| —       | `EditStaffDialog`   | `/admin/staff`      | PATCH 🔒  | `StaffService.updateStaff()` | ✅ Working |
| —       | —                   | `/admin/staff/{id}` | DELETE 🔒 | `StaffService.deleteStaff()` | ✅ Working |

**Request body:** `{ name, email, mobile, branchId, serviceIds[], profilePhoto, slotInterval, slotDuration }`

> **Staff API Update:** The staff endpoint now also accepts `email`, `slotInterval`, and `slotDuration` fields in addition to the previously documented fields.

> **Staff Page Layout:** Tabbed interface with 4 tabs:
>
> 1. **Staff Members** — CRUD via `StaffService` (real API)
> 2. **Shifts** — Shift scheduling (`SchedulingService` created, UI not wired)
> 3. **Resources** — Equipment/room management (`AssetsService` created, UI not wired)
> 4. **Rooms** — Physical space management (`AssetsService` created, UI not wired)

---

### Staff Management (Enhanced)

| Route              | View Component         | Status     |
| ------------------ | ---------------------- | ---------- |
| `staff-management` | `StaffManagement` (v2) | ✅ Working |

> Same tabbed interface as `/staff` with enhanced UI. Staff Members tab uses real API; Shifts, Resources, and Rooms tabs use local Zustand store state.

---

### Resources (Standalone Page)

| Route       | View Component | API Endpoint    | Status                           |
| ----------- | -------------- | --------------- | -------------------------------- |
| `resources` | `ResourcesTab` | `/admin/assets` | ⚠️ Service created, UI not wired |

> `AssetsService` wrapper created with full CRUD methods. See [Section 13](#13-assets-resources).

---

### Settings (Central Hub)

| Route      | View Component     | Status                |
| ---------- | ------------------ | --------------------- |
| `settings` | `BusinessSettings` | ✅ Working (tabs 1-3) |

**9 Configuration Tabs:**

1. Business Profile — `BusinessService.updateBusiness()` (⚠️ wrong path)
2. Services — `ServicesService` CRUD (✅ working)
3. Branches — `BranchesService` CRUD (✅ working)
4. Booking Policies — Local state (`useBusinessSettingsStore`)
5. Payment Settings — Local state
6. Notifications — Local state
7. Scheduling Settings — Local state
8. Calendar Display — Local state
9. Customer Options — Local state

> Settings tabs 4-9 use `useBusinessSettingsStore` (Zustand with persistence) — no backend endpoints exist for these configurations.

---

### Reviews

| Route     | View Component      | API Endpoint     | Status                        |
| --------- | ------------------- | ---------------- | ----------------------------- |
| `reviews` | `ReviewsManagement` | `/admin/reviews` | ✅ Wired (with Reply/Flag UI) |

> `ReviewsService` wired to `ReviewsManagement` component. Fetches from `getReviews()` on mount with mock fallback. Reply and flag actions connected to `replyToReview()` and `flagReview()`. See [Section 15](#15-reviews).

---

### Media Library

| Route   | View Component    | API Endpoint      | Method    | Service Wrapper                | Status     |
| ------- | ----------------- | ----------------- | --------- | ------------------------------ | ---------- |
| `media` | `MediaManagement` | `/media-lib`      | GET 🔒    | `MediaService.getMediaFiles()` | ✅ Working |
| —       | —                 | `/media-lib`      | POST 🔒   | `MediaService.createAsset()`   | ✅ Working |
| —       | —                 | `/media-lib/{id}` | PATCH 🔒  | `MediaService.updateAsset()`   | ✅ Working |
| —       | —                 | `/media-lib/{id}` | DELETE 🔒 | `MediaService.deleteAsset()`   | ✅ Working |

**Upload flow:** `createAsset()` → get `{ assetFileId, uploadUrl }` → PUT file to S3 → use `assetFileId` in other records

---

## 6. Business Dashboard — Scheduling

Backend endpoints confirmed available. `SchedulingService` wrapper created.

### Endpoints

| API Endpoint                                         | Method    | Service Wrapper                       | Purpose                                   | Frontend Component | Status                           |
| ---------------------------------------------------- | --------- | ------------------------------------- | ----------------------------------------- | ------------------ | -------------------------------- |
| `/admin/scheduling/schedules`                        | POST 🔒   | `SchedulingService.createSchedule()`  | Create weekly schedule                    | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/schedules?resourceId=&branchId=`  | GET 🔒    | `SchedulingService.getSchedules()`    | List schedules                            | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/schedules/{id}`                   | DELETE 🔒 | `SchedulingService.deleteSchedule()`  | Delete schedule                           | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/breaks`                           | POST 🔒   | `SchedulingService.createBreak()`     | Create recurring break                    | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/breaks?resourceId=&branchId=`     | GET 🔒    | `SchedulingService.getBreaks()`       | List breaks                               | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/breaks/{id}`                      | DELETE 🔒 | `SchedulingService.deleteBreak()`     | Delete break                              | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/exceptions`                       | POST 🔒   | `SchedulingService.createException()` | Create exception (holiday, special hours) | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/exceptions?resourceId=&branchId=` | GET 🔒    | `SchedulingService.getExceptions()`   | List exceptions                           | `ShiftsTab`        | ✅ Service created, UI not wired |
| `/admin/scheduling/exceptions/{id}`                  | DELETE 🔒 | `SchedulingService.deleteException()` | Delete exception                          | `ShiftsTab`        | ✅ Service created, UI not wired |

> `SchedulingService` wrapper created with methods for schedules, breaks, and exceptions. The `ShiftsTab` (accessible from `staff`, `staff-management`, and `shifts` pages) and `CalendarShell` will consume this service once wired.

**Schedule:** `{ dayOfWeek (0-6), startTime (HH:mm), endTime (HH:mm), resourceId, branchId }`
**Break:** `{ name, dayOfWeek, startTime, endTime, resourceId, branchId }`
**Exception:** `{ date (YYYY-MM-DD), startTime?, endTime?, reason, isAvailable, resourceId, branchId }`

### Dashboard Pages Using Scheduling

| Route      | View Component  | Status                                      | Notes                                                                                     |
| ---------- | --------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `shifts`   | `ShiftsTab`     | ⚠️ Store hydration added, UI wiring pending | Full shift editor UI, `fetchSchedulesFromApi()` hydration added to store                  |
| `calendar` | `CalendarShell` | ⚠️ Service created, UI not wired            | FullCalendar with month/week/day/multi-resource views, mock events via `useCalendarStore` |

---

## 7. Business Dashboard — Bookings

Backend endpoints confirmed available. Admin booking methods added to `BookingService`.

| Route      | View Component | API Endpoint                             | Method   | Service Wrapper                        | Status                           |
| ---------- | -------------- | ---------------------------------------- | -------- | -------------------------------------- | -------------------------------- |
| `bookings` | `BookingsPage` | `/admin/bookings?date=&staffId=&status=` | GET 🔒   | `BookingService.getBusinessBookings()` | ✅ Wired (with filters)          |
| —          | —              | `/admin/bookings/{id}/status`            | PATCH 🔒 | `BookingService.updateBookingStatus()` | ✅ Service created, UI not wired |

> `BookingService` now includes both customer-side methods (`createBooking`, `getUserBookings`, `cancelBooking`, `getAvailability`) AND admin methods (`getBusinessBookings(params?)`, `updateBookingStatus(bookingId, status)`). The admin bookings page has been wired to `getBusinessBookings()` with mock fallback.

**Enhanced Query Parameters:**

- `date` — Filter by date (YYYY-MM-DD)
- `staffId` — Filter by specific staff member
- `status` — Filter by status (PENDING, CONFIRMED, CANCELLED)

**Status values:** `PENDING` | `CONFIRMED` | `CANCELLED` | `COMPLETED` | `NO_SHOW`

**Frontend UI Status:** Read-only table showing: Business, Service, Staff, Date, Time, Price, Status. Currently uses hardcoded mock data — needs wiring to real endpoints.

---

## 8. SuperAdmin Dashboard

### Auth

| Route               | API Endpoint             | Method | Service Wrapper                 | Status             |
| ------------------- | ------------------------ | ------ | ------------------------------- | ------------------ |
| `super-admin/login` | `/superadmin/auth/login` | POST   | `AuthService.loginSuperAdmin()` | ⚠️ Path fix needed |

> **Confirmed API Path:** The backend uses `/superadmin/auth/login` (confirmed by API docs). The code currently uses `/auth/super-admin/login` — this needs to be updated to match.

### Business Approvals

| Route             | View Component       | API Endpoint                            | Method  | Service Wrapper                              | Current Path (Code)              | Status        |
| ----------------- | -------------------- | --------------------------------------- | ------- | -------------------------------------------- | -------------------------------- | ------------- |
| `approvals`       | `BusinessApprovals`  | `/superadmin/business/pending`          | GET 🔒  | `BusinessService.getPendingBusinesses()`     | `GET /business/pending`          | ⚠️ Wrong path |
| —                 | —                    | `/superadmin/business/approve`          | POST 🔒 | `BusinessService.approveBusiness()`          | `POST /business/approve`         | ⚠️ Wrong path |
| —                 | —                    | `/superadmin/business/reject`           | POST 🔒 | `BusinessService.rejectBusiness()`           | `POST /business/reject`          | ⚠️ Wrong path |
| `change-requests` | `ChangeRequests`     | `/superadmin/business/pending-requests` | GET 🔒  | `BusinessService.getPendingChangeRequests()` | `GET /business/pending-requests` | ⚠️ Wrong path |
| —                 | —                    | `/superadmin/business/approve-request`  | POST 🔒 | `BusinessService.approveChangeRequest()`     | `POST /business/approve-request` | ⚠️ Wrong path |
| —                 | —                    | `/superadmin/business/reject-request`   | POST 🔒 | `BusinessService.rejectChangeRequest()`      | `POST /business/reject-request`  | ⚠️ Wrong path |
| `businesses`      | `BusinessManagement` | `/business?page=&pageSize=`             | GET     | `BusinessService.getApprovedBusinesses()`    | `GET /business`                  | ✅ Working    |

> **Path mismatch**: All SuperAdmin `BusinessService` methods use `/business/*` prefix. The actual API expects `/superadmin/business/*` prefix. Additionally, the Approvals and Change Requests pages use **mock data** in their UI despite having service methods defined.

### Categories Management

| Route        | View Component         | API Endpoint                  | Method    | Service Wrapper                      | Current Path (Code)       | Status        |
| ------------ | ---------------------- | ----------------------------- | --------- | ------------------------------------ | ------------------------- | ------------- |
| `categories` | `CategoriesManagement` | `/categories`                 | GET       | `CategoriesService.getCategories()`  | `GET /categories`         | ✅ Working    |
| —            | —                      | `/superadmin/categories`      | POST 🔒   | `CategoriesService.createCategory()` | `POST /categories`        | ⚠️ Wrong path |
| —            | —                      | `/superadmin/categories/{id}` | PATCH 🔒  | `CategoriesService.updateCategory()` | `PATCH /categories/{id}`  | ⚠️ Wrong path |
| —            | —                      | `/superadmin/categories/{id}` | DELETE 🔒 | `CategoriesService.deleteCategory()` | `DELETE /categories/{id}` | ⚠️ Wrong path |

> **Path mismatch**: `CategoriesService` CUD methods use `/categories` for create/update/delete. The actual API expects `/superadmin/categories`. GET (read) correctly uses public `/categories`.

---

## 9. Media Library

Shared across all authenticated users.

| API Endpoint      | Method    | Service Wrapper                | Notes                                |
| ----------------- | --------- | ------------------------------ | ------------------------------------ |
| `/media-lib`      | POST 🔒   | `MediaService.createAsset()`   | Returns `{ assetFileId, uploadUrl }` |
| `/media-lib/{id}` | PATCH 🔒  | `MediaService.updateAsset()`   | Update metadata                      |
| `/media-lib/{id}` | DELETE 🔒 | `MediaService.deleteAsset()`   | Delete asset                         |
| `/media-lib`      | GET 🔒    | `MediaService.getMediaFiles()` | List all assets                      |

**Additional MediaService methods:**

- `uploadFile(file)` — 2-step: `createAsset()` → PUT to S3 `uploadUrl`
- `uploadMultipleFiles(files)` — Parallel upload of multiple files
- `validateImageFile(file, maxSizeMB?)` — Client-side type/size validation
- `getAssetUrl(assetId)` — Returns `/api/assets/{assetId}`

---

## 10. Proxy Routes

Next.js API routes that proxy requests to the backend. Located in `src/app/api/proxy/`.

| Proxy Route               | Method   | Proxies To                               | Status     |
| ------------------------- | -------- | ---------------------------------------- | ---------- |
| `/api/proxy/availability` | GET      | `{BOOKLY_API_URL}/bookings/availability` | ✅ Working |
| `/api/proxy/bookings`     | GET/POST | `{BOOKLY_API_URL}/bookings`              | ✅ Working |

**Deleted Proxy Routes** (previously existed, now removed):

- `/api/proxy/addons/route.ts` — Add-on services
- `/api/proxy/coupons/validate/route.ts` — Coupon validation
- `/api/proxy/payments/mock/route.ts` — Mock payment processing

> All other API calls go through the generic `apiClient` which uses `/api/proxy` as base URL. The proxy routes above are special cases for specific booking operations.

---

## 11. Service Wrapper Reference

All located in `src/lib/api/services/`.

| File                       | Class                  | Status                       | Endpoints                                                            | Methods |
| -------------------------- | ---------------------- | ---------------------------- | -------------------------------------------------------------------- | ------- |
| `auth.service.ts`          | `AuthService`          | ✅ Working                   | `/auth/*`, `/admin/auth/*`, `/superadmin/auth/login`                 | 15      |
| `business.service.ts`      | `BusinessService`      | ⚠️ Path fixes                | `/business/*` (needs `/admin/business`, `/superadmin/business/*`)    | 10      |
| `booking.service.ts`       | `BookingService`       | ✅ Working                   | `/bookings/*` (customer) + `/admin/bookings` (admin)                 | 6       |
| `services.service.ts`      | `ServicesService`      | ✅ Working                   | `/services` (public), `/admin/services` (admin)                      | 5       |
| `branches.service.ts`      | `BranchesService`      | ✅ Working                   | `/admin/branches`                                                    | 4       |
| `staff.service.ts`         | `StaffService`         | ✅ Working                   | `/admin/staff`                                                       | 4       |
| `categories.service.ts`    | `CategoriesService`    | ⚠️ Path fixes                | `/categories` (GET ok), CUD needs `/superadmin/categories`           | 4       |
| `media.service.ts`         | `MediaService`         | ✅ Working                   | `/media-lib`                                                         | 8       |
| `assets.service.ts`        | `AssetsService`        | ✅ Created + Store hydration | `/admin/assets` CRUD                                                 | 5       |
| `scheduling.service.ts`    | `SchedulingService`    | ✅ Created + Store hydration | `/admin/scheduling/schedules`, `breaks`, `exceptions`, `assignments` | 9+      |
| `commissions.service.ts`   | `CommissionsService`   | ✅ Created + Store hydration | `/admin/commissions` CRUD                                            | 3       |
| `reviews.service.ts`       | `ReviewsService`       | ✅ Wired                     | `/admin/reviews`, reply, flag                                        | 3       |
| `notifications.service.ts` | `NotificationsService` | ✅ Created                   | `/notifications`, mark read                                          | 2       |

---

## 12. Integration Status & Gaps

### ✅ Fully Integrated (client → real API)

- Customer auth (login, register, verify, forgot/reset password)
- Search page → `BusinessService.getApprovedBusinesses()` with filters
- Profile page → `AuthService.getUserDetails()`, `updateUser()`, `changePassword()`
- Business detail page → `BusinessService.getBusiness()` (with mock fallback)
- Service detail page → `ServicesService.getService()`
- **Landing page** → `CategoriesService.getCategories()` + `BusinessService.getApprovedBusinesses()` (with mock fallback)
- **Booking modal** → `BookingService.getAvailability()` + `BookingService.createBooking()` (with mock fallback)
- Admin auth (login, register, verify, forgot/reset password)
- Admin services CRUD → `ServicesService` (via Settings page)
- Admin branches CRUD → `BranchesService` (via Settings page)
- Admin staff CRUD → `StaffService`
- Media library → `MediaService` full flow
- Categories listing → `CategoriesService.getCategories()` (read only)
- SuperAdmin business listing → `BusinessService.getApprovedBusinesses()`

### ⚠️ Service Wrappers Created, UI Wiring Needed

| Feature                                  | Service Wrapper        | Dashboard Page(s)                           | Frontend UI Ready        |
| ---------------------------------------- | ---------------------- | ------------------------------------------- | ------------------------ |
| Assets/Resources CRUD                    | `AssetsService`        | `resources`, `staff` (Resources/Rooms tabs) | ✅ Yes                   |
| Scheduling (schedules/breaks/exceptions) | `SchedulingService`    | `shifts`, `calendar`, `staff` (Shifts tab)  | ✅ Yes                   |
| Admin bookings management                | `BookingService`       | `bookings`                                  | ✅ Wired                 |
| Commissions                              | `CommissionsService`   | `commissions`, `staff` (Commissions tab)    | ⚠️ Store hydration added |
| Reviews management                       | `ReviewsService`       | `reviews`                                   | ✅ Wired                 |
| Notifications                            | `NotificationsService` | Calendar notifications                      | Partial                  |
| Asset Assignments                        | `SchedulingService`    | `shifts`, `calendar`                        | Partial                  |

### ⚠️ Path Mismatches (needs fixing in code)

| Service                                      | Current Path (in code)           | Correct Path (backend expects)              |
| -------------------------------------------- | -------------------------------- | ------------------------------------------- |
| `BusinessService.updateBusiness()`           | `PATCH /business`                | `PATCH /admin/business`                     |
| `BusinessService.getPendingBusinesses()`     | `GET /business/pending`          | `GET /superadmin/business/pending`          |
| `BusinessService.getPendingChangeRequests()` | `GET /business/pending-requests` | `GET /superadmin/business/pending-requests` |
| `BusinessService.approveBusiness()`          | `POST /business/approve`         | `POST /superadmin/business/approve`         |
| `BusinessService.rejectBusiness()`           | `POST /business/reject`          | `POST /superadmin/business/reject`          |
| `BusinessService.approveChangeRequest()`     | `POST /business/approve-request` | `POST /superadmin/business/approve-request` |
| `BusinessService.rejectChangeRequest()`      | `POST /business/reject-request`  | `POST /superadmin/business/reject-request`  |
| `CategoriesService.createCategory()`         | `POST /categories`               | `POST /superadmin/categories`               |
| `CategoriesService.updateCategory()`         | `PATCH /categories/{id}`         | `PATCH /superadmin/categories/{id}`         |
| `CategoriesService.deleteCategory()`         | `DELETE /categories/{id}`        | `DELETE /superadmin/categories/{id}`        |
| `AuthService.loginSuperAdmin()`              | `POST /auth/super-admin/login`   | `POST /superadmin/auth/login`               |

### ⚠️ Booking Flow Gaps (see backend-gap-analysis.md for full details)

| Gap                 | Description                                                 | Impact                        | Fix Location                             |
| ------------------- | ----------------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| branchId not passed | `selectedBranch?.id` is null when booking from Services tab | Booking creation may fail     | Frontend (business detail page)          |
| Guest booking       | `POST /bookings` requires auth; customer details not sent   | Guests cannot book            | Backend (new endpoint or auth change)    |
| Staff filtering     | All staff shown, not filtered by service/branch             | Wrong staff shown in picker   | Backend (new query params on GET /staff) |
| Multi-service       | Only first service data sent to backend                     | Only 1 of N services booked   | Backend (batch booking endpoint)         |
| Customer reviews    | No `POST /reviews` or `POST /bookings/{id}/review`          | Customers can't leave reviews | Backend (new endpoint)                   |
| Payment             | No payment endpoint                                         | No payment collection         | Backend (new endpoint)                   |
| Reschedule          | No `PATCH /bookings/{id}/reschedule`                        | Can't change booking time     | Backend (new endpoint)                   |

### 🔴 Not Yet Implemented (no backend endpoints)

| Feature                       | Dashboard Page(s)     | Missing                                                          | Frontend UI Ready |
| ----------------------------- | --------------------- | ---------------------------------------------------------------- | ----------------- |
| Business settings persistence | `settings` (tabs 4-9) | No API for booking policies, payments, scheduling settings, etc. | ✅ Yes            |

---

## 13. Assets (Resources)

Backend CRUD endpoints confirmed available. `AssetsService` wrapper created.

| API Endpoint         | Method    | Service Wrapper               | Purpose          | Status                           |
| -------------------- | --------- | ----------------------------- | ---------------- | -------------------------------- |
| `/admin/assets`      | POST 🔒   | `AssetsService.createAsset()` | Create asset     | ✅ Service created, UI not wired |
| `/admin/assets`      | GET 🔒    | `AssetsService.getAssets()`   | List all assets  | ✅ Service created, UI not wired |
| `/admin/assets/{id}` | GET 🔒    | `AssetsService.getAsset()`    | Get single asset | ✅ Service created, UI not wired |
| `/admin/assets/{id}` | PATCH 🔒  | `AssetsService.updateAsset()` | Update asset     | ✅ Service created, UI not wired |
| `/admin/assets/{id}` | DELETE 🔒 | `AssetsService.deleteAsset()` | Delete asset     | ✅ Service created, UI not wired |

**Request body:**

```json
{
  "name": "string",
  "description": "string",
  "branchId": "uuid",
  "maxConcurrent": 1,
  "serviceIds": ["uuid"],
  "image": "string",
  "slotInterval": 30,
  "slotDuration": 60
}
```

> Used by `resources` page, `ResourcesTab`, and `RoomsTab`. Frontend UI is complete with grid/list view, service assignment, and resource editor drawer — all currently using local Zustand store state.

---

## 14. Commissions

Backend CRUD endpoints confirmed available. `CommissionsService` wrapper created.

| API Endpoint              | Method    | Service Wrapper                         | Purpose           | Status                           |
| ------------------------- | --------- | --------------------------------------- | ----------------- | -------------------------------- |
| `/admin/commissions`      | GET 🔒    | `CommissionsService.getCommissions()`   | List commissions  | ✅ Service created, UI not wired |
| `/admin/commissions`      | POST 🔒   | `CommissionsService.createCommission()` | Create commission | ✅ Service created, UI not wired |
| `/admin/commissions/{id}` | DELETE 🔒 | `CommissionsService.deleteCommission()` | Delete commission | ✅ Service created, UI not wired |

**Request body (POST):**

```json
{
  "serviceId": "uuid",
  "resourceId": "uuid",
  "percentage": 10
}
```

> Used by `commissions` page and `staff` Commissions tab. Frontend UI is complete — currently using mock data.

> **Model mismatch note:** Frontend commission UI supports scope (global/service/staff), tiers, default rates per service category. Backend model is simpler: `{ serviceId, resourceId, percentage }`. Frontend may need simplification or backend may need enhancement.

---

## 15. Reviews

Backend endpoints confirmed available. `ReviewsService` wrapper created.

| API Endpoint                | Method  | Service Wrapper                  | Purpose           | Status                           |
| --------------------------- | ------- | -------------------------------- | ----------------- | -------------------------------- |
| `/admin/reviews`            | GET 🔒  | `ReviewsService.getReviews()`    | List all reviews  | ✅ Service created, UI not wired |
| `/admin/reviews/{id}/reply` | POST 🔒 | `ReviewsService.replyToReview()` | Reply to a review | ✅ Service created, UI not wired |
| `/admin/reviews/{id}/flag`  | POST 🔒 | `ReviewsService.flagReview()`    | Flag a review     | ✅ Service created, UI not wired |

**Reply request body:**

```json
{ "reply": "Thank you for your feedback!" }
```

**Flag request body:**

```json
{ "reason": "Inappropriate content" }
```

> `ReviewsManagement` component now wired to `ReviewsService.getReviews()`. Fetches real data on mount with compact mock fallback. Reply and flag actions use `replyToReview()` and `flagReview()`.

> **Missing:** No customer-side `POST /reviews` or `POST /bookings/{id}/review` endpoint for customers to create reviews. This is needed for the review flow on the business detail page.

---

## 16. Notifications

Backend endpoints confirmed available. `NotificationsService` wrapper created.

| API Endpoint               | Method   | Service Wrapper                           | Purpose            | Status                           |
| -------------------------- | -------- | ----------------------------------------- | ------------------ | -------------------------------- |
| `/notifications`           | GET 🔒   | `NotificationsService.getNotifications()` | List notifications | ✅ Service created, UI not wired |
| `/notifications/{id}/read` | PATCH 🔒 | `NotificationsService.markAsRead()`       | Mark as read       | ✅ Service created, UI not wired |

> Returns notifications for authenticated user (customer) or business (admin). Used by calendar notifications and potential notification center UI.

---

## 17. Asset Assignments

Backend endpoints confirmed available. Part of `SchedulingService`.

| API Endpoint                          | Method    | Service Wrapper                        | Purpose                   | Status                           |
| ------------------------------------- | --------- | -------------------------------------- | ------------------------- | -------------------------------- |
| `/admin/scheduling/assignments?date=` | GET 🔒    | `SchedulingService.getAssignments()`   | List resource assignments | ✅ Service created, UI not wired |
| `/admin/scheduling/assignments`       | POST 🔒   | `SchedulingService.createAssignment()` | Create assignment         | ✅ Service created, UI not wired |
| `/admin/scheduling/assignments/{id}`  | DELETE 🔒 | `SchedulingService.deleteAssignment()` | Remove assignment         | ✅ Service created, UI not wired |

**Request body (POST):**

```json
{
  "staffId": "uuid",
  "assetId": "uuid",
  "startTime": "09:00",
  "endTime": "17:00",
  "dayOfWeek": 1
}
```

**Query parameters (GET):**

- `date` — Filter by date (YYYY-MM-DD)

> Assigns staff members to rooms/assets. Part of `SchedulingService`. Used by shifts and calendar pages for room allocation management.
