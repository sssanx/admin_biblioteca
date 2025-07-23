import db from '../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

async function handleGet(req, res) {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM donantes';
    const params = [];
    
    if (q) {
      query += ' WHERE nombre ILIKE $1 OR identificacion = $2';
      params.push(`%${q}%`, q);
    }
    
    query += ' ORDER BY nombre LIMIT 50';
    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Error al buscar donantes' });
  }
}

async function handlePost(req, res) {
  try {
    const { nombre, tipo, identificacion, correo, telefono, direccion } = req.body;
    
    const result = await db.query(
      `INSERT INTO donantes 
      (nombre, tipo, identificacion, correo, telefono, direccion, usuario_id) 
      VALUES ($1, $2, $3, $4, $5, $6, 1) 
      RETURNING *`,
      [nombre, tipo, identificacion, correo, telefono, direccion]
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear donante' });
  }
}