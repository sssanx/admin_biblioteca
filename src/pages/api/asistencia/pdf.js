import { getPdfBuffer } from '../../../lib/pdf-asistencia';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const pdfBytes = await getPdfBuffer(data);

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reporte-asistencia.pdf"'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
