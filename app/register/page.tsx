import { getThemeConfig } from "@/lib/getThemeConfig";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const theme = await getThemeConfig();
  return (
    <RegisterForm
      logoUrl={theme.logo.url}
      logoWidth={theme.logo.width}
      logoHeight={theme.logo.height}
      storeName={theme.store.name}
    />
  );
}
