import db from '../../../../lib/db';

export async function POST({ params }) {
  const { id } = params;
  await db.query(`UPDATE credenciales SET estado = 'INACTIVA' WHERE id = $1`, [id]);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
