import db from '../../lib/db.js'; // ajusta la ruta si es diferente

export async function GET() {
  try {
const result = await db.query(`
  SELECT libros.*, categorias.nombre AS categoria_nombre
  FROM libros
  LEFT JOIN categorias ON libros.categoria::integer = categorias.id
  ORDER BY libros.id DESC
`);

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error al obtener libros:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener libros' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
