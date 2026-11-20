# Evidencias pendientes

Ninguna de estas capturas existe todavía porque el VPS y el Service de Coolify
no han sido creados/configurados. Lista exacta de lo que falta capturar:

1. **Service en Coolify corriendo**
   - Panel de Coolify → Service con los contenedores `api` y `db` en estado "Running".
   - Configuración del Service mostrando que `db` no tiene puertos publicados
     (solo accesible vía red interna).

2. **Dominio y TLS**
   - Captura de la configuración de dominio del Service y el certificado TLS
     emitido automáticamente por Coolify.

3. **Operaciones CRUD y persistencia**
   - Capturas de Postman/curl haciendo POST, GET, PUT y DELETE contra la URL pública.
   - Una consulta ejecutada dentro del contenedor `db` (p. ej. desde la terminal
     que ofrece Coolify) mostrando `SELECT * FROM libros;` con los cambios persistidos.

4. **Ejecución de pruebas (CI)**
   - Log de una ejecución exitosa de `ci.yml` en GitHub Actions.

5. **Imagen publicada en GHCR**
   - Captura de la imagen en GitHub Container Registry, etiquetada con el SHA
     del commit correspondiente.

6. **Despliegue exitoso (CD)**
   - Log de una ejecución exitosa de `cd.yml`, con los tres jobs (test,
     build-and-push, deploy) en verde, incluyendo la verificación final de
     `/health` y `/libros`.

7. **(Opcional) Rollback**
   - Captura de la pestaña Deployments de Coolify mostrando el historial de
     despliegues y la opción de Rollback.

Oculta cualquier IP, dominio real, token o credencial antes de subir las
capturas definitivas. No incluir `.env`, claves privadas ni tokens de Coolify/GHCR.
