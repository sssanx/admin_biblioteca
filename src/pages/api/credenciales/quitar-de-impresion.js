import db from '../../../lib/db';

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requerido' }), { status: 400 });
    }

    await db.query(`
      UPDATE credenciales
      SET en_hoja_impresion = FALSE
      WHERE id = $1
    `, [id]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al quitar:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
}
