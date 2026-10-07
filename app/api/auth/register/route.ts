import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_AUTH_API_URL = process.env.CUSTOMER_AUTH_API_URL;
const BUSINESS_PROFILE_ID = process.env.NEXT_PUBLIC_BUSINESS_PROFILE_ID;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!CUSTOMER_AUTH_API_URL || !BUSINESS_PROFILE_ID) {
      return NextResponse.json(
        { message: "ระบบยังไม่พร้อมใช้งาน" },
        { status: 503 }
      );
    }

    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;
    const redirect_url = `${origin}/api/auth/register-verify`;

    const res = await fetch(
      `${CUSTOMER_AUTH_API_URL}/customer-auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "th",
        },
        body: JSON.stringify({
          ...body,
          business_profile_id: BUSINESS_PROFILE_ID,
          redirect_url,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "สมัครสมาชิกไม่สำเร็จ" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
