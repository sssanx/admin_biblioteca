// src/pages/api/renovar-prestamo.js
export const prerender = false;

import { db } from '../../lib/db.js';

export async function POST({ request }) {
  const client = await db.connect();

  try {
    const data = await request.json();
    console.log('Datos recibidos:', data);

    const prestamoId = Number(data.id_prestamo);
    const dias = Number(data.dias_extra);

    if (!prestamoId || !dias || dias < 1) {
      return jsonError('Datos incompletos o inválidos', 400);
    }

    const { rows: prestamos } = await client.query(
      `SELECT fecha_devolucion_esperada, devuelto FROM prestamos WHERE id = $1`,
      [prestamoId]
    );

    if (prestamos.length === 0) {
      return jsonError('Préstamo no encontrado', 404);
    }

    const prestamo = prestamos[0];

    if (prestamo.devuelto) {
      return jsonError('El préstamo ya fue devuelto, no se puede renovar', 409);
    }

    const fechaActual = new Date();
    const fechaVencimientoActual = new Date(prestamo.fecha_devolucion_esperada);
    const nuevaFechaVencimiento = fechaVencimientoActual > fechaActual ? fechaVencimientoActual : fechaActual;
    nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + dias);

    await client.query(
      `UPDATE prestamos SET fecha_devolucion_esperada = $1 WHERE id = $2`,
      [nuevaFechaVencimiento, prestamoId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        nueva_fecha_devolucion: nuevaFechaVencimiento.toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error al renovar el préstamo:', err);
    return jsonError('Error interno del servidor', 500);
  } finally {
    client.release();
  }
}

function jsonError(msg, status) {
  return new Response(
    JSON.stringify({ success: false, error: msg }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
