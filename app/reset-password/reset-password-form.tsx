"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const passwordRules = [
  { label: "ความยาวอย่างน้อย 8 ตัวอักษร",             test: (p: string) => p.length >= 8 },
  { label: "ตัวอักษรพิมพ์เล็กและพิมพ์ใหญ่ (a-z, A-Z)", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "ตัวเลขอย่างน้อย 1 ตัว (0-9)",              test: (p: string) => /[0-9]/.test(p) },
  { label: "อักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*)",    test: (p: string) => /[!@#$%^&*()\-_+[\]{},.:;/?`~]/.test(p) },
];

interface ResetPasswordFormProps {
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  storeName: string;
}

export default function ResetPasswordForm({ logoUrl, logoWidth, logoHeight, storeName }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  const passwordValid = passwordRules.every((r) => r.test(password));

  const LogoBlock = (
    <Link href="/" className="inline-flex items-center justify-center">
      {logoUrl ? (
        <Image src={logoUrl} alt={storeName} width={logoWidth} height={logoHeight} className="object-contain" priority />
      ) : (
        <span className="text-xl font-bold text-primary">{storeName}</span>
      )}
    </Link>
  );

  // No token in URL
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">{LogoBlock}</div>
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <svg className="h-7 w-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">ลิงก์ไม่ถูกต้อง</h2>
            <p className="text-sm text-muted-foreground">ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว</p>
            <Link
              href="/forgot-password"
              className="inline-block mt-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              ขอลิงก์ใหม่
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">{LogoBlock}</div>
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">รีเซ็ตรหัสผ่านสำเร็จ</h2>
            <p className="text-sm text-muted-foreground">รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว</p>
            <Link
              href="/login"
              className="inline-block mt-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError("รหัสผ่านไม่ตรงตามเงื่อนไข");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "INVALID_TOKEN") {
          setError("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่");
        } else {
          setError(data?.message ?? "รีเซ็ตรหัสผ่านไม่สำเร็จ");
        }
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          {LogoBlock}
          <h1 className="mt-4 text-2xl font-semibold text-foreground">ตั้งรหัสผ่านใหม่</h1>
          <p className="mt-1 text-sm text-muted-foreground">กรอกรหัสผ่านใหม่ของคุณ</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
              {error.includes("หมดอายุ") && (
                <Link href="/forgot-password" className="ml-1 underline font-medium">ขอลิงก์ใหม่</Link>
              )}
            </div>
          )}

          {/* New password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <li key={rule.label} className={`flex items-center gap-2 text-xs ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                      {ok ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
              ยืนยันรหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
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
