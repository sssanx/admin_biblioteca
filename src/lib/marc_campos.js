export const camposMARC = [
  {
    tag: '245',
    desc: 'Título',
    subcampos: [
      { code: 'a', label: 'Título principal' },
      { code: 'b', label: 'Subtítulo' },
      { code: 'c', label: 'Responsabilidad' }
    ]
  },
  {
    tag: '100',
    desc: 'Autor principal',
    subcampos: [
      { code: 'a', label: 'Nombre del autor' }
    ]
  },
  {
    tag: '260',
    desc: 'Publicación',
    subcampos: [
      { code: 'a', label: 'Lugar' },
      { code: 'b', label: 'Editorial' },
      { code: 'c', label: 'Año'
      }
    ]
  },
  {
    tag: '020',
    desc: 'ISBN',
    subcampos: [
      { code: 'a', label: 'Número ISBN' }
    ]
  }
];
