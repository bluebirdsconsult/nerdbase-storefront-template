"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

const NAV = [
  { href: "/profile",         label: "ข้อมูลบัญชี" },
  { href: "/profile/orders",  label: "ประวัติ Order เติมเกม" },
  { href: "/profile/credits", label: "ประวัติเติมเครดิต" },
];

interface ProfileLayoutProps {
  displayName: string;
  initial: string;
  email: string;
  children: React.ReactNode;
}

export function ProfileLayout({ displayName, initial, email, children }: ProfileLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">

        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-60">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {initial}
              </div>
              <p className="text-sm font-semibold text-foreground leading-tight">{displayName}</p>
              <p className="w-full truncate text-center text-xs text-muted-foreground">{email}</p>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {NAV.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="border-t border-border pt-3">
              <SignOutButton />
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
