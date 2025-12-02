# Backend API Mock Examples

**Version:** 1.0  
**Date:** December 2025  
**Purpose:** Simple JSON examples demonstrating complete data flow for backend implementation

---

## Table of Contents

1. [Complete Business Setup Flow](#1-complete-business-setup-flow)
2. [Staff Member Lifecycle](#2-staff-member-lifecycle)
3. [Weekly Schedule Management](#3-weekly-schedule-management)
4. [Time Off Management Flow](#4-time-off-management-flow)
5. [Room Scheduling Flow](#5-room-scheduling-flow)
6. [Commission Policy Setup](#6-commission-policy-setup)
7. [Bulk Operations Examples](#7-bulk-operations-examples)
8. [Real-World Scenarios](#8-real-world-scenarios)

---

## 1. Complete Business Setup Flow

### Step 1: Get Business Hours

```http
GET /api/v1/businesses/biz-123/hours
```

**Response:**

```json
{
  "success": true,
  "data": {
    "businessId": "biz-123",
    "hours": {
      "Sun": { "isOpen": true, "shifts": [{ "start": "10:00", "end": "17:00" }] },
      "Mon": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "19:00" }] },
      "Tue": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "19:00" }] },
      "Wed": { "isOpen": false, "shifts": [] },
      "Thu": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "20:00" }] },
      "Fri": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "20:00" }] },
      "Sat": { "isOpen": true, "shifts": [{ "start": "08:00", "end": "18:00" }] }
    }
  }
}
```

### Step 2: Create First Staff Member

```http
POST /api/v1/businesses/biz-123/staff
```

**Request:**

```json
{
  "name": "Emma Johnson",
  "email": "emma@example.com",
  "phone": "+1234567890",
  "role": "staff",
  "title": "Senior Hair Stylist",
  "color": "#1976d2",
  "branchIds": ["branch-1"],
  "active": true,
  "type": "dynamic"
}
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
    "color": "#1976d2",
    "branchIds": ["branch-1"],
    "active": true,
    "type": "dynamic",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

### Step 3: Set Staff Working Hours

```http
PUT /api/v1/businesses/biz-123/staff/staff-1/hours/Mon
```

**Request:**

```json
{
  "isWorking": true,
  "shifts": [
    {
      "start": "09:00",
      "end": "17:00",
      "breaks": [{ "start": "12:00", "end": "13:00" }]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Working hours updated for Monday",
  "data": {
    "staffId": "staff-1",
    "dayOfWeek": "Mon",
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
}
```

### Step 4: Assign Services to Staff

```http
PUT /api/v1/businesses/biz-123/staff/staff-1/services
```

**Request:**

```json
{
  "serviceIds": ["service-1", "service-2", "service-3"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service assignments updated",
  "data": {
    "staffId": "staff-1",
    "serviceIds": ["service-1", "service-2", "service-3"],
    "addedCount": 3,
    "removedCount": 0
  }
}
```

---

## 2. Staff Member Lifecycle

### Scenario: New Hire to Fully Configured

#### Step 1: Create Staff

```json
POST /api/v1/businesses/biz-123/staff
{
  "name": "Michael Chen",
  "email": "michael@example.com",
  "phone": "+1234567891",
  "role": "staff",
  "title": "Massage Therapist",
  "color": "#388e3c",
  "branchIds": ["branch-1", "branch-2"],
  "active": true,
  "type": "dynamic"
}
```

#### Step 2: Set Full Week Schedule (Bulk)

```json
POST /api/v1/businesses/biz-123/staff/bulk/set-hours
{
  "staffIds": ["staff-2"],
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "hours": {
    "isWorking": true,
    "shifts": [
      {
        "start": "10:00",
        "end": "18:00",
        "breaks": [{ "start": "13:00", "end": "14:00" }]
      }
    ]
  }
}
```

#### Step 3: Add Weekend Hours (Different Schedule)

```json
PUT /api/v1/businesses/biz-123/staff/staff-2/hours/Sat
{
  "isWorking": true,
  "shifts": [
    { "start": "09:00", "end": "13:00", "breaks": [] }
  ]
}
```

#### Step 4: Assign Services

```json
PUT /api/v1/businesses/biz-123/staff/staff-2/services
{
  "serviceIds": ["service-4", "service-5"]
}
```

#### Step 5: Book Initial Time Off

```json
POST /api/v1/businesses/biz-123/time-off
{
  "staffIds": ["staff-2"],
  "range": {
    "start": "2025-12-24T00:00:00Z",
    "end": "2025-12-26T23:59:59Z"
  },
  "allDay": true,
  "reason": "Vacation",
  "approved": true,
  "note": "Holiday break"
}
```

**Complete Staff Data After Setup:**

```json
GET /api/v1/businesses/biz-123/staff/staff-2

{
  "success": true,
  "data": {
    "id": "staff-2",
    "businessId": "biz-123",
    "name": "Michael Chen",
    "email": "michael@example.com",
    "phone": "+1234567891",
    "role": "staff",
    "title": "Massage Therapist",
    "color": "#388e3c",
    "branchIds": ["branch-1", "branch-2"],
    "active": true,
    "type": "dynamic",
    "serviceIds": ["service-4", "service-5"],
    "workingHours": {
      "Sun": { "isWorking": false, "shifts": [] },
      "Mon": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-10",
            "start": "10:00",
            "end": "18:00",
            "breaks": [{ "id": "break-10", "start": "13:00", "end": "14:00" }]
          }
        ]
      },
      "Tue": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-11",
            "start": "10:00",
            "end": "18:00",
            "breaks": [{ "id": "break-11", "start": "13:00", "end": "14:00" }]
          }
        ]
      },
      "Wed": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-12",
            "start": "10:00",
            "end": "18:00",
            "breaks": [{ "id": "break-12", "start": "13:00", "end": "14:00" }]
          }
        ]
      },
      "Thu": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-13",
            "start": "10:00",
            "end": "18:00",
            "breaks": [{ "id": "break-13", "start": "13:00", "end": "14:00" }]
          }
        ]
      },
      "Fri": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-14",
            "start": "10:00",
            "end": "18:00",
            "breaks": [{ "id": "break-14", "start": "13:00", "end": "14:00" }]
          }
        ]
      },
      "Sat": {
        "isWorking": true,
        "shifts": [
          {
            "id": "shift-15",
            "start": "09:00",
            "end": "13:00",
            "breaks": []
          }
        ]
      }
    },
    "createdAt": "2025-12-01T10:30:00Z",
    "updatedAt": "2025-12-01T11:00:00Z"
  }
}
```

---

## 3. Weekly Schedule Management

### Scenario: Manager Updates Staff Schedule for Upcoming Week

#### Current Schedule (Monday)

```json
GET /api/v1/businesses/biz-123/staff/staff-1/hours

