// src/pages/api/subir-portada.js
import { IncomingForm } from "formidable";
import path from "path";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // desactivamos el body parser por defecto para que formidable funcione
  },
};

// Función para convertir el Request web a un stream compatible con formidable
function convertToNodeRequest(request) {
  const { headers, method, url } = request;
  const nodeReq = new (class extends require("stream").Readable {
    constructor() {
      super();
      this.headers = Object.fromEntries(headers.entries());
      this.method = method;
      this.url = url;
    }
    _read() {
      request
        .arrayBuffer()
        .then((buf) => {
          this.push(Buffer.from(buf));
          this.push(null);
        })
        .catch((err) => this.destroy(err));
    }
  })();
  return nodeReq;
}

export async function POST({ request }) {
  const nodeReq = convertToNodeRequest(request);

  return new Promise((resolve) => {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), "/public/uploads"),
      keepExtensions: true,
    });

    form.parse(nodeReq, (err, fields, files) => {
      if (err) {
        resolve(
          new Response(
            JSON.stringify({ error: "Error al procesar archivo", details: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          )
        );
        return;
      }

      const uploadedFile = files.portada && files.portada[0];

      if (!uploadedFile) {
        resolve(
          new Response(
            JSON.stringify({ error: "No se subió ningún archivo con el nombre 'portada'" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          )
        );
        return;
      }

      const filePath = uploadedFile.filepath || uploadedFile.path;
      const fileName = path.basename(filePath);

      resolve(
        new Response(
          JSON.stringify({ message: "Archivo subido correctamente", path: `/uploads/${fileName}` }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    });
  });
}
  