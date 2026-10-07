import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getThemeConfig } from "@/lib/getThemeConfig";
import { StorefrontLayout } from "@/components/templates/design1/layout";
import { AddCreditForm } from "@/components/add-credit/add-credit-form";

export default async function AddCreditPage() {
  const [session, theme] = await Promise.all([auth(), getThemeConfig()]);

  if (!session) {
    redirect("/login?callbackUrl=/add-credit");
  }

  const user = session.user as any;
  const email: string = user.email ?? "";

  return (
    <StorefrontLayout theme={theme}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <AddCreditForm email={email} />
      </div>
    </StorefrontLayout>
  );
}