{
  "success": true,
  "data": {
    "staffId": "staff-1",
    "weeklySchedule": {
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
    }
  }
}
```

#### Update: Add Evening Shift

```json
PUT /api/v1/businesses/biz-123/staff/staff-1/hours/Mon

{
  "isWorking": true,
  "shifts": [
    {
      "start": "09:00",
      "end": "13:00",
      "breaks": []
    },
    {
      "start": "17:00",
      "end": "21:00",
      "breaks": []
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Working hours updated for Monday",
  "data": {
    "staffId": "staff-1",
    "dayOfWeek": "Mon",
    "isWorking": true,
    "shifts": [
      {
        "id": "shift-1",
        "start": "09:00",
        "end": "13:00",
        "breaks": []
      },
      {
        "id": "shift-20",
        "start": "17:00",
        "end": "21:00",
        "breaks": []
      }
    ]
  }
}
```

#### Create One-Time Override (Holiday Hours)

```json
POST /api/v1/businesses/biz-123/staff/staff-1/shift-overrides

{
  "date": "2025-12-25",
  "start": "10:00",
  "end": "14:00",
  "breaks": [],
  "reason": "manual"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Shift override created",
  "data": {
    "id": "override-1",
    "staffId": "staff-1",
    "date": "2025-12-25",
    "start": "10:00",
    "end": "14:00",
    "breaks": [],
    "reason": "manual",
    "createdAt": "2025-12-01T12:00:00Z"
  }
}
```

---

## 4. Time Off Management Flow

### Scenario: Staff Requests Vacation

#### Step 1: Create Time Off Request (Pending Approval)

```json
POST /api/v1/businesses/biz-123/time-off

{
  "staffIds": ["staff-1"],
  "range": {
    "start": "2025-12-23T00:00:00Z",
    "end": "2025-12-27T23:59:59Z"
  },
  "allDay": true,
  "reason": "Vacation",
  "approved": false,
  "note": "Family holiday trip"
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
        "id": "off-10",
        "staffId": "staff-1",
        "staffName": "Emma Johnson",
        "range": {
          "start": "2025-12-23T00:00:00Z",
          "end": "2025-12-27T23:59:59Z"
        },
        "allDay": true,
        "reason": "Vacation",
        "approved": false,
        "note": "Family holiday trip",
        "createdAt": "2025-12-01T13:00:00Z"
      }
    ]
  }
}
```

#### Step 2: Manager Reviews and Approves

```json
PATCH /api/v1/businesses/biz-123/time-off/off-10/toggle-approval
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "off-10",
    "approved": true,
    "updatedAt": "2025-12-01T14:00:00Z"
  }
}
```

#### Step 3: Get All Pending Time Off Requests

```json
GET /api/v1/businesses/biz-123/time-off?status=pending

