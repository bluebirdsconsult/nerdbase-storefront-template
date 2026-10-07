import { getThemeConfig } from "@/lib/getThemeConfig";
import ForgotPasswordForm from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const theme = await getThemeConfig();
  return (
    <ForgotPasswordForm
      logoUrl={theme.logo.url}
      logoWidth={theme.logo.width}
      logoHeight={theme.logo.height}
      storeName={theme.store.name}
    />
  );
}
