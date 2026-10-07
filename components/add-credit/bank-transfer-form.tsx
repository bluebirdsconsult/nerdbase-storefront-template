"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightLeft,
  Check,
  Copy,
  Info,
  Landmark,
  ListChecks,
  Upload,
  X,
  ChevronLeft,
  ZoomIn,
} from "lucide-react";
import { CreditBalanceCard } from "./credit-balance-card";
import { KycCreditLimitBar } from "./kyc-credit-limit-bar";

interface BusinessBank {
  id: string;
  bank_name: string;
  bank_name_value: string;
  account_number: string;
  account_name?: string;
  account_name_th?: string;
  account_name_en?: string;
  is_main_account?: boolean;
}

const THAI_BANKS: Record<string, { name: string; icon: string }> = {
  ktb:   { name: "ธนาคารกรุงไทย (Krungthai Bank)", icon: "/images/banks/KTB.png" },
  bay:   { name: "ธนาคารกรุงศรีอยุธยา (Krungsri)", icon: "/images/banks/BAY.png" },
  kbank: { name: "ธนาคารกสิกรไทย (KBank)", icon: "/images/banks/KBANK.png" },
  bbl:   { name: "ธนาคารกรุงเทพ (Bangkok Bank)", icon: "/images/banks/BBL.png" },
  scb:   { name: "ธนาคารไทยพาณิชย์ (SCB)", icon: "/images/banks/SCB.png" },
  gsb:   { name: "ธนาคารออมสิน (GSB)", icon: "/images/banks/GSB.png" },
  ttb:   { name: "ธนาคารทหารไทยธนชาต (TTB)", icon: "/images/banks/TTB.png" },
  ibank: { name: "ธนาคารอิสลาม (iBank)", icon: "/images/banks/IBANK.png" },
  kkp:   { name: "ธนาคารเกียรตินาคินภัทร (KKP)", icon: "/images/banks/KKP.png" },
  icbc:  { name: "ธนาคารไอซีบีซี (ICBC)", icon: "/images/banks/ICBC.png" },
};

function getBankAccountName(b: BusinessBank): string {
  return b.account_name_th || b.account_name_en || b.account_name || "";
}

function formatAccountNumber(n: string) {
  const c = n.replace(/[-\s]/g, "");
  if (c.length === 10) return `${c.slice(0,3)}-${c.slice(3,4)}-${c.slice(4,9)}-${c.slice(9)}`;
  return n;
}

interface BankTransferFormProps {
  balance: number;
  userEmail: string;
  kycVerified?: boolean | null;
  kycCreditLimit?: number | null;
  remainingBeforeKyc?: number | null;
  onSubmit: (data: { bank: string; file: File; amount: number }) => void;
  onBack: () => void;
}

