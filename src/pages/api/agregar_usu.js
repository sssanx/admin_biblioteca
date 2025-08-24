import { query } from '../../lib/db';

export async function POST({ request }) {
  try {
    const formData = await request.formData();

    // Obtener valores del formulario
    const vigenciaIndefinida = formData.get('vigencia_indefinida') === 'on';
    const fechaVigencia = formData.get('vigencia');
    const genero = formData.get('genero') || null;
    const idCuatrimestre = formData.get('id_cuatrimestre') || null;  // ✅ Nombre corregido

    if (!vigenciaIndefinida && !fechaVigencia) {
      throw new Error('Debes especificar una fecha de vigencia cuando no es indefinida');
    }

    // Preparar los datos para insertar
    const userData = {
      nombre: formData.get('nombre'),
      correo: formData.get('correo'),
      rol: formData.get('rol'),
      matricula: formData.get('matricula'),
      carrera_id: formData.get('carrera_id') || null,
      id_cuatrimestre: idCuatrimestre,
      vigencia: vigenciaIndefinida ? null : fechaVigencia,
      vigencia_indefinida: vigenciaIndefinida,
      genero: genero
    };

    console.log('📥 Datos recibidos del formulario:', userData); // 🔍 Debug

    const sql = `
      INSERT INTO usuarios (
        nombre, 
        correo, 
        rol, 
        matricula, 
        carrera_id, 
        id_cuatrimestre,
        vigencia,
        vigencia_indefinida,
        genero
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const params = [
      userData.nombre,
      userData.correo,
      userData.rol,
      userData.matricula,
      userData.carrera_id,
      userData.id_cuatrimestre,
      userData.vigencia,
      userData.vigencia_indefinida,
      userData.genero
    ];

    const result = await query(sql, params);

    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Error al agregar usuario:', error);

    let errorMessage = 'Error al agregar usuario';
    if (error.constraint === 'chk_vigencia_coherente') {
      errorMessage = 'Los datos de vigencia no son coherentes. Debe ser indefinida o tener fecha.';
    } else if (error.message.includes('fecha de vigencia')) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
