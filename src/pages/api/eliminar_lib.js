import db from '../../lib/db.js';

// Usa export async function GET() en lugar de export async function get()
export async function GET({ params, request }) {
  try {
    // Obtener ID de la URL (para formato /api/eliminar_lib/5)
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    // O alternativamente si prefieres query string (?id=5)
    // const id = url.searchParams.get('id');

    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de libro no válido'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Verificar si el libro existe
    const checkResult = await db.query('SELECT * FROM libros WHERE id = $1', [id]);
    if (checkResult.rowCount === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Libro no encontrado'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Eliminar el libro
    await db.query('DELETE FROM libros WHERE id = $1', [id]);

    // Redireccionar
    return new Response(null, {
      status: 303,
      headers: {
        'Location': '/libros'
      }
    });

  } catch (error) {
    console.error('Error al eliminar libro:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}