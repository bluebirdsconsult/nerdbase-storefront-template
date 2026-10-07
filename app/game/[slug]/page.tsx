import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchGameDetailsServer } from "@/lib/api/games";
import { getThemeConfig } from "@/lib/getThemeConfig";
import { StorefrontLayout } from "@/components/templates/design1/layout";
import { GameDetailPage } from "@/components/templates/design1/game-detail";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [game, theme] = await Promise.all([fetchGameDetailsServer(slug), getThemeConfig()]);
  if (!game) return { title: theme.seo.title };
  return {
    title: `${game.name} — ${theme.store.name}`,
    description: game.description ?? theme.seo.description,
    openGraph: game.image_url ? { images: [game.image_url] } : undefined,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const [game, theme] = await Promise.all([fetchGameDetailsServer(slug), getThemeConfig()]);
  if (!game) notFound();

  const { packageId, ...restParams } = resolvedSearchParams;
  const prefillData: Record<string, string> = {};
  for (const [key, value] of Object.entries(restParams)) {
    if (value) prefillData[key] = value;
  }

  return (
    <StorefrontLayout theme={theme}>
      <GameDetailPage game={game} defaultPackageId={packageId} prefillData={prefillData} />
    </StorefrontLayout>
  );
}
