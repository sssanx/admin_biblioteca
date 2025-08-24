// src/pages/api/buscar-ejemplares.js
import { db } from '../../lib/db';

export async function get({ url }) {
  try {
    const query = url.searchParams.get('q') || '';
    
    if (query.length < 2) {
      return new Response(
        JSON.stringify({ error: 'La búsqueda debe tener al menos 2 caracteres' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { rows } = await db.query(
      `SELECT 
        e.id,
        e.numero_inventario as codigo,
        l.titulo,
        e.ubicacion as ubic
       FROM ejemplares e
       JOIN libros l ON l.id = e.libro_id
       WHERE e.numero_inventario ILIKE $1
          OR l.titulo ILIKE $1
          OR l.isbn ILIKE $1
       ORDER BY l.titulo
       LIMIT 25`,
      [`%${query}%`]
    );

    return new Response(
      JSON.stringify(rows),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en búsqueda:', error);
    return new Response(
      JSON.stringify({ error: 'Error en la búsqueda' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}