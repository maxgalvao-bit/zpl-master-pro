"use client";

import { useState } from "react";
import { Link } from "../../../i18n/routing";
import { trackEvent } from "../../../lib/analytics";

export default function PremiumPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const existing = JSON.parse(localStorage.getItem("premium_waitlist") ?? "[]");
    localStorage.setItem("premium_waitlist", JSON.stringify([...existing, email.trim()]));
    trackEvent("premium_waitlist", "premium");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md flex flex-col gap-8 text-center">

        {/* Badge */}
        <div className="flex justify-center">
          <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 rounded-full">
            Premium
          </span>
        </div>

        {/* Título */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            ZPLMaster Premium — Em breve
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Seja o primeiro a saber quando lançar.
          </p>
        </div>

        {/* Form ou confirmação */}
        {submitted ? (
          <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-2xl p-6">
            <p className="text-emerald-400 font-bold text-base">
              ✓ Email registrado! Você será avisado no lançamento.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full bg-amber-400 text-slate-950 font-black text-sm tracking-widest uppercase px-6 py-4 rounded-full shadow-[0_0_24px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:shadow-[0_0_36px_rgba(251,191,36,0.6)] transition-all"
            >
              Quero acesso antecipado
            </button>
          </form>
        )}

        {/* Voltar */}
        <Link
          href="/"
          className="text-[11px] font-bold tracking-widest text-slate-500 hover:text-slate-300 transition-colors uppercase"
        >
          ← Voltar para a homepage
        </Link>
      </div>
    </div>
  );
}
