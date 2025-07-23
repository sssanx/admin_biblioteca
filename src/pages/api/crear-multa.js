import db from "../../lib/db";

export async function post({ request }) {
  const formData = await request.formData();
  const idPrestamo = formData.get("id_prestamo");

  // Obtener los datos del préstamo
  const result = await db.query(`
    SELECT p.id, p.fecha_devolucion_esperada, l.id AS libro_id, u.id AS usuario_id
    FROM prestamos p
    JOIN libros l ON p.id_libro = l.id
    JOIN usuarios u ON p.id_usuario = u.id
    WHERE p.id = $1
  `, [idPrestamo]);

  const prestamo = result.rows[0];

  if (!prestamo) {
    return new Response("Préstamo no encontrado", { status: 404 });
  }

  const fechaEsperada = new Date(prestamo.fecha_devolucion_esperada);
  const hoy = new Date();
  const diasRetraso = Math.max(0, Math.floor((hoy - fechaEsperada) / (1000 * 60 * 60 * 24)));
  const monto = diasRetraso * 0.50; // Por ejemplo, 0.50€ por día de retraso

  // Insertar multa
  await db.query(`
    INSERT INTO multas (usuario_id, libro_id, monto, dias_retraso, fecha_multa, estado)
    VALUES ($1, $2, $3, $4, NOW(), 'pendiente')
  `, [prestamo.usuario_id, prestamo.libro_id, monto, diasRetraso]);

  // Redirigir a la página de multas
  return Response.redirect("/libros/multas", 303);
}
