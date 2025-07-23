// src/pages/api/ejemplares/crear.js
import { getClient } from '../../../../lib/db';

export async function POST({ request }) {  // Cambiado de post a POST
  let client;
  try {
    client = await getClient();
    const data = await request.json();

    console.log('Datos recibidos:', data);

    // Validaciones
    if (!data.libro_id || isNaN(data.libro_id)) {
      throw new Error("ID de libro inválido");
    }
    if (!data.codigo_barras?.trim()) {
      throw new Error("Código de barras requerido");
    }
    if (!data.numero_ejemplar || isNaN(data.numero_ejemplar)) {
      throw new Error("Número de ejemplar inválido");
    }
    if (!['disponible', 'prestado', 'en_reparacion', 'perdido'].includes(data.estado)) {
      throw new Error("Estado inválido");
    }

    // Verificar código único
    const { rows } = await client.query(
      'SELECT id FROM ejemplares WHERE codigo_barras = $1 LIMIT 1',
      [data.codigo_barras]
    );
    
    if (rows.length > 0) {
      throw new Error("El código de barras ya existe");
    }

    // Insertar nuevo ejemplar
    const result = await client.query(
      `INSERT INTO ejemplares (
        libro_id, codigo_barras, numero_ejemplar, 
        estado, numero_adquisicion
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        data.libro_id,
        data.codigo_barras,
        data.numero_ejemplar,
        data.estado,
        data.numero_adquisicion || null
      ]
    );

    return new Response(JSON.stringify({
      success: true,
      data: result.rows[0]
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } finally {
    if (client) client.release();
  }
}