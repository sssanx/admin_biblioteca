import db from "../../../lib/db.js";

export async function POST({ request }) {
  const formData = await request.formData();
  const id = formData.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "ID de multa requerido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fechaPago = new Date().toISOString();

  try {
    const result = await db.query(
      `UPDATE multas SET estado = 'pagada', fecha_pago = $1 WHERE id = $2`,
      [fechaPago, id]
    );

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "Multa no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Redirigir de vuelta a la página de multas para refrescar vista
    return new Response(null, {
      status: 303,
      headers: { Location: "/multa" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
