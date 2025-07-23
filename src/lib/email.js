import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia si usas otro proveedor
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Biblioteca" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error };
  }
}
