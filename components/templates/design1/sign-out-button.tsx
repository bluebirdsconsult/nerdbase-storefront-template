"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      ออกจากระบบ
    </button>
  );
}
