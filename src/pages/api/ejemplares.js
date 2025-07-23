// src/pages/api/ejemplares.js
import { db } from '../../lib/db';

export async function post({ request }) {
  try {
    const formData = await request.formData();
    const libro_id = formData.get('libro_id');
    const cantidad = formData.get('cantidad');

    if (!libro_id || !cantidad) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const nuevosNumeros = [];
    for (let i = 0; i < Number(cantidad); i++) {
      const numero = `INV-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;
      
      await db.query(
        'INSERT INTO ejemplares (libro_id, numero_inventario) VALUES ($1, $2)',
        [libro_id, numero]
      );
      nuevosNumeros.push(numero);
    }

    return new Response(
      JSON.stringify({ success: true, numeros: nuevosNumeros }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en API:', error);
    return new Response(
      JSON.stringify({ error: 'Error del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}