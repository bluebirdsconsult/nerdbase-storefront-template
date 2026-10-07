"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export interface ReorderItem {
  id: string;
  order_no: string;
  game_id: string;
  game_package_id: string;
  game_name: string;
  package_name: string;
  package_image_url: string | null;
  game_image_url: string | null;
  amount: number;
  topup_data?: Record<string, string>;
}

export function ReorderCard({ item }: { item: ReorderItem }) {
  const params = new URLSearchParams({ packageId: item.game_package_id });
  if (item.topup_data) {
    Object.entries(item.topup_data).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
  }
  const href = `/game/${item.game_id}?${params.toString()}`;
  const imageUrl = item.package_image_url ?? item.game_image_url;

  return (
    <Link
      href={href}
      className="group flex h-full flex-row overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      {/* Square image — fixed size */}
      <div className="relative h-full w-[90px] shrink-0 overflow-hidden bg-muted md:w-[110px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.package_name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="space-y-1">
          <p className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
            {item.package_name}
          </p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{item.game_name}</p>

          {/* topup_data (uid/link) */}
          {item.topup_data && (
            <div className="space-y-0.5 pt-0.5">
              {Object.entries(item.topup_data)
                .filter(([, v]) => v)
                .slice(0, 2)
                .map(([k, v]) => (
                  <p key={k} className="truncate text-xs text-muted-foreground">
                    <span className="font-medium">{k}:</span> {v}
                  </p>
                ))}
            </div>
          )}
        </div>

        {/* Button */}
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <RotateCcw className="h-3 w-3" />
          เติมอีกครั้ง
        </div>
      </div>
    </Link>
  );
}
