export async function getEtiquetasData(Astro) {
  const formatosEtiqueta = [
    { value: 'completo', label: 'Completo (SIABUC)' },
    { value: 'simple', label: 'Sólo código' },
    { value: 'inventario', label: 'Inventario' }
  ];

  const url = new URL(Astro.request.url);
  const modo = url.searchParams.get('modo') || 'individual';
  const libroId = url.searchParams.get('libroId');
  const ejemplarId = url.searchParams.get('ejemplarId');

  const { libroInfo, ejemplares } = await obtenerDatos(libroId, ejemplarId);

  return {
    formatosEtiqueta,
    modo,
    libroInfo: libroInfo || {},
    ejemplares: ejemplares || [],
    ejemplaresJSON: JSON.stringify(ejemplares).replace(/</g, '\\u003c'),
    libroInfoJSON: JSON.stringify(libroInfo).replace(/</g, '\\u003c')
  };
}