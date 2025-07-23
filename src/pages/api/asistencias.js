import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

/** ------------------------------------------------------------------
 * asistencias.js – Generación de reportes de asistencia en PDF
 * ------------------------------------------------------------------*/

// Helpers para manejo seguro de datos
const safeString = (v) => (v ?? '').toString();

const formatDate = (d, options = {}) => {
  if (!d) return '';
  const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return isNaN(date) ? '' : date.toLocaleDateString('es-MX', options);
};

export async function generarReporteAsistencia(data) {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Configuración del documento
    const pageWidth = 612;  // 8.5" en puntos
    const pageHeight = 792; // 11" en puntos
    const margin = 36;      // 0.5" en puntos
    const logoScale = 0.2;

    // Cargar recursos
    const logoPath = path.join(process.cwd(), 'public', 'logo-asistencia.png');
    const logoImageBuf = await fs.promises.readFile(logoPath).catch(() => null);
    const logo = logoImageBuf ? await pdfDoc.embedPng(logoImageBuf) : null;

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Configuración inicial de página
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const pages = [page];
    let yPos = pageHeight - margin;

    // ---------------------------- Encabezado ----------------------------
    if (logo) {
      const dims = logo.scale(logoScale);
      page.drawImage(logo, {
        x: margin,
        y: yPos - dims.height,
        width: dims.width,
        height: dims.height,
      });
      yPos -= dims.height + 10;
    }

    // Título del reporte
    const reportTitle = 'REPORTE DE ASISTENCIA';
    const titleWidth = fontBold.widthOfTextAtSize(reportTitle, 16);
    page.drawText(reportTitle, {
      x: (pageWidth - titleWidth) / 2,
      y: yPos - 20,
      size: 16,
      font: fontBold,
      color: rgb(0, 0.2, 0.4),
    });

    // Fecha de generación
    const fechaGen = formatDate(new Date(), { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const fechaWidth = fontRegular.widthOfTextAtSize(fechaGen, 10);
    page.drawText(fechaGen, {
      x: (pageWidth - fechaWidth) / 2,
      y: yPos - 40,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    yPos -= 60;

    // Línea divisoria
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: pageWidth - margin, y: yPos },
      thickness: 1,
      color: rgb(0, 0.2, 0.4),
    });
    
    yPos -= 30;

    // ----------------------- Parámetros del reporte ---------------------
    page.drawText('PARÁMETROS DEL REPORTE:', {
      x: margin,
      y: yPos,
      size: 12,
      font: fontBold,
      color: rgb(0, 0.2, 0.4),
    });
    yPos -= 20;

    // Mostrar filtros aplicados
    if (data.filtros) {
      const { fechaInicio, fechaFin, carrera, genero } = data.filtros;
      
      if (fechaInicio || fechaFin) {
        const rangoFecha = `${fechaInicio || 'Inicio'} - ${fechaFin || 'Fin'}`;
        page.drawText(`• Período: ${rangoFecha}`, {
          x: margin + 15,
          y: yPos,
          size: 10,
          font: fontRegular,
        });
        yPos -= 18;
      }
      
      if (carrera && carrera !== 'Todas') {
        page.drawText(`• Carrera: ${carrera}`, {
          x: margin + 15,
          y: yPos,
          size: 10,
          font: fontRegular,
        });
        yPos -= 18;
      }
      
      if (genero && genero !== 'Todos') {
        page.drawText(`• Género: ${genero === 'M' ? 'Masculino' : 'Femenino'}`, {
          x: margin + 15,
          y: yPos,
          size: 10,
          font: fontRegular,
        });
        yPos -= 18;
      }
    } else {
      page.drawText('No se aplicaron filtros', {
        x: margin + 15,
        y: yPos,
        size: 10,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPos -= 20;
    }

    yPos -= 25;

    // ---------------------------- Estadísticas --------------------------
    page.drawText('RESUMEN ESTADÍSTICO:', {
      x: margin,
      y: yPos,
      size: 12,
      font: fontBold,
      color: rgb(0, 0.2, 0.4),
    });
    yPos -= 20;

    // Totales
    const totalAsistencias = data.asistencias.length;
    const totalHombres = data.asistencias.filter(a => a.genero === 'M').length;
    const totalMujeres = data.asistencias.filter(a => a.genero === 'F').length;

    page.drawText(`• Total asistencias: ${totalAsistencias}`, {
      x: margin + 15,
      y: yPos,
      size: 10,
      font: fontRegular,
    });
    yPos -= 18;

    page.drawText(`• Hombres: ${totalHombres} (${Math.round((totalHombres / totalAsistencias) * 100)}%)`, {
      x: margin + 15,
      y: yPos,
      size: 10,
      font: fontRegular,
    });
    yPos -= 18;

    page.drawText(`• Mujeres: ${totalMujeres} (${Math.round((totalMujeres / totalAsistencias) * 100)}%)`, {
      x: margin + 15,
      y: yPos,
      size: 10,
      font: fontRegular,
    });
    yPos -= 25;

    // ------------------------------ Tabla ------------------------------
    const headers = ['Nombre', 'Matrícula', 'Carrera', 'Género', 'Fecha', 'Hora'];
    const columnWidths = [100, 60, 90, 50, 70, 50];
    const rowHeight = 20;
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
    const tableX = (pageWidth - tableWidth) / 2;

    // Encabezado de tabla
    page.drawRectangle({
      x: tableX,
      y: yPos - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0, 0.2, 0.4),
    });

    let xPos = tableX;
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: xPos + 5,
        y: yPos - 15,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      xPos += columnWidths[i];
    });

    yPos -= rowHeight + 5;

    // ------------------------- Datos de asistencia ---------------------
    for (const [idx, asistencia] of data.asistencias.entries()) {
      // Verificar si necesitamos nueva página
      if (yPos < margin + rowHeight + 20) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        pages.push(page);
        yPos = pageHeight - margin;
        
        // Redibujar encabezado de tabla
        page.drawRectangle({
          x: tableX,
          y: yPos - rowHeight,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0, 0.2, 0.4),
        });

        xPos = tableX;
        headers.forEach((header, i) => {
          page.drawText(header, {
            x: xPos + 5,
            y: yPos - 15,
            size: 9,
            font: fontBold,
            color: rgb(1, 1, 1),
          });
          xPos += columnWidths[i];
        });

        yPos -= rowHeight + 5;
      }

      // Fondo alternado para mejor legibilidad
      page.drawRectangle({
        x: tableX,
        y: yPos - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: idx % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1),
      });

      // Datos de la fila
      const fechaHora = new Date(asistencia.fecha_hora);
      const fecha = formatDate(fechaHora);
      const hora = fechaHora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      const rowData = [
        asistencia.nombre,
        asistencia.matricula,
        asistencia.carrera || 'N/A',
        asistencia.genero === 'F' ? 'Femenino' : 'Masculino',
        fecha,
        hora
      ];

      xPos = tableX;
      rowData.forEach((cell, i) => {
        page.drawText(safeString(cell), {
          x: xPos + 5,
          y: yPos - 15,
          size: 8,
          font: fontRegular,
          color: rgb(0, 0, 0),
          maxWidth: columnWidths[i] - 10,
        });
        xPos += columnWidths[i];
      });

      yPos -= rowHeight + 2;
    }

    // -------------------------- Pie de página --------------------------
    const totalPages = pages.length;
    pages.forEach((p, idx) => {
      const footerY = margin - 10;
      
      p.drawLine({
        start: { x: margin, y: footerY + 10 },
        end: { x: pageWidth - margin, y: footerY + 10 },
        thickness: 0.5,
        color: rgb(0, 0.2, 0.4),
      });
      
      p.drawText('Sistema de Control de Asistencia - Biblioteca', {
        x: margin,
        y: footerY,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      p.drawText(`Página ${idx + 1} de ${totalPages}`, {
        x: pageWidth - margin - 40,
        y: footerY,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
    });

    return await pdfDoc.save();
  } catch (err) {
    console.error('Error al generar PDF de asistencia:', err);
    throw err;
  }
}