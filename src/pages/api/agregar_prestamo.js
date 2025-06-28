// src/pages/api/agregar_prestamo.js
import db from '../../../lib/db.js';

export async function POST({ request }) {
  const form = await request.formData();

  const usuario_id = form.get('usuario_id');
  const libro_id = form.get('libro_id');
  const fecha_prestamo = form.get('fecha_prestamo');
  const fecha_devolucion = form.get('fecha_devolucion') || null;

  if (!usuario_id || !libro_id || !fecha_prestamo) {
    return new Response('Datos faltantes', { status: 400 });
  }

  try {
    await db.none(
      `INSERT INTO prestamos (usuario_id, libro_id, fecha_prestamo, fecha_devolucion, devuelto)
       VALUES ($1, $2, $3, $4, false)`,
      [usuario_id, libro_id, fecha_prestamo, fecha_devolucion]
    );

    return new Response(null, {
      status: 303,
      headers: { Location: '/prestamos/listado' },
    });
  } catch (error) {
    console.error(error);
    return new Response('Error al guardar el préstamo', { status: 500 });
  }
}
