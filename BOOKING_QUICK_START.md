# 🚀 Booking System Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1️⃣ View the Demo
```bash
npm run dev
# Navigate to: http://localhost:3000/en/demo/booking
```

### 2️⃣ Test the Flow
1. Click "Book" on any service
2. Choose staff (or "No preference")
3. Pick date: **Monday 29** or **Tuesday 30**
4. Select time slot
5. Fill details & use coupon: `SAVE20`
6. Confirm booking
7. Download calendar file

### 3️⃣ Integrate into Your Pages

```tsx
import { ServiceCardWithBooking } from '@/bookly/components/molecules/service-card/service-card-with-booking.component'

// In your component
<ServiceCardWithBooking
  service={{
    id: '1',
    name: 'Eyebrows And Upperlip',
    description: 'Professional service',
    price: 700,        // £7.00 (in pence)
    duration: 20,      // 20 minutes
    location: 'Le Visage Beauty Salon',
    business: { name: 'Le Visage Beauty Salon' }
  }}
  branchId='1-1'
/>
```

## 🎟️ Test Coupons

| Code | Discount |
|------|----------|
| `SAVE10` | 10% off |
| `SAVE20` | 20% off |
| `FIRST50` | 50% off |
| `WELCOME30` | 30% off |

## 📁 Key Files

### Components
- **Main Modal**: `src/bookly/components/organisms/booking-modal/new-booking-modal.tsx`
- **Service Card**: `src/bookly/components/molecules/service-card/service-card-with-booking.component.tsx`

### Mock Data
- **All Mock Data**: `src/bookly/data/mock-booking-data.json`

### API Routes
- `src/app/api/proxy/availability/route.ts` - Time slots
- `src/app/api/proxy/addons/route.ts` - Add-ons
- `src/app/api/proxy/coupons/validate/route.ts` - Coupons
- `src/app/api/proxy/bookings/route.ts` - Create booking
- `src/app/api/proxy/payments/mock/route.ts` - Mock payment

## 🔧 Customization

### Change Timezone (Default: Cairo UTC+3)
Edit: `src/bookly/utils/timezone.util.ts`
```ts
export const CAIRO_TIMEZONE = 'Africa/Cairo'
export const CAIRO_UTC_OFFSET = 3 * 60 * 60 * 1000
```

### Add New Services
Edit: `src/bookly/data/mock-booking-data.json`
```json
{
  "services": [
    {
      "id": "new-1",
      "name": "New Service",
      "price": 1500,  // £15.00
      "duration": 30,
      "branchIds": ["1-1"]
    }
  ]
}
```

### Add New Time Slots
```json
{
  "timeSlots": {
    "2025-10-01": [
      { "time": "09:00", "available": true, "providerId": "staff-1" }
    ]
  }
}
```

## ✅ Features Checklist

- ✅ Multi-step booking flow
- ✅ Staff selection with photos
- ✅ Date carousel (horizontal scroll)
- ✅ Time slots by period (Morning/Afternoon/Evening)
- ✅ Add-ons & extras
- ✅ Coupon validation
- ✅ Live price calculation
- ✅ Payment methods (Pay on arrival / Mock card)
- ✅ Success screen
- ✅ .ics calendar download
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Timezone handling (Cairo/UTC)

## 🎨 UI Components Used

- **Forms**: React Hook Form + Zod
- **UI**: Custom components from `/bookly/components/ui`
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Radio Groups**: Radix UI

## 🔄 When APIs are Ready

Replace mock implementations in:
1. `src/app/api/proxy/*` - All route handlers
2. `src/lib/api/services/booking.service.ts` - Service methods

Keep the same data structure for seamless migration!

## 📱 Testing Checklist

- [ ] Open demo page
- [ ] Select service
- [ ] Choose staff
- [ ] Pick date (Mon 29 or Tue 30)
- [ ] Select time slot
- [ ] Add optional extras
- [ ] Enter customer details
- [ ] Apply coupon code
- [ ] Confirm booking
- [ ] Download .ics file
- [ ] Test on mobile
- [ ] Test dark mode

## 💡 Pro Tips

1. **Prices**: Always in pence (700 = £7.00)
2. **Dates**: Use YYYY-MM-DD format
3. **Times**: Use HH:mm 24-hour format
4. **Staff ID**: Use 'no-preference' for any available
5. **Branch ID**: Required for staff filtering

## 🐛 Troubleshooting

**Modal doesn't open?**
- Check service prop includes all required fields
- Ensure branchId is valid

**No time slots showing?**
- Check date is 2025-09-29 or 2025-09-30
- Verify staff selection
- Check console for API errors

**Coupon not working?**
- Use uppercase: `SAVE20` not `save20`
- Verify code exists in mock-booking-data.json

**Price incorrect?**
- Confirm price is in pence (multiply by 100)
- Check addon prices (also in pence)

## 📚 More Info

See `BOOKING_FLOW_README.md` for detailed documentation.

---

**Happy Booking! 🎉**
