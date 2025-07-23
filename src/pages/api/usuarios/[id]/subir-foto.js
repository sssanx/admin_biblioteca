import db from '../../../../lib/db';

export async function POST({ params, request }) {
  const { id } = params;
  const formData = await request.formData();
  const file = formData.get('foto');

  if (!file) {
    return new Response(JSON.stringify({ error: "No se recibió archivo." }), { status: 400 });
  }

  // Guardar en disco local (o en tu caso, puedes ponerlo en S3 o similar)
  const buffer = Buffer.from(await file.arrayBuffer());
  const nombreArchivo = `usuario_${id}_${Date.now()}.jpg`;
  const ruta = `./public/uploads/${nombreArchivo}`;
  const urlPublica = `/uploads/${nombreArchivo}`;
  await Bun.write(ruta, buffer);

  await db.query(`UPDATE usuarios SET foto_url = $1 WHERE id = $2`, [urlPublica, id]);

  return new Response(JSON.stringify({ success: true, url: urlPublica }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
