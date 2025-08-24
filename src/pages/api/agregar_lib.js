import { db } from '../../lib/db.js';
import { generarMARC } from '../../lib/marc.js';

export const prerender = false;

export async function POST({ request }) {
  let data;

  const contentType = request.headers.get('content-type');

  // Soporta JSON o FormData
  if (contentType && contentType.includes('application/json')) {
    data = await request.json();
  } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    data = Object.fromEntries(formData.entries());
  } else {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Formato de datos no soportado. Usa JSON o FormData.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Conversión segura de campos numéricos
    const anio = parseInt(data.anio) || 0;
    const tipoMaterialId = parseInt(data.tipo_material_id) || 1;
    const paginas = parseInt(data.paginas) || 0;

    // Inserción en la base de datos (sin comentarios en el SQL)
    await db.query(
      `INSERT INTO libros (
        titulo,
        autor,
        anio,
        tipo_material_id,
        isbn,
        clasificacion,
        editor,
        paginas,
        edicion,
        ubicacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )`,
      [
        data.titulo || 'Sin título',
        data.autor || 'Desconocido',
        anio,
        tipoMaterialId,
        data.isbn || '',
        data.clasificacion || 'ND',
        data.editor || '',
        paginas,
        data.edicion || '1ra',
        data.ubicacion || 'General'
      ]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Libro agregado correctamente.',
        marc: generarMARC(data)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error al agregar el libro.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}