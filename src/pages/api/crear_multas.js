import db from '../../lib/db';

const DIA_EN_MS = 24 * 60 * 60 * 1000;
const MULTA_DIARIA = 75;
const DURACION_PRESTAMO_DIAS = 7;

export async function post() {
  try {
    const prestamosVencidos = await db.query(`
      SELECT p.id, p.fecha_prestamo, p.usuario_id, p.libro_id
      FROM prestamos p
      WHERE NOT EXISTS (
        SELECT 1 FROM multas m WHERE m.id_prestamo = p.id
      )
    `);

    const hoy = new Date();
    for (const prestamo of prestamosVencidos.rows) {
      const fechaPrestamo = new Date(prestamo.fecha_prestamo);
      const fechaLimite = new Date(fechaPrestamo.getTime() + DURACION_PRESTAMO_DIAS * DIA_EN_MS);
      if (hoy > fechaLimite) {
        const dias_retraso = Math.max(Math.floor((hoy - fechaLimite) / DIA_EN_MS), 1);
        const monto = dias_retraso * MULTA_DIARIA;
        await db.query(`
          INSERT INTO multas (id_prestamo, libro_id, usuario_id, monto, dias_retraso, fecha_multa, estado)
          VALUES ($1, $2, $3, $4, $5, NOW(), 'pendiente')
        `, [prestamo.id, prestamo.libro_id, prestamo.usuario_id, monto, dias_retraso]);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Multas actualizadas correctamente.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Error al crear multas', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