{
  "success": true,
  "data": [
    {
      "id": "off-11",
      "staffId": "staff-3",
      "staffName": "Sarah Williams",
      "range": {
        "start": "2025-12-15T09:00:00Z",
        "end": "2025-12-15T13:00:00Z"
      },
      "allDay": false,
      "reason": "Personal",
      "approved": false,
      "note": "Doctor appointment",
      "createdAt": "2025-12-01T09:00:00Z"
    }
  ]
}
```

### Scenario: Recurring Time Off (Every Friday)

```json
POST /api/v1/businesses/biz-123/time-off

{
  "staffIds": ["staff-2"],
  "range": {
    "start": "2025-12-05T00:00:00Z",
    "end": "2025-12-05T23:59:59Z"
  },
  "allDay": true,
  "reason": "Personal",
  "approved": true,
  "note": "Parenting obligations - every Friday",
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
    "dates": ["2025-12-05", "2025-12-12", "2025-12-19", "2025-12-26"]
  }
}
```

---

## 5. Room Scheduling Flow

### Scenario: Setup New Yoga Studio Room

#### Step 1: Create Room

```json
POST /api/v1/businesses/biz-123/rooms

{
  "branchId": "branch-1",
  "name": "Yoga Studio A",
  "capacity": 20,
  "floor": "2nd Floor",
  "amenities": ["Air Conditioning", "Mirrors", "Sound System", "Yoga Mats"],
  "color": "#9c27b0",
  "serviceIds": ["service-yoga-1", "service-yoga-2"],
  "weeklySchedule": {
    "Sun": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "08:00",
          "end": "12:00",
          "serviceIds": ["service-yoga-1"]
        },
        {
          "start": "16:00",
          "end": "20:00",
          "serviceIds": ["service-yoga-2"]
        }
      ]
    },
    "Mon": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "06:00",
          "end": "22:00",
          "serviceIds": ["service-yoga-1", "service-yoga-2"]
        }
      ]
    },
    "Tue": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "06:00",
          "end": "22:00",
          "serviceIds": ["service-yoga-1", "service-yoga-2"]
        }
      ]
    },
    "Wed": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "06:00",
          "end": "22:00",
          "serviceIds": ["service-yoga-1", "service-yoga-2"]
        }
      ]
    },
    "Thu": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "06:00",
          "end": "22:00",
          "serviceIds": ["service-yoga-1", "service-yoga-2"]
        }
      ]
    },
    "Fri": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "06:00",
          "end": "20:00",
          "serviceIds": ["service-yoga-1", "service-yoga-2"]
        }
      ]
    },
    "Sat": {
      "isAvailable": true,
      "shifts": [
        {
          "start": "08:00",
          "end": "18:00",
          "serviceIds": ["service-yoga-1", "service-yoga-2"]
        }
      ]
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "room-10",
    "branchId": "branch-1",
    "name": "Yoga Studio A",
    "capacity": 20,
    "floor": "2nd Floor",
    "amenities": ["Air Conditioning", "Mirrors", "Sound System", "Yoga Mats"],
    "color": "#9c27b0",
    "serviceIds": ["service-yoga-1", "service-yoga-2"],
    "weeklySchedule": {
      "Sun": {
        "isAvailable": true,
        "shifts": [
          {
            "id": "shift-100",
            "start": "08:00",
            "end": "12:00",
            "serviceIds": ["service-yoga-1"]
          },
          {
            "id": "shift-101",
            "start": "16:00",
            "end": "20:00",
            "serviceIds": ["service-yoga-2"]
          }
        ]
      }
      // ... other days with generated shift IDs
    },
    "shiftOverrides": [],
    "createdAt": "2025-12-01T15:00:00Z",
    "updatedAt": "2025-12-01T15:00:00Z"
  }
}
```

#### Step 2: Update Monday Schedule (Add Morning Class)

```json
PUT /api/v1/businesses/biz-123/rooms/room-10/schedule/Mon

