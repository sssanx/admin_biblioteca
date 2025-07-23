export const prerender = false;
import db from '../../lib/db.js';

export async function POST({ request }) {
  const client = await db.connect();
  try {
    const form = await request.formData();
    const idPrestamo = Number(form.get('id_prestamo'));

    /* 1 . Obtener el ejemplar asociado y comprobar que siga activo */
    const { rows } = await client.query(
      `SELECT ejemplar_id
         FROM prestamos
        WHERE id        = $1
          AND devuelto  = false`,
      [idPrestamo]
    );
    if (rows.length === 0) {
      return new Response('Préstamo no encontrado', { status: 404 });
    }
    const ejemplarId = rows[0].ejemplar_id;

    /* 2 . Transacción */
    await client.query('BEGIN');

    // 2 a) Marcar préstamo como devuelto
    await client.query(
      `UPDATE prestamos
          SET devuelto        = true,
              fecha_devolucion = NOW()
        WHERE id = $1`,
      [idPrestamo]
    );

    // 2 b) Liberar el ejemplar
    await client.query(
      `UPDATE ejemplares
          SET estado = 'disponible'
        WHERE id = $1`,
      [ejemplarId]
    );

    // 2 c) Si hubiera multa pendiente, la eliminamos
    await client.query(
      `DELETE FROM multas
        WHERE id_prestamo = $1`,
      [idPrestamo]
    );

    await client.query('COMMIT');

    /* 3 . Redirigir al listado de préstamos */
    return new Response(null, {
      status: 303,
      headers: { Location: '/libros/prestamos' }   // ← tu vista de préstamos
    });

  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Error al devolver:', err);
    return new Response('Error interno', { status: 500 });
  } finally {
    client.release();
  }
}
