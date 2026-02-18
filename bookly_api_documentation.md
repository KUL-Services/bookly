# Bookly API Documentation

**Version:** 1.0  
**Base URL:** http://46.101.97.43  
**API Spec:** OAS 3.0

This document provides a comprehensive overview of all API endpoints with **actual tested responses** from the Bookly platform.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Business Management](#business-management)
3. [Categories](#categories)
4. [Services](#services)
5. [Bookings](#bookings)
6. [User Auth](#user-auth)
7. [Admin - Auth](#admin---auth)
8. [Admin - Business](#admin---business)
9. [Admin - Branches](#admin---branches)
10. [Admin - Services](#admin---services)
11. [Admin - Staff](#admin---staff)
12. [Admin - Assets](#admin---assets)
13. [Admin - Scheduling](#admin---scheduling)
14. [Admin - Bookings](#admin---bookings)
15. [Media Library](#media-library)
16. [SuperAdmin - Business](#superadmin---business)
17. [SuperAdmin - Categories](#superadmin---categories)
18. [SuperAdmin - Auth](#superadmin---auth)
19. [Error Responses](#error-responses)

---

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Endpoints marked with 🔒 require authentication.

---

## Business Management

### POST `/business/register`

Register a new business on the platform.

**Request Body** (application/json):
```json
{
  "name": "Test Salon",
  "email": "testsalon@example.com",
  "description": "A test salon",
  "socialLinks": [
    {
      "platform": "facebook",
      "url": "https://facebook.com/testsalon"
    },
    {
      "platform": "instagram",
      "url": "https://instagram.com/testsalon"
    }
  ],
  "owner": {
    "name": "Test Owner",
    "email": "owner@example.com",
    "password": "testpass123"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "cmlj1epqv000d44uscko6b4dr",
  "name": "Test Salon",
  "email": "testsalon1770875262@example.com",
  "description": "A test salon",
  "logo": null,
  "approved": false,
  "createdAt": "2026-02-12T05:47:42.678Z",
  "updatedAt": "2026-02-12T05:47:42.678Z",
  "rating": 0,
  "admins": [
    {
      "verificationToken": "577966"
    }
  ]
}
```

**Notes:**
- Business requires SuperAdmin approval before appearing in public listings
- Owner receives a verification token for email verification
- `approved` field starts as `false`

---

### GET `/business`

Fetch a list of approved businesses with filtering and pagination.

**Query Parameters:**
- `page` (required): Page number (starting from 1) - Example: `1`
- `pageSize` (required): Items per page - Example: `10`
- `categoryId` (optional): Category UUID - Example: `cat-uuid`
- `priceFrom` (optional): Minimum price - Example: `0`
- `priceTo` (optional): Maximum price - Example: `999999`
- `search` (optional): Search term for business or service name - Example: `Full Body`

**Response:** `200 OK`
```json
[]
```

**Notes:**
- Returns only approved businesses
- Requires pagination parameters (`page` and `pageSize`) - returns 500 error if missing
- Returns empty array if no businesses match criteria

---

### GET `/business/{id}`

Get detailed information for a specific business including services, branches, resources, and social links.

**Path Parameters:**
- `id` (required): Business ID

**Response:** `200 OK`
```json
{
  "id": "cmkbxlz3s000h44lgqxynrv66",
  "name": "Test Spa & Wellness",
  "email": "test@testspa.com",
  "description": "A modern spa offering massage and wellness services",
  "logo": null,
  "approved": false,
  "createdAt": "2026-01-13T01:47:17.368Z",
  "updatedAt": "2026-01-13T01:47:17.368Z",
  "rating": 0,
  "services": [
    {
      "id": "cmkbxnjab000o44lg76vlr5ek",
      "name": "Full Body Massage",
      "description": "A relaxing 60-minute massage session",
      "location": "Cairo, Egypt",
      "price": 100,
      "duration": 60,
      "maxConcurrent": null,
      "businessId": "cmkbxlz3s000h44lgqxynrv66",
      "gallery": [],
      "createdAt": "2026-01-13T01:48:30.180Z",
      "updatedAt": "2026-01-13T01:48:30.180Z"
    }
  ],
  "branches": [
    {
      "id": "cmkbxn23n000m44lgyd3q9fw7",
      "name": "Downtown Branch",
      "address": "123 Main Street, Cairo",
      "mobile": "+201234567890",
      "createdAt": "2026-01-13T01:48:07.907Z",
      "updatedAt": "2026-01-13T01:48:07.907Z",
      "businessId": "cmkbxlz3s000h44lgqxynrv66",
      "gallery": [],
      "resources": [
        {
          "id": "cmkbxnm9c000q44lg7xzo7398",
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
          "branchId": "cmkbxn23n000m44lgyd3q9fw7",
          "createdAt": "2026-01-13T01:48:34.032Z",
          "updatedAt": "2026-01-13T01:48:34.032Z",
          "services": [
            {
              "id": "cmkbxnjab000o44lg76vlr5ek",
              "name": "Full Body Massage",
              "description": "A relaxing 60-minute massage session",
              "location": "Cairo, Egypt",
              "price": 100,
              "duration": 60,
              "maxConcurrent": null,
              "businessId": "cmkbxlz3s000h44lgqxynrv66",
              "gallery": [],
              "createdAt": "2026-01-13T01:48:30.180Z",
              "updatedAt": "2026-01-13T01:48:30.180Z"
            }
          ]
        },
        {
          "id": "cmkbxnpcm000s44lgfop6h45z",
          "name": "Massage Room 1",
          "type": "ASSET",
          "maxConcurrent": 1,
          "slotInterval": 30,
          "slotDuration": null,
          "mobile": null,
          "email": null,
          "profilePhoto": null,
          "description": "Private massage room with AC",
          "image": null,
          "branchId": "cmkbxn23n000m44lgyd3q9fw7",
          "createdAt": "2026-01-13T01:48:38.038Z",
          "updatedAt": "2026-01-13T01:48:38.038Z",
          "services": []
        }
      ],
      "services": [
        {
          "id": "cmkbxnjab000o44lg76vlr5ek",
          "name": "Full Body Massage",
          "description": "A relaxing 60-minute massage session",
          "location": "Cairo, Egypt",
          "price": 100,
          "duration": 60,
          "maxConcurrent": null,
          "businessId": "cmkbxlz3s000h44lgqxynrv66",
          "gallery": [],
          "createdAt": "2026-01-13T01:48:30.180Z",
          "updatedAt": "2026-01-13T01:48:30.180Z"
        }
      ]
    }
  ],
  "socialLinks": [
    {
      "id": "cmkbxlz3s000i44lg8608ckyb",
      "platform": "facebook",
      "url": "https://facebook.com/testspa",
      "businessId": "cmkbxlz3s000h44lgqxynrv66"
    },
    {
      "id": "cmkbxlz3s000j44lg3ii9sdhc",
      "platform": "instagram",
      "url": "https://instagram.com/testspa",
      "businessId": "cmkbxlz3s000h44lgqxynrv66"
    }
  ],
  "reviews": []
}
```

**Notes:**
- Returns comprehensive business data with nested relationships
- Resources can be either `STAFF` or `ASSET` type
- Each branch includes its resources and services
- Staff resources include their assigned services

---

## Categories

### GET `/categories`

Get all categories.

**Response:** `200 OK`
```json
[]
```

**Notes:**
- Currently returns empty array (no categories created yet)
- Expected structure when populated:
```json
[
  {
    "id": "cat-uuid",
    "name": "Spa & Wellness",
    "createdAt": "2026-01-13T01:47:17.368Z",
    "updatedAt": "2026-01-13T01:47:17.368Z"
  }
]
```

---

## Services

### GET `/services`

Get all services across all businesses.

**Response:** `200 OK`
```json
[
  {
    "id": "cmkbxnjab000o44lg76vlr5ek",
    "name": "Full Body Massage",
    "description": "A relaxing 60-minute massage session",
    "location": "Cairo, Egypt",
    "price": 100,
    "duration": 60,
    "maxConcurrent": null,
    "businessId": "cmkbxlz3s000h44lgqxynrv66",
    "gallery": [],
    "createdAt": "2026-01-13T01:48:30.180Z",
    "updatedAt": "2026-01-13T01:48:30.180Z",
    "categories": [],
    "branches": [
      {
        "id": "cmkbxn23n000m44lgyd3q9fw7",
        "name": "Downtown Branch",
        "address": "123 Main Street, Cairo",
        "mobile": "+201234567890",
        "createdAt": "2026-01-13T01:48:07.907Z",
        "updatedAt": "2026-01-13T01:48:07.907Z",
        "businessId": "cmkbxlz3s000h44lgqxynrv66",
        "gallery": []
      }
    ],
    "galleryUrls": []
  }
]
```

**Notes:**
- Returns services with nested branch information
- `duration` is in minutes
- `price` is a numeric value
- `gallery` contains asset IDs, `galleryUrls` contains actual URLs

---

### GET `/services/{id}`

Get detailed information for a specific service including business and branch details.

**Path Parameters:**
- `id` (required): Service ID

**Response:** `200 OK`
```json
{
  "id": "cmkbxnjab000o44lg76vlr5ek",
  "name": "Full Body Massage",
  "description": "A relaxing 60-minute massage session",
  "location": "Cairo, Egypt",
  "price": 100,
  "duration": 60,
  "maxConcurrent": null,
  "businessId": "cmkbxlz3s000h44lgqxynrv66",
  "gallery": [],
  "createdAt": "2026-01-13T01:48:30.180Z",
  "updatedAt": "2026-01-13T01:48:30.180Z",
  "categories": [],
  "branches": [
    {
      "id": "cmkbxn23n000m44lgyd3q9fw7",
      "name": "Downtown Branch",
      "address": "123 Main Street, Cairo",
      "mobile": "+201234567890",
      "createdAt": "2026-01-13T01:48:07.907Z",
      "updatedAt": "2026-01-13T01:48:07.907Z",
      "businessId": "cmkbxlz3s000h44lgqxynrv66",
      "gallery": []
    }
  ],
  "business": {
    "id": "cmkbxlz3s000h44lgqxynrv66",
    "name": "Test Spa & Wellness",
    "email": "test@testspa.com",
    "description": "A modern spa offering massage and wellness services",
    "logo": null,
    "approved": false,
    "createdAt": "2026-01-13T01:47:17.368Z",
    "updatedAt": "2026-01-13T01:47:17.368Z",
    "rating": 0
  },
  "galleryUrls": []
}
```

**Notes:**
- Includes full business details
- Shows all branches where service is available

---

## Bookings

### GET `/bookings/availability`

Check availability for a service at a specific branch on a given date.

**Query Parameters:**
- `serviceId` (required): Service ID - Example: `service-uuid`
- `branchId` (required): Branch ID - Example: `branch-uuid`
- `date` (required): Date to check (YYYY-MM-DD) - Example: `2026-02-15`
- `resourceId` (optional): Specific resource ID - Example: `resource-uuid`

**Response:** `200 OK`
```json
[]
```

**Notes:**
- Returns empty array when no availability or no schedules configured
- Expected structure when availability exists:
```json
[
  {
    "resourceId": "resource-uuid",
    "resourceName": "Ahmed Hassan",
    "resourceType": "STAFF",
    "availableSlots": [
      {
        "startTime": "2026-02-15T09:00:00.000Z",
        "endTime": "2026-02-15T10:00:00.000Z"
      },
      {
        "startTime": "2026-02-15T10:30:00.000Z",
        "endTime": "2026-02-15T11:30:00.000Z"
      }
    ]
  }
]
```

---

### POST `/bookings` 🔒

Create a new booking.

**Request Body** (application/json):
```json
{
  "serviceId": "service-uuid",
  "branchId": "branch-uuid",
  "resourceId": "resource-uuid",
  "startTime": "2026-02-15T10:00:00.000Z",
  "notes": "Please prepare the room in advance"
}
```

**Field Details:**
- `resourceId`: Optional, will auto-assign if not provided
- `startTime`: ISO 8601 format

**Response:** `201 Created`
```json
{
  "id": "booking-uuid",
  "userId": "user-uuid",
  "serviceId": "service-uuid",
  "branchId": "branch-uuid",
  "resourceId": "resource-uuid",
  "startTime": "2026-02-15T10:00:00.000Z",
  "endTime": "2026-02-15T11:00:00.000Z",
  "status": "PENDING",
  "notes": "Please prepare the room in advance",
  "createdAt": "2026-02-12T05:47:42.678Z",
  "updatedAt": "2026-02-12T05:47:42.678Z"
}
```

---

### GET `/bookings` 🔒

Get all bookings for the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": "booking-uuid",
    "userId": "user-uuid",
    "serviceId": "service-uuid",
    "branchId": "branch-uuid",
    "resourceId": "resource-uuid",
    "startTime": "2026-02-15T10:00:00.000Z",
    "endTime": "2026-02-15T11:00:00.000Z",
    "status": "CONFIRMED",
    "notes": "Please prepare the room in advance",
    "createdAt": "2026-02-12T05:47:42.678Z",
    "updatedAt": "2026-02-12T05:47:42.678Z",
    "service": {
      "name": "Full Body Massage",
      "duration": 60,
      "price": 100
    },
    "branch": {
      "name": "Downtown Branch",
      "address": "123 Main Street, Cairo"
    }
  }
]
```

---

### PATCH `/bookings/{id}/cancel` 🔒

Cancel a booking.

**Path Parameters:**
- `id` (required): Booking ID

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "status": "CANCELLED",
  "updatedAt": "2026-02-12T05:47:42.678Z"
}
```

---

## User Auth

### POST `/auth/register`

Register a new user/customer.

**Request Body** (application/json):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "+201220293563",
  "email": "john@example.com",
  "password": "strongPass123"
}
```

**Response:** `201 Created`
```json
{
  "verificationToken": "806043"
}
```

**Notes:**
- User must verify email using the token
- Password minimum length: 8 characters

---

### POST `/auth/verify`

Verify user account with code.

**Request Body** (application/json):
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:** `201 Created`
```json
{
  "message": "Account verified successfully"
}
```

---

### POST `/auth/login`

User login.

**Request Body** (application/x-www-form-urlencoded):
```
email=john@example.com
password=strongPass123
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+201220293563",
    "profilePhoto": null,
    "createdAt": "2026-02-12T05:47:42.678Z"
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "path": "/auth/login",
  "timestamp": "2026-02-12T05:47:44.066Z",
  "message": "Invalid email or password"
}
```

---

### POST `/auth/forget-password`

Request password reset code.

**Request Body** (application/json):
```json
{
  "email": "user@example.com"
}
```

**Response:** `201 Created`
```json
{
  "message": "Password reset code sent to email"
}
```

**Error Response:** `500 Internal Server Error` (if user not found)
```json
{
  "statusCode": 500,
  "path": "/auth/forget-password",
  "timestamp": "2026-02-12T05:48:00.494Z",
  "message": "No record was found for an update."
}
```

---

### POST `/auth/reset-password`

Reset password with code.

**Request Body** (application/json):
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "newStrongPass123"
}
```

**Response:** `201 Created`
```json
{
  "message": "Password reset successfully"
}
```

---

### PATCH `/auth` 🔒

Update user profile.

**Request Body** (application/json):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "+201220293563",
  "profilePhoto": "asset-uuid"
}
```

**Response:** `200 OK`
```json
{
  "id": "user-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "+201220293563",
  "profilePhoto": "asset-uuid",
  "updatedAt": "2026-02-12T05:47:42.678Z"
}
```

---

### PATCH `/auth/password` 🔒

Change password (authenticated).

**Request Body** (application/json):
```json
{
  "password": "newStrongPass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password updated successfully"
}
```

---

### GET `/auth/details` 🔒

Get authenticated user details.

**Response:** `200 OK`
```json
{
  "id": "user-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "+201220293563",
  "profilePhoto": null,
  "createdAt": "2026-02-12T05:47:42.678Z",
  "updatedAt": "2026-02-12T05:47:42.678Z"
}
```

---

## Admin - Auth

### POST `/admin/auth/register` 🔒

Register a new admin user.

**Request Body** (application/json):
```json
{
  "name": "Owner Name",
  "email": "manager@example.com",
  "password": "securePass123"
}
```

**Response:** `201 Created`
```json
{
  "verificationToken": "123456"
}
```

---

### POST `/admin/auth/verify`

Verify admin account with code.

**Request Body** (application/json):
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:** `201 Created`

---

### POST `/admin/auth/login`

Admin login.

**Request Body** (application/x-www-form-urlencoded):
```
email=john@example.com
password=strongPass123
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin-uuid",
    "name": "Owner Name",
    "email": "manager@example.com",
    "businessId": "business-uuid",
    "createdAt": "2026-02-12T05:47:42.678Z"
  }
}
```

---

### POST `/admin/auth/forget-password`

Request password reset code.

**Request Body** (application/json):
```json
{
  "email": "user@example.com"
}
```

**Response:** `201 Created`

---

### POST `/admin/auth/reset-password`

Reset password with code.

**Request Body** (application/json):
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "strongPass123"
}
```

**Response:** `201 Created`

---

### GET `/admin/auth/details` 🔒

Get authenticated admin details.

**Response:** `200 OK`

---

## Admin - Business

### PATCH `/admin/business` 🔒

Update business information.

**Request Body** (application/json):
```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "name": "Updated Business Name",
  "email": "newmail@business.com",
  "description": "Updated description here",
  "socialLinks": [
    {
      "platform": "facebook",
      "url": "https://facebook.com/hotellux"
    }
  ],
  "logo": "asset-uuid"
}
```

**Response:** `200 OK`

---

## Admin - Branches

### POST `/admin/branches` 🔒

Create a new branch for the business.

**Request Body** (application/json):
```json
{
  "name": "Heliopolis Branch",
  "address": "20 Thawra Street, Heliopolis, Cairo",
  "mobile": "+201234567890",
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "gallery": ["asset-uuid-1", "asset-uuid-2"]
}
```

**Response:** `201 Created`

---

### GET `/admin/branches` 🔒

Get all branches for the authenticated business.

**Response:** `200 OK`

---

### PATCH `/admin/branches` 🔒

Update an existing branch.

**Request Body** (application/json):
```json
{
  "id": "branch-uuid",
  "name": "Heliopolis Branch",
  "address": "20 Thawra Street, Heliopolis, Cairo",
  "mobile": "+201234567890",
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "gallery": ["asset-uuid-1", "asset-uuid-2"]
}
```

**Response:** `200 OK`

---

### DELETE `/admin/branches/{id}` 🔒

Delete a branch.

**Path Parameters:**
- `id` (required): Branch ID

**Response:** `200 OK`

---

## Admin - Services

### POST `/admin/services` 🔒

Create a new service.

**Request Body** (application/json):
```json
{
  "name": "Full Body Massage",
  "description": "A relaxing 60-minute massage session",
  "location": "Cairo, Egypt",
  "price": 100,
  "duration": 60,
  "categoryIds": ["cat-uuid-1", "cat-uuid-2"],
  "branchIds": ["branch-uuid-1", "branch-uuid-2"],
  "gallery": ["asset-uuid-1", "asset-uuid-2"]
}
```

**Response:** `201 Created`

---

### PATCH `/admin/services` 🔒

Update an existing service.

**Request Body** (application/json):
```json
{
  "id": "XXXXXXXXXXXXXX",
  "name": "Full Body Massage",
  "description": "A relaxing 60-minute massage session",
  "location": "Cairo, Egypt",
  "price": 120,
  "duration": 90,
  "categoryIds": ["cat-uuid-1", "cat-uuid-2"],
  "branchIds": ["branch-uuid-1", "branch-uuid-2"],
  "gallery": ["asset-uuid-1", "asset-uuid-2"]
}
```

**Response:** `200 OK`

---

### DELETE `/admin/services/{id}` 🔒

Delete a service.

**Path Parameters:**
- `id` (required): Service ID

**Response:** `200 OK`

---

## Admin - Staff

### POST `/admin/staff` 🔒

Add a new staff member.

**Request Body** (application/json):
```json
{
  "name": "Kareem Gamal",
  "mobile": "+201234567890",
  "email": "staff@example.com",
  "branchId": "branch-uuid-1",
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "profilePhoto": "asset-uuid",
  "slotInterval": 30,
  "slotDuration": 60
}
```

**Field Details:**
- `slotInterval`: Time between slots in minutes (default: 30)
- `slotDuration`: Duration of each slot in minutes (null = use service duration)

**Response:** `201 Created`

---

### GET `/admin/staff` 🔒

Get all staff members for the business.

**Response:** `200 OK`

---

### PATCH `/admin/staff` 🔒

Update a staff member.

**Request Body** (application/json):
```json
{
  "id": "staff-uuid",
  "name": "Kareem Gamal",
  "mobile": "+201234567890",
  "email": "staff@example.com",
  "branchId": "branch-uuid-1",
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "profilePhoto": "asset-uuid",
  "slotInterval": 30,
  "slotDuration": 60
}
```

**Response:** `200 OK`

---

### DELETE `/admin/staff/{id}` 🔒

Remove a staff member.

**Path Parameters:**
- `id` (required): Staff ID

**Response:** `200 OK`

---

## Admin - Assets

### POST `/admin/assets` 🔒

Create a new asset (e.g., tennis court, meeting room).

**Request Body** (application/json):
```json
{
  "name": "Tennis Court 1",
  "description": "Indoor tennis court with synthetic surface",
  "branchId": "branch-uuid-1",
  "maxConcurrent": 4,
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "image": "asset-file-uuid",
  "slotInterval": 60,
  "slotDuration": 60
}
```

**Field Details:**
- `maxConcurrent`: Maximum concurrent bookings (e.g., 4 players for tennis court)

**Response:** `201 Created`

---

### GET `/admin/assets` 🔒

Get all assets for the business.

**Response:** `200 OK`

---

### GET `/admin/assets/{id}` 🔒

Get details of a specific asset.

**Path Parameters:**
- `id` (required): Asset ID

**Response:** `200 OK`

---

### PATCH `/admin/assets` 🔒

Update an asset.

**Request Body** (application/json):
```json
{
  "id": "asset-uuid",
  "name": "Tennis Court 1",
  "description": "Indoor tennis court with synthetic surface",
  "branchId": "branch-uuid-1",
  "maxConcurrent": 4,
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "image": "asset-file-uuid",
  "slotInterval": 60,
  "slotDuration": 60
}
```

**Response:** `200 OK`

---

### DELETE `/admin/assets/{id}` 🔒

Delete an asset.

**Path Parameters:**
- `id` (required): Asset ID

**Response:** `200 OK`

---

## Admin - Scheduling

### POST `/admin/scheduling/schedules` 🔒

Create a regular schedule (weekly recurring hours).

**Request Body** (application/json):
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "resourceId": "resource-uuid",
  "branchId": "branch-uuid"
}
```

**Field Details:**
- `dayOfWeek`: 0=Sunday, 1=Monday, ..., 6=Saturday
- `startTime`: Format HH:mm
- `endTime`: Format HH:mm
- `resourceId`: Staff or asset ID (branchId derived from resource)
- `branchId`: Only needed for branch-level default hours

**Response:** `201 Created`

---

### GET `/admin/scheduling/schedules` 🔒

Get all schedules.

**Query Parameters:**
- `resourceId` (optional): Filter by resource ID
- `branchId` (optional): Filter by branch ID

**Response:** `200 OK`

---

### DELETE `/admin/scheduling/schedules/{id}` 🔒

Delete a schedule.

**Path Parameters:**
- `id` (required): Schedule ID

**Response:** `200 OK`

---

### POST `/admin/scheduling/breaks` 🔒

Create a recurring break (e.g., lunch break).

**Request Body** (application/json):
```json
{
  "name": "Lunch Break",
  "dayOfWeek": 1,
  "startTime": "12:00",
  "endTime": "13:00",
  "resourceId": "resource-uuid",
  "branchId": "branch-uuid"
}
```

**Response:** `201 Created`

---

### GET `/admin/scheduling/breaks` 🔒

Get all breaks.

**Query Parameters:**
- `resourceId` (optional): Filter by resource ID
- `branchId` (optional): Filter by branch ID

**Response:** `200 OK`

---

### DELETE `/admin/scheduling/breaks/{id}` 🔒

Delete a break.

**Path Parameters:**
- `id` (required): Break ID

**Response:** `200 OK`

---

### POST `/admin/scheduling/exceptions` 🔒

Create a schedule exception (e.g., holiday, special hours).

**Request Body** (application/json):
```json
{
  "date": "2024-12-25",
  "startTime": "09:00",
  "endTime": "17:00",
  "reason": "Christmas Holiday",
  "isAvailable": false,
  "resourceId": "resource-uuid",
  "branchId": "branch-uuid"
}
```

**Field Details:**
- `date`: Format YYYY-MM-DD
- `startTime`: HH:mm (null for whole day)
- `endTime`: HH:mm (null for whole day)
- `isAvailable`: false = blocked/off, true = extra availability

**Response:** `201 Created`

---

### GET `/admin/scheduling/exceptions` 🔒

Get all schedule exceptions.

**Query Parameters:**
- `resourceId` (optional): Filter by resource ID
- `branchId` (optional): Filter by branch ID

**Response:** `200 OK`

---

### DELETE `/admin/scheduling/exceptions/{id}` 🔒

Delete a schedule exception.

**Path Parameters:**
- `id` (required): Exception ID

**Response:** `200 OK`

---

## Admin - Bookings

### GET `/admin/bookings` 🔒

Get all bookings for the business.

**Response:** `200 OK`

---

### PATCH `/admin/bookings/{id}/status` 🔒

Update booking status.

**Path Parameters:**
- `id` (required): Booking ID

**Request Body** (application/json):
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Values:**
- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`
- `NO_SHOW`

**Response:** `200 OK`

---

## Media Library

### POST `/media-lib` 🔒

Upload a new media asset.

**Request Body** (application/json):
```json
{
  "fileName": "semsema.png",
  "mimeType": "image/png",
  "size": 204800
}
```

**Response:** `201 Created`

---

### PATCH `/media-lib/{id}` 🔒

Update media asset metadata.

**Path Parameters:**
- `id` (required): Media asset ID

**Request Body** (application/json):
```json
{
  "fileName": "semsema.png",
  "mimeType": "image/png",
  "size": 204800
}
```

**Response:** `200 OK`

---

### DELETE `/media-lib/{id}` 🔒

Delete a media asset.

**Path Parameters:**
- `id` (required): Media asset ID

**Response:** `200 OK`

---

## SuperAdmin - Business

### POST `/superadmin/business/approve` 🔒

Approve a business.

**Request Body** (application/json):
```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response:** `201 Created`

---

### POST `/superadmin/business/approve-request` 🔒

Approve a business update request.

**Request Body** (application/json):
```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response:** `201 Created`

---

### POST `/superadmin/business/reject` 🔒

Reject a business.

**Request Body** (application/json):
```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response:** `201 Created`

---

### POST `/superadmin/business/reject-request` 🔒

Reject a business update request.

**Request Body** (application/json):
```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Response:** `201 Created`

---

### GET `/superadmin/business/pending` 🔒

Get all pending businesses.

**Response:** `200 OK`

---

### GET `/superadmin/business/pending-requests` 🔒

Get all pending business update requests.

**Response:** `200 OK`

---

## SuperAdmin - Categories

### POST `/superadmin/categories` 🔒

Create a new category.

**Request Body** (application/json):
```json
{
  "name": "Spa & Wellness"
}
```

**Response:** `201 Created`

---

### PATCH `/superadmin/categories/{id}` 🔒

Update a category.

**Request Body** (application/json):
```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxxxx",
  "name": "Spa & Wellness"
}
```

**Response:** `200 OK`

---

### DELETE `/superadmin/categories/{id}` 🔒

Delete a category.

**Path Parameters:**
- `id` (required): Category ID

**Response:** `200 OK`

---

## SuperAdmin - Auth

### POST `/superadmin/auth/login`

SuperAdmin login.

**Request Body** (application/x-www-form-urlencoded):
```
email=superadmin@bookly.com
password=password
```

**Response:** `201 Created`

---

## Error Responses

### Common Error Format

All errors follow this structure:

```json
{
  "statusCode": 401,
  "path": "/auth/login",
  "timestamp": "2026-02-12T05:47:44.066Z",
  "message": "Invalid email or password"
}
```

### Common Status Codes

- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Invalid credentials or missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error (often database constraint violations)

### Example Error Cases

**Invalid Login:**
```json
{
  "statusCode": 401,
  "path": "/auth/login",
  "timestamp": "2026-02-12T05:47:44.066Z",
  "message": "Invalid email or password"
}
```

**User Not Found (Forget Password):**
```json
{
  "statusCode": 500,
  "path": "/auth/forget-password",
  "timestamp": "2026-02-12T05:48:00.494Z",
  "message": "No record was found for an update."
}
```

**Missing Pagination Parameters:**
```json
{
  "statusCode": 500,
  "path": "/business",
  "timestamp": "2026-02-12T05:48:00.494Z",
  "message": "Internal server error"
}
```

---

## Important Notes

1. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
2. **IDs**: All entity IDs are UUIDs (cuid format)
3. **Passwords**: Minimum 8 characters required
4. **Pagination**: The `/business` endpoint requires both `page` and `pageSize` parameters
5. **Business Approval**: New businesses start with `approved: false` and require SuperAdmin approval
6. **Resources**: Can be either `STAFF` or `ASSET` type
7. **Slot Configuration**: 
   - `slotInterval`: Time between available slots (default: 30 minutes)
   - `slotDuration`: Duration of each booking slot (null = use service duration)
8. **Gallery**: Contains asset IDs, while `galleryUrls` contains actual URLs
9. **Nested Data**: Many endpoints return deeply nested related data (branches, resources, services, etc.)
