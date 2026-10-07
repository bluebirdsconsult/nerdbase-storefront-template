import { getImageProps } from "next/image";
import type { ThemeConfig } from "@/theme.config";

interface BannerFooterProps {
  theme: ThemeConfig;
}

export function BannerFooter({ theme }: BannerFooterProps) {
  const banner = theme.banner_footers?.[0];

  if (!banner?.desktop_url && !banner?.mobile_url) {
    return null;
  }

  const desktopUrl = banner.desktop_url || banner.mobile_url;
  const mobileUrl  = banner.mobile_url  || banner.desktop_url;
  const alt = "Banner";

  const { props: desktopProps } = getImageProps({
    src: desktopUrl,
    alt,
    width: 1600,
    height: 500,
    sizes: "100vw",
    quality: 60,
  });

  const { props: mobileProps } = getImageProps({
    src: mobileUrl,
    alt,
    width: 828,
    height: 460,
    sizes: "100vw",
    quality: 60,
  });

  const inner = (
    <div className="relative aspect-[9/5] w-full overflow-hidden rounded-xl bg-muted md:aspect-[16/5]">
      <picture className="h-full w-full">
        <source media="(min-width: 768px)" srcSet={desktopProps.srcSet} sizes="100vw" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...mobileProps}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </picture>
    </div>
  );

  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }

  return inner;
}
