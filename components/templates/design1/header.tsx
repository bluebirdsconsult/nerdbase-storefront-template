import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { SignOutButton } from "./sign-out-button";
import { NavLinks } from "./nav-links";
import type { ThemeConfig } from "@/theme.config";
import { fetchStorefrontConfig } from "@/lib/api/storefront";

interface HeaderProps {
  theme: ThemeConfig;
}

async function fetchBalance(token: string): Promise<string | null> {
  try {
    if (!process.env.CUSTOMER_CREDIT_API_URL) return null;
    const res = await fetch(
      `${process.env.CUSTOMER_CREDIT_API_URL}/wallets/balance`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.credit ?? data.data?.balance ?? data.wallet?.balance ?? data.amount ?? null;
    return raw != null ? Number(raw).toLocaleString("th-TH", { minimumFractionDigits: 2 }) : null;
  } catch {
    return null;
  }
}

export async function Header({ theme }: HeaderProps) {
  const [session, storefront] = await Promise.all([
    auth(),
    fetchStorefrontConfig(),
  ]);

  const user = session?.user;
  const token = user ? ((session.user as any).token as string | undefined) : undefined;
  const balance = token ? await fetchBalance(token) : null;

  // Show "ติดต่อทีมงาน" link only when enabled in CMS and at least one social URL exists
  const showContact =
    storefront?.display_settings?.show_contact_menu !== false &&
    (!!storefront?.footer?.facebook_url || !!storefront?.footer?.line_url);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {theme.logo.url ? (
            <Image
              src={theme.logo.url}
              alt={theme.store.name}
              width={theme.logo.width}
              height={theme.logo.height}
              className="object-contain"
              priority
            />
          ) : (
            <span className="text-lg font-bold text-primary">{theme.store.name}</span>
          )}
        </Link>

        {/* Nav links (desktop centered) + hamburger (mobile) */}
        <NavLinks showContact={showContact} />

        {/* Auth section — always visible, right-aligned */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {balance != null && (
                <Link
                  href="/profile/credits"
                  className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                >
                  <span className="text-muted-foreground">฿</span>
                  <span className="tabular-nums">{balance}</span>
                </Link>
              )}
              <Link
                href="/profile"
                className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground hover:text-primary transition-colors sm:block"
              >
                {user.name ?? user.email}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
