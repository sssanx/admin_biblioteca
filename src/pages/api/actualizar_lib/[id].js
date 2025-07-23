// src/pages/api/actualizar_lib/[id].js
import db from '../../../lib/db.js';

export async function post({ params, request }) {
  const { id } = params;
  const formData = await request.formData();

  // Validar ID
  if (isNaN(id)) {
    return new Response(JSON.stringify({
      error: 'ID inválido'
    }), {
      status: 400
    });
  }

  try {
    // Convertir FormData a objeto
    const data = Object.fromEntries(formData);
    
    // Validar datos requeridos
    if (!data.titulo || !data.autor) {
      return new Response(JSON.stringify({
        error: 'Título y autor son requeridos'
      }), {
        status: 400
      });
    }

    // Actualizar en base de datos
    const result = await db.query(`
      UPDATE libros SET
        titulo = $1,
        autor = $2,
        anio = $3,
        clasificacion = $4,
        isbn = $5,
        editor = $6,
        paginas = $7,
        edicion = $8,
        ubicacion = $9,
        categoria_id = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [
      data.titulo,
      data.autor,
      data.anio || null,
      data.clasificacion || null,
      data.isbn,
      data.editor || null,
      data.paginas ? parseInt(data.paginas) : null,
      data.edicion || null,
      data.ubicacion || null,
      data.categoria_id,
      id
    ]);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({
        error: 'Libro no encontrado'
      }), {
        status: 404
      });
    }

    // Redireccionar después de actualizar
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/libros?success=updated'
      }
    });

  } catch (error) {
    console.error('Error al actualizar libro:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor'
    }), {
      status: 500
    });
  }
}