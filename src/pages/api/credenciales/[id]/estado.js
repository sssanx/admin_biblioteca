import db from '../../../../lib/db';

export async function post({ params, request }) {
  const { id } = params;
  const { estado } = await request.json();

  try {
    // Validar estado
    const estadosPermitidos = ['ACTIVA', 'INACTIVA', 'BLOQUEADA', 'VENCIDA', 'PERDIDA'];
    if (!estadosPermitidos.includes(estado)) {
      return new Response(
        JSON.stringify({ error: 'Estado no válido' }),
        { status: 400 }
      );
    }

    // Actualizar estado
    const { rows } = await db.query(
      `UPDATE credenciales SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, id]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Credencial no encontrada' }),
        { status: 404 }
      );
    }

    // Registrar movimiento
    await db.query(
      `INSERT INTO movimientos_credencial 
       (credencial_id, tipo, descripcion)
       VALUES ($1, 'CAMBIO_ESTADO', $2)`,
      [id, `Estado cambiado a ${estado}`]
    );

    return new Response(
      JSON.stringify({ success: true, credencial: rows[0] }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}