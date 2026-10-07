import { NextResponse } from "next/server";
import { getThemeConfig } from "@/lib/getThemeConfig";
import { fetchStorefrontConfig } from "@/lib/api/storefront";

export async function GET() {
  try {
    const [theme, storefront] = await Promise.all([
      getThemeConfig(),
      fetchStorefrontConfig(),
    ]);
    return NextResponse.json({
      logo_url:         theme.logo.url,
      logo_width:       theme.logo.width,
      logo_height:      theme.logo.height,
      company_name:     theme.footer.company_name,
      address:          theme.footer.address,
      show_total_topup: storefront?.display_settings?.show_total_topup ?? true,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load theme" }, { status: 500 });
  }
}
