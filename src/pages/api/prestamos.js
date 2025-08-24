// src/pages/api/prestamos.js
export const prerender = false;

import { db } from '../../lib/db.js';  // Importación corregida

export async function POST({ request }) {
  const client = await db.connect();

  try {
    /* ────────────────── 1. Datos del formulario ────────────────── */
    const form       = await request.formData();
    const libroId    = Number(form.get('libro_id'));
    const usuarioId  = Number(form.get('usuario_id'));
    const dias       = Number(form.get('duracion'));

    if (!libroId || !usuarioId || !dias || dias < 1) {
      return jsonError('Datos incompletos o inválidos', 400);
    }

    /* ────────────────── 2. Buscar ejemplar disponible ──────────── */
    const { rows: ejDisp } = await client.query(
      `SELECT id
         FROM ejemplares
        WHERE libro_id = $1
          AND estado = 'disponible'
        FOR UPDATE SKIP LOCKED
        LIMIT 1`,
      [libroId]
    );

    if (ejDisp.length === 0) {
      return jsonError('No hay ejemplares disponibles para este libro', 409);
    }

    const ejemplarId = ejDisp[0].id;

    /* ────────────────── 3. Fechas ──────────────────────────────── */
    const hoy   = new Date();
    const vence = new Date(hoy);
    vence.setDate(hoy.getDate() + dias);

    /* ────────────────── 4. Transacción ─────────────────────────── */
    await client.query('BEGIN');

    // 4a) insertar préstamo y obtener su id
    const { rows: prestamoRows } = await client.query(
      `INSERT INTO prestamos
         (usuario_id, libro_id, ejemplar_id,
          fecha_prestamo, fecha_devolucion_esperada, devuelto)
       VALUES ($1,$2,$3,$4,$5,false)
       RETURNING id`,
      [usuarioId, libroId, ejemplarId, hoy, vence]
    );
    const prestamoId = prestamoRows[0].id;

    // 4b) actualizar estado del ejemplar
    await client.query(
      `UPDATE ejemplares
          SET estado = 'prestado'
        WHERE id = $1`,
      [ejemplarId]
    );

    await client.query('COMMIT');

    /* ────────────────── 5. Respuesta JSON ──────────────────────── */
    return new Response(
      JSON.stringify({
        success: true,
        prestamo: { id: prestamoId }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error al registrar el préstamo:', err);
    return jsonError('Error interno del servidor', 500);
  } finally {
    client.release();
  }
}

/* util */
function jsonError(msg, status) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
