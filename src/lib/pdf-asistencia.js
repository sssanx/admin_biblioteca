import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

// Helpers seguros
const s = (v) => (v ?? '').toString();
const formatDate = (d) => {
  if (!d) return '';
  const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return isNaN(date) ? '' : date.toLocaleDateString('es-MX');
};

export async function getPdfBuffer(data) {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 36;
    const rowHeight = 22;

    // Logo
    const logoPath = path.join(process.cwd(), 'public', 'logo-itst.png');
    const logoImg = await fs.promises.readFile(logoPath).catch(() => null);
    const logo = logoImg ? await pdfDoc.embedPng(logoImg) : null;

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const pages = [page];
    let yPos = pageHeight - margin;

    // Encabezado
    if (logo) {
      const dims = logo.scale(0.3);
      page.drawImage(logo, { x: margin, y: yPos - dims.height, width: dims.width, height: dims.height });
      yPos -= dims.height + 10;
    }

    const title = 'REPORTE DE ASISTENCIA';
    page.drawText(title, {
      x: (pageWidth - boldFont.widthOfTextAtSize(title, 14)) / 2,
      y: yPos,
      size: 14,
      font: boldFont,
      color: rgb(0, 0.2, 0.4)
    });
    yPos -= 25;

    const fecha = `Generado: ${formatDate(new Date())}`;
    page.drawText(fecha, {
      x: margin,
      y: yPos,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4)
    });
    yPos -= 25;

    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: pageWidth - margin, y: yPos },
      thickness: 1,
      color: rgb(0, 0.2, 0.4)
    });
    yPos -= 30;

    // Tabla
    const headers = ['Nombre', 'Matrícula', 'Carrera', 'Género', 'Fecha', 'Hora'];
    const colWidths = [120, 70, 100, 50, 80, 60];
    const tableX = margin;
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    // Header de tabla
    page.drawRectangle({
      x: tableX,
      y: yPos - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0, 0.2, 0.4)
    });

    let xPos = tableX;
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: xPos + 4,
        y: yPos - 15,
        size: 9,
        font: boldFont,
        color: rgb(1, 1, 1)
      });
      xPos += colWidths[i];
    });
    yPos -= rowHeight + 3;

    // Filas
    for (const [i, row] of data.asistencias.entries()) {
      if (yPos < margin + rowHeight + 20) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        pages.push(page);
        yPos = pageHeight - margin;
      }

      const fecha = formatDate(row.fecha_hora);
      const hora = new Date(row.fecha_hora).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const rowData = [
        s(row.nombre),
        s(row.matricula),
        s(row.carrera) || 'N/A',
        row.genero === 'F' ? 'Femenino' : 'Masculino',
        fecha,
        hora
      ];

      // Fondo alternado
      page.drawRectangle({
        x: tableX,
        y: yPos - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: i % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1)
      });

      let x = tableX;
      rowData.forEach((cell, j) => {
        page.drawText(cell, {
          x: x + 4,
          y: yPos - 15,
          size: 8,
          font: regularFont,
          color: rgb(0, 0, 0)
        });
        x += colWidths[j];
      });

      yPos -= rowHeight + 2;
    }

    // Pie de página
    const totalPages = pages.length;
    pages.forEach((p, i) => {
      const footerY = margin - 10;
      p.drawLine({
        start: { x: margin, y: footerY + 10 },
        end: { x: pageWidth - margin, y: footerY + 10 },
        thickness: 0.5,
        color: rgb(0, 0.2, 0.4)
      });
      p.drawText('Sistema de Control de Asistencia - Biblioteca', {
        x: margin,
        y: footerY,
        size: 8,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4)
      });
      p.drawText(`Página ${i + 1} de ${totalPages}`, {
        x: pageWidth - margin - 50,
        y: footerY,
        size: 8,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4)
      });
    });

    return await pdfDoc.save();
  } catch (err) {
    console.error('Error al generar PDF de asistencia:', err);
    throw err;
  }
}
