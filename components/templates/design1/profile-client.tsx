"use client";

import { useEffect, useState, useCallback, useRef, type CSSProperties } from "react";
import { Eye, EyeOff } from "lucide-react";
import { themeConfig } from "@/theme.config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  order_no: string;
  status: string;
  game_name: string;
  package_name: string;
  amount: number;
  customer_credit_before?: number;
  customer_credit_after?: number;
  quantity?: number;
  created_at: string;
  completed_at?: string;
}

interface CreditHistoryItem {
  id: string;
  transaction_no?: string;
  reference_id?: string;
  amount: number;
  fee?: number;
  payment_method?: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface CreditReceiptDetail extends CreditHistoryItem {
  slip_reference?: string;
  trans_ref?: string;
  net_credit?: number;
  sender_name?: string;
  sender_bank?: string;
  receiver_name?: string;
  receiver_bank?: string;
  receiver_account?: string;
  promptpay_name?: string;
  promptpay_number?: string;
  slip_url?: string;
  slip_image_url?: string;
  note?: string;
}

interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

interface CreditSummary {
  failed_count?: number | string;
  successful_count?: number | string;
  total_amount?: number | string;
  total_transactions?: number | string;
}

interface CreditPagedResponse extends PagedResponse<CreditHistoryItem> {
  summary?: CreditSummary;
}

interface OrderStats {
  total_orders: number;
  total_completed: number;
  total_failed: number;
  total_processing: number;
  total_pending: number;
  total_spent: number;
}

export interface ProfileSectionProps {
  user?: { email: string; name: string };
  profile?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    account_code?: string;
    discount_tier_name?: string;
    email_verified?: boolean;
    is_email_verified?: boolean;
  } | null;
  balance?: string | null;
}

interface CustomerProfile {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  phone?: string;
  email_verified?: boolean;
  is_email_verified?: boolean;
  account_code?: string;
  discount_tier_name?: string;
  has_password?: boolean;
  otp_enabled?: boolean;
  google_connected?: boolean | string;
  auth_method?: string;
}

