const { getPool } = require('./db');

async function listarLibros() {
  const [rows] = await getPool().query(
    'SELECT id, titulo, autor, anio_publicacion FROM libros ORDER BY id'
  );
  return rows;
}

async function obtenerLibro(id) {
  const [rows] = await getPool().query(
    'SELECT id, titulo, autor, anio_publicacion FROM libros WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function crearLibro({ titulo, autor, anio_publicacion }) {
  const [result] = await getPool().query(
    'INSERT INTO libros (titulo, autor, anio_publicacion) VALUES (?, ?, ?)',
    [titulo, autor, anio_publicacion]
  );
  return { id: result.insertId, titulo, autor, anio_publicacion };
}

async function actualizarLibro(id, { titulo, autor, anio_publicacion }) {
  const [result] = await getPool().query(
    'UPDATE libros SET titulo = ?, autor = ?, anio_publicacion = ? WHERE id = ?',
    [titulo, autor, anio_publicacion, id]
  );
  if (result.affectedRows === 0) return null;
  return { id: Number(id), titulo, autor, anio_publicacion };
}

async function eliminarLibro(id) {
  const [result] = await getPool().query('DELETE FROM libros WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listarLibros,
  obtenerLibro,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
};