{
  "isAvailable": true,
  "shifts": [
    {
      "start": "06:00",
      "end": "08:00",
      "serviceIds": ["service-yoga-1"]
    },
    {
      "start": "09:00",
      "end": "12:00",
      "serviceIds": ["service-yoga-2"]
    },
    {
      "start": "14:00",
      "end": "22:00",
      "serviceIds": ["service-yoga-1", "service-yoga-2"]
    }
  ]
}
```

#### Step 3: Create Holiday Override

```json
POST /api/v1/businesses/biz-123/rooms/room-10/shift-overrides

{
  "date": "2025-12-25",
  "start": "10:00",
  "end": "16:00",
  "serviceIds": ["service-yoga-1"],
  "reason": "manual"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Room shift override created",
  "data": {
    "id": "room-override-1",
    "roomId": "room-10",
    "date": "2025-12-25",
    "start": "10:00",
    "end": "16:00",
    "serviceIds": ["service-yoga-1"],
    "reason": "manual",
    "createdAt": "2025-12-01T16:00:00Z"
  }
}
```

---

## 6. Commission Policy Setup

### Scenario: Setup Multi-Level Commission Structure

#### Step 1: Category-Wide Commission (All Hair Services)

```json
POST /api/v1/businesses/biz-123/commissions

{
  "scope": "serviceCategory",
  "scopeRefId": "cat-hair",
  "type": "percent",
  "value": 40,
  "appliesTo": "serviceProvider",
  "staffScope": "all"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "comm-1",
    "scope": "serviceCategory",
    "scopeRefId": "cat-hair",
    "scopeName": "Hair Services",
    "type": "percent",
    "value": 40,
    "appliesTo": "serviceProvider",
    "staffScope": "all",
    "createdAt": "2025-12-01T17:00:00Z"
  }
}
```

#### Step 2: Service-Specific Override (Premium Service)

```json
POST /api/v1/businesses/biz-123/commissions

