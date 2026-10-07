import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("Authorization") || "";

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { code: "MISSING_TOKEN", message: "กรุณาเข้าสู่ระบบใหม่" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${process.env.CUSTOMER_AUTH_API_URL}/customer-auth/verify-login-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          "Accept-Language": "th",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { code: data.code || "OTP_FAILED", message: data.message || "รหัส OTP ไม่ถูกต้อง" },
        { status: res.status }
      );
    }

    // Backend returns tokens directly (no wrapper)
    return NextResponse.json({ success: true, data: data.data ?? data });
  } catch {
    return NextResponse.json(
      { code: "OTP_FAILED", message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
