// public/js/imprimir.js

if (window.location.search.includes('print=true')) {
  document.addEventListener('DOMContentLoaded', () => {
    const carrito = JSON.parse(localStorage.getItem('carrito_etiquetas')) || [];
    const tbody = document.querySelector('.print-section tbody');

    carrito.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <svg class="barcode" data-code="${item.codigo_barras}"></svg>
          ${item.codigo_barras}
        </td>
        <td>${item.titulo}</td>
        <td>${item.isbn || 'N/A'}</td>
        <td>${item.ubicacion_especifica || 'No especificada'}</td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.barcode').forEach(barcode => {
      JsBarcode(barcode, barcode.dataset.code, {
        format: "CODE128",
        lineColor: "#000",
        width: 1.5,
        height: 40,
        displayValue: false
      });
    });
  });
}
