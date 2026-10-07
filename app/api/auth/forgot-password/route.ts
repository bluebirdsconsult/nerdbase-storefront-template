import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_AUTH_API_URL = process.env.CUSTOMER_AUTH_API_URL;
const BUSINESS_PROFILE_ID   = process.env.NEXT_PUBLIC_BUSINESS_PROFILE_ID;

export async function POST(req: NextRequest) {
  try {
    const { email, redirect_url } = await req.json();

    if (!email) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "กรุณากรอกอีเมล" },
        { status: 400 }
      );
    }

    if (!CUSTOMER_AUTH_API_URL || !BUSINESS_PROFILE_ID) {
      return NextResponse.json(
        { code: "CONFIG_ERROR", message: "ระบบยังไม่พร้อมใช้งาน" },
        { status: 503 }
      );
    }

    const res = await fetch(`${CUSTOMER_AUTH_API_URL}/customer-auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": "th" },
      body: JSON.stringify({ email, business_profile_id: BUSINESS_PROFILE_ID, redirect_url }),
    });

    const data = await res.json().catch(() => ({}));
    // Always return 200 to avoid email enumeration — mirror backend behavior
    return NextResponse.json({ status: data?.status ?? "sent" });
  } catch {
    return NextResponse.json({ status: "sent" });
  }
}
