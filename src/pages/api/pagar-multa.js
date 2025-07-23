import db from "../../lib/db.js";

export async function post({ request }) {
  const formData = await request.formData();
  const id_prestamo = formData.get("id"); // <-- cambiar aquí

  if (!id_prestamo) {
    return new Response("Falta id_prestamo", { status: 400 });
  }

  // Actualizar multa a pagada y fecha_pago
  await db.query(`
    UPDATE multas
    SET estado = 'pagada', fecha_pago = NOW()
    WHERE usuario_id = (SELECT usuario_id FROM prestamos WHERE id = $1)
      AND libro_id = (SELECT libro_id FROM prestamos WHERE id = $1)
      AND estado = 'pendiente'
  `, [id_prestamo]);

  // Actualizar préstamo: marcar como devuelto hoy
  await db.query(`
    UPDATE prestamos
    SET fecha_devolucion = NOW()
    WHERE id = $1
  `, [id_prestamo]);

  // Redirigir a página de préstamos (o multas, según tu ruta)
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/libros/prestamos"
    }
  });
}
