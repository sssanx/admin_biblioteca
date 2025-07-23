// src/lib/actualizar_marc.js
import { getClient } from './db.js';

export async function actualizarMarc(formData) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const campos = {
      titulo: formData.get('245_a')?.toString().trim() || null,
      subtitulo: formData.get('245_b')?.toString().trim() || null,
      autor: formData.get('100_a')?.toString().trim() || null,
      editorial: formData.get('260_b')?.toString().trim() || null,
      lugar_publicacion: formData.get('260_a')?.toString().trim() || null,
      anio: formData.get('260_c')?.toString().trim() || null,
      isbn: formData.get('020_a')?.toString().trim() || null,
      paginas: parseInt(formData.get('300_a')?.toString().replace(/\D/g, '')) || null,
      edicion: formData.get('250_a')?.toString().trim() || null,
      ubicacion: formData.get('852_b')?.toString().trim() || null,
      clasificacion: formData.get('650_a')?.toString().trim() || null,
      id: formData.get('libro_id')
    };

    console.log('Datos a actualizar:', campos);

    const result = await client.query(
      `UPDATE libros SET
        titulo = $1,
        subtitulo = $2,
        autor = $3,
        editorial = $4,
        lugar_publicacion = $5,
        anio = $6,
        isbn = $7,
        paginas = $8,
        edicion = $9,
        ubicacion = $10,
        clasificacion = $11
      WHERE id = $12
      RETURNING *`,
      [
        campos.titulo,
        campos.subtitulo,
        campos.autor,
        campos.editorial,
        campos.lugar_publicacion,
        campos.anio,
        campos.isbn,
        campos.paginas,
        campos.edicion,
        campos.ubicacion,
        campos.clasificacion,
        campos.id
      ]
    );

    await client.query('COMMIT');
    return { success: true, data: result.rows[0] };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en actualizarMarc:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}