import db from '../../lib/db.js'; // Ajusta la ruta si es distinta

export async function POST({ request }) {
  try {
    // Verificar Content-Type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type debe ser application/json',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Leer body
    const { codigo } = await request.json();

    // Validar parámetro
    if (!codigo || typeof codigo !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parámetro "codigo" es requerido y debe ser una cadena',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Consulta a la base de datos
    const result = await db.query(
      `
      SELECT l.* FROM libros l
      LEFT JOIN ejemplares e ON e.libro_id = l.id
      WHERE l.isbn = $1 OR e.codigo_barras = $1
      LIMIT 1
      `,
      [codigo.trim()]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Libro no encontrado',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Éxito
    return new Response(
      JSON.stringify({ success: true, data: result.rows[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en API buscar-libro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        details:
          import.meta.env.MODE === 'development' ? error.message : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
