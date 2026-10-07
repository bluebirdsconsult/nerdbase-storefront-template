import type { Metadata } from "next";
import { getThemeConfig } from "@/lib/getThemeConfig";
import { generateCSSVariables } from "@/lib/utils";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getThemeConfig();
  return {
    title: theme.seo.title,
    description: theme.seo.description,
    icons: { icon: theme.favicon },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getThemeConfig();
  const cssVars = generateCSSVariables(theme.colors.primary, theme.colors.secondary);
  const fontName = theme.font.split(",")[0].trim().replace(/ /g, "+");

  return (
    <html lang="th" className="h-full antialiased">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
        <link
          href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        style={{ fontFamily: theme.font }}
      >
        {children}
      </body>
    </html>
  );
}
