import db from './db.js';

export async function obtenerDatos(libroId, ejemplarId) {
  let ejemplares = [];
  let libroInfo = {};

  try {
    if (libroId) {
      if (!ejemplarId) {
        // modo masivo (libroId)
        const [libroRes, ejemplaresRes] = await Promise.all([
          db.query('SELECT * FROM libros WHERE id = $1', [libroId]),
          db.query(`
            SELECT 
              e.id,
              e.codigo_barras,
              e.numero_adquisicion,
              e.ubicacion_especifica AS ubicacion,
              e.numero_ejemplar,
              e.estado
            FROM ejemplares e
            WHERE e.libro_id = $1
            ORDER BY e.numero_adquisicion`, [libroId])
        ]);
        libroInfo = libroRes.rows[0] || {};
        ejemplares = ejemplaresRes.rows;
      } else {
        // modo individual (ejemplarId)
        const res = await db.query(`
          SELECT 
            e.*,
            l.*
          FROM ejemplares e
          JOIN libros l ON e.libro_id = l.id
          WHERE e.id = $1
        `, [ejemplarId]);
        ejemplares = res.rows;
        libroInfo = ejemplares[0] || {};
      }
    }
  } catch (error) {
    console.error('Error en consulta SQL:', error);
    libroInfo = { titulo: 'Error', autor: 'No se pudieron cargar los datos' };
  }

  return { libroInfo, ejemplares };
}
