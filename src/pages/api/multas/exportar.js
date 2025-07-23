// src/pages/api/multas/exportar.js
import db from "../../../lib/db";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const res = await db.query(`
      SELECT m.id, u.nombre AS usuario, l.titulo AS libro, 
             m.fecha_multa, m.dias_retraso, m.monto, m.estado, m.fecha_pago
      FROM multas m
      JOIN usuarios u ON m.usuario_id = u.id
      JOIN libros l ON m.libro_id = l.id
      ORDER BY m.fecha_multa DESC
    `);

    const data = res.rows.map(m => ({
      ID: m.id,
      Usuario: m.usuario,
      Libro: m.libro,
      "Fecha Multa": new Date(m.fecha_multa).toLocaleDateString(),
      "Días de Retraso": m.dias_retraso,
      "Monto ($)": m.monto,
      Estado: m.estado,
      "Fecha Pago": m.fecha_pago
        ? new Date(m.fecha_pago).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Multas");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=multas.xlsx",
      },
    });
  } catch (e) {
    console.error("Error exportando multas:", e);
    return new Response("Error exportando Excel", { status: 500 });
  }
}
