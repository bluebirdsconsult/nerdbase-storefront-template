import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default API URLs — ใช้ค่านี้ถ้าไม่ได้ตั้ง env var (override ได้ใน .env.local)
  env: {
    CMS_API_URL: process.env.CMS_API_URL ?? "https://api.nerdbase.co.th/cms/api/v1",
    GAME_CATALOG_API_URL: process.env.GAME_CATALOG_API_URL ?? "https://api.nerdbase.co.th/game-catalog/api/v1",
    CUSTOMER_AUTH_API_URL: process.env.CUSTOMER_AUTH_API_URL ?? "https://api.nerdbase.co.th/customer-auth/api/v1",
    CUSTOMER_CREDIT_API_URL: process.env.CUSTOMER_CREDIT_API_URL ?? "https://api.nerdbase.co.th/customer-credit/api/v1",
    ORDER_API_URL: process.env.ORDER_API_URL ?? "https://api.nerdbase.co.th/order/api/v1",
  },
  images: {
    remotePatterns: [
      // Nerdbase CDN / API
      { protocol: "https", hostname: "*.nerdbase.co.th" },
      { protocol: "https", hostname: "cdn.nerdbase.cloud" },
      // AWS S3 / CloudFront (for game images)
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      // Google Cloud Storage
      { protocol: "https", hostname: "storage.googleapis.com" },
      // เพิ่ม hostname ของ CDN คุณเองที่นี่
    ],
  },
};

export default nextConfig;
