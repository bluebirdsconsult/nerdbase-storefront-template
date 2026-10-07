import type { GameDetails, TopupGuide } from "@/types/games";

const BUSINESS_PROFILE_ID = process.env.NEXT_PUBLIC_BUSINESS_PROFILE_ID!;

/**
 * Client-side: fetch game details (goes through Next.js API route)
 */
export async function fetchGameDetails(gameId: string): Promise<GameDetails> {
  const res = await fetch(`/api/games/${gameId}`, { cache: "no-store" });
  if (res.status === 404) throw new Error("GAME_NOT_FOUND");
  if (!res.ok) throw new Error(`Failed to fetch game: ${res.status}`);
  return res.json();
}

/**
 * Client-side: fetch topup guide for a game
 */
export async function fetchTopupGuide(gameId: string): Promise<TopupGuide | null> {
  try {
    const res = await fetch(`/api/games/${gameId}/topup-guide`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Server-side: fetch game details directly from backend (used in generateMetadata)
 */
export async function fetchGameDetailsServer(gameId: string): Promise<GameDetails | null> {
  const apiUrl = process.env.GAME_CATALOG_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(
      `${apiUrl}/customer/${encodeURIComponent(BUSINESS_PROFILE_ID)}/game/${encodeURIComponent(gameId)}`,
      {
        headers: { "Content-Type": "application/json", "Accept-Language": "th" },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
