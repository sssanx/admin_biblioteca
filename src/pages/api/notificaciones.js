import db from '../../lib/db.js';

export async function GET() {
  const client = await db.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, tipo, detalles, fecha
      FROM notificaciones
      ORDER BY fecha DESC
      LIMIT 10
    `);
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    return new Response('Error en notificaciones', { status: 500 });
  } finally {
    client.release();
  }
}
