export const prerender = false;

import db from '../../lib/db';

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const id_libro = parseInt(form.get("id_libro"));
    const id_usuario = parseInt(form.get("id_usuario"));
    const dias = parseInt(form.get("duracion"));

    if (!id_libro || !id_usuario || !dias || dias < 1) {
      return new Response("Datos incompletos o inválidos", { status: 400 });
    }

    const ahora = new Date();
    const fechaDevolucion = new Date(ahora);
    fechaDevolucion.setDate(fechaDevolucion.getDate() + dias);

    await db.query(
      `INSERT INTO prestamos (id_libro, id_usuario, fecha_prestamo, fecha_devolucion_esperada)
       VALUES ($1, $2, CURRENT_DATE, $3)`,
      [id_libro, id_usuario, fechaDevolucion]
    );

    return new Response(null, {
      status: 303,
      headers: { Location: `/libros/prestamos` }, 
    });
  } catch (err) {
    console.error("Error al registrar el préstamo:", err);
    return new Response("Error interno", { status: 500 });
  }
}
