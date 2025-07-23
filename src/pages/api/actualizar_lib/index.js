// src/pages/api/actualizar_lib/index.js
import db from '../../../lib/db';

export async function post({ request }) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const id = data.id;

    // Validación de datos
    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de libro inválido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Campos requeridos
    const requiredFields = ['titulo', 'autor', 'isbn'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Construcción dinámica de la consulta
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    Object.entries({
      titulo: data.titulo,
      autor: data.autor,
      anio: data.anio || null,
      clasificacion: data.clasificacion || null,
      isbn: data.isbn,
      editor: data.editor || null,
      paginas: data.paginas ? parseInt(data.paginas) : null,
      edicion: data.edicion || null,
      ubicacion: data.ubicacion || null,
      categoria_id: data.categoria_id
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fieldsToUpdate.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    values.push(id); // Añadir ID al final para el WHERE

    const query = `
      UPDATE libros 
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    // Ejecutar consulta
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Libro no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Redirección exitosa
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/libros?success=Libro actualizado correctamente'
      }
    });

  } catch (error) {
    console.error('Error al actualizar libro:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}