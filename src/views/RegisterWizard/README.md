# Business Registration Wizard

A comprehensive multi-step registration wizard for business onboarding, mirroring the UX flow of Booksy Biz.

## Features

- **6-Step Registration Flow**
  1. Account Creation (email/password with Google OAuth placeholder)
  2. Mobile Verification (OTP flow with countdown & resend)
  3. Business Basics (type, staff count, services)
  4. Location (address or mobile-only option)
  5. Business Profile (URL slug, timezone, working hours)
  6. Legal (terms, privacy, marketing opt-in)

- **LocalStorage Persistence**: Auto-saves progress, "Save and continue later" option
- **Validation**: Field-level validation with helpful error messages
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: WCAG-compliant with proper ARIA labels
- **i18n Ready**: Compatible with [lang] routes
- **Step Illustrations**: Supports per-step images (fallback to gradient)

## File Structure

```
src/views/RegisterWizard/
├── index.tsx                    # Main wizard container
├── types.ts                     # TypeScript types and constants
├── utils.ts                     # Validation & localStorage helpers
├── api-stubs.ts                 # API integration stubs (to wire later)
├── steps/
│   ├── AccountStep.tsx
│   ├── MobileVerificationStep.tsx
│   ├── BusinessBasicsStep.tsx
│   ├── LocationStep.tsx
│   ├── BusinessProfileStep.tsx
│   └── LegalStep.tsx
└── README.md                    # This file
```

## Integration Points

### API Stubs (see [api-stubs.ts](./api-stubs.ts))

Replace these stub functions with real API calls:

1. **`sendOtp(countryCode, phone)`**
   - Endpoint: `POST /api/auth/send-otp`
   - Payload: `{ countryCode: string, phone: string }`

2. **`verifyOtp(countryCode, phone, otp)`**
   - Endpoint: `POST /api/auth/verify-otp`
   - Payload: `{ countryCode: string, phone: string, otp: string }`

3. **`checkSlugAvailable(slug)`**
   - Endpoint: `GET /api/business/check-slug?slug={slug}`
   - Response: `{ available: boolean }`

4. **`signUpBusiness(payload)`**
   - Transform wizard data to `RegisterBusinessRequest`
   - Call `BusinessService.registerBusiness()`
   - Update `useAuthStore` with returned token/user
   - Redirect to dashboard or login

### Auth Store Integration

When `signUpBusiness` succeeds:

```typescript
import { useAuthStore } from '@/stores/auth.store'

// After successful registration
const authStore = useAuthStore.getState()
authStore.setMaterializeUser({
  id: response.data.id,
  email: payload.email,
  name: payload.businessName,
  isOwner: true,
  business: response.data
})
```

## Step Images

Place step illustrations in `public/images/booksy-biz/`:

- `step-1.jpeg` - Account creation
- `step-2.jpeg` - Mobile verification
- `step-3.jpeg` - Business basics
- `step-4.jpeg` - Location
- `step-5.jpeg` - Business profile
- `step-6.jpeg` - Legal

If images are missing, a gradient fallback is shown.

## LocalStorage Key

Draft data is saved to: `business-register-draft:v1:{lang}`

Example: `business-register-draft:v1:en`

## Validation Rules

- **Email**: Standard RFC 5322 format
- **Password**: Min 8 chars, must include uppercase, lowercase, number, and symbol
- **Phone**: 10-15 digits (country code separate)
- **Postal Code**: Basic patterns for US, UK, CA, AU, DE, FR
- **Slug**: Lowercase letters, numbers, hyphens only (no leading/trailing/consecutive hyphens)
- **Working Hours**: At least one day must be open if accepting online bookings

## Usage

The wizard is automatically rendered at `/[lang]/register` via:

```typescript
// src/app/[lang]/(blank-layout-pages)/(guest-only)/register/page.tsx
import RegisterWizard from '@views/RegisterWizard'

const RegisterPage = () => {
  const mode = getServerMode()
  return <RegisterWizard mode={mode} />
}
```

## Customization

### Business Types

Edit `BUSINESS_TYPES` in [types.ts](./types.ts):

```typescript
export const BUSINESS_TYPES = [
  'Salon & Spa',
  'Barbershop',
  // Add more...
]
```

### Services

Edit `SERVICES_OPTIONS` in [types.ts](./types.ts).

### Timezones

Edit `TIMEZONES` in [types.ts](./types.ts).

### Default Working Hours

Edit `getDefaultWorkingHours()` in [utils.ts](./utils.ts).

## Testing

1. **Happy Path**: Complete all 6 steps with valid data
2. **Validation**: Try submitting each step with invalid/missing data
3. **OTP Flow**: Test send, resend, countdown, edit phone
4. **Slug Check**: Test debounced availability (reserved: test, admin, reserved)
5. **Draft Save**: Fill form, refresh page, verify restoration
6. **Mobile-Only**: Toggle mobile-only on Location step
7. **Working Hours**: Toggle days, verify "at least one day" validation
8. **Responsive**: Test on mobile, tablet, desktop viewports

## TODO for Production

- [ ] Wire `sendOtp` to backend OTP service
- [ ] Wire `verifyOtp` to backend OTP verification
- [ ] Wire `checkSlugAvailable` to backend slug check API
- [ ] Wire `signUpBusiness` to `BusinessService.registerBusiness()`
- [ ] Implement Google OAuth in `AccountStep`
- [ ] Add actual step images to `public/images/booksy-biz/`
- [ ] Update legal links to real terms/privacy pages
- [ ] Add analytics tracking for each step
- [ ] Add A/B testing hooks
- [ ] Implement rate limiting for OTP sends
- [ ] Add CAPTCHA if needed
- [ ] Test with real backend errors
- [ ] Add success animation/page before redirect

## License

Commercial - Part of Bookly codebase
