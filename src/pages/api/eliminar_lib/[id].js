import db from '../../../lib/db.js';

export const prerender = false;

export async function GET({ params }) {
  try {
    // Extraer el ID correctamente
    const { id } = params;
    const idNumero = parseInt(id);

    // Validar que sea un número
    if (isNaN(idNumero)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID debe ser un número'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar existencia del libro
    const existe = await db.query('SELECT 1 FROM libros WHERE id = $1', [idNumero]);
    if (existe.rows.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Libro no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Eliminar el libro
    await db.query('DELETE FROM libros WHERE id = $1', [idNumero]);

    // Redireccionar con JavaScript
    return new Response(
      `<script>window.location.href = "/libros";</script>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );

  } catch (error) {
    console.error('Error en la API:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}