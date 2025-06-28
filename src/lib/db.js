import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // o define host, user, etc. directamente
  ssl: false, // Pon true si estás en producción con SSL
});

export default {
  query: (text, params) => pool.query(text, params),
};
