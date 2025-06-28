// src/pages/api/agregar_usu.js
export const prerender = false;

import db from '../../lib/db.js'; // Asegúrate que esta ruta sea correcta

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const nombre = form.get('nombre');
    const correo = form.get('correo');
    const rol = form.get('rol');
    const matricula = form.get('matricula');
    const carrera_id = form.get('carrera_id');

    if (!nombre || !correo || !rol || !matricula || !carrera_id) {
      return new Response('Faltan campos', { status: 400 });
    }

    await db.query(
      'INSERT INTO usuarios (nombre, correo, rol, matricula, carrera_id) VALUES ($1, $2, $3, $4, $5)',
      [nombre, correo, rol, matricula, carrera_id]
    );

    return new Response(null, {
      status: 303,
      headers: {
        Location: '/usuarios',
      },
    });
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    return new Response('Error al procesar el formulario', { status: 500 });
  }
}
