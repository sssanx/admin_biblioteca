import db from "../../../../lib/db.js";

export async function get({ params }) {
  const id = parseInt(params.id);
  const result = await db.query("SELECT marc FROM libros WHERE id = $1", [id]);
  const row = result.rows[0];
  if (!row || !row.marc) {
    return new Response("No hay ficha MARC", { status: 404 });
  }

  let marcTxt = "";
  for (const [tag, field] of Object.entries(row.marc)) {
    marcTxt += `=${tag} ${field.ind1}${field.ind2} `;
    marcTxt += field.subfields.map(s => `$${s.code} ${s.value}`).join(" ") + "\n";
  }

  return new Response(marcTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="marc_${id}.txt"`
    }
  });
}
