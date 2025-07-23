// src/pages/api/upload.js
import multer from 'multer';
import path from 'path';
import { db } from '../../lib/db';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `user-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    upload.single('foto')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      // Actualizar la base de datos con la nueva foto
      await db.query(
        'UPDATE usuarios SET foto_path = $1 WHERE id = $2',
        [req.file.filename, userId]
      );

      res.status(200).json({
        success: true,
        path: `/uploads/${req.file.filename}`
      });
    });
  } catch (error) {
    console.error('Error al subir foto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}