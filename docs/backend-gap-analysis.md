# Backend–Frontend Contract & Gap Analysis

> **Purpose:** Single source of truth for every API endpoint the frontend uses — with exact request/response field shapes, frontend type mappings, and known gaps.
>
> **Last Updated:** 2026-02-19

---

## How to Read This Document

- **`ApiResponse<T>`** — Every service wrapper returns `{ data?: T, error?: string }` (see `src/lib/api/api-client.ts`)
- **Frontend Type** = TypeScript interface in `src/lib/api/types.ts` (API types) or `src/bookly/data/types.ts` (UI types)
- **Backend Response** = Verified JSON from the actual API (tested via curl/Postman)
- **Status icons:** ✅ Aligned | ⚠️ Partial mismatch | ❌ Missing/Broken | 🔲 Not yet tested

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Business (Public)](#2-business-public)
3. [Categories (Public)](#3-categories-public)
4. [Services (Public)](#4-services-public)
5. [Bookings (Customer)](#5-bookings-customer)
6. [Reviews (Customer)](#6-reviews-customer)
7. [Admin — Business](#7-admin--business)
8. [Admin — Branches](#8-admin--branches)
9. [Admin — Services](#9-admin--services)
10. [Admin — Staff](#10-admin--staff)
11. [Admin — Assets (Rooms/Equipment)](#11-admin--assets-roomsequipment)
12. [Admin — Scheduling](#12-admin--scheduling)
13. [Admin — Bookings](#13-admin--bookings)
14. [Admin — Reviews](#14-admin--reviews)
15. [Admin — Commissions](#15-admin--commissions)
16. [Admin — Settings](#16-admin--settings)
17. [Admin — Notifications](#17-admin--notifications)
18. [Media Library](#18-media-library)
19. [SuperAdmin](#19-superadmin)
20. [Frontend Type Mismatches (API vs UI)](#20-frontend-type-mismatches-api-vs-ui)
21. [Missing Endpoints Summary](#21-missing-endpoints-summary)
22. [Missing Fields Summary](#22-missing-fields-summary)
23. [Integration Status per Page](#23-integration-status-per-page)

---

## 1. Authentication

### Customer Auth

| Endpoint                | Method | Service Wrapper                    | Auth | Status |
| ----------------------- | ------ | ---------------------------------- | ---- | ------ |
| `/auth/register`        | POST   | `AuthService.registerUser()`       | No   | ✅     |
| `/auth/verify`          | POST   | `AuthService.verifyUser()`         | No   | ✅     |
| `/auth/login`           | POST   | `AuthService.loginUser()`          | No   | ✅     |
| `/auth/forget-password` | POST   | `AuthService.forgotPasswordUser()` | No   | ✅     |
| `/auth/reset-password`  | POST   | `AuthService.resetPasswordUser()`  | No   | ✅     |
| `/auth`                 | PATCH  | `AuthService.updateUser()`         | 🔒   | ✅     |
| `/auth/password`        | PATCH  | `AuthService.changePassword()`     | 🔒   | ✅     |
| `/auth/details`         | GET    | `AuthService.getUserDetails()`     | 🔒   | ✅     |

#### `POST /auth/register`

**Request:**

```typescript
// Frontend Type: RegisterUserRequest
{
  firstName: string    // required
  lastName: string     // required
  email: string        // required
  password: string     // required, min 8 chars
  mobile?: string      // optional
}
```

**Response (201):**

```json
{ "verificationToken": "806043" }
```

#### `POST /auth/login`

**Request:** `application/x-www-form-urlencoded`

```
email=john@example.com&password=strongPass123
```

**Response (201):**

```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "cuid-string",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+201220293563",
    "profilePhoto": null,
    "createdAt": "2026-02-12T05:47:42.678Z"
  }
}
```

**Frontend Type: `LoginResponse`**

```typescript
interface LoginResponse {
  accessToken?: string; // ✅ Matches
  access_token?: string; // ⚠️ Some responses use snake_case — frontend handles both
  user?: any; // ✅ Matches
  admin?: any; // Only present on admin login
}
```

> **Known Issue (RESOLVED):** API sometimes returns `access_token` (snake_case) instead of `accessToken`. The auth store now checks both.

#### `PATCH /auth` (Update Profile)

**Request:**

```typescript
// Frontend Type: UpdateUserRequest
{
  firstName: string          // required
  lastName: string           // required
  mobile: string             // required
  profilePhoto?: string | null  // asset file ID (not URL)
}
```

**Response (200):** Full `User` object with updated fields.

#### `GET /auth/details`

**Response (200):**

```typescript
// Frontend Type: User
{
  id: string
  firstName: string
  lastName: string
  email: string
  mobile?: string
  verified?: boolean
  profilePhoto?: string | null      // asset file ID
  profilePhotoUrl?: string | null   // resolved URL
  profileComplete?: boolean
  createdAt: string
  updatedAt?: string
}
```

> **Note:** Backend returns `profilePhoto` as asset ID. `profilePhotoUrl` is the resolved S3 URL. Frontend `User` type has both fields.

---

### Admin Auth

| Endpoint                      | Method | Service Wrapper                     | Auth | Status |
| ----------------------------- | ------ | ----------------------------------- | ---- | ------ |
| `/admin/auth/register`        | POST   | `AuthService.registerAdmin()`       | No   | ✅     |
| `/admin/auth/verify`          | POST   | `AuthService.verifyAdmin()`         | No   | ✅     |
| `/admin/auth/login`           | POST   | `AuthService.loginAdmin()`          | No   | ✅     |
| `/admin/auth/forget-password` | POST   | `AuthService.forgotPasswordAdmin()` | No   | ✅     |
| `/admin/auth/reset-password`  | POST   | `AuthService.resetPasswordAdmin()`  | No   | ✅     |
| `/admin/auth/details`         | GET    | `AuthService.getAdminDetails()`     | 🔒   | ✅     |

#### `POST /admin/auth/login`

**Request:** `application/x-www-form-urlencoded`

```
email=spa-admin@bookly.com&password=password123
```

**Response (201):**

```json
{
  "accessToken": "eyJhbG...",
  "admin": {
    "id": "admin-uuid",
    "name": "Owner Name",
    "email": "spa-admin@bookly.com",
    "businessId": "business-uuid",
    "isVerified": true,
    "isOwner": true,
    "createdAt": "2026-01-13T01:47:17.368Z",
    "updatedAt": "2026-01-13T01:47:17.368Z"
  }
}
```

**Frontend Type: `Admin`**

```typescript
interface Admin {
  id: string;
  name: string; // ✅ Matches
  email: string; // ✅ Matches
  isVerified?: boolean; // ✅ Matches
  isOwner?: boolean; // ✅ Matches
  businessId: string; // ✅ Matches
  createdAt: string;
  updatedAt: string;
  business?: Business; // ⚠️ Not always included in login response
}
```

---

### SuperAdmin Auth

| Endpoint                 | Method | Service Wrapper                 | Auth | Status |
| ------------------------ | ------ | ------------------------------- | ---- | ------ |
| `/superadmin/auth/login` | POST   | `AuthService.loginSuperAdmin()` | No   | ✅     |

**Request:** `application/x-www-form-urlencoded`

```
email=superadmin@bookly.com&password=password
```

---

## 2. Business (Public)

### `GET /business`

**Service:** `BusinessService.getApprovedBusinesses(params)`

**Query Params:**

```typescript
interface BusinessQueryParams {
  page?: number; // required by API (500 error if missing)
  pageSize?: number; // required by API
  name?: string;
  search?: string; // searches business name AND service names
  categoryId?: string;
  priceFrom?: number;
  priceTo?: number;
}
```

**Response (200):** `Business[]`

```typescript
// Frontend Type: Business (src/lib/api/types.ts)
interface Business {
  id: string;
  name: string;
  email?: string;
  description?: string;
  approved?: boolean;
  logo?: string | null; // asset file ID
  logoUrl?: string | null; // resolved S3 URL
  coverImageUrl?: string | null; // resolved S3 URL
  rating?: number; // average rating (0 if no reviews)
  socialLinks?: SocialLink[];
  services?: Service[]; // nested when fetching by ID
  branches?: Branch[]; // nested when fetching by ID
  reviews?: Review[]; // nested when fetching by ID
  owner?: { name: string; email: string };
  createdAt?: string;
  updatedAt?: string;
}
```

> **⚠️ UI Type Mismatch:** `src/bookly/data/types.ts` has a separate `Business` interface with extra fields (`coverImage`, `galleryImages`, `city`, `location`, `averageRating`, `totalRatings`, `openingHours`). These fields do NOT exist on the API response. See [Section 20](#20-frontend-type-mismatches-api-vs-ui).

---

### `GET /business/{id}`

**Service:** `BusinessService.getBusiness(id)`

**Response (200):** Full business with nested branches, resources, services, socialLinks, reviews.

**Key nested structure:**

```json
{
  "id": "...",
  "name": "...",
  "branches": [
    {
      "id": "...",
      "name": "...",
      "address": "...",
      "mobile": "...",
      "gallery": [],
      "resources": [
        {
          "id": "...",
          "name": "Ahmed Hassan",
          "type": "STAFF",
          "maxConcurrent": 1,
          "slotInterval": 30,
          "slotDuration": null,
          "mobile": "+201111111111",
          "email": "ahmed@testspa.com",
          "profilePhoto": null,
          "description": null,
          "image": null,
          "branchId": "...",
          "services": [
            { "id": "...", "name": "...", "price": 100, "duration": 60 }
          ]
        }
      ],
      "services": [{ "id": "...", "name": "...", "price": 100, "duration": 60 }]
    }
  ],
  "socialLinks": [{ "id": "...", "platform": "facebook", "url": "..." }],
  "reviews": []
}
```

**Important:** Resources are nested under `branches[].resources[]`, not at the top level. Each resource has `type: "STAFF" | "ASSET"` and includes their assigned `services[]`.

**Gaps resolved (2026-02-19):**

- ✅ `coverImage` — added to Business schema (`coverImage String?`), resolved as `coverImageUrl` in API response
- ✅ `latitude` / `longitude` — added to Branch schema, exposed in create/update DTOs
- ✅ `timezone` — added to Business schema (default: `Africa/Cairo`)
- ⚠️ `openingHours` — not on business or branch objects (use Scheduling API)
- ⚠️ `galleryImages` — not on Business directly; branches have `gallery[]`

---

## 3. Categories (Public)

### `GET /categories`

**Service:** `CategoriesService.getCategories()`

**Response (200):**

```typescript
// Frontend Type: Category (API)
interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

> **✅ RESOLVED (2026-02-19):** `icon` and `slug` fields added to Category schema and exposed in create/update DTOs. `slug` is auto-generated from name if not provided.

---

## 4. Services (Public)

### `GET /services`

**Service:** `ServicesService.getServices()`

**Response (200):**

```typescript
// Frontend Type: Service (API)
interface Service {
  id: string;
  name: string;
  description?: string;
  location?: string; // text description, NOT coordinates
  price: number; // numeric (e.g. 100)
  duration: number; // minutes (e.g. 60)
  maxConcurrent?: number | null;
  businessId: string;
  gallery?: string[]; // asset file IDs
  galleryUrls?: string[]; // resolved S3 URLs
  categories?: Category[]; // nested
  branches?: Branch[]; // nested
  business?: Business; // nested (on GET /services/{id})
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}
```

> **⚠️ UI Type Mismatch:** `src/bookly/data/types.ts` `Service` has `category: string` (single string, not array of Category objects). ✅ `color` field has been added to Service create/update DTOs and schema (2026-02-19).

### `GET /services/{id}`

**Service:** `ServicesService.getService(id)`

Same as above but includes `business` and full `branches[]` nesting.

---

## 5. Bookings (Customer)

### `GET /bookings/availability`

**Service:** `BookingService.getAvailability(params)`

**Query Params:**

```typescript
{
  serviceId: string    // required
  branchId: string     // required
  date: string         // required, YYYY-MM-DD
  resourceId?: string  // optional — filter to specific staff/asset
}
```

**Response (200):** Two possible formats observed:

**Format A — Flat array (verified from testing):**

```typescript
// Frontend Type: AvailableSlotFlat
interface AvailableSlotFlat {
  startTime: string; // ISO-8601 "2026-02-18T09:00:00.000Z"
  endTime: string; // ISO-8601 "2026-02-18T10:00:00.000Z"
  resourceId: string; // which staff/asset
}
```

**Format B — Nested (documented but unverified):**

```typescript
// Frontend Type: AvailabilityResponse
interface AvailabilityResponse {
  resourceId: string;
  resourceName: string;
  resourceType: 'STAFF' | 'ASSET';
  availableSlots: { startTime: string; endTime: string }[];
}
```

> **⚠️ Action needed:** Backend team to confirm which format is canonical. Frontend currently handles flat format (Format A).

---

### `POST /bookings` 🔒

**Service:** `BookingService.createBooking(data)`

**Request:**

```typescript
// Frontend Type: CreateBookingRequest
{
  serviceId: string      // required
  branchId: string       // required
  resourceId?: string    // optional — auto-assigns if omitted
  startTime: string      // required, ISO-8601
  notes?: string
}
```

**Response (201):**

```typescript
// Frontend Type: Booking (API)
{
  id: string
  userId: string
  serviceId: string
  branchId: string
  resourceId?: string
  startTime: string      // ISO-8601
  endTime: string        // ISO-8601 (computed from service duration)
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  notes?: string
  createdAt: string
  updatedAt: string
}
```

> **❌ Gap:** Customer details form collects `name`, `email`, `phone`, `notes` — but `CreateBookingRequest` only sends `serviceId, branchId, resourceId?, startTime, notes?`. Customer name/email/phone are NOT sent. This is only a problem for guest checkout.

---

### `POST /bookings/guest`

**Service:** `BookingService.createGuestBooking(data)`

**Request:**

```typescript
// Frontend Type: GuestBookingRequest
{
  serviceId: string
  branchId: string
  resourceId?: string
  startTime: string
  notes?: string
  customerName: string       // required for guest
  customerEmail: string      // required for guest
  customerPhone: string      // required for guest
}
```

**Response (201):** Same `Booking` object.

> **🔲 Status:** Endpoint documented but not fully tested. Frontend has `createGuestBooking()` wired.

---

### `GET /bookings` 🔒

**Service:** `BookingService.getUserBookings()`

**Response (200):** `Booking[]` with nested `service`, `branch`, `resource`:

```json
[
  {
    "id": "...",
    "userId": "...",
    "serviceId": "...",
    "branchId": "...",
    "resourceId": "...",
    "startTime": "2026-02-15T10:00:00.000Z",
    "endTime": "2026-02-15T11:00:00.000Z",
    "status": "CONFIRMED",
    "notes": "...",
    "service": { "name": "Full Body Massage", "duration": 60, "price": 100 },
    "branch": {
      "name": "Downtown Branch",
      "address": "123 Main Street, Cairo"
    },
    "resource": { "name": "Ahmed Hassan", "type": "STAFF" },
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

**Frontend Type: `Booking` (API — `src/lib/api/types.ts`)**

```typescript
interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  branchId: string;
  resourceId?: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  service?: {
    name: string;
    duration: number;
    price: number;
    businessId: string;
  };
  branch?: { name: string; address: string; businessId: string };
  resource?: { name: string; type: 'STAFF' | 'ASSET' };
  user?: { firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}
```

> **⚠️ UI Type Mismatch:** `src/bookly/data/types.ts` `Booking` has completely different shape — `businessName`, `businessImage`, `serviceName`, `staffMemberName`, `date: Date`, `time: string`, `price`, `duration`, `customerName`, `slotId`, `roomId`, `partySize`. Dashboard components use `mapApiBookingToLocal()` to convert. See [Section 20](#20-frontend-type-mismatches-api-vs-ui).

---

### `PATCH /bookings/{id}/cancel` 🔒

**Service:** `BookingService.cancelBooking(bookingId)`

**Response (200):**

```json
{ "id": "...", "status": "CANCELLED", "updatedAt": "..." }
```

---

### `PATCH /bookings/{id}/reschedule` 🔒

**Service:** `BookingService.rescheduleBooking(bookingId, data)`

**Request:**

```typescript
// Frontend Type: RescheduleBookingRequest
{
  startTime: string        // required, ISO-8601
  resourceId?: string      // optional — keeps current if omitted
}
```

**Response (200):** Updated `Booking` object.

---

## 6. Reviews (Customer)

### `POST /reviews` 🔒

**Service:** `ReviewsService.createReview(data)`

**Request:**

```typescript
// Frontend Type: CreateReviewRequest
{
  businessId: string       // required
  rating: number           // required, 1-5
  comment: string          // required
  serviceId?: string       // optional
  bookingId?: string       // optional
}
```

**Response (201):**

```typescript
// Frontend Type: Review (API)
{
  id: string
  rating: number
  comment?: string
  userId: string
  serviceId?: string
  businessId?: string
  user?: User              // nested author
  service?: Service
  createdAt: string
  updatedAt: string
}
```

### `GET /reviews?businessId=`

Public endpoint for fetching reviews by business.

---

## 7. Admin — Business

### `PATCH /admin/business` 🔒

**Service:** `BusinessService.updateBusiness(data)`

**Request:**

```typescript
// Frontend Type: Omit<UpdateBusinessRequest, 'id'>
{
  name?: string
  email?: string
  description?: string
  socialLinks?: SocialLink[]
  logo?: string | null     // asset file ID
}
```

**Where `SocialLink` is:**

```typescript
interface SocialLink {
  id?: string; // include when updating existing
  platform: string; // "facebook" | "instagram" | "twitter" etc.
  url: string;
  businessId?: string; // auto-set by backend
}
```

**Response (200):** Returns `BusinessChangeRequest` (not the Business directly — requires SuperAdmin approval).

```typescript
interface BusinessChangeRequest {
  id: string;
  businessId: string;
  name?: string;
  email?: string;
  description?: string;
  socialLinks?: SocialLink[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

> **⚠️ Note:** Business profile changes go through an approval workflow. The update creates a change request, not an immediate change.

---

## 8. Admin — Branches

| Endpoint               | Method | Service                              | Status |
| ---------------------- | ------ | ------------------------------------ | ------ |
| `/admin/branches`      | GET    | `BranchesService.getBranches()`      | ✅     |
| `/admin/branches`      | POST   | `BranchesService.createBranch(data)` | ✅     |
| `/admin/branches`      | PATCH  | `BranchesService.updateBranch(data)` | ✅     |
| `/admin/branches/{id}` | DELETE | `BranchesService.deleteBranch(id)`   | ✅     |

#### `POST /admin/branches`

**Request:**

```typescript
// Frontend Type: CreateBranchRequest
{
  name: string             // required
  address?: string
  mobile?: string
  serviceIds?: string[]    // link services to branch
  gallery?: string[]       // asset file IDs
}
```

**Response (201):**

```typescript
// Frontend Type: Branch (API)
{
  id: string
  name: string
  address?: string
  mobile?: string
  businessId: string
  latitude?: number
  longitude?: number
  gallery?: string[]
  galleryUrls?: string[]
  services?: Service[]
  staff?: Staff[]
  resources?: Resource[]
  createdAt: string
  updatedAt: string
}
```

#### `PATCH /admin/branches`

**Request:**

```typescript
// Frontend Type: UpdateBranchRequest
{
  id: string               // required
  name: string             // required
  address?: string
  mobile?: string
  serviceIds?: string[]
  gallery?: string[]
}
```

> **✅ RESOLVED (2026-02-19):** `latitude` and `longitude` added to Branch schema and exposed in both create/update DTOs.

---

## 9. Admin — Services

| Endpoint               | Method | Service                               | Status |
| ---------------------- | ------ | ------------------------------------- | ------ |
| `/admin/services`      | POST   | `ServicesService.createService(data)` | ✅     |
| `/admin/services`      | PATCH  | `ServicesService.updateService(data)` | ✅     |
| `/admin/services/{id}` | DELETE | `ServicesService.deleteService(id)`   | ✅     |

#### `POST /admin/services`

**Request:**

```typescript
// Frontend Type: CreateServiceRequest
{
  name: string             // required
  description?: string
  location: string         // required — text location
  price: number            // required
  duration: number         // required — minutes
  categoryIds?: string[]   // link to categories
  branchIds?: string[]     // link to branches
  gallery?: string[]       // asset file IDs
}
```

#### `PATCH /admin/services`

**Request:**

```typescript
// Frontend Type: UpdateServiceRequest
{
  id: string               // required
  name?: string
  description?: string
  location?: string
  price?: number
  duration?: number
  categoryIds?: string[]
  branchIds?: string[]
  gallery?: string[]
}
```

**Response:** Full `Service` object with nested `categories[]`, `branches[]`.

---

## 10. Admin — Staff

| Endpoint            | Method | Service                          | Status |
| ------------------- | ------ | -------------------------------- | ------ |
| `/admin/staff`      | GET    | `StaffService.getStaff()`        | ✅     |
| `/admin/staff`      | POST   | `StaffService.createStaff(data)` | ✅     |
| `/admin/staff`      | PATCH  | `StaffService.updateStaff(data)` | ✅     |
| `/admin/staff/{id}` | DELETE | `StaffService.deleteStaff(id)`   | ✅     |

#### `GET /admin/staff`

**Response (200):** `Staff[]`

```typescript
// Frontend Type: Staff (API)
{
  id: string
  name: string
  mobile?: string
  businessId?: string
  branchId: string
  profilePhoto?: string | null
  profilePhotoUrl?: string | null
  services?: Service[]         // nested — which services this staff can perform
  createdAt: string
  updatedAt: string
}
```

> **⚠️ Note:** The API `Staff` type does NOT include: `email`, `slotInterval`, `slotDuration`, `maxConcurrent`, `type`. Those fields are on the `Resource` model (returned from `GET /business/{id}` under `branches[].resources[]`). The `/admin/staff` endpoints operate on the Resource model under the hood but the response may be a simplified `Staff` shape.

#### `POST /admin/staff`

**Request:**

```typescript
// Frontend Type: CreateStaffRequest
{
  name: string             // required
  mobile?: string
  email?: string
  branchId: string         // required
  serviceIds?: string[]    // services this staff can perform
  profilePhoto?: string | null  // asset file ID
  slotInterval?: number    // minutes between slots (default 30)
  slotDuration?: number | null  // null = use service duration (dynamic)
}
```

#### `PATCH /admin/staff`

**Request:**

```typescript
// Frontend Type: UpdateStaffRequest
{
  id: string               // required
  name?: string
  mobile?: string
  email?: string
  branchId?: string
  serviceIds?: string[]
  profilePhoto?: string | null
  slotInterval?: number
  slotDuration?: number | null
}
```

> **⚠️ UI Type Mismatch:** `src/bookly/data/types.ts` `StaffMember` has many extra fields: `title`, `photo`, `branchIds[]`, `mainBranchId`, `staffType`, `schedule[]`, `workingHours`, `appointments[]`, `maxConcurrentBookings`, `color`, `roomAssignments[]`, `isActive`. The staff-store maps API data to this shape using defaults. See [Section 20](#20-frontend-type-mismatches-api-vs-ui).

**✅ RESOLVED (2026-02-19) — Fields added to API Staff/Resource model:**
| Field | UI Type | Purpose | Status |
|---|---|---|---|
| `color` | `string` | Hex code for calendar column coloring | ✅ Added to schema + create/update DTOs |
| `title` | `string` | Job title display (e.g. "Senior Therapist") | ✅ Added to schema + create/update DTOs |
| `isActive` | `boolean` | Enable/disable without deleting | ✅ Added to schema (default: true) + update DTO |

---

## 11. Admin — Assets (Rooms/Equipment)

| Endpoint             | Method | Service                           | Status |
| -------------------- | ------ | --------------------------------- | ------ |
| `/admin/assets`      | GET    | `AssetsService.getAssets()`       | ✅     |
| `/admin/assets/{id}` | GET    | `AssetsService.getAsset(id)`      | ✅     |
| `/admin/assets`      | POST   | `AssetsService.createAsset(data)` | ✅     |
| `/admin/assets`      | PATCH  | `AssetsService.updateAsset(data)` | ✅     |
| `/admin/assets/{id}` | DELETE | `AssetsService.deleteAsset(id)`   | ✅     |

#### `POST /admin/assets`

**Request:**

```typescript
// Frontend Type: CreateAssetResourceRequest
{
  name: string               // required
  description?: string
  branchId: string           // required
  maxConcurrent?: number     // e.g. 4 for tennis court
  serviceIds?: string[]
  image?: string             // asset file ID
  slotInterval?: number      // minutes
  slotDuration?: number | null  // null = use service duration
}
```

#### `PATCH /admin/assets`

**Request:**

```typescript
// Frontend Type: UpdateAssetResourceRequest
{
  id: string                 // required
  name?: string
  description?: string
  branchId?: string
  maxConcurrent?: number
  serviceIds?: string[]
  image?: string
  slotInterval?: number
  slotDuration?: number | null
}
```

**Response:** `Asset` object.

```typescript
// Frontend Type: Asset
{
  id: string
  name: string
  type: 'ASSET'
  description?: string | null
  branchId: string
  maxConcurrent: number
  slotInterval: number
  slotDuration?: number | null
  image?: string | null
  mobile?: string | null
  email?: string | null
  serviceIds?: string[]
  services?: Service[]
  createdAt: string
  updatedAt: string
}
```

**✅ RESOLVED (2026-02-19) — Fields added to API Asset model:**
| Field | Purpose | Status |
|---|---|---|
| `color` | Hex code for calendar display | ✅ Added to schema + create/update DTOs |
| `isActive` | Toggle availability (on Resource) | ✅ Added to schema (default: true) |

---

## 12. Admin — Scheduling

### Schedules (Weekly Recurring Hours)

| Endpoint                           | Method | Service                                   | Status                            |
| ---------------------------------- | ------ | ----------------------------------------- | --------------------------------- |
| `/admin/scheduling/schedules`      | GET    | `SchedulingService.getSchedules(params?)` | ✅                                |
| `/admin/scheduling/schedules`      | POST   | `SchedulingService.createSchedule(data)`  | ✅                                |
| `/admin/scheduling/schedules/{id}` | PATCH  | —                                         | 🔲 Documented, no service wrapper |
| `/admin/scheduling/schedules/{id}` | DELETE | `SchedulingService.deleteSchedule(id)`    | ✅                                |

**GET Query Params:** `?resourceId=` or `?branchId=`

**POST Request:**

```typescript
// Frontend Type: CreateScheduleRequest
{
  dayOfWeek: number       // 0=Sunday ... 6=Saturday
  startTime: string       // "HH:mm" (e.g. "09:00")
  endTime: string         // "HH:mm" (e.g. "17:00")
  resourceId?: string     // staff or asset ID
  branchId?: string       // for branch-level defaults
}
```

**Response:**

```typescript
// Frontend Type: Schedule
{
  id: string
  dayOfWeek: number
  startTime: string       // "HH:mm"
  endTime: string         // "HH:mm"
  resourceId?: string
  branchId?: string
  createdAt: string
  updatedAt: string
}
```

> **⚠️ Gap:** `PATCH /admin/scheduling/schedules/{id}` is documented in the API docs but **no service wrapper method** exists in `scheduling.service.ts`. Frontend currently uses delete + recreate.

---

### Breaks (Recurring Breaks)

| Endpoint                        | Method | Service                                | Status |
| ------------------------------- | ------ | -------------------------------------- | ------ |
| `/admin/scheduling/breaks`      | GET    | `SchedulingService.getBreaks(params?)` | ✅     |
| `/admin/scheduling/breaks`      | POST   | `SchedulingService.createBreak(data)`  | ✅     |
| `/admin/scheduling/breaks/{id}` | DELETE | `SchedulingService.deleteBreak(id)`    | ✅     |

**POST Request:**

```typescript
// Frontend Type: CreateBreakRequest
{
  name: string            // e.g. "Lunch Break"
  dayOfWeek: number       // 0-6
  startTime: string       // "HH:mm"
  endTime: string         // "HH:mm"
  resourceId?: string
  branchId?: string
}
```

**Response:**

```typescript
// Frontend Type: ScheduleBreak
{
  id: string
  name: string
  dayOfWeek: number
  startTime: string
  endTime: string
  resourceId?: string
  branchId?: string
  createdAt: string
  updatedAt: string
}
```

---

### Exceptions (Holidays, Special Hours)

| Endpoint                            | Method | Service                                    | Status |
| ----------------------------------- | ------ | ------------------------------------------ | ------ |
| `/admin/scheduling/exceptions`      | GET    | `SchedulingService.getExceptions(params?)` | ✅     |
| `/admin/scheduling/exceptions`      | POST   | `SchedulingService.createException(data)`  | ✅     |
| `/admin/scheduling/exceptions/{id}` | DELETE | `SchedulingService.deleteException(id)`    | ✅     |

**POST Request:**

```typescript
// Frontend Type: CreateExceptionRequest
{
  date: string               // "YYYY-MM-DD"
  startTime?: string | null  // "HH:mm" or null for whole day
  endTime?: string | null    // "HH:mm" or null for whole day
  reason?: string
  isAvailable: boolean       // false = blocked, true = extra availability
  resourceId?: string
  branchId?: string
}
```

**Response:**

```typescript
// Frontend Type: ScheduleException
{
  id: string
  date: string
  startTime?: string | null
  endTime?: string | null
  reason?: string
  isAvailable: boolean
  resourceId?: string
  branchId?: string
  createdAt: string
  updatedAt: string
}
```

---

### Assignments (Staff ↔ Room)

| Endpoint                             | Method | Service                                     | Status |
| ------------------------------------ | ------ | ------------------------------------------- | ------ |
| `/admin/scheduling/assignments`      | GET    | `SchedulingService.getAssignments(params?)` | ✅     |
| `/admin/scheduling/assignments`      | POST   | `SchedulingService.createAssignment(data)`  | ✅     |
| `/admin/scheduling/assignments/{id}` | DELETE | `SchedulingService.deleteAssignment(id)`    | ✅     |

**GET Query Params:** `?date=YYYY-MM-DD`

**POST Request:**

```typescript
// Frontend Type: CreateAssignmentRequest
{
  staffId: string; // required
  assetId: string; // required — room/asset ID
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}
```

**Response:**

```typescript
// Frontend Type: ResourceAssignment
{
  id: string;
  staffId: string;
  assetId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 13. Admin — Bookings

| Endpoint                          | Method | Service                                           | Status |
| --------------------------------- | ------ | ------------------------------------------------- | ------ |
| `/admin/bookings`                 | GET    | `BookingService.getBusinessBookings(params?)`     | ✅     |
| `/admin/bookings`                 | POST   | `BookingService.createAdminBooking(data)`         | ✅     |
| `/admin/bookings/{id}/status`     | PATCH  | `BookingService.updateBookingStatus(id, status)`  | ✅     |
| `/admin/bookings/{id}/reschedule` | PATCH  | `BookingService.adminRescheduleBooking(id, data)` | ⚠️     |
| `/admin/bookings/{id}`            | DELETE | `BookingService.deleteBooking(id)`                | ✅     |

#### `GET /admin/bookings`

**Query Params:**

```typescript
// Frontend Type: AdminBookingsParams
{
  date?: string            // "YYYY-MM-DD" single day
  fromDate?: string        // "YYYY-MM-DD" range start
  toDate?: string          // "YYYY-MM-DD" range end
  staffId?: string         // filter by staff
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  page?: number            // default 1
  pageSize?: number        // default 50
  sortBy?: string          // default "startTime"
  sortOrder?: 'asc' | 'desc'  // default "desc"
}
```

**Response (200):** `Booking[]` with nested `service`, `branch`, `resource`, `user`.

#### `POST /admin/bookings`

**Request:**

```typescript
// Frontend Type: AdminCreateBookingRequest
{
  serviceId: string          // required
  branchId: string           // required
  resourceId?: string        // optional
  staffId?: string           // optional (alias for resourceId)
  startTime: string          // required, ISO-8601
  customerName: string       // required
  customerEmail?: string
  customerPhone?: string
  status?: string            // e.g. "CONFIRMED"
  notes?: string
}
```

#### `PATCH /admin/bookings/{id}/status`

**Request:**

```json
{ "status": "CONFIRMED" }
```

**Valid values:** `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`

#### `PATCH /admin/bookings/{id}/reschedule`

**Request:**

```typescript
{ startTime: string; resourceId?: string }
```

> **⚠️ Note:** The service wrapper currently hits `/bookings/{id}/reschedule` (user endpoint) instead of `/admin/bookings/{id}/reschedule`. Verify admin-specific endpoint exists.

#### `DELETE /admin/bookings/{id}`

> **✅ RESOLVED (2026-02-19):** Admin-specific delete endpoint implemented. Verifies admin ownership of the booking's business before deletion.

---

## 14. Admin — Reviews

| Endpoint                    | Method | Service                                   | Status |
| --------------------------- | ------ | ----------------------------------------- | ------ |
| `/admin/reviews`            | GET    | `ReviewsService.getReviews()`             | ✅     |
| `/admin/reviews/{id}/reply` | POST   | `ReviewsService.replyToReview(id, reply)` | ✅     |
| `/admin/reviews/{id}/flag`  | POST   | `ReviewsService.flagReview(id, reason)`   | ✅     |

#### `GET /admin/reviews`

**Response (200):** `AdminReview[]`

```typescript
// Frontend Type: AdminReview
interface AdminReview extends Review {
  reply?: string | null;
  flagged?: boolean;
  flagReason?: string | null;
}

// Where Review is:
interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  serviceId?: string;
  businessId?: string;
  user?: User; // { firstName, lastName, email, profilePhoto }
  service?: Service;
  createdAt: string;
  updatedAt: string;
}
```

#### `POST /admin/reviews/{id}/reply`

**Request:**

```json
{ "reply": "Thank you for your feedback!" }
```

#### `POST /admin/reviews/{id}/flag`

**Request:**

```json
{ "reason": "Inappropriate content" }
```

---

## 15. Admin — Commissions

| Endpoint                  | Method | Service                                     | Status |
| ------------------------- | ------ | ------------------------------------------- | ------ |
| `/admin/commissions`      | GET    | `CommissionsService.getCommissions()`       | ✅     |
| `/admin/commissions`      | POST   | `CommissionsService.createCommission(data)` | ✅     |
| `/admin/commissions/{id}` | PATCH  | `CommissionsService.update(id, data)`       | ✅     |
| `/admin/commissions/{id}` | DELETE | `CommissionsService.deleteCommission(id)`   | ✅     |

#### `POST /admin/commissions`

**Request:**

```typescript
// Frontend Type: CreateCommissionRequest
{
  serviceId: string; // required
  resourceId: string; // required — staff ID
  percentage: number; // required — e.g. 10 for 10%
}
```

**Response:**

```typescript
// Frontend Type: Commission
{
  id: string;
  serviceId: string;
  resourceId: string;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}
```

> **⚠️ Frontend UI Mismatch:** The `CommissionsTab` component supports advanced features (scope: serviceCategory/product/giftCard/membership, staff targeting: all/specific, type: percentage/fixed). The API only supports simple `serviceId + resourceId + percentage`. Frontend needs to simplify OR backend needs to expand.

**❌ Missing API fields for full CommissionsTab support:**
| Field | Type | Purpose |
|---|---|---|
| `scope` | `'service' \| 'category' \| 'product'` | What the commission applies to |
| `staffScope` | `'all' \| 'specific'` | Target all or specific staff |
| `staffIds` | `string[]` | When `staffScope = 'specific'` |
| `type` | `'percentage' \| 'fixed'` | Commission type |
| `value` | `number` | Amount (% or fixed) |
| ~~`PATCH` endpoint~~ | — | ✅ **RESOLVED** — `PATCH /admin/commissions/{id}` now implemented |

---

## 16. Admin — Settings

| Endpoint          | Method | Service                                | Status |
| ----------------- | ------ | -------------------------------------- | ------ |
| `/admin/settings` | GET    | `SettingsService.getSettings()`        | ✅     |
| `/admin/settings` | PATCH  | `SettingsService.updateSettings(data)` | ✅     |

#### `PATCH /admin/settings`

**Request (API Type — what backend currently accepts):**

```typescript
// Frontend Type: BusinessSettings (src/lib/api/types.ts)
{
  businessId: string
  bookingPolicies: {
    advanceBookingDays?: number
    cancellationHours?: number
    allowGuestBooking?: boolean
    requirePhone?: boolean
  }
  paymentSettings: {
    requirePayment?: boolean
    depositAmount?: number
    currency?: string
  }
  notificationSettings: {
    emailEnabled?: boolean
    smsEnabled?: boolean
    pushEnabled?: boolean
  }
  schedulingSettings: {
    defaultSlotDuration?: number
    bufferTime?: number
    startOfWeek?: number
  }
  customerSettings: any
}
```

> **⚠️ Major Mismatch:** The frontend `business-settings.store.ts` sends a much richer payload with 9 sub-objects. The API type definitions are much simpler. The store falls back to localStorage when the API returns 404.

**Frontend Store Payload (what `business-settings.store.ts` actually sends):**

```typescript
{
  businessProfile: {
    name: string, description: string, logo: string | null, coverImage: string | null,
    email: string, phone: string, website: string, publicUrlSlug: string,
    timezone: string, language: string
  },
  socialLinks: {
    facebook: string, instagram: string, twitter: string,
    linkedin: string, tiktok: string, youtube: string
  },
  bookingPolicies: {
    autoConfirmation: boolean,
    cancellationPolicy: { enabled: boolean, hoursBeforeAppointment: number, refundPercentage: number },
    reschedulePolicy: { enabled: boolean, hoursBeforeAppointment: number },
    noShowPolicy: { chargeFee: boolean, feePercentage: number, restrictFutureBookings: boolean, restrictionDays: number },
    bookingLeadTime: number,  // minimum hours before booking
    maxAdvanceBooking: number  // maximum days ahead
  },
  paymentSettings: {
    acceptedMethods: ('pay_on_arrival' | 'card' | 'instapay' | 'fawry')[],
    depositRequired: boolean, depositPercentage: number,
    currency: string, taxEnabled: boolean, taxPercentage: number, taxInclusive: boolean
  },
  notificationSettings: {
    newBookingAlert: { email: boolean, sms: boolean, push: boolean },
    cancellationAlert: { email: boolean, sms: boolean },
    customerReminders: { enabled: boolean, beforeHours: number[] },
    staffNotifications: boolean,
    dailyDigest: { enabled: boolean, time: string, recipients: string[] }
  },
  schedulingSettings: {
    bufferTimeBetweenBookings: number, allowOverbooking: boolean, overbookingPercentage: number,
    defaultBookingDuration: number, allowWalkIns: boolean
  },
  calendarSettings: {
    defaultView: 'month' | 'week' | 'day', timeSlotDuration: 15 | 30 | 60,
    startOfWeek: 'sunday' | 'monday', timeFormat: '12h' | '24h',
    colorScheme: 'vivid' | 'pastel', showWeekends: boolean,
    workingHoursStart: string, workingHoursEnd: string
  },
  customerSettings: {
    guestCheckout: boolean, requireEmail: boolean,
    requirePhone: boolean, showCustomerNotesToStaff: boolean
  },
  brandingSettings: {
    primaryColor: string, welcomeMessage: string,
    confirmationMessage: string, bookingPageTheme: 'light' | 'dark' | 'auto'
  }
}
```

**✅ PARTIALLY RESOLVED (2026-02-19):** `calendarSettings` and `brandingSettings` JSON fields added to `BusinessSettings` schema. Backend uses upsert with `...data` spread, so it accepts and persists whatever structure the frontend sends. The `getSettings()` endpoint now returns defaults for all 7 sub-objects including the new ones.

---

## 17. Admin — Notifications

| Endpoint                   | Method | Service                                   | Status |
| -------------------------- | ------ | ----------------------------------------- | ------ |
| `/notifications`           | GET    | `NotificationsService.getNotifications()` | 🔲     |
| `/notifications/{id}/read` | PATCH  | `NotificationsService.markAsRead(id)`     | 🔲     |

**Response:**

```typescript
// Frontend Type: Notification
{
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
```

> **🔲 Status:** Service wrapper exists but UI is not wired. Calendar sidebar has a notifications drawer that uses mock data.

---

## 18. Media Library

| Endpoint          | Method | Service                              | Status                |
| ----------------- | ------ | ------------------------------------ | --------------------- |
| `/media-lib`      | GET    | `MediaService.getMediaFiles()`       | ✅ (Added 2026-02-19) |
| `/media-lib`      | POST   | `MediaService.createAsset(data)`     | ✅                    |
| `/media-lib/{id}` | PATCH  | `MediaService.updateAsset(id, data)` | ✅                    |
| `/media-lib/{id}` | DELETE | `MediaService.deleteAsset(id)`       | ✅                    |

#### `POST /media-lib`

**Request:**

```typescript
// Frontend Type: CreateAssetRequest
{
  fileName: string; // e.g. "photo.png"
  mimeType: string; // e.g. "image/png"
  size: number; // bytes
}
```

**Response (201):**

```typescript
// Frontend Type: CreateAssetResponse
{
  assetFileId: string; // use this ID in other entities (logo, gallery, profilePhoto)
  uploadUrl: string; // pre-signed S3 URL for direct upload
}
```

**Upload Flow:**

1. `POST /media-lib` → get `assetFileId` + `uploadUrl`
2. `PUT {uploadUrl}` with file body → upload to S3
3. Use `assetFileId` in other API calls (e.g., `logo: "assetFileId"`)

**Response Type for list:**

```typescript
// Frontend Type: AssetFile
{
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadUrl: string; // public S3 URL
  createdAt: string;
  updatedAt: string;
}
```

---

## 19. SuperAdmin

| Endpoint                                | Method | Service                                      | Status |
| --------------------------------------- | ------ | -------------------------------------------- | ------ |
| `/superadmin/auth/login`                | POST   | `AuthService.loginSuperAdmin()`              | ✅     |
| `/superadmin/business/pending`          | GET    | `BusinessService.getPendingBusinesses()`     | ✅     |
| `/superadmin/business/pending-requests` | GET    | `BusinessService.getPendingChangeRequests()` | ✅     |
| `/superadmin/business/approve`          | POST   | `BusinessService.approveBusiness(data)`      | ✅     |
| `/superadmin/business/reject`           | POST   | `BusinessService.rejectBusiness(data)`       | ✅     |
| `/superadmin/business/approve-request`  | POST   | `BusinessService.approveChangeRequest(data)` | ✅     |
| `/superadmin/business/reject-request`   | POST   | `BusinessService.rejectChangeRequest(data)`  | ✅     |
| `/superadmin/categories`                | POST   | `CategoriesService.createCategory(data)`     | ✅     |
| `/superadmin/categories/{id}`           | PATCH  | `CategoriesService.updateCategory(id, data)` | ✅     |
| `/superadmin/categories/{id}`           | DELETE | `CategoriesService.deleteCategory(id)`       | ✅     |

All endpoints fully aligned. No gaps.

---

## 20. Frontend Type Mismatches (API vs UI)

The frontend has **two separate type systems** that don't match:

| File                       | Purpose             | Example Types                                   |
| -------------------------- | ------------------- | ----------------------------------------------- |
| `src/lib/api/types.ts`     | API response shapes | `Booking`, `Staff`, `Service`, `Business`       |
| `src/bookly/data/types.ts` | UI component shapes | `Booking`, `StaffMember`, `Service`, `Business` |

### Booking: API vs UI

| Field                   | API Type (`lib/api/types.ts`)                                         | UI Type (`bookly/data/types.ts`)                         | Notes                                                |
| ----------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `id`                    | `string`                                                              | `string`                                                 | ✅ Same                                              |
| `status`                | `'PENDING' \| 'CONFIRMED' \| 'CANCELLED' \| 'COMPLETED' \| 'NO_SHOW'` | `'confirmed' \| 'pending' \| 'cancelled' \| 'completed'` | ⚠️ API=UPPERCASE, UI=lowercase; UI missing `NO_SHOW` |
| `startTime` / `endTime` | `string` (ISO-8601)                                                   | —                                                        | ❌ UI uses `date: Date` + `time: string` instead     |
| `service`               | nested `{ name, duration, price }`                                    | —                                                        | ❌ UI has flat `serviceName`, `duration`, `price`    |
| `resource`              | nested `{ name, type }`                                               | —                                                        | ❌ UI has flat `staffMemberName`                     |
| `branch`                | nested `{ name, address }`                                            | —                                                        | ❌ UI has flat `branchName`, `branchId`              |
| `user`                  | nested `{ firstName, lastName }`                                      | —                                                        | ❌ UI has flat `customerName`                        |
| —                       | —                                                                     | `businessName`                                           | ❌ Not in API                                        |
| —                       | —                                                                     | `businessImage`                                          | ❌ Not in API                                        |
| —                       | —                                                                     | `slotId`, `roomId`, `partySize`                          | ❌ Not in API                                        |

**Mapping function:** `mapApiBookingToLocal()` in `DashboardBookly.tsx` converts between these.

### Staff: API vs UI

| Field        | API Type (`Staff`)  | UI Type (`StaffMember`) | Notes                                                  |
| ------------ | ------------------- | ----------------------- | ------------------------------------------------------ |
| `id`         | `string`            | `string`                | ✅ Same                                                |
| `name`       | `string`            | `string`                | ✅ Same                                                |
| `mobile`     | `string`            | —                       | UI uses `phone` instead                                |
| `branchId`   | `string`            | `string`                | ✅ Same                                                |
| —            | —                   | `title`                 | ❌ Not in API                                          |
| —            | —                   | `photo`                 | ❌ API has `profilePhoto`                              |
| —            | —                   | `branchIds[]`           | ❌ API only supports single `branchId`                 |
| —            | —                   | `staffType`             | ❌ API uses `slotDuration` to determine (null=dynamic) |
| —            | —                   | `color`                 | ✅ Added to API (2026-02-19)                           |
| —            | —                   | `schedule[]`            | ❌ Not in API Staff; use Scheduling API instead        |
| —            | —                   | `isActive`              | ✅ Added to API (2026-02-19)                           |
| —            | —                   | `roomAssignments[]`     | ❌ Not in API Staff; use Assignments API instead       |
| `services[]` | `Service[]` objects | —                       | UI uses `serviceIds: string[]`                         |

### Business: API vs UI

| Field         | API Type          | UI Type                          | Notes                                                                |
| ------------- | ----------------- | -------------------------------- | -------------------------------------------------------------------- |
| `id`, `name`  | ✅                | ✅                               | Same                                                                 |
| `description` | `string`          | `about`                          | ⚠️ Different name                                                    |
| `logo`        | `string \| null`  | —                                | UI uses `coverImage`                                                 |
| `rating`      | `number`          | `averageRating` + `totalRatings` | ⚠️ API has single `rating`                                           |
| —             | —                 | `categories: string[]`           | ❌ Not in API                                                        |
| —             | —                 | `city`, `location { lat, lng }`  | ✅ **Resolved** — `location` JSON on Business, `lat`/`lng` on Branch |
| —             | —                 | `galleryImages: string[]`        | ❌ Not on Business; `gallery` on Branch                              |
| —             | —                 | `openingHours`                   | ✅ **Resolved** — `openingHours` JSON on Business                    |
| `socialLinks` | `SocialLink[]`    | —                                | ✅ **Resolved** — `socialLinks` relation on Business                 |
| `branches`    | `Branch[]` nested | `branches: Branch[]`             | ✅ **Resolved** — Queries include branches                           |

### Service: API vs UI

| Field                             | API Type             | UI Type                     | Notes                        |
| --------------------------------- | -------------------- | --------------------------- | ---------------------------- |
| `id`, `name`, `price`, `duration` | ✅                   | ✅                          | Same                         |
| `description`                     | `string`             | `string`                    | ✅ Same                      |
| `categories`                      | `Category[]` objects | `category: string` (single) | ⚠️ Different structure       |
| `businessId`                      | `string`             | `string`                    | ✅ Same                      |
| —                                 | —                    | `color`                     | ✅ Added to API (2026-02-19) |
| `location`                        | `string` (text)      | —                           | Not in UI type               |

### Category: API vs UI

| Field        | API Type | UI Type | Notes                                                  |
| ------------ | -------- | ------- | ------------------------------------------------------ |
| `id`, `name` | ✅       | ✅      | Same                                                   |
| —            | —        | `icon`  | ✅ Added to API (2026-02-19)                           |
| —            | —        | `slug`  | ✅ Added to API (2026-02-19, auto-generated from name) |

---

## 21. Missing Endpoints Summary

### 🔴 HIGH Priority

| Endpoint                                           | Purpose                 | Needed By          | Current Workaround                                      |
| -------------------------------------------------- | ----------------------- | ------------------ | ------------------------------------------------------- |
| `GET /admin/dashboard/stats`                       | Quick dashboard summary | Dashboard overview | Fetches all bookings + reviews and computes client-side |
| `PATCH /admin/scheduling/schedules/{id}` (wrapper) | Update schedule         | Shifts tab         | Delete + recreate                                       |

### 🟡 MEDIUM Priority

| Endpoint                            | Purpose               | Needed By           | Current Workaround           |
| ----------------------------------- | --------------------- | ------------------- | ---------------------------- |
| ~~`PATCH /admin/commissions/{id}`~~ | ~~Update commission~~ | ~~Commissions tab~~ | ✅ **RESOLVED (2026-02-19)** |
| `GET /bookings?status=`             | Filter user bookings  | Appointments page   | Client-side filter           |
| Revenue / analytics endpoint        | Revenue charts        | Dashboard widgets   | Mock data                    |

### 🟢 LOW Priority

| Endpoint                                      | Purpose            | Needed By               |
| --------------------------------------------- | ------------------ | ----------------------- |
| `GET/POST/PATCH/DELETE /admin/coupons`        | Discount codes     | Extended booking modal  |
| `POST /coupons/validate`                      | Validate coupon    | Extended booking modal  |
| `GET/POST/DELETE /admin/services/{id}/addons` | Service add-ons    | Extended booking modal  |
| Payment intent / webhook endpoints            | Payment processing | Booking confirmation    |
| WebSocket / SSE                               | Real-time updates  | Calendar, notifications |

---

## 22. Missing Fields Summary

### On Resource (Staff/Asset) — Backend Schema

| Field      | Type      | Purpose                      | Priority | Status                                                         |
| ---------- | --------- | ---------------------------- | -------- | -------------------------------------------------------------- |
| `color`    | `string`  | Hex code for calendar column | **HIGH** | ✅ **RESOLVED** — Added to schema + DTOs                       |
| `title`    | `string`  | Display title                | MEDIUM   | ✅ **RESOLVED** — Added to schema + DTOs                       |
| `isActive` | `boolean` | Toggle availability          | MEDIUM   | ✅ **RESOLVED** — Added to schema (default: true) + update DTO |

### On Booking — Backend Schema

| Field           | Type                              | Purpose                        | Priority | Currently                      |
| --------------- | --------------------------------- | ------------------------------ | -------- | ------------------------------ |
| `customerName`  | `string`                          | Guest name (non-user bookings) | **HIGH** | Only on admin-created bookings |
| `customerEmail` | `string`                          | Guest email                    | **HIGH** | Only on admin-created bookings |
| `customerPhone` | `string`                          | Guest phone                    | MEDIUM   | Only on admin-created bookings |
| `paymentStatus` | `'paid' \| 'unpaid' \| 'partial'` | Payment tracking               | LOW      | No payment system              |
| `bookedBy`      | `'client' \| 'business'`          | Who created                    | LOW      | Can infer from context         |
| `partySize`     | `number`                          | Group size                     | LOW      | Not supported                  |

### On Service — Backend Schema

| Field   | Type     | Purpose              | Priority | Currently                                |
| ------- | -------- | -------------------- | -------- | ---------------------------------------- |
| `color` | `string` | Calendar event color | MEDIUM   | ✅ **RESOLVED** — Added to schema + DTOs |

### On Business — Backend Schema

| Field          | Type                           | Purpose                 | Priority | Currently                                                       |
| -------------- | ------------------------------ | ----------------------- | -------- | --------------------------------------------------------------- |
| `coverImage`   | `string`                       | Banner image            | MEDIUM   | ✅ **RESOLVED** — Added to schema + DTO                         |
| `openingHours` | `{ dayOfWeek, open, close }[]` | Operating hours display | MEDIUM   | Not available (use Scheduling API)                              |
| `timezone`     | `string`                       | IANA timezone           | LOW      | ✅ **RESOLVED** — Added to schema (default: Africa/Cairo) + DTO |

### On Branch — Backend Schema

| Field       | Type     | Purpose                         | Priority | Currently                                              |
| ----------- | -------- | ------------------------------- | -------- | ------------------------------------------------------ |
| `latitude`  | `number` | Map coordinates (create/update) | MEDIUM   | ✅ **RESOLVED** — Added to schema + create/update DTOs |
| `longitude` | `number` | Map coordinates (create/update) | MEDIUM   | ✅ **RESOLVED** — Added to schema + create/update DTOs |

### On Category — Backend Schema

| Field  | Type     | Purpose           | Priority | Currently                                                     |
| ------ | -------- | ----------------- | -------- | ------------------------------------------------------------- |
| `icon` | `string` | Display icon name | LOW      | ✅ **RESOLVED** — Added to schema + DTOs                      |
| `slug` | `string` | URL-friendly name | LOW      | ✅ **RESOLVED** — Added to schema (auto-gen from name) + DTOs |

---

## 23. Integration Status per Page

### Customer-Facing Pages

| Page              | Route                                | API Status | Mock Fallback                     | Notes                                                   |
| ----------------- | ------------------------------------ | ---------- | --------------------------------- | ------------------------------------------------------- |
| Landing page      | `/(bookly)/landpage`                 | ✅ Wired   | Categories + businesses from mock | `BusinessService` + `CategoriesService`                 |
| Search            | `/(bookly)/search`                   | ✅ Wired   | —                                 | `BusinessService.getApprovedBusinesses()`               |
| Business detail   | `/(bookly-clean)/business/[slug]`    | ✅ Wired   | Staff/branches from mock          | `BusinessService.getBusiness()`                         |
| Booking modal     | Component                            | ✅ Wired   | Time slots from mock              | `BookingService.getAvailability()` + `createBooking()`  |
| Customer login    | `/(bookly)/(auth)/customer/login`    | ✅ Wired   | —                                 | `AuthService.loginUser()`                               |
| Customer register | `/(bookly)/(auth)/customer/register` | ✅ Wired   | —                                 | `AuthService.registerUser()`                            |
| Profile           | `/(bookly)/profile`                  | ⚠️ Partial | Mock user data                    | `AuthService.getUserDetails()` wired; edit not wired    |
| Appointments      | `/(bookly)/appointments`             | ⚠️ Partial | Mock bookings                     | `BookingService.getUserBookings()` exists; UI uses mock |

### Dashboard Pages

| Page               | Route                           | API Status | Mock Fallback               | Notes                                                                 |
| ------------------ | ------------------------------- | ---------- | --------------------------- | --------------------------------------------------------------------- |
| Dashboard overview | `/apps/bookly`                  | ⚠️ Partial | Revenue/performance widgets | Bookings + reviews from API; 4 widgets still mock                     |
| Calendar           | `/apps/bookly/calendar`         | ✅ Wired   | Staff colors auto-generated | Full CRUD via `BookingService` + `StaffService` + `SchedulingService` |
| Bookings table     | `/apps/bookly/bookings`         | ✅ Wired   | —                           | Filters + status actions all wired                                    |
| Staff Management   | `/apps/bookly/staff-management` | ⚠️ Partial | Most tabs use mock          | Staff Members tab wired; Shifts/Resources/Rooms/Commissions use mock  |
| Reviews            | `/apps/bookly/reviews`          | ✅ Wired   | —                           | List + reply + flag all wired                                         |
| Settings           | `/apps/bookly/settings`         | ⚠️ Partial | localStorage fallback       | API may 404; store falls back to local persistence                    |
| Categories         | `/apps/bookly/categories`       | ✅ Wired   | —                           | Read-only from `CategoriesService`                                    |
| Media              | `/apps/bookly/media`            | ✅ Wired   | —                           | Upload + list + delete via `MediaService`                             |

### Staff Management Sub-Tabs

| Tab           | API Wired    | Service Used                                             | Notes                                |
| ------------- | ------------ | -------------------------------------------------------- | ------------------------------------ |
| Staff Members | ✅ Yes       | `StaffService`                                           | CRUD wired to API with mock fallback |
| Shifts        | ❌ Mock only | `SchedulingService` (exists, not wired)                  | Service exists, UI uses mock data    |
| Resources     | ❌ Mock only | `AssetsService` (exists, not wired)                      | Service exists, UI uses mock data    |
| Rooms         | ❌ Mock only | `AssetsService` + `SchedulingService` (exist, not wired) | Service exists, UI uses mock data    |
| Commissions   | ❌ Mock only | `CommissionsService` (exists, not wired)                 | Service exists, UI uses mock data    |

### Dashboard Widgets

| Widget             | Data Source                       | Notes                                          |
| ------------------ | --------------------------------- | ---------------------------------------------- |
| `BooklyStats`      | ✅ API (counts from fetched data) | Computed from bookings/services/branches/staff |
| `UpcomingBookings` | ✅ API                            | From `BookingService.getBusinessBookings()`    |
| `RecentReviews`    | ✅ API                            | From `ReviewsService.getReviews()`             |
| `RevenueOverview`  | ❌ Mock                           | No analytics endpoint                          |
| `TopServices`      | ❌ Mock                           | No analytics endpoint                          |
| `StaffPerformance` | ❌ Mock                           | No analytics endpoint                          |
| `ClientsActivity`  | ❌ Mock                           | No analytics endpoint                          |

---

## API Client Architecture

```
Frontend Component
    ↓ calls
Service Wrapper (src/lib/api/services/*.service.ts)
    ↓ calls
apiClient (src/lib/api/api-client.ts)
    ↓ fetch()
Next.js Proxy Route (/api/proxy/*)
    ↓ proxies to
Backend API (http://46.101.97.43 or localhost:5051)
```

**Response wrapper:** All service methods return `ApiResponse<T>`:

```typescript
interface ApiResponse<T = any> {
  data?: T; // success — parsed JSON
  error?: string; // failure — error message
}
```

**Auth:** JWT token stored in `localStorage('auth_token')` and set via `apiClient.setAuthToken(token)`. Automatically attached as `Authorization: Bearer {token}` header.

**401 handling:** On 401 response, `api-client.ts` auto-logs out the current user (customer or business admin) and redirects to login page.

---

## Error Response Format

All backend errors follow this structure:

```json
{
  "statusCode": 401,
  "path": "/auth/login",
  "timestamp": "2026-02-12T05:47:44.066Z",
  "message": "Invalid email or password"
}
```

Common status codes:

- `400` — Invalid request body / missing fields
- `401` — Invalid credentials / expired token
- `403` — Insufficient permissions
- `404` — Resource not found
- `500` — Server error (often missing required query params like `page`/`pageSize`)
