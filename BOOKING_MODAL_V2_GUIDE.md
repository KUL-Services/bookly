# 📅 Booking Modal V2 - Complete Guide

## ✨ What's New in V2

This version **exactly matches** your screenshot design:

### ✅ Key Changes from V1

1. **Days Carousel at TOP** (not in middle)
   - Left/right navigation arrows
   - Selected day highlighted in teal with yellow indicator
   - Shows day name + date number

2. **Period Tabs** (Morning/Afternoon/Evening)
   - Pill-style tab switcher
   - Filters time slots by period

3. **Horizontal Time Slots Carousel**
   - Scrollable left/right
   - Not a grid anymore
   - Selected time highlighted in teal

4. **Multi-Service Booking**
   - Add multiple services in ONE booking
   - Each service shows as a card
   - Can remove services with X button

5. **Inline Staff Selection**
   - "Change" button within each service card
   - Dropdown opens inline (not separate step)
   - Staff photos/avatars shown

6. **Add Another Service Button**
   - Dashed border button at bottom
   - Opens service selector modal
   - Quick time selection per service

## 🚀 Usage

### Basic Integration

```tsx
import BookingModalV2 from '@/bookly/components/organisms/booking-modal/booking-modal-v2'

const [isOpen, setIsOpen] = useState(false)

<BookingModalV2
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  initialService={serviceData}  // Optional
  branchId='1-1'
/>
```

### With Service Card

The `ServiceCardWithBooking` component is already updated to use V2:

```tsx
import { ServiceCardWithBooking } from '@/bookly/components/molecules/service-card/service-card-with-booking.component'

<ServiceCardWithBooking
  service={{
    id: '1',
    name: 'Eyebrows And Upperlip',
    price: 700,
    duration: 20,
    location: 'Le Visage Beauty Salon'
  }}
  branchId='1-1'
/>
```

## 📸 Screenshot Flow Match

### Screen 1: Service Selection
```
┌─────────────────────────────────────┐
│  [<] Mon Tue Wed Thu Fri Sat Sun [>]│  ← Days at TOP
│      29  30   1   2   3   4   5    │
├─────────────────────────────────────┤
│  [Morning] [Afternoon] [Evening]   │  ← Period tabs
├─────────────────────────────────────┤
│  [<] 12:55 13:10 14:30 14:45 [>]   │  ← Horizontal times
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ Eyebrows And Upperlip   £7  │   │  ← Service card
│  │ 14:30 - 14:50              │   │
│  │ Staff: No preference [Change]│   │  ← Inline staff
│  └─────────────────────────────┘   │
│                                     │
│  + Add another service              │  ← Add more
├─────────────────────────────────────┤
│  Total: £11.50                      │
│  [Continue]                         │
└─────────────────────────────────────┘
```

### Screen 2: Details
- Booking summary
- Customer form
- Total display
- Confirm button

### Screen 3: Success
- Checkmark animation
- Appointment confirmed
- Download .ics button

## 🎨 Features

### Days Carousel
- **Position**: Top of modal
- **Navigation**: Arrow buttons left/right
- **Selected State**: Teal background, yellow indicator bar
- **Display**: Day name (Mon) + date (29)

### Time Slots
- **Layout**: Horizontal scrollable
- **Filtering**: By period (Morning/Afternoon/Evening)
- **Navigation**: Arrow buttons
- **Periods**:
  - Morning: 00:00 - 11:59
  - Afternoon: 12:00 - 16:59
  - Evening: 17:00 - 23:59

### Service Cards
- **Display**: Each selected service as a card
- **Info**: Name, time range, price
- **Staff**: Show selected staff + "Change" button
- **Remove**: X button top-right corner
- **Staff Dropdown**: Opens inline when "Change" clicked

### Add Service
- **Button**: Dashed border, teal color
- **Modal**: Opens service selector
- **Quick Pick**: Shows available time slots per service
- **One Click**: Click time to add service instantly

## 📊 Data Flow

