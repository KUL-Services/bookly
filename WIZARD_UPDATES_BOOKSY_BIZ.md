# Business Registration Wizard - Booksy Biz Updates

## Overview

This document describes the critical updates made to the Business Registration Wizard based on analysis of 25 Booksy Biz screenshots. The wizard now has **6 steps** (OTP hidden for Egypt) and includes three major improvements:

1. **Enhanced Mobile Stepper** - Visible green progress bar with icons
2. **Google Maps Address Autocomplete** - Professional address search
3. **Staff Management Step** - Add team members (minimum 1 required)

---

## What's New

### 1. Mobile Stepper Improvements ✅

**Problem**: Original mobile stepper used simple gray bars that were hard to see. Progress bar and step icons would disappear on small screens.

**Solution**: Redesigned mobile stepper matching Booksy Biz style:
- **Prominent green progress bars** with shadow effects
- **Step icons displayed below progress** with labels
- **Smooth animations** and transitions
- **Active step highlighted** with larger icon and primary color
- **Responsive sizing** - adapts to screen width

**File**: [src/views/RegisterWizard/index.tsx](./src/views/RegisterWizard/index.tsx#L265-L303)

```tsx
{/* Mobile Progress Bar - Styled like Booksy Biz */}
<Box className="md:hidden mb-6">
  <div className="flex gap-1.5 mb-3">
    {steps.map((_, index) => (
      <div
        key={index}
        className={classnames('flex-1 h-1.5 rounded-full transition-all duration-300', {
          'bg-primary shadow-sm': index <= activeStep,
          'bg-gray-200': index > activeStep
        })}
      />
    ))}
  </div>
  {/* Mobile Step Icons */}
  <div className="flex justify-between items-center px-1">
    {steps.map((step, index) => (
      <div key={index} className="flex flex-col items-center gap-1">
        <Avatar
          variant="rounded"
          className={classnames('cursor-pointer transition-all duration-300', {
            'bg-primary text-white shadow-md scale-110': activeStep === index,
            'bg-primaryLight text-primary': activeStep > index && activeStep !== index,
            'bg-gray-200 text-gray-400': activeStep < index
          })}
          onClick={handleStep(index)}
          sx={{ width: 32, height: 32 }}
        >
          <i className={`${step.icon} text-sm`} />
        </Avatar>
        <Typography className={classnames('text-[10px] font-medium text-center', {
          'text-primary': index <= activeStep,
          'text-gray-400': index > activeStep
        })}>
          {step.title}
        </Typography>
      </div>
    ))}
  </div>
</Box>
```

---

### 2. Google Maps Places Autocomplete ✅

**Problem**: Original location step used manual text input fields. Booksy Biz uses Google Maps autocomplete for professional address search.

**Solution**: Implemented Google Maps Places API integration:
- **Smart address search** with autocomplete dropdown
- **Automatic field population** from selected place
- **Dual mode**: Google Maps search OR manual entry
- **Extracts all address components** (street, city, state, postal code, country, coordinates)
- **Fallback to manual entry** if Google Maps API not available
- **Mobile-optimized** search interface

**New Component**: [src/views/RegisterWizard/components/GooglePlacesAutocomplete.tsx](./src/views/RegisterWizard/components/GooglePlacesAutocomplete.tsx)

**Updated Step**: [src/views/RegisterWizard/steps/LocationStep.tsx](./src/views/RegisterWizard/steps/LocationStep.tsx)

**Features**:
- Real-time address suggestions as you type
- Extracts latitude/longitude for mapping
- Stores formatted address and place ID
- Toggle between Google Maps and manual entry
- Shows confirmation when address is selected

**Usage**:
```tsx
<GooglePlacesAutocomplete
  value={formData.formattedAddress || formData.addressLine1}
  onChange={(value) => updateFormData({ addressLine1: value })}
  onPlaceSelected={handlePlaceSelected}
  error={!!validationErrors.addressLine1}
  helperText="Start typing to search for your address"
  label="Search Your Address"
  placeholder="123 Main Street, Cairo..."
/>
```

---

### 3. Staff Management Step ✅

**Problem**: Original wizard didn't include staff management. Booksy Biz requires at least 1 staff member (the owner).

**Solution**: Added new dedicated Staff Management step (Step 6):
- **Owner auto-added** from Account step (uses ownerName field)
- **Add unlimited staff members** with name and role
- **Edit/Delete functionality** for non-owner staff
- **Visual cards** with avatars and role badges
- **Validation**: Minimum 1 staff member required (owner)
- **Dialog-based** add/edit interface

**New Component**: [src/views/RegisterWizard/steps/StaffManagementStep.tsx](./src/views/RegisterWizard/steps/StaffManagementStep.tsx)

**Features**:
- Owner is protected (cannot be deleted, marked with "You" badge)
- Add staff with name and role (e.g., "Ahmed Hassan - Barber")
- Clean card-based UI with avatar initials
- Edit/delete buttons for team members
- Dialog for adding/editing staff details

**Data Structure**:
```typescript
interface StaffMember {
  id: string
  name: string
  role: string
  isOwner?: boolean
}
```

---

## Updated Flow (6 Steps)

1. **Account** - Name, email, password *(NEW: Added owner name field)*
2. ~~**Mobile Verification**~~ - *Hidden for Egypt deployment*
3. **Business** - Business name, type, services
4. **Location** - Address via Google Maps *(NEW: Google autocomplete)*
5. **Profile** - URL slug, timezone, working hours
6. **Staff** - Add team members *(NEW: Staff management)*
7. **Legal** - Terms, privacy, marketing opt-in

---

## Setup Instructions

### Google Maps API Configuration

#### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **"Places API"** and **"Maps JavaScript API"**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Restrict the API key:
   - **Application restrictions**: HTTP referrers (websites)
   - **Add your domain**: `yourdomain.com/*`, `localhost:3000/*` (for dev)
   - **API restrictions**: Select "Places API" and "Maps JavaScript API"

#### 2. Add API Key to Environment Variables

Create or update `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_your_actual_api_key_here
```

**IMPORTANT**: The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

#### 3. Restart Development Server

```bash
npm run dev
```

The Google Maps script will now load automatically on the registration page.

---

## Technical Changes Summary

### New Files Created

1. **`src/views/RegisterWizard/components/GooglePlacesAutocomplete.tsx`**
   - Google Maps Places autocomplete component
   - Handles API loading, place selection, error states
   - Auto-initializes when Google Maps API is ready

2. **`src/views/RegisterWizard/steps/StaffManagementStep.tsx`**
   - Staff management interface
   - Add/edit/delete staff members
   - Auto-adds owner from account step

### Modified Files

1. **`src/views/RegisterWizard/types.ts`**
   - Added `StaffMember` interface
   - Added `ownerName` to registration data
   - Added `staff[]` array to registration data
   - Added `placeId`, `formattedAddress` for Google Maps integration

2. **`src/views/RegisterWizard/utils.ts`**
   - Added `ownerName: ''` to initial form data
   - Added `staff: []` to initial form data

3. **`src/views/RegisterWizard/steps/AccountStep.tsx`**
   - Added "Your Full Name" field for owner name
   - Validation for owner name (minimum 2 characters)
   - Auto-fills staff owner in Staff Management step

4. **`src/views/RegisterWizard/steps/LocationStep.tsx`**
   - Integrated Google Maps Places autocomplete
   - Added toggle between Google Maps and manual entry
   - Added place selection handler with address extraction
   - Shows confirmation when address is selected from Google

5. **`src/views/RegisterWizard/index.tsx`**
   - Updated mobile stepper with enhanced styling
   - Added Staff Management step to steps array
   - Updated step count from 5 to 6
   - Added StaffManagementStep to render switch

6. **`src/app/[lang]/(blank-layout-pages)/(guest-only)/register/page.tsx`**
   - Added Google Maps API script loading
   - Loads script with `beforeInteractive` strategy
   - Only loads if API key is present

---

## Testing Checklist

### Mobile Stepper
- [x] Green progress bars visible on mobile
- [x] Step icons display below progress bar
- [x] Active step highlighted with larger icon
- [x] Smooth transitions between steps
- [x] Step labels readable on all screen sizes

### Google Maps Autocomplete
- [ ] Search box appears on Location step
- [ ] Autocomplete suggestions appear while typing
- [ ] Selecting an address populates all fields automatically
- [ ] City, state, postal code, country extracted correctly
- [ ] Latitude/longitude stored for mapping
- [ ] Can toggle to manual entry mode
- [ ] Manual entry works if API key missing
- [ ] Error message shown if API fails to load

### Staff Management
- [ ] Owner auto-added from account name
- [ ] Owner has "You" badge and cannot be deleted
- [ ] Can add new staff members
- [ ] Staff card shows name, role, avatar
- [ ] Can edit staff member details
- [ ] Can delete non-owner staff
- [ ] Validation requires at least 1 staff
- [ ] Cannot proceed without owner

### Complete Flow
- [ ] All 6 steps complete successfully
- [ ] Form data persists in localStorage
- [ ] Draft restoration works on refresh
- [ ] No TypeScript errors
- [ ] Mobile responsive on all steps
- [ ] Validation works on all fields

---

## Environment Variables Required

```bash
# Google Maps API Key (required for address autocomplete)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## API Integration Notes

### Location Data Structure

When a place is selected from Google Maps, the following data is stored:

```typescript
{
  formattedAddress: "123 Main St, Cairo, Egypt"
  placeId: "ChIJ..."
  addressLine1: "123 Main St"
  city: "Cairo"
  state: "Cairo Governorate"
  postalCode: "12345"
  country: "EG"
  latitude: 30.0444
  longitude: 31.2357
}
```

### Staff Data Structure

```typescript
{
  staff: [
    {
      id: "owner",
      name: "John Doe",
      role: "Owner",
      isOwner: true
    },
    {
      id: "staff-1234567890",
      name: "Ahmed Hassan",
      role: "Barber",
      isOwner: false
    }
  ]
}
```

---

## Troubleshooting

### Google Maps not loading?

1. Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
2. Restart dev server after adding API key
3. Check browser console for API errors
4. Verify API key is enabled for "Places API" and "Maps JavaScript API"
5. Check API key restrictions allow your domain

### Address autocomplete not working?

1. Open browser console and check for errors
2. Verify Google Maps script loaded (check Network tab)
3. Try toggling to manual entry mode as fallback
4. Check API quota limits in Google Cloud Console

### Staff not appearing?

1. Ensure owner name was filled in Account step
2. Check browser console for errors
3. Verify form data in localStorage includes `ownerName` and `staff`

---

## Future Enhancements

- [ ] Add map preview when address is selected
- [ ] Service area selection for mobile-only businesses
- [ ] Staff availability scheduling
- [ ] Staff photo uploads
- [ ] Staff permissions and roles
- [ ] Bulk staff import from CSV
- [ ] Integration with actual backend APIs

---

## License

Commercial - Part of Bookly codebase

---

## Support

For questions or issues:
1. Check this documentation
2. Review [RegisterWizard README](./src/views/RegisterWizard/README.md)
3. Test with the provided setup instructions
4. Verify environment variables are set correctly
