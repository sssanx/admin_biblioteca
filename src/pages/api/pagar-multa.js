import db from "../../lib/db.js";

export async function POST({ request }) {
  const formData = await request.formData();
  const idMulta = formData.get("id_multa");

  try {
    await db.query(
      `UPDATE multas 
       SET estado = 'pagada',
           fecha_pago = NOW()
       WHERE id = $1`,
      [idMulta]
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/libros/multas",
      },
    });
  } catch (err) {
    console.error("Error al marcar como pagada:", err);
    return new Response("Error al marcar como pagada", { status: 500 });
  }
}
