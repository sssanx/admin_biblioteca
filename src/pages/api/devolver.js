export const prerender = false;

import db from "../../lib/db.js";

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const idPrestamo = parseInt(form.get("id_prestamo"));

    // Obtener ID del libro para volverlo disponible
    const { rows } = await db.query("SELECT id_libro FROM prestamos WHERE id = $1", [idPrestamo]);
    const idLibro = rows[0]?.id_libro;

    if (!idLibro) {
      return new Response("Préstamo no encontrado", { status: 404 });
    }

    // Primero verifica si hay multa asociada
    const multa = await db.query("SELECT id FROM multas WHERE id_prestamo = $1", [idPrestamo]);

    // Si existe multa, elimina primero la multa
    if (multa.rows.length > 0) {
      await db.query("DELETE FROM multas WHERE id_prestamo = $1", [idPrestamo]);
    }

    // Eliminar el préstamo
    await db.query("DELETE FROM prestamos WHERE id = $1", [idPrestamo]);

    // Marcar libro como disponible
    await db.query("UPDATE libros SET disponible = true WHERE id = $1", [idLibro]);

    // Redirigir a una ruta válida que sí existe
    return new Response(null, {
      status: 302,
      headers: { Location: "/libros/prestamos" }, // ← ruta válida confirmada por tus logs
    });

  } catch (error) {
    console.error("Error al devolver libro:", error);
    return new Response("Error interno", { status: 500 });
  }
}
