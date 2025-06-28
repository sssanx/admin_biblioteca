export const prerender = false;

import db from '../../lib/db.js';

export async function PUT({ request }) {
  try {
    // Verificar que el contenido sea JSON
    if (request.headers.get('content-type') !== 'application/json') {
      return new Response(JSON.stringify({ 
        error: 'Content-Type debe ser application/json' 
      }), { status: 415 });
    }

    const data = await request.json();
    console.log('Datos recibidos en backend:', JSON.stringify(data));

    // Validación robusta
    const errors = [];
    if (!data?.id) errors.push('El ID es requerido');
    if (!data?.nombre?.trim()) errors.push('El nombre es requerido');
    if (!data?.correo?.trim()) errors.push('El correo es requerido');
    
    if (errors.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Datos incompletos',
        detalles: errors,
        datosRecibidos: data
      }), { status: 400 });
    }

    // Actualización en base de datos
    const result = await db.query(
      `UPDATE usuarios SET 
        nombre = $1, 
        correo = $2,
        updated_at = NOW()
       WHERE id = $3 
       RETURNING id, nombre, correo, rol`,
      [data.nombre.trim(), data.correo.trim(), data.id]
    );

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ 
        error: 'Usuario no encontrado' 
      }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      usuario: result.rows[0],
      mensaje: 'Usuario actualizado correctamente'
    }), { status: 200 });

  } catch (error) {
    console.error('Error completo:', error);
    return new Response(JSON.stringify({ 
      error: 'Error en el servidor',
      detalle: error.message
    }), { status: 500 });
  }
}