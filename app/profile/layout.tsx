import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getThemeConfig } from "@/lib/getThemeConfig";
import { StorefrontLayout } from "@/components/templates/design1/layout";
import { ProfileLayout } from "@/components/templates/design1/profile-layout";

async function fetchProfile(token: string) {
  try {
    const res = await fetch(
      `${process.env.CUSTOMER_AUTH_API_URL}/customer-auth/me`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export default async function ProfileRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile");

  const token = (session.user as any).token as string;
  const [theme, profile] = await Promise.all([
    getThemeConfig(),
    fetchProfile(token),
  ]);

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ""}`
    : session.user.name || session.user.email || "";
  const initial = (displayName || session.user.email || "?")[0].toUpperCase();
  const email = profile?.email ?? session.user.email ?? "";

  return (
    <StorefrontLayout theme={theme}>
      <ProfileLayout displayName={displayName} initial={initial} email={email}>
        {children}
      </ProfileLayout>
    </StorefrontLayout>
  );
}
