// src/pages/api/ejemplares/libro/[libro_id].js
import http from 'node:http';

// Crear agente HTTP global
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  keepAliveMsecs: 10000
});

export async function GET({ params }) {
  try {
    // Simular pequeña demora para pruebas
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return new Response(JSON.stringify([{
      id: 1,
      codigo_barras: `LIB-${params.libro_id}-001`,
      numero_ejemplar: 1,
      estado: 'disponible'
    }]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=10'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Servicio no disponible temporalmente"
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '5'
      }
    });
  }
}