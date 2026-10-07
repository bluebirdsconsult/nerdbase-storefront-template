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
      return NextResponse.json({ balance: null }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.CUSTOMER_CREDIT_API_URL}/wallets/balance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ balance: null });
    }

    const data = await res.json();
    const raw = data.credit ?? data.data?.balance ?? data.wallet?.balance ?? data.amount ?? null;
    const balance = raw != null ? Number(raw).toFixed(2) : null;

    return NextResponse.json({
      balance,
      currency: data.currency ?? "THB",
      kyc_verified: data.kyc_verified ?? data.data?.kyc_verified ?? null,
      kyc_credit_limit: data.kyc_credit_limit ?? data.data?.kyc_credit_limit ?? null,
      remaining_before_kyc: data.remaining_before_kyc ?? data.data?.remaining_before_kyc ?? null,
    });
  } catch {
    return NextResponse.json({ balance: null });
  }
}
