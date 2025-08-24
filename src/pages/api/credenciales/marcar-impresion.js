// src/pages/api/credenciales/marcar-impresion.js
import db from '../../../lib/db';

export async function POST({ request }) {
  try {
    const { credencialId } = await request.json();
    
    await db.query(`
      UPDATE credenciales
      SET pendiente_impresion = TRUE
      WHERE id = $1
    `, [credencialId]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al marcar para impresión:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}