import db from '../../../lib/db';

export async function POST({ request, url }) {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('ID no proporcionado', { status: 400 });
    }

    // Eliminar recurso
    await db.query('DELETE FROM recursos_digitales WHERE id = $1', [id]);

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/biblioteca', // Ajusta esta ruta según tu ruta admin real
      },
    });
  } catch (error) {
    console.error('Error eliminando recurso:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
}
