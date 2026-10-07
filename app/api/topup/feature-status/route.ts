import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.CUSTOMER_CREDIT_API_URL) {
      return NextResponse.json({ slip_topup_enabled: true, qr_topup_enabled: false });
    }

    const res = await fetch(`${process.env.CUSTOMER_CREDIT_API_URL}/topup/feature-status`, {
      headers: { Authorization: `Bearer ${token}`, "Accept-Language": "th" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ slip_topup_enabled: true, qr_topup_enabled: false });
    }

    const json = await res.json().catch(() => null);
    return NextResponse.json(json?.data ?? json ?? { slip_topup_enabled: true, qr_topup_enabled: false });
  } catch {
    return NextResponse.json({ slip_topup_enabled: true, qr_topup_enabled: false });
  }
}
