// src/pages/api/reporte.js
export async function post({ request }) {
  try {
    const { fechaInicio, fechaFin, carreraId, tipoReporte } = await request.json();
    const db = (await import('../../lib/db')).default;

    // Obtener asistencias
    const { rows: asistencias } = await db.query(`
      SELECT 
        u.nombre, 
        u.matricula::text as matricula, 
        COALESCE(c.nombre, u.carrera) as carrera, 
        u.genero,
        DATE(v.fecha_hora) as fecha,
        TO_CHAR(v.fecha_hora, 'HH24:MI') as hora
      FROM visitas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN carreras c ON u.carrera_id = c.id
      WHERE DATE(v.fecha_hora) BETWEEN $1 AND $2
      ${carreraId ? "AND (u.carrera_id = $3 OR u.carrera_id IS NULL AND $3::text = 'null')" : ""}
      AND v.tipo_visita = 'asistencia'
      ORDER BY v.fecha_hora DESC
    `, carreraId ? [fechaInicio, fechaFin, carreraId] : [fechaInicio, fechaFin]);

    // Obtener estadísticas
    const { rows: statsCarrera } = await db.query(`
      SELECT 
        COALESCE(c.nombre, u.carrera) as carrera, 
        COUNT(*) as total,
        SUM(CASE WHEN u.genero = 'M' THEN 1 ELSE 0 END) as hombres,
        SUM(CASE WHEN u.genero = 'F' THEN 1 ELSE 0 END) as mujeres
      FROM visitas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN carreras c ON u.carrera_id = c.id
      WHERE DATE(v.fecha_hora) BETWEEN $1 AND $2
      ${carreraId ? "AND (u.carrera_id = $3 OR u.carrera_id IS NULL AND $3::text = 'null')" : ""}
      AND v.tipo_visita = 'asistencia'
      GROUP BY COALESCE(c.nombre, u.carrera)
      ORDER BY total DESC
    `, carreraId ? [fechaInicio, fechaFin, carreraId] : [fechaInicio, fechaFin]);

    // Calcular totales
    const total = asistencias.length;
    const totalHombres = statsCarrera.reduce((acc, c) => acc + parseInt(c.hombres), 0);
    const totalMujeres = statsCarrera.reduce((acc, c) => acc + parseInt(c.mujeres), 0);

    return new Response(JSON.stringify({
      asistencias,
      estadisticas: statsCarrera,
      total,
      totalHombres,
      totalMujeres
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}