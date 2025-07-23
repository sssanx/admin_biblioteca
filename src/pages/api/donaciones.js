import db from '../../lib/db.js';  // Ajusta la ruta si es necesario

export async function post({ request }) {
  try {
    const data = await request.json();
    const { donante, items, usuarioRegistroId } = data;

    let donanteId;

    if (donante.usuario_id) {
      const result = await db.query(
        `INSERT INTO donantes(nombre, tipo, identificacion, correo, telefono, usuario_id) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [donante.nombre, donante.tipo, donante.identificacion, donante.correo, donante.telefono, donante.usuario_id]
      );
      donanteId = result.rows[0].id;
    } else {
      const result = await db.query(
        `INSERT INTO donantes(nombre, tipo, identificacion, correo, telefono) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [donante.nombre, donante.tipo, donante.identificacion, donante.correo, donante.telefono]
      );
      donanteId = result.rows[0].id;
    }

    const donacionResult = await db.query(
      `INSERT INTO donaciones(donante_id, tipo_material, estado, observaciones, usuario_registro) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [donanteId, 'Libro', 'Recibido', '', usuarioRegistroId]
    );

    const donacionId = donacionResult.rows[0].id;

    for (const item of items) {
      await db.query(
        `INSERT INTO items_donacion(donacion_id, titulo, autor, editorial, anio_publicacion, isbn, cantidad, descripcion) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [donacionId, item.titulo, item.autor, item.editorial, item.anio, item.isbn, item.cantidad, item.descripcion]
      );
    }

    return new Response(JSON.stringify({ success: true, donacionId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
