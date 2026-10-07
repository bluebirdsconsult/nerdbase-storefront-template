"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Loader2, RefreshCw, X } from "lucide-react";
import { useQRCode } from "next-qrcode";
import { CreditBalanceCard } from "./credit-balance-card";
import { QrStatusModal } from "./qr-status-modal";
import { useRouter } from "next/navigation";

const QR_EXPIRY_MINUTES = 20;
const POLL_INTERVAL_MS = 5000;

interface QrRequest {
  id: string;
  promptpay_payload: string;
  amount: number;
  expires_at?: string;
  transaction_no?: string;
  status?: string;
}

interface QrTransferFormProps {
  balance: number;
  userEmail: string;
  onBack: () => void;
}

export function QrTransferForm({ balance, userEmail, onBack }: QrTransferFormProps) {
  const { Canvas } = useQRCode();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrRequest, setQrRequest] = useState<QrRequest | null>(null);
  const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_MINUTES * 60);
  const [modalVariant, setModalVariant] = useState<"expired" | "matched" | "cancelled" | "cancel-confirm" | null>(null);
  const [matchedTxNo, setMatchedTxNo] = useState<string | null>(null);
  const [matchedAmount, setMatchedAmount] = useState<number | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for active QR on mount
  useEffect(() => {
    fetch("/api/topup/qr-request/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.id) startPolling(d); })
      .catch(() => {});
  }, []);

  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startPolling = useCallback((req: QrRequest) => {
    setQrRequest(req);

    // Calculate remaining time
    if (req.expires_at) {
      const remaining = Math.max(0, Math.floor((new Date(req.expires_at).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    } else {
      setTimeLeft(QR_EXPIRY_MINUTES * 60);
    }

    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimers();
          setModalVariant("expired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Status polling
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/topup/qr-request/${req.id}/status`);
        if (!res.ok) return;
        const d = await res.json();
        const status = (d.status ?? "").toUpperCase();
        if (status === "MATCHED" || status === "COMPLETED") {
          clearTimers();
          setMatchedTxNo(d.transaction_no ?? null);
          setMatchedAmount(d.amount ?? req.amount);
          setModalVariant("matched");
        } else if (status === "EXPIRED") {
          clearTimers();
          setModalVariant("expired");
        } else if (status === "CANCELLED") {
          clearTimers();
          setModalVariant("cancelled");
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL_MS);
  }, [clearTimers]);

  const handleCreate = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) { setAmountError("กรุณากรอกจำนวนเงินที่ถูกต้อง"); return; }
    setAmountError("");
    setLoading(true);
    try {
      const res = await fetch("/api/topup/qr-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: val }),
      });
      const data = await res.json();
      if (!res.ok) { setAmountError(data.error || data.message || "เกิดข้อผิดพลาด"); return; }
      const req = data.data ?? data;
      startPolling(req);
    } catch { setAmountError("เกิดข้อผิดพลาด"); }
    finally { setLoading(false); }
  };

  const handleCancelRequest = async () => {
    if (!qrRequest) return;
    setModalVariant(null);
    try {
      await fetch(`/api/topup/qr-request/${qrRequest.id}/cancel`, { method: "POST" });
    } catch { /* ignore */ }
    clearTimers();
    setQrRequest(null);
    setModalVariant("cancelled");
  };

  const handleModalClose = () => {
    if (modalVariant === "matched") {
      router.push("/profile/credits");
      return;
    }
    setModalVariant(null);
    clearTimers();
    setQrRequest(null);
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!!qrRequest}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 shrink-0 rounded-sm bg-primary" />
          <h1 className="text-base font-semibold md:text-lg">เติมเครดิตผ่าน QR PromptPay</h1>
        </div>
      </div>

      <CreditBalanceCard balance={balance} userEmail={userEmail} />

      {!qrRequest ? (
        /* Amount input */
        <div className="rounded-xl border border-border p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              จำนวนเงิน (บาท)<span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setAmountError(""); }}
              placeholder="กรอกจำนวนเงิน"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {amountError && <p className="text-xs text-destructive">{amountError}</p>}
            <p className="text-xs text-muted-foreground">อัตราแลกเปลี่ยน 1 บาท = 1 เครดิต (1:1)</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onBack} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted sm:flex-none sm:px-8">
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !amount}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "สร้าง QR Code"}
            </button>
          </div>
        </div>
      ) : (
        /* QR display */
        <div className="rounded-xl border border-border p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-2xl border-2 border-primary/30 p-3 bg-white">
              <Canvas
                text={qrRequest.promptpay_payload}
                options={{ width: 220, margin: 2 }}
              />
            </div>

            {/* Countdown */}
            <div className={`text-center ${timeLeft < 60 ? "text-destructive" : "text-muted-foreground"}`}>
              <p className="text-xs">QR หมดอายุใน</p>
              <p className="text-3xl font-bold tabular-nums">{minutes}:{seconds}</p>
            </div>

            <div className="w-full rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">จำนวนเงิน:</span>
                <span className="font-semibold text-primary">
                  {Number(qrRequest.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              สแกน QR ด้วย Mobile Banking หรือ Wallet ที่รองรับ PromptPay
            </p>

            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={() => setModalVariant("cancel-confirm")}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
                ยกเลิก QR
              </button>
              <button
                type="button"
                onClick={() => { clearTimers(); setQrRequest(null); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <RefreshCw className="h-4 w-4" />
                สร้างใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVariant && (
        <QrStatusModal
          open
          variant={modalVariant}
          txNo={matchedTxNo}
          amount={matchedAmount}
          onClose={handleModalClose}
          onConfirmCancel={handleCancelRequest}
        />
      )}
    </div>
  );
}
