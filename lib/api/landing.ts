import type { GameItem, RecommendGame } from "@/types/landing";

const GAME_CATALOG_API_URL = process.env.GAME_CATALOG_API_URL;
const BUSINESS_PROFILE_ID = process.env.NEXT_PUBLIC_BUSINESS_PROFILE_ID!;

async function fetchFromCatalog<T>(path: string): Promise<T[] | null> {
  if (!GAME_CATALOG_API_URL) return null;
  try {
    const res = await fetch(`${GAME_CATALOG_API_URL}${path}`, {
      headers: { "Content-Type": "application/json", "Accept-Language": "th" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.data ?? [];
  } catch {
    return null;
  }
}

export function fetchLandingGamesServer(): Promise<GameItem[] | null> {
  return fetchFromCatalog<GameItem>(
    `/customer/games/${BUSINESS_PROFILE_ID}?is_active=true&all=true`
  );
}

// recommend endpoint returns BusinessGameResponse — fields are nested inside `game`
export async function fetchRecommendGamesServer(): Promise<RecommendGame[] | null> {
  if (!GAME_CATALOG_API_URL) return null;
  try {
    const res = await fetch(
      `${GAME_CATALOG_API_URL}/customer/recommend-game/${BUSINESS_PROFILE_ID}`,
      {
        headers: { "Content-Type": "application/json", "Accept-Language": "th" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const result = await res.json();
    const raw: any[] = result.data ?? [];
    return raw.map((item) => ({
      id: item.game?.id ?? item.game_id,
      name: item.game?.name ?? "",
      slug: item.game?.slug ?? "",
      image_url: item.game?.image_url ?? "",
      sequence: item.recommend_sequence ?? item.sequence ?? 0,
    }));
  } catch {
    return null;
  }
}
