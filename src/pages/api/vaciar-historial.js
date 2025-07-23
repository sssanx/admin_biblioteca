// src/pages/api/vaciar-historial.js

import db from '../../lib/db.js';

export async function POST(context) {
  try {
    // Elimina todos los préstamos que han sido devueltos
    await db.query('DELETE FROM prestamos WHERE devuelto = true');

    return new Response(
      JSON.stringify({ success: true, message: 'Historial vaciado.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al vaciar historial:', error);

    return new Response(
      JSON.stringify({ success: false, error: 'Error al vaciar historial.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
