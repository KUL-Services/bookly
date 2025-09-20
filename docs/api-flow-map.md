# Bookly API Integration Map

## Customer app ((bookly))

| Flow | Route | File | API endpoints |
| --- | --- | --- | --- |
| Landing categories & featured businesses | /{lang}/landpage | src/app/[lang]/(bookly)/landpage/page.tsx | GET /categories, GET /business |
| Search services & businesses | /{lang}/search | src/app/[lang]/(bookly)/search/page.tsx | GET /service, GET /business |
| Service detail view | /{lang}/service/[id] | src/app/[lang]/(bookly)/service/[id]/page.tsx | GET /service/:id (includes categories, branches, business, reviews) |
| Business profile detail & booking CTA | /{lang}/business/[slug] | src/app/[lang]/(bookly)/business/[slug]/page.tsx | GET /business, GET /service (filtered by business), GET /staff, GET /branches |
| Customer registration | /{lang}/customer/register | src/app/[lang]/(bookly)/(auth)/customer/register/page.tsx | POST /auth/user/register |
| Customer account verification | /{lang}/customer/verify | src/app/[lang]/(bookly)/(auth)/customer/verify/page.tsx | POST /auth/user/verify |
| Customer password reset request | /{lang}/customer/forgot-password | src/app/[lang]/(bookly)/(auth)/customer/forgot-password/page.tsx | POST /auth/user/forget-password |
| Customer password reset | /{lang}/customer/reset-password | src/app/[lang]/(bookly)/(auth)/customer/reset-password/page.tsx | POST /auth/user/reset-password |
| Customer login | /{lang}/customer/login | src/app/[lang]/(bookly)/(auth)/customer/login/page.tsx | POST /auth/user/login |
| Customer profile & bookings | /{lang}/profile | src/app/[lang]/(bookly)/profile/page.tsx | Token-based user data from login response |
| Asset upload (booking attachments) | component level | src/bookly/components | POST /media-lib, PATCH /media-lib/:id, DELETE /media-lib/:id |

## Business dashboard ((dashboard))

| Flow | Route | File | API endpoints |
| --- | --- | --- | --- |
| Business onboarding register | /register | src/app/[lang]/(dashboard)/(auth)/register/page.tsx | POST /business/register |
| Business admin email verification | /verify | src/app/[lang]/(dashboard)/(auth)/verify/page.tsx | POST /auth/admin/verify |
| Business admin password reset request | /forgot-password | src/app/[lang]/(dashboard)/(auth)/forgot-password/page.tsx | POST /auth/admin/forget-password |
| Business admin password reset | /reset-password | src/app/[lang]/(dashboard)/(auth)/reset-password/page.tsx | POST /auth/admin/reset-password |
| Business admin login | /login | src/app/[lang]/(dashboard)/(auth)/login/page.tsx | POST /auth/admin/login |
| Dashboard overview | /{lang}/apps/bookly/dashboard | src/app/[lang]/(dashboard)/(private)/apps/bookly/dashboard/page.tsx | GET /business, GET /service, GET /staff, GET /branches, GET /categories |
| Service management | /{lang}/apps/bookly/services | src/app/[lang]/(dashboard)/(private)/apps/bookly/services/page.tsx | GET /service, POST /service, PATCH /service, DELETE /service/:id |
| Category management (Super Admin) | /{lang}/apps/bookly/categories | src/app/[lang]/(dashboard)/(private)/apps/bookly/categories/page.tsx | GET /categories, POST /categories, PATCH /categories/:id, DELETE /categories/:id |
| Staff management | /{lang}/apps/bookly/staff | src/app/[lang]/(dashboard)/(private)/apps/bookly/staff/page.tsx | GET /staff, POST /staff, PATCH /staff, DELETE /staff/:id |
| Branch management | /{lang}/apps/bookly/branches | src/app/[lang]/(dashboard)/(private)/apps/bookly/branches/page.tsx | GET /branches, POST /branches, PATCH /branches, DELETE /branches/:id |
| Media library | /{lang}/apps/bookly/media | src/app/[lang]/(dashboard)/(private)/apps/bookly/media/page.tsx | POST /media-lib, PATCH /media-lib/:id, DELETE /media-lib/:id |
| Business profile & change requests | /{lang}/apps/bookly/business | src/app/[lang]/(dashboard)/(private)/apps/bookly/business/page.tsx | GET /business, PATCH /business |
| Admin registration (Owner only) | /{lang}/apps/bookly/admins | src/app/[lang]/(dashboard)/(private)/apps/bookly/admins/page.tsx | POST /auth/admin/register |

## Super Admin dashboard

| Flow | Route | File | API endpoints |
| --- | --- | --- | --- |
| Super admin login | /super-admin/login | src/app/[lang]/(dashboard)/(auth)/super-admin/login/page.tsx | POST /auth/super-admin/login |
| Pending business approvals | /{lang}/super-admin/businesses/pending | src/app/[lang]/(dashboard)/(private)/super-admin/businesses/pending/page.tsx | GET /business/pending, POST /business/approve, POST /business/reject |
| Pending change request approvals | /{lang}/super-admin/businesses/change-requests | src/app/[lang]/(dashboard)/(private)/super-admin/businesses/change-requests/page.tsx | GET /business/pending-requests, POST /business/approve-request, POST /business/reject-request |
| Approved businesses overview | /{lang}/super-admin/businesses | src/app/[lang]/(dashboard)/(private)/super-admin/businesses/page.tsx | GET /business |
| Category management | /{lang}/super-admin/categories | src/app/[lang]/(dashboard)/(private)/super-admin/categories/page.tsx | GET /categories, POST /categories, PATCH /categories/:id, DELETE /categories/:id |

## Architecture Improvements

### API Client Structure
```
src/bookly/api/
├── client.ts          # Base fetch wrapper, token management, error handling
├── types.ts           # TypeScript interfaces matching API spec schemas
├── auth/
│   ├── user.ts        # POST /auth/user/* endpoints
│   ├── admin.ts       # POST /auth/admin/* endpoints
│   └── super-admin.ts # POST /auth/super-admin/* endpoints
├── business/
│   ├── business.ts    # Business CRUD and approval workflows
│   ├── services.ts    # Service management
│   ├── staff.ts       # Staff management
│   └── branches.ts    # Branch management
├── catalog/
│   └── categories.ts  # Category management (Super Admin)
└── media/
    └── media-lib.ts   # Asset upload/management
```

### State Management
- **Customer Context**: Zustand store for user authentication state, profile data
- **Admin Context**: Separate store for admin authentication, business data
- **Super Admin Context**: Store for super admin authentication and approval workflows

### Authentication Strategy
- **JWT Storage**: Secure token storage with automatic refresh
- **Role-based routing**: Route guards based on user roles (USER, ADMIN, SUPER_ADMIN)
- **Multi-tenant support**: Admin context tied to specific business

### Error Handling
- **API Error Types**: Standardized error responses (400, 401, 403, 404, 500)
- **Form Validation**: Client-side validation matching API schema requirements
- **Offline Support**: Graceful degradation when API is unavailable

### Security Considerations
- **RBAC Implementation**: Role-based access control for all endpoints
- **Business Isolation**: Admins can only access their own business data
- **Approval Workflows**: Business changes require super admin approval
- **File Upload Security**: Signed S3 URLs with size/type restrictions

Use this table as the canonical reference while wiring API calls and creating missing pages.
