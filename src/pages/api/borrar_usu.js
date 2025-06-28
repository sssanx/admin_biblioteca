import pool from '../../lib/db.js';

export const prerender = false;

export async function GET({ url }) {
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

   
   return new Response(null, {
  status: 302,
  headers: {
    Location: 'http://localhost:4321/usuarios', 
  },
});
  } catch (error) {
    console.error('ERROR SQL:', error); // 🔍 imprime el error en consola
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
