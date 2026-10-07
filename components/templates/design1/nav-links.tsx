"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

const BASE_NAV_LINKS: NavLink[] = [
  { href: "/",                 label: "หน้าแรก" },
  { href: "/top-up",           label: "เติมเงินเกม" },
  { href: "/add-credit",       label: "เติมเครดิต" },
  { href: "/profile",          label: "ข้อมูลสมาชิก" },
];

function isLinkActive(link: NavLink, pathname: string): boolean {
  switch (link.label) {
    case "หน้าแรก":
      return pathname === "/";
    case "เติมเงินเกม":
      return pathname === "/top-up" || pathname.startsWith("/game");
    case "เติมเครดิต":
      return pathname.startsWith("/add-credit");
    case "ข้อมูลสมาชิก":
      return pathname.startsWith("/profile");
    default:
      return link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
  }
}

interface NavLinksProps {
  showContact?: boolean;
}

export function NavLinks({ showContact = false }: NavLinksProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links: NavLink[] = showContact
    ? [...BASE_NAV_LINKS, { href: "/contact", label: "ติดต่อทีมงาน" }]
    : BASE_NAV_LINKS;

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Desktop nav ───────────────────────────────────────── */}
      <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
        {links.map((link) => {
          const active = isLinkActive(link, pathname);
          return (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`relative pb-0.5 text-sm font-semibold transition-colors hover:text-primary ${
                active ? "text-primary" : "text-foreground/80"
              }`}
            >
              {link.label}
              {/* Active underline with glow */}
              <span
                className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-primary transition-all duration-200 ${
                  active ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
                style={
                  active
                    ? { boxShadow: "0 0 8px color-mix(in oklch, var(--primary) 65%, transparent)" }
                    : undefined
                }
              />
            </Link>
          );
        })}
      </nav>

      {/* ── Hamburger button (mobile only) ────────────────────── */}
      <button
        className="relative z-50 rounded-md p-1.5 text-foreground transition-colors hover:bg-muted lg:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* ── Backdrop (mobile) ─────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Mobile nav panel ──────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 top-16 z-40 border-b border-border bg-background shadow-lg transition-all duration-300 lg:hidden ${
          menuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-4 py-3">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`border-b border-border px-2 py-3.5 text-sm font-semibold last:border-0 transition-colors ${
                isLinkActive(link, pathname)
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
