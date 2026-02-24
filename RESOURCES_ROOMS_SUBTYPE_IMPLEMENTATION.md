# Resources vs Rooms - SubType Implementation

## Overview

This document summarizes the frontend implementation changes to properly distinguish between **Rooms** and **Resources (Equipment)** using the `subType` field.

## Key Concept

| Entity             | SubType       | Purpose                                                                    | Tab           |
| ------------------ | ------------- | -------------------------------------------------------------------------- | ------------- |
| Room               | `'ROOM'`      | Physical locations where services happen (e.g., Yoga Room, Treatment Room) | Rooms Tab     |
| Equipment/Resource | `'EQUIPMENT'` | Tools/equipment used during services (e.g., Barber Chair, Massage Table)   | Resources Tab |

## Backend Requirements (For Reference)

The backend needs to support:

1. **`subType` field on Asset** - Distinguishes ROOM vs EQUIPMENT
2. **Service ↔ Resource linkage** - Many-to-many `service_resources` table
3. **Resource availability check** - During booking flow, check capacity constraints
4. **Resource assignment per booking** - Track which resource unit is used
5. **Slots API factors in resource capacity** - Time slot availability considers resource availability

## Frontend Changes Made

### 1. API Types (`src/lib/api/types.ts`)

```typescript
// Added new type
export type AssetSubType = 'ROOM' | 'EQUIPMENT'

// Updated Asset interface
export interface Asset {
  id: string
  name: string
  type: 'ASSET'
  subType?: AssetSubType // NEW: Distinguishes between ROOM and EQUIPMENT
  // ... other fields
}

// Updated request types
export interface CreateAssetResourceRequest {
  // ...
  subType?: AssetSubType // NEW
}

export interface UpdateAssetResourceRequest {
  // ...
  subType?: AssetSubType // NEW
}
```

### 2. Calendar Types (`src/bookly/features/calendar/types.ts`)

```typescript
export interface Resource {
  id: string
  branchId: string
  name: string
  type?: 'staff' | 'equipment' | 'room' | string
  subType?: 'ROOM' | 'EQUIPMENT' // NEW: Backend discriminator
  capacity: number
  description?: string
  serviceIds?: string[]
}
```

### 3. Staff Store (`src/bookly/features/staff-management/staff-store.ts`)

#### `fetchResourcesFromApi()` - Now separates ROOM vs EQUIPMENT:

```typescript
fetchResourcesFromApi: async () => {
  const result = await AssetsService.getAssets()

  // Filter equipment resources (subType === 'EQUIPMENT')
  const equipmentAssets = result.data.filter(
    asset => asset.subType === 'EQUIPMENT' || (!asset.subType && asset.type !== 'ROOM')
  )
  set({ resources: equipmentAssets.map(...) })

  // Filter room assets (subType === 'ROOM')
  const roomAssets = result.data.filter(
    asset => asset.subType === 'ROOM' || (!asset.subType && asset.type === 'ROOM')
  )
  set({ rooms: roomAssets.map(...) })
}
```

#### `createResource()` - Sends `subType: 'EQUIPMENT'`:

```typescript
createResource: async resource => {
  const assetData = {
    name: resource.name,
    subType: 'EQUIPMENT' as const, // Always EQUIPMENT for resources
    branchId: resource.branchId,
    maxConcurrent: resource.capacity,
    serviceIds: resource.serviceIds || []
  }
  await AssetsService.createAsset(assetData)
}
```

#### `createRoom()` - Sends `subType: 'ROOM'`:

```typescript
createRoom: async room => {
  const assetData = {
    name: room.name,
    subType: 'ROOM' as const, // Always ROOM for rooms
    branchId: room.branchId,
    maxConcurrent: room.capacity,
    serviceIds: room.serviceIds || []
  }
  await AssetsService.createAsset(assetData)
}
```

### 4. UI Components Updated

All components now use API data (`apiBranches`, `apiServices`) instead of mock data:

- `resource-editor-drawer.tsx` - Uses `apiBranches` and `apiServices`
- `room-editor-drawer.tsx` - Uses `apiBranches` and `apiServices`
- `resource-assign-services-modal.tsx` - Uses `apiServices`

## How It Works

### Resources Tab (Equipment)

- Shows only assets with `subType === 'EQUIPMENT'`
- Focuses on **capacity** (maxConcurrent) - e.g., 3 barber chairs
- Creates new assets with `subType: 'EQUIPMENT'`

### Rooms Tab

- Shows only assets with `subType === 'ROOM'`
- Maintains **Timeline View** for room schedules
- Creates new assets with `subType: 'ROOM'`

## Backward Compatibility

For assets that don't have a `subType` set (legacy data):

- Assets without `subType` are treated based on their `type` field
- `type === 'ROOM'` → goes to Rooms tab
- Otherwise → goes to Resources tab

## Backend API Changes Required

The backend needs to:

1. Add `subType` column to the Asset table (enum: 'ROOM' | 'EQUIPMENT')
2. Accept `subType` in POST/PATCH requests
3. Return `subType` in GET responses
4. Eventually: Factor `subType` into availability calculations

## Testing

1. Create a new **Room** via Rooms Tab → Verify API receives `subType: 'ROOM'`
2. Create a new **Resource** via Resources Tab → Verify API receives `subType: 'EQUIPMENT'`
3. Fetch assets → Verify they appear in the correct tab based on `subType`
4. Edit existing assets → Verify updates work correctly
