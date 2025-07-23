// src/pages/api/multas.js

import db from "../../lib/db";

export async function POST({ request }) {
  const formData = await request.formData();
  const action = formData.get("action");
  const id_prestamo = formData.get("id_prestamo");

  let message = "";
  let error = "";

  if (!id_prestamo) {
    return new Response(
      JSON.stringify({ success: false, error: "Falta el id_prestamo." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (action === "generar") {
    // Verificar si ya hay multa pendiente
    const multaExistente = await db.query(
      `SELECT id FROM multas WHERE id_prestamo = $1 AND estado = 'pendiente'`,
      [id_prestamo]
    );

    if (multaExistente.rowCount > 0) {
      error = "Ya existe una multa pendiente para este préstamo.";
    } else {
      // Traer préstamo con usuario y libro
      const prestamoRes = await db.query(
        `SELECT fecha_devolucion_esperada, id_usuario, id_libro
         FROM prestamos
         WHERE id = $1`,
        [id_prestamo]
      );

      if (prestamoRes.rowCount === 0) {
        error = "Préstamo no encontrado.";
      } else {
        const { fecha_devolucion_esperada, id_usuario, id_libro } = prestamoRes.rows[0];

        if (!id_usuario) {
          error = "El préstamo no tiene un usuario asociado.";
        } else {
          const hoy = new Date();
          const fechaLimite = new Date(fecha_devolucion_esperada);

          if (hoy <= fechaLimite) {
            error = "El préstamo no está vencido. No se puede generar multa.";
          } else {
            // Calcular días de retraso
            const diffMs = hoy - fechaLimite;
            const dias_retraso = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 1);

            // Monto base + penalización por día
            const montoInicial = 50 + dias_retraso * 10;

            // Insertar multa
            await db.query(
              `INSERT INTO multas 
              (id_prestamo, libro_id, usuario_id, monto, dias_retraso, fecha_multa, estado)
              VALUES
              ($1, $2, $3, $4, $5, NOW(), 'pendiente')`,
              [id_prestamo, id_libro, id_usuario, montoInicial, dias_retraso]
            );

            message = `Multa generada correctamente con un monto de $${montoInicial}.`;
          }
        }
      }
    }
  } else if (action === "pagar") {
    // Obtener multa pendiente
    const multaRes = await db.query(
      `SELECT id, monto, fecha_multa
       FROM multas
       WHERE id_prestamo = $1 AND estado = 'pendiente'`,
      [id_prestamo]
    );

    if (multaRes.rowCount === 0) {
      error = "Multa no encontrada o ya pagada.";
    } else {
      const multa = multaRes.rows[0];
      const fechaCreacion = new Date(multa.fecha_multa);
      const hoy = new Date();

      const diffMs = hoy - fechaCreacion;
      const diasExtra = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0);
      const aumento = diasExtra * 10;
      const montoFinal = multa.monto + aumento;

      // Marcar multa como pagada
      await db.query(
        `UPDATE multas
         SET estado = 'pagada',
             fecha_pago = NOW(),
             monto = $1
         WHERE id = $2`,
        [montoFinal, multa.id]
      );

      // Marcar préstamo como devuelto si no tiene fecha_devolucion
      await db.query(
        `UPDATE prestamos
         SET fecha_devolucion = NOW()
         WHERE id = $1 AND fecha_devolucion IS NULL`,
        [id_prestamo]
      );

      message = `Multa pagada correctamente. Monto final: $${montoFinal}. Préstamo marcado como devuelto.`;
    }
  } else {
    error = "Acción no reconocida.";
  }

  return new Response(
    JSON.stringify({ success: !error, message, error }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