interface ReceiptTheme {
  logo_url:         string;
  logo_width:       number;
  logo_height:      number;
  company_name:     string;
  address:          string;
  show_total_topup: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_METHOD: Record<string, string> = {
  SLIP:            "โอนผ่านสลิป",
  BANK_TRANSFER:   "โอนผ่านธนาคาร",
  QR_PROMPTPAY:    "QR พร้อมเพย์",
  PROMPTPAY:       "พร้อมเพย์",
  TRUEMONEY:       "TrueMoney",
  BUSINESS_TOPUP:  "เติมเครดิตโดยร้านค้า",
  BUSINESS_DEDUCT: "หักเครดิตโดยร้านค้า",
};

function fmtPaymentMethod(method?: string) {
  if (!method) return "—";
  return PAYMENT_METHOD[method.toUpperCase()] ?? method;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  completed:  { label: "สำเร็จ",          cls: "bg-green-100 text-green-700" },
  COMPLETED:  { label: "สำเร็จ",          cls: "bg-green-100 text-green-700" },
  failed:     { label: "ล้มเหลว",         cls: "bg-red-100 text-red-600" },
  FAILED:     { label: "ล้มเหลว",         cls: "bg-red-100 text-red-600" },
  pending:    { label: "รอดำเนินการ",     cls: "bg-yellow-100 text-yellow-700" },
  PENDING:    { label: "รอดำเนินการ",     cls: "bg-yellow-100 text-yellow-700" },
  processing: { label: "กำลังดำเนินการ", cls: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "กำลังดำเนินการ", cls: "bg-blue-100 text-blue-700" },
};

function StatusBadge({ s }: { s: string }) {
  const m = STATUS[s] ?? { label: s, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtBaht(n?: number | null) {
  if (n == null) return "—";
  return `฿\u00A0${Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

interface StatItem { label: string; value: string; sub: string; valueColor?: string }

function StatCards({ items }: { items: StatItem[] }) {
  return (
    <div className={`grid gap-3 ${items.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className={`mt-1 text-xl font-bold tabular-nums leading-tight ${s.valueColor ?? "text-foreground"}`}>{s.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

function Th({ cols }: { cols: string[] }) {
  return (
    <tr className="border-b border-border text-left text-xs text-muted-foreground">
      {cols.map((c) => (
        <th key={c} className="px-4 py-3 font-medium whitespace-nowrap">{c}</th>
      ))}
    </tr>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center text-sm text-foreground">{children}</div>
    </div>
  );
}

function ProfileCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">{children}</div>
    </div>
  );
}

function Pagination({
  page, totalPages, total, limit, hasNext, hasPrev, onPage, onLimit,
}: {
  page: number; totalPages: number; total: number; limit: number;
  hasNext: boolean; hasPrev: boolean;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
}) {
  if (total === 0) return null;

  const delta = 2;
  const start = Math.max(1, page - delta);
  const end = Math.min(totalPages, page + delta);
  const pageNums: number[] = [];
  for (let i = start; i <= end; i++) pageNums.push(i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-sm">
      <span className="text-xs text-muted-foreground">
        จำนวนข้อมูลทั้งหมด <span className="font-medium text-foreground">{total}</span> รายการ
      </span>
      <div className="flex items-center gap-1.5">
        <select
          value={limit}
          onChange={(e) => { onLimit(Number(e.target.value)); onPage(1); }}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / หน้า</option>)}
        </select>
        <button onClick={() => onPage(page - 1)} disabled={!hasPrev}
          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹</button>
        {start > 1 && <>
          <button onClick={() => onPage(1)} className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted transition-colors">1</button>
          {start > 2 && <span className="text-xs text-muted-foreground px-0.5">…</span>}
        </>}
        {pageNums.map((n) => (
          <button key={n} onClick={() => onPage(n)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              n === page ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            }`}>{n}</button>
        ))}
        {end < totalPages && <>
          {end < totalPages - 1 && <span className="text-xs text-muted-foreground px-0.5">…</span>}
          <button onClick={() => onPage(totalPages)} className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted transition-colors">{totalPages}</button>
        </>}
        <button onClick={() => onPage(page + 1)} disabled={!hasNext}
          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">›</button>
      </div>
    </div>
  );
}

/** Wrap a CDN image URL through the server-side proxy so crossOrigin="anonymous" works. */
function proxiedImg(url: string): string {
  try {
    return `/api/image-proxy?url_b64=${encodeURIComponent(btoa(unescape(encodeURIComponent(url))))}`;
  } catch {
    return url;
  }
}

// ─── ReceiptModal ─────────────────────────────────────────────────────────────

const RECEIPT_LIGHT_TOKENS: CSSProperties = {
  "--foreground": "oklch(0.21 0.032 264.7)",
  "--muted-foreground": "oklch(0.45 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--border": "oklch(0.922 0 0)",
  "--card": "oklch(1 0 0)",
} as CSSProperties;

const RECEIPT_STATUS_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  completed:  { label: "สำเร็จ",          color: "text-[#4CAF50]", bg: "bg-[#E8F5E9]" },
  success:    { label: "สำเร็จ",          color: "text-[#4CAF50]", bg: "bg-[#E8F5E9]" },
  failed:     { label: "ไม่สำเร็จ",       color: "text-[#F44336]", bg: "bg-[#FFEBEE]" },
  pending:    { label: "กำลังดำเนินการ",  color: "text-[#FF9800]", bg: "bg-[#FFF3E0]" },
  processing: { label: "กำลังดำเนินการ",  color: "text-[#2196F3]", bg: "bg-[#E3F2FD]" },
};

function formatReceiptDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
}

function ReceiptDetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 py-2 text-[11px] md:py-3 md:text-xs">
      <span className="text-[#616161] shrink-0">{label}</span>
      <span className="text-[#212121] max-w-[58%]">{children}</span>
    </div>
  );
}

function ReceiptModal({
  receipt,
  onClose,
  userEmail,
  userAccountCode,
  theme,
}: {
  receipt: CreditReceiptDetail;
  onClose: () => void;
  userEmail?: string;
  userAccountCode?: string;
  theme?: ReceiptTheme | null;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [slipImageDataUrl, setSlipImageDataUrl] = useState<string | null>(null);
  const slipUrl = receipt.slip_image_url || receipt.slip_url;

  // Pre-fetch slip image as data URL to avoid CORS issues during download
  useEffect(() => {
    if (!slipUrl) { setSlipImageDataUrl(null); return; }
    let active = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(slipUrl, { cache: "no-store", signal: controller.signal });
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (active) setSlipImageDataUrl(dataUrl);
      } catch { if (active) setSlipImageDataUrl(null); }
    })();
    return () => { active = false; controller.abort(); };
  }, [slipUrl]);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      const { toJpeg } = await import("html-to-image");
      const imgs = Array.from(receiptRef.current.querySelectorAll("img"));
      await Promise.all(imgs.map(async (img) => {
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
        }
        try { if (typeof img.decode === "function") await img.decode(); } catch {}
      }));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const dataUrl = await toJpeg(receiptRef.current, {
        quality: 0.95,
        cacheBust: true,
        backgroundColor: "#ffffff",
        filter: (node) => !(node instanceof HTMLElement && node.dataset.receiptExclude === "true"),
      });
      const ref = encodeURIComponent(String(receipt.transaction_no || receipt.reference_id || "receipt"));
      const a = document.createElement("a");
      a.href = dataUrl; a.download = `receipt-${ref}.jpeg`; a.style.display = "none";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { console.error("Failed to download receipt", e); }
  };

  const netCredit = receipt.net_credit ?? (receipt.amount - (receipt.fee ?? 0));
  const statusKey = (receipt.status ?? "").toLowerCase();
  const statusStyle = RECEIPT_STATUS_COLORS[statusKey] ?? { label: receipt.status, color: "text-[#9E9E9E]", bg: "bg-[#F5F5F5]" };
  const logo = {
    url:    theme?.logo_url    ?? themeConfig.logo.url,
    width:  theme?.logo_width  ?? themeConfig.logo.width,
    height: theme?.logo_height ?? themeConfig.logo.height,
  };
  const footer = {
    company_name: theme?.company_name ?? themeConfig.footer.company_name,
    address:      theme?.address      ?? themeConfig.footer.address,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[min(695px,calc(100vw-1rem))] max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl">
        {/* Close button (excluded from JPEG download) */}
        <button
          data-receipt-exclude="true"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground text-sm"
          aria-label="ปิด"
        >
          ✕
        </button>

        <div className="flex flex-col items-center px-3 py-4 md:px-6 md:py-6">
          {/* Receipt "paper" — always white background for download */}
          <div
            ref={receiptRef}
            style={RECEIPT_LIGHT_TOKENS}
            className="w-full rounded-xl bg-white pb-4 text-[11px] leading-snug md:rounded-2xl md:pb-6 md:text-sm md:leading-normal"
          >
            {/* Header: logo + title + status + business info */}
            <div className="flex flex-col items-center gap-1 pt-4 px-4 text-center md:gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxiedImg(logo.url)}
                alt={footer.company_name}
                width={logo.width}
                height={logo.height}
                className="object-contain"
                style={{ maxWidth: logo.width, maxHeight: 52 }}
                crossOrigin="anonymous"
              />
              <p className="text-primary mt-1 text-xs font-semibold md:text-base">
                ใบเสร็จรับเงิน / Receipt
              </p>
              <span className={`${statusStyle.bg} ${statusStyle.color} inline-block rounded-full px-3 py-0.5 text-[10px] font-semibold md:text-xs`}>
                {statusStyle.label}
              </span>
              <p className="text-[#212121] text-xs font-semibold md:text-sm">{footer.company_name}</p>
              <p className="text-[#616161] text-[10px] md:text-xs">{footer.address}</p>
            </div>

            {/* 2-col metadata grid */}
            <div className="mt-3 grid gap-2 px-3 pt-3 text-[11px] sm:grid-cols-2 md:mt-4 md:gap-3 md:px-16 md:pt-4 md:text-xs">
              {([
                ["วันที่ทำรายการ :", formatReceiptDate(receipt.created_at)],
                ["วันที่สำเร็จ :",   formatReceiptDate(receipt.completed_at)],
                ["Email :",           userEmail ?? "-"],
                ["รหัสบัญชี :",      userAccountCode ?? "-"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                  <span className="text-[#616161] shrink-0">{label}</span>
                  <span className="text-[#212121] font-semibold break-all">{value}</span>
                </div>
              ))}
            </div>

            {/* Details box */}
            <div className="mx-2 mt-3 rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] md:mx-16 md:mt-4 md:rounded-xl">
              <div className="divide-y divide-[#E0E0E0] px-2 md:px-4">
                <ReceiptDetailRow label="หมายเลขอ้างอิง :">
                  <span className="font-mono text-right font-semibold break-all">
                    {receipt.transaction_no || receipt.reference_id || "-"}
                  </span>
                </ReceiptDetailRow>

                {(receipt.slip_reference || receipt.trans_ref) && (
                  <ReceiptDetailRow label="เลขอ้างอิงสลิป :">
                    <span className="font-mono text-right font-semibold break-all">
                      {receipt.slip_reference || receipt.trans_ref}
                    </span>
                  </ReceiptDetailRow>
                )}

                {receipt.sender_name?.trim() && (
                  <ReceiptDetailRow label="ผู้โอน :">
                    <span className="text-right font-semibold break-words">{receipt.sender_name.trim()}</span>
                  </ReceiptDetailRow>
                )}
                {receipt.sender_bank?.trim() && (
                  <ReceiptDetailRow label="ธนาคารผู้โอน :">
                    <span className="text-[#1565C0] text-right font-semibold break-words">{receipt.sender_bank.trim()}</span>
                  </ReceiptDetailRow>
                )}

                {receipt.promptpay_number ? (
                  <>
                    {receipt.promptpay_name && (
                      <ReceiptDetailRow label="ผู้รับปลายทาง :">
                        <span className="text-right font-semibold break-words">{receipt.promptpay_name}</span>
                      </ReceiptDetailRow>
                    )}
                    <ReceiptDetailRow label="ธนาคารปลายทาง :">
                      <span className="text-[#1565C0] text-right font-semibold break-words">{receipt.promptpay_number}</span>
                    </ReceiptDetailRow>
                  </>
                ) : (receipt.receiver_name || receipt.receiver_bank || receipt.receiver_account) ? (
                  <>
                    {receipt.receiver_name && (
                      <ReceiptDetailRow label="ผู้รับปลายทาง :">
                        <span className="text-right font-semibold break-words">{receipt.receiver_name}</span>
                      </ReceiptDetailRow>
                    )}
                    {(receipt.receiver_bank || receipt.receiver_account) && (
                      <ReceiptDetailRow label="ธนาคารปลายทาง :">
                        <span className="text-[#1565C0] text-right font-semibold break-words">
                          {receipt.receiver_bank}
                          {receipt.receiver_account && <span className="text-[#212121] ml-1">({receipt.receiver_account})</span>}
                        </span>
                      </ReceiptDetailRow>
                    )}
                  </>
                ) : null}

                {receipt.payment_method && (
                  <ReceiptDetailRow label="ช่องทาง :">
                    <span className="text-right font-semibold">{fmtPaymentMethod(receipt.payment_method)}</span>
                  </ReceiptDetailRow>
                )}

                <ReceiptDetailRow label="จำนวนเงินที่เติม (บาท) :">
                  <span className="shrink-0 font-semibold">{Number(receipt.amount).toFixed(2)}</span>
                </ReceiptDetailRow>
                <ReceiptDetailRow label="ค่าธรรมเนียม (บาท) :">
                  <span className="shrink-0 font-semibold">{Number(receipt.fee ?? 0).toFixed(2)}</span>
                </ReceiptDetailRow>
                <ReceiptDetailRow label="เครดิตที่ได้รับ (เครดิต) :">
                  <span className="shrink-0 font-semibold text-emerald-600">{Number(netCredit).toFixed(2)}</span>
                </ReceiptDetailRow>

                {receipt.note?.trim() && (
                  <ReceiptDetailRow label="หมายเหตุ :">
                    <span className="text-right font-semibold break-words">{receipt.note.trim()}</span>
                  </ReceiptDetailRow>
                )}

                {slipUrl && (
                  <div className="flex flex-col items-center gap-2 py-3 md:py-4">
                    <span className="text-[#616161] text-[11px] md:text-xs">หลักฐานการโอน</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slipImageDataUrl ?? slipUrl}
                      alt="สลิปการโอนเงิน"
                      className="max-h-[300px] w-auto rounded-lg border border-[#E0E0E0] object-contain md:max-h-[400px]"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Download button (excluded from JPEG) */}
          <div className="mt-2 flex w-full justify-center" data-receipt-exclude="true">
            <button
              onClick={handleDownload}
              className="min-w-[7.5rem] rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity md:min-w-[160px] md:text-sm"
            >
              ดาวน์โหลด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OrderReceiptModal ────────────────────────────────────────────────────────

function OrderReceiptModal({
  order,
  onClose,
  userEmail,
  userAccountCode,
  theme,
}: {
  order: OrderItem;
  onClose: () => void;
  userEmail?: string;
  userAccountCode?: string;
  theme?: ReceiptTheme | null;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      const { toJpeg } = await import("html-to-image");
      const imgs = Array.from(receiptRef.current.querySelectorAll("img"));
      await Promise.all(imgs.map(async (img) => {
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
        }
        try { if (typeof img.decode === "function") await img.decode(); } catch {}
      }));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const dataUrl = await toJpeg(receiptRef.current, {
        quality: 0.95,
        cacheBust: true,
        backgroundColor: "#ffffff",
        filter: (node) => !(node instanceof HTMLElement && node.dataset.receiptExclude === "true"),
      });
      const ref = encodeURIComponent(String(order.order_no || "receipt"));
      const a = document.createElement("a");
      a.href = dataUrl; a.download = `receipt-${ref}.jpeg`; a.style.display = "none";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { console.error("Failed to download receipt", e); }
  };

  const statusKey = (order.status ?? "").toLowerCase();
  const statusStyle = RECEIPT_STATUS_COLORS[statusKey] ?? { label: order.status, color: "text-[#9E9E9E]", bg: "bg-[#F5F5F5]" };
  const logo = {
    url:    theme?.logo_url    ?? themeConfig.logo.url,
    width:  theme?.logo_width  ?? themeConfig.logo.width,
    height: theme?.logo_height ?? themeConfig.logo.height,
  };
  const footer = {
    company_name: theme?.company_name ?? themeConfig.footer.company_name,
    address:      theme?.address      ?? themeConfig.footer.address,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[min(695px,calc(100vw-1rem))] max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl">
        <button
          data-receipt-exclude="true"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground text-sm"
          aria-label="ปิด"
        >✕</button>

        <div className="flex flex-col items-center px-3 py-4 md:px-6 md:py-6">
          <div
            ref={receiptRef}
            style={RECEIPT_LIGHT_TOKENS}
            className="w-full rounded-xl bg-white pb-4 text-[11px] leading-snug md:rounded-2xl md:pb-6 md:text-sm md:leading-normal"
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-1 pt-4 px-4 text-center md:gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxiedImg(logo.url)}
                alt={footer.company_name}
                width={logo.width}
                height={logo.height}
                className="object-contain"
                style={{ maxWidth: logo.width, maxHeight: 52 }}
                crossOrigin="anonymous"
              />
              <p className="text-primary mt-1 text-xs font-semibold md:text-base">
                ใบเสร็จรับเงิน / Receipt
              </p>
              <span className={`${statusStyle.bg} ${statusStyle.color} inline-block rounded-full px-3 py-0.5 text-[10px] font-semibold md:text-xs`}>
                {statusStyle.label}
              </span>
              <p className="text-[#212121] text-xs font-semibold md:text-sm">{footer.company_name}</p>
              <p className="text-[#616161] text-[10px] md:text-xs">{footer.address}</p>
            </div>

            {/* 2-col metadata grid */}
            <div className="mt-3 grid gap-2 px-3 pt-3 text-[11px] sm:grid-cols-2 md:mt-4 md:gap-3 md:px-16 md:pt-4 md:text-xs">
              {([
                ["วันที่ทำรายการ :", formatReceiptDate(order.created_at)],
                ["วันที่สำเร็จ :",   formatReceiptDate(order.completed_at)],
                ["Email :",           userEmail ?? "-"],
                ["รหัสบัญชี :",      userAccountCode ?? "-"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                  <span className="text-[#616161] shrink-0">{label}</span>
                  <span className="text-[#212121] font-semibold break-all">{value}</span>
                </div>
              ))}
            </div>

            {/* Details box */}
            <div className="mx-2 mt-3 rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] md:mx-16 md:mt-4 md:rounded-xl">
              <div className="divide-y divide-[#E0E0E0] px-2 md:px-4">
                <ReceiptDetailRow label="หมายเลขอ้างอิง :">
                  <span className="font-mono text-right font-semibold break-all">{order.order_no}</span>
                </ReceiptDetailRow>
                <ReceiptDetailRow label="รายการ :">
                  <span className="text-right font-semibold break-words">{order.game_name}</span>
                </ReceiptDetailRow>
                <ReceiptDetailRow label="ชื่อแพ็กเกจ :">
                  <span className="text-right font-semibold break-words">{order.package_name}</span>
                </ReceiptDetailRow>
                {order.customer_credit_before != null && (
                  <ReceiptDetailRow label="เครดิตก่อนทำรายการ (เครดิต) :">
                    <span className="shrink-0 font-semibold">{Number(order.customer_credit_before).toFixed(2)}</span>
                  </ReceiptDetailRow>
                )}
                <ReceiptDetailRow label="ราคาแพ็กเกจ (เครดิต) :">
                  <span className="shrink-0 font-semibold">{Number(order.amount).toFixed(2)}</span>
                </ReceiptDetailRow>
                {order.customer_credit_after != null && (
                  <ReceiptDetailRow label="เครดิตคงเหลือ (เครดิต) :">
                    <span className="shrink-0 font-semibold">{Number(order.customer_credit_after).toFixed(2)}</span>
                  </ReceiptDetailRow>
                )}
                {order.quantity != null && (
                  <ReceiptDetailRow label="จำนวนแพ็กเกจ :">
                    <span className="shrink-0 font-semibold">{order.quantity}</span>
                  </ReceiptDetailRow>
                )}
                <ReceiptDetailRow label="ราคารวม (บาท) :">
                  <span className="shrink-0 font-semibold">{Number(order.amount).toFixed(2)}</span>
                </ReceiptDetailRow>
              </div>
            </div>
          </div>

          {/* Download button */}
          <div className="mt-2 flex w-full justify-center" data-receipt-exclude="true">
            <button
              onClick={handleDownload}
              className="min-w-[7.5rem] rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity md:min-w-[160px] md:text-sm"
            >
              ดาวน์โหลด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ProfileSection ───────────────────────────────────────────────────────────

const EMPTY_PW = { current_password: "", new_password: "", confirm_password: "" };

export function ProfileSection(_props?: ProfileSectionProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // phone
  const [phoneEdit, setPhoneEdit]     = useState(false);
  const [phoneDraft, setPhoneDraft]   = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneErr, setPhoneErr]       = useState("");

  // password
  const [pwOpen, setPwOpen]       = useState(false);
  const [pwForm, setPwForm]       = useState(EMPTY_PW);
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwErr, setPwErr]         = useState("");
  const [pwOk, setPwOk]           = useState(false);
  const [showCurPw, setShowCurPw]         = useState(false);
  const [showNewPw, setShowNewPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // OTP
  const [otpSaving, setOtpSaving]   = useState(false);
  const [otpErr, setOtpErr]         = useState("");
  const [otpConfirm, setOtpConfirm] = useState(false);

  async function reload() {
    const [p, b] = await Promise.all([
      fetch("/api/user/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/user/credit-balance").then((r) => (r.ok ? r.json() : null)),
    ]);
    setProfile(p);
    setBalance(b?.balance ?? null);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function savePhone() {
    if (!phoneDraft) { setPhoneErr("กรุณาระบุเบอร์โทรศัพท์"); return; }
    if (!/^0\d{9}$/.test(phoneDraft)) { setPhoneErr("ต้องขึ้นต้นด้วย 0 และมี 10 หลัก"); return; }
    setPhoneSaving(true);
    try {
      const res = await fetch("/api/auth/phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneDraft }),
      });
      const data = await res.json();
      if (!res.ok) { setPhoneErr(data.error || "บันทึกไม่สำเร็จ"); return; }
      await reload();
      setPhoneEdit(false);
      setPhoneErr("");
    } finally { setPhoneSaving(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) { setPwErr("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    setPwSaving(true); setPwErr(""); setPwOk(false);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) { setPwErr(data.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ"); return; }
      setPwOk(true);
      setPwForm(EMPTY_PW);
      setTimeout(() => { setPwOpen(false); setPwOk(false); }, 1500);
    } finally { setPwSaving(false); }
  }

  async function toggleOTP(enabled: boolean) {
    if (!enabled && !otpConfirm) { setOtpConfirm(true); return; }
    setOtpConfirm(false);
    setOtpSaving(true); setOtpErr("");
    try {
      const res = await fetch("/api/auth/otp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpErr(data.error || "เปลี่ยนการตั้งค่าไม่สำเร็จ"); return; }
      setProfile((prev) => (prev ? { ...prev, otp_enabled: enabled } : prev));
    } finally { setOtpSaving(false); }
  }

  if (loading) return <Empty>กำลังโหลด...</Empty>;

  const emailVerified = profile?.email_verified ?? profile?.is_email_verified ?? false;
  const phone = profile?.phone_number ?? profile?.phone ?? "";
  const isGoogleOnly = profile?.auth_method === "google" && !profile?.has_password;
  const googleConnected =
    profile?.google_connected === true ||
    profile?.google_connected === "true" ||
    profile?.google_connected === "1";

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-foreground">ข้อมูลบัญชี</h2>

      {/* ── ข้อมูลทั่วไป ─────────────────────────────────────── */}
      <ProfileCard title="ข้อมูลทั่วไป">
        <InfoRow label="อีเมล">
          <span>{profile?.email ?? "—"}</span>
          <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {emailVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
          </span>
        </InfoRow>
        <InfoRow label="เครดิตคงเหลือ">
          <span className="text-lg font-bold text-foreground">
            {balance != null
              ? `฿ ${Number(balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
              : "—"}
          </span>
        </InfoRow>
        {profile?.account_code && (
          <InfoRow label="รหัสบัญชี">
            <span className="font-mono text-sm">{profile.account_code}</span>
          </InfoRow>
        )}
        {profile?.discount_tier_name && (
          <InfoRow label="ระดับสมาชิก">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {profile.discount_tier_name}
            </span>
          </InfoRow>
        )}
      </ProfileCard>

      {/* ── ข้อมูลติดต่อ ─────────────────────────────────────── */}
      <ProfileCard title="ข้อมูลติดต่อ">
        <div className="flex items-start justify-between gap-4 px-4 py-3">
          <span className="shrink-0 pt-0.5 text-sm text-muted-foreground">เบอร์โทรศัพท์</span>
          {phoneEdit ? (
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="tel" maxLength={10} value={phoneDraft} placeholder="0XXXXXXXXX"
                  onChange={(e) => { setPhoneDraft(e.target.value); setPhoneErr(""); }}
                  className={`${inputCls} w-36`}
                />
                <button onClick={savePhone} disabled={phoneSaving}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  {phoneSaving ? "..." : "บันทึก"}
                </button>
                <button onClick={() => { setPhoneEdit(false); setPhoneErr(""); }}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
                  ยกเลิก
                </button>
              </div>
              {phoneErr && <p className="text-xs text-red-500">{phoneErr}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">{phone || "—"}</span>
              <button onClick={() => { setPhoneDraft(phone); setPhoneEdit(true); }}
                className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">
                แก้ไข
              </button>
            </div>
          )}
        </div>
      </ProfileCard>

      {/* ── วิธีเข้าสู่ระบบ ──────────────────────────────────── */}
      <ProfileCard title="วิธีเข้าสู่ระบบ">
        <InfoRow label="อีเมล">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {emailVerified ? "เชื่อมแล้ว" : "ยังไม่ยืนยัน"}
          </span>
        </InfoRow>
        <InfoRow label="Google">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${googleConnected ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
            {googleConnected ? "เชื่อมแล้ว" : "ยังไม่ได้เชื่อมต่อ"}
          </span>
        </InfoRow>
      </ProfileCard>

      {/* ── ความปลอดภัย ──────────────────────────────────────── */}
      <ProfileCard title="ความปลอดภัย">
        {/* Password */}
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">รหัสผ่าน</span>
            <button
              onClick={() => { setPwOpen(!pwOpen); setPwErr(""); setPwOk(false); }}
              className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              {profile?.has_password ? "เปลี่ยนรหัสผ่าน" : "ตั้งรหัสผ่าน"}
            </button>
          </div>
          {pwOpen && (
            <form onSubmit={savePassword} className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              {profile?.has_password && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">รหัสผ่านปัจจุบัน</label>
                  <div className="relative">
                    <input type={showCurPw ? "text" : "password"} value={pwForm.current_password} className={`${inputCls} pr-9`}
                      onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
                    <button type="button" onClick={() => setShowCurPw(!showCurPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showCurPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                      {showCurPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">รหัสผ่านใหม่</label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} value={pwForm.new_password} className={`${inputCls} pr-9`}
                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showNewPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwForm.new_password.length > 0 && (() => {
                  const pw = pwForm.new_password;
                  const rules = [
                    { ok: pw.length >= 8,                              label: "ความยาวอย่างน้อย 8 ตัวอักษร" },
                    { ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw),       label: "ตัวอักษรพิมพ์เล็กและพิมพ์ใหญ่ (a-z, A-Z)" },
                    { ok: /[0-9]/.test(pw),                            label: "ตัวเลขอย่างน้อย 1 ตัว (0-9)" },
                    { ok: /[!@#$%^&*()\-_+[\]{},.:;/?`~]/.test(pw),   label: "อักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*)" },
                  ];
                  return (
                    <ul className="mt-2 space-y-1">
                      {rules.map((r) => (
                        <li key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? "text-green-600" : "text-muted-foreground"}`}>
                          {r.ok
                            ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
                          }
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">ยืนยันรหัสผ่านใหม่</label>
                <div className="relative">
                  <input type={showConfirmPw ? "text" : "password"} value={pwForm.confirm_password} className={`${inputCls} pr-9`}
                    onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })} />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {pwErr && <p className="text-xs text-red-500">{pwErr}</p>}
              {pwOk && <p className="text-xs text-green-600">เปลี่ยนรหัสผ่านสำเร็จ</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => { setPwOpen(false); setPwErr(""); }}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={pwSaving}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  {pwSaving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* OTP */}
        {!isGoogleOnly && (
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">ยืนยัน OTP ทาง Email</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {profile?.otp_enabled ? "เปิดใช้งานอยู่" : "ปิดใช้งาน"}
                </p>
              </div>
              {otpConfirm ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">ยืนยันปิด OTP?</span>
                  <button onClick={() => toggleOTP(false)}
                    className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600">
                    ยืนยัน
                  </button>
                  <button onClick={() => setOtpConfirm(false)}
                    className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted transition-colors">
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleOTP(!profile?.otp_enabled)}
                  disabled={otpSaving}
                  className={`shrink-0 cursor-pointer rounded-full px-4 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    profile?.otp_enabled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-muted text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {otpSaving ? "..." : profile?.otp_enabled ? "เปิดอยู่" : "ปิดอยู่"}
                </button>
              )}
            </div>
            {otpErr && <p className="mt-1.5 text-xs text-red-500">{otpErr}</p>}
          </div>
        )}
      </ProfileCard>
    </div>
  );
}

// ─── FilterBar shared component ───────────────────────────────────────────────

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const selectCls = `${inputCls} cursor-pointer`;

// ─── OrdersSection ────────────────────────────────────────────────────────────

interface OrderFilters {
  game_name: string;
  status: string;
  created_at_from: string;
  created_at_to: string;
}
const EMPTY_ORDER_FILTERS: OrderFilters = { game_name: "", status: "", created_at_from: "", created_at_to: "" };

export function OrdersSection() {
  const [data, setData]         = useState<PagedResponse<OrderItem> | null>(null);
  const [stats, setStats]       = useState<OrderStats | null>(null);
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(10);
  const [loading, setLoading]   = useState(false);
  const [draft, setDraft]       = useState<OrderFilters>(EMPTY_ORDER_FILTERS);
  const [filters, setFilters]   = useState<OrderFilters>(EMPTY_ORDER_FILTERS);
  const [detailOrder, setDetailOrder]   = useState<OrderItem | null>(null);
  const [orderUserInfo, setOrderUserInfo]   = useState<{ email?: string; account_code?: string } | null>(null);
  const [orderTheme, setOrderTheme] = useState<ReceiptTheme | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/theme").then((r)    => (r.ok ? r.json() : null)),
    ]).then(([p, t]) => {
      if (p) setOrderUserInfo({ email: p.email, account_code: p.account_code });
      if (t && !t.error) setOrderTheme(t);
    });
  }, []);

  const buildFilterQS = useCallback((f: OrderFilters) => {
    const q = new URLSearchParams();
    if (f.game_name)       q.set("game_name", f.game_name);
    if (f.status)          q.set("status", f.status);
    if (f.created_at_from) q.set("created_at_from", f.created_at_from);
    if (f.created_at_to)   q.set("created_at_to", f.created_at_to);
    return q.toString();
  }, []);

  const buildQS = useCallback((f: OrderFilters, p: number, l: number) => {
    const q = new URLSearchParams({ page: String(p), limit: String(l) });
    if (f.game_name)       q.set("game_name", f.game_name);
    if (f.status)          q.set("status", f.status);
    if (f.created_at_from) q.set("created_at_from", f.created_at_from);
    if (f.created_at_to)   q.set("created_at_to", f.created_at_to);
    return q.toString();
  }, []);

  const load = useCallback(async (f: OrderFilters, p: number, l: number) => {
    setLoading(true);
    try {
      const filterQS = buildFilterQS(f);
      const [dataRes, statsRes] = await Promise.all([
        fetch(`/api/user/orders?${buildQS(f, p, l)}`),
        fetch(`/api/user/orders/stats${filterQS ? `?${filterQS}` : ""}`),
      ]);
      if (dataRes.ok) setData(await dataRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } finally { setLoading(false); }
  }, [buildQS, buildFilterQS]);

  useEffect(() => { load(filters, page, limit); }, [filters, page, limit, load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setFilters({ ...draft });
  }

  function handleClear() {
    setDraft(EMPTY_ORDER_FILTERS);
    setFilters(EMPTY_ORDER_FILTERS);
    setPage(1);
  }

  const hasFilter = Object.values(filters).some(Boolean);

  const orderStatCards: StatItem[] = stats ? [
    { label: "ยอดรวม",          value: fmtBaht(stats.total_spent),    sub: "บาท",    valueColor: "text-primary" },
    { label: "สำเร็จ",          value: String(stats.total_completed), sub: "รายการ", valueColor: "text-green-600" },
    { label: "ล้มเหลว",        value: String(stats.total_failed),    sub: "รายการ", valueColor: stats.total_failed > 0 ? "text-red-500" : undefined },
    { label: "รายการทั้งหมด",  value: String(stats.total_orders),    sub: "รายการ" },
  ] : [];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">ประวัติ Order เติมเกม</h2>

      {orderStatCards.length > 0 && <StatCards items={orderStatCards} />}

      {/* Filter panel */}
      <form onSubmit={handleSearch} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ชื่อเกม</label>
            <input className={inputCls} placeholder="ค้นหาชื่อเกม" value={draft.game_name}
              onChange={(e) => setDraft({ ...draft, game_name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">สถานะ</label>
            <select className={selectCls} value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option value="">ทั้งหมด</option>
              <option value="completed">สำเร็จ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="processing">กำลังดำเนินการ</option>
              <option value="failed">ล้มเหลว</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">วันที่เริ่มต้น</label>
            <input type="date" className={inputCls} value={draft.created_at_from}
              onChange={(e) => setDraft({ ...draft, created_at_from: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">วันที่สิ้นสุด</label>
            <input type="date" className={inputCls} value={draft.created_at_to}
              onChange={(e) => setDraft({ ...draft, created_at_to: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          {hasFilter && (
            <button type="button" onClick={handleClear}
              className="rounded-md border border-border px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
              ล้าง
            </button>
          )}
          <button type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            ค้นหา
          </button>
        </div>
      </form>

      {loading && <Empty>กำลังโหลด...</Empty>}
      {!loading && data?.data.length === 0 && <Empty>ไม่พบประวัติ Order</Empty>}
      {!loading && data && data.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><Th cols={["หมายเลข Order", "เกม", "แพ็กเกจ", "เครดิต", "สถานะ", "วันที่", ""]} /></thead>
              <tbody className="divide-y divide-border">
                {data.data.map((o) => {
                  const isDone = o.status?.toLowerCase() === "completed";
                  return (
                    <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{o.order_no}</td>
                      <td className="px-4 py-3">{o.game_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.package_name}</td>
                      <td className="px-4 py-3 tabular-nums">{fmtBaht(o.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge s={o.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {fmtDate(o.completed_at || o.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {isDone && (
                          <button
                            onClick={() => setDetailOrder(o)}
                            className="whitespace-nowrap rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                          >
                            ใบเสร็จ
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.total_pages} total={data.total} limit={limit}
            hasNext={data.has_next} hasPrev={data.has_previous} onPage={setPage}
            onLimit={(l) => { setLimit(l); setPage(1); }} />
        </>
      )}

      {detailOrder && (
        <OrderReceiptModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          userEmail={orderUserInfo?.email}
          userAccountCode={orderUserInfo?.account_code}
          theme={orderTheme}
        />
      )}
    </div>
  );
}

// ─── CreditHistorySection ─────────────────────────────────────────────────────

interface CreditFilters {
  transaction_no: string;
  payment_method: string;
  status: string;
  created_at_from: string;
  created_at_to: string;
}
const EMPTY_CREDIT_FILTERS: CreditFilters = { transaction_no: "", payment_method: "", status: "", created_at_from: "", created_at_to: "" };

export function CreditHistorySection() {
  const [data, setData]           = useState<CreditPagedResponse | null>(null);
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);
  const [loading, setLoading]     = useState(false);
  const [draft, setDraft]         = useState<CreditFilters>(EMPTY_CREDIT_FILTERS);
  const [receipt, setReceipt]     = useState<CreditReceiptDetail | null>(null);
  const [receiptLoading, setReceiptLoading] = useState<string | null>(null); // id being loaded
  const [filters, setFilters] = useState<CreditFilters>(EMPTY_CREDIT_FILTERS);
  const [userInfo, setUserInfo]       = useState<{ email?: string; account_code?: string } | null>(null);
  const [receiptTheme, setReceiptTheme] = useState<ReceiptTheme | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/theme").then((r)    => (r.ok ? r.json() : null)),
    ]).then(([p, t]) => {
      if (p) setUserInfo({ email: p.email, account_code: p.account_code });
      if (t && !t.error) setReceiptTheme(t);
    });
  }, []);

  const buildQS = useCallback((f: CreditFilters, p: number, l: number) => {
    const q = new URLSearchParams({ page: String(p), limit: String(l) });
    if (f.transaction_no)  q.set("transaction_no", f.transaction_no);
    if (f.payment_method)  q.set("payment_method", f.payment_method);
    if (f.status)          q.set("status", f.status);
    if (f.created_at_from) q.set("created_at_from", f.created_at_from);
    if (f.created_at_to)   q.set("created_at_to", f.created_at_to);
    return q.toString();
  }, []);

  const load = useCallback(async (f: CreditFilters, p: number, l: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/credit-history?${buildQS(f, p, l)}`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, [buildQS]);

  useEffect(() => { load(filters, page, limit); }, [filters, page, limit, load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setFilters({ ...draft });
  }

  function handleClear() {
    setDraft(EMPTY_CREDIT_FILTERS);
    setFilters(EMPTY_CREDIT_FILTERS);
    setPage(1);
  }

  async function openReceipt(id: string) {
    setReceiptLoading(id);
    try {
      const res = await fetch(`/api/user/credit-history/${id}`);
      if (res.ok) setReceipt(await res.json());
    } finally { setReceiptLoading(null); }
  }

  const hasFilter = Object.values(filters).some(Boolean);

  const s = data?.summary;
  const showTotalTopup = receiptTheme?.show_total_topup !== false;
  const creditStatCards: StatItem[] = s ? [
    ...(showTotalTopup ? [{ label: "ยอดเติมรวม", value: fmtBaht(s.total_amount != null ? Number(s.total_amount) : null), sub: "บาท", valueColor: "text-primary" } as StatItem] : []),
    { label: "เติมสำเร็จ",       value: String(Number(s.successful_count ?? 0)),                         sub: "รายการ", valueColor: "text-green-600" },
    { label: "เติมไม่สำเร็จ",   value: String(Number(s.failed_count ?? 0)),                              sub: "รายการ", valueColor: Number(s.failed_count ?? 0) > 0 ? "text-red-500" : undefined },
    { label: "รายการทั้งหมด",   value: String(Number(s.total_transactions ?? 0)),                        sub: "รายการ" },
  ] : [];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">ประวัติเติมเครดิต</h2>

      {creditStatCards.length > 0 && <StatCards items={creditStatCards} />}

      {/* Filter panel */}
      <form onSubmit={handleSearch} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">เลขอ้างอิง</label>
            <input className={inputCls} placeholder="ค้นหาเลขอ้างอิง" value={draft.transaction_no}
              onChange={(e) => setDraft({ ...draft, transaction_no: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ช่องทางชำระเงิน</label>
            <select className={selectCls} value={draft.payment_method}
              onChange={(e) => setDraft({ ...draft, payment_method: e.target.value })}>
              <option value="">ทั้งหมด</option>
              {Object.entries(PAYMENT_METHOD).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">สถานะ</label>
            <select className={selectCls} value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option value="">ทั้งหมด</option>
              <option value="completed">สำเร็จ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="processing">กำลังดำเนินการ</option>
              <option value="failed">ล้มเหลว</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">วันที่เริ่มต้น</label>
            <input type="date" className={inputCls} value={draft.created_at_from}
              onChange={(e) => setDraft({ ...draft, created_at_from: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">วันที่สิ้นสุด</label>
            <input type="date" className={inputCls} value={draft.created_at_to}
              onChange={(e) => setDraft({ ...draft, created_at_to: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          {hasFilter && (
            <button type="button" onClick={handleClear}
              className="rounded-md border border-border px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
              ล้าง
            </button>
          )}
          <button type="submit"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            ค้นหา
          </button>
        </div>
      </form>

      {loading && <Empty>กำลังโหลด...</Empty>}
      {!loading && data?.data.length === 0 && <Empty>ไม่พบประวัติเติมเครดิต</Empty>}
      {!loading && data && data.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><Th cols={["หมายเลขอ้างอิง", "จำนวน", "ค่าธรรมเนียม", "ช่องทาง", "สถานะ", "วันที่", ""]} /></thead>
              <tbody className="divide-y divide-border">
                {data.data.map((c) => {
                  const isDone = c.status?.toLowerCase() === "completed";
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{c.transaction_no || c.reference_id || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{fmtBaht(c.amount)}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{fmtBaht(c.fee)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmtPaymentMethod(c.payment_method)}</td>
                      <td className="px-4 py-3"><StatusBadge s={c.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {fmtDate(c.completed_at || c.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {isDone && (
                          <button
                            onClick={() => openReceipt(c.id)}
                            disabled={receiptLoading === c.id}
                            className="whitespace-nowrap rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {receiptLoading === c.id ? "..." : "ใบเสร็จ"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.total_pages} total={data.total} limit={limit}
            hasNext={data.has_next} hasPrev={data.has_previous} onPage={setPage}
            onLimit={(l) => { setLimit(l); setPage(1); }} />
        </>
      )}

      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => setReceipt(null)}
          userEmail={userInfo?.email}
          userAccountCode={userInfo?.account_code}
          theme={receiptTheme}
        />
      )}
    </div>
  );
}
