import Image from "next/image";
import Link from "next/link";
import type { ThemeConfig } from "@/theme.config";
import { Phone, Mail, MapPin, Instagram, Twitter, Youtube, Music, Globe } from "lucide-react";

interface FooterProps {
  theme: ThemeConfig;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export function Footer({ theme }: FooterProps) {
  const { footer, logo, store } = theme;

  const socials = [
    { url: footer.facebook_url, Icon: FacebookIcon, label: "Facebook" },
    { url: footer.line_url,     Icon: LineIcon,    label: "Line" },
    { url: footer.instagram_url, Icon: Instagram,  label: "Instagram" },
    { url: footer.twitter_url,  Icon: Twitter,     label: "Twitter" },
    { url: footer.tiktok_url,   Icon: Music,       label: "TikTok" },
    { url: footer.youtube_url,  Icon: Youtube,     label: "YouTube" },
    { url: footer.website_url,  Icon: Globe,       label: "Website" },
  ].filter((s) => !!s.url);

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4">

          {/* Logo and Description */}
          <div className="col-span-2 space-y-4 lg:col-span-1">
            {logo.url ? (
              <Image
                src={logo.url}
                alt={store.name}
                width={logo.width}
                height={logo.height}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-primary">{store.name}</span>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {footer.description}
            </p>
          </div>

          {/* Mobile: left column wrapper (unwraps on md+) */}
          <div className="col-span-1 space-y-8 md:contents">
            {/* Services Column */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">บริการของเรา</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                    เติมเงินเกม
                  </Link>
                </li>
                <li>
                  <Link href="/profile/credits" className="text-muted-foreground hover:text-primary transition-colors">
                    เติมเครดิต
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                    ข้อมูลสมาชิก
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policy Column */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">นโยบายและเงื่อนไข</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    ข้อกำหนดการใช้งาน
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 space-y-4">
            <h3 className="text-base font-semibold">ติดต่อเรา</h3>
            <div className="space-y-3 text-sm">
              {footer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Tel</p>
                    <a
                      href={`tel:${footer.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {footer.phone}
                    </a>
                  </div>
                </div>
              )}
              {footer.email && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Mail</p>
                    <a
                      href={`mailto:${footer.email}`}
                      className="text-muted-foreground hover:text-primary break-all transition-colors"
                    >
                      {footer.email}
                    </a>
                  </div>
                </div>
              )}
              {footer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {footer.address}
                    </p>
                  </div>
                </div>
              )}

              {socials.length > 0 && (
                <div className="pt-2">
                  <p className="mb-2 font-medium">Follow Us</p>
                  <div className="flex flex-wrap gap-2.5">
                    {socials.map(({ url, Icon, label }) => (
                      <a
                        key={label}
                        href={url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground/70 transition-colors hover:bg-primary hover:text-primary-foreground"
                        aria-label={label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {footer.company_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
