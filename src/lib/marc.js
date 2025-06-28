export function generarMARC(libro) {
  return `
100 1\\$a ${libro.autor}.
245 10$a ${libro.titulo} /$c ${libro.autor}.
260 \\$a ${libro.editorial},$c ${libro.anio_publicacion}.
020 \\$a ${libro.isbn}
`.trim();
}
