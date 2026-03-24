# Bookly/Zerv Contract Delta: Implemented Features Beyond Original Contract

**Date:** 2026-03-15  
**Purpose:** Document product capabilities that exist in the current platform implementation, data model, and aligned backend contracts, but were not explicitly specified in the original `Bookly DEVELOPMENT CONTRACT.pdf`.

## 1. What the Original Contract Actually Covered

The original contract is only a high-level commercial scope document. It defines five broad deliverables:

- onboarding, registration, profile management
- marketplace and business listing
- appointment scheduling and notifications
- payments, transactions, commissions
- administration, analytics, integrations

What it does **not** define in detail:

- exact booking engine rules
- resource and branch data model constraints
- static vs dynamic booking behavior
- session capacity logic
- waitlist mechanics
- scheduling exception precedence
- onboarding transaction model
- detailed settings contracts
- notification channel lifecycle
- rich service operational metadata

Because of that, a large amount of product logic and platform behavior now implemented in the codebase goes materially beyond the explicit wording of the original contract.

## 2. Major Features Implemented Beyond the Original Contract

### 2.1 Dual Booking Engine: Flex/Dynamic and Fixed/Static Modes

The contract mentions scheduling and calendar tools, but it does not specify that the platform supports two distinct booking models:

- `DYNAMIC` / Flex booking for rolling time-slot appointments
- `STATIC` / Fixed booking for predefined sessions/classes

This is now a core platform capability with dedicated frontend and backend contracts, not just a UI variation.

Implemented behavior includes:

- resource-level `bookingMode`
- session-based booking for static/fixed resources
- dynamic slot-based booking for flex resources
- different capacity rules per mode
- mixed businesses that contain both booking modes at the same time

This is one of the biggest capability expansions beyond the contract.

### 2.2 Booking Mode Transition Engine

The contract never specifies how a staff member or room switches between booking models. The current product includes a full transition system:

- current mode vs pending mode
- delayed transition when future bookings exist
- effective date calculation
- transition cancellation endpoints
- user-facing transition explanation UI

This is substantially more advanced than generic “staff management” or “scheduling tools”.

### 2.3 Static Sessions with Authoritative Capacity and Attendance

The contract mentions scheduling, but not session definitions, capacity tracking, or attendance counts.

The current platform supports:

- session definitions for fixed/static resources
- `maxParticipants` / capacity enforcement
- authoritative per-session aggregate stats
- counts like attended, no-show, pending, confirmed
- UI patterns such as `9/11 Attended`

That is a real session-management system, not just appointment CRUD.

### 2.4 Waitlist System

The original contract does not mention waitlists at all.

The platform now includes:

- customer join waitlist flow
- customer leave waitlist flow
- admin waitlist listing
- admin notify flow
- status lifecycle: `ACTIVE`, `NOTIFIED`, `LEFT`, `EXPIRED`, `BOOKED`
- slot-level grouping and queue behavior

This is an added product module beyond the original contract language.

### 2.5 Branch-Scoped Operational Model

The contract mentions business profile and marketplace, but it does not define branch-level operational rules in detail.

The current implementation adds:

- multi-branch business model
- branch-scoped staff and assets
- branch active/inactive enforcement
- branch working hours persistence
- branch metadata such as timezone, place ID, formatted address, city, country, email
- branch-specific availability and booking validation

This is a much stricter operational model than the contract originally described.

### 2.6 Unified Resource Model for Staff and Assets

The contract refers to staff and business settings, but does not define a unified operational resource model.

The current platform uses a more advanced structure:

- `Resource` abstraction
- `STAFF` and `ASSET` resource types
- subtypes such as room/equipment
- service-resource linking
- booking-mode support on both staff and assets
- room and asset availability integrated into booking logic

This is a deeper architecture than standard “staff management”.

### 2.7 Scheduling Exception System with Precedence Rules

The contract mentions scheduling tools but does not define exception logic.

The current platform includes a full scheduling override system:

- business-wide holiday hours / exceptions
- branch-level overrides
- resource-level overrides
- defined precedence order:
  - resource override
  - branch override
  - business-wide holiday
  - recurring schedule

