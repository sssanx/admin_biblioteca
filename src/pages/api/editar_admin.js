import db from '../../lib/db.js';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre');
    const email = formData.get('email');
    const password = formData.get('password');
    const correo_original = formData.get('correo_original');

    // Validaciones básicas
    if (!nombre || !email) {
      return new Response(
        JSON.stringify({ error: 'Nombre y correo son requeridos' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar si el usuario es administrador
    const userCheck = await db.query(
      `SELECT id FROM usuarios WHERE correo = $1 AND es_admin = true`,
      [correo_original]
    );

    if (userCheck.rowCount === 0) {
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para esta acción' }),
        { status: 403 }
      );
    }

    // Actualizar en la base de datos
    if (password) {
      // Con nueva contraseña (usando pgcrypto)
      await db.query(
        `UPDATE usuarios SET 
         nombre = $1, 
         correo = $2,
         contrasena = crypt($3, gen_salt('bf')),
         updated_at = NOW()
         WHERE correo = $4 AND es_admin = true`,
        [nombre, email, password, correo_original]
      );
    } else {
      // Sin nueva contraseña
      await db.query(
        `UPDATE usuarios SET 
         nombre = $1, 
         correo = $2,
         updated_at = NOW()
         WHERE correo = $3 AND es_admin = true`,
        [nombre, email, correo_original]
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Perfil actualizado correctamente'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
    // Manejo específico para error de pgcrypto
    if (error.message.includes('gen_salt')) {
      return new Response(
        JSON.stringify({ 
          error: 'Error de configuración del servidor',
          details: 'La extensión pgcrypto no está habilitada en la base de datos'
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Error al actualizar el perfil',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}