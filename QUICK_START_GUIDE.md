# 🚀 Staff Management System - Quick Start Guide

## 🎯 How to Access

### Development Server

```bash
npm run dev
```

**URL:** http://localhost:3002 (or next available port)

### Navigate to Staff Management

1. Open browser to http://localhost:3002
2. Navigate to: **Apps > Bookly > Staff Management**
3. Or directly: http://localhost:3002/apps/bookly/staff

---

## 📋 Features Overview

### 5 Main Tabs:

#### 1️⃣ **Staff** Tab

- View all staff members with avatars
- Assign services to staff
- Add/Edit/Delete staff
- Branch filtering
- Visual service chips

**Try It:**

- Click "Assign Services" on any staff member
- Select services from categorized list
- See real-time updates

#### 2️⃣ **Shifts** Tab ⭐ **MAIN FEATURE**

**Day View:**

- Click any staff row to open shift editor
- Edit working hours and breaks
- See business hours (black bar)
- View time off with reason badges
- Drag shifts to different times (NEW!)

**Week View:**

- 7-day overview grid
- Quick week navigation (+1 to +6 weeks)
- See which days staff are working
- Compact shift display

**Bulk Operations:** (NEW!)

1. Enable "Bulk Edit" checkbox
2. Select multiple staff members
3. Click "Bulk Operations" button
4. Choose operation:
   - Set Working Hours
   - Add Time Off
   - Copy Schedule
   - Clear Schedule

**Context Menu:**

- Click 3-dot menu on staff row
- Quick actions: Edit Hours, Add Time Off, etc.

**Print:**

- Click printer icon to print schedule
- Professional landscape layout

#### 3️⃣ **Resources** Tab

- Manage rooms/equipment for static mode
- Assign services to resources
- Track capacity and amenities
- Branch organization

#### 4️⃣ **Rooms** Tab

- Configure room schedules
- Service-specific time slots
- Visual timeline display
- Weekly schedule patterns

#### 5️⃣ **Commissions** Tab

- Create commission policies
- Percentage, Fixed, or Tiered
- Assign to staff and services
- Active/Inactive management

---

## 🎮 Interactive Features to Test

### ✅ Drag & Drop Scheduling

1. Go to Shifts Tab > Day View
2. **Hover** over a shift box (turns green)
3. **Drag** the shift to a different time
4. **Drop** it in new time slot
5. Visual feedback throughout

### ✅ Bulk Operations

1. Enable "Bulk Edit" checkbox
2. Select 2-3 staff members
3. Click "Bulk Operations" button
4. Try "Set Working Hours":
   - Select days (Mon, Tue, Wed)
   - Set time range
   - Click Apply
5. All selected staff updated at once

### ✅ Business Hours Editor

1. Shifts Tab > Click "Edit" next to Business Hours
2. Toggle days open/closed
3. Set opening hours per day
4. Add breaks
5. See duration calculated automatically

### ✅ Shift Editor

1. Click any shift box in Shifts Tab
2. Modal opens with:
   - Working toggle
   - Start/End time pickers
   - Break management
   - Duration display
   - Business hours warning (if outside)

### ✅ Time Off Request

1. Click 3-dot menu on staff
2. Select "Add Time Off"
3. Choose reason (Sick, Vacation, etc.)
4. Set date range
5. Add notes
6. See it appear in schedule

---

## 🎨 Visual Elements

### Color Coding:

- **Green Shift Boxes:** Working hours
- **Dark Grey Boxes:** Time off
- **Black Bar:** Business hours
- **Grey with "Closed":** Business closed that day
- **Teal Accents:** Interactive elements
- **Dashed Border:** Empty/hoverable slots

### Icons:

- ✏️ Edit buttons
- 🗑️ Delete actions
- ➕ Add new items
- 📅 Calendar picker
- 🖨️ Print schedule
- ⋮ Context menu

---

## 📊 Mock Data Included

### Pre-populated:

