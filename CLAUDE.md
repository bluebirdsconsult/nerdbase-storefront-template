# Nerdbase Storefront Template — AI Context

> อ่านไฟล์นี้ก่อนทุกครั้ง — บอก AI ว่า project นี้คืออะไร มีอะไรบ้าง และมี rules อะไร

---

## Overview

White-label **game topup storefront** template powered by Nerdbase APIs.
One codebase → one business deployment. Each business forks this repo, sets env vars,
optionally edits `theme.config.ts` as fallback, then deploys.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · NextAuth v5

---

## The Two Config Surfaces

### 1. `theme.config.ts` — Static fallback / default branding
**Only used when the CMS API has no live data yet.** Contains:
- `store.name`, `store.description`
- `colors.primary`, `colors.secondary` (hex)
- `font` (Google Fonts name, e.g. `"Athiti, sans-serif"`)
- `logo.url`, `logo.width`, `logo.height`
- `favicon`
- `banners[]`, `banner_footers[]`
- `footer.*` (company_name, phone, email, address, social URLs)
- `seo.title`, `seo.description`

> **`store.description` is NEVER overridden by API** — only static from this file.
> **`logo.width`, `logo.height`** are always from this file (API only provides the URL).

### 2. Live data from `fetchStorefrontConfig()` (CMS API)
`lib/getThemeConfig.ts` calls `lib/api/storefront.ts` → `CMS_API_URL/cms/storefront-config`
and **overrides every field** from the API response. The `theme.config.ts` values are
only used as `??` fallbacks when the API returns null/missing.

**When user says "change color/logo/banner":**
- During development with no CMS → edit `theme.config.ts`
- In production → use Nerdbase Admin Panel (business settings) — it updates the CMS

---

## Project Structure (current, accurate)

