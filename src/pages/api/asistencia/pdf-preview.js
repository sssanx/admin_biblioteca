// src/pages/api/asistencia/pdf-preview.js

import { generarReporteAsistencia } from '../../../lib/pdf-asistencia.js';

export async function GET({ url }) {
 
  const pdfBytes = await generarReporteAsistencia(data);

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="preview.pdf"'
    }
  });
}
