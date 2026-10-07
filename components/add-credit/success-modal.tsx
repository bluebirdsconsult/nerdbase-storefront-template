import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

export function SuccessModal({ open, onClose, data }: SuccessModalProps) {
  if (!open) return null;

  const amount = data?.amount ? Number(data.amount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : null;
  const txNo = data?.transaction_no ?? data?.topup_no ?? null;
  const newBalance = data?.balance ?? data?.new_balance ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-background p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">ทำรายการสำเร็จ!</h3>
            <p className="mt-1 text-sm text-muted-foreground">ระบบได้รับสลิปของคุณแล้ว</p>
          </div>

          {(txNo || amount || newBalance) && (
            <div className="w-full space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              {txNo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">หมายเลขรายการ:</span>
                  <span className="font-medium">{txNo}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">จำนวนเงิน:</span>
                  <span className="font-medium">{amount} บาท</span>
                </div>
              )}
              {newBalance != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เครดิตปัจจุบัน:</span>
                  <span className="font-semibold text-primary">
                    {Number(newBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })} เครดิต
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            ระบบจะเติมเครดิตให้อัตโนมัติหลังจากตรวจสอบสลิปแล้ว
          </p>

          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              เติมอีกครั้ง
            </button>
            <Link
              href="/profile/credits"
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              ดูประวัติ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
