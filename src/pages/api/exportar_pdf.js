// src/pages/api/exportar_pdf.js
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const get = async () => {
  const result = await db.query('SELECT * FROM libros');
  const libros = result.rows;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 750;
  page.drawText('Catálogo de Libros', { x: 50, y, size: 18, font });
  y -= 30;

  libros.forEach((libro, index) => {
    page.drawText(`${index + 1}. ${libro.titulo} - ${libro.autor}`, { x: 50, y, size: 12, font });
    y -= 20;
    if (y < 50) {
      y = 750;
      pdfDoc.addPage([600, 800]);
    }
  });

  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="catalogo_libros.pdf"',
    },
  });
};