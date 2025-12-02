# Bookly Staff Management - Backend API Specification

**Version:** 1.0  
**Date:** December 2025  
**Purpose:** Complete API specification for backend implementation

---

## Table of Contents

1. [Business Hours Management](#1-business-hours-management)
2. [Staff Management](#2-staff-management)
3. [Staff Working Hours & Schedules](#3-staff-working-hours--schedules)
4. [Service Assignments (Staff)](#4-service-assignments-staff)
5. [Time Off Management](#5-time-off-management)
6. [Time Reservations](#6-time-reservations)
7. [Resources Management](#7-resources-management)
8. [Rooms Management (with Scheduling)](#8-rooms-management-with-scheduling)
9. [Commission Policies](#9-commission-policies)
10. [Bulk Operations](#10-bulk-operations)

---

## 1. Business Hours Management

**Purpose:** Manage business operating hours per day of week

### 1.1 Get Business Hours

```http
GET /api/v1/businesses/{businessId}/hours
```

**Response:**

```json
{
  "success": true,
  "data": {
    "businessId": "biz-123",
    "hours": {
      "Sun": {
        "isOpen": true,
        "shifts": [{ "start": "10:00", "end": "17:00" }]
      },
      "Mon": {
        "isOpen": true,
        "shifts": [{ "start": "09:00", "end": "19:00" }]
      },
      "Tue": {
        "isOpen": true,
        "shifts": [{ "start": "09:00", "end": "19:00" }]
      },
      "Wed": {
        "isOpen": false,
        "shifts": []
      },
      "Thu": {
        "isOpen": true,
        "shifts": [{ "start": "09:00", "end": "20:00" }]
      },
      "Fri": {
        "isOpen": true,
        "shifts": [{ "start": "09:00", "end": "20:00" }]
      },
      "Sat": {
        "isOpen": true,
        "shifts": [{ "start": "08:00", "end": "18:00" }]
      }
    }
  }
}
```

### 1.2 Update Business Hours (Single Day)

```http
PUT /api/v1/businesses/{businessId}/hours/{dayOfWeek}
```

**Request Body:**

```json
{
  "isOpen": true,
  "shifts": [
    { "start": "09:00", "end": "13:00" },
    { "start": "14:00", "end": "20:00" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Business hours updated for Monday",
  "data": {
    "dayOfWeek": "Mon",
    "isOpen": true,
    "shifts": [
      { "start": "09:00", "end": "13:00" },
      { "start": "14:00", "end": "20:00" }
    ]
  }
}
```

---

## 2. Staff Management

### 2.1 Get All Staff Members

```http
GET /api/v1/businesses/{businessId}/staff
```

**Query Parameters:**

- `branchId` (optional): Filter by branch
- `role` (optional): Filter by role (owner, manager, staff)
- `active` (optional): true/false

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "staff-1",
      "businessId": "biz-123",
      "name": "Emma Johnson",
      "email": "emma@example.com",
      "phone": "+1234567890",
      "role": "staff",
      "title": "Senior Hair Stylist",
      "photo": "https://example.com/photos/emma.jpg",
      "color": "#1976d2",
      "branchIds": ["branch-1", "branch-2"],
      "active": true,
      "type": "dynamic",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 7,
    "page": 1,
    "limit": 50
  }
}
```

### 2.2 Get Staff Member by ID

```http
GET /api/v1/businesses/{businessId}/staff/{staffId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "staff-1",
    "businessId": "biz-123",
    "name": "Emma Johnson",
    "email": "emma@example.com",
    "phone": "+1234567890",
    "role": "staff",
    "title": "Senior Hair Stylist",
    "photo": "https://example.com/photos/emma.jpg",
    "color": "#1976d2",
    "branchIds": ["branch-1"],
    "active": true,
    "type": "dynamic",
    "serviceIds": ["service-1", "service-2"],
    "workingHours": {
      "Sun": { "isWorking": false, "shifts": [] },
      "Mon": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-1",
            "start": "09:00",
            "end": "17:00",
            "breaks": [{ "id": "break-1", "start": "12:00", "end": "13:00" }]
          }
        ]
      }
      // ... other days
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-12-01T00:00:00Z"
  }
}
```

### 2.3 Create Staff Member

```http
POST /api/v1/businesses/{businessId}/staff
```

**Request Body:**

```json
{
  "name": "New Staff",
  "email": "newstaff@example.com",
  "phone": "+1234567890",
  "role": "staff",
  "title": "Junior Stylist",
  "color": "#388e3c",
  "branchIds": ["branch-1"],
  "active": true,
  "type": "dynamic",
  "serviceIds": ["service-1"]
}
```

### 2.4 Update Staff Member

```http
PUT /api/v1/businesses/{businessId}/staff/{staffId}
```

### 2.5 Delete Staff Member

```http
DELETE /api/v1/businesses/{businessId}/staff/{staffId}
```

---

## 3. Staff Working Hours & Schedules

### 3.1 Get Staff Working Hours

```http
GET /api/v1/businesses/{businessId}/staff/{staffId}/hours
```

**Response:**

```json
{
  "success": true,
  "data": {
    "staffId": "staff-1",
    "weeklySchedule": {
      "Sun": { "isWorking": false, "shifts": [] },
      "Mon": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-1",
            "start": "09:00",
            "end": "17:00",
            "breaks": [{ "id": "break-1", "start": "12:00", "end": "13:00" }]
          }
        ]
      },
      "Tue": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-2",
            "start": "09:00",
            "end": "17:00",
            "breaks": [{ "id": "break-2", "start": "12:00", "end": "13:00" }]
          }
        ]
      },
      "Wed": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-3",
            "start": "09:00",
            "end": "17:00",
            "breaks": []
          }
        ]
      },
      "Thu": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-4",
            "start": "09:00",
            "end": "18:00",
            "breaks": [{ "id": "break-4", "start": "12:00", "end": "13:00" }]
          }
        ]
      },
      "Fri": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-5",
            "start": "09:00",
            "end": "18:00",
            "breaks": [{ "id": "break-5", "start": "12:00", "end": "13:00" }]
          }
        ]
      },
      "Sat": { "isWorking": false, "shifts": [] }
    },
    "shiftOverrides": [
      {
        "id": "override-1",
        "date": "2025-12-25",
        "start": "10:00",
        "end": "14:00",
        "breaks": [],
        "reason": "manual"
      }
    ]
  }
}
```

### 3.2 Update Staff Working Hours (Single Day)

```http
PUT /api/v1/businesses/{businessId}/staff/{staffId}/hours/{dayOfWeek}
```

**Request Body:**

```json
{
  "isWorking": true,
  "shifts": [
    {
      "start": "09:00",
      "end": "17:00",
      "breaks": [{ "start": "12:00", "end": "13:00" }]
    },
    {
      "start": "18:00",
      "end": "22:00",
      "breaks": []
    }
  ]
}
```

### 3.3 Create Shift Override (Specific Date)

```http
POST /api/v1/businesses/{businessId}/staff/{staffId}/shift-overrides
```

**Request Body:**

```json
{
  "date": "2025-12-25",
  "start": "10:00",
  "end": "14:00",
  "breaks": [],
  "reason": "manual"
}
```

### 3.4 Duplicate/Copy Shifts

```http
POST /api/v1/businesses/{businessId}/staff/{staffId}/duplicate-shifts
```

**Request Body:**

```json
{
  "sourceDate": "2025-12-01",
  "targetDateRange": {
    "start": "2025-12-08",
    "end": "2025-12-31"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Shifts duplicated successfully",
  "data": {
    "createdCount": 23,
    "dates": ["2025-12-08", "2025-12-09", "..."]
  }
}
```

---

## 4. Service Assignments (Staff)

### 4.1 Get Staff Service Assignments

```http
GET /api/v1/businesses/{businessId}/staff/{staffId}/services
```

**Response:**

```json
{
  "success": true,
  "data": {
    "staffId": "staff-1",
    "serviceIds": ["service-1", "service-2", "service-3"],
    "services": [
      {
        "id": "service-1",
        "name": "Haircut & Style",
        "categoryId": "cat-1",
        "categoryName": "Hair",
        "duration": 60,
        "price": 45.0
      },
      {
        "id": "service-2",
        "name": "Color Treatment",
        "categoryId": "cat-1",
        "categoryName": "Hair",
        "duration": 120,
        "price": 120.0
      }
    ]
  }
}
```

### 4.2 Update Staff Service Assignments

```http
PUT /api/v1/businesses/{businessId}/staff/{staffId}/services
```

**Request Body:**

```json
{
  "serviceIds": ["service-1", "service-2", "service-3", "service-5"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service assignments updated",
  "data": {
    "staffId": "staff-1",
    "serviceIds": ["service-1", "service-2", "service-3", "service-5"],
    "addedCount": 1,
    "removedCount": 0
  }
}
```

---

## 5. Time Off Management

### 5.1 Get All Time Off Requests

```http
GET /api/v1/businesses/{businessId}/time-off
```

**Query Parameters:**

- `staffId` (optional): Filter by staff member
- `status` (optional): approved, pending
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "off-1",
      "staffId": "staff-1",
      "staffName": "Emma Johnson",
      "range": {
        "start": "2025-12-25T00:00:00Z",
        "end": "2025-12-27T23:59:59Z"
      },
      "allDay": true,
      "reason": "Vacation",
      "approved": true,
      "note": "Family trip",
      "createdAt": "2025-12-01T00:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z"
    },
    {
      "id": "off-2",
      "staffId": "staff-2",
      "staffName": "Sarah Williams",
      "range": {
        "start": "2025-12-15T09:00:00Z",
        "end": "2025-12-15T13:00:00Z"
      },
      "allDay": false,
      "reason": "Personal",
      "approved": true,
      "note": "Doctor appointment",
      "createdAt": "2025-12-05T00:00:00Z",
      "updatedAt": "2025-12-05T10:00:00Z"
    }
  ]
}
```

### 5.2 Create Time Off Request

```http
POST /api/v1/businesses/{businessId}/time-off
```

**Request Body:**

```json
{
  "staffIds": ["staff-1", "staff-2"],
  "range": {
    "start": "2025-12-25T00:00:00Z",
    "end": "2025-12-27T23:59:59Z"
  },
  "allDay": true,
  "reason": "Vacation",
  "approved": false,
  "note": "Holiday break",
  "repeat": {
    "enabled": false,
    "until": null
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Time off request created",
  "data": {
    "created": [
      {
        "id": "off-3",
        "staffId": "staff-1",
        "range": {
          "start": "2025-12-25T00:00:00Z",
          "end": "2025-12-27T23:59:59Z"
        }
      },
      {
        "id": "off-4",
        "staffId": "staff-2",
        "range": {
          "start": "2025-12-25T00:00:00Z",
          "end": "2025-12-27T23:59:59Z"
        }
      }
    ]
  }
}
```

### 5.3 Create Recurring Time Off

```http
POST /api/v1/businesses/{businessId}/time-off
```

**Request Body:**

```json
{
  "staffIds": ["staff-1"],
  "range": {
    "start": "2025-12-01T00:00:00Z",
    "end": "2025-12-01T23:59:59Z"
  },
  "allDay": true,
  "reason": "Vacation",
  "approved": true,
  "note": "Every Friday off",
  "repeat": {
    "enabled": true,
    "until": "2025-12-31T23:59:59Z"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Recurring time off created",
  "data": {
    "created": 5,
    "dates": ["2025-12-01", "2025-12-08", "2025-12-15", "2025-12-22", "2025-12-29"]
  }
}
```

### 5.4 Update Time Off Request

```http
PUT /api/v1/businesses/{businessId}/time-off/{timeOffId}
```

**Request Body:**

```json
{
  "approved": true,
  "note": "Approved by manager"
}
```

### 5.5 Toggle Approval Status

```http
PATCH /api/v1/businesses/{businessId}/time-off/{timeOffId}/toggle-approval
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "off-1",
    "approved": true
  }
}
```

### 5.6 Delete Time Off Request

```http
DELETE /api/v1/businesses/{businessId}/time-off/{timeOffId}
```

---

## 6. Time Reservations

### 6.1 Get Time Reservations

```http
GET /api/v1/businesses/{businessId}/time-reservations
```

**Query Parameters:**

- `staffId` (optional): Filter by staff
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "res-1",
      "staffId": "staff-1",
      "staffName": "Emma Johnson",
      "start": "2025-12-15T14:00:00Z",
      "end": "2025-12-15T15:30:00Z",
      "reason": "Staff meeting",
      "note": "Monthly team meeting",
      "createdAt": "2025-12-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    }
  ]
}
```

### 6.2 Create Time Reservation

```http
POST /api/v1/businesses/{businessId}/time-reservations
```

**Request Body:**

```json
{
  "staffId": "staff-1",
  "start": "2025-12-15T14:00:00Z",
  "end": "2025-12-15T15:30:00Z",
  "reason": "Training session",
  "note": "Product knowledge training"
}
```

### 6.3 Update Time Reservation

```http
PUT /api/v1/businesses/{businessId}/time-reservations/{reservationId}
```

### 6.4 Delete Time Reservation

```http
DELETE /api/v1/businesses/{businessId}/time-reservations/{reservationId}
```

---

## 7. Resources Management

**Note:** Resources are simpler facilities without scheduling (e.g., equipment, amenities)

### 7.1 Get All Resources

```http
GET /api/v1/businesses/{businessId}/resources
```

**Query Parameters:**

- `branchId` (optional): Filter by branch

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "resource-1",
      "branchId": "branch-1",
      "name": "Massage Chair",
      "capacity": 1,
      "floor": "Main Floor",
      "amenities": ["Heating", "Massage", "Recline"],
      "color": "#1976d2",
      "serviceIds": ["service-4"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    }
  ]
}
```

