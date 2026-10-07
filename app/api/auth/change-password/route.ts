import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const { current_password, new_password, confirm_password } = await req.json();

    if (!new_password || !confirm_password) {
      return NextResponse.json({ error: "กรุณากรอกรหัสผ่านให้ครบถ้วน" }, { status: 400 });
    }

    if (new_password !== confirm_password) {
      return NextResponse.json({ error: "รหัสผ่านใหม่ไม่ตรงกัน" }, { status: 400 });
    }

    const res = await fetch(`${process.env.CUSTOMER_AUTH_API_URL}/customer-auth/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "th",
      },
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const code = err.code ?? "";
      let message = err.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้";
      if (code === "incorrect_current_password" || code === "ERR_AUTH_033") {
        message = "รหัสผ่านปัจจุบันไม่ถูกต้อง";
      } else if (code === "ERR_AUTH_034") {
        message = "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม";
      }
      return NextResponse.json({ error: message }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
