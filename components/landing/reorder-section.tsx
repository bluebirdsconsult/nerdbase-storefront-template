"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReorderCard, type ReorderItem } from "./reorder-card";

export function ReorderSection() {
  const [items, setItems] = useState<ReorderItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/landing/reorder")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || items.length < 3) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">ทำรายการเติมซ้ำ</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item) => (
          <div key={item.id} className="h-[110px] min-w-[calc(50%-8px)] shrink-0 sm:min-w-[calc((100%-2rem)/3)] md:h-[120px]" style={{ scrollSnapAlign: "start" }}>
            <ReorderCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
