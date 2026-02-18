# Verification Data & Responses

This document outlines the sample data used to verify the full system flow and the corresponding successful responses observed.

## 1. Business Registration

**Endpoint:** `POST /business/register`

### Request Payload

```json
{
  "name": "Spa {unique_timestamp}",
  "email": "spa{unique_timestamp}@test.com",
  "description": "Test Spa",
  "socialLinks": [],
  "owner": {
    "name": "Admin {unique_timestamp}",
    "email": "admin{unique_timestamp}@test.com",
    "password": "password123"
  }
}
```

### Response (201 Created)

```json
{
  "id": "cmlpshl9j0000gp6lx3c4m9bq",
  "name": "Spa 1739747512345",
  "email": "spa1739747512345@test.com",
  "admins": [
    {
      "id": "...",
      "email": "admin1739747512345@test.com",
      "verificationToken": "123456" // Used for next step
    }
  ]
}
```

---

## 2. Admin Verification

**Endpoint:** `POST /admin/auth/verify`

### Request Payload

```json
{
  "email": "admin{unique_timestamp}@test.com",
  "code": "{verificationToken_from_registration}"
}
```

### Response (201 Created)

- **Status:** 201 Created
- **Body:** `{}` (Empty success response)

---

## 3. Admin Login

**Endpoint:** `POST /admin/auth/login`

### Request Payload

```json
{
  "email": "admin{unique_timestamp}@test.com",
  "password": "password123"
}
```

### Response (201 Created)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 4. Create Branch

**Endpoint:** `POST /admin/branches`

### Request Payload

```json
{
  "name": "Main Branch",
  "address": "123 Main St",
  "mobile": "+20{unique_digits}"
}
```

### Response (201 Created)

```json
{
  "id": "cmlpshld20003gp6l1i6b9e6z",
  "name": "Main Branch",
  "address": "123 Main St",
  "mobile": "+2012345678",
  "businessId": "..."
}
```

---

## 5. Create Service

**Endpoint:** `POST /admin/services`

### Request Payload

```json
{
  "name": "Dynamic Massage",
  "description": "Test Service",
  "price": 100,
  "duration": 60,
  "location": "Room 1",
  "maxConcurrent": 1,
  "branchIds": ["{branchId}"]
}
```

### Response (201 Created)

```json
{
  "id": "cmlpshld90005gp6lf9gtig01",
  "name": "Dynamic Massage",
  "price": 100,
  "duration": 60
}
```

---

## 6. Create Staff & Asset

### Staff Creation

**Endpoint:** `POST /admin/staff`
**Payload:**

```json
{
  "name": "John Dynamic",
  "email": "john{unique_timestamp}@test.com",
  "mobile": "+21{unique_digits}",
  "type": "STAFF",
  "branchId": "{branchId}",
  "serviceIds": ["{serviceId}"]
}
```

**Response (201 Created):**

```json
{
  "id": "cmlpshldf0007gp6lfmcgz6kf",
  "name": "John Dynamic",
  "type": "STAFF"
}
```

### Asset Creation

**Endpoint:** `POST /admin/assets`
**Payload:**

```json
{
  "name": "Room 101",
  "description": "Luxury Room",
  "type": "ASSET",
  "branchId": "{branchId}",
  "serviceIds": ["{serviceId}"]
}
```

**Response (201 Created):**

```json
{
  "id": "cmlpshldl0009gp6lc13scv5a",
  "name": "Room 101",
  "type": "ASSET"
}
```

---

## 7. Scheduling

**Endpoint:** `POST /admin/scheduling/schedules`

### Staff Schedule

**Payload:**

```json
{
  "resourceId": "{staffId}",
  "dayOfWeek": 3, // Wednesday
  "startTime": "00:00",
  "endTime": "23:59"
}
```

### Asset Schedule

**Payload:**

```json
{
  "resourceId": "{assetId}",
  "dayOfWeek": 3, // Wednesday
  "startTime": "00:00",
  "endTime": "23:59"
}
```

---

## 8. Asset Assignment

**Endpoint:** `POST /admin/scheduling/assignments`

### Request Payload

```json
{
  "staffId": "{staffId}",
  "assetId": "{assetId}",
  "dayOfWeek": 3, // Wednesday
  "startTime": "00:00",
  "endTime": "23:59"
}
```

### Response (201 Created)

```json
{
  "id": "cmlpshlel000fgp6lh810idzy",
  "staffId": "...",
  "assetId": "..."
}
```

---

## 9. User Registration & Login

**Endpoint:** `POST /auth/register`
**Payload:**

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "user{unique_timestamp}@test.com",
  "password": "password123",
  "mobile": "+22{unique_digits}"
}
```

**Endpoint:** `POST /auth/login`
**Response:** Returns User JWT Token.

---

## 10. Availability & Booking

### Check Availability

**Endpoint:** `GET /bookings/availability`
**Query Params:** `serviceId={serviceId}&branchId={branchId}&date={next_wednesday}`
**Response:**

```json
[
  {
    "startTime": "2026-02-18T00:00:00.000Z",
    "endTime": "2026-02-18T01:00:00.000Z",
    "resourceId": "{staffId}"
  },
  ... (92 slots total)
]
```

### Create Booking

**Endpoint:** `POST /bookings`
**Payload:**

```json
{
  "serviceId": "{serviceId}",
  "branchId": "{branchId}",
  "resourceId": "{staffId}",
  "startTime": "2026-02-18T00:00:00.000Z",
  "notes": "Verified Booking"
}
```

**Response (201 Created):**

```json
{
  "id": "cmlpshljk000igp6l2034zsyv",
  "status": "PENDING",
  "startTime": "2026-02-18T00:00:00.000Z"
}
```

### Double Booking Attempt (Fail Check)

**Payload:** Same as above for same slot.
**Response:** `400 Bad Request` - "The requested time slot is not available"

### User Cancellation

**Endpoint:** `PATCH /bookings/{bookingId}/cancel`
**Response:** `200 OK`
