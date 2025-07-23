// src/pages/api/etiquetas-lote.js
import { textSync } from 'figlet';   // opcional para placeholder
import puppeteer from 'puppeteer';   // instalar con  npm i puppeteer
export const prerender = false;

export async function POST({ request }) {
  const form = await request.formData();
  const ejemplares = JSON.parse(form.get('ejemplares') || '[]');

  /* 1.‑‑‑ generar HTML de etiquetas */
  const etiquetasHTML = ejemplares.map(e => `
    <div style="width:48%;display:inline-block;margin:1%;border:1px dashed #ccc;padding:6px;font-size:12px;text-align:center;">
      <strong>${e.titulo.slice(0,30)}</strong><br/>
      <span style="font-size:10px">${e.autor.slice(0,25)}</span><br/>
      <svg class="barcode" jsbarcode-value="${e.codigo_barras}" jsbarcode-height="35"></svg><br/>
      <small>${e.clasificacion} • Adq. ${e.numero_adquisicion}</small>
    </div>`).join('');

  const html = `
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body style="margin:0;padding:0;">
        ${etiquetasHTML}
        <script>JsBarcode('.barcode').init();</script>
      </body>
    </html>`;

  /* 2.‑‑‑ generar PDF con puppeteer */
  const browser = await puppeteer.launch({ args:['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil:'networkidle0' });
  const pdf = await page.pdf({ format:'A4', printBackground:true, margin:{top:6,bottom:6} });
  await browser.close();

  return new Response(pdf, {
    headers:{
      'Content-Type':'application/pdf',
      'Content-Disposition':'inline; filename="etiquetas.pdf"'
    }
  });
}
