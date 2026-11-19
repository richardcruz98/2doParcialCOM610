# Evidencias pendientes

Este examen requiere evidencia de infraestructura real (EC2, RDS, despliegue
en GitHub Actions). Ninguna de estas capturas existe todavía porque la
infraestructura en AWS no ha sido creada. Aquí va la lista exacta de lo que
falta capturar, para completarla en cuanto haya acceso a una cuenta de AWS:

1. **EC2 y reglas de seguridad**
   - Consola EC2 → instancia en estado "running", con nombre/iniciales visibles.
   - Pestaña "Security" → reglas de entrada: SSH (22) restringido a tu IP, HTTP (80) abierto.

2. **RDS sin acceso público**
   - Consola RDS → instancia, mostrando "Publicly accessible: No".
   - Reglas de entrada del Security Group de RDS: puerto 3306 permitido solo
     desde el Security Group de EC2.

3. **Operaciones CRUD y persistencia**
   - Capturas de Postman/curl haciendo POST, GET, PUT y DELETE contra la URL pública.
   - Una consulta directa a RDS (por ejemplo `SELECT * FROM libros;`) mostrando
     que los cambios persistieron.

4. **Ejecución de pruebas**
   - Salida de `npm test` en local o en el log de la ejecución de CI en GitHub Actions.

5. **Imagen publicada**
   - Captura del registro de contenedores (Docker Hub, ECR, etc.) mostrando la
     imagen etiquetada con el SHA del commit.

6. **Despliegue exitoso en GitHub Actions**
   - Captura del workflow `cd.yml` en verde, con los tres jobs (test, build-and-push,
     deploy) completados.

Oculta cualquier IP, token o dato sensible antes de subir las capturas reales.
No se incluyen archivos `.pem`, `.env` ni credenciales en ningún caso.
