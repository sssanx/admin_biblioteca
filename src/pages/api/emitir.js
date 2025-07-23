// src/pages/api/credenciales/emitir.js
import db from '../../lib/db';

function generarCodigoBarras() {
  const prefix = 'LIB';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
}

export async function POST({ request }) {
  const data = await request.json();
  const { usuarioId, usuarioEmisorId } = data;
  
  try {
    // Verificar si ya tiene credencial activa
    const { rows: [existente] } = await db.query(`
      SELECT id FROM credenciales 
      WHERE usuario_id = $1 AND estado = 'Activa'
    `, [usuarioId]);
    
    if (existente) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'El usuario ya tiene una credencial activa' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generar nueva credencial
    const codigoBarras = generarCodigoBarras();
    const { rows: [credencial] } = await db.query(`
      INSERT INTO credenciales
      (usuario_id, codigo_barras, usuario_emisor)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [usuarioId, codigoBarras, usuarioEmisorId]);
    
    // Registrar movimiento
    await db.query(`
      INSERT INTO movimientos_credencial
      (credencial_id, tipo_movimiento, usuario_responsable)
      VALUES ($1, 'Emisión', $2)
    `, [credencial.id, usuarioEmisorId]);
    
    return new Response(JSON.stringify({ 
      success: true,
      credencial 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error al emitir credencial' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}