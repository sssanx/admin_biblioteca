import db from "../../../lib/db.js";
import XLSX from "xlsx";

export async function get() {
  const result = await db.query(`
    SELECT m.id, m.id_prestamo, m.monto, m.estado, m.fecha_creacion,
           l.titulo AS libro, u.nombre AS usuario
    FROM multas m
    JOIN prestamos p ON m.id_prestamo = p.id
    JOIN libros l ON p.id_libro = l.id
    JOIN usuarios u ON p.id_usuario = u.id
    ORDER BY m.fecha_creacion DESC
  `);

  const data = result.rows.map(row => ({
    ID: row.id,
    Prestamo: row.id_prestamo,
    Libro: row.libro,
    Usuario: row.usuario,
    Monto: row.monto,
    Estado: row.estado,
    Fecha: row.fecha_creacion.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Multas");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=multas.xlsx",
    },
  });
}