{
  "scope": "service",
  "scopeRefId": "service-premium-color",
  "type": "percent",
  "value": 50,
  "appliesTo": "serviceProvider",
  "staffScope": {
    "staffIds": ["staff-1", "staff-2"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "comm-2",
    "scope": "service",
    "scopeRefId": "service-premium-color",
    "scopeName": "Premium Color Treatment",
    "type": "percent",
    "value": 50,
    "appliesTo": "serviceProvider",
    "staffScope": {
      "staffIds": ["staff-1", "staff-2"]
    },
    "createdAt": "2025-12-01T17:05:00Z"
  }
}
```

#### Step 3: Product Sales Commission (All Staff)

```json
POST /api/v1/businesses/biz-123/commissions

{
  "scope": "product",
  "scopeRefId": null,
  "type": "percent",
  "value": 15,
  "appliesTo": "seller",
  "staffScope": "all"
}
```

#### Step 4: Gift Card Fixed Commission

```json
POST /api/v1/businesses/biz-123/commissions

{
  "scope": "giftCard",
  "scopeRefId": null,
  "type": "fixed",
  "value": 5.00,
  "appliesTo": "seller",
  "staffScope": "all"
}
```

#### Get All Commission Policies

```json
GET /api/v1/businesses/biz-123/commissions

{
  "success": true,
  "data": [
    {
      "id": "comm-1",
      "scope": "serviceCategory",
      "scopeRefId": "cat-hair",
      "scopeName": "Hair Services",
      "type": "percent",
      "value": 40,
      "appliesTo": "serviceProvider",
      "staffScope": "all"
    },
    {
      "id": "comm-2",
      "scope": "service",
      "scopeRefId": "service-premium-color",
      "scopeName": "Premium Color Treatment",
      "type": "percent",
      "value": 50,
      "appliesTo": "serviceProvider",
      "staffScope": {
        "staffIds": ["staff-1", "staff-2"]
      }
    },
    {
      "id": "comm-3",
      "scope": "product",
      "scopeRefId": null,
      "scopeName": "All Products",
      "type": "percent",
      "value": 15,
      "appliesTo": "seller",
      "staffScope": "all"
    },
    {
      "id": "comm-4",
      "scope": "giftCard",
      "scopeRefId": null,
      "scopeName": "Gift Cards",
      "type": "fixed",
      "value": 5.00,
      "appliesTo": "seller",
      "staffScope": "all"
    }
  ]
}
```

---

## 7. Bulk Operations Examples

### Scenario 1: New Staff Onboarding (5 New Hires)

#### Bulk Set Standard Schedule for All New Staff

```json
POST /api/v1/businesses/biz-123/staff/bulk/set-hours

{
  "staffIds": ["staff-10", "staff-11", "staff-12", "staff-13", "staff-14"],
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "hours": {
    "isWorking": true,
    "shifts": [
      {
        "start": "09:00",
        "end": "17:00",
        "breaks": [
          { "start": "12:00", "end": "13:00" }
        ]
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Working hours updated for 5 staff members",
  "data": {
    "updatedStaff": ["staff-10", "staff-11", "staff-12", "staff-13", "staff-14"],
    "updatedDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "totalUpdates": 25,
    "totalShiftsCreated": 25,
    "totalBreaksCreated": 25
  }
}
```

### Scenario 2: Holiday Closure (All Staff Time Off)

```json
POST /api/v1/businesses/biz-123/staff/bulk/add-time-off

{
  "staffIds": ["staff-1", "staff-2", "staff-3", "staff-4", "staff-5", "staff-6", "staff-7"],
  "range": {
    "start": "2025-12-24T00:00:00Z",
    "end": "2025-12-26T23:59:59Z"
  },
  "allDay": true,
  "reason": "Vacation",
  "approved": true,
  "note": "Christmas Holiday - Business Closed"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Time off created for 7 staff members",
  "data": {
    "created": [
      { "id": "off-20", "staffId": "staff-1" },
      { "id": "off-21", "staffId": "staff-2" },
      { "id": "off-22", "staffId": "staff-3" },
      { "id": "off-23", "staffId": "staff-4" },
      { "id": "off-24", "staffId": "staff-5" },
      { "id": "off-25", "staffId": "staff-6" },
      { "id": "off-26", "staffId": "staff-7" }
    ],
    "totalCreated": 7
  }
}
```

### Scenario 3: Copy Template Schedule

```json
POST /api/v1/businesses/biz-123/staff/bulk/copy-schedule

{
  "sourceStaffId": "staff-1",
  "targetStaffIds": ["staff-15", "staff-16", "staff-17"],
  "copyDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "overwriteExisting": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Schedule copied from Emma Johnson to 3 staff members",
  "data": {
    "sourceStaff": {
      "id": "staff-1",
      "name": "Emma Johnson"
    },
    "targetStaff": [
      { "id": "staff-15", "name": "New Staff 1" },
      { "id": "staff-16", "name": "New Staff 2" },
      { "id": "staff-17", "name": "New Staff 3" }
    ],
    "copiedDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "totalShiftsCopied": 15,
    "overwrittenShifts": 5
  }
}
```

---

## 8. Real-World Scenarios

### Scenario A: Staff Schedule Conflict Detection

#### Request: Create Overlapping Shift (Should Fail)

```json
POST /api/v1/businesses/biz-123/staff/staff-1/shift-overrides

{
  "date": "2025-12-10",
  "start": "09:00",
  "end": "17:00",
  "breaks": []
}
```

#### But Staff Already Has Time Off on That Date

```json
GET /api/v1/businesses/biz-123/time-off?staffId=staff-1&startDate=2025-12-10&endDate=2025-12-10

{
  "success": true,
  "data": [
    {
      "id": "off-30",
      "staffId": "staff-1",
      "range": {
        "start": "2025-12-10T00:00:00Z",
        "end": "2025-12-10T23:59:59Z"
      },
      "allDay": true,
      "approved": true
    }
  ]
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot create shift on this date - staff has approved time off",
    "details": {
      "staffId": "staff-1",
      "date": "2025-12-10",
      "conflictingResource": {
        "type": "time_off",
        "id": "off-30"
      }
    }
  }
}
```

### Scenario B: Calendar View Data (Week View)

#### Request: Get All Schedule Data for Week

```json
GET /api/v1/businesses/biz-123/calendar/week?startDate=2025-12-08&endDate=2025-12-14
```

**Response with Combined Data:**

```json
{
  "success": true,
  "data": {
    "dateRange": {
      "start": "2025-12-08",
      "end": "2025-12-14"
    },
    "businessHours": {
      "Sun": { "isOpen": true, "shifts": [{ "start": "10:00", "end": "17:00" }] },
      "Mon": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "19:00" }] },
      "Tue": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "19:00" }] },
      "Wed": { "isOpen": false, "shifts": [] },
      "Thu": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "20:00" }] },
      "Fri": { "isOpen": true, "shifts": [{ "start": "09:00", "end": "20:00" }] },
      "Sat": { "isOpen": true, "shifts": [{ "start": "08:00", "end": "18:00" }] }
    },
    "staff": [
      {
        "id": "staff-1",
        "name": "Emma Johnson",
        "color": "#1976d2",
        "weekSchedule": {
          "2025-12-08": {
            "isWorking": true,
            "shifts": [{ "start": "10:00", "end": "17:00", "breaks": [] }]
          },
          "2025-12-09": {
            "isWorking": true,
            "shifts": [{ "start": "09:00", "end": "17:00", "breaks": [{ "start": "12:00", "end": "13:00" }] }]
          },
          "2025-12-10": {
            "isWorking": false,
            "timeOff": {
              "id": "off-30",
              "reason": "Sick",
              "allDay": true
            }
          },
          "2025-12-11": { "isWorking": false, "reason": "businessClosed" },
          "2025-12-12": {
            "isWorking": true,
            "shifts": [{ "start": "09:00", "end": "18:00", "breaks": [{ "start": "12:00", "end": "13:00" }] }]
          },
          "2025-12-13": {
            "isWorking": true,
            "shifts": [{ "start": "09:00", "end": "18:00", "breaks": [{ "start": "12:00", "end": "13:00" }] }],
            "timeReservation": {
              "id": "res-5",
              "start": "14:00",
              "end": "15:30",
              "reason": "Training"
            }
          },
          "2025-12-14": {
            "isWorking": true,
            "shifts": [{ "start": "08:00", "end": "16:00", "breaks": [] }]
          }
        }
      }
    ],
    "rooms": [
      {
        "id": "room-1",
        "name": "Main Studio",
        "color": "#1976d2",
        "weekSchedule": {
          "2025-12-08": {
            "isAvailable": true,
            "shifts": [{ "start": "09:00", "end": "17:00", "serviceIds": ["service-1"] }]
          },
          "2025-12-09": {
            "isAvailable": true,
            "shifts": [
              { "start": "09:00", "end": "12:00", "serviceIds": ["service-1", "service-2"] },
              { "start": "13:00", "end": "19:00", "serviceIds": ["service-1", "service-2", "service-3"] }
            ]
          }
          // ... other days
        }
      }
    ]
  }
}
```

### Scenario C: Service Assignment Analysis

#### Get All Staff Who Can Perform a Specific Service

```json
GET /api/v1/businesses/biz-123/services/service-1/staff

