import type { Metadata } from "next";
import { getThemeConfig } from "@/lib/getThemeConfig";
import { StorefrontLayout } from "@/components/templates/design1/layout";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getThemeConfig();
  return {
    title: `ติดต่อทีมงาน — ${theme.store.name}`,
  };
}

// ── Social brand icons (fill-white, h-8 w-8) ──────────────────────────────────

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ContactPage() {
  const theme = await getThemeConfig();
  const { footer } = theme;

  const socials = [
    footer.facebook_url && { name: "Facebook",   url: footer.facebook_url,  bg: "#1877F2", icon: <FacebookIcon /> },
    footer.line_url      && { name: "LINE",        url: footer.line_url,       bg: "#06C755", icon: <LineIcon /> },
    footer.instagram_url && { name: "Instagram",  url: footer.instagram_url, bg: "#E1306C", icon: <InstagramIcon /> },
    footer.tiktok_url    && { name: "TikTok",      url: footer.tiktok_url,    bg: "#010101", icon: <TikTokIcon /> },
    footer.youtube_url   && { name: "YouTube",     url: footer.youtube_url,   bg: "#FF0000", icon: <YouTubeIcon /> },
    footer.twitter_url   && { name: "X (Twitter)", url: footer.twitter_url,   bg: "#14171A", icon: <TwitterIcon /> },
    footer.website_url   && { name: "เว็บไซต์",     url: footer.website_url,   bg: "#6366F1", icon: <WebsiteIcon /> },
  ].filter(Boolean) as { name: string; url: string; bg: string; icon: React.ReactNode }[];

  return (
    <StorefrontLayout theme={theme}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* ── Hero banner ─────────────────────────────────────────────── */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-primary px-8 py-10 text-center text-primary-foreground">
          {/* decorative blobs */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10" />

          {/* headset icon */}
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-white" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>

          <h1 className="relative text-2xl font-bold">ติดต่อทีมงาน</h1>
          {footer.company_name && (
            <p className="relative mt-1 text-sm opacity-80">{footer.company_name}</p>
          )}
          <p className="relative mt-2 text-sm opacity-70">พร้อมให้บริการและตอบทุกคำถาม</p>
        </div>

        {/* ── Social grid ─────────────────────────────────────────────── */}
        {socials.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-sm font-semibold text-foreground">ช่องทางติดต่อ</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 rounded-2xl p-5 text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  style={{ backgroundColor: s.bg }}
                >
                  {s.icon}
                  <span className="text-sm font-bold">{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Contact info cards ──────────────────────────────────────── */}
        {(footer.phone || footer.email || footer.address) && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">ข้อมูลติดต่อ</h2>
            <div className="space-y-3">

              {footer.phone && (
                <a
                  href={`tel:${footer.phone}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-green-600" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">เบอร์โทรศัพท์</p>
                    <p className="font-semibold text-foreground">{footer.phone}</p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {footer.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-blue-600" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline strokeLinecap="round" strokeLinejoin="round" points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">อีเมล</p>
                    <p className="break-all font-semibold text-foreground">{footer.email}</p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {footer.address && (
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-orange-500" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">ที่อยู่</p>
                    <p className="font-semibold text-foreground leading-relaxed">{footer.address}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {socials.length === 0 && !footer.phone && !footer.email && !footer.address && (
          <div className="rounded-2xl border border-border bg-card py-20 text-center">
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลติดต่อ</p>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
