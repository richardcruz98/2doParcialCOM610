function validarLibro(body) {
  const errores = [];
  const { titulo, autor, anio_publicacion } = body || {};

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    errores.push('titulo es obligatorio y no puede estar vacio');
  }
  if (typeof autor !== 'string' || autor.trim() === '') {
    errores.push('autor es obligatorio y no puede estar vacio');
  }
  if (
    anio_publicacion === undefined ||
    anio_publicacion === null ||
    !Number.isInteger(Number(anio_publicacion)) ||
    String(anio_publicacion).trim() === ''
  ) {
    errores.push('anio_publicacion debe ser un entero valido');
  }

  return errores;
}

module.exports = { validarLibro };
