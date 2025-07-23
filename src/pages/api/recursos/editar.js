import db from '../../../lib/db';

export async function GET({ url }) {
  const id = url.searchParams.get('id');
  const error = url.searchParams.get('error') || '';

  if (!id) {
    return new Response('ID del recurso no proporcionado', { status: 400 });
  }

  const result = await db.query('SELECT * FROM recursos_digitales WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return new Response('Recurso no encontrado', { status: 404 });
  }

  const recurso = result.rows[0];

  return new Response(`
    <html lang="es">
      <head>
        <title>Editar recurso</title>
        <meta charset="UTF-8" />
        <style>
          body { font-family: sans-serif; padding: 20px; background: #f7f7f7; }
          label { display: block; margin-top: 12px; font-weight: bold; }
          input, textarea { width: 100%; padding: 8px; margin-top: 4px; }
          button { margin-top: 20px; padding: 10px 15px; background: #1B396A; color: white; border: none; cursor: pointer; }
          .error { color: red; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>✏️ Editar Recurso</h1>

        ${error ? `<p class="error">${error}</p>` : ''}

        <form method="POST" action="/api/recursos/editar?id=${id}" enctype="multipart/form-data">
          <label for="titulo">Título *</label>
          <input type="text" id="titulo" name="titulo" value="${escapeHtml(recurso.titulo)}" required />

          <label for="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion">${escapeHtml(recurso.descripcion || '')}</textarea>

          <label>Archivo PDF actual:</label>
          <a href="${escapeHtml(recurso.archivo_url)}" target="_blank" style="color:#1B396A;">Ver archivo actual</a>

          <label for="archivo">Subir nuevo archivo (opcional)</label>
          <input type="file" id="archivo" name="archivo" accept="application/pdf" />

          <button type="submit">Guardar Cambios</button>
        </form>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

export async function POST({ url, request }) {
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response('ID del recurso no proporcionado', { status: 400 });
  }

  const form = await request.formData();
  const titulo = form.get('titulo')?.trim();
  const descripcion = form.get('descripcion')?.trim() || null;
  const archivoFile = form.get('archivo'); // File object or null

  if (!titulo) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/api/recursos/editar?id=${id}&error=${encodeURIComponent('El título es obligatorio')}`
      }
    });
  }

  try {
    let archivo_url = null;

    if (archivoFile && archivoFile.size > 0) {
      // Aquí debes implementar la lógica para guardar el archivo PDF en tu servidor o almacenamiento
      // Por ejemplo, puedes guardar el archivo en /public/uploads/ y construir su URL
      // Este es un ejemplo simplificado:

      const buffer = await archivoFile.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const fs = await import('fs/promises');
      const path = await import('path');

      const uploadsDir = path.resolve('public/uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Generar un nombre único para evitar sobreescrituras
      const fileName = `recurso_${id}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      await fs.writeFile(filePath, uint8Array);

      archivo_url = `/uploads/${fileName}`;
    } else {
      // Si no subieron archivo nuevo, conservar la URL actual
      const current = await db.query('SELECT archivo_url FROM recursos_digitales WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        return new Response('Recurso no encontrado', { status: 404 });
      }
      archivo_url = current.rows[0].archivo_url;
    }

    await db.query(
      `UPDATE recursos_digitales SET titulo = $1, descripcion = $2, archivo_url = $3 WHERE id = $4`,
      [titulo, descripcion, archivo_url, id]
    );

    return new Response(null, {
      status: 302,
      headers: { Location: '/biblioteca-admin' } // Ajusta la ruta según tu panel admin
    });
  } catch (error) {
    console.error('Error actualizando recurso:', error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/api/recursos/editar?id=${id}&error=${encodeURIComponent('Error interno al actualizar')}`
      }
    });
  }
}

// Función para escapar caracteres especiales en HTML para evitar XSS
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m) => ( {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
