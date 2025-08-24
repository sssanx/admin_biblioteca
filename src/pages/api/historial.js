import { verificarSesion } from '../../../lib/auth';

export async function GET({ request }) {
  const sesion = await verificarSesion(request);
  
  if (!sesion.valido || !sesion.usuario.es_admin) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const params = {
    admin_id: url.searchParams.get('admin_id'),
    accion: url.searchParams.get('accion'),
    fecha_inicio: url.searchParams.get('fecha_inicio')
  };

  try {
    let query = `
      SELECT h.*, u.nombre as admin_nombre 
      FROM historial_actividades h
      JOIN usuarios u ON h.usuario_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (params.admin_id) {
      query += ` AND h.usuario_id = $${queryParams.length + 1}`;
      queryParams.push(params.admin_id);
    }

    if (params.accion) {
      query += ` AND h.accion = $${queryParams.length + 1}`;
      queryParams.push(params.accion);
    }

    if (params.fecha_inicio) {
      query += ` AND h.fecha_hora >= $${queryParams.length + 1}`;
      queryParams.push(params.fecha_inicio);
    }

    query += ` ORDER BY h.fecha_hora DESC LIMIT 50`;

    const { rows } = await db.query(query, queryParams);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}