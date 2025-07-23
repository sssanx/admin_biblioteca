import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

/** ------------------------------------------------------------------
 * pdfGenerator.js  – Generación de reportes de donaciones en PDF
 * 
 *  Fix: Se añaden helpers para convertir valores nulos/undefined a cadenas
 *  y evitar "TypeError: Cannot read properties of null (reading 'toString')".
 * ------------------------------------------------------------------*/

/** Convierte cualquier valor a string y evita errores si es null/undefined */
const s = (v) => (v ?? '').toString();

/** Formatea fechas en DD/MM/YYYY de forma segura */
const formatDate = (d) => {
  if (!d) return '';
  const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return isNaN(date) ? '' : date.toLocaleDateString('es-MX');
};

export async function getPdfBuffer(data) {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Tamaño carta: 8.5" × 11"  -> 612 × 792 pts
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 36;           // 0.5″
    const logoScale = 0.25;

    /* ------------------------- Cargar recursos ------------------------- */
    const logoPath = path.join(process.cwd(), 'public', 'new.png');
    const logoImageBuf = await fs.promises.readFile(logoPath).catch(() => null);
    const logo = logoImageBuf ? await pdfDoc.embedPng(logoImageBuf) : null;

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    /* --------------------------- Nueva página -------------------------- */
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const pages = [page];
    let yPos = pageHeight - margin;

    /* ---------------------------- Encabezado --------------------------- */
    if (logo) {
      const dims = logo.scale(logoScale);
      page.drawImage(logo, {
        x: margin,
        y: yPos - dims.height,
        width: dims.width,
        height: dims.height,
      });
      yPos -= dims.height + 15;
    }

    const reportTitle = 'REPORTE DE DONACIONES';
    const titleWidth = boldFont.widthOfTextAtSize(reportTitle, 14);
    page.drawText(reportTitle, {
      x: (pageWidth - titleWidth) / 2,
      y: yPos - 20,
      size: 14,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    yPos -= 30;

    const fechaText = `Generado el: ${s(data.fecha_generacion)}`;
    const fechaWidth = regularFont.widthOfTextAtSize(fechaText, 10);
    page.drawText(fechaText, {
      x: (pageWidth - fechaWidth) / 2,
      y: yPos,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 25;

    // Línea divisoria
    page.drawLine({
      start: { x: pageWidth * 0.1, y: yPos },
      end: { x: pageWidth * 0.9, y: yPos },
      thickness: 1,
      color: rgb(0, 0.2, 0.4),
    });
    yPos -= 30;

    /* ----------------------- Parámetros del reporte -------------------- */
    page.drawText('PARÁMETROS DEL REPORTE:', {
      x: margin,
      y: yPos,
      size: 11,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    yPos -= 20;

    if (data?.filtros?.tipo && data.filtros.tipo !== 'Todos') {
      page.drawText(`• Tipo: ${data.filtros.tipo}`, {
        x: margin + 15,
        y: yPos,
        size: 10,
        font: regularFont,
      });
      yPos -= 18;
    } else {
      page.drawText('No se aplicaron filtros', {
        x: margin + 15,
        y: yPos,
        size: 10,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPos -= 20;
    }

    yPos -= 25; // Espacio antes de la tabla

    /* ------------------------------ Tabla ------------------------------ */
    const headers = ['ID', 'Donante', 'Fecha', 'Tipo', 'Items', 'Ejemplares', 'Estado'];
    const columnWidths = [30, 120, 70, 70, 40, 60, 70];
    const rowHeight = 22;
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
    const tableX = (pageWidth - tableWidth) / 2;

    // Encabezado
    page.drawRectangle({ x: tableX, y: yPos - 22, width: tableWidth, height: 22, color: rgb(0, 0.2, 0.4) });
    headers.forEach((h, i) => {
      const xPos = tableX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      page.drawText(h, { x: xPos + 3, y: yPos - 15, size: 9, font: boldFont, color: rgb(1, 1, 1) });
      if (i) page.drawLine({ start: { x: xPos, y: yPos - 22 }, end: { x: xPos, y: yPos }, thickness: 0.5, color: rgb(1, 1, 1) });
    });
    yPos -= 27;

    /* ------------------------- Filas de datos ------------------------- */
    if (!Array.isArray(data.datos)) {
      throw new Error('data.datos debe ser un arreglo');
    }

    for (const [idx, row] of data.datos.entries()) {
      if (yPos < margin + rowHeight + 20) {
        // Nueva página
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        pages.push(page);
        yPos = pageHeight - margin - 20;

        // Redibujar encabezado
        page.drawRectangle({ x: tableX, y: yPos - 22, width: tableWidth, height: 22, color: rgb(0, 0.2, 0.4) });
        headers.forEach((h, i) => {
          const xPos = tableX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
          page.drawText(h, { x: xPos + 3, y: yPos - 15, size: 9, font: boldFont, color: rgb(1, 1, 1) });
          if (i) page.drawLine({ start: { x: xPos, y: yPos - 22 }, end: { x: xPos, y: yPos }, thickness: 0.5, color: rgb(1, 1, 1) });
        });
        yPos -= 27;
      }

      const rowData = [
        s(row.id),
        row.donante_nombre ?? '',
        formatDate(row.fecha),
        row.tipo_material ?? '',
        s(row.total_items),
        s(row.total_ejemplares),
        row.estado ?? '',
      ];

      // Fila alternada
      page.drawRectangle({
        x: tableX,
        y: yPos - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: idx % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1),
      });

      rowData.forEach((cell, i) => {
        const xPos = tableX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        page.drawText(cell, { x: xPos + 3, y: yPos - rowHeight + 15, size: 8, font: regularFont, color: rgb(0, 0, 0) });
        if (i) page.drawLine({ start: { x: xPos, y: yPos - rowHeight }, end: { x: xPos, y: yPos }, thickness: 0.3, color: rgb(0.8, 0.8, 0.8) });
      });

      yPos -= rowHeight + 1;
    }

    /* -------------------------- Pie de página ------------------------- */
    const totalPages = pages.length;
    pages.forEach((p, i) => {
      const footerY = margin - 10;
      p.drawLine({ start: { x: margin, y: footerY + 10 }, end: { x: pageWidth - margin, y: footerY + 10 }, thickness: 0.5, color: rgb(0, 0.2, 0.4) });
      p.drawText('Sistema de Gestión de Donaciones', { x: margin, y: footerY, size: 8, font: regularFont, color: rgb(0.4, 0.4, 0.4) });
      p.drawText(`Página ${i + 1} de ${totalPages}`, { x: pageWidth - margin - 40, y: footerY, size: 8, font: regularFont, color: rgb(0.4, 0.4, 0.4) });
    });

    /* --------------------------- Guardar PDF -------------------------- */
    return await pdfDoc.save();
  } catch (err) {
    console.error('Error al generar PDF:', err);
    throw err; // Propaga para que el llamador lo maneje
  }
}
