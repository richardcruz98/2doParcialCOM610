jest.mock('../src/librosRepository');

const request = require('supertest');
const repo = require('../src/librosRepository');
const { crearApp } = require('../src/app');

const app = crearApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /health', () => {
  it('responde 200 con estado ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /libros', () => {
  it('crea un libro valido y responde 201', async () => {
    const nuevoLibro = { titulo: 'Cien anios de soledad', autor: 'Gabriel Garcia Marquez', anio_publicacion: 1967 };
    repo.crearLibro.mockResolvedValue({ id: 1, ...nuevoLibro });

    const res = await request(app).post('/libros').send(nuevoLibro);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, ...nuevoLibro });
    expect(repo.crearLibro).toHaveBeenCalledWith(nuevoLibro);
  });

  it('rechaza datos invalidos con 400', async () => {
    const res = await request(app)
      .post('/libros')
      .send({ titulo: '', autor: 'Alguien', anio_publicacion: 'no-es-numero' });

    expect(res.status).toBe(400);
    expect(res.body.errores.length).toBeGreaterThan(0);
    expect(repo.crearLibro).not.toHaveBeenCalled();
  });
});

describe('GET /libros/:id', () => {
  it('responde 404 si el libro no existe', async () => {
    repo.obtenerLibro.mockResolvedValue(null);

    const res = await request(app).get('/libros/999');

    expect(res.status).toBe(404);
  });

  it('responde 200 con el libro si existe', async () => {
    const libro = { id: 2, titulo: 'Rayuela', autor: 'Julio Cortazar', anio_publicacion: 1963 };
    repo.obtenerLibro.mockResolvedValue(libro);

    const res = await request(app).get('/libros/2');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(libro);
  });
});

describe('PUT /libros/:id', () => {
  it('responde 404 si el libro a actualizar no existe', async () => {
    repo.actualizarLibro.mockResolvedValue(null);

    const res = await request(app)
      .put('/libros/999')
      .send({ titulo: 'X', autor: 'Y', anio_publicacion: 2020 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /libros/:id', () => {
  it('responde 404 si el libro a eliminar no existe', async () => {
    repo.eliminarLibro.mockResolvedValue(false);

    const res = await request(app).delete('/libros/999');

    expect(res.status).toBe(404);
  });
});