```
nerdbase-storefront-template/
├── theme.config.ts              ← Fallback branding (see above)
├── auth.ts                      ← NextAuth v5 config (Credentials provider, JWT)
├── next.config.ts               ← remotePatterns for next/image
├── .env.local                   ← API keys & secrets (never commit)
│
├── app/
│   ├── layout.tsx               ← Root: injects CSS vars + Google Fonts
│   ├── page.tsx                 ← Landing page (server component)
│   ├── top-up/page.tsx          ← "เติมเงินเกม" game search page
│   ├── contact/page.tsx         ← "ติดต่อทีมงาน" contact page
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx       ← "use client"; handles OTP step
│   ├── register/
│   │   ├── page.tsx
│   │   └── register-form.tsx    ← "use client"; eye toggle + 4-rule password checklist
│   ├── forgot-password/
│   │   ├── page.tsx
│   │   └── forgot-password-form.tsx  ← "use client"; always shows success (anti-enumeration)
│   ├── reset-password/
│   │   ├── page.tsx             ← Wrapped in <Suspense> for useSearchParams
│   │   └── reset-password-form.tsx   ← "use client"; reads ?token=; eye + checklist
│   ├── profile/
│   │   ├── layout.tsx           ← Server: auth() guard + StorefrontLayout + ProfileLayout
│   │   ├── page.tsx             ← ข้อมูลบัญชี (server fetch profile+balance)
│   │   ├── orders/page.tsx      ← ประวัติ Order (client fetch)
│   │   └── credits/page.tsx     ← ประวัติเติมเครดิต (client fetch)
│   ├── game/[slug]/page.tsx     ← Game detail + topup form
│   ├── add-credit/page.tsx      ← เติมเครดิต (server: auth() guard, then client form)
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts      ← NextAuth handler
│       │   ├── login/route.ts              ← POST → CUSTOMER_AUTH_API_URL/customer-auth/login
│       │   ├── verify-login-otp/route.ts   ← POST → .../customer-auth/verify-login-otp
│       │   ├── register/route.ts           ← POST → .../customer-auth/register
│       │   ├── register-verify/route.ts    ← POST → .../customer-auth/verify-register
│       │   ├── phone/route.ts
│       │   ├── change-password/route.ts    ← POST (requires bearer token)
│       │   ├── forgot-password/route.ts    ← POST; always returns 200 (anti-enumeration)
│       │   ├── reset-password/route.ts     ← POST; maps ERR_AUTH_011 → INVALID_TOKEN
│       │   └── otp-settings/route.ts       ← GET
│       ├── user/
│       │   ├── me/route.ts                 ← GET (bearer token required)
│       │   ├── credit-balance/route.ts     ← GET (bearer token; includes KYC fields)
│       │   ├── credit-history/route.ts     ← GET
│       │   ├── credit-history/[id]/route.ts
│       │   ├── orders/route.ts             ← GET
│       │   └── orders/stats/route.ts       ← GET
│       ├── games/
│       │   ├── [gameId]/route.ts
│       │   └── [gameId]/topup-guide/route.ts
│       ├── topup/
│       │   ├── credits/route.ts            ← POST multipart (slip upload)
│       │   ├── feature-status/route.ts     ← GET
│       │   ├── qr-request/route.ts         ← POST (PromptPay QR)
│       │   ├── qr-request/active/route.ts
│       │   ├── qr-request/[id]/status/route.ts
│       │   ├── qr-request/[id]/cancel/route.ts
│       │   ├── inet-qr-request/route.ts    ← POST (iNET QR)
│       │   ├── inet-qr-request/active/route.ts
│       │   ├── inet-qr-request/[id]/status/route.ts
│       │   └── inet-qr-request/[id]/cancel/route.ts
│       ├── banks/route.ts                  ← GET bank list
│       ├── theme/route.ts                  ← GET theme config JSON
│       ├── image-proxy/route.ts            ← GET (proxy for multi-subdomain CDN images)
│       └── landing/reorder/route.ts        ← POST quick reorder
│
├── components/
│   ├── add-credit/
│   │   ├── add-credit-form.tsx         ← Orchestrator: method selector → step forms
│   │   ├── payment-method-selector.tsx ← Fetches feature-status; shows slip/QR/iNET options
│   │   ├── bank-transfer-form.tsx      ← Fetch /api/banks; show account; upload slip
│   │   ├── qr-transfer-form.tsx        ← PromptPay QR; 5s poll; 20min expiry
│   │   ├── inet-qr-transfer-form.tsx   ← iNET QR; base64 image; 5s poll
│   │   ├── credit-balance-card.tsx     ← Shows balance + email
│   │   ├── kyc-credit-limit-bar.tsx    ← KYC progress bar (10,000 บาท limit)
│   │   ├── confirmation-modal.tsx      ← Review slip before confirm
│   │   ├── loading-modal.tsx           ← Spinner overlay
│   │   ├── success-modal.tsx           ← Transaction complete
│   │   └── qr-status-modal.tsx         ← Expired/matched/cancel-confirm states
│   ├── landing/
│   │   ├── reorder-section.tsx         ← Recent orders carousel; 3-per-page scroll
│   │   └── reorder-card.tsx            ← Individual reorder card
│   └── templates/design1/
│       ├── layout.tsx                  ← StorefrontLayout: header + children + footer
│       ├── header.tsx                  ← Logo + nav + auth buttons
│       ├── footer.tsx                  ← Footer with social icons + contact info
│       ├── banner-footer.tsx           ← Bottom banner (below game grid)
│       ├── hero-banner.tsx             ← Top carousel (Embla)
│       ├── landing.tsx                 ← Games grid + recommendations
│       ├── game-detail.tsx             ← Game detail + topup form
│       ├── game-search-section.tsx     ← Search/filter game list
│       ├── profile-layout.tsx          ← "use client"; sidebar with usePathname
│       ├── profile-client.tsx          ← Profile/orders/credits tabs; eye toggles; password checklist
│       ├── nav-links.tsx               ← Desktop + mobile nav link list
│       └── sign-out-button.tsx         ← "use client"; calls signOut()
│
├── lib/
│   ├── getThemeConfig.ts           ← cache() wrapper; merges API + theme.config.ts
│   ├── utils.ts                    ← cn(), hexToOklch(), generateCSSVariables()
│   └── api/
│       ├── auth.ts                 ← loginCustomer(), verifyLoginOTP()
│       ├── games.ts                ← fetchGameDetails(), fetchGameDetailsServer()
│       ├── landing.ts              ← fetchLandingGamesServer(), fetchRecommendGamesServer()
│       ├── order.ts                ← createOrder()
│       └── storefront.ts          ← fetchStorefrontConfig() → CMS_API_URL/cms/storefront-config
│
└── types/
    ├── games.ts     ← TopupField, TopupOption, GameTopupType, GamePackage, GameDetails
    └── landing.ts   ← GameItem, RecommendGame
```

---

## Environment Variables

All required in `.env.local` (never commit):

