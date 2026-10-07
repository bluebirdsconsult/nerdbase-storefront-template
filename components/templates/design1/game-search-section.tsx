"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GameItem } from "@/types/landing";

interface GameSearchSectionProps {
  games: GameItem[];
}

export function GameSearchSection({ games }: GameSearchSectionProps) {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? games
      : games.filter((g) =>
          g.name.toLowerCase().includes(query.trim().toLowerCase())
        );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      {/* Search bar */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7 7 0 1 0 6.5 6.5a7 7 0 0 0 10.15 10.15z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาเกม..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Section title */}
      <h2 className="mb-6 text-xl font-semibold">
        {query.trim() !== ""
          ? `ผลการค้นหา "${query.trim()}" (${filtered.length})`
          : "เกมทั้งหมด"}
      </h2>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-sm text-muted-foreground">
          ไม่พบเกมที่ค้นหา
        </div>
      )}
    </section>
  );
}

function GameCard({ game }: { game: GameItem }) {
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
      <p className="line-clamp-2 text-xs font-medium leading-tight transition-colors group-hover:text-primary">
        {game.name}
      </p>
    </Link>
  );
}
