// src/pages/api/registrar-visita.js
import db from '../../lib/db';

export async function post({ request }) {
  try {
    const data = await request.json();
    
    if (!data.recurso_id) {
      return new Response(JSON.stringify({ error: 'ID de recurso requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insertar en la base de datos
    await db.query(
      `INSERT INTO visitas_recursos (recurso_id) VALUES ($1)`,
      [data.recurso_id]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al registrar visita:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}