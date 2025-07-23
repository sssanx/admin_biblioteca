// src/routes/api/actualizar_lib/+server.js
import db from '../../lib/db.js';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const id = data.id;

    // Validación básica
    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'ID de libro inválido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Campos requeridos
    const requiredFields = ['titulo', 'autor', 'isbn', 'tipo_material_id'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Faltan campos requeridos: ${missingFields.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el tipo de material exista
    const tipoExists = await db.query(
      'SELECT 1 FROM tipos_material WHERE id = $1', 
      [data.tipo_material_id]
    );
    
    if (tipoExists.rowCount === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El tipo de material especificado no existe'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualización en la base de datos
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
        tipo_material_id = $10,
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
      data.tipo_material_id,
      id
    ]);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Libro no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Redirección con mensaje de éxito
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/libros?success=Libro actualizado correctamente'
      }
    });

  } catch (error) {
    console.error('Error en la API:', error);
    
    let errorMessage = 'Error interno del servidor';
    if (error.code === '23503') { // Violación de clave foránea
      errorMessage = 'El tipo de material especificado no existe';
    } else if (error.code === '42703') { // Columna no existe
      errorMessage = 'Error de configuración: Falta columna tipo_material_id en la tabla libros';
    }

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}