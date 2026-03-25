"use client";

import { useCallback, useState } from "react";
import {
  analyzeShopeeZpl,
  fixShopeeZpl,
  type DPI,
  type ShopeeAnalysis,
} from "../services/ShopeeFixEngine";
import { trackEvent } from "../lib/analytics";

export function useShopeeFix() {
  const [zplInput, setZplInput] = useState("");
  const [dpi, setDpi] = useState<DPI>(203);
  const [analysis, setAnalysis] = useState<ShopeeAnalysis | null>(null);
  const [fixedZpl, setFixedZpl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (!zplInput.trim()) return;
    const result = analyzeShopeeZpl(zplInput, dpi);
    setAnalysis(result);
    setFixedZpl(null);
  }, [zplInput, dpi]);

  const handleFix = useCallback(() => {
    if (!analysis?.canFix) return;
    const corrected = fixShopeeZpl(zplInput, dpi);
    setFixedZpl(corrected);
    setAnalysis(analyzeShopeeZpl(corrected, dpi));
    setZplInput(corrected);
    trackEvent('shopee_fixed', 'shopee_fix');
  }, [analysis, dpi, zplInput]);

  const handleCopy = useCallback(async () => {
    const text = fixedZpl || zplInput;
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fixedZpl, zplInput]);

  const handleDownload = useCallback(() => {
    const text = fixedZpl || zplInput;
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopee_fixed.zpl";
    a.click();
    URL.revokeObjectURL(url);
  }, [fixedZpl, zplInput]);

  return {
    zplInput,
    setZplInput,
    dpi,
    setDpi,
    analysis,
    fixedZpl,
    copied,
    handleAnalyze,
    handleFix,
    handleCopy,
    handleDownload,
  };
}
