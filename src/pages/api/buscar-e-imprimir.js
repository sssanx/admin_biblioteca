async function buscarLibro(codigo) {
  try {
    const res = await fetch('/api/buscar-libro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
    const data = await res.json();
    if (!data.success) {
      alert('Libro no encontrado: ' + data.error);
      return null;
    }
    return data.data;
  } catch (error) {
    alert('Error al buscar libro: ' + error.message);
    return null;
  }
}

// Ejemplo: Lista para almacenar etiquetas a imprimir
const etiquetasParaImprimir = [];

// Función para buscar y agregar a la lista
async function agregarYPrepararParaImprimir(codigo) {
  const libro = await buscarLibro(codigo);
  if (libro) {
    // Mapear datos a formato etiqueta (ajusta según estructura real)
    etiquetasParaImprimir.push({
      titulo: libro.titulo,
      autor: libro.autor,
      isbn: libro.isbn,
      ubicacion: libro.ubicacion || 'N/A',  // o desde ejemplar si lo tienes
      ejemplar: libro.ejemplar || 'N/A',
      codigo: libro.isbn // aquí usamos el ISBN para el código de barras
    });
  }
}

// Cuando quieras imprimir (por ejemplo, botón):
function imprimirEtiquetas() {
  if (etiquetasParaImprimir.length === 0) {
    alert('No hay etiquetas para imprimir.');
    return;
  }
  // Guardar en sessionStorage para la página imprimir
  sessionStorage.setItem('etiquetasParaImprimir', JSON.stringify(etiquetasParaImprimir));
  // Abrir la página imprimir
  window.open('/imprimir');
}
