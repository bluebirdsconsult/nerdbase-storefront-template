import type { ThemeConfig } from "@/theme.config";
import { Header } from "./header";
import { Footer } from "./footer";

interface StorefrontLayoutProps {
  theme: ThemeConfig;
  children: React.ReactNode;
}

export function StorefrontLayout({ theme, children }: StorefrontLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Header theme={theme} />
      <main className="flex-1">{children}</main>
      <Footer theme={theme} />
    </div>
  );
}
