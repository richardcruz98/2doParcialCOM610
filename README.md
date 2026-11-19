# Libros API — EC2 + RDS + CI/CD (COM610, Segundo parcial)

API REST de catálogo de libros en Node.js/Express, pensada para desplegarse en una
instancia EC2 con Nginx como proxy inverso y persistencia en Amazon RDS (MySQL/MariaDB).

> **Nota sobre el estado de este repositorio:** el código, las pruebas y los workflows
> de CI/CD están completos y listos para usarse. Las instancias de **EC2 y RDS aún no
> fueron creadas** (pendiente de acceso a una cuenta de AWS), por lo que los pasos de
> despliegue real y las capturas de `evidencias/` todavía no se han generado. La carpeta
> `evidencias/` contiene un `README.md` que explica exactamente qué capturar y cómo,
> para completarlo en cuanto la infraestructura esté disponible.

## Estructura del repositorio

```
.
├── src/                   # Código de la API
├── tests/                 # Pruebas Jest + Supertest (con mocks, no requieren RDS)
├── db.sql                 # Script de creación de la tabla libros
├── Dockerfile
├── nginx/libros-api.conf  # Config de proxy inverso
├── .github/workflows/     # ci.yml y cd.yml
├── .env.example
└── evidencias/            # Capturas de verificación (pendiente, ver evidencias/README.md)
```

## Cómo ejecutar la aplicación localmente

```bash
npm install
cp .env.example .env   # y completar con los datos reales de tu RDS
npm start               # sirve en http://localhost:3000
```

## Cómo ejecutar las pruebas

```bash
npm install
npm test
```

Las pruebas usan `jest.mock('../src/librosRepository')`, por lo que **no necesitan
una instancia RDS real**: simulan las respuestas de la capa de datos para probar
la lógica HTTP (status codes, validaciones, 404, etc.).

## Variables de entorno

Ver `.env.example`. En producción (EC2) estas variables se deben inyectar vía
`--env-file` a Docker, nunca committeadas al repositorio ni horneadas en la imagen.

## Pasos de despliegue en AWS (a ejecutar cuando haya acceso a la cuenta)

1. **RDS**: crear una instancia MySQL/MariaDB sin acceso público, en una VPC.
   Ejecutar `db.sql` contra ella (por ejemplo desde un bastión o desde la propia EC2).
2. **EC2**: crear una instancia Linux en la misma VPC.
   - Security Group de EC2: permitir SSH (22) solo desde tu IP pública, HTTP (80) desde Internet.
   - Security Group de RDS: permitir 3306 únicamente desde el Security Group de EC2.
   - Instalar Docker y Nginx; copiar `nginx/libros-api.conf` a `/etc/nginx/sites-available/`
     y habilitarlo; recargar Nginx.
3. **Secrets de GitHub Actions** (Settings → Secrets and variables → Actions):
   - `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
   - `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`
   - En la instancia EC2, crear `/home/<EC2_USER>/libros-api.env` con las variables
     reales de conexión a RDS (fuera del repositorio).
4. **CI**: cada push/PR a `main` corre `npm ci && npm test` automáticamente (`ci.yml`).
5. **CD**: cada push a `main` corre pruebas, construye y publica la imagen Docker
   etiquetada con el SHA del commit, y la despliega en EC2 solo si las pruebas pasan.
   Incluye verificación de `/health` tras el despliegue; si falla, no promueve la
   nueva versión y conserva el contenedor anterior (`cd.yml`).
6. **Verificación manual** (curl/Postman) de las operaciones CRUD contra la URL
   pública de EC2, confirmando persistencia en RDS.

## URL pública de la API

_Pendiente — se completará con la IP/DNS de la instancia EC2 una vez creada._

## Enlaces a ejecuciones de CI/CD

_Pendientes — se completarán con enlaces reales a ejecuciones de GitHub Actions
una vez que el repositorio esté subido a GitHub y las instancias existan._

## Limpieza de recursos

Al terminar la revisión del docente, eliminar la instancia EC2, la instancia RDS
y las imágenes en el registro de contenedores para evitar cargos.
