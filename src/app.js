const express = require('express');
const repo = require('./librosRepository');
const { validarLibro } = require('./validarLibro');

function crearApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      version: process.env.APP_VERSION || 'dev',
    });
  });

  app.get('/libros', async (req, res, next) => {
    try {
      const libros = await repo.listarLibros();
      res.status(200).json(libros);
    } catch (err) {
      next(err);
    }
  });

  app.get('/libros/:id', async (req, res, next) => {
    try {
      const libro = await repo.obtenerLibro(req.params.id);
      if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json(libro);
    } catch (err) {
      next(err);
    }
  });

  app.post('/libros', async (req, res, next) => {
    try {
      const errores = validarLibro(req.body);
      if (errores.length > 0) return res.status(400).json({ errores });
      const nuevo = await repo.crearLibro(req.body);
      res.status(201).json(nuevo);
    } catch (err) {
      next(err);
    }
  });

  app.put('/libros/:id', async (req, res, next) => {
    try {
      const errores = validarLibro(req.body);
      if (errores.length > 0) return res.status(400).json({ errores });
      const actualizado = await repo.actualizarLibro(req.params.id, req.body);
      if (!actualizado) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(200).json(actualizado);
    } catch (err) {
      next(err);
    }
  });

  app.delete('/libros/:id', async (req, res, next) => {
    try {
      const eliminado = await repo.eliminarLibro(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Libro no encontrado' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  // Manejador de errores centralizado
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = { crearApp };
