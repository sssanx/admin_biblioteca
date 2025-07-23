import db from "../../lib/db";

export async function POST() {
  try {
    await db.query("DELETE FROM multas");
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/multa" // Cambia esta ruta por la que tengas para listar multas
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Error al eliminar multas.", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
