import db from '@/lib/db';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: Number(import.meta.env.SMTP_PORT),
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
});

export async function POST({ request }) {
  try {
    console.log('[notificar] Inicio de la función POST');
    const { id_prestamo } = await request.json();
    console.log('[notificar] id_prestamo recibido:', id_prestamo);

    const { rows: [p] } = await db.query(`
      SELECT p.*, 
             COALESCE(u.email, u.correo) AS email,
             u.nombre AS usuario, 
             l.titulo AS libro
      FROM prestamos p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN libros   l ON p.libro_id   = l.id
      WHERE p.id = $1
    `, [id_prestamo]);

    if (!p) {
      console.warn('[notificar] Préstamo no encontrado para id:', id_prestamo);
      return new Response(JSON.stringify({ error: 'Préstamo no encontrado' }), { status: 404 });
    }

    if (!p.email) {
      console.warn('[notificar] Usuario sin email:', p.usuario);
      return new Response(JSON.stringify({ error: 'Usuario sin email' }), { status: 400 });
    }

    await transporter.sendMail({
      from: `"Biblioteca Digital" <${import.meta.env.SMTP_USER}>`,
      to: p.email,
      subject: 'Recordatorio de préstamo vencido',
      html: `
        <h2>Hola ${p.usuario},</h2>
        <p>El libro <strong>${p.libro}</strong> venció el 
           ${new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-ES')}.</p>
        <p>Por favor devuélvelo o renueva tu préstamo 😃.</p>
      `,
    });

    console.log('[notificar] Correo enviado a:', p.email);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error('[notificar] Error enviando correo:', err);
    return new Response(JSON.stringify({ error: 'Fallo enviando correo' }), { status: 500 });
  }
}
