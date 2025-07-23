import { query } from '../../lib/db'; 
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        u.nombre, 
        u.carrera, 
        u.matricula, 
        c.nombre AS cuatrimestre
      FROM usuarios u
      LEFT JOIN cuatrimestre c ON u.id_cuatrimestre = c.id
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    if (result.rows.length === 0) {
      worksheet.addRow(['No hay datos para exportar']);
    } else {
      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Carrera', key: 'carrera', width: 25 },
        { header: 'Matrícula', key: 'matricula', width: 20 },
        { header: 'Cuatrimestre', key: 'cuatrimestre', width: 15 },
      ];

      result.rows.forEach((row) => {
        worksheet.addRow(row);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="datos.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
}
