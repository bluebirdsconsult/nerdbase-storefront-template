import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_AUTH_API_URL = process.env.CUSTOMER_AUTH_API_URL;
const BUSINESS_PROFILE_ID = process.env.NEXT_PUBLIC_BUSINESS_PROFILE_ID;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (!CUSTOMER_AUTH_API_URL || !BUSINESS_PROFILE_ID) {
      return NextResponse.json(
        { code: "CONFIG_ERROR", message: "ระบบยังไม่พร้อมใช้งาน" },
        { status: 503 }
      );
    }

    const res = await fetch(`${CUSTOMER_AUTH_API_URL}/customer-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": "th" },
      body: JSON.stringify({ email, password, business_profile_id: BUSINESS_PROFILE_ID }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          { code: "INVALID_CREDENTIALS", message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
          { status: 401 }
        );
      }
      if (res.status === 403) {
        return NextResponse.json(
          { code: "EMAIL_NOT_VERIFIED", message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { code: "LOGIN_FAILED", message: data.message || "เข้าสู่ระบบไม่สำเร็จ" },
        { status: res.status }
      );
    }

    // OTP step required
    if (data?.status === "otp_required") {
      return NextResponse.json({
        success: true,
        type: "otp_required",
        temp_token: data.temp_token,
        expires_in: data.expires_in,
        email: data.email,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { code: "LOGIN_FAILED", message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
