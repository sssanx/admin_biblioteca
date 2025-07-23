import db from "../../../lib/db.js";

export async function post({ request }) {
  const data = await request.formData();

  const libroId = parseInt(data.get("libro_id"));
  const tags = data.getAll("tag[]");
  const ind1 = data.getAll("ind1[]");
  const ind2 = data.getAll("ind2[]");
  const subcodes = data.getAll("subcode[]");
  const values = data.getAll("value[]");

  // Construir estructura MARC
  const marc: any = {};

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    if (!marc[tag]) {
      marc[tag] = {
        ind1: ind1[i],
        ind2: ind2[i],
        subfields: [],
      };
    }
    marc[tag].subfields.push({
      code: subcodes[i],
      value: values[i],
    });
  }

  await db.query("UPDATE libros SET marc = $1 WHERE id = $2", [marc, libroId]);

  return new Response(`
    <div style="padding:1rem; background:#d4edda; color:#155724; border:1px solid #c3e6cb;">
      Guardado correctamente.
      <a href="/libros/${libroId}">← Volver al libro</a>
    </div>
  `, { headers: { "Content-Type": "text/html" } });
}
