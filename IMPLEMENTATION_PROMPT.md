# Bookly Staff & Resource Management Prompt

This prompt can be passed directly to Claude (or any other coding agent) to implement the full staff/resource/shift flow that matches the provided screenshots. It assumes the agent has access to this repository, all mock data, and the assets under `imgs_flow/`.

---

## 1. Context & Assets

- **Primary spec**: `BUSINESS_LOGIC.md`
- **Extended model**: “New Business Model” section below (paste into the main doc if it’s missing before running the prompt).
- **Visual references**: screenshots inside `imgs_flow/` (see Image Guide).
- **Tech stack**: Next.js, React, TypeScript, MUI, Zustand. Keep existing theming (Bookly teal/purple palette).

---

## 2. New Business Model (add to BUSINESS_LOGIC.md if not already present)

```ts
type SchedulingMode = 'dynamic' | 'static'

interface Business {
  id: string
  name: string
  schedulingMode: SchedulingMode
  branches: Branch[]
  workingHours: WeeklyBusinessHours
  staff: StaffMember[]
  services: Service[]
  resources?: Resource[]
  scheduleTemplates?: ScheduleTemplate[]
  staticSlots?: StaticServiceSlot[]
  shiftRules: ShiftRuleSet
  commissionPolicies: CommissionPolicy[]
}

interface StaffMember {
  id: string
  name: string
  role: 'owner' | 'manager' | 'staff'
  branchIds: string[]
  serviceIds: string[]
  color: string
  workingHours: WeeklyStaffHours
  shiftOverrides: StaffShiftInstance[]
  breaks?: BreakTemplate[]
  timeOffRequests: TimeOffRequest[]
  timeReservations: TimeReservation[]
}

interface WeeklyBusinessHours {
  [day in DayOfWeek]: {
    isOpen: boolean
    shifts: { start: string; end: string }[]
  }
}

interface WeeklyStaffHours {
  [day in DayOfWeek]: {
    isWorking: boolean
    shifts: StaffShift[]
  }
}

interface StaffShift {
  id: string
  start: string
  end: string
  breaks?: BreakRange[]
}

interface BreakRange { id: string; start: string; end: string }

interface StaffShiftInstance extends StaffShift {
  date: string
  reason?: 'manual' | 'business_hours_change' | 'copy'
}

interface TimeReservation {
  id: string
  staffId: string
  start: Date
  end: Date
  reason: string
  note?: string
}

type TimeOffReasonGroup = 'Personal' | 'Sick' | 'Vacation' | 'Training' | 'No-Show' | 'Late' | 'Other'

interface TimeOffRequest {
  id: string
  staffId: string
  range: { start: Date; end: Date }
  allDay: boolean
  repeat?: { until: Date }
  reason: TimeOffReasonGroup
  approved: boolean
}

interface Resource {
  id: string
  branchId: string
  name: string
  capacity: number
  amenities: string[]
  color?: string
}

interface Service {
  id: string
  name: string
  categoryId?: string
  durationMinutes: number
  price: number
  defaultCapacity?: number
  isGroup?: boolean
}

interface CommissionPolicy {
  id: string
  scope: 'serviceCategory' | 'service' | 'product' | 'giftCard' | 'membership' | 'package'
  scopeRefId?: string
  type: 'percent' | 'fixed'
  value: number
  appliesTo: 'serviceProvider' | 'seller'
  staffScope: 'all' | { staffIds: string[] }
}

interface ShiftRuleSet {
  duplication: { allowCopy: boolean; allowPrint: boolean }
  tutorialsSeen: boolean
}
```

---

## 3. Image Guide (`imgs_flow/…`)

