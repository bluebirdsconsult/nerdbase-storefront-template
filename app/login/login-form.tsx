"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { loginCustomer, verifyLoginOTP } from "@/lib/api/auth";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  storeName: string;
}

export default function LoginForm({ logoUrl, logoWidth, logoHeight, storeName }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const verified = searchParams.get("verified") === "1";
  const verifyError = searchParams.get("error") === "verification_failed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP step state
  const [showPassword, setShowPassword] = useState(false);

  // OTP step state
  const [otpStep, setOtpStep] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginCustomer(email, password);

      if ("type" in result && result.type === "otp_required") {
        setTempToken(result.temp_token);
        setMaskedEmail(result.email);
        setOtpStep(true);
        return;
      }

      const signInResult = await signIn("credentials", {
        loginData: JSON.stringify(result.data),
        redirect: false,
      });

      if (signInResult?.error) {
        setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      if (err?.code === "INVALID_CREDENTIALS") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (err?.code === "EMAIL_NOT_VERIFIED") {
        setError("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
      } else {
        setError(err?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await verifyLoginOTP(tempToken, otpCode);

      const signInResult = await signIn("credentials", {
        loginData: JSON.stringify(result.data),
        redirect: false,
      });

      if (signInResult?.error) {
        setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      if (err?.code === "ERR_AUTH_028" || err?.code === "invalid_otp") {
        setError("รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      } else if (err?.code === "ERR_AUTH_011" || err?.code === "token_expired") {
        setError("รหัส OTP หมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่");
        setOtpStep(false);
      } else {
        setError(err?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
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
              <span className="text-xl font-bold text-primary">{storeName}</span>
            )}
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            {otpStep ? "ยืนยัน OTP" : "เข้าสู่ระบบ"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {otpStep
              ? `กรุณากรอกรหัส OTP ที่ส่งไปยัง ${maskedEmail}`
              : "ยินดีต้อนรับกลับมา"}
          </p>
        </div>

        {verified && !otpStep && (
          <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            ยืนยันอีเมลสำเร็จแล้ว กรุณาเข้าสู่ระบบ
          </div>
        )}

        {verifyError && !otpStep && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว
          </div>
        )}

        {otpStep ? (
          <form
            onSubmit={handleOtpSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
          >
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="otp">
                รหัส OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังยืนยัน..." : "ยืนยัน OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpStep(false);
                setTempToken("");
                setMaskedEmail("");
                setOtpCode("");
                setError("");
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>
          </form>
        ) : (
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  รหัสผ่าน
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        )}

        {!otpStep && (
          <p className="text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              สมัครสมาชิก
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
