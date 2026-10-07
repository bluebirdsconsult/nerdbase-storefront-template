import { AlertTriangle, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

type QrStatusVariant = "expired" | "matched" | "cancelled" | "cancel-confirm";

interface QrStatusModalProps {
  open: boolean;
  variant: QrStatusVariant;
  txNo?: string | null;
  amount?: number | null;
  onClose: () => void;
  onConfirmCancel?: () => void;
}

export function QrStatusModal({
  open,
  variant,
  txNo,
  amount,
  onClose,
  onConfirmCancel,
}: QrStatusModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    if (!txNo) return;
    try {
      await navigator.clipboard.writeText(txNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const configs: Record<QrStatusVariant, {
    icon: React.ReactNode;
    title: string;
    desc: string;
    iconBg: string;
  }> = {
    expired: {
      icon: <AlertTriangle className="h-10 w-10 text-orange-500" />,
      title: "QR Code หมดอายุแล้ว",
      desc: "QR Code หมดอายุ กรุณาสร้าง QR Code ใหม่เพื่อทำรายการ",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
    },
    matched: {
      icon: <CheckCircle2 className="h-10 w-10 text-green-500" />,
      title: "ชำระเงินสำเร็จ!",
      desc: "ระบบได้รับการชำระเงินของคุณแล้ว",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    cancelled: {
      icon: <XCircle className="h-10 w-10 text-red-500" />,
      title: "ยกเลิกรายการแล้ว",
      desc: "รายการถูกยกเลิกเรียบร้อยแล้ว",
      iconBg: "bg-red-100 dark:bg-red-900/30",
    },
    "cancel-confirm": {
      icon: <AlertTriangle className="h-10 w-10 text-orange-500" />,
      title: "ยืนยันการยกเลิก?",
      desc: "หากคุณได้ทำการโอนเงินไปแล้ว กรุณาอย่ายกเลิก ระบบจะดำเนินการเติมเครดิตให้อัตโนมัติ",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
    },
  };

  const config = configs[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={variant !== "cancel-confirm" ? onClose : undefined} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-background p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{config.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{config.desc}</p>
          </div>

          {variant === "matched" && txNo && (
            <div className="w-full rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">หมายเลขรายการ:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{txNo}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded border border-border px-2 py-0.5 text-xs transition-colors hover:bg-muted"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? "แล้ว" : "คัดลอก"}
                  </button>
                </div>
              </div>
              {amount != null && (
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">จำนวน:</span>
                  <span className="font-semibold text-primary">
                    {Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              )}
            </div>
          )}

          {variant === "cancel-confirm" ? (
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={onConfirmCancel}
                className="flex-1 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
              >
                ยืนยันยกเลิก
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {variant === "matched" ? "ดูประวัติ" : "ตกลง"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
