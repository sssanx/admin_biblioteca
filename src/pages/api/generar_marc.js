// src/pages/api/generar_marc.js
import db from '../../../lib/db.js';
import { generarMARC } from '../../../lib/marc.js';

export async function POST({ request }) {
  const form = await request.formData();
  const id = form.get('id');
  const { rows } = await db.query('SELECT * FROM libros WHERE id = $1', [id]);

  if (rows.length === 0) {
    return new Response('Libro no encontrado', { status: 404 });
  }

  const libro = rows[0];
  const etiquetas_marc = generarMARC(libro);

  await db.query(`UPDATE libros SET etiquetas_marc = $1 WHERE id = $2`, [etiquetas_marc, id]);

  return new Response(JSON.stringify({ etiquetas_marc }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