```bash
# Business identity
NEXT_PUBLIC_BUSINESS_PROFILE_ID=   # UUID from Nerdbase admin panel

# Backend API base URLs
CMS_API_URL=https://api.nerdbase.co.th/cms/api/v1
GAME_CATALOG_API_URL=https://api.nerdbase.co.th/game-catalog/api/v1
CUSTOMER_AUTH_API_URL=https://api.nerdbase.co.th/customer-auth/api/v1
CUSTOMER_CREDIT_API_URL=https://api.nerdbase.co.th/customer-credit/api/v1
ORDER_API_URL=https://api.nerdbase.co.th/order/api/v1

# NextAuth v5
AUTH_SECRET=           # openssl rand -base64 32
NEXTAUTH_URL=          # e.g. https://yourdomain.com (http://localhost:3000 for dev)
```

---

## Authentication Flow

### Login (email + password + optional OTP)
1. User submits email/password → `POST /api/auth/login` → `CUSTOMER_AUTH_API_URL/customer-auth/login`
2. If backend returns `status: "otp_pending"` → show OTP input field
3. User enters OTP → `POST /api/auth/verify-login-otp` → returns `{ access_token, refresh_token }`
4. `signIn("credentials", { loginData: JSON.stringify(tokens) })` → NextAuth `authorize()` decodes JWT
5. NextAuth stores `accessToken`, `refreshToken`, `accessTokenExp` in JWT session cookie

### Session (JWT strategy)
- `auth.ts` → Credentials provider → `jose` decodes JWT to get `customer_id`, `email`, `first_name`, `last_name`
- Session cookie: 30-day maxAge
- **Auto-refresh**: when token expires within 5 minutes, NextAuth callback calls `/customer-auth/refresh`
- If refresh fails → `token.error = "RefreshTokenExpired"` → session callback throws → user logged out
- Access token available via `(session.user as any).token` in server components

### Protected pages
- `/profile/*` — protected by `app/profile/layout.tsx` calling `auth()` → redirect `/login?callbackUrl=/profile`
- `/add-credit` — protected by `app/add-credit/page.tsx` calling `auth()` → redirect `/login?callbackUrl=/add-credit`

### Forgot / Reset Password
- `POST /api/auth/forgot-password` → always returns 200 (anti-enumeration)
  - Sends `{ email, business_profile_id, redirect_url }` to backend
  - `redirect_url` = `window.location.origin + "/reset-password"` (constructed client-side)
- `POST /api/auth/reset-password` → backend error codes mapped:
  - `ERR_PASSWORD_RESET_TOKEN_NOT_FOUND` / `ERR_AUTH_011` → `{ code: "INVALID_TOKEN" }`
- `/reset-password` page uses `useSearchParams()` → page wrapped in `<Suspense>`

### SSO / OAuth (TODO — not yet implemented)
Backend `CUSTOMER_AUTH_API_URL` already has:
- `GET /customer-auth/google/login?business_profile_id=...` → returns `{ auth_url }`
- `GET /customer-auth/facebook/login?business_profile_id=...` → returns `{ auth_url }`
- Backend handles OAuth redirect and returns tokens

To implement:
1. Add `GET /api/auth/oauth/google/route.ts` → proxy to backend, return `auth_url`
2. Add `GET /api/auth/oauth/facebook/route.ts` → same pattern
3. Add Google/Facebook buttons in `login-form.tsx` → `window.location.href = auth_url`
4. Backend redirects back to `?access_token=...&refresh_token=...`
5. Add `GET /api/auth/oauth/callback/route.ts` → receive tokens → `signIn("credentials", ...)`

---

## Theming System

### How colors work
1. `theme.config.ts` defines `colors.primary` and `colors.secondary` as hex
2. `lib/utils.ts` → `hexToOklch(hex)` converts to OKLCH color space
3. `generateCSSVariables(primary, secondary)` returns CSS string injecting:
   - `--primary`, `--primary-foreground`, `--secondary`, `--ring`, `--sidebar-primary`, etc.
4. `app/layout.tsx` injects as `<style>:root { ${cssVars} }</style>`
5. All components use Tailwind utilities: `bg-primary`, `text-primary`, `border-ring`, etc.

### How fonts work
- `theme.config.ts` → `font: "Athiti, sans-serif"` (or API override)
- `app/layout.tsx` extracts first font name → loads from Google Fonts dynamically
- Applied via `style={{ fontFamily: theme.font }}` on `<body>`

### Color-only theming rule
**Never hardcode colors in components.** Exception: green (success), red (error), amber (warning)
use semantic Tailwind classes: `text-green-600`, `bg-red-50`, `bg-amber-50`.
This site is **light-only** — do NOT add `dark:` variants.

---

## Key Patterns

### Server vs Client Components
- **Server Components** → call `lib/api/*` directly (server-side `fetch` to backend)
- **Client Components** (`"use client"`) → must call `/api/*` routes, never direct backend URLs
- API proxy routes (`app/api/`) never expose backend URLs to browser

