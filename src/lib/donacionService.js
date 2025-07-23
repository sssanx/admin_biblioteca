import { query } from './db.js';  // Importa la función query desde db.js

export async function obtenerDonacionConItems(id) {
  // Obtiene la donación por id
  const donacionResult = await query('SELECT * FROM donaciones WHERE id = $1', [id]);
  if (donacionResult.rowCount === 0) return null;

  // Obtiene los items relacionados a esa donación
  const itemsResult = await query(
    `SELECT * FROM items_donacion WHERE donacion_id = $1`,
    [id]
  );

  return {
    donacion: donacionResult.rows[0],
    items: itemsResult.rows,
  };
}
