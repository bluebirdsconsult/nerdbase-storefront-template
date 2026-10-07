"use client";

import { useState, useEffect } from "react";
import { PaymentMethodSelector } from "./payment-method-selector";
import { BankTransferForm } from "./bank-transfer-form";
import { ConfirmationModal } from "./confirmation-modal";
import { LoadingModal } from "./loading-modal";
import { SuccessModal } from "./success-modal";
import { QrTransferForm } from "./qr-transfer-form";
import { InetQrTransferForm } from "./inet-qr-transfer-form";

type Step = "method" | "bank-transfer" | "qr-transfer" | "inet-qr-transfer";
type ModalState = "none" | "confirm" | "loading" | "success";

interface AddCreditFormProps {
  email: string;
}

export function AddCreditForm({ email }: AddCreditFormProps) {
  const [step, setStep] = useState<Step>("method");
  const [modalState, setModalState] = useState<ModalState>("none");
  const [balance, setBalance] = useState(0);
  const [kycVerified, setKycVerified] = useState<boolean | null>(null);
  const [kycCreditLimit, setKycCreditLimit] = useState<number | null>(null);
  const [remainingBeforeKyc, setRemainingBeforeKyc] = useState<number | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    bank: string;
    file: File | null;
    amount: number;
  }>({ bank: "", file: null, amount: 0 });

  useEffect(() => {
    fetch("/api/user/credit-balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        if (d.balance != null) setBalance(Number(d.balance));
        if (d.kyc_verified != null) setKycVerified(d.kyc_verified);
        if (d.kyc_credit_limit != null) setKycCreditLimit(Number(d.kyc_credit_limit));
        if (d.remaining_before_kyc != null) setRemainingBeforeKyc(Number(d.remaining_before_kyc));
      })
      .catch(() => {});
  }, []);

  const refreshBalance = () => {
    fetch("/api/user/credit-balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.balance != null) setBalance(Number(d.balance)); })
      .catch(() => {});
  };

  const handleSelectMethod = (method: "bank" | "qr", qrMethod?: "sms_forwarder" | "inet") => {
    if (method === "bank") {
      setStep("bank-transfer");
    } else if (method === "qr") {
      setStep(qrMethod === "inet" ? "inet-qr-transfer" : "qr-transfer");
    }
  };

  const handleBankTransferSubmit = (data: { bank: string; file: File; amount: number }) => {
    setFormData(data);
    if (data.file) {
      const previewUrl = URL.createObjectURL(data.file);
      setFilePreviewUrl(previewUrl);
    }
    setError(null);
    setModalState("confirm");
  };

  const handleConfirm = async () => {
    if (!formData.file) return;
    setError(null);
    setModalState("loading");
    try {
      const fd = new FormData();
      fd.append("slip_image", formData.file);
      const response = await fetch("/api/topup/credits", { method: "POST", body: fd });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "เกิดข้อผิดพลาดในการเติมเครดิต");
      }
      const result = await response.json();
      setApiResponse(result.data ?? result);
      refreshBalance();
      setModalState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setModalState("confirm");
    }
  };

  const handleSuccess = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl("");
    }
    setModalState("none");
    setStep("method");
    setFormData({ bank: "", file: null, amount: 0 });
  };

  return (
    <>
      {step === "method" && (
        <PaymentMethodSelector
          balance={balance}
          userEmail={email}
          onSelectMethod={handleSelectMethod}
        />
      )}

      {step === "bank-transfer" && (
        <BankTransferForm
          balance={balance}
          userEmail={email}
          kycVerified={kycVerified}
          kycCreditLimit={kycCreditLimit}
          remainingBeforeKyc={remainingBeforeKyc}
          onSubmit={handleBankTransferSubmit}
          onBack={() => setStep("method")}
        />
      )}

      {step === "qr-transfer" && (
        <QrTransferForm
          balance={balance}
          userEmail={email}
          onBack={() => setStep("method")}
        />
      )}

      {step === "inet-qr-transfer" && (
        <InetQrTransferForm
          balance={balance}
          userEmail={email}
          onBack={() => setStep("method")}
        />
      )}

      <ConfirmationModal
        open={modalState === "confirm"}
        onOpenChange={(open) => {
          if (!open) { setError(null); setModalState("none"); }
        }}
        onConfirm={handleConfirm}
        error={error}
        balance={balance}
        data={{
          userEmail: email,
          fileName: formData.file?.name || "",
          filePreview: filePreviewUrl,
          file: formData.file,
          bankId: formData.bank,
        }}
      />

      <LoadingModal open={modalState === "loading"} />

      <SuccessModal open={modalState === "success"} onClose={handleSuccess} data={apiResponse} />
    </>
  );
}
