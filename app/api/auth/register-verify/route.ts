import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_AUTH_API_URL = process.env.CUSTOMER_AUTH_API_URL;

export async function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      const url = new URL("/login", origin);
      url.searchParams.set("error", "verification_failed");
      return NextResponse.redirect(url.toString());
    }

    if (!CUSTOMER_AUTH_API_URL) {
      const url = new URL("/login", origin);
      url.searchParams.set("error", "verification_failed");
      return NextResponse.redirect(url.toString());
    }

    const res = await fetch(
      `${CUSTOMER_AUTH_API_URL}/customer-auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "th",
        },
        body: JSON.stringify({ token }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      // Token already used — email already verified
      if (
        errorData.code === "ERR_TOKEN_ALREADY_USED" ||
        res.status === 400
      ) {
        const url = new URL("/login", origin);
        url.searchParams.set("verified", "1");
        return NextResponse.redirect(url.toString());
      }

      const url = new URL("/login", origin);
      url.searchParams.set("error", "verification_failed");
      return NextResponse.redirect(url.toString());
    }

    const url = new URL("/login", origin);
    url.searchParams.set("verified", "1");
    return NextResponse.redirect(url.toString());
  } catch {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(url.toString());
  }
}
