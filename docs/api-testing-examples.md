# Bookly API Testing Examples

This document contains all the curl commands used to test the Bookly API and their actual responses.

---

## Table of Contents

1. [Public Endpoints](#public-endpoints)
2. [User Authentication](#user-authentication)
3. [Business Registration](#business-registration)
4. [Bookings](#bookings)

---

## Public Endpoints

### GET /categories

**Curl Command:**

```bash
curl -s "http://46.101.97.43/categories" | jq '.'
```

**Response:**

```json
[]
```

---

### GET /business (with pagination)

**Curl Command:**

```bash
curl -s "http://46.101.97.43/business?page=1&pageSize=10" | jq '.'
```

**Response:**

```json
[]
```

**Note:** Without pagination parameters, this endpoint returns a 500 error.

---

### GET /business/{id}

**Curl Command:**

```bash
curl -s "http://46.101.97.43/business/cmkbxlz3s000h44lgqxynrv66" | jq '.'
```

**Response:**

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

---

### GET /services

**Curl Command:**

```bash
curl -s "http://46.101.97.43/services" | jq '.'
```

**Response:**

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

---

### GET /services/{id}

**Curl Command:**

```bash
curl -s "http://46.101.97.43/services/cmkbxnjab000o44lg76vlr5ek" | jq '.'
```

**Response:**

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

---

## User Authentication

### POST /auth/register

**Curl Command:**

```bash
curl -s -X POST "http://46.101.97.43/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "password": "testpass123"
  }' | jq '.'
```

**Response:**

```json
{
  "verificationToken": "806043"
}
```

---

### POST /auth/login (Error Case)

**Curl Command:**

```bash
curl -s -X POST "http://46.101.97.43/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=testuser@example.com&password=wrongpass" | jq '.'
```

**Response:**

```json
{
  "statusCode": 401,
  "path": "/auth/login",
  "timestamp": "2026-02-12T05:47:44.066Z",
  "message": "Invalid email or password"
}
```

---

### POST /auth/forget-password (Error Case - User Not Found)

**Curl Command:**

```bash
curl -s -X POST "http://46.101.97.43/auth/forget-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' | jq '.'
```

**Response:**

```json
{
  "statusCode": 500,
  "path": "/auth/forget-password",
  "timestamp": "2026-02-12T05:48:00.494Z",
  "message": "\nInvalid `this.prisma.user.update()` invocation in\n/root/bookly/src/auth/user/user.service.ts:63:41\n\n  60 \n  61 async forgetPass(dto: ForgetPassDto) {\n  62   const { code, expiry } = this.helperAuth.generateVerificationCode();\n→ 63   const user = await this.prisma.user.update(\nAn operation failed because it depends on one or more records that were required but not found. No record was found for an update."
}
```

---

## Business Registration

### POST /business/register

**Curl Command:**

```bash
curl -s -X POST "http://46.101.97.43/business/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Salon",
    "email": "testsalon@example.com",
    "description": "A test salon",
    "owner": {
      "name": "Test Owner",
      "email": "owner@example.com",
      "password": "testpass123"
    }
  }' | jq '.'
```

**Response:**

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

---

## Bookings

### GET /bookings/availability

**Curl Command:**

```bash
curl -s "http://46.101.97.43/bookings/availability?serviceId=cmkbxnjab000o44lg76vlr5ek&branchId=cmkbxn23n000m44lgyd3q9fw7&date=2026-02-15" | jq '.'
```

**Response:**

```json
[]
```

**Note:** Returns empty array when no schedules are configured for the resources.

---

## Additional Testing Commands

### Test with Dynamic Email (to avoid duplicates)

**User Registration:**

```bash
curl -s -X POST "http://46.101.97.43/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser'$(date +%s)'@example.com",
    "password": "testpass123"
  }' | jq '.'
```

**Business Registration:**

```bash
curl -s -X POST "http://46.101.97.43/business/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Salon",
    "email": "testsalon'$(date +%s)'@example.com",
    "description": "A test salon",
    "owner": {
      "name": "Test Owner",
      "email": "owner'$(date +%s)'@example.com",
      "password": "testpass123"
    }
  }' | jq '.'
```

---

## Key Findings

1. **Pagination Required**: The `/business` endpoint requires both `page` and `pageSize` parameters, otherwise returns 500 error
2. **Business Approval**: New businesses start with `approved: false` and require SuperAdmin approval
3. **Verification Tokens**: Both user and business registration return verification tokens
4. **Nested Data**: Business details include deeply nested data (branches → resources → services)
5. **Resource Types**: Resources can be either `STAFF` or `ASSET` type
6. **Error Messages**: Some errors expose internal Prisma stack traces (security concern)
7. **Empty Arrays**: Many endpoints return empty arrays when no data exists (categories, availability, etc.)

---

## Testing Tips

1. Use `$(date +%s)` in emails to generate unique timestamps and avoid duplicate email errors
2. Always include `| jq '.'` to format JSON responses for readability
3. Use `-s` flag with curl to suppress progress bars
4. Save IDs from responses to use in subsequent tests
5. Test both success and error cases to understand API behavior
