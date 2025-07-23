// src/pages/api/agregar-ejemplar.js
import db from '../../lib/db';

export async function post({ request }) {
  const formData = await request.formData();
  
  const libro_id = formData.get('libro_id');
  const inventario = formData.get('inventario');
  const codigo_barras = formData.get('codigo_barras');
  const estado = formData.get('estado');
  const ubicacion_fisica = formData.get('ubicacion_fisica');

  // Validaciones básicas
  if (!libro_id || !inventario || !estado) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Faltan campos requeridos'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Verificar si ya existe un ejemplar con el mismo número de inventario
    const existe = await db.query(
      'SELECT id FROM ejemplares WHERE numero_inventario = $1',
      [inventario]
    );

    if (existe.rows.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Ya existe un ejemplar con este número de inventario'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Insertar el nuevo ejemplar
    await db.query(`
      INSERT INTO ejemplares 
        (libro_id, numero_inventario, codigo_barras, estado, ubicacion_fisica, fecha_registro)
      VALUES 
        ($1, $2, $3, $4, $5, NOW())
    `, [libro_id, inventario, codigo_barras, estado, ubicacion_fisica]);

    // Redirigir de vuelta a la página del libro
    return new Response(null, {
      status: 303,
      headers: {
        'Location': `/libros/etiquetas/${libro_id}`
      }
    });
    
  } catch (error) {
    console.error('Error al agregar ejemplar:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al agregar el ejemplar'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}