{
  "success": true,
  "data": {
    "serviceId": "service-1",
    "serviceName": "Haircut & Style",
    "assignedStaff": [
      {
        "id": "staff-1",
        "name": "Emma Johnson",
        "title": "Senior Hair Stylist",
        "availability": {
          "Mon": { "isWorking": true, "totalHours": 8 },
          "Tue": { "isWorking": true, "totalHours": 8 },
          "Wed": { "isWorking": true, "totalHours": 8 },
          "Thu": { "isWorking": true, "totalHours": 9 },
          "Fri": { "isWorking": true, "totalHours": 9 },
          "Sat": { "isWorking": false, "totalHours": 0 },
          "Sun": { "isWorking": false, "totalHours": 0 }
        }
      },
      {
        "id": "staff-3",
        "name": "Sarah Williams",
        "title": "Hair Stylist",
        "availability": {
          "Mon": { "isWorking": true, "totalHours": 7.5 },
          "Tue": { "isWorking": true, "totalHours": 7.5 },
          "Wed": { "isWorking": true, "totalHours": 7.5 },
          "Thu": { "isWorking": true, "totalHours": 8.5 },
          "Fri": { "isWorking": true, "totalHours": 8.5 },
          "Sat": { "isWorking": true, "totalHours": 8 },
          "Sun": { "isWorking": true, "totalHours": 6 }
        }
      }
    ],
    "totalStaff": 2
  }
}
```

---

## Integration Testing Checklist

### 1. Create Complete Business

- [ ] Set business hours for all days
- [ ] Create 5+ staff members
- [ ] Assign working hours to all staff
- [ ] Assign services to staff
- [ ] Create 3+ rooms with schedules
- [ ] Create 2+ resources
- [ ] Setup commission policies

### 2. Schedule Management

- [ ] Update staff working hours for single day
- [ ] Create multi-shift day (morning + evening)
- [ ] Add breaks to shifts
- [ ] Create shift overrides for holidays
- [ ] Duplicate shifts across date range
- [ ] Bulk set hours for multiple staff

### 3. Time Off & Reservations

- [ ] Create pending time off request
- [ ] Approve/reject time off
- [ ] Create recurring time off
- [ ] Create time reservation
- [ ] Test conflict detection (overlapping shifts/time off)

### 4. Rooms

- [ ] Create room with full weekly schedule
- [ ] Update room schedule for specific day
- [ ] Create room shift overrides
- [ ] Assign services to rooms
- [ ] Test multi-shift room days

### 5. Commission Policies

- [ ] Create category-wide policy
- [ ] Create service-specific policy
- [ ] Create staff-specific policy
- [ ] Test policy hierarchy (specific overrides general)

### 6. Error Handling

- [ ] Invalid time format (25:00)
- [ ] Start time after end time
- [ ] Overlapping shifts
- [ ] Conflicting time off
- [ ] Missing required fields
- [ ] Invalid staff/room/service IDs
- [ ] Unauthorized access

---

## Performance Considerations

### Recommended Database Indexes

```sql
-- Staff queries
CREATE INDEX idx_staff_business_branch ON staff(business_id, branch_id);
CREATE INDEX idx_staff_active ON staff(business_id, active);

