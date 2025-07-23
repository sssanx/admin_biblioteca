// src/pages/api/credenciales/vaciar.js
import db from '../../../lib/db';

export async function POST() {
  try {
    await db.query(`
      UPDATE credenciales
      SET estado = 'INACTIVA'
      WHERE estado = 'ACTIVA'
    `);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al vaciar credenciales:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
