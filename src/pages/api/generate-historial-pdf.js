import db from '../../lib/db.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';

const LOGO_HEADER_PNG = './public/logo-itst.png';
const LOGO_FOOTER_PNG = './public/ists2.png';

export async function POST({ request }) {
  try {
    const { filtro, tipo } = await request.json();

    // Configuración de filtros SQL
    let rangoSQL = '';
    let filtroSQL = '';
    
    if (filtro === 'semana') {
      rangoSQL = `AND p.fecha_prestamo >= NOW() - INTERVAL '7 days'`;
    } else if (filtro === 'mes') {
      rangoSQL = `AND p.fecha_prestamo >= NOW() - INTERVAL '1 month'`;
    }
    
    if (tipo === 'devueltos') {
      filtroSQL = `AND p.devuelto = true`;
    } else if (tipo === 'pendientes') {
      filtroSQL = `AND p.devuelto = false`;
    }

    // Consulta SQL para obtener los datos
    const { rows: historial } = await db.query(`
      SELECT p.id,
             l.titulo,
             u.nombre,
             ca.nombre AS carrera,
             p.fecha_prestamo,
             p.fecha_devolucion,
             p.devuelto
      FROM prestamos p
      JOIN libros l ON l.id = p.libro_id
      JOIN usuarios u ON u.id = p.usuario_id
      LEFT JOIN carreras ca ON u.carrera_id = ca.id
      WHERE 1 = 1
      ${rangoSQL}
      ${filtroSQL}
      ORDER BY p.fecha_prestamo DESC
    `);

    if (!historial || historial.length === 0) {
      return new Response('No hay datos para generar el PDF', { status: 400 });
    }

    // Creación del documento PDF
    const pdfDoc = await PDFDocument.create();
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const tickFont = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);

    // Carga de imágenes
    const headerImg = await pdfDoc.embedPng(await readFile(LOGO_HEADER_PNG));
    const footerImg = await pdfDoc.embedPng(await readFile(LOGO_FOOTER_PNG));

    // Configuración de diseño compacto
    const pageSize = [612, 792]; // Tamaño carta
    const margin = 40;
    const lineHeight = 14; // Reducida
    
    // Anchos de columna optimizados
    const colWidths = [150, 90, 80, 70, 70];
    const columnHeaders = ['Libro', 'Carrera', 'Usuario', 'Préstamo', 'Devolución'];

    // Configuración de fuentes
    const fontSize = {
      header: 10,
      title: 12,
      subtitle: 9,
      tableHeader: 8,
      tableData: 7
    };

    // Colores institucionales
    const primaryColor = rgb(0, 0.25, 0.55);
    const secondaryColor = rgb(0.95, 0.95, 0.95);
    const textColor = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);

    // Función para formatear fechas
    const formatDate = (dateStr) => {
      if (!dateStr) return '—';
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    // Función para crear nueva página
    const createNewPage = () => {
      const page = pdfDoc.addPage(pageSize);
      const { width, height } = page.getSize();
      let y = height - margin;

      // Encabezado con logo centrado
      page.drawImage(headerImg, {
        x: (width - 600) / 2,
        y: y - 40,
        width: 650,
        height: 48
      });
      y -= 60;

      // Texto institucional centrado
      page.drawText('INSTITUTO TECNOLÓGICO SUPERIOR DE TLAXCO', {
        x: (width - regularFont.widthOfTextAtSize('INSTITUTO TECNOLÓGICO SUPERIOR DE TLAXCO', fontSize.header)) / 2,
        y,
        size: fontSize.header,
        font: boldFont,
        color: primaryColor
      });
      y -= 18;

      page.drawText('DEPARTAMENTO DE BIBLIOTECA', {
        x: (width - regularFont.widthOfTextAtSize('DEPARTAMENTO DE BIBLIOTECA', fontSize.subtitle)) / 2,
        y,
        size: fontSize.subtitle,
        font: regularFont,
        color: textColor
      });
      y -= 20;

      // Título principal centrado
      page.drawText('HISTORIAL DE PRÉSTAMOS', {
        x: (width - boldFont.widthOfTextAtSize('HISTORIAL DE PRÉSTAMOS', fontSize.title)) / 2,
        y,
        size: fontSize.title,
        font: boldFont,
        color: primaryColor
      });
      y -= 21;

      // Fecha y total
      const fechaText = `Generado: ${formatDate(new Date())}`;
      page.drawText(fechaText, {
        x: margin,
        y,
        size: fontSize.subtitle,
        font: regularFont
      });

      const totalText = `Total: ${historial.length}`;
      page.drawText(totalText, {
        x: width - margin - regularFont.widthOfTextAtSize(totalText, fontSize.subtitle),
        y,
        size: fontSize.subtitle,
        font: regularFont
      });
      y -= 20;

      // Encabezado de tabla
      page.drawRectangle({
        x: margin,
        y: y - lineHeight,
        width: width - margin * 2,
        height: lineHeight,
        color: primaryColor
      });

      // Texto de columnas centrado
      let x = margin;
      columnHeaders.forEach((header, i) => {
        page.drawText(header, {
          x: x + (colWidths[i] - regularFont.widthOfTextAtSize(header, fontSize.tableHeader)) / 2,
          y: y - 12,
          size: fontSize.tableHeader,
          font: boldFont,
          color: white
        });
        x += colWidths[i];
      });

      y -= lineHeight + 2;

      // Pie de página
      page.drawImage(footerImg, {
        x: (width - 600) / 2,
        y: margin - 20,
        width: 600,
        height: 100
      });

      return { page, y, width };
    };

    // Crear primera página
    let { page, y, width } = createNewPage();

    // Procesar cada registro
    historial.forEach((item, index) => {
      const rowData = [
        item.titulo,
        item.carrera ?? '—',
        item.nombre,
        formatDate(item.fecha_prestamo),
        formatDate(item.fecha_devolucion)
      ];

      // Altura fija para filas
      const rowHeight = 16;

      // Verificar espacio en página
      if (y - rowHeight < margin + 100) {
        ({ page, y, width } = createNewPage());
      }

      // Fondo alternado para filas
      if (index % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: y - rowHeight,
          width: width - margin * 2,
          height: rowHeight,
          color: secondaryColor
        });
      }

      // Dibujar contenido de fila
      let x = margin;
      rowData.forEach((text, colIndex) => {
        page.drawText(text, {
          x: x + 3,
          y: y - 12,
          size: fontSize.tableData,
          font: regularFont,
          maxWidth: colWidths[colIndex] - 6
        });
        x += colWidths[colIndex];
      });

      // Indicador de estado
      page.drawText(item.devuelto ? '✓' : '✗', {
        x: width - margin - 15,
        y: y - 12,
        size: 10,
        font: tickFont,
        color: item.devuelto ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0)
      });

      y -= rowHeight;
    });

    // Finalizar y devolver el PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="historial_prestamos_compacto.pdf"'
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