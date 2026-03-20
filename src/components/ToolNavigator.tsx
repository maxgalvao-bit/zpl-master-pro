import React from 'react';

interface ToolNavigatorProps {
  t: {
    homeEditor: string;
    syntaxValidator: string;
    shopeeFixer: string;
    bulkSplitter: string;
    homeEditorDesc: string;
    syntaxValidatorDesc: string;
    shopeeFixerDesc: string;
    bulkSplitterDesc: string;
  };
}

export default function ToolNavigator({ t }: ToolNavigatorProps) {
  const tools = [
    { id: 'editor', title: t.homeEditor, desc: t.homeEditorDesc },
    { id: 'validator', title: t.syntaxValidator, desc: t.syntaxValidatorDesc },
    { id: 'shopee', title: t.shopeeFixer, desc: t.shopeeFixerDesc },
    { id: 'splitter', title: t.bulkSplitter, desc: t.bulkSplitterDesc },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-8">
      {tools.map((tool) => (
        <div key={tool.id} className="border border-slate-300 dark:border-slate-700 p-6 rounded-3xl text-left bg-white dark:bg-slate-900 shadow-md">
          <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{tool.title}</h2>
          <p className="text-slate-600 dark:text-slate-400">{tool.desc}</p>
        </div>
      ))}
    </div>
  );
}
