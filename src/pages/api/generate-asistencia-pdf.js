// src/pages/api/generate-asistencia-pdf.js
import db from '../../lib/db.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';

const LOGO_HEADER_PNG = './public/logo-itst.png';
const LOGO_FOOTER_PNG = './public/ists2.png';

export async function POST({ request }) {
  try {
    const { filtros } = await request.json();
    const { carreraId, genero, busqueda, rangoFechas, fechaInicio, fechaFin } = filtros;

    // Construir consulta SQL con filtros (igual que en la página)
    let whereClauses = ["v.tipo_visita = 'asistencia'"];
    let params = [];
    let paramIndex = 1;

    if (rangoFechas === 'hoy') {
      whereClauses.push("DATE(v.fecha_hora) = CURRENT_DATE");
    } else if (rangoFechas === 'semana') {
      whereClauses.push("v.fecha_hora >= NOW() - INTERVAL '7 days'");
    } else if (rangoFechas === 'mes') {
      whereClauses.push("v.fecha_hora >= NOW() - INTERVAL '1 month'");
    } else if (rangoFechas === 'personalizado' && fechaInicio && fechaFin) {
      whereClauses.push(`v.fecha_hora BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(fechaInicio, fechaFin);
      paramIndex += 2;
    }

    if (carreraId) {
      whereClauses.push(`u.carrera_id = $${paramIndex}`);
      params.push(carreraId);
      paramIndex++;
    }

    if (genero) {
      whereClauses.push(`u.genero = $${paramIndex}`);
      params.push(genero);
      paramIndex++;
    }

    // Consulta para obtener los datos filtrados (igual que en la página)
    const { rows: asistencias } = await db.query(`
      SELECT 
        u.id,
        u.nombre,
        u.matricula::text as matricula,
        u.genero,
        COALESCE(c.nombre, u.carrera) as carrera,
        v.fecha_hora
      FROM visitas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN carreras c ON u.carrera_id = c.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY v.fecha_hora DESC
    `, params);

    // Filtrar por búsqueda si existe (igual que en la página)
    const resultados = busqueda 
      ? asistencias.filter(a => 
          a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
          a.matricula.toLowerCase().includes(busqueda.toLowerCase())
        )
      : asistencias;

    if (!resultados || resultados.length === 0) {
      return new Response('No hay datos para generar el PDF', { status: 400 });
    }

    // Crear documento PDF (manteniendo el mismo estilo visual)
    const pdfDoc = await PDFDocument.create();
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Carga de imágenes (mismo logo que en la página)
    const headerImg = await pdfDoc.embedPng(await readFile(LOGO_HEADER_PNG));
    const footerImg = await pdfDoc.embedPng(await readFile(LOGO_FOOTER_PNG));

    // Configuración de diseño (igual que en la página)
    const pageSize = [612, 792];
    const margin = 40;
    const lineHeight = 16;
    const colWidths = [150, 90, 80, 70, 70];
    const columnHeaders = ['Nombre', 'Matrícula', 'Carrera', 'Género', 'Fecha/Hora'];

    // Colores institucionales (igual que en la página)
    const primaryColor = rgb(0, 0.25, 0.55);
    const secondaryColor = rgb(0.95, 0.95, 0.95);
    const textColor = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);

    // Función para crear nueva página (mismo estilo que en la página)
    const createNewPage = () => {
      const page = pdfDoc.addPage(pageSize);
      const { width, height } = page.getSize();
      let y = height - margin;

      // Encabezado con logo (igual que en la página)
      page.drawImage(headerImg, {
        x: (width - 400) / 2,
        y: y - 40,
        width: 400,
        height: 35
      });
      y -= 50;

      // Texto institucional centrado (igual que en la página)
      page.drawText('INSTITUTO TECNOLÓGICO SUPERIOR DE TLAXCO', {
        x: (width - regularFont.widthOfTextAtSize('INSTITUTO TECNOLÓGICO SUPERIOR DE TLAXCO', 10)) / 2,
        y,
        size: 10,
        font: boldFont,
        color: primaryColor
      });
      y -= 18;

      page.drawText('DEPARTAMENTO DE BIBLIOTECA', {
        x: (width - regularFont.widthOfTextAtSize('DEPARTAMENTO DE BIBLIOTECA', 9)) / 2,
        y,
        size: 9,
        font: regularFont,
        color: textColor
      });
      y -= 20;

      // Título principal centrado (igual que en la página)
      page.drawText('REPORTE DE ASISTENCIA', {
        x: (width - boldFont.widthOfTextAtSize('REPORTE DE ASISTENCIA', 12)) / 2,
        y,
        size: 12,
        font: boldFont,
        color: primaryColor
      });
      y -= 22;

      // Fecha y total (igual que en la página)
      const fechaText = `Generado: ${new Date().toLocaleDateString('es-MX')}`;
      page.drawText(fechaText, {
        x: margin,
        y,
        size: 9,
        font: regularFont
      });

      const totalText = `Total: ${resultados.length}`;
      page.drawText(totalText, {
        x: width - margin - regularFont.widthOfTextAtSize(totalText, 9),
        y,
        size: 9,
        font: regularFont
      });
      y -= 20;

      // Encabezado de tabla (igual que en la página)
      page.drawRectangle({
        x: margin,
        y: y - lineHeight,
        width: width - margin * 2,
        height: lineHeight,
        color: primaryColor
      });

      // Texto de columnas centrado (igual que en la página)
      let x = margin;
      columnHeaders.forEach((header, i) => {
        page.drawText(header, {
          x: x + (colWidths[i] - regularFont.widthOfTextAtSize(header, 8)) / 2,
          y: y - 12,
          size: 8,
          font: boldFont,
          color: white
        });
        x += colWidths[i];
      });

      y -= lineHeight + 2;

      // Pie de página (igual que en la página)
      page.drawImage(footerImg, {
        x: (width - 400) / 2,
        y: margin - 20,
        width: 400,
        height: 60
      });

      return { page, y, width };
    };

    // Crear primera página
    let { page, y, width } = createNewPage();

    // Procesar cada registro (mismo estilo que en la página)
    resultados.forEach((asistencia, index) => {
      const rowHeight = 16;

      // Verificar espacio en página
      if (y - rowHeight < margin + 100) {
        ({ page, y, width } = createNewPage());
      }

      // Fondo alternado para filas (igual que en la página)
      if (index % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: y - rowHeight,
          width: width - margin * 2,
          height: rowHeight,
          color: secondaryColor
        });
      }

      // Dibujar contenido de fila (igual que en la página)
      let x = margin;
      const rowData = [
        asistencia.nombre,
        asistencia.matricula,
        asistencia.carrera,
        asistencia.genero === 'F' ? 'Femenino' : 'Masculino',
        new Date(asistencia.fecha_hora).toLocaleString('es-MX')
      ];

      rowData.forEach((text, colIndex) => {
        page.drawText(text, {
          x: x + 3,
          y: y - 12,
          size: 7,
          font: regularFont,
          maxWidth: colWidths[colIndex] - 6
        });
        x += colWidths[colIndex];
      });

      y -= rowHeight;
    });

    // Generar PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte-asistencia.pdf"'
      }
    });
  } catch (err) {
    console.error('Error al generar PDF:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Error al generar PDF',
        details: err.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}