# Branch Services & Staff - Frontend/Backend Alignment

## Overview

This document outlines the alignment status between frontend and backend for branch management, specifically focusing on services and staff assignment.

## ✅ All Issues Resolved (2026-02-23)

### 1. Branch Services

| Aspect                                                     | Status     |
| ---------------------------------------------------------- | ---------- |
| `GET /admin/branches` returns `services[]`                 | ✅ Working |
| `POST /admin/branches` with `serviceIds` connects services | ✅ Working |
| `PATCH /admin/branches` with `serviceIds` updates services | ✅ Working |
| Create/Update responses include `services[]`               | ✅ Fixed   |

### 2. Staff-to-Branch Assignment

| Aspect                                                          | Status                 |
| --------------------------------------------------------------- | ---------------------- |
| Staff have `branchId` field                                     | ✅ Working as designed |
| No `staffIds` on branch endpoints                               | ✅ Correct (by design) |
| Branch response includes `resources[]` (which contains staff)   | ✅ Working             |
| Staff reassignment to different branch via `PATCH /admin/staff` | ✅ Working             |

## Backend Changes Made

**`branch.service.ts`:**

- Added `include: { services: true, resources: true }` to both `create()` and `update()` methods

## Frontend Changes Made

### `branches-store.ts`

1. Added `availableServices` state and `fetchServices()` action to load real services from API
2. Updated `mapApiBranch()` to extract staff from `resources[]` array (staff are resources with `type: 'STAFF'`)

### `branch-editor-drawer.tsx`

1. Removed mock data imports
2. Now fetches real services via `fetchServices()` from branches store
3. Now fetches real staff via `useStaffManagementStore().staffMembers`
4. Added info alert explaining staff-to-branch assignment is done via Staff Management

## API Response Example

```json
// PATCH /admin/branches
{
  "id": "branch-uuid",
  "name": "Downtown Branch",
  "services": [
    { "id": "svc-1", "name": "Swedish Massage", ... },
    { "id": "svc-2", "name": "Deep Cleansing Facial", ... }
  ],
  "resources": [
    { "id": "staff-1", "name": "Sarah Jones", "type": "STAFF", ... }
  ]
}
```

## Architecture Notes

### Staff Assignment Flow

Staff are assigned to branches by setting `branchId` on each Staff record via the Staff API, NOT via branch endpoints. This is by design.

```typescript
// Correct way to assign staff to branch
StaffService.updateStaff({ id: staffId, branchId: branchId })
```

**Staff Reassignment:** To move a staff member from one branch to another, simply update their `branchId`:

```typescript
// Reassign staff to a different branch
PATCH /admin/staff
{
  "id": "staff-uuid",
  "branchId": "new-branch-uuid"
}
```

The backend validates that the new branch belongs to the same business before allowing the reassignment.

### Services Assignment Flow

Services are assigned to branches via `serviceIds` in branch create/update requests.

```typescript
// Correct way to assign services to branch
BranchesService.createBranch({
  name: 'Branch Name',
  serviceIds: ['service-1', 'service-2']
})
```

## Files Modified

### Frontend

- `src/bookly/features/branches/branches-store.ts`
- `src/bookly/features/branches/branch-editor-drawer.tsx`

### Backend

- `branch.service.ts` - Added includes for relations in create/update responses
