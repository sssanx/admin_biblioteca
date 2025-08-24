import db from './db';

export async function verificarSesion(request) {
  const sessionToken = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
  
  if (!sessionToken) {
    return { valido: false };
  }

  try {
    const { rows } = await db.query(
      `SELECT u.id, u.nombre, u.email, u.es_admin 
       FROM sesiones s
       JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.token = $1 AND s.expiracion > NOW()`,
      [sessionToken]
    );

    if (rows.length === 0) {
      return { valido: false };
    }

    return { valido: true, usuario: rows[0] };
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return { valido: false };
  }
}

export async function registrarActividad(usuarioId, accion, detalles = {}) {
  try {
    const ip = Astro.request.headers.get('cf-connecting-ip') || 'desconocida';
    await db.query(
      `INSERT INTO historial_actividades 
       (usuario_id, accion, detalles, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [usuarioId, accion, JSON.stringify(detalles), ip]
    );
  } catch (error) {
    console.error('Error registrando actividad:', error);
  }
}