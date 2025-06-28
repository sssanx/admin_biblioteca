import db from '../../lib/db.js';

export async function POST({ request }) {
  const data = await request.json();
  const {
    id_prestamo,
    usuario_id,
    libro_id,
    monto,
    dias_retraso,
    observaciones = ''
  } = data;

  if (!id_prestamo || !usuario_id || !libro_id || !monto || !dias_retraso) {
    return new Response(JSON.stringify({ error: 'Faltan datos obligatorios' }), { status: 400 });
  }

  try {
    await db.query(`
      INSERT INTO multas (
        id_prestamo, usuario_id, libro_id, monto, dias_retraso, fecha_multa, estado, observaciones
      ) VALUES ($1, $2, $3, $4, $5, NOW(), 'pendiente', $6)
    `, [id_prestamo, usuario_id, libro_id, monto, dias_retraso, observaciones]);

    return new Response(JSON.stringify({ message: 'Multa creada correctamente' }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error al crear multa' }), { status: 500 });
  }
}
