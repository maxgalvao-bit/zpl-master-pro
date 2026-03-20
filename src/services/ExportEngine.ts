import { jsPDF } from "jspdf";

export class ExportEngine {
  /**
   * Abre a janela de impressão do sistema operacional com layout otimizado para rolos térmicos 4x6 (100x150mm)
   */
  static printThermal(imagesBase64: string[]) {
    if (!imagesBase64 || imagesBase64.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Bloqueador de pop-ups bloqueou a impressão.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ZPLMaster - Thermal Print</title>
          <style>
            @page { margin: 0; size: 100mm 150mm; }
            body { margin: 0; padding: 0; background: #fff; display: flex; flex-direction: column; align-items: center; }
            .label-page { 
              width: 100mm; 
              height: 150mm; 
              page-break-after: always;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            .label-page img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            /* Remove a quebra de página do último elemento */
            .label-page:last-child {
              page-break-after: auto;
            }
          </style>
        </head>
        <body onload="window.print();">
          ${imagesBase64.map(src => `
            <div class="label-page">
              <img src="${src}" />
            </div>
          `).join('')}
        </body>
        <script>
          window.onafterprint = function() {
            window.close();
          };
        </script>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  /**
   * Gera e faz o download de um PDF no formato 4x6 (1 etiqueta por página)
   */
  static generatePdf4x6(imagesBase64: string[]) {
    if (!imagesBase64 || imagesBase64.length === 0) return;

    // Formato aproximado 4x6 (100mm x 150mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 150]
    });

    imagesBase64.forEach((base64, index) => {
      if (index > 0) pdf.addPage();
      // Ajuste para evitar distorção, encaixando na página
      pdf.addImage(base64, "PNG", 0, 0, 100, 150);
    });

    pdf.save("zplmaster_batch_4x6.pdf");
  }

  /**
   * Gera e faz o download de um PDF no formato A4, em grid 2x2 (Até 4 etiquetas por folha)
   */
  static generatePdfA4(imagesBase64: string[]) {
    if (!imagesBase64 || imagesBase64.length === 0) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4" // 210 x 297 mm
    });

    // Dimensões A4 com margem
    const margin = 5;
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Área útil
    const useableWidth = pageWidth - (margin * 2);
    const useableHeight = pageHeight - (margin * 2);

    // Grid 2x2
    const cellWidth = useableWidth / 2;
    const cellHeight = useableHeight / 2;

    // Tamanho final da etiqueta escalada com segurança (~95x142mm)
    const labelW = 95;
    const labelH = 142;

    let itemsOnPage = 0;

    imagesBase64.forEach((base64, index) => {
      if (index > 0 && itemsOnPage === 4) {
        pdf.addPage();
        itemsOnPage = 0;
      }

      // Calcula posição x, y (0, 1, 2, 3)
      const col = itemsOnPage % 2;
      const row = Math.floor(itemsOnPage / 2);

      // Centralizando a etiqueta dentro de sua celula
      const xOffset = margin + (col * cellWidth) + ((cellWidth - labelW) / 2);
      const yOffset = margin + (row * cellHeight) + ((cellHeight - labelH) / 2);

      pdf.addImage(base64, "PNG", xOffset, yOffset, labelW, labelH);
      itemsOnPage++;
    });

    pdf.save("zplmaster_batch_A4.pdf");
  }
}
