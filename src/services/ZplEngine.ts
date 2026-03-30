import { zplToBase64MultipleAsync } from "zpl-renderer-js";

export interface ZplConfig {
  density?: number; // DPI em dots-per-mm, default 8 (203dpi)
  width?: number; // Largura em mm
  height?: number; // Altura em mm
  paper_format?: "A4" | "Letter";
}

export interface ZplProcessResult {
  status: "success" | "error" | "warning";
  processed_zpl?: string;
  preview_url?: string;
  pdf_data?: string;
  fixes_applied?: string[];
  errors?: string[];
  labels?: string[]; // Múltiplas imagens em Base64
  metadata?: {
    label_count?: number;
  };
}

export class ZplEngine {
  /**
   * Renderiza O ZPL cru de forma 100% Client-Side.
   */
  static async render(rawZpl: string, config: ZplConfig = {}): Promise<ZplProcessResult> {
    const { density = 8, width = 101.6, height = 152.4 } = config; // 8 = 203 DPI → canvas 812×1218px

    const cleanZpl = rawZpl.trim();

    if (!cleanZpl) {
      return {
        status: "error",
        errors: ["O código ZPL fornecido está vazio ou é inválido."],
      };
    }

    try {
      // zplToBase64MultipleAsync garante fallback de ZPLs concatenados e retorna array base64 png
      const base64Images = await zplToBase64MultipleAsync(cleanZpl, width, height, density);
      
      const result: ZplProcessResult = {
        status: "success",
        processed_zpl: cleanZpl,
        metadata: {
          label_count: base64Images.length
        },
        labels: []
      };

      if (base64Images && base64Images.length > 0) {
        // Garantindo que teremos Data URIs bem formatados se a lib não injetar o prefixo
        result.labels = base64Images.map(img => 
           img.startsWith('data:') ? img : `data:image/png;base64,${img}`
        );
        // O preview no container é definido preferencialmente pela primeira foto gerada
        result.preview_url = result.labels[0];
      }

      return result;

    } catch (error: any) {
      return {
        status: "error",
        errors: [
          error?.message || "Ocorreu um erro interno da Engine ao parsear a etiqueta ZPL."
        ]
      };
    }
  }
}