- **7 Staff Members** (various roles)
- **3 Branches** (Beverly Hills, Downtown, Santa Monica)
- **15+ Services** (categorized)
- **Business Hours** (Mon-Sat open, Wed closed)
- **Working Hours** for all staff
- **Time Off Requests** (some approved)
- **Resources** (3 rooms)
- **Rooms** (2 studios with schedules)
- **Commission Policies** (3 different types)

---

## 🔍 Things to Inspect

### 1. **Responsive Design**

- Resize browser window
- Check mobile view (< 768px)
- Tablet view (768px - 1024px)
- Desktop view (> 1024px)

### 2. **Accessibility**

- Tab through interface with keyboard
- All buttons focusable
- Proper ARIA labels
- Screen reader friendly

### 3. **State Management**

- Open browser DevTools
- Check React DevTools
- Zustand store visible
- State updates reflected immediately

### 4. **Error Handling**

- Try invalid time ranges
- Test overlapping shifts
- Validation messages appear
- User-friendly error text

---

## 🛠️ Developer Tools

### Browser DevTools:

```
F12 or Cmd+Option+I (Mac)
```

### React DevTools:

- Install Chrome extension
- View component tree
- Inspect props and state
- Profile performance

### Zustand DevTools:

- Check store state
- Track actions
- Time-travel debugging

---

## 📱 Mobile Testing

### Responsive Breakpoints:

- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

### Features on Mobile:

- ✅ Touch-friendly tap targets (44x44px)
- ✅ Collapsible sections
- ✅ Horizontal scroll for tables
- ✅ Adaptive grid layouts
- ✅ Bottom sheet modals

---

## 🎯 Key Interactions

### Quick Actions:

1. **Add Staff:** Click "+ Add Staff" button
2. **Edit Staff:** Click edit icon on staff row
3. **Assign Services:** Click "Assign Services" button
4. **Edit Shift:** Click any shift box
5. **Add Time Off:** Use context menu (3 dots)
6. **Edit Business Hours:** Click edit next to Business Hours bar
7. **Print Schedule:** Click printer icon
8. **Jump to Date:** Click calendar icon, select date
9. **Jump Week:** Click +1, +2, etc. buttons
10. **Switch View:** Day/Week dropdown

---

## 🐛 Troubleshooting

### Common Issues:

**Port Already in Use:**

```bash
# Server will auto-try next port (3001, 3002, etc.)
# Or manually kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module Not Found:**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Type Errors:**

```bash
# Restart TypeScript server in VSCode
Cmd+Shift+P > "TypeScript: Restart TS Server"
```

**Browser Cache:**

```bash
# Hard refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

## 📚 Related Documentation

### Must Read:

1. **BACKEND_API_SPECIFICATION.md** - Complete API docs
2. **DATABASE_SCHEMA.md** - Database structure
3. **BACKEND_MOCK_EXAMPLES.md** - Real-world scenarios
4. **STAFF_MANAGEMENT_COMPLETE_FINAL.md** - This implementation summary

### Code Files:

- `/src/bookly/features/staff-management/` - All components
- `/src/bookly/data/staff-management-mock-data.ts` - Mock data
- `/src/bookly/features/calendar/types.ts` - Type definitions
- `/src/views/apps/bookly/staff/StaffManagement.tsx` - Main container

---

## 🎉 Have Fun Testing!

The staff management system is **100% complete** and ready to explore. All features are functional with mock data.

### Top Features to Show Off:

1. ⭐ **Drag & Drop** shift rescheduling
2. ⭐ **Bulk Operations** for efficiency
3. ⭐ **Beautiful UI** with smooth animations
4. ⭐ **Complete workflow** from business setup to scheduling
5. ⭐ **Mobile responsive** design

**Enjoy exploring!** 🚀

---

**Quick Links:**

- Development Server: http://localhost:3002
- Staff Management: http://localhost:3002/apps/bookly/staff
- GitHub: (your repo URL)
- Documentation: See `.md` files in project root
