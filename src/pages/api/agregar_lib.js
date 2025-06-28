// src/pages/api/agregar_lib.js
export const prerender = false;

import db from '../../lib/db.js'; // ajusta la ruta según tu estructura

export async function POST({ request }) {
  const data = await request.formData();

  const titulo = data.get('titulo');
  const autor = data.get('autor');
  const anio = parseInt(data.get('anio'));
  const categoria = data.get('categoria');
  const isbn = data.get('isbn');
  const categoria_id = data.get('categoria_id');


  try {
    await db.query(
      'INSERT INTO libros (titulo, autor, anio, categoria, isbn,categoria_id ) VALUES ($1, $2, $3, $4, $5,$6)',
      [titulo, autor, anio, categoria, isbn,categoria_id ]
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Libro agregado correctamente.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error al agregar el libro.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
