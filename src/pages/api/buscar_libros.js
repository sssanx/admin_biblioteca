// src/pages/api/buscar_libros.js
export const post = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const categoria = searchParams.get('categoria') || '';
  const anioInicio = searchParams.get('anioInicio') || '';
  const anioFin = searchParams.get('anioFin') || '';
  const disponible = searchParams.get('disponible') || '';

  let sql = 'SELECT * FROM libros WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND (titulo LIKE ? OR autor LIKE ? OR isbn LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }
  if (categoria) {
    sql += ' AND categoria_id = ?';
    params.push(categoria);
  }
  if (anioInicio && anioFin) {
    sql += ' AND anio BETWEEN ? AND ?';
    params.push(anioInicio, anioFin);
  }
  if (disponible === 'true') {
    sql += ' AND id NOT IN (SELECT libro_id FROM prestamos WHERE devuelto = false)';
  }

  const result = await db.query(sql, params);
  return new Response(JSON.stringify(result.rows), {
    headers: { 'Content-Type': 'application/json' },
  });
};