### API proxy pattern (API routes)
```ts
// Always include Accept-Language: th
// Pass-through bearer token from session
const res = await fetch(`${process.env.BACKEND_API_URL}/endpoint`, {
  headers: { "Content-Type": "application/json", "Accept-Language": "th" },
});
```

### Bearer token in API routes
```ts
const session = await auth();
const token = (session?.user as any)?.token as string;
// then: Authorization: `Bearer ${token}`
```

### `next/image` vs `<img>`
- Use `next/image` for known CDN hostnames (listed in `next.config.ts`)
- Use plain `<img>` for multi-level subdomains (Cloudflare R2, etc.) that can't be wildcarded

### Modal pattern (no shadcn — plain Tailwind)
```tsx
{open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60" onClick={onClose} />
    <div className="relative z-10 w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
      {/* content */}
    </div>
  </div>
)}
```

### Eye toggle on password inputs
```tsx
import { Eye, EyeOff } from "lucide-react";
const [show, setShow] = useState(false);
// ...
<div className="relative">
  <input type={show ? "text" : "password"} className="... pr-9" />
  <button type="button" onClick={() => setShow(!show)}
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

### Password validation (4 rules — used in register + profile + reset-password)
```ts
const passwordRules = [
  { label: "ความยาวอย่างน้อย 8 ตัวอักษร",             test: (p) => p.length >= 8 },
  { label: "ตัวอักษรพิมพ์เล็กและพิมพ์ใหญ่ (a-z, A-Z)", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "ตัวเลขอย่างน้อย 1 ตัว (0-9)",              test: (p) => /[0-9]/.test(p) },
  { label: "อักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*)",    test: (p) => /[!@#$%^&*()\-_+[\]{},.:;/?`~]/.test(p) },
];
```

### Carousel scroll (reorder-section)
- Uses `scrollRef.current.clientWidth` to scroll exactly one page-width (3 cards per page)
- Card widths: `min-w-[calc(50%-8px)] sm:min-w-[calc((100%-2rem)/3)]`
- `2rem` = 2 × `gap-4` between 3 cards; ensures exact 3-per-page fit

### `scrollbar-hide` utility
Defined as `@utility` in `globals.css` (Tailwind v4 — no plugin needed):
```css
@utility scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
```

---

## Adding a New Template

```
components/templates/design2/
├── layout.tsx    ← export StorefrontLayout({ theme, children })
├── header.tsx
├── footer.tsx
└── landing.tsx   ← export LandingPage({ theme, games, recommendGames })
```

Then update imports in `app/page.tsx`, `app/game/[slug]/page.tsx`, etc.

---

## Conventions

| Rule | Detail |
|------|--------|
| File naming | kebab-case: `game-card.tsx`, never `GameCard.tsx` |
| Path alias | Always use `@/` (not relative paths) |
| Default to Server | `"use client"` only when needed (events, hooks, browser APIs) |
| No dark mode | Light-only; no `dark:` class variants |
| No hardcoded colors | Only `bg-primary`, `text-muted-foreground`, etc. |
| Thai language | All user-facing strings in Thai |
| API headers | Always `"Accept-Language": "th"` for backend calls |
| No shadcn | Pure Tailwind — no shadcn/ui components |
| Alert colors | `bg-red-50 text-red-700`, `bg-green-50 text-green-700`, `bg-amber-50 text-amber-700` |

---

## Common Tasks

| User asks | What to do |
|-----------|-----------|
| เปลี่ยนสี | แก้ `theme.config.ts` → `colors.primary` (ถ้าไม่มี CMS) |
| เปลี่ยน logo | แก้ `theme.config.ts` → `logo.url` |
| เปลี่ยน font | แก้ `theme.config.ts` → `font` (ชื่อ Google Font) |
| แก้ footer/social | แก้ `theme.config.ts` → `footer.*` |
| เพิ่มหน้าใหม่ | สร้าง `app/[route]/page.tsx` + API route ใน `app/api/` |
| เพิ่ม payment method | แก้ `components/add-credit/payment-method-selector.tsx` + สร้าง form component ใหม่ |
| ต้องการ Google/Facebook login | ดู SSO TODO section ด้านบน |
| หน้า profile แยก section | ใช้ nested route `/profile/orders`, `/profile/credits` ที่มีอยู่แล้ว |
| ภาพจาก CDN ที่ `next/image` ไม่รับ | ใช้ `<img>` แทน หรือเพิ่ม hostname ใน `next.config.ts` |
