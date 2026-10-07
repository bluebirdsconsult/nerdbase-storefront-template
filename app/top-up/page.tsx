import type { Metadata } from "next";
import { getThemeConfig } from "@/lib/getThemeConfig";
import { fetchLandingGamesServer } from "@/lib/api/landing";
import { StorefrontLayout } from "@/components/templates/design1/layout";
import { GameSearchSection } from "@/components/templates/design1/game-search-section";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getThemeConfig();
  return {
    title: `เติมเงินเกม — ${theme.store.name}`,
    description: "เลือกเกมที่ชื่นชอบแล้วเติมได้ง่ายๆ ภายในไม่กี่คลิก",
  };
}

export default async function TopUpPage() {
  const [theme, games] = await Promise.all([
    getThemeConfig(),
    fetchLandingGamesServer(),
  ]);

  return (
    <StorefrontLayout theme={theme}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">เติมเงินเกม</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เลือกเกมที่คุณชื่นชอบแล้วเติมได้ง่ายๆ ภายในไม่กี่คลิก
          </p>
        </div>

        {/* Search + Grid */}
        <GameSearchSection games={games ?? []} />
      </div>
    </StorefrontLayout>
  );
}
