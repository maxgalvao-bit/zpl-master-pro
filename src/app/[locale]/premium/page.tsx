import { Link } from "../../../i18n/routing";
import Script from "next/script";

export default function PremiumPage() {
  return (
    <>
      {/* Estilos do Brevo */}
      <link rel="stylesheet" href="https://sibforms.com/forms/end-form/build/sib-styles.css" />

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

          {/* Formulário Brevo nativo */}
          <form
            id="sib-form"
            method="POST"
            action="https://3bb4fd44.sibforms.com/serve/MUIFAOj7XyS_0ZfmbTqK4_eviiTSlLKVJCiCKWVnk8InmT1Zh13qAu1Pi9hfue7ftL4s0NEM7LWhcf2DctZfRs1jhrY4U1XyuYH10SFnxSuGnJA3s2Od33IKgQpkPqSqHAGXWYG-WdaItEmaikf5Q3FOADDJokyZ-zMVG3EaihUP2-KyrMLETq8OKtTQutp4GDioJFUWCuZQraflPg=="
            data-type="subscription"
            className="w-full max-w-md mx-auto flex flex-col gap-4"
          >
            <input
              type="email"
              id="EMAIL"
              name="EMAIL"
              required
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500"
            />

            <div
              className="g-recaptcha"
              id="sib-captcha"
              data-sitekey="6Le4pZMsAAAAAIcTPTzDczi9OYWXabYjPJC3nq56"
              data-callback="handleCaptchaResponse"
            />

            <button
              type="submit"
              form="sib-form"
              className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-colors"
            >
              EU QUERO ACESSO ANTECIPADO
            </button>

            <input type="text" name="email_address_check" defaultValue="" className="hidden" />
            <input type="hidden" name="locale" value="pt" />
          </form>

          {/* Mensagem de sucesso */}
          <div
            id="success-message"
            className="hidden bg-emerald-900/40 border border-emerald-500/50 text-emerald-400 font-bold text-sm rounded-xl px-6 py-4"
          >
            ✓ Email registrado! Você será avisado no lançamento.
          </div>

          {/* Mensagem de erro */}
          <div
            id="error-message"
            className="hidden bg-red-900/40 border border-red-500/50 text-red-400 font-bold text-sm rounded-xl px-6 py-4"
          >
            ✗ Ocorreu um erro. Por favor, tente novamente.
          </div>

          {/* Voltar */}
          <Link
            href="/"
            className="text-[11px] font-bold tracking-widest text-slate-500 hover:text-slate-300 transition-colors uppercase"
          >
            ← Voltar para a homepage
          </Link>
        </div>
      </div>

      {/* Scripts */}
      <Script
        src="https://www.google.com/recaptcha/api.js?hl=pt"
        strategy="afterInteractive"
      />
      <Script
        src="https://sibforms.com/forms/end-form/build/main.js"
        strategy="afterInteractive"
      />
      <Script id="brevo-captcha-handler" strategy="afterInteractive">{`
        function handleCaptchaResponse() {
          var event = new Event('captchaChange');
          document.getElementById('sib-captcha').dispatchEvent(event);
        }
      `}</Script>
    </>
  );
}
