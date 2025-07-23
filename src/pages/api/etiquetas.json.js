// src/pages/api/etiquetas.json.js
import db from '../../../lib/db.js'; // ajusta la ruta si está en otro nivel

export async function GET({ url }) {
  const q = decodeURIComponent(url.searchParams.get('q')?.trim() ?? '');

  let resultados = [];
  if (q.length >= 2) {
    try {
      const { rows } = await db.query(
        `
        SELECT 
          e.id,
          e.codigo_barras,
          e.numero_adquisicion,
          e.numero_ejemplar,
          e.ubicacion_especifica,
          l.titulo
        FROM ejemplares e
        JOIN libros l ON l.id = e.libro_id
        WHERE unaccent(e.codigo_barras) ILIKE unaccent($1)
           OR unaccent(e.numero_adquisicion) ILIKE unaccent($1)
           OR unaccent(l.titulo) ILIKE unaccent($1)
        ORDER BY l.titulo, e.numero_ejemplar
        LIMIT 25
        `,
        [`%${q}%`]
      );

      resultados = rows.map(r => ({
        id:     r.id,
        codigo: r.codigo_barras        ?? 'SN',
        titulo: r.titulo               ?? 'Sin título',
        ubic:   r.ubicacion_especifica ?? 'Sin ubicación'
      }));
    } catch (err) {
      console.error('Error en consulta SQL', err);
      return new Response(
        JSON.stringify({ error: 'Error de base de datos' }),
        { status: 500 }
      );
    }
  }

  return new Response(JSON.stringify({ resultados }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
