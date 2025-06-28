import db from '../../lib/db.js';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        usuarios.id, 
        usuarios.nombre, 
        usuarios.correo, 
        usuarios.matricula, 
        carreras.nombre AS carrera
      FROM usuarios
      LEFT JOIN carreras ON usuarios.carrera_id = carreras.id
    `);

    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error en la API de usuarios:', err);
    return new Response(JSON.stringify({ error: 'Error en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