### 7.2 Create Resource

```http
POST /api/v1/businesses/{businessId}/resources
```

**Request Body:**

```json
{
  "branchId": "branch-1",
  "name": "UV Lamp Station",
  "capacity": 1,
  "floor": "Main Floor",
  "amenities": ["UV Light", "Timer"],
  "color": "#e91e63",
  "serviceIds": ["service-4"]
}
```

### 7.3 Update Resource

```http
PUT /api/v1/businesses/{businessId}/resources/{resourceId}
```

### 7.4 Delete Resource

```http
DELETE /api/v1/businesses/{businessId}/resources/{resourceId}
```

### 7.5 Update Resource Service Assignments

```http
PUT /api/v1/businesses/{businessId}/resources/{resourceId}/services
```

**Request Body:**

```json
{
  "serviceIds": ["service-4", "service-5"]
}
```

---

## 8. Rooms Management (with Scheduling)

**Note:** Rooms are schedulable resources with time-based availability and service assignments

### 8.1 Get All Rooms

```http
GET /api/v1/businesses/{businessId}/rooms
```

**Query Parameters:**

- `branchId` (optional): Filter by branch

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "room-1",
      "branchId": "branch-1",
      "name": "Main Studio",
      "capacity": 20,
      "floor": "1st Floor",
      "amenities": ["Air Conditioning", "Mirrors", "Sound System", "WiFi"],
      "color": "#1976d2",
      "serviceIds": ["service-1", "service-2"],
      "weeklySchedule": {
        "Sun": {
          "isAvailable": true,
          "shifts": [
            {
              "id": "shift-1",
              "start": "09:00",
              "end": "17:00",
              "serviceIds": ["service-1"]
            }
          ]
        },
        "Mon": {
          "isAvailable": true,
          "shifts": [
            {
              "id": "shift-2",
              "start": "09:00",
              "end": "12:00",
              "serviceIds": ["service-1", "service-2"]
            },
            {
              "id": "shift-3",
              "start": "13:00",
              "end": "19:00",
              "serviceIds": ["service-1", "service-2", "service-3"]
            }
          ]
        },
        "Tue": {
          "isAvailable": true,
          "shifts": [
            {
              "id": "shift-4",
              "start": "09:00",
              "end": "19:00",
              "serviceIds": ["service-1", "service-2", "service-3"]
            }
          ]
        },
        "Wed": {
          "isAvailable": false,
          "shifts": []
        },
        "Thu": {
          "isAvailable": true,
          "shifts": [
            {
              "id": "shift-5",
              "start": "09:00",
              "end": "20:00",
              "serviceIds": ["service-1", "service-2", "service-3"]
            }
          ]
        },
        "Fri": {
          "isAvailable": true,
          "shifts": [
            {
              "id": "shift-6",
              "start": "09:00",
              "end": "13:00",
              "serviceIds": ["service-1", "service-3"]
            },
            {
              "id": "shift-7",
              "start": "14:00",
              "end": "20:00",
              "serviceIds": ["service-1", "service-2", "service-3"]
            }
          ]
        },
        "Sat": {
          "isAvailable": true,
          "shifts": [
            {
              "id": "shift-8",
              "start": "09:00",
              "end": "18:00",
              "serviceIds": ["service-1", "service-2", "service-3"]
            }
          ]
        }
      },
      "shiftOverrides": [
        {
          "id": "override-1",
          "date": "2025-12-25",
          "start": "10:00",
          "end": "16:00",
          "serviceIds": ["service-1"],
          "reason": "manual"
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    }
  ]
}
```

### 8.2 Get Room by ID

```http
GET /api/v1/businesses/{businessId}/rooms/{roomId}
```

### 8.3 Create Room

```http
POST /api/v1/businesses/{businessId}/rooms
```

**Request Body:**

```json
{
  "branchId": "branch-1",
  "name": "Yoga Room",
  "capacity": 15,
  "floor": "2nd Floor",
  "amenities": ["Air Conditioning", "Yoga Mats", "Mirrors"],
  "color": "#388e3c",
  "serviceIds": ["service-3"],
  "weeklySchedule": {
    "Sun": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "17:00",
          "serviceIds": ["service-3"]
        }
      ]
    },
    "Mon": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "12:00",
          "serviceIds": ["service-3"]
        },
        {
          "start": "14:00",
          "end": "18:00",
          "serviceIds": ["service-3"]
        }
      ]
    }
    // ... other days
  }
}
```

### 8.4 Update Room

```http
PUT /api/v1/businesses/{businessId}/rooms/{roomId}
```

### 8.5 Update Room Weekly Schedule (Single Day)

```http
PUT /api/v1/businesses/{businessId}/rooms/{roomId}/schedule/{dayOfWeek}
```

**Request Body:**

```json
{
  "isAvailable": true,
  "shifts": [
    {
      "start": "09:00",
      "end": "13:00",
      "serviceIds": ["service-1", "service-2"]
    },
    {
      "start": "14:00",
      "end": "20:00",
      "serviceIds": ["service-1", "service-2", "service-3"]
    }
  ]
}
```

### 8.6 Create Room Shift Override

```http
POST /api/v1/businesses/{businessId}/rooms/{roomId}/shift-overrides
```

**Request Body:**

```json
{
  "date": "2025-12-25",
  "start": "10:00",
  "end": "16:00",
  "serviceIds": ["service-1"],
  "reason": "manual"
}
```

### 8.7 Delete Room

```http
DELETE /api/v1/businesses/{businessId}/rooms/{roomId}
```

### 8.8 Update Room Service Assignments

```http
PUT /api/v1/businesses/{businessId}/rooms/{roomId}/services
```

**Request Body:**

```json
{
  "serviceIds": ["service-1", "service-2", "service-3"]
}
```

---

## 9. Commission Policies

### 9.1 Get All Commission Policies

```http
GET /api/v1/businesses/{businessId}/commissions
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "comm-1",
      "scope": "serviceCategory",
      "scopeRefId": "cat-1",
      "scopeName": "Hair Services",
      "type": "percent",
      "value": 40,
      "appliesTo": "serviceProvider",
      "staffScope": "all",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    },
    {
      "id": "comm-2",
      "scope": "service",
      "scopeRefId": "service-1",
      "scopeName": "Haircut & Style",
      "type": "percent",
      "value": 50,
      "appliesTo": "serviceProvider",
      "staffScope": {
        "staffIds": ["staff-1", "staff-2"]
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    },
    {
      "id": "comm-3",
      "scope": "product",
      "scopeRefId": null,
      "scopeName": "All Products",
      "type": "percent",
      "value": 20,
      "appliesTo": "seller",
      "staffScope": "all",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    },
    {
      "id": "comm-4",
      "scope": "giftCard",
      "scopeRefId": null,
      "scopeName": "Gift Cards",
      "type": "fixed",
      "value": 5,
      "appliesTo": "seller",
      "staffScope": "all",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    }
  ]
}
```

### 9.2 Create Commission Policy

```http
POST /api/v1/businesses/{businessId}/commissions
```

**Request Body:**

```json
{
  "scope": "service",
  "scopeRefId": "service-5",
  "type": "percent",
  "value": 45,
  "appliesTo": "serviceProvider",
  "staffScope": {
    "staffIds": ["staff-3", "staff-4"]
  }
}
```

### 9.3 Update Commission Policy

```http
PUT /api/v1/businesses/{businessId}/commissions/{commissionId}
```

### 9.4 Delete Commission Policy

```http
DELETE /api/v1/businesses/{businessId}/commissions/{commissionId}
```

---

## 10. Bulk Operations

### 10.1 Bulk Set Working Hours

```http
POST /api/v1/businesses/{businessId}/staff/bulk/set-hours
```

**Request Body:**

```json
{
  "staffIds": ["staff-1", "staff-2", "staff-3"],
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "hours": {
    "isWorking": true,
    "shifts": [
      {
        "start": "09:00",
        "end": "17:00",
        "breaks": [{ "start": "12:00", "end": "13:00" }]
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Working hours updated for 3 staff members",
  "data": {
    "updatedStaff": ["staff-1", "staff-2", "staff-3"],
    "updatedDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "totalUpdates": 15
  }
}
```

### 10.2 Bulk Add Time Off

```http
POST /api/v1/businesses/{businessId}/staff/bulk/add-time-off
```

**Request Body:**

```json
{
  "staffIds": ["staff-1", "staff-2"],
  "range": {
    "start": "2025-12-25T00:00:00Z",
    "end": "2025-12-27T23:59:59Z"
  },
  "allDay": true,
  "reason": "Vacation",
  "approved": true,
  "note": "Holiday break"
}
```

### 10.3 Bulk Copy Schedule Template

```http
POST /api/v1/businesses/{businessId}/staff/bulk/copy-schedule
```

**Request Body:**

```json
{
  "sourceStaffId": "staff-1",
  "targetStaffIds": ["staff-5", "staff-6", "staff-7"],
  "copyDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "overwriteExisting": false
}
```

### 10.4 Bulk Clear Schedule

```http
POST /api/v1/businesses/{businessId}/staff/bulk/clear-schedule
```

**Request Body:**

```json
{
  "staffIds": ["staff-1", "staff-2"],
  "days": ["Sat", "Sun"]
}
```

---

## Data Type Reference

### Day of Week Enum

```typescript
type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
```

### Time Off Reason Enum

```typescript
type TimeOffReasonGroup = 'Personal' | 'Sick' | 'Vacation' | 'Training' | 'No-Show' | 'Late' | 'Other'
```

### Commission Scope Enum

```typescript
type CommissionScope = 'serviceCategory' | 'service' | 'product' | 'giftCard' | 'membership' | 'package'
```

### Commission Type Enum

```typescript
type CommissionType = 'percent' | 'fixed'
```

### Commission Applies To Enum

```typescript
type CommissionAppliesTo = 'serviceProvider' | 'seller'
```

### Staff Role Enum

```typescript
type StaffRole = 'owner' | 'manager' | 'staff'
```

### Staff Type Enum

```typescript
type StaffType = 'dynamic' | 'static'
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid time format",
    "details": {
      "field": "shifts[0].start",
      "expectedFormat": "HH:MM"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `CONFLICT` - Resource conflict (e.g., overlapping shifts)
- `BUSINESS_RULE_VIOLATION` - Business logic constraint violated

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 50, max: 100)
- `sort` (optional): field name
- `order` (optional): asc | desc

**Response includes:**

```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Authentication

All endpoints require authentication via Bearer token:

```http
Authorization: Bearer {access_token}
```

---

## Rate Limiting

- 100 requests per minute per API key
- Headers included in response:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1701436800

---

## Webhooks (Optional)

Available webhook events:

- `staff.created`
- `staff.updated`
- `staff.deleted`
- `staff.hours.updated`
- `time_off.created`
- `time_off.approved`
- `time_off.deleted`
- `room.created`
- `room.updated`
- `room.deleted`

---

## Notes for Backend Implementation

1. **Time Zones**: All timestamps should be stored in UTC and converted to business timezone
2. **Validation**: Validate time ranges (start < end) and working hours constraints
3. **Conflicts**: Check for overlapping shifts, time off, and reservations
4. **Cascading**: When deleting staff, handle associated data (hours, time off, assignments)
5. **Audit Logs**: Track all changes to staff schedules for compliance
6. **Permissions**: Implement role-based access (owners can edit all, managers can edit their branch)
7. **Notifications**: Send notifications for time off approvals, schedule changes
8. **Performance**: Index frequently queried fields (businessId, staffId, branchId, dates)
9. **Caching**: Cache business hours and staff schedules (invalidate on updates)
10. **Real-time**: Consider WebSocket updates for schedule changes

---

**End of API Specification**
