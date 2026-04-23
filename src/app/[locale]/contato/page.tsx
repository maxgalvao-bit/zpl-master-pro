import type { Metadata } from "next";
import { marked } from "marked";
import { readFile } from "fs/promises";
import path from "path";

const SUPPORTED_LOCALES = ["pt-br", "en", "es", "zh"];

const metaByLocale: Record<string, { title: string; description: string }> = {
  "pt-br": {
    title: "Contato | ZPLMaster Pro",
    description:
      "Entre em contato com a equipe do ZPLMaster Pro. Suporte via chat ao vivo e e-mail.",
  },
  en: {
    title: "Contact | ZPLMaster Pro",
    description:
      "Get in touch with the ZPLMaster Pro team. Support via live chat and email.",
  },
  es: {
    title: "Contacto | ZPLMaster Pro",
    description:
      "Contáctanos. Soporte vía chat en vivo y correo electrónico.",
  },
  zh: {
    title: "联系我们 | ZPLMaster Pro",
    description: "联系ZPLMaster Pro团队。通过在线客服和电子邮件获得支持。",
  },
};

async function getMarkdownContent(locale: string): Promise<string> {
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "pt-br";
  const filePath = path.join(process.cwd(), "src/content/contato", `${safeLocale}.md`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return await marked(raw);
  } catch {
    const fallback = path.join(process.cwd(), "src/content/contato", "pt-br.md");
    const raw = await readFile(fallback, "utf-8");
    return await marked(raw);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "pt-br";
  const meta = metaByLocale[safeLocale] ?? metaByLocale["pt-br"];
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function ContatoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const html = await getMarkdownContent(locale);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div
          className="
            [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-white [&_h1]:mb-8 [&_h1]:leading-tight
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-blue-300 [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:text-slate-400 [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-slate-400
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-slate-400
            [&_li]:mb-1 [&_li]:leading-relaxed
            [&_strong]:text-slate-200 [&_strong]:font-semibold
            [&_a]:text-blue-400 [&_a]:no-underline [&_a:hover]:underline
            [&_hr]:border-slate-700 [&_hr]:my-8
            [&_code]:bg-slate-800 [&_code]:text-blue-300 [&_code]:px-1 [&_code]:rounded
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
