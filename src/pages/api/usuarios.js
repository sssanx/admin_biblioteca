import db from '../../lib/db.js';

export async function GET() {
  try {
    const { rows } = await db.query(`
    SELECT
  u.id,
  u.nombre,
  u.correo,
  u.matricula,
  u.rol,
  CASE WHEN c.nombre IS NULL THEN 'No asignada' ELSE c.nombre END AS carrera,
  CASE WHEN cu.nombre IS NULL THEN 'No asignado' ELSE cu.nombre END AS cuatrimestre,
  u.vigencia,
  u.vigencia_indefinida,
  (NOT u.vigencia_indefinida AND u.vigencia < CURRENT_DATE) AS bloqueado
FROM usuarios u
LEFT JOIN carreras c ON u.carrera_id = c.id
LEFT JOIN cuatrimestre cu ON u.id_cuatrimestre = cu.id
ORDER BY u.id DESC`);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error en la API de usuarios:', err);
    return new Response(
      JSON.stringify({ error: 'Error en el servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
