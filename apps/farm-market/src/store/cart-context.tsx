"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";
import { computeTotals, type AppliedCoupon, type CartTotals } from "@/lib/pricing";

const STORAGE_KEY = "meadow-market-cart-v1";

type PromoStatus = "idle" | "checking" | "valid" | "invalid";

interface CartContextValue {
  lines: CartLine[];
  totals: CartTotals;
  promoInput: string;
  setPromoInput: (code: string) => void;
  promoStatus: PromoStatus;
  appliedCoupon: AppliedCoupon | null;
  applyPromo: () => Promise<void>;
  clearPromo: () => void;
  addLine: (line: CartLine) => void;
  removeLine: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clear: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<PromoStatus>("idle");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt local storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage full / unavailable — cart still works for this tab session
    }
  }, [lines, isHydrated]);

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const idx = prev.findIndex(
        (l) => l.slug === line.slug && l.unitLabel === line.unitLabel,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx]!, qty: next[idx]!.qty + line.qty };
        return next;
      }
      return [...prev, line];
    });
  }, []);

  const removeLine = useCallback((index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQty = useCallback((index: number, qty: number) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, qty: Math.max(1, qty) } : l)),
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setAppliedCoupon(null);
    setPromoInput("");
    setPromoStatus("idle");
  }, []);

  const applyPromo = useCallback(async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoStatus("checking");
    try {
      const res = await fetch(
        `/api/promo/validate?code=${encodeURIComponent(code)}`,
      );
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ code: data.code, percentOff: data.percentOff });
        setPromoStatus("valid");
      } else {
        setAppliedCoupon(null);
        setPromoStatus("invalid");
      }
    } catch {
      setAppliedCoupon(null);
      setPromoStatus("invalid");
    }
  }, [promoInput]);

  const clearPromo = useCallback(() => {
    setAppliedCoupon(null);
    setPromoInput("");
    setPromoStatus("idle");
  }, []);

  const totals = useMemo(
    () => computeTotals(lines, appliedCoupon),
    [lines, appliedCoupon],
  );

  const value: CartContextValue = {
    lines,
    totals,
    promoInput,
    setPromoInput,
    promoStatus,
    appliedCoupon,
    applyPromo,
    clearPromo,
    addLine,
    removeLine,
    updateQty,
    clear,
    isHydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
