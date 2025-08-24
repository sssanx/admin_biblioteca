import db from '../../lib/db.js';

export async function PUT({ request }) {
  try {
    if (request.headers.get('content-type') !== 'application/json') {
      return new Response(
        JSON.stringify({ error: 'Content-Type debe ser application/json' }),
        { status: 415 }
      );
    }

    const data = await request.json();
    console.log('Datos recibidos en backend:', JSON.stringify(data));

    const errors = [];
    if (!data?.id) errors.push('El ID es requerido');
    if (!data?.nombre?.trim()) errors.push('El nombre es requerido');
    if (!data?.correo?.trim()) errors.push('El correo es requerido');
    if (!data?.rol?.trim()) errors.push('El rol es requerido');
    if (!data?.matricula?.trim()) errors.push('La matrícula es requerida');

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos', detalles: errors, datosRecibidos: data }),
        { status: 400 }
      );
    }

    const vigenciaIndef = data.vigencia_indefinida === true || data.vigencia_indefinida === 'true';

    const result = await db.query(
      `UPDATE usuarios SET 
         nombre = $1, 
         correo = $2,
         rol = $3,
         matricula = $4,
         carrera_id = $5,
         id_cuatrimestre = $6,
         vigencia = $7,
         vigencia_indefinida = $8,
         updated_at = NOW()
       WHERE id = $9
       RETURNING id, nombre, correo, rol, matricula, carrera_id, id_cuatrimestre, vigencia, vigencia_indefinida`,
      [
        data.nombre.trim(),
        data.correo.trim(),
        data.rol.trim(),
        data.matricula.trim(),
        data.carrera_id || null,
        data.cuatrimestres || null,  // esto viene del form
        data.vigencia || null,
        vigenciaIndef,
        data.id,
      ]
    );

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        usuario: result.rows[0],
        mensaje: 'Usuario actualizado correctamente',
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error completo:', error);
    return new Response(
      JSON.stringify({ error: 'Error en el servidor', detalle: error.message }),
      { status: 500 }
    );
  }
}
