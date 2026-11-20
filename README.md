# Libros API — VPS (Hostinger) + Coolify + CI/CD (COM610, Segundo parcial)

API REST de catálogo de libros en Node.js/Express, desplegada en un VPS mediante
**Coolify**, con persistencia en MySQL y CI/CD por GitHub Actions.

## Arquitectura

- **api**: contenedor Node.js/Express, imagen publicada en GitHub Container Registry (GHCR).
- **db**: contenedor MySQL 8, sin puertos expuestos — solo accesible dentro de la red
  privada del stack de Coolify, vía el nombre de servicio `db`. Cumple el requisito
  de "base de datos sin acceso público".
- **Proxy/TLS**: gestionado automáticamente por Coolify (Traefik) sobre el dominio que
  le asignes al servicio. Reemplaza la configuración manual de Nginx: Coolify enruta
  el tráfico externo al puerto 3000 interno del contenedor `api` sin exponerlo
  directamente a Internet.
- **CI**: en cada push/PR a `main`, GitHub Actions corre `npm ci && npm test`.
- **CD**: en cada push a `main`, GitHub Actions corre las pruebas, construye y publica
  la imagen en GHCR etiquetada con el SHA del commit, y dispara el webhook de
  despliegue de Coolify. Si las pruebas fallan, no se construye ni se despliega nada.

## Estructura del repositorio

```
.
├── src/                       # Código de la API
├── tests/                     # Pruebas Jest + Supertest (mocks, no requieren MySQL real)
├── db.sql                     # Script de referencia de la tabla libros
├── db-init/init.sql           # Mismo script, ejecutado automáticamente por MySQL
│                                 (docker-entrypoint-initdb.d) la primera vez que
│                                 se crea el volumen de datos
├── Dockerfile
├── docker-compose.yml         # Stack que Coolify despliega (api + db)
├── .github/workflows/         # ci.yml y cd.yml
├── .env.example
└── evidencias/                # Capturas de verificación
```

## Cómo ejecutar la aplicación localmente

```bash
npm install
cp .env.example .env   # completar con datos de conexión a tu MySQL
npm start               # sirve en http://localhost:3000
```

También puedes levantar el stack completo con Docker Compose localmente:

```bash
cp .env.example .env   # agregar también DB_ROOT_PASSWORD
docker compose up --build
```

## Cómo ejecutar las pruebas

```bash
npm install
npm test
```

Las pruebas mockean la capa de datos (`jest.mock('../src/librosRepository')`),
por lo que corren sin una base de datos real.

## Variables de entorno

Ver `.env.example`. En producción estas variables se inyectan como **Environment
Variables del Service en Coolify**, nunca se committean al repositorio ni se
hornean en la imagen Docker.

| Variable          | Dónde se usa                                      |
|-------------------|----------------------------------------------------|
| `DB_HOST`         | api (siempre `db` dentro del stack de Coolify)     |
| `DB_PORT`         | api (3306)                                          |
| `DB_USER`         | api y db                                            |
| `DB_PASSWORD`     | api y db                                            |
| `DB_NAME`         | api y db                                            |
| `DB_ROOT_PASSWORD`| db (root de MySQL, solo en Coolify, no en el repo) |
| `APP_VERSION`     | api (para verificar visualmente el despliegue)      |

## Pasos de despliegue en el VPS con Coolify

1. **Instalar Coolify** en el VPS de Hostinger (script oficial de instalación).
2. **Crear un Project** en el panel de Coolify y, dentro, un **New Resource →
   Docker Compose**.
3. Pegar el contenido de `docker-compose.yml`, reemplazando
   `ghcr.io/OWNER/REPO:latest` por la ruta real de tu imagen en GHCR
   (minúsculas, como la genera `docker/build-push-action`).
4. En **Environment Variables** del Service, cargar: `DB_USER`, `DB_PASSWORD`,
   `DB_NAME`, `DB_ROOT_PASSWORD`, `APP_VERSION`.
5. Asignar un **dominio** al servicio `api` desde la configuración del Service
   (Coolify emite el certificado TLS automáticamente).
6. Desplegar una primera vez manualmente desde Coolify (fallará hasta que exista
   una imagen publicada en GHCR; es esperado).
7. En **Keys & Tokens → API Tokens** de Coolify, crear un token con permiso de
   despliegue. En el Service, copiar la **Deploy Webhook URL** (pestaña Webhooks).
8. **Secrets en GitHub** (Settings → Secrets and variables → Actions):
   - `COOLIFY_TOKEN`: el token creado en el paso 7.
   - `COOLIFY_WEBHOOK`: la Deploy Webhook URL del Service.
   - `APP_URL`: URL pública de la API (p. ej. `https://libros-api.tudominio.com`),
     usada por el workflow para verificar `/health` y `/libros` tras cada despliegue.
   - `GITHUB_TOKEN` para GHCR lo provee GitHub automáticamente, no hay que crearlo.
9. Hacer push a `main`: CI corre las pruebas; CD construye y publica la imagen
   con el SHA del commit, dispara el webhook, y verifica `/health` y `/libros`
   contra la URL pública.

## Rollback ante fallos

Si una nueva versión no pasa la verificación posterior al despliegue, el workflow
de CD falla explícitamente (los pasos `curl --fail` devuelven código de error).
Para restaurar la versión anterior: en Coolify, pestaña **Deployments** del
Service, ubicar el despliegue exitoso previo y usar **Rollback** — Coolify
mantiene el historial de despliegues y permite volver a la imagen anterior
en segundos.

## URL pública de la API

_Pendiente — se completará con el dominio asignado en Coolify una vez creado el Service._

## Enlaces a ejecuciones de CI/CD

_Pendientes — se completarán con enlaces reales a ejecuciones de GitHub Actions
una vez que el VPS, Coolify y los secrets estén configurados._

## Limpieza de recursos

Al terminar la revisión del docente: eliminar el Service en Coolify (contenedores
y volumen de MySQL), y borrar las imágenes antiguas publicadas en GHCR si no se
necesitan, para no acumular almacenamiento innecesario.