| # | Filename | Description |
|---|----------|-------------|
| 1 | Screenshot 2025-11-08 at 5.26.11 am.png | Calendar quick action menu (New appointment, Add Time Reservation, Add Time Off) |
| 2 | Screenshot 2025-11-08 at 5.26.26 am.png | Add Time Reservation modal |
| 3 | Screenshot 2025-11-08 at 5.26.59 am.png | Add Time Off (all-day, reason dropdown) |
| 4 | Screenshot 2025-11-08 at 5.27.06 am.png | Add Time Off reason list (attendance reasons) |
| 5 | Screenshot 2025-11-08 at 5.27.09 am.png | Add Time Off reason list (personal/sick/etc.) |
| 6 | Screenshot 2025-11-08 at 5.27.23 am.png | Hourly time off entry |
| 7 | Screenshot 2025-11-08 at 5.27.32 am.png | Time off with repeat options |
| 8 | Screenshot 2025-11-08 at 5.27.50 am.png | Shifts tab tutorial (adjust views) |
| 9 | Screenshot 2025-11-08 at 5.27.55 am.png | Shifts tab tutorial (business hours) |
| 10 | Screenshot 2025-11-08 at 5.27.59 am.png | Shifts tab tutorial (single-day business hours) |
| 11 | Screenshot 2025-11-08 at 5.28.14 am.png | Shifts tab tutorial (modify default shifts) |
| 12 | Screenshot 2025-11-08 at 5.28.18 am.png | Shifts tab tutorial (edit single shift) |
| 13 | Screenshot 2025-11-08 at 5.28.27 am.png | Shifts tab tutorial (duplicate/print) |
| 14 | Screenshot 2025-11-08 at 5.28.38 am.png | Shifts tab tutorial (Add time off CTA) |
| 15 | Screenshot 2025-11-08 at 5.28.57 am.png | Add Time Off modal with staff selector |
| 16 | Screenshot 2025-11-08 at 5.29.02 am.png | Add Time Off modal – multi select example |
| 17 | Screenshot 2025-11-08 at 5.29.33 am.png | Edit Shift modal (toggle off state) |
| 18 | Screenshot 2025-11-08 at 5.29.44 am.png | Edit Shift modal (time dropdown) |
| 19 | Screenshot 2025-11-08 at 5.30.04 am.png | Edit Shift modal (duration indicator) |
| 20 | Screenshot 2025-11-08 at 5.30.12 am.png | Edit Shift modal (add break) |
| 21 | Screenshot 2025-11-08 at 5.30.28 am.png | Edit Shift modal (break summary) |
| 22 | Screenshot 2025-11-08 at 5.30.55 am.png | Shifts tab after edits (breaks, vacation overlay) |
| 23 | Screenshot 2025-11-08 at 5.31.24 am.png | Commissions tab tutorial (staff selection) |
| 24 | Screenshot 2025-11-08 at 5.31.28 am.png | Commissions tab tutorial (category/service level) |
| 25 | Screenshot 2025-11-08 at 5.31.31 am.png | Commissions tab tutorial (editing) |
| 26 | Screenshot 2025-11-08 at 5.31.40 am.png | Commission modal (type/value) |
| 27 | Screenshot 2025-11-08 at 5.31.44 am.png | Commission modal (save instructions) |
| 28 | Screenshot 2025-11-08 at 5.32.38 am.png | Staff detail page (services tab) |
| 29 | Screenshot 2025-11-08 at 5.33.54 am.png | Staff list with multiple staff members |
| 30 | Screenshot 2025-11-08 at 5.34.01 am.png | Staff detail with “Edit Services” CTA |
| 31 | Screenshot 2025-11-08 at 5.34.06 am.png | Staff service assignment modal (selected) |
| 32 | Screenshot 2025-11-08 at 5.34.13 am.png | Staff service assignment modal (another staff) |
| 33 | Screenshot 2025-11-08 at 5.35.25 am.png | Calendar day view showing shift/time-off overlays |

---

## 4. Implementation Goals for Claude

1. **Mock Data & State**
   - Extend `src/bookly/data/mock-data.ts` with business hours, staff shifts, breaks, time reservations, time-off requests, resources, and commission scaffolding.
   - Update shared types (calendar + new staff modules) to cover all structures above.
   - Expand Zustand store(s) to manage: business hours, staff shift templates/overrides, break edits, duplication, time reservations, time off (including repeats & approvals), service assignments, resources, and commission policies.

