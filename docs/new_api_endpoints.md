# New API Endpoints

This document lists the newly implemented API endpoints for the Bookly platform, covering Guest Bookings, Rescheduling, Customer Reviews, Business Settings, Enhanced Admin Bookings, Commissions, Admin Reviews, Asset Assignments, Notifications, and Schedule Management.

**Base URL:** `http://localhost:5051`

---

## Guest Booking

### POST `/bookings/guest`

Create a booking as a guest (no authentication required).

**Request Body:**

```json
{
  "serviceId": "service-uuid",
  "branchId": "branch-uuid",
  "resourceId": "resource-uuid",
  "startTime": "2026-02-20T10:00:00.000Z",
  "notes": "First time customer",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+201234567890"
}
```

**Response:** `201 Created`

```json
{
  "id": "booking-uuid",
  "serviceId": "service-uuid",
  "branchId": "branch-uuid",
  "resourceId": "resource-uuid",
  "startTime": "2026-02-20T10:00:00.000Z",
  "endTime": "2026-02-20T11:00:00.000Z",
  "status": "PENDING",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+201234567890",
  "bookedBy": "guest"
}
```

**Notes:**

- No auth required — guest customers provide their name, email, and phone
- `resourceId` is optional — auto-assigned if not provided
- `userId` will be null on guest bookings

---

## Booking Reschedule

### PATCH `/bookings/{id}/reschedule` 🔒 (USER)

Reschedule own booking to a new time slot.

**Request Body:**

```json
{
  "startTime": "2026-02-21T14:00:00.000Z",
  "resourceId": "resource-uuid"
}
```

**Notes:**

- `resourceId` is optional — keeps current resource if omitted
- Validates availability of the new time slot
- Only the booking owner can reschedule

### PATCH `/admin/bookings/{id}/reschedule` 🔒 (ADMIN)

Admin reschedule any booking within the business.

**Request Body:** Same as above.

---

## User Bookings (Enhanced)

### GET `/bookings` 🔒 (USER)

Get bookings for the authenticated user.

**Query Parameters:**

- `status` (optional): Filter by status — `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`

**Example:** `GET /bookings?status=CONFIRMED`

---

## Customer Reviews

### GET `/reviews`

Get reviews for a business (public, no auth required).

**Query Parameters:**

- `businessId` (required): Business UUID

**Response:** `200 OK`

```json
[
  {
    "id": "review-uuid",
    "rating": 5,
    "comment": "Great experience!",
    "createdAt": "2026-02-18T10:00:00.000Z",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "profilePhoto": null
    }
  }
]
```

### POST `/reviews` 🔒 (USER)

Create a review for a business. Requires a completed booking.

**Request Body:**

```json
{
  "businessId": "business-uuid",
  "rating": 5,
  "comment": "Excellent service!"
}
```

**Notes:**

- Rating must be between 1 and 5
- User must have a completed booking with the business
- Duplicate reviews are prevented
- Business average rating is auto-updated

---

## Admin Bookings (Enhanced)

### GET `/admin/bookings` 🔒 (ADMIN)

Get business bookings with advanced filtering and pagination.

**Query Parameters:**

| Param       | Type   | Description                       |
| ----------- | ------ | --------------------------------- |
| `date`      | string | Single date `YYYY-MM-DD`          |
| `fromDate`  | string | Range start `YYYY-MM-DD`          |
| `toDate`    | string | Range end `YYYY-MM-DD`            |
| `staffId`   | string | Filter by staff resource          |
| `status`    | string | Filter by status                  |
| `page`      | number | Page number (default: 1)          |
| `pageSize`  | number | Items per page (default: 50)      |
| `sortBy`    | string | Sort field (default: `startTime`) |
| `sortOrder` | string | `asc` or `desc` (default: `desc`) |

**Response:** `200 OK`

```json
{
  "data": [...bookings],
  "total": 42,
  "page": 1,
  "pageSize": 50
}
```

**Notes:**

- `fromDate`/`toDate` takes priority over `date` when both are provided
- Response includes pagination metadata

---

## Schedule Update

### PATCH `/admin/scheduling/schedules/{id}` 🔒 (ADMIN)

Update an existing schedule entry.

**Request Body:**

```json
{
  "dayOfWeek": 2,
  "startTime": "10:00",
  "endTime": "18:00"
}
```

**Notes:**

- All fields are optional (partial update)
- Validates admin ownership of the schedule

---

## Business Settings

### GET `/admin/settings` 🔒 (ADMIN)

Get business settings. Returns defaults if none saved yet.

**Response:** `200 OK`

```json
{
  "businessId": "business-uuid",
  "bookingPolicies": {},
  "paymentSettings": {},
  "notificationSettings": {},
  "schedulingSettings": {},
  "customerSettings": {}
}
```

### PATCH `/admin/settings` 🔒 (ADMIN)

Create or update business settings. Uses upsert — creates on first call, updates thereafter.

**Request Body:**

```json
{
  "bookingPolicies": { "advanceBookingDays": 30, "cancellationHours": 24 },
  "paymentSettings": { "requirePayment": false },
  "notificationSettings": { "emailEnabled": true, "smsEnabled": false }
}
```

---

## Dashboard Stats

### GET `/admin/dashboard/stats` 🔒 (ADMIN)

Get aggregated metrics for the dashboard widgets.

**Response:** `200 OK`

```json
{
  "upcomingBookings": 5,
  "completedBookings": 20,
  "revenue": 2500,
  "averageRating": 4.9,
  "totalReviews": 15
}
```

---

## Commissions (Admin)

### GET `/admin/commissions` 🔒

Get all commissions for the business.

### POST `/admin/commissions` 🔒

Create a new commission.

**Request Body:**

```json
{
  "serviceId": "service-uuid",
  "resourceId": "staff-uuid",
  "percentage": 10
}
```

### DELETE `/admin/commissions/{id}` 🔒

Delete a commission.

---

## Admin Reviews

### GET `/admin/reviews` 🔒

Get all reviews for the business.

### POST `/admin/reviews/{id}/reply` 🔒

Reply to a user review.

**Request Body:**

```json
{
  "reply": "Thank you for your feedback!"
}
```

### POST `/admin/reviews/{id}/flag` 🔒

Flag a review for moderation.

**Request Body:**

```json
{
  "reason": "Inappropriate content"
}
```

---

## Asset Assignments

### GET `/admin/scheduling/assignments` 🔒

Get all resource assignments (Room allocations).
Optional query: `?date=YYYY-MM-DD`

### POST `/admin/scheduling/assignments` 🔒

Assign a staff member to a room/asset.

**Request Body:**

```json
{
  "staffId": "staff-uuid",
  "assetId": "room-uuid",
  "startTime": "09:00",
  "endTime": "17:00",
  "dayOfWeek": 1
}
```

### DELETE `/admin/scheduling/assignments/{id}` 🔒

Remove an assignment.

---

## Notifications

### GET `/notifications` 🔒

Get all notifications for the authenticated user (or business if admin).

### PATCH `/notifications/{id}/read` 🔒

Mark a notification as read.
