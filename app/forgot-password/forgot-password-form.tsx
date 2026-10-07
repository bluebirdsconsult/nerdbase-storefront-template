"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ForgotPasswordFormProps {
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  storeName: string;
}

export default function ForgotPasswordForm({ logoUrl, logoWidth, logoHeight, storeName }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirect_url: redirectUrl }),
      });
      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  const LogoBlock = (
    <Link href="/" className="inline-flex items-center justify-center">
      {logoUrl ? (
        <Image src={logoUrl} alt={storeName} width={logoWidth} height={logoHeight} className="object-contain" priority />
      ) : (
        <span className="text-xl font-bold text-primary">{storeName}</span>
      )}
    </Link>
  );

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">{LogoBlock}</div>

          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">ตรวจสอบอีเมลของคุณ</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              หากอีเมล <span className="font-medium text-foreground">{email}</span> มีบัญชีในระบบ
              เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว กรุณาตรวจสอบกล่องขาเข้า (และโฟลเดอร์สแปม)
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              กลับไปเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          {LogoBlock}
          <h1 className="mt-4 text-2xl font-semibold text-foreground">ลืมรหัสผ่าน</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            ← กลับไปเข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
