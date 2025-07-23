// src/pages/api/usuarios/[id].js
export const prerender = false;

import db from '../../../lib/db.js';      // ajusta la ruta si tu pool está en otra carpeta

export async function GET({ params }) {
  const { id } = params;                  // id viene como string

  try {
    // Consulta completa con joins para devolver todos los datos necesarios
    const { rows } = await db.query(
      `SELECT
         u.id,
         u.nombre,
         u.correo,
         u.rol,
         u.matricula,
         u.carrera_id,
         c.nombre  AS carrera,
         u.id_cuatrimestre,
         cu.nombre AS cuatrimestre,
         u.vigencia,
         u.vigencia_indefinida
       FROM   usuarios u
       LEFT JOIN carreras      c  ON u.carrera_id      = c.id
       LEFT JOIN cuatrimestre  cu ON u.id_cuatrimestre = cu.id
       WHERE  u.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(rows[0]), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error en GET /api/usuarios/:id', err);
    return new Response(
      JSON.stringify({ error: 'Error en el servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
