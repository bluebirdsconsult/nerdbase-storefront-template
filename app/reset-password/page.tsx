import { Suspense } from "react";
import { getThemeConfig } from "@/lib/getThemeConfig";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage() {
  const theme = await getThemeConfig();
  return (
    <Suspense>
      <ResetPasswordForm
        logoUrl={theme.logo.url}
        logoWidth={theme.logo.width}
        logoHeight={theme.logo.height}
        storeName={theme.store.name}
      />
    </Suspense>
  );
}
