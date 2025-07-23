// src/lib/auth.js
import { cookies } from 'astro:cookies';

// Simulación de base de datos de usuarios (en producción usa tu DB real)
const usersDB = [
  {
    id: 1,
    nombre: "Administrador",
    correo: "admin@biblioteca.com",
    contrasena: "$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3d8pOGq7NDDEUr0L6ZIJ/fVnQu", // "admin123"
    es_admin: true
  }
];

export async function getSession(request) {
  const cookies = request.cookies;
  const sessionToken = cookies.get('session')?.value;

  if (!sessionToken) return null;

  // En una app real, aquí verificarías el token en tu base de datos
  const user = usersDB.find(u => u.correo === sessionToken);
  
  return user ? { user } : null;
}

export async function createSession(correo, cookies) {
  // En una app real, crearías un token JWT o similar
  cookies.set('session', correo, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    secure: import.meta.env.PROD
  });
}

export async function destroySession(cookies) {
  cookies.delete('session', { path: '/' });
}