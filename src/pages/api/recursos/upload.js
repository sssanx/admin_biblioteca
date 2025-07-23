import db from '../../../lib/db';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function POST({ request }) {
  const formData = await request.formData();
  const titulo = formData.get('titulo');
  const descripcion = formData.get('descripcion') || '';
  const tipo = formData.get('tipo') || '';
  const archivo = formData.get('archivo');

  if (!archivo || !archivo.name.endsWith('.pdf')) {
    return new Response('Archivo inválido', { status: 400 });
  }

  const fileBuffer = Buffer.from(await archivo.arrayBuffer());
  const fileName = `${Date.now()}_${archivo.name}`;
  const filePath = join(process.cwd(), 'public', 'uploads', fileName);

  writeFileSync(filePath, fileBuffer);

  const archivo_url = `/uploads/${fileName}`;

  await db.query(
    `INSERT INTO recursos_digitales (titulo, descripcion, archivo_url, tipo, fecha_publicacion)
     VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
    [titulo, descripcion, archivo_url, tipo]
  );

  return new Response(null, {
    status: 302,
    headers: { Location: '/biblioteca' },
  });
}
