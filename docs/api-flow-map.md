# Bookly API Integration Map

Aligned with `api-spec.json` (Bookly Backend API v1.0.0). Use this as the source of truth for how the web experience ties into backend endpoints.

## Customer Experience ((bookly))

| Flow | Route | Primary file | API calls |
| --- | --- | --- | --- |
| Landing catalog & spotlight | /{lang}/landpage | src/app/[lang]/(bookly)/landpage/page.tsx | GET /categories<br>GET /business (optional query: name, categoryId, page, pageSize, priceFrom, priceTo) |
| Search results | /{lang}/search | src/app/[lang]/(bookly)/search/page.tsx | GET /business (same optional query as above; UI applies keyword filters)<br>GET /service (public list; client-side filtering until API exposes search params) |
| Service detail | /{lang}/service/[id] | src/app/[lang]/(bookly)/service/[id]/page.tsx | GET /service/{id} |
| Business profile | /{lang}/business/[slug] | src/app/[lang]/(bookly)/business/[slug]/page.tsx | GET /business/{id}<br>GET /service (front-end filters by business) |
| Category spotlight | /{lang}/category/[slug] | src/app/[lang]/(bookly)/category/[slug]/page.tsx | GET /categories (resolve slug)<br>GET /service (filter client-side by category) |
| Customer register | /{lang}/(bookly)/(auth)/customer/register | src/app/[lang]/(bookly)/(auth)/customer/register/page.tsx | POST /auth/user/register |
| Customer verify | /{lang}/(bookly)/(auth)/customer/verify | src/app/[lang]/(bookly)/(auth)/customer/verify/page.tsx | POST /auth/user/verify |
| Customer forgot password | /{lang}/(bookly)/(auth)/customer/forgot-password | src/app/[lang]/(bookly)/(auth)/customer/forgot-password/page.tsx | POST /auth/user/forget-password |
| Customer reset password | /{lang}/(bookly)/(auth)/customer/reset-password | src/app/[lang]/(bookly)/(auth)/customer/reset-password/page.tsx | POST /auth/user/reset-password |
| Customer login | /{lang}/(bookly)/(auth)/customer/login | src/app/[lang]/(bookly)/(auth)/customer/login/page.tsx | POST /auth/user/login (x-www-form-urlencoded body: email, password) |
| Customer profile dashboard | /{lang}/(bookly)/profile | src/app/[lang]/(bookly)/profile/page.tsx | Uses login payload for user data; bookings/history APIs are not defined in the current spec |
| Asset upload (customer attachments) | component scope | src/bookly/components | POST /media-lib (create upload URL)<br>PATCH /media-lib/{id} (mark upload complete)<br>DELETE /media-lib/{id} (remove asset) |

## Business Dashboard ((dashboard))

| Flow | Route | Primary file | API calls |
| --- | --- | --- | --- |
| Business registration (public) | /{lang}/(blank-layout-pages)/(guest-only)/register | src/app/[lang]/(blank-layout-pages)/(guest-only)/register/page.tsx | POST /business/register (payload: name, owner{name,email,password}, optional email/description/socialLinks) |
| Admin login | /{lang}/(blank-layout-pages)/(guest-only)/login | src/app/[lang]/(blank-layout-pages)/(guest-only)/login/page.tsx<br>src/views/Login.tsx | POST /auth/admin/login (x-www-form-urlencoded) |
| Admin verification | /{lang}/(blank-layout-pages)/(guest-only)/verify | src/app/[lang]/(blank-layout-pages)/(guest-only)/verify/page.tsx | POST /auth/admin/verify |
| Admin forgot/reset password | /{lang}/(blank-layout-pages)/(guest-only)/forgot-password<br>/{lang}/(blank-layout-pages)/(guest-only)/reset-password | src/app/[lang]/(blank-layout-pages)/(guest-only)/forgot-password/page.tsx<br>src/app/[lang]/(blank-layout-pages)/(guest-only)/reset-password/page.tsx | POST /auth/admin/forget-password<br>POST /auth/admin/reset-password |
| Dashboard overview | /{lang}/(dashboard)/(private)/apps/bookly/dashboard | src/app/[lang]/(dashboard)/(private)/apps/bookly/dashboard/page.tsx | GET /business/{id} (admin business profile)<br>GET /service (client filters by business)<br>GET /staff<br>GET /branches<br>GET /categories |
| Services manager | /{lang}/(dashboard)/(private)/apps/bookly/services | src/app/[lang]/(dashboard)/(private)/apps/bookly/services/page.tsx | GET /service (list current services)<br>POST /service (create)<br>PATCH /service (update by id in body)<br>DELETE /service/{id} |
| Branches manager | /{lang}/(dashboard)/(private)/apps/bookly/branches | src/app/[lang]/(dashboard)/(private)/apps/bookly/branches/page.tsx | GET /branches<br>POST /branches<br>PATCH /branches<br>DELETE /branches/{id} |
| Staff manager | /{lang}/(dashboard)/(private)/apps/bookly/staff | src/app/[lang]/(dashboard)/(private)/apps/bookly/staff/page.tsx | GET /staff<br>POST /staff<br>PATCH /staff<br>DELETE /staff/{id} |
| Business profile & change requests | /{lang}/(dashboard)/(private)/apps/bookly/business-profile | src/app/[lang]/(dashboard)/(private)/apps/bookly/business-profile/page.tsx | GET /business/{id}<br>PATCH /business (submits change request for approval) |
| Media library | /{lang}/(dashboard)/(private)/apps/bookly/media | src/app/[lang]/(dashboard)/(private)/apps/bookly/media/page.tsx | POST /media-lib<br>PATCH /media-lib/{id}<br>DELETE /media-lib/{id} (spec lacks a list endpoint; UI must cache uploads locally) |

