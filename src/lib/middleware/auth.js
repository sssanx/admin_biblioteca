// src/lib/auth.js
import db from './db';

/**
 * Verifica si el usuario es administrador
 * @param {Request} request - Objeto request de la petición
 * @returns {Promise<{autorizado: boolean, usuario?: {id: number, nombre: string, correo: string}}>}
 */
export const verificarAdmin = async (request) => {
  try {
    // 1. Obtener el token de la cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionToken = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('session='))
      ?.split('=')[1];

    if (!sessionToken) {
      return { autorizado: false };
    }

    // 2. Verificar en base de datos
    const { rows } = await db.query(
      `SELECT u.id, u.nombre, u.correo, u.es_admin 
       FROM usuarios u
       JOIN sesiones s ON u.id = s.usuario_id
       WHERE s.token = $1 AND s.expiracion > NOW()`,
      [sessionToken]
    );

    // 3. Validar si es admin
    if (rows.length === 0 || !rows[0].es_admin) {
      return { autorizado: false };
    }

    return { 
      autorizado: true, 
      usuario: {
        id: rows[0].id,
        nombre: rows[0].nombre,
        correo: rows[0].correo
      }
    };
  } catch (error) {
    console.error('Error en verificarAdmin:', error);
    return { autorizado: false };
  }
};

/**
 * Registra una actividad administrativa
 * @param {number} usuarioId - ID del administrador
 * @param {string} accion - Tipo de acción (ej. 'LOGIN', 'PRESTAMO')
 * @param {object} detalles - Objeto con detalles de la acción
 * @param {Request} request - Objeto request para obtener IP
 */
export const registrarActividad = async (usuarioId, accion, detalles = {}, request) => {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'desconocida';
    
    await db.query(
      `INSERT INTO historial_actividades 
       (usuario_id, accion, detalles, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [usuarioId, accion, JSON.stringify(detalles), ip]
    );
  } catch (error) {
    console.error('Error en registrarActividad:', error);
  }
};