import db from '../../lib/db';
export const prerender = false;

export async function GET({ url }) {
  const id = url.searchParams.get('id');
  const { rows } = await db.query(`
    SELECT fecha_hora 
    FROM visitas 
    WHERE usuario_id = $1 
    ORDER BY fecha_hora DESC 
    LIMIT 30
  `, [id]);
  return new Response(JSON.stringify(rows), {
    headers: { 'Content-Type': 'application/json' },
  });
}
