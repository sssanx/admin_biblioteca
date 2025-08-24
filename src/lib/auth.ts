// src/lib/auth.js
import bcrypt from 'bcryptjs';

// Función para hashear contraseñas
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Función para comparar contraseñas
export const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// Función para verificar sesión (opcional)
export const verifySession = (cookies) => {
    const session = cookies.get('biblioteca_session');
    return session ? JSON.parse(session) : null;
};