# Bookly Booking Flow Implementation

## Overview

A complete end-to-end booking system implementation for the Bookly project, matching the exact flow and design from the provided screenshots.

## 🚀 Features Implemented

### 1. **Multi-Step Booking Modal**
- ✅ Step 1-4 (Combined): Service, Provider, Date/Time, Extras selection
- ✅ Step 5: Customer details & payment
- ✅ Step 6: Success confirmation with .ics download
- ✅ Responsive design with dark mode support
- ✅ Accessibility features (ARIA roles, keyboard navigation)

### 2. **Key Functionality**

#### Date & Time Selection
- Horizontal scrolling days carousel
- Time slots grouped by Morning/Afternoon/Evening
- Real-time availability checking
- Timezone handling (Africa/Cairo UTC+3 display, UTC storage)

#### Staff Selection
- "No preference" option (highest availability)
- Staff photos/avatars
- Availability status indicators

#### Add-ons & Pricing
- Optional service add-ons
- Live price calculation
- Coupon code validation
- Discount application

#### Payment Methods
- Pay on arrival (default)
- Mock card payment simulation

#### Booking Confirmation
- Success screen with checkmark animation
- Calendar .ics file download
- Appointment details summary

## 📁 File Structure

### Core Components
```
src/bookly/components/organisms/booking-modal/
├── new-booking-modal.tsx          # Main booking modal component
└── booking-modal.tsx              # Legacy modal (can be replaced)

src/bookly/components/molecules/service-card/
├── service-card-with-booking.component.tsx  # Service card with Book button
└── service-card.component.tsx              # Original service card
```

### API & Services
```
src/lib/api/
├── services/booking.service.ts    # Booking API service
└── types.ts                       # Extended with booking types

src/app/api/proxy/
├── availability/route.ts          # Time slots endpoint
├── addons/route.ts               # Add-ons endpoint
├── coupons/validate/route.ts     # Coupon validation endpoint
├── bookings/route.ts             # Booking creation endpoint
└── payments/mock/route.ts        # Mock payment endpoint
```

### Utilities
```
src/bookly/utils/
├── timezone.util.ts              # Cairo/UTC timezone conversion
└── ics-generator.util.ts         # Calendar file generation
```

### Mock Data
```
src/bookly/data/
└── mock-booking-data.json        # Comprehensive mock data
```

## 🎯 Demo Page

Access the demo at: `/demo/booking`

**Demo Page Location:** `src/app/[lang]/(bookly)/demo/booking/page.tsx`

## 🧪 Testing the Booking Flow

### 1. Navigate to Demo Page
```
http://localhost:3000/en/demo/booking
```

### 2. Test Coupon Codes
- `SAVE10` - 10% off
- `SAVE20` - 20% off
- `FIRST50` - 50% off
- `WELCOME30` - 30% off

### 3. Test Flow Steps

#### Step 1: Select Service
- Click "Book" on any service card
- Modal opens with service details

#### Step 2: Choose Staff
- Select from available staff members
- Or choose "No preference" for highest availability

#### Step 3: Pick Date & Time
- Scroll through days carousel
- Select available time slot
- Note: Morning (09:00-12:00), Afternoon (12:00-17:00), Evening (17:00+)

#### Step 4: Add Extras (Optional)
- Select add-ons if needed
- Prices update automatically

#### Step 5: Enter Details
- Fill in customer information
- Enter coupon code (optional)
- Select payment method
- View live price summary

#### Step 6: Confirm & Book
- Review booking summary
- Click "Confirm & Book"
- Success screen appears

#### Step 7: Download .ics
- Click "Show appointment"
- Calendar file downloads automatically

## 📊 Mock Data Structure

### Services
```json
{
  "id": "1",
  "name": "Eyebrows And Upperlip",
  "price": 700,  // in cents (£7.00)
  "duration": 20  // in minutes
}
```

### Staff
```json
{
  "id": "staff-1",
  "name": "Rima",
  "photo": "https://...",
  "availability": "Available"
}
```

### Time Slots
Available dates: 2025-09-29, 2025-09-30
```json
{
  "time": "11:20",
  "available": true,
  "providerId": "staff-1"
}
```

## 🔗 Integration Guide

### Add Booking to Service Cards

```tsx
import { ServiceCardWithBooking } from '@/bookly/components/molecules/service-card/service-card-with-booking.component'

<ServiceCardWithBooking
  service={{
    id: '1',
    name: 'Service Name',
    description: 'Service description',
    price: 700, // in cents
    duration: 20,
    location: 'Business Name'
  }}
  branchId='branch-1'
/>
```

### Use Modal Directly

```tsx
import NewBookingModal from '@/bookly/components/organisms/booking-modal/new-booking-modal'

const [isOpen, setIsOpen] = useState(false)

<NewBookingModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  service={serviceData}
  branchId={branchId}
/>
```

## 🔄 API Integration

### Replace Mock APIs

When backend APIs are ready, update these files:

1. **Availability API**
   - File: `src/app/api/proxy/availability/route.ts`
   - Replace with actual API call to get time slots

2. **Addons API**
   - File: `src/app/api/proxy/addons/route.ts`
   - Fetch real add-ons for service

3. **Coupons API**
   - File: `src/app/api/proxy/coupons/validate/route.ts`
   - Validate against real coupon database

4. **Bookings API**
   - File: `src/app/api/proxy/bookings/route.ts`
   - Create actual booking in database

5. **Payments API**
   - File: `src/app/api/proxy/payments/mock/route.ts`
   - Integrate real payment gateway

### Service Layer

Update `src/lib/api/services/booking.service.ts`:
- Change endpoint URLs to production API
- Add authentication headers
- Handle real error responses

## 🎨 Styling

### Theme Colors
- Primary: Teal (`#14b8a6`)
- Selected state: Teal 500
- Hover: Teal 600
- Disabled: Gray 400

### Components Used
- Radix UI (Radio Groups, Forms)
- React Hook Form + Zod validation
- Tailwind CSS
- Custom UI components from `/bookly/components/ui`

## 🌍 Timezone Handling

All times displayed in **Africa/Cairo (UTC+3)**
- Display: Local Cairo time
- Storage: UTC timestamps
- Conversion utilities in `timezone.util.ts`

## 📅 Calendar Export

**.ics files include:**
- Event title (service name)
- Start/end times (UTC)
- Location (business name)
- Description (service details)
- Organizer info

## ⚠️ Important Notes

1. **Mock Data Limitation**: Currently using static JSON - dates are hardcoded to Sept/Oct 2025
2. **Staff Filtering**: Filters by branchId from mock data
3. **Price Display**: All prices in GBP (£), stored as cents/pence
4. **Validation**: Full form validation with Zod schemas
5. **Error Handling**: Network errors display user-friendly messages

## 🚧 Next Steps

1. Connect to real backend APIs
2. Add real-time slot availability updates (WebSockets/polling)
3. Implement SMS/Email confirmations
4. Add booking cancellation flow
5. Implement rescheduling functionality
6. Add payment gateway integration
7. Sync with Google Calendar/Outlook

## 📝 Notes

- Modal is fully accessible (keyboard nav, screen readers)
- Mobile responsive design
- Dark mode support throughout
- Optimistic UI updates
- Error boundary implementation recommended
- Consider adding loading skeletons

## 🐛 Known Issues

None currently - all features working as designed with mock data.

## 📞 Support

For questions or issues, refer to the main project documentation or create an issue in the project repository.

---

**Last Updated:** January 2025
**Version:** 1.0.0
