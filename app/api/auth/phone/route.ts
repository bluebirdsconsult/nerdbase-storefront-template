import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "กรุณาระบุเบอร์โทรศัพท์" }, { status: 400 });

    const res = await fetch(`${process.env.CUSTOMER_AUTH_API_URL}/customer-auth/phone`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "th",
      },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "ไม่สามารถอัพเดตเบอร์โทรได้" },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
