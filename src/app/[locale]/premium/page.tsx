"use client";

import { useState, useEffect } from "react";
import { Link } from "../../../i18n/routing";
import Script from "next/script";

const BREVO_URL =
  "https://3bb4fd44.sibforms.com/serve/MUIFAOj7XyS_0ZfmbTqK4_eviiTSlLKVJCiCKWVnk8InmT1Zh13qAu1Pi9hfue7ftL4s0NEM7LWhcf2DctZfRs1jhrY4U1XyuYH10SFnxSuGnJA3s2Od33IKgQpkPqSqHAGXWYG-WdaItEmaikf5Q3FOADDJokyZ-zMVG3EaihUP2-KyrMLETq8OKtTQutp4GDioJFUWCuZQraflPg==";

export default function PremiumPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    (window as any).handleCaptchaResponse = (token: string) => {
      setCaptchaToken(token);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captchaToken) return;
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("EMAIL", email);
      formData.append("email_address_check", "");
      formData.append("locale", "pt");
      formData.append("g-recaptcha-response", captchaToken);

      await fetch(BREVO_URL, { method: "POST", body: formData, mode: "no-cors" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
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
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight text-center">
              ZPLMaster Premium<br />— Em breve
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Seja o primeiro a saber quando lançar.
            </p>
          </div>

          {/* Conteúdo por estado */}
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-yellow-500 mb-2">
                Você está na lista!
              </h3>
              <p className="text-slate-300">
                Avisaremos assim que o ZPLMaster Premium lançar.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md mx-auto flex flex-col gap-4"
            >
              <input
                type="email"
                id="EMAIL"
                name="EMAIL"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500"
              />

              <div
                className="g-recaptcha flex justify-center"
                id="sib-captcha"
                data-sitekey="6Le4pZMsAAAAAIcTPTzDczi9OYWXabYjPJC3nq56"
                data-callback="handleCaptchaResponse"
              />

              <button
                type="submit"
                disabled={status === "loading" || !captchaToken}
                className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl transition-colors"
              >
                {status === "loading" ? "Enviando..." : "EU QUERO ACESSO ANTECIPADO"}
              </button>

              {status === "error" && (
                <p className="text-red-400 text-sm">
                  Algo deu errado. Tente novamente ou envie um e-mail para{" "}
                  <a href="mailto:suporte@zplmaster.com" className="underline">
                    suporte@zplmaster.com
                  </a>
                </p>
              )}
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

      <Script
        src="https://www.google.com/recaptcha/api.js?hl=pt"
        strategy="afterInteractive"
      />
    </>
  );
}
