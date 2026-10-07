import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = (session.user as any).token as string | undefined;
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.CUSTOMER_AUTH_API_URL}/customer-auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to fetch profile" },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
