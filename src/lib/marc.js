// src/lib/marc.js
export function generarMARC(libro) {
  return {
    leader: '-----nam0-22-----  4500',
    campos: [
      { 
        tag: '100',
        ind1: '1',
        ind2: ' ',
        subcampos: [{ codigo: 'a', valor: libro.autor }]
      },
      {
        tag: '245',
        ind1: '1',
        ind2: '0',
        subcampos: [
          { codigo: 'a', valor: `${libro.titulo} /` },
          { codigo: 'c', valor: libro.autor }
        ]
      },
      {
        tag: '260',
        subcampos: [
          { codigo: 'a', valor: 'Lugar desconocido :' },
          { codigo: 'b', valor: 'Editorial no identificada,' },
          { codigo: 'c', valor: libro.anio?.toString() || 's.f.' }
        ]
      },
      {
        tag: '020',
        subcampos: [
          { codigo: 'a', valor: libro.isbn || 'SN' }
        ]
      }
    ]
  };
}

export function formatoEtiqueta(libro) {
  const marc = generarMARC(libro);
  let texto = `LDR ${marc.leader}\n`;
  marc.campos.forEach(campo => {
    texto += `${campo.tag} ${campo.ind1 || ' '}${campo.ind2 || ' '} `;
    campo.subcampos.forEach(sub => {
      texto += `‡${sub.codigo} ${sub.valor} `;
    });
    texto += '\n';
  });
  return texto;
}