## Super Admin Operations

| Flow | Route | Primary file | API calls |
| --- | --- | --- | --- |
| Super admin login | /{lang}/(blank-layout-pages)/(guest-only)/super-admin/login | src/app/[lang]/(blank-layout-pages)/(guest-only)/super-admin/login/page.tsx | POST /auth/super-admin/login (x-www-form-urlencoded) |
| Pending business approvals | /{lang}/(dashboard)/(private)/apps/bookly/approvals | src/app/[lang]/(dashboard)/(private)/apps/bookly/approvals/page.tsx | GET /business/pending<br>POST /business/approve<br>POST /business/reject |
| Pending change requests | /{lang}/(dashboard)/(private)/apps/bookly/change-requests | src/app/[lang]/(dashboard)/(private)/apps/bookly/change-requests/page.tsx | GET /business/pending-requests<br>POST /business/approve-request<br>POST /business/reject-request |
| Approved business directory | /{lang}/(dashboard)/(private)/apps/bookly/businesses | src/app/[lang]/(dashboard)/(private)/apps/bookly/businesses/page.tsx | GET /business (optional query: name, categoryId, page, pageSize, priceFrom, priceTo)<br>GET /business/{id} for detail views |

## Client Service Wrappers

- src/lib/api/services/auth.service.ts - wraps `/auth/user/*`, `/auth/admin/*`, `/auth/super-admin/login` with correct body formats.
- src/lib/api/services/business.service.ts - wraps `/business` domain: register, change requests, pending queues, approval/rejection actions.
- src/lib/api/services/services.service.ts - handles `/service` CRUD for admins and public fetching.
- src/lib/api/services/branches.service.ts - wraps `/branches` CRUD.
- src/lib/api/services/staff.service.ts - wraps `/staff` CRUD.
- src/lib/api/services/categories.service.ts - wraps `/categories` CRUD (used by super admin tooling and public fetching).
- src/lib/api/services/media.service.ts - wraps `/media-lib` for upload lifecycle.

## Key Payloads & Parameters

- GET /business: optional query params `name`, `categoryId`, `page`, `pageSize`, `priceFrom`, `priceTo`. Returns approved businesses (public).
- GET /service: public list of services. Spec currently exposes no query params; UI filters locally.
- POST /business/register: requires `name`, `owner.name`, `owner.email`, `owner.password`; supports optional `email`, `description`, up to 10 `socialLinks`, optional `logo`.
- PATCH /business: requires `id`; accepts optional `name`, `email`, `description`, `socialLinks`, `logo` to create/update change request.
- POST /service: requires `name`, `location`, `price`, `duration`; optional `description`, `categoryIds`, `branchIds`, `gallery`.
- PATCH /service: requires `id`; same optional fields as create.
- POST /branches: requires `name`; optional `address`, `mobile`, `serviceIds`, `gallery`.
- POST /staff: requires `name`, `branchId`; optional `mobile`, `profilePhoto`, `serviceIds`.
- POST /media-lib: requires `fileName`, `mimeType`, `size`; returns signed upload URL via `AssetFile`.
- Auth login endpoints (`/auth/user/login`, `/auth/admin/login`, `/auth/super-admin/login`) expect `application/x-www-form-urlencoded` body with `email`, `password`.
- Verification and reset endpoints expect JSON payloads with `email`, `code`, and `password` where applicable.

## Spec Gaps Impacting UI

- Customer profile and admin bookings views reference booking data, but the spec has no `/bookings` endpoints yet.
- Media library grid expects a listing endpoint; `/media-lib` currently supports create/update/delete only.
- Analytics, reporting, and admin management features referenced in earlier docs are absent from the spec (no `/analytics`, `/admin`, or metric endpoints).
- Public discovery flows previously relied on `q`, `location`, `featured`, or `sort` parameters; the updated spec only exposes `name`, `categoryId`, `page`, `pageSize`, `priceFrom`, `priceTo`.
- Branch detail routes under `apps/bookly/businesses/[businessId]/branches/[branchId]` have no dedicated endpoints beyond the generic `/branches` list.

Keep this document synchronized with `api-spec.json` when new endpoints or parameters are added.