export function BankTransferForm({
  balance,
  userEmail,
  kycVerified,
  kycCreditLimit,
  remainingBeforeKyc,
  onSubmit,
  onBack,
}: BankTransferFormProps) {
  const [banks, setBanks] = useState<BusinessBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: BusinessBank[]) => {
        setBanks(d);
        if (d.length > 0) {
          const main = d.find((b) => b.is_main_account) ?? d[0];
          setSelectedBankId(main.id);
        }
      })
      .catch(() => setBanks([]))
      .finally(() => setLoadingBanks(false));
  }, []);

  const selectedBank = banks.find((b) => b.id === selectedBankId);
  const bankInfo = selectedBank ? THAI_BANKS[selectedBank.bank_name_value.toLowerCase()] : null;

  const handleCopy = async () => {
    if (!selectedBank) return;
    const digits = selectedBank.account_number.replace(/[-\s]/g, "");
    try {
      await navigator.clipboard.writeText(digits);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleFile = (f: File) => {
    if (!["image/jpeg", "image/jpg", "image/png"].includes(f.type)) {
      setFileError("รองรับไฟล์ JPG, JPEG, PNG เท่านั้น");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFileError("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setFile(f);
    setFileError("");
  };

  const handleRemoveFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
  }, [previewUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const hasDuplicate = (bankNameValue: string) =>
    banks.filter((b) => b.bank_name_value === bankNameValue).length > 1;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 shrink-0 rounded-sm bg-primary" />
          <h1 className="text-base font-semibold md:text-lg">เติมเครดิตผ่านธนาคาร (แนบสลิปการโอน)</h1>
        </div>
      </div>

      {/* KYC notice */}
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-600 md:p-4 md:text-sm">
        สำหรับลูกค้าที่ไม่ได้ทำการยืนยันตัว หากยอดเติมเครดิตต่ำกว่า 10,000 บาท
        จะยังสามารถทำรายการบนเว็บไซต์ได้ตามปกติ
        แต่ถ้าหากมีการเติมเครดิตมากกว่า 10,000 บาทขึ้นไป (เฉพาะครั้งแรก)
        จะต้องทำการยืนยันตัวตนก่อน จึงจะกลับมาใช้งานเว็บไซต์ได้ตามปกติ
      </div>

      <KycCreditLimitBar
        kycVerified={kycVerified}
        kycCreditLimit={kycCreditLimit}
        remainingBeforeKyc={remainingBeforeKyc}
      />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 lg:items-start">
        {/* LEFT — account info */}
        <div className="space-y-4 md:space-y-6">
          <CreditBalanceCard balance={balance} userEmail={userEmail} />

          {loadingBanks ? (
            <div className="rounded-xl border border-border p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 animate-pulse rounded-xl bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-52 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-44 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-primary/40 p-5 md:p-6">
              {/* Bank selector */}
              {banks.length > 1 && (
                <div className="mb-5 space-y-2 border-b border-border/60 pb-5">
                  <label className="text-xs font-medium text-muted-foreground">เลือกธนาคาร</label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    {banks.map((b) => {
                      const info = THAI_BANKS[b.bank_name_value.toLowerCase()];
                      return (
                        <option key={b.id} value={b.id}>
                          {info?.name || b.bank_name_value.toUpperCase()}
                          {hasDuplicate(b.bank_name_value) && getBankAccountName(b) ? ` - ${getBankAccountName(b)}` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    ในกรณีที่บัญชีธนาคารที่ระบบกำหนดไว้มีปัญหา กรุณาเลือกบัญชีธนาคารอื่น
                  </p>
                </div>
              )}

              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                โอนเงินมาที่บัญชีนี้
              </p>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background md:h-16 md:w-16">
                  {bankInfo ? (
                    <Image src={bankInfo.icon} alt={bankInfo.name} width={64} height={64} className="h-full w-full object-contain" />
                  ) : (
                    <Landmark className="h-7 w-7 text-primary md:h-8 md:w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-muted-foreground">
                    {bankInfo?.name || selectedBank?.bank_name_value.toUpperCase() || ""}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-2xl font-semibold tabular-nums tracking-wide md:text-3xl">
                      {selectedBank ? formatAccountNumber(selectedBank.account_number) : ""}
                    </span>
                    {selectedBank && (
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          copied
                            ? "border-green-500/40 bg-green-500/10 text-green-600"
                            : "border-primary/30 text-primary hover:bg-primary/10"
                        }`}
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm md:text-base">
                    ชื่อบัญชี <span className="font-medium">{selectedBank ? getBankAccountName(selectedBank) : ""}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground md:text-sm">
                <ArrowRightLeft className="h-4 w-4 shrink-0 text-primary" />
                อัตราแลกเปลี่ยน 1 บาท = 1 เครดิต (1:1)
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — upload + actions */}
        <div className="space-y-4 md:space-y-6">
          {/* File upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              แนบไฟล์ (สลิป)<span className="text-destructive">*</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-border hover:border-primary hover:bg-primary/5"
              }`}
            >
              {file && previewUrl ? (
                <div className="flex w-full items-center gap-4" onClick={(e) => e.stopPropagation()}>
                  {/* thumbnail — click to open lightbox */}
                  <button
                    type="button"
                    onClick={() => setLightbox(true)}
                    className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-background"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </button>
                  {/* file info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="shrink-0 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLightbox(true)}
                      className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      ดูภาพ
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">คลิกหรือลากไฟล์มาวาง</p>
                    <p className="text-xs text-muted-foreground">รองรับ JPG, JPEG, PNG เท่านั้น ขนาดไม่เกิน 5 MB</p>
                  </div>
                </>
              )}
            </div>
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {/* Terms */}
          <p className="text-center text-sm">
            กรุณาอ่าน &ldquo;
            <Link href="/terms" className="text-primary hover:underline">เงื่อนไขและการให้บริการ</Link>
            &rdquo; ก่อนกดปุ่ม &ldquo;<span className="text-primary">ยืนยัน</span>&rdquo;
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted sm:flex-none sm:px-8"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={!selectedBankId || !file || loadingBanks}
              onClick={() => { if (selectedBankId && file) onSubmit({ bank: selectedBankId, file, amount: 0 }); }}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ยืนยันการเติมเครดิต
            </button>
          </div>

          {/* How-to */}
          <div className="rounded-xl bg-muted/40 p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <ListChecks className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm font-semibold md:text-base">ขั้นตอนการใช้งาน</p>
            </div>
            <ol className="space-y-3">
              {[
                "ทำการโอนเงินตามจำนวนที่ต้องการ",
                "บันทึกสลิปการโอนเงิน",
                "แนบสลิปในช่องด้านบน",
                'กดปุ่ม "ยืนยัน" แล้วรอระบบตรวจสอบอัตโนมัติ',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground md:text-base">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="slip preview"
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
