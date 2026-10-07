"use client";

import { useEffect, useState } from "react";
import { CreditCard, QrCode, Landmark, Loader2 } from "lucide-react";
import { CreditBalanceCard } from "./credit-balance-card";

interface FeatureStatus {
  slip_topup_enabled: boolean;
  qr_topup_enabled: boolean;
  qr_topup_method?: "sms_forwarder" | "inet" | null;
}

interface PaymentMethodSelectorProps {
  balance: number;
  userEmail: string;
  onSelectMethod: (method: "bank" | "qr", qrMethod?: "sms_forwarder" | "inet") => void;
}

export function PaymentMethodSelector({ balance, userEmail, onSelectMethod }: PaymentMethodSelectorProps) {
  const [features, setFeatures] = useState<FeatureStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/topup/feature-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setFeatures(d ?? { slip_topup_enabled: true, qr_topup_enabled: false }))
      .catch(() => setFeatures({ slip_topup_enabled: true, qr_topup_enabled: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1.5 shrink-0 rounded-sm bg-primary" />
        <h1 className="text-lg font-semibold md:text-xl">เติมเครดิต</h1>
      </div>

      <CreditBalanceCard balance={balance} userEmail={userEmail} />

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">เลือกวิธีชำระเงิน</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* QR Payment */}
          {features?.qr_topup_enabled && (
            <button
              type="button"
              onClick={() =>
                onSelectMethod(
                  "qr",
                  features.qr_topup_method === "inet" ? "inet" : "sms_forwarder"
                )
              }
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <QrCode className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">QR Code</p>
                <p className="text-xs text-muted-foreground">สแกน QR จ่ายทันที</p>
              </div>
            </button>
          )}

          {/* Bank Transfer */}
          {features?.slip_topup_enabled && (
            <button
              type="button"
              onClick={() => onSelectMethod("bank")}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Landmark className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">โอนผ่านธนาคาร</p>
                <p className="text-xs text-muted-foreground">โอนและแนบสลิป</p>
              </div>
            </button>
          )}

          {/* Fallback if nothing enabled */}
          {!features?.slip_topup_enabled && !features?.qr_topup_enabled && (
            <div className="col-span-full flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              <CreditCard className="h-5 w-5 shrink-0" />
              ขณะนี้ระบบยังไม่เปิดรับการเติมเครดิต กรุณาติดต่อผู้ดูแลระบบ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
