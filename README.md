# Nerdbase Storefront Template

White-label game topup storefront powered by [Nerdbase](https://nerdbase.co.th) APIs.
Fork this repo, set your env vars, and deploy your own branded game topup store.

---

## Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/Bluebirdsconsult/nerdbase-storefront-template.git
cd nerdbase-storefront-template
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

แก้ `.env.local`:

| Variable | ได้มาจากไหน |
|----------|------------|
| `NEXT_PUBLIC_BUSINESS_PROFILE_ID` | Nerdbase Admin Panel → Business Settings |
| `AUTH_SECRET` | รัน `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` (dev) หรือ domain จริง (production) |

> **หมายเหตุ:** API URLs ทั้ง 5 ตัวมี default อยู่ใน `next.config.ts` แล้ว ไม่ต้องตั้งใน `.env.local`

### 3. Run

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## Branding

แก้ไฟล์ `theme.config.ts` สำหรับ branding เริ่มต้น (สี, font, logo, footer):

```ts
export const themeConfig = {
  store: { name: "ชื่อร้านคุณ" },
  colors: { primary: "#3B82F6" },  // hex color
  font: "Kanit, sans-serif",       // Google Font name
  logo: { url: "/logo.png", width: 120, height: 40 },
  ...
};
```

> **หมายเหตุ:** ค่าในไฟล์นี้เป็นแค่ fallback — ถ้าตั้งค่า branding ใน Nerdbase Admin Panel แล้ว
> ระบบจะดึงข้อมูลจาก CMS API แทนโดยอัตโนมัติ

---

## Deploy

### Vercel (แนะนำ)

```bash
npm i -g vercel
vercel
```

ตั้งค่า environment variables ใน Vercel Dashboard ให้ครบก่อน deploy production

### Docker / VPS

```bash
npm run build
npm start
```

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — no shadcn/ui
- **NextAuth v5** — JWT session, Credentials provider
- **Nerdbase APIs** — game catalog, customer auth, credit, orders

---

## Project Structure

```
├── theme.config.ts        ← Branding fallback (สี, font, logo, footer)
├── auth.ts                ← NextAuth config
├── app/                   ← Pages + API routes
│   ├── page.tsx           ← Landing page
│   ├── top-up/            ← หน้าค้นหาเกม
│   ├── game/[slug]/       ← Game detail + topup
│   ├── login/             ← Login + OTP
│   ├── register/          ← สมัครสมาชิก
│   ├── forgot-password/   ← ลืมรหัสผ่าน
│   ├── reset-password/    ← Reset รหัสผ่าน
│   ├── profile/           ← ข้อมูลบัญชี / orders / credits
│   ├── add-credit/        ← เติมเครดิต (QR / โอนเงิน)
│   ├── contact/           ← ติดต่อทีมงาน
│   └── api/               ← API proxy routes (ไม่ expose backend URLs)
├── components/
│   ├── templates/design1/ ← Default template (layout, header, footer, ...)
│   ├── add-credit/        ← Payment flow components
│   └── landing/           ← Reorder section
└── lib/
    ├── getThemeConfig.ts  ← Merge CMS data + theme.config.ts
    └── api/               ← Server-side API calls
```

---

## AI Assistant

ไฟล์ context สำหรับ AI tools อยู่ใน root — AI จะเข้าใจ project structure, patterns, และ conventions โดยอัตโนมัติ:

| File | Tool |
|------|------|
| `CLAUDE.md` | Claude Code |
| `.cursorrules` | Cursor |
| `.windsurfrules` | Windsurf |
| `.github/copilot-instructions.md` | GitHub Copilot |
