import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.CUSTOMER_CREDIT_API_URL) {
      return NextResponse.json([]);
    }

    const res = await fetch(`${process.env.CUSTOMER_CREDIT_API_URL}/topup/business-banks`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": "th",
      },
      cache: "no-store",
    });

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    return NextResponse.json(data.data ?? data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
