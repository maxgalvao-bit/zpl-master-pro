import { Link } from "../../../i18n/routing";

export default function PremiumPage() {
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

        {/* Formulário Brevo */}
        <iframe
          width="100%"
          height="305"
          src="https://3bb4fd44.sibforms.com/serve/MUIFAOj7XyS_0ZfmbTqK4_eviiTSlLKVJCiCKWVnk8InmT1Zh13qAu1Pi9hfue7ftL4s0NEM7LWhcf2DctZfRs1jhrY4U1XyuYH10SFnxSuGnJA3s2Od33IKgQpkPqSqHAGXWYG-WdaItEmaikf5Q3FOADDJokyZ-zMVG3EaihUP2-KyrMLETq8OKtTQutp4GDioJFUWCuZQraflPg=="
          frameBorder="0"
          scrolling="auto"
          allowFullScreen
          style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', maxWidth: '100%' }}
        />

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
