// src/pages/api/exportar-asistencia.js
import db from '../../lib/db';
import ExcelJS from 'exceljs';
import { createServer } from 'http';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import puppeteer from 'puppeteer';

export const prerender = false;

export async function GET({ url }) {
  const formato = url.searchParams.get('formato') || 'pdf';
  const { rows: asistencias } = await db.query(`
    SELECT u.nombre, u.matricula, v.fecha_hora
    FROM visitas v
    INNER JOIN usuarios u ON u.id = v.usuario_id
    WHERE DATE(v.fecha_hora) = CURRENT_DATE
    ORDER BY u.nombre
  `);

  if (formato === 'excel') {
    // Generar Excel con exceljs
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Asistencia');
    sheet.columns = [
      { header: 'Nombre', key: 'nombre' },
      { header: 'Matrícula', key: 'matricula' },
      { header: 'Fecha y Hora', key: 'fecha_hora' },
    ];
    asistencias.forEach((a) => sheet.addRow(a));

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="asistencia.xlsx"',
      },
    });
  } else {
    // Generar PDF con Puppeteer
    const html = `
      <html>
      <head>
        <style>
          body { font-family: sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 4px; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>Asistencia - ${new Date().toLocaleDateString()}</h1>
        <table>
          <thead>
            <tr><th>Nombre</th><th>Matrícula</th><th>Fecha y Hora</th></tr>
          </thead>
          <tbody>
            ${asistencias
              .map(
                (a) => `<tr><td>${a.nombre}</td><td>${a.matricula}</td><td>${a.fecha_hora}</td></tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="asistencia.pdf"',
      },
    });
  }
}
