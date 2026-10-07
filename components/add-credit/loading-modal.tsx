import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  open: boolean;
}

export function LoadingModal({ open }: LoadingModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-background p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <h3 className="text-xl font-semibold">กำลังดำเนินการ...</h3>
          <p className="text-center text-sm text-muted-foreground">
            กรุณารอสักครู่ ระบบกำลังตรวจสอบข้อมูล
          </p>
        </div>
      </div>
    </div>
  );
}
