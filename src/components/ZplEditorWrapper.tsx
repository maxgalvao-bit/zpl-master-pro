"use client";

import { useTranslations } from "next-intl";
import ZplEditor from "./ZplEditor";

interface ZplEditorWrapperProps {
  value?: string;
  onChange?: (val: string) => void;
}

export default function ZplEditorWrapper({ value, onChange }: ZplEditorWrapperProps = {}) {
  const editor = useTranslations("editor");
  const ui = useTranslations("ui");

  const t = {
    editor: {
      placeholder: editor("placeholder"),
      renderButton: editor("renderButton"),
      previewTitle: editor("previewTitle"),
      dropZone: editor("dropZone"),
      errorMsg: editor("errorMsg"),
      labelsRendered: (count: number) => editor('labelsRendered', { count }),
      btnThermalPrint: editor("btnThermalPrint"),
      btnPdf4x6: editor("btnPdf4x6"),
      btnPdfA4: editor("btnPdfA4"),
      processing: editor("processing"),
      clear: editor("clear"),
      renderSingle: editor("renderSingle"),
      renderMulti: (count: number) => editor('renderMulti', { count }),
    },
    ui: {
      codeEditor: ui("codeEditor"),
      loadZplFile: ui("loadZplFile"),
      renderLabelsBtn: ui("renderLabelsBtn"),
      toolsSectionTitle: ui("toolsSectionTitle"),
      privacyGuarantee: ui("privacyGuarantee"),
      adTop: ui("adTop"),
      adSidebar: ui("adSidebar"),
      waitingZpl: ui("waitingZpl"),
      ecommerceUltimate: ui("ecommerceUltimate"),
      reportError: ui("reportError"),
      clearCode: ui("clearCode"),
    },
  };

  return <ZplEditor t={t} value={value} onChange={onChange} />;
}
