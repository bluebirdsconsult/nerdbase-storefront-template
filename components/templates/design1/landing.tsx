import Image from "next/image";
import Link from "next/link";
import type { ThemeConfig } from "@/theme.config";
import type { GameItem, RecommendGame } from "@/types/landing";
import { GameSearchSection } from "./game-search-section";
import { HeroBanner } from "./hero-banner";
import { BannerFooter } from "./banner-footer";
import { ReorderSection } from "@/components/landing/reorder-section";

interface LandingPageProps {
  theme: ThemeConfig;
  games: GameItem[];
  recommendGames: RecommendGame[];
}

export function LandingPage({ theme, games, recommendGames }: LandingPageProps) {
  const featuredGames = recommendGames.length > 0 ? recommendGames : games.slice(0, 6);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Banner Carousel */}
      {theme.banners.length > 0 && (
        <section className="w-full pt-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-xl">
              <HeroBanner banners={theme.banners} />
            </div>
          </div>
        </section>
      )}

      {/* Reorder Section — only visible when logged-in user has history */}
      <ReorderSection />

      {/* Recommended Games */}
      {featuredGames.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h2 className="mb-6 text-xl font-semibold">เกมแนะนำ</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* All Games with Search */}
      {games.length > 0 ? (
        <GameSearchSection games={games} />
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
          <p className="text-muted-foreground">ยังไม่มีเกมในขณะนี้</p>
        </div>
      )}

      {/* Footer Banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <BannerFooter theme={theme} />
      </section>
    </div>
  );
}


function GameCard({ game }: { game: GameItem | RecommendGame }) {
  return (
    <Link
      href={`/game/${game.slug ?? game.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {game.image_url ? (
          <Image src={game.image_url} alt={game.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-xs font-medium leading-tight group-hover:text-primary transition-colors">
        {game.name}
      </p>
    </Link>
  );
}
