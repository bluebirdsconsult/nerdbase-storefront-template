// Storefront config fetched from CMS API based on NEXT_PUBLIC_BUSINESS_PROFILE_ID

export interface StorefrontConfig {
  business_profile_id: string;
  logo: { image_url: string } | null;
  favicon: { image_url: string } | null;
  banners: Array<{
    desktop_image_url: string;
    mobile_image_url?: string | null;
    title?: string | null;
    description?: string | null;
    link_url?: string | null;
  }>;
  banner_footers: Array<{
    desktop_image_url: string;
    mobile_image_url?: string | null;
    link_url?: string | null;
  }>;
  footer: {
    company_name?: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    facebook_url?: string | null;
    line_url?: string | null;
    instagram_url?: string | null;
    twitter_url?: string | null;
    tiktok_url?: string | null;
    youtube_url?: string | null;
    website_url?: string | null;
  } | null;
  theme: {
    title?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    font_family?: string | null;
    template?: string | null;
  } | null;
  seo: {
    title?: string | null;
    description?: string | null;
    image_url?: string | null;
    google_analytics_id?: string | null;
  } | null;
  display_settings: {
    show_total_topup: boolean;
    announcement_enabled: boolean;
    announcement_text?: string | null;
    show_contact_menu: boolean;
    contact_description?: string | null;
  };
}

export async function fetchStorefrontConfig(): Promise<StorefrontConfig | null> {
  const cmsUrl = process.env.CMS_API_URL;
  const profileId = process.env.NEXT_PUBLIC_BUSINESS_PROFILE_ID;
  if (!cmsUrl || !profileId) return null;

  try {
    const res = await fetch(
      `${cmsUrl}/public/storefront-by-id?id=${profileId}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    // API wraps response in { data: ... }
    return (json.data ?? json) as StorefrontConfig;
  } catch {
    return null;
  }
}