This is an advanced availability engine requirement that was not explicitly contracted.

### 2.8 Time Off and Reservation Blocking

The contract does not mention time-off entries or reservation blocks as separate operational entities.

The aligned platform now supports:

- admin CRUD for time-off
- admin CRUD for reservation blocks
- overlap validation
- ownership validation
- branch/date-range listing for conflict detection

This goes beyond generic calendar functionality.

### 2.9 Auto-Assignment / “No Preference” Logic

The original contract does not mention backend auto-assignment behavior.

The current implementation supports “no preference” semantics for staff and room assignment:

- omitted or sentinel staff/room values treated as auto-assign intent
- backend resolves valid assignment
- resolved staff/room returned in response
- explicit conflict error when no assignment is possible

This is important booking engine behavior not described in the contract.

### 2.10 Transactional Onboarding Completion with Temp-ID Mapping

The contract mentions onboarding and registration, but the current platform now has a much richer onboarding model:

- minimal account/business shell registration
- full post-auth onboarding completion endpoint
- transactional persistence of business profile, branches, staff, services, rooms, legal consent
- temp ID and real ID cross-reference resolution
- idempotency support
- structured field-path validation errors

This is significantly more rigorous than what the original contract specifies.

### 2.11 Advanced Service Configuration

The contract mentions services, but not the detailed operational service fields now implemented.

Current service capabilities include:

- tax rate presets plus `customTaxRate`
- `depositPercentage`
- `bookingInterval`
- `paddingTime`
- `processingTime`
- `parallelClients`
- `clientSettings`
- `variants[]`
- service add-ons

This is well beyond simple service name, duration, and price management.

### 2.12 Add-ons on Booking Flow

The original contract does not explicitly mention booking add-ons.

The current platform supports:

- service-specific add-on CRUD
- public add-on read endpoint
- add-ons included in booking payload
- `addonsTotal` in enriched booking response

This is an explicit product expansion.

### 2.13 Rich Payment and Status Mapping Rules

The contract mentions Paymob and payment processing at a high level. The implemented platform includes much more detailed business logic:

- payment methods beyond a single gateway concept
- `cash_on_arrival`
- `card_on_arrival`
- `online_payment`
- `instapay`
- `bank_transfer`
- appointment/payment status mapping logic
- `need_confirm` flow for unpaid Instapay scenarios
- payment reference and Instapay reference handling

This is more advanced operational behavior than generic “payment gateway integration”.

### 2.14 Dedicated Settings Domains

The contract mentions business settings, but not the breakdown now implemented.

The platform now treats settings as multiple explicit domains:

- scheduling settings
- booking policies
- notifications
- payment settings
- calendar settings
- branding settings
- customer settings

Within these, implemented capabilities include:

- no-show restriction threshold
- overbooking percentage vs fixed count
- waitlist enablement
- push channel toggles for cancellation alerts
- payment tax/deposit configuration
- weekend configuration and calendar presentation settings

This is a more complete settings platform than the original contract states.

### 2.15 Push Notification Token Lifecycle

The original contract mentions email notifications only at a broad level. The current product now includes push-notification infrastructure:

- FCM/web push token registration
- token removal on logout/revoke
- cancellation alert push settings
- admin and customer token ownership handling
- stale token deactivation behavior

That is a net-new channel and lifecycle model beyond the contract.

### 2.16 Detailed Email and Notification UX

The contract mentions confirmations, reminders, and cancellations, but not branded message templates and cross-flow notification semantics.

The current implementation adds:

- branded booking emails
- branded OTP emails
- business logo/color usage
- cancellation push/email coordination
- richer customer/business recipient behavior

This is a more mature communications layer than the contract explicitly defines.

### 2.17 Search Result Intelligence

The contract mentions search by business name, service type, location, and category. The current platform goes further in the operational dashboard layer:

- booking search across the full dataset
- matched fields returned per result
- support for search by booking reference, customer contact, staff, and service
- deterministic sorting and pagination metadata

This expands search into admin operational tooling, not just marketplace browsing.

### 2.18 Public Business Routing by Slug with Canonical Public URL

