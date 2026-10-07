import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert Hex color to OKLCH string for CSS variables
 */
export function hexToOklch(hex: string): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (val: number) =>
    val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

  const rL = toLinear(r), gL = toLinear(g), bL = toLinear(b);
  const xyzX = rL * 0.4124564 + gL * 0.3575761 + bL * 0.1804375;
  const xyzY = rL * 0.2126729 + gL * 0.7151522 + bL * 0.072175;
  const xyzZ = rL * 0.0193339 + gL * 0.119192  + bL * 0.9503041;

  const l_ = Math.cbrt(0.8189330101 * xyzX + 0.3618667424 * xyzY - 0.1288597137 * xyzZ);
  const m_ = Math.cbrt(0.0329845436 * xyzX + 0.9293118715 * xyzY + 0.0361456387 * xyzZ);
  const s_ = Math.cbrt(0.0482003018 * xyzX + 0.2643662691 * xyzY + 0.633851707  * xyzZ);

  const okL = 0.2104542553 * l_ + 0.793617785  * m_ - 0.0040720468 * s_;
  const okA = 1.9779984951 * l_ - 2.428592205  * m_ + 0.4505937099 * s_;
  const okB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766  * s_;

  const chroma = Math.hypot(okA, okB);
  const hue = ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360;

  return `${okL.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)}`;
}

/**
 * Generate CSS variables from theme colors
 */
export function generateCSSVariables(primary: string, secondary: string): string {
  const p = hexToOklch(primary).split(" ").map(Number.parseFloat);
  const s = hexToOklch(secondary).split(" ").map(Number.parseFloat);

  return `
    --background: oklch(1 0 0);
    --foreground: oklch(0.210 0.032 264.7);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.210 0.032 264.7);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(${p[0]} ${p[1]} ${p[2]});
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(${s[0]} ${s[1]} ${s[2]});
    --secondary-foreground: oklch(0.210 0.032 264.7);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(${s[0]} ${s[1] * 0.5} ${s[2]});
    --accent-foreground: oklch(0.210 0.032 264.7);
    --destructive: oklch(0.58 0.22 27);
    --destructive-foreground: oklch(0.985 0 0);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(${p[0]} ${p[1] * 0.8} ${p[2]});
    --radius: 0.5rem;
  `.trim();
}
