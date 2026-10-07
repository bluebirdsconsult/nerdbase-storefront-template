import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = (session.user as any).token as string | undefined;
    if (!token || !process.env.CUSTOMER_CREDIT_API_URL) {
      return NextResponse.json({ error: "Missing token or API URL" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.CUSTOMER_CREDIT_API_URL}/topup/history/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Language": "th",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to fetch receipt" },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
