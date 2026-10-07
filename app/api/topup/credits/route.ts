import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.CUSTOMER_CREDIT_API_URL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const res = await fetch(`${process.env.CUSTOMER_CREDIT_API_URL}/topup/credits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": "th",
      },
      body: formData,
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "เกิดข้อผิดพลาดในการเติมเครดิต" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
