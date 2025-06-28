// src/pages/api/[id].js

export const prerender = false;

/**
 * Este handler maneja peticiones GET a /api/[id]
 */
export async function GET({ params }) {
  const { id } = params;

  // Aquí puedes conectar a una base de datos o API externa
  const data = {
    message: `Recibido ID: ${id}`,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
