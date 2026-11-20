-- Script de referencia para crear la tabla libros.
-- En el despliegue con Coolify, este mismo contenido se usa en db-init/init.sql,
-- que MySQL ejecuta automaticamente la primera vez que crea el volumen de datos.

CREATE TABLE IF NOT EXISTS libros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  anio_publicacion INT NOT NULL
);

-- Datos de ejemplo (opcional)
INSERT INTO libros (titulo, autor, anio_publicacion) VALUES
  ('Cien anios de soledad', 'Gabriel Garcia Marquez', 1967),
  ('Rayuela', 'Julio Cortazar', 1963);
