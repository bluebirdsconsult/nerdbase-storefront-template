/**
 * =============================================================================
 * THEME CONFIGURATION — ค่า fallback เมื่อ CMS API ยังไม่ได้ตั้งค่า
 * =============================================================================
 *
 * ไฟล์นี้ทำหน้าที่เป็น "ค่าเริ่มต้น" เท่านั้น
 *
 * ในทางปฏิบัติ: ถ้า Nerdbase Admin Panel ตั้งค่า branding ไว้แล้ว
 * ระบบจะดึงข้อมูลจาก CMS API แทนและ override ค่าในไฟล์นี้ทั้งหมด
 * (ยกเว้น store.description, logo.width, logo.height ที่ใช้จากไฟล์นี้เสมอ)
 *
 * เมื่อไหรควรแก้ไฟล์นี้:
 *   - ระหว่าง dev / ยังไม่มี CMS config
 *   - ต้องการ fallback สำรองกรณี API ล่ม
 *   - ต้องการกำหนด logo.width / logo.height (ไม่มีใน CMS)
 */

export const themeConfig = {
  /**
   * ข้อมูลร้าน
   * - name: fallback (CMS ใช้ theme.title หรือ footer.company_name แทน)
   * - description: ใช้จากไฟล์นี้เสมอ (CMS ไม่ได้ส่ง field นี้มา)
   */
  store: {
    name: "Nerd Topup",
    description: "เติมเกมไว ปลอดภัย 100%",
  },

  /**
   * สีหลักของร้าน (Hex format)
   * เปลี่ยนสีตรงนี้ — ทั้งเว็บจะเปลี่ยนตาม
   */
  colors: {
    primary: "#3B82F6",   // สีปุ่มหลัก, link, accent
    secondary: "#2196F3", // สีรอง
  },

  /**
   * Font family
   * ใช้ชื่อ font จาก Google Fonts หรือ system font
   * เช่น "Kanit, sans-serif" | "Inter, sans-serif" | "Prompt, sans-serif"
   */
  font: "Athiti, sans-serif",

  /**
   * Logo และ Favicon
   * - url: fallback (CMS ใช้ logo.image_url แทน)
   * - width / height: ใช้จากไฟล์นี้เสมอ (CMS ไม่ได้ส่ง dimension มา)
   * - favicon: fallback (CMS ใช้ favicon.image_url แทน)
   */
  logo: {
    url: "https://cdn.nerdbase.cloud/business-logos/ed763c0a-2d9f-470a-8a20-5e34d1c2711d_1785074617.png",
    width: 120,   // ← ใช้เสมอ — ปรับขนาด logo header ที่นี่
    height: 40,   // ← ใช้เสมอ
  },
  favicon: "https://cdn.nerdbase.cloud/business-favicons/37a2ba80-5cb6-45dd-9457-38d9095fc81d_1781292068.png",

  /**
   * Banner หน้าแรก — fallback (CMS มี banners ให้จัดการผ่าน Admin Panel)
   * สามารถใส่ได้หลาย banner (carousel)
   */
  banners: [
    {
      desktop_url: "https://cdn.nerdbase.cloud/business-banners/4d3a189a-cc54-4a2d-a7c0-ee265c0d4638_1785064792.jpg",
      mobile_url: "https://cdn.nerdbase.cloud/business-banners/e0cf3e52-13ea-43f6-b7eb-4a5a5b724984_1785064793.jpg",
      link_url: "",
    },
  ],

  /**
   * Banner ด้านล่างหน้าแรก (optional)
   * แสดงหลังรายการเกมทั้งหมด — ใส่ URL รูปหรือเว้นว่างเพื่อซ่อน
   */
  banner_footers: [
    {
      desktop_url: "",
      mobile_url:  "",
      link_url:    "",
    },
  ],

  /**
   * Footer — fallback ทุก field (CMS จัดการผ่าน Admin Panel → Business Settings)
   */
  footer: {
    company_name: "บริษัท ดิจิทัล เนิร์ด เบส จำกัด",
    description: "บริการเติมเกมออนไลน์ ครบทุกเกม",
    phone: "0815065592",
    email: "nerdbaseVIP@gmail.com",
    address: "1962/60 ถนนอ่อนนุช แขวงอ่อนนุช เขตสวนหลวง กรุงเทพมหานคร",
    // Social links — ใส่ URL เต็ม หรือเว้นว่างไว้ถ้าไม่มี
    facebook_url: "https://www.facebook.com/profile.php?id=61592480551591",
    line_url: "https://line.me/ti/p/RLUMzyHBx2",
    instagram_url: "",
    twitter_url: "",
    tiktok_url: "",
    youtube_url: "",
    website_url: "",
  },

  /**
   * SEO — fallback (CMS จัดการผ่าน Admin Panel → SEO Settings)
   */
  seo: {
    title: "Nerd Topup เติมเกมได้ทุกวัน พร้อมบริการอย่างมืออาชีพ",
    description: "เติมเกมไว ปลอดภัย 100% ราคาคุ้ม",
  },
};

export type ThemeConfig = typeof themeConfig;
