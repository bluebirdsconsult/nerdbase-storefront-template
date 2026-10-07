"use client";

import { ShieldAlert } from "lucide-react";

interface KycCreditLimitBarProps {
  kycVerified?: boolean | null;
  kycCreditLimit?: number | null;
  remainingBeforeKyc?: number | null;
}

export function KycCreditLimitBar({
  kycVerified,
  kycCreditLimit,
  remainingBeforeKyc,
}: KycCreditLimitBarProps) {
  if (kycVerified !== false || kycCreditLimit == null) return null;

  const limit = kycCreditLimit;
  const remaining = remainingBeforeKyc ?? 0;
  const totalUsed = limit - remaining;
  const pct = Math.min((totalUsed / limit) * 100, 100);

  return (
    <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between text-sm font-medium text-primary">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4" />
          <span>วงเงินเติมสะสม</span>
        </div>
        <span>
          {totalUsed.toLocaleString("en-US", { minimumFractionDigits: 2 })} /{" "}
          {limit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining > 0 ? (
        <p className="text-xs text-foreground/60">
          เติมได้อีก {remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} เครดิต
          ก่อนต้องยืนยันตัวตน
        </p>
      ) : (
        <p className="text-xs font-medium text-orange-500">
          ถึงวงเงินสูงสุดแล้ว กรุณายืนยันตัวตนเพื่อเติมเงินเพิ่ม
        </p>
      )}
      <p className="text-xs text-foreground/50">
        หากต้องการยืนยันตัวตน กดไอคอนข้อความด้านขวาล่างเพื่อติดต่อเจ้าหน้าที่
      </p>
    </div>
  );
}
