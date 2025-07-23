export const prerender = false;

import db from '../../lib/db';


export async function POST({ request }) {
  try {
    const form = await request.formData();
    const email = form.get('email');
    const password = form.get('password');

    const result = await db.query('SELECT * FROM usuarios WHERE correo = $1 LIMIT 1', [email]);

    if (result.rows.length === 0) {
      return new Response('Usuario no encontrado', { status: 401 });
    }

    const user = result.rows[0];
    const passwordValid = password === user.contrasena;

    if (!passwordValid) {
      return new Response('Contraseña incorrecta', { status: 401 });
    }

    if (user.correo !== 'biblioteca@gmail.com') {
      return new Response('Acceso restringido solo para el administrador.', { status: 403 });
    }

    // ✅ Guardamos una cookie de sesión simple
    return new Response(null, {
      status: 302,
      headers: {
        'Set-Cookie': 'sesion=activa; Path=/; HttpOnly',
        Location: '/home',
      },
    });
  } catch (error) {
    console.error('Error al procesar login:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
}
