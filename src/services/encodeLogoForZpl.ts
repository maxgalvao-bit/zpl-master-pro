/**
 * Converte imagem (data URL) em fragmento ZPL via ~DGR + ^XGR para impressão monocromática.
 * Executar apenas no browser (usa canvas).
 * Retorna { downloadCmd, renderCmd } onde:
 *   downloadCmd = ~DGR:LOGO.GRF,... (deve ficar ANTES do ^XA)
 *   renderCmd   = ^FO22,25^XGR:LOGO.GRF,1,1^FS (dentro do label body)
 */
export async function encodeLogoForZpl(
  dataUrl: string
): Promise<{ downloadCmd: string; renderCmd: string } | null> {
  if (typeof document === "undefined") return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const maxW = 240;
        const maxH = 90; // Y=25 + 90 = 115 < separador em Y=120
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const scale = Math.min(maxW / w, maxH / h, 1);
        w = Math.max(8, Math.floor(w * scale));
        h = Math.max(8, Math.floor(h * scale));
        w = Math.ceil(w / 8) * 8;

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const bytesPerRow = w / 8;
        const totalBytes = bytesPerRow * h;
        const bytes = new Uint8Array(totalBytes);

        for (let row = 0; row < h; row++) {
          for (let colByte = 0; colByte < bytesPerRow; colByte++) {
            let b = 0;
            for (let bit = 0; bit < 8; bit++) {
              const x = colByte * 8 + bit;
              const i = (row * w + x) * 4;
              const r = imageData.data[i];
              const g = imageData.data[i + 1];
              const bl = imageData.data[i + 2];
              const lum = (r + g + bl) / 3;
              if (lum < 128) b |= 1 << (7 - bit);
            }
            bytes[row * bytesPerRow + colByte] = b;
          }
        }

        let hex = "";
        for (let i = 0; i < bytes.length; i++) {
          hex += bytes[i].toString(16).padStart(2, "0").toUpperCase();
        }

        resolve({
          downloadCmd: `~DGR:LOGO.GRF,${totalBytes},${bytesPerRow},${hex}`,
          renderCmd: `^FO22,25^XGR:LOGO.GRF,1,1^FS`,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
