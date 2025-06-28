// src/pages/api/libros/actualizar.js
import { db } from '../../../lib/db';

export async function post({ request }) {
  const formData = await request.formData();
  
  // Implementación segura de actualización
  try {
    const updateQuery = `
      UPDATE libros SET
        titulo = $1,
        autor = $2,
        editorial = $3,
        anio = $4,
        isbn = $5,
        categoria_id = $6,
        disponible = $7
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [
      formData.get('titulo'),
      formData.get('autor'),
      formData.get('editorial'),
      formData.get('anio'),
      formData.get('isbn'),
      formData.get('categoria_id'),
      formData.get('disponible') === 'on' ? true : false,
      formData.get('id')
    ]);
    
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/libros?success=updated'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}