The contract mentions listing and profile pages, but not canonical slug behavior.

The current platform now includes:

- business detail lookup by slug
- canonical public business URL generation
- explicit separation between slug route and ID route
- logo and cover image URL resolution for public rendering

This is a stronger public web contract than what was originally written.

### 2.19 Guest Booking and Account-Linked Booking Coexistence

The contract mentions visitors and clients, but not the exact dual-flow booking model.

The current implementation supports:

- guest booking
- authenticated user booking
- business-side admin booking creation
- account-linked history for authenticated customers
- guest/customer distinctions in notifications and waitlist behavior

This is a fuller booking lifecycle than the contract explicitly describes.

### 2.20 Review Operations Beyond Simple Display

The contract mentions content and review management with moderation, but the actual product now includes more concrete operational detail:

- customer review creation from booking context
- admin review management
- reply and flag flows
- categorized filtering and moderation UI behavior

This is more concretely implemented than the contract language suggests.

## 3. Platform Behavior That Became Much More Precise Than the Contract

The contract is broad enough to include these areas conceptually, but not at the rule level that now exists in the platform.

These are not entirely “new modules”, but they are much more detailed than the original statement of work:

- exact availability validation rules at display time and submit time
- branch/resource/service ownership enforcement
- race-condition handling for stale slots
- session vs dynamic availability rendering
- 401 routing split between admin and customer flows
- business approval visibility rules
- enriched admin booking payloads with payment/customer/staff/session context
- schedule conflict detection and overlap rules
- field-level onboarding validation with path-based errors

## 4. Items That Are Clearly Beyond the Original Explicit Scope

If the question is “what was added later that is clearly not spelled out in the original contract?”, the strongest examples are:

- static/fixed booking mode
- dynamic/flex booking mode as a first-class engine
- session definitions and session capacity stats
- booking mode transition scheduling
- waitlist module
- time-off and reservations module
- holiday-hours/exception precedence system
- transactional onboarding completion with temp ID mapping
- push token lifecycle and push cancellation alerts
- add-ons system
- advanced service operational fields
- no-show threshold and overbooking mode logic
- auto-assignment for no-preference selections

## 5. Practical Conclusion

The original contract describes a booking platform at a commercial-feature-cluster level. The implemented platform has evolved into a much more explicit operational system with:

- a richer booking engine
- a stronger branch/resource/service domain model
- more advanced scheduling semantics
- deeper admin settings and onboarding logic
- customer/business notification workflows beyond email-only basics

In short: the current codebase and aligned backend contracts represent a more sophisticated and more strictly-defined product than the original six-page contract explicitly captured.

## 6. Reference Sources Used For This Delta

- Original contract: `/Users/kareemgamal/Downloads/Bookly DEVELOPMENT CONTRACT.pdf`
- Current platform requirements: `/Users/kareemgamal/Downloads/KUL/bookly/docs/website-business-requirements-scenarios.md`
- Current platform scenarios: `/Users/kareemgamal/Downloads/KUL/bookly/docs/zerv-platform-requirements-and-scenarios.md`
- Static/dynamic booking contracts: `/Users/kareemgamal/Downloads/KUL/bookly/docs/static-dynamic-booking-frontend-guide.md`
- Backend-aligned samples: `/Users/kareemgamal/Downloads/KUL/bookly/docs/backend-alignment-comprehensive-samples.md`
- Integration status snapshot: `/Users/kareemgamal/Downloads/KUL/bookly/docs/integration-status.md`
- Relevant service layer examples:
  - `/Users/kareemgamal/Downloads/KUL/bookly/src/lib/api/services/onboarding.service.ts`
  - `/Users/kareemgamal/Downloads/KUL/bookly/src/lib/api/services/booking.service.ts`
  - `/Users/kareemgamal/Downloads/KUL/bookly/src/lib/api/services/scheduling.service.ts`
  - `/Users/kareemgamal/Downloads/KUL/bookly/src/lib/api/services/notifications.service.ts`
  - `/Users/kareemgamal/Downloads/KUL/bookly/src/lib/api/services/settings.service.ts`