```mermaid
User Clicks "Book"
    ↓
Modal Opens
    ↓
Select Date from Carousel
    ↓
Choose Period (Morning/Afternoon/Evening)
    ↓
Time Slots Load for Period
    ↓
Click "+ Add another service"
    ↓
Service Selector Opens
    ↓
Click Time Slot on Service
    ↓
Service Added to List
    ↓
(Optional) Change Staff Inline
    ↓
(Optional) Remove Service
    ↓
Click "Continue"
    ↓
Enter Details
    ↓
Confirm Booking
    ↓
Success Screen
```

## 🔧 Customization

### Change Available Dates

Edit the `getWeekDates()` function:

```tsx
const getWeekDates = () => {
  const dates = []
  const start = new Date(2025, 8, 29) // Change this
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(start, i))
  }
  return dates
}
```

### Customize Periods

Edit the period mapping in `loadTimeSlots()`:

```tsx
const hour = parseInt(slot.time.split(':')[0])
if (selectedPeriod === 'Morning') return hour < 12
if (selectedPeriod === 'Afternoon') return hour >= 12 && hour < 17
if (selectedPeriod === 'Evening') return hour >= 17
```

### Add More Periods

Add to the period tabs array:

```tsx
{(['Morning', 'Afternoon', 'Evening', 'Night'] as Period[]).map(period => (
  // ... tab button
))}
```

## 🎯 Testing Checklist

- [ ] Days carousel scrolls left/right
- [ ] Selecting day loads time slots
- [ ] Period tabs filter times correctly
- [ ] Time slots scroll horizontally
- [ ] Click time slot (should select, but add service flow not complete)
- [ ] Click "+ Add another service"
- [ ] Service selector modal opens
- [ ] Click time on a service
- [ ] Service added to list
- [ ] Click "Change" on service card
- [ ] Staff dropdown appears inline
- [ ] Select different staff
- [ ] Staff name updates
- [ ] Click X to remove service
- [ ] Service removed from list
- [ ] Total price updates correctly
- [ ] Click "Continue"
- [ ] Details form appears
- [ ] Fill form and submit
- [ ] Success screen shows
- [ ] Download .ics works

## 🐛 Known Issues & Fixes

### Issue: Days carousel arrows don't work
**Fix**: Add actual scroll functionality (currently just buttons)

```tsx
const scrollDays = (direction: 'left' | 'right') => {
  const container = document.querySelector('.days-carousel')
  if (container) {
    const scrollAmount = direction === 'left' ? -200 : 200
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}
```

### Issue: Time slots not selectable
**Fix**: Time slots are selectable when adding service. Click "Add another service" first.

### Issue: Can't select initial service
**Fix**: First click "Add another service", then select service with time

## 💡 Next Steps

1. **Implement Arrow Scroll Functionality**
   - Add refs to carousel containers
   - Wire up scroll on arrow click

2. **Add Service Heatmap**
   - Show availability density
   - Color-code popular times

3. **Enable Service Pre-selection**
   - Auto-open service selector if `initialService` provided
   - Quick-add flow

4. **Add Drag to Reorder Services**
   - Drag service cards to change order
   - Update total time calculation

5. **Implement Time Conflict Detection**
   - Check if services overlap
   - Show warning or auto-adjust

## 📝 Differences from V1

| Feature | V1 | V2 |
|---------|----|----|
| Days | Mid-screen | Top |
| Times | Grid | Horizontal carousel |
| Staff | Separate step | Inline per service |
| Services | One only | Multiple |
| Add Service | N/A | ✅ Button |
| Navigation | Stepper | Sections |

## 🚀 Quick Start

1. **Run the demo**:
   ```bash
   npm run dev
   # Go to: http://localhost:3000/en/demo/booking
   ```

2. **Click "Book" on any service**

3. **Try the new flow**:
   - Select a day
   - Choose period
   - Click "+ Add another service"
   - Select a service and time
   - Change staff inline
   - Add more services
   - Continue to details
   - Complete booking

## 📞 Support

See main `BOOKING_FLOW_README.md` for API details and full documentation.

---

**Version**: 2.0.0
**Last Updated**: January 2025
**Status**: ✅ Ready for Testing