-- Working hours queries
CREATE INDEX idx_staff_hours_staff ON staff_working_hours(staff_id);
CREATE INDEX idx_staff_shifts_staff_day ON staff_shifts(staff_id, day_of_week);

-- Time off queries
CREATE INDEX idx_time_off_staff_date ON time_off_requests(staff_id, start_date, end_date);
CREATE INDEX idx_time_off_status ON time_off_requests(business_id, approved);

-- Room queries
CREATE INDEX idx_rooms_branch ON rooms(business_id, branch_id);
CREATE INDEX idx_room_schedule_room_day ON room_weekly_schedule(room_id, day_of_week);

-- Service assignments
CREATE INDEX idx_staff_services_staff ON staff_service_assignments(staff_id);
CREATE INDEX idx_staff_services_service ON staff_service_assignments(service_id);
```

### Caching Strategy

```javascript
// Cache business hours (24 hour TTL)
cache.set(`business:${businessId}:hours`, businessHours, 86400)

// Cache staff weekly schedules (1 hour TTL)
cache.set(`staff:${staffId}:schedule`, weeklySchedule, 3600)

// Cache room schedules (1 hour TTL)
cache.set(`room:${roomId}:schedule`, weeklySchedule, 3600)

// Invalidate cache on updates
onUpdate('staff.hours', staffId => {
  cache.del(`staff:${staffId}:schedule`)
})
```

---

## End of Mock Examples

For implementation questions, refer to:

- **BACKEND_API_SPECIFICATION.md** - Complete API documentation
- **DATABASE_SCHEMA.md** - Database schema and relationships
