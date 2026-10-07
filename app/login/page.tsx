import { getThemeConfig } from "@/lib/getThemeConfig";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const theme = await getThemeConfig();
  return (
    <LoginForm
      logoUrl={theme.logo.url}
      logoWidth={theme.logo.width}
      logoHeight={theme.logo.height}
      storeName={theme.store.name}
    />
  );
}
