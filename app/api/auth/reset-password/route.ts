import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_AUTH_API_URL = process.env.CUSTOMER_AUTH_API_URL;

export async function POST(req: NextRequest) {
  try {
    const { token, new_password, confirm_password } = await req.json();

    if (!token || !new_password || !confirm_password) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    if (new_password !== confirm_password) {
      return NextResponse.json(
        { code: "PASSWORD_MISMATCH", message: "รหัสผ่านไม่ตรงกัน" },
        { status: 400 }
      );
    }

    if (!CUSTOMER_AUTH_API_URL) {
      return NextResponse.json(
        { code: "CONFIG_ERROR", message: "ระบบยังไม่พร้อมใช้งาน" },
        { status: 503 }
      );
    }

    const res = await fetch(`${CUSTOMER_AUTH_API_URL}/customer-auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": "th" },
      body: JSON.stringify({ token, new_password, confirm_password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const code = data?.code ?? "";
      if (
        res.status === 404 || res.status === 401 || res.status === 403 ||
        code === "ERR_PASSWORD_RESET_TOKEN_NOT_FOUND" || code === "ERR_AUTH_011"
      ) {
        return NextResponse.json(
          { code: "INVALID_TOKEN", message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { code: "RESET_FAILED", message: data?.message ?? "รีเซ็ตรหัสผ่านไม่สำเร็จ" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { code: "RESET_FAILED", message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