2. **UI Modules**
   - Build dedicated sections for **Staff Members**, **Shifts**, **Resources**, and **Commissions** that mirror the reference layouts and use Bookly colors.
   - **Staff Members** (Screens 28–32)
     * Left rail: searchable list of staff, avatars with status badges, FAB to add staff (stub for now).
     * Detail panel tabs:
       - `Services`: list assigned services with duration/price and “Edit Services” CTA. Modal must support search, select/deselect, category accordion (Select All & Clear All), and assignment per staff (see Screens 30–32).
       - `Working Hours`: weekly grid hooked to default shifts; reuse shift editor component (Screens 17–21 show the expected controls).
     * “Show Calendar” button opens existing calendar filtered to that staff member.
   - **Shifts** (Screens 8–22 & 33)
     * Toolbar: Day/Week toggle, Staff vs Resource filter dropdowns, date picker.
     * Tutorial popovers (Screens 8–14) with dismiss state stored in Zustand.
     * Timeline rows: Business Hours (dark row, editable), then each staff row showing shift blocks (tan), break chips, time-off overlays (brown), and time-reservation stripes. Include daily/weekly/monthly hour totals (D/W/M labels).
     * Actions: Copy/Print buttons (use copy now, stub print), global “Add Time Off” button bottom-right, plus inline pencil icons to edit business hours or individual shifts.
   - **Shift Editor & Time Modals**
     * Shift modal from Screens 17–21: toggle to disable shift, start/end pickers (15 min increments), auto duration display, ability to add multiple breaks (each editable/deletable).
     * Add Time Reservation modal (Screens 1–2): date, start/end, reason text, optional note. Creates a reservation block (striped overlay shown in Screen 33).
     * Add Time Off modal (Screens 3–7 & 15–16): all-day vs hourly, repeat until date, reason taxonomy (Personal/Sick/Vacation/Training/No-show/Late/Other), Approved checkbox with tooltip, staff multi-select.
   - **Resources** (no direct screenshot; follow existing dashboard cards)
     * CRUD list of rooms/resources per branch: show capacity, amenities chips, color swatch, edit/delete buttons.
     * Drawer for create/edit with branch selector, name, capacity, amenity multiselect, color picker.
     * Tie resources into static scheduling filters (sidebar + multi-room calendar views).
   - **Commissions** (Screens 23–27)
     * Reproduce nested accordion: Default Commissions > Services / Products / Gift Cards / Memberships / Packages.
     * “Select staffer” dropdown to apply globally or per staff (Screen 23).
     * Commission edit modal (Screens 26–27):
       - Choose type (`% of sale` vs fixed amount).
       - Value input with validation.
       - Radio for “Service provider” vs “Seller”.
       - Save persists to Zustand and updates UI immediately.
     * Include onboarding popovers (Screens 23–25) and the bottom “Flexible Commissions” banner with dismiss logic.

3. **Calendar Integration**
   - Enhance quick-action flyout with Add Time Reservation/Time Off (wired to new modals).
   - Display reservations/time off as non-bookable overlays in FullCalendar and custom staff views. Prevent creating bookings during blocked periods.
   - Booking drawer should warn/block if overlapping with time off unless override.

4. **Styling**
   - Mirror layout, spacing, and typography from screenshots while applying Bookly theme tokens.
   - Ensure responsive behavior (drawers full-height on mobile, horizontal scroll for dense grids, sticky headers).

5. **Testing & Accessibility**
   - Add unit tests for new selectors/reducers (e.g., repeat time off, shift duplication logic).
   - Ensure modals have focus traps, labelled buttons/tooltips, keyboard navigation.

Deliverable: a fully wired mock-backed experience matching the screenshots, integrated with existing calendar/state architecture, plus updated docs/tests.
```
