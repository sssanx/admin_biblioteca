export const prerender = false;

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const clave = form.get('clave');

    if (clave !== 'admin123') {
      return new Response('Contraseña incorrecta', { status: 401 });
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Set-Cookie': 'sesion=activa; Path=/; HttpOnly',
        Location: '/biblioteca',
      },
    });
  } catch (error) {
    console.error('Error en logeo:', error);
    return new Response('Error interno', { status: 500 });
  }
}
