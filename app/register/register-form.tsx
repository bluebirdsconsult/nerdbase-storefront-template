"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormState = "idle" | "loading" | "success";

const passwordRules = [
  { label: "ความยาวอย่างน้อย 8 ตัวอักษร", test: (p: string) => p.length >= 8 },
  { label: "ตัวอักษรพิมพ์เล็กและพิมพ์ใหญ่ (a-z, A-Z)", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "ตัวเลขอย่างน้อย 1 ตัว (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "อักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*)", test: (p: string) => /[!@#$%^&*()\-_+[\]{},.:;/?`~]/.test(p) },
];

interface RegisterFormProps {
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  storeName: string;
}

export default function RegisterForm({ logoUrl, logoWidth, logoHeight, storeName }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const passwordValid = passwordRules.every((r) => r.test(password));

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

    setFormState("loading");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "สมัครสมาชิกไม่สำเร็จ");
        setFormState("idle");
        return;
      }

      setFormState("success");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setFormState("idle");
    }
  }

  const LogoBlock = (
    <Link href="/" className="inline-flex items-center justify-center">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={storeName}
          width={logoWidth}
          height={logoHeight}
          className="object-contain"
          priority
        />
      ) : (
        <span className="text-xl font-bold text-primary">
          {storeName}
        </span>
      )}
    </Link>
  );

  if (formState === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">{LogoBlock}</div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              ยืนยันอีเมลของคุณ
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ส่งลิงก์ยืนยันไปที่{" "}
              <span className="font-medium text-foreground">{email}</span>{" "}
              แล้ว กรุณาตรวจสอบอีเมลและคลิกลิงก์เพื่อเปิดใช้งานบัญชี
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีแล้ว?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          {LogoBlock}
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            สมัครสมาชิก
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            สร้างบัญชีใหม่เพื่อเริ่มเติมเกม
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
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="email"
            >
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="password"
            >
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="confirm-password"
            >
              ยืนยันรหัสผ่าน
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
            disabled={formState === "loading"}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState === "loading" ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          มีบัญชีแล้ว?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
