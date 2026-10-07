import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json([]);

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.ORDER_API_URL) return NextResponse.json([]);

    const res = await fetch(
      `${process.env.ORDER_API_URL}/customer/orders/re-orders?page=1&limit=10&distinct_package=true&include_image=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": "th",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json().catch(() => ({}));
    const items = data?.data?.items ?? data?.items ?? data?.data ?? [];
    return NextResponse.json(Array.isArray(items) ? items : []);
  } catch {
    return NextResponse.json([]);
  }
}
