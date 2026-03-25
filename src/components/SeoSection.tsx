'use client';

import { useState } from 'react';
import { AdSlot } from './AdSlot';

export interface FaqItem {
  q: string;
  a: string;
}

interface SeoSectionProps {
  howToTitle: string;
  faqTitle: string;
  intro: string;
  steps: [string, string, string];
  faqs: FaqItem[];
}

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left bg-slate-800/60 hover:bg-slate-800 transition-colors gap-4"
        aria-expanded={open}
      >
        <span className="font-medium text-white text-sm leading-snug">{item.q}</span>
        <span
          className={`text-amber-400 text-lg flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[500px]' : 'max-h-0'}`}
      >
        <p className="p-4 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50">
          {item.a}
        </p>
      </div>
    </div>
  );
}

export default function SeoSection({ howToTitle, faqTitle, intro, steps, faqs }: SeoSectionProps) {
  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto w-full py-8">
      {/* Descrição */}
      <section>
        <p className="text-slate-400 text-base leading-relaxed">{intro}</p>
      </section>

      {/* Como usar */}
      <section>
        <h2 className="text-lg font-bold text-white mb-5">{howToTitle}</h2>
        <ol className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-black">
                {i + 1}
              </span>
              <span className="text-slate-400 text-sm leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* AdSense in-article */}
      <AdSlot slot="1164474328" format="fluid" layout="in-article" />

      {/* FAQ */}
      <section>
        <h2 className="text-lg font-bold text-white mb-5">{faqTitle}</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((item, i) => (
            <FaqAccordionItem key={i} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
