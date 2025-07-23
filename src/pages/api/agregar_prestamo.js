// src/pages/api/agregar_prestamo.js
import db from '../../../lib/db.js';

export async function POST({ request }) {
  const form = await request.formData();

  const usuario_id = parseInt(form.get('usuario_id'));
  const libro_id = parseInt(form.get('libro_id'));
  const fecha_prestamo = form.get('fecha_prestamo');
  const fecha_devolucion = form.get('fecha_devolucion') || null;

  if (!usuario_id || !libro_id || !fecha_prestamo) {
    return new Response('Datos faltantes o inválidos', { status: 400 });
  }

  try {
    // 1. Buscar un ejemplar disponible para el libro
    const { rows } = await db.query(
      `SELECT id FROM ejemplares WHERE libro_id = $1 AND estado = 'disponible' LIMIT 1`,
      [libro_id]
    );

    if (rows.length === 0) {
      return new Response('No hay ejemplares disponibles para este libro', { status: 409 });
    }

    const ejemplar_id = rows[0].id;

    // 2. Insertar el préstamo con el ejemplar asignado
    await db.query(
      `INSERT INTO prestamos (usuario_id, libro_id, ejemplar_id, fecha_prestamo, fecha_devolucion, devuelto)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [usuario_id, libro_id, ejemplar_id, fecha_prestamo, fecha_devolucion]
    );

    // 3. Actualizar estado del ejemplar a 'prestado'
    await db.query(
      `UPDATE ejemplares SET estado = 'prestado' WHERE id = $1`,
      [ejemplar_id]
    );

    // 4. Redirigir al listado de préstamos
    return new Response(null, {
      status: 303,
      headers: { Location: '/prestamos/' }
    });

  } catch (error) {
    console.error('Error al agregar préstamo:', error);
    return new Response('Error interno', { status: 500 });
  }
}
