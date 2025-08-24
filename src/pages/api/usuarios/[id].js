import db from '../../../lib/db.js';

export async function GET({ params }) {
  const id = params.id;

  try {
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
       FROM usuarios u
       LEFT JOIN carreras      c  ON u.carrera_id      = c.id
       LEFT JOIN cuatrimestre  cu ON u.id_cuatrimestre = cu.id
       WHERE u.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error en GET /api/usuarios/:id', error);
    return new Response(JSON.stringify({ error: 'Error del servidor', detalle: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
