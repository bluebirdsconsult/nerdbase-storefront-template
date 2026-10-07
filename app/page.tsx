import { getThemeConfig } from "@/lib/getThemeConfig";
import { fetchLandingGamesServer, fetchRecommendGamesServer } from "@/lib/api/landing";
import { StorefrontLayout } from "@/components/templates/design1/layout";
import { LandingPage } from "@/components/templates/design1/landing";

export const revalidate = 300;

export default async function Home() {
  const [theme, games, recommendGames] = await Promise.all([
    getThemeConfig(),
    fetchLandingGamesServer(),
    fetchRecommendGamesServer(),
  ]);

  return (
    <StorefrontLayout theme={theme}>
      <LandingPage
        theme={theme}
        games={games ?? []}
        recommendGames={recommendGames ?? []}
      />
    </StorefrontLayout>
  );
}
