"use client";

import React, { useState, DragEvent, ChangeEvent, useRef } from "react";
import { ZplEngine, ZplProcessResult } from "../services/ZplEngine";
import { ExportEngine } from "../services/ExportEngine";

interface ZplEditorProps {
  t: {
    editor: {
      placeholder: string;
      renderButton: string;
      previewTitle: string;
      dropZone: string;
      errorMsg: string;
      labelsRendered: (count: number) => string;
      btnThermalPrint: string;
      btnPdf4x6: string;
      btnPdfA4: string;
      processing: string;
      clear: string;
      renderSingle: string;
      renderMulti: (count: number) => string;
    };
    ui: {
      codeEditor: string;
      loadZplFile: string;
      renderLabelsBtn: string;
      toolsSectionTitle: string;
      privacyGuarantee: string;
      adTop: string;
      adSidebar: string;
      waitingZpl: string;
      ecommerceUltimate: string;
      reportError: string;
      clearCode: string;
    };
  };
  // Optional: controlled mode
  value?: string;
  onChange?: (val: string) => void;
}

export default function ZplEditor({ t, value, onChange }: ZplEditorProps) {
  const [internalZpl, setInternalZpl] = useState("");
  // Controlled mode when value/onChange are provided
  const isControlled = value !== undefined && onChange !== undefined;
  const rawZpl = isControlled ? value : internalZpl;
  const setRawZpl = (v: string) => {
    if (isControlled) onChange(v);
    else setInternalZpl(v);
  };
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ZplProcessResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawZpl((event.target?.result as string) || "");
      };
      reader.readAsText(file);
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  const handleRender = () => {
    if (!rawZpl.trim()) return;
    setIsProcessing(true);

    setTimeout(async () => {
      try {
        const res = await ZplEngine.render(rawZpl);
        setResult(res);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const handleClear = () => {
    setRawZpl("");
    if (!isControlled) setResult(null);
  };

  const handleDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validExtensions = [".zpl", ".txt"];
      const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

      if (isValid) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const text = event.target?.result as string;
          if (text) {
            setRawZpl(text);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      
      {/* Container Esquerdo: Código ZPL */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-lg shadow-black/20 flex flex-col relative overflow-hidden group h-[620px]">
        
        {/* Superior: Título "EDITOR DE CÓDIGO" e Lixeira */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
           <h3 className="text-sm md:text-base lg:text-lg font-bold tracking-widest text-slate-400 uppercase">{t.ui.codeEditor}</h3>
           <button 
             onClick={handleClear} 
             title={t.editor.clear}
             className="text-xs md:text-sm lg:text-base font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-full"
           >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span>{t.ui.clearCode}</span>
           </button>
        </div>

        {/* Corpo: TextArea */}
        <textarea
            className={`w-full h-[440px] overflow-y-auto p-6 text-sm md:text-base lg:text-lg font-mono resize-none outline-none placeholder:text-slate-500 placeholder:italic placeholder:font-medium placeholder:tracking-widest transition-colors pb-24 border border-slate-700/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
              isDragging ? "bg-slate-700/50" : "bg-slate-900"
            }`}
            placeholder={t.ui.waitingZpl}
            value={rawZpl}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRawZpl(e.target.value)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            spellCheck={false}
        />

        {/* Inferior flutuante: Ambos Botões (Carregar e Renderizar) */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4">
            {/* Secundário: Carregar Arquivo */}
            <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               accept=".zpl,.txt" 
               onChange={handleFileUpload} 
            />
            <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center justify-center gap-2 bg-slate-800 text-white border-2 border-slate-700 hover:bg-slate-700 shadow-sm px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {t.ui.loadZplFile}
            </button>

            {/* Principal: Renderizar Etiquetas */}
            <button 
               onClick={handleRender}
               disabled={!rawZpl.trim() || isProcessing}
               className="flex-1 flex items-center justify-center gap-2 bg-amber-400 text-slate-950 font-bold text-lg tracking-wide rounded-full py-4 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:bg-amber-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isProcessing ? (
                <svg className="animate-spin h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              {isProcessing ? t.editor.processing : t.ui.renderLabelsBtn}
            </button>
        </div>
      </div>


      {/* Container Direito: Envolve o Preview e a Sidebar AD */}
      <div className="flex flex-col gap-4 h-[620px]">
        {/* Visualizador de Imagem / Resultados */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-lg shadow-black/20 flex flex-col justify-center items-center text-center p-6 relative overflow-hidden flex-1">
           {isProcessing ? (
             <div className="flex flex-col items-center justify-center gap-3">
               <div className="w-16 h-16 bg-slate-700 flex items-center justify-center rounded-2xl animate-pulse">
                  <svg className="animate-spin w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               </div>
               <p className="text-[12px] font-bold text-slate-400 italic tracking-widest uppercase mt-2">{t.editor.processing}</p>
             </div>
           ) : result?.status === "success" && result.preview_url ? (
              <div className="w-full h-full flex flex-col pt-4 pb-2">
                  <div className="flex-1 w-full bg-white rounded-xl flex items-center justify-center p-2 mb-4 border border-slate-200 overflow-auto">
                      <img 
                        src={result.preview_url} 
                        alt="ZPL Label Preview" 
                        className="max-h-full max-w-full object-contain shadow-sm border border-slate-200"
                      />
                  </div>
                  {/* Actions Bars - Exportações */}
                  <div className="grid grid-cols-3 gap-2">
                     <button
                      onClick={() => ExportEngine.printThermal(result!.labels!)}
                      className="flex w-full items-center justify-center bg-amber-400 text-slate-950 font-bold tracking-wide rounded-full py-4 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:bg-amber-300 transition-all cursor-pointer"
                     >
                       <p className="text-[10px] sm:text-xs md:text-sm lg:text-base tracking-wider font-bold uppercase">{t.editor.btnThermalPrint}</p>
                     </button>
                     <button
                      onClick={() => ExportEngine.generatePdf4x6(result!.labels!)}
                      className="flex w-full items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 font-bold tracking-wide rounded-full py-4 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(0,0,0,0.6)] hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                     >
                       <p className="text-[10px] sm:text-xs md:text-sm lg:text-base tracking-wider font-bold uppercase">{t.editor.btnPdf4x6}</p>
                     </button>
                     <button
                      onClick={() => ExportEngine.generatePdfA4(result!.labels!)}
                      className="flex w-full items-center justify-center bg-slate-800 text-slate-300 border border-slate-700 font-bold tracking-wide rounded-full py-4 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(0,0,0,0.6)] hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                     >
                       <p className="text-[10px] sm:text-xs md:text-sm lg:text-base tracking-wider font-bold uppercase">{t.editor.btnPdfA4}</p>
                     </button>
                  </div>
              </div>
           ) : result?.status === "error" ? (
              <div className="flex flex-col items-center text-red-500 flex-1 justify-center w-full">
                 <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span className="text-xs font-bold uppercase mb-1">{t.editor.errorMsg}</span>
                 <span className="text-[10px] opacity-80 break-all">{result.errors?.join(", ")}</span>
              </div>
           ) : (
             /* Estado Vazio */
             <div className="flex flex-col items-center opacity-30 mt-12">
                <svg className="w-16 h-16 text-slate-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <p className="text-sm md:text-base lg:text-lg font-medium tracking-widest text-slate-400 italic uppercase">{t.ui.waitingZpl}</p>
             </div>
           )}
        </div>

        {/* PUBLICIDADE - SIDEBAR AD */}
        <div className="w-full h-[90px] rounded-[20px] border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
           <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{t.ui.adSidebar}</p>
        </div>
      </div>

    </div>
  );
}
