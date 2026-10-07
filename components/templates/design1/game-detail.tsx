"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import type {
  GameDetails,
  GamePackage,
  TopupOption,
  TopupField,
  TopupGuide,
} from "@/types/games";
import { fetchTopupGuide } from "@/lib/api/games";

interface GameDetailPageProps {
  game: GameDetails;
  defaultPackageId?: string;
  prefillData?: Record<string, string>;
}

export function GameDetailPage({ game, defaultPackageId, prefillData }: GameDetailPageProps) {
  // --- Topup option selection (supplier + type combo) ---
  const activeOptions = useMemo(
    () => (game.topup_options ?? []).filter((o) => o.is_active !== false),
    [game.topup_options]
  );

  const [selectedOption, setSelectedOption] = useState<TopupOption | null>(
    activeOptions[0] ?? null
  );

  // Reset when game changes
  useEffect(() => {
    setSelectedOption(activeOptions[0] ?? null);
  }, [game.id, activeOptions]);

  // --- Packages filtered by selected option ---
  const packages = useMemo(() => {
    if (!selectedOption) {
      // fallback: no topup_options — show all active packages
      return game.packages.filter((p) => p.is_active !== false);
    }
    const seen = new Set<string>();
    return game.packages.filter((p) => {
      if (p.is_active === false) return false;
      if (
        p.supplier_id !== selectedOption.supplier_id ||
        p.game_topup_type_id !== selectedOption.game_topup_type_id
      )
        return false;
      const key = `${p.id}-${p.supplier_id}-${p.game_topup_type_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [game.packages, selectedOption]);

  // --- Topup fields for selected option ---
  const topupFields = useMemo<TopupField[]>(() => {
    if (!selectedOption) return game.topup_fields ?? [];
    const type = (game.game_topup_types ?? []).find(
      (t) => t.id === selectedOption.game_topup_type_id
    );
    return type?.topup_fields ?? game.topup_fields ?? [];
  }, [selectedOption, game.game_topup_types, game.topup_fields]);

  // --- Form state ---
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null);
  const [guide, setGuide] = useState<TopupGuide | null>(null);

  // Refs to prevent auto-select from being wiped by the reset effect
  const hasMounted = useRef(false);
  const autoSelectingOption = useRef<{ supplier_id: string; game_topup_type_id: string } | null>(null);

  // Reset form & package when option changes (skip initial mount + auto-select transitions)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (
      autoSelectingOption.current &&
      autoSelectingOption.current.supplier_id === selectedOption?.supplier_id &&
      autoSelectingOption.current.game_topup_type_id === selectedOption?.game_topup_type_id
    ) {
      autoSelectingOption.current = null;
      return;
    }
    setFormData({});
    setSelectedPackage(null);
  }, [selectedOption?.supplier_id, selectedOption?.game_topup_type_id]);

  // Auto-select package and prefill form from URL params (reorder flow)
  // - Runs once on mount only
  // - Searches game.packages directly (not filtered) so multi-option games work too
  useEffect(() => {
    if (!defaultPackageId && (!prefillData || Object.keys(prefillData).length === 0)) return;
    if (defaultPackageId) {
      const pkg = game.packages.find((p) => p.id === defaultPackageId && p.is_active !== false);
      if (pkg) {
        const matchingOption = activeOptions.find(
          (o) => o.supplier_id === pkg.supplier_id && o.game_topup_type_id === pkg.game_topup_type_id
        );
        if (
          matchingOption &&
          (matchingOption.supplier_id !== selectedOption?.supplier_id ||
            matchingOption.game_topup_type_id !== selectedOption?.game_topup_type_id)
        ) {
          autoSelectingOption.current = {
            supplier_id: matchingOption.supplier_id,
            game_topup_type_id: matchingOption.game_topup_type_id,
          };
          setSelectedOption(matchingOption);
        }
        setSelectedPackage(pkg);
      }
    }
    if (prefillData && Object.keys(prefillData).length > 0) {
      const filled: Record<string, string> = {};
      for (const field of topupFields) {
        if (field.type === "dropdown") continue;
        if (prefillData[field.key]) filled[field.key] = prefillData[field.key];
      }
      if (Object.keys(filled).length > 0) setFormData(filled);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTopupGuide(game.id).then(setGuide);
  }, [game.id]);

  const isFormValid = topupFields
    .filter((f) => f.required)
    .every((f) => (formData[f.key] ?? "").trim() !== "");

  function formatPrice(price: number) {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          หน้าหลัก
        </Link>
        <span>/</span>
        <span className="text-foreground">{game.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Game Image */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
            {game.image_url ? (
              <Image src={game.image_url} alt={game.name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No image
              </div>
            )}
          </div>
          {game.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
          )}
        </div>

        {/* Right: options, fields, packages */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">{game.name}</h1>

          {/* Topup Type Selector */}
          {activeOptions.length >= 1 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-foreground">เลือกประเภทการเติมเกม</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeOptions.map((opt) => {
                  const isSelected =
                    opt.supplier_id === selectedOption?.supplier_id &&
                    opt.game_topup_type_id === selectedOption?.game_topup_type_id;
                  return (
                    <button
                      key={`${opt.supplier_id}-${opt.game_topup_type_id}`}
                      onClick={() => setSelectedOption(opt)}
                      className={[
                        "rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-card hover:border-primary/50",
                      ].join(" ")}
                    >
                      <p className="text-sm font-medium text-foreground">{opt.display_name}</p>
                      {opt.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Form Fields */}
          {topupFields.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-foreground">ข้อมูลการเติม</h2>
              {topupFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {field.label}
                    {field.required && <span className="ml-1 text-destructive">*</span>}
                  </label>
                  {field.type === "dropdown" ? (
                    <select
                      value={formData[field.key] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">-- เลือก {field.label} --</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={`กรอก ${field.label}`}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Package Grid */}
          {packages.length > 0 ? (
            <div className="space-y-3">
              <h2 className="font-semibold text-foreground">เลือกแพ็กเกจ</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {packages.map((pkg) => {
                  const isSelected = pkg.id === selectedPackage?.id &&
                    pkg.supplier_id === selectedPackage?.supplier_id &&
                    pkg.game_topup_type_id === selectedPackage?.game_topup_type_id;
                  return (
                    <button
                      key={`${pkg.id}-${pkg.supplier_id}-${pkg.game_topup_type_id}`}
                      onClick={() => setSelectedPackage(isSelected ? null : pkg)}
                      className={[
                        "rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-card hover:border-primary/50",
                      ].join(" ")}
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-2">{pkg.name}</p>
                      <p className="mt-1 text-base font-bold text-primary">
                        {formatPrice(pkg.price)}
                      </p>
                      {pkg.original_price && pkg.original_price > pkg.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(pkg.original_price)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">ไม่มีแพ็กเกจสำหรับประเภทนี้</p>
          )}

          {/* Order Summary */}
          {selectedPackage && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">แพ็กเกจ</span>
                <span className="font-medium text-foreground">{selectedPackage.name}</span>
              </div>
              {topupFields.map((f) => (
                formData[f.key] ? (
                  <div key={f.key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-medium text-foreground">{formData[f.key]}</span>
                  </div>
                ) : null
              ))}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ราคา</span>
                <span className="font-bold text-primary text-base">
                  {formatPrice(selectedPackage.price)}
                </span>
              </div>
              <button
                disabled={!isFormValid}
                className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                สั่งซื้อเลย
              </button>
              {!isFormValid && (
                <p className="text-xs text-muted-foreground text-center">
                  กรุณากรอกข้อมูลให้ครบก่อน
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Topup Guide */}
      {guide && guide.steps.length > 0 && (
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">วิธีเติมเงิน</h2>
          <ol className="space-y-3">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          {guide.note && (
            <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
              {guide.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
