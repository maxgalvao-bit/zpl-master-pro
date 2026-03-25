'use client';

import { useTranslations } from 'next-intl';
import ToolGrid from './ToolGrid';

interface HomeClientProps {
  statsBar?: React.ReactNode;
}

export default function HomeClient({ statsBar }: HomeClientProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col selection:bg-amber-500/30">
      <main className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-10">
        <HeroSection statsBar={statsBar} />
        <div id="ferramentas">
          <ToolGrid />
        </div>
        <PillarsSection />
      </main>
    </div>
  );
}

function HeroSection({ statsBar }: { statsBar?: React.ReactNode }) {
  const t = useTranslations('homepage');

  const scrollToTools = () => {
    document.getElementById('ferramentas')?.scrollIntoView({ behavior: 'smooth' });
  };

  const badges = [t('badge1'), t('badge2'), t('badge3'), t('badge4'), t('badge5')];

  return (
    <section className="flex flex-col items-center text-center gap-6 py-8 md:py-12">
      <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 rounded-full">
        {t('eyebrow')}
      </span>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight max-w-3xl tracking-tight">
        {t('h1')}
      </h1>

      <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
        {t('subtitle')}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {badges.map((badge, i) => (
          <span
            key={i}
            className="text-[10px] font-bold tracking-widest text-slate-400 uppercase border border-slate-700 bg-slate-800/60 px-3 py-1 rounded-full"
          >
            {badge}
          </span>
        ))}
      </div>

      {statsBar}

      <button
        onClick={scrollToTools}
        className="mt-2 bg-amber-400 text-slate-950 font-black text-sm tracking-widest uppercase px-8 py-4 rounded-full shadow-[0_0_24px_rgba(251,191,36,0.4)] hover:shadow-[0_0_36px_rgba(251,191,36,0.6)] hover:bg-amber-300 transition-all"
      >
        {t('ctaBtn')} ↓
      </button>
    </section>
  );
}

function PillarsSection() {
  const t = useTranslations('homepage');

  const pillars = [
    { title: t('pillar1Title'), desc: t('pillar1Desc'), icon: '⚡' },
    { title: t('pillar2Title'), desc: t('pillar2Desc'), icon: '🔒' },
    { title: t('pillar3Title'), desc: t('pillar3Desc'), icon: '🧰' },
    { title: t('pillar4Title'), desc: t('pillar4Desc'), icon: '🎁' },
  ];

  return (
    <section className="py-6">
      <h2 className="text-[11px] font-black tracking-widest text-slate-500 uppercase text-center mb-8">
        {t('pillarsSectionTitle')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((p, i) => (
          <div
            key={i}
            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-3 hover:border-amber-400/30 transition-colors"
          >
            <span className="text-2xl">{p.icon}</span>
            <h3 className="font-medium text-white tracking-normal" style={{ fontSize: '15px' }}>
              {p.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
