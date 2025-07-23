import db from '../../lib/db.js';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'generar_multas_vencidas') {
      // Obtener préstamos vencidos y sin devolución
      const { rows: prestamosVencidos } = await db.query(`
        SELECT p.id, p.usuario_id, p.libro_id, p.fecha_devolucion_esperada,
               NOW()::date - p.fecha_devolucion_esperada::date AS dias_retraso
        FROM prestamos p
        WHERE p.fecha_devolucion IS NULL
          AND p.fecha_devolucion_esperada < NOW()
          AND NOT EXISTS (
            SELECT 1 FROM multas m WHERE m.id_prestamo = p.id
          )
      `);

      // Multa base
      const multaBase = 75;

      // Insertar multas para cada préstamo vencido
      for (const prestamo of prestamosVencidos) {
        const diasRetraso = parseInt(prestamo.dias_retraso) || 0;
        const monto = multaBase * (1 + diasRetraso);

        await db.query(
          `INSERT INTO multas (id_prestamo, usuario_id, libro_id, monto, dias_retraso, fecha_multa, estado)
           VALUES ($1, $2, $3, $4, $5, NOW(), 'pendiente')`,
          [prestamo.id, prestamo.usuario_id, prestamo.libro_id, monto, diasRetraso]
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Multas generadas correctamente.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Acción no válida.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Error generando multas.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
