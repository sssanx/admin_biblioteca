// src/pages/api/eliminar_usuario.js
import pool from '../../../lib/db';

export const prerender = false;

export async function POST({ request }) {
  console.log('Iniciando proceso de eliminación de usuario'); // Debug

  try {
    // 1. Verificar que sea una petición JSON
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('El contenido debe ser JSON', { status: 415 });
    }

    // 2. Parsear el cuerpo de la petición
    const data = await request.json();
    console.log('Datos recibidos:', data); // Debug

    if (!data || !data.id) {
      throw new Error('Se requiere el ID del usuario', { status: 400 });
    }

    const { id } = data;

    // 3. Conectar a la base de datos
    const client = await pool.connect();
    console.log('Conexión a la base de datos establecida'); // Debug

    try {
      // 4. Verificar que el usuario existe
      const checkQuery = 'SELECT id FROM usuarios WHERE id = $1';
      const checkResult = await client.query(checkQuery, [id]);
      
      if (checkResult.rowCount === 0) {
        throw new Error(`Usuario con ID ${id} no encontrado`, { status: 404 });
      }

      // 5. Eliminar el usuario
      const deleteQuery = 'DELETE FROM usuarios WHERE id = $1 RETURNING *';
      const deleteResult = await client.query(deleteQuery, [id]);
      
      console.log('Resultado de eliminación:', deleteResult.rows[0]); // Debug

      // 6. Retornar respuesta exitosa
      return new Response(JSON.stringify({
        success: true,
        deletedUser: deleteResult.rows[0],
        message: `Usuario con ID ${id} eliminado correctamente`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } finally {
      // 7. Liberar la conexión a la base de datos
      client.release();
      console.log('Conexión a la base de datos liberada'); // Debug
    }

  } catch (error) {
    console.error('Error al eliminar usuario:', error.message); // Debug
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}