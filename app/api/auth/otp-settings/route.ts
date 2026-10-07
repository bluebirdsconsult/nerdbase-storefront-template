import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const { enabled } = await req.json();

    const res = await fetch(`${process.env.CUSTOMER_AUTH_API_URL}/customer-auth/otp-settings`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "th",
      },
      body: JSON.stringify({ enabled }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "ไม่สามารถเปลี่ยนการตั้งค่า OTP ได้" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
