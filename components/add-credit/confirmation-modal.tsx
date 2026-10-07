import Image from "next/image";
import { AlertCircle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  error?: string | null;
  data: {
    userEmail: string;
    fileName: string;
    filePreview?: string;
    file: File | null;
    bankId: string;
  };
  balance: number;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  error,
  data,
  balance,
}: ConfirmationModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-xl bg-background shadow-xl">
        {/* Header */}
        <div className="space-y-3 p-6 pb-4">
          <h2 className="text-center text-lg font-semibold">ยืนยันการทำรายการ</h2>
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน</span>
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-4 p-6">
          {/* Email */}
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Email:</span>
            <span>{data.userEmail}</span>
          </div>

          <div className="border-t border-border" />

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground">ช่องทางชำระเงิน :</span>
              <span className="text-right font-semibold">เติมเครดิตผ่านธนาคาร<br className="md:hidden" />(แนบสลิปการโอน)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ยอดเครดิตปัจจุบัน (เครดิต) :</span>
              <span className="font-semibold">
                {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>ค่าธรรมเนียม (บาท) :</span>
              <span className="font-semibold">0.00</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            อัตราแลกเปลี่ยนคือ 1 บาท สามารถแลกได้ 1 เครดิต (1:1)
          </p>

          <div className="border-t border-border" />

          <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>ระบบจะตรวจสอบสลิปและเติมเครดิตให้อัตโนมัติ</span>
          </div>

          {/* Slip preview */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">ไฟล์แนบ:</p>
            <div className="flex justify-center">
              {data.filePreview ? (
                <Image
                  src={data.filePreview}
                  alt="Slip preview"
                  width={0}
                  height={224}
                  style={{ width: "auto", height: "224px" }}
                  className="rounded-lg border object-contain"
                />
              ) : (
                <div className="flex h-56 w-36 items-center justify-center rounded-lg border bg-muted">
                  <p className="text-xs text-muted-foreground">{data.fileName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-6 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border border-destructive px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            ยืนยันการเติมเครดิต
          </button>
        </div>
      </div>
    </div>
  );
}
