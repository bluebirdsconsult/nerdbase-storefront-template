import { cache } from "react";
import { themeConfig } from "@/theme.config";
import type { ThemeConfig } from "@/theme.config";
import { fetchStorefrontConfig } from "@/lib/api/storefront";

/**
 * Returns the ThemeConfig for the current business profile.
 * Fetches live branding from CMS API (logo, banners, colors, etc.)
 * and falls back to static theme.config.ts defaults when unavailable.
 *
 * Wrapped in React cache() so multiple calls per request are deduplicated.
 */
export const getThemeConfig = cache(async (): Promise<ThemeConfig> => {
  const storefront = await fetchStorefrontConfig();
  if (!storefront) return themeConfig;

  const primary = storefront.theme?.primary_color ?? themeConfig.colors.primary;
  const secondary = storefront.theme?.secondary_color ?? themeConfig.colors.secondary;
  const font = storefront.theme?.font_family ?? themeConfig.font;
  const storeName = storefront.theme?.title ?? storefront.footer?.company_name ?? themeConfig.store.name;

  return {
    store: {
      name: storeName,
      description: themeConfig.store.description,
    },
    colors: { primary, secondary },
    font,
    logo: storefront.logo?.image_url
      ? { url: storefront.logo.image_url, width: themeConfig.logo.width, height: themeConfig.logo.height }
      : themeConfig.logo,
    favicon: storefront.favicon?.image_url ?? themeConfig.favicon,
    banners: storefront.banners.length > 0
      ? storefront.banners.map((b) => ({
          desktop_url: b.desktop_image_url,
          mobile_url: b.mobile_image_url ?? b.desktop_image_url,
          link_url: b.link_url ?? "",
        }))
      : themeConfig.banners,
    banner_footers: storefront.banner_footers.length > 0
      ? storefront.banner_footers.map((b) => ({
          desktop_url: b.desktop_image_url,
          mobile_url: b.mobile_image_url ?? b.desktop_image_url,
          link_url: b.link_url ?? "",
        }))
      : themeConfig.banner_footers,
    footer: {
      company_name: storefront.footer?.company_name ?? themeConfig.footer.company_name,
      description: storefront.footer?.description ?? themeConfig.footer.description,
      phone: storefront.footer?.phone ?? themeConfig.footer.phone,
      email: storefront.footer?.email ?? themeConfig.footer.email,
      address: storefront.footer?.address ?? themeConfig.footer.address,
      facebook_url: storefront.footer?.facebook_url ?? themeConfig.footer.facebook_url,
      line_url: storefront.footer?.line_url ?? themeConfig.footer.line_url,
      instagram_url: storefront.footer?.instagram_url ?? themeConfig.footer.instagram_url,
      twitter_url: storefront.footer?.twitter_url ?? themeConfig.footer.twitter_url,
      tiktok_url: storefront.footer?.tiktok_url ?? themeConfig.footer.tiktok_url,
      youtube_url: storefront.footer?.youtube_url ?? themeConfig.footer.youtube_url,
      website_url: storefront.footer?.website_url ?? themeConfig.footer.website_url,
    },
    seo: {
      title: storefront.seo?.title ?? themeConfig.seo.title,
      description: storefront.seo?.description ?? themeConfig.seo.description,
    },
  };
});
