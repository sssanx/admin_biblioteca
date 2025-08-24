import { db } from '../../lib/db';
import { registrarActividad } from '../../lib/auth';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { email, password } = data;

    // Consultar usuario con verificación de admin (sin crypt para texto plano)
    const { rows } = await db.query(
      `SELECT id, nombre, correo, es_admin 
       FROM usuarios 
       WHERE correo = $1 AND contrasena = $2`,
      [email, password]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({
        error: 'Credenciales inválidas'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const usuario = rows[0];

    // Crear sesión
    const sessionToken = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await db.query(
      `INSERT INTO sesiones (usuario_id, token, expiracion)
       VALUES ($1, $2, $3)`,
      [usuario.id, sessionToken, sessionExpiry]
    );

    // Registrar actividad de login
    await registrarActividad(
      usuario.id,
      'LOGIN',
      { sistema: 'Panel administrativo' }
    );

    return new Response(JSON.stringify({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        es_admin: usuario.es_admin
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${sessionExpiry.toUTCString()}`
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
