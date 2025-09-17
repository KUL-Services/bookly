# Bookly API Integration Map

## Customer app ((bookly))

| Flow | Route | File | API endpoints |
| --- | --- | --- | --- |
| Landing categories & featured businesses | /{lang}/landpage | src/app/[lang]/(bookly)/landpage/page.tsx | GET /categories, GET /business |
| Search services & businesses | /{lang}/search | src/app/[lang]/(bookly)/search/page.tsx | GET /service (supports filters by query/branch/category), GET /business (for business metadata) |
| Business profile detail & booking CTA | /{lang}/business/[slug] | src/app/[lang]/(bookly)/business/[slug]/page.tsx | GET /business (filter by slug/id), GET /service (by businessId), GET /staff (optional), GET /branches |
| Customer registration | /{lang}/customer/register | src/app/[lang]/(bookly)/(auth)/customer/register/page.tsx | POST /auth/user/register |
| Customer account verification | /{lang}/customer/verify | (new) | POST /auth/user/verify |
| Customer login | /{lang}/customer/login | src/app/[lang]/(bookly)/(auth)/customer/login/page.tsx | POST /auth/user/login |
| Customer profile & bookings | /{lang}/profile | src/app/[lang]/(bookly)/profile/page.tsx | GET /auth/user/me (derived from POST /auth/user/login token), GET /service (user bookings TBD placeholder) |
| Asset upload (booking attachments) | component level | src/bookly/components | POST /media-lib, PATCH /media-lib/:id |

## Business dashboard ((dashboard))

| Flow | Route | File | API endpoints |
| --- | --- | --- | --- |
| Business onboarding register | /register (localized) | src/views/Register.tsx (to create) | POST /business/register, POST /auth/admin/register |
| Business admin email verification | /verify (localized) | (new) | POST /auth/admin/verify |
| Business admin login | /login | src/views/Login.tsx | POST /auth/admin/login |
| Super admin login | /super-admin/login | (new) | POST /auth/super-admin/login |
| Dashboard overview | /{lang}/apps/bookly/dashboard | src/app/[lang]/(dashboard)/(private)/apps/bookly/dashboard/page.tsx | Aggregate: GET /business (own), GET /service, GET /staff, GET /branches, GET /categories |
| Service management | /{lang}/apps/bookly/services | src/app/[lang]/(dashboard)/(private)/apps/bookly/services/page.tsx | GET /service, POST /service, PATCH /service, DELETE /service/:id |
| Category management | /{lang}/apps/bookly/categories | src/app/[lang]/(dashboard)/(private)/apps/bookly/categories/page.tsx | GET /categories, POST /categories, PATCH /categories/:id, DELETE /categories/:id |
| Staff management | /{lang}/apps/bookly/staff | src/app/[lang]/(dashboard)/(private)/apps/bookly/staff/page.tsx | GET /staff, POST /staff, PATCH /staff, DELETE /staff/:id |
| Branch management | /{lang}/apps/bookly/branches | (new) | GET /branches, POST /branches, PATCH /branches, DELETE /branches/:id |
| Media library | /{lang}/apps/bookly/media | (new) | POST /media-lib, PATCH /media-lib/:id, DELETE /media-lib/:id |
| Business profile & change requests | /{lang}/apps/bookly/business | (new) | GET /business (own), PATCH /business (submit change request) |
| Pending business approvals | /{lang}/apps/bookly/approvals | (new, super admin role) | GET /business/pending, POST /business/approve, POST /business/reject |
| Pending change approvals | /{lang}/apps/bookly/change-requests | (new, super admin role) | GET /business/pending-requests, POST /business/approve-request, POST /business/reject-request |

## Shared utilities

- src/bookly/api/client.ts (new): base fetch wrapper, token management, request helpers.
- src/bookly/api/user.ts, src/bookly/api/business.ts, src/bookly/api/catalog.ts, src/bookly/api/media.ts (new modules) expose typed methods covering the above endpoints.
- Zustand store updates to persist access tokens for customer and admin contexts separately.
- NextAuth credential provider updated to call /auth/admin/login and attach returned token/user payload.

Use this table as the canonical reference while wiring API calls and creating missing pages.
