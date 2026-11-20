# Libros API — VPS (Hostinger) + Coolify + CI/CD (COM610, Segundo parcial)

API REST de catálogo de libros en Node.js/Express, desplegada en un VPS mediante **Coolify**, con persistencia en MySQL y un pipeline de CI/CD usando GitHub Actions.

> **Nota sobre la infraestructura:** El examen proponía usar AWS (EC2 + RDS). En mi caso, opté por desplegar la solución en un VPS de Hostinger utilizando **Coolify**. Esto me permitió cumplir los mismos objetivos (contenedores, base de datos privada, proxy inverso, CI/CD) pero con una arquitectura moderna basada en PaaS, gestionando la red privada y el proxy de forma automática.

## Arquitectura

- **api**: Contenedor Node.js/Express. La imagen se construye y publica automáticamente en GitHub Container Registry (GHCR).
- **db**: Contenedor MySQL 8. No tiene puertos expuestos a internet; solo es accesible dentro de la red privada de Docker creada por Coolify usando el nombre `db`. Esto cumple con el requisito de base de datos sin acceso público.
- **Proxy/TLS**: Coolify incluye Traefik, que actúa como proxy inverso y gestiona los certificados SSL de forma automática. El tráfico externo entra por el puerto 80/443 y se redirige al puerto 3000 interno del contenedor `api`.
- **CI**: En cada push o pull request a `main`, GitHub Actions ejecuta `npm ci` y `npm test`.
- **CD**: En cada push a `main`, si las pruebas pasan, se construye la imagen con el SHA del commit, se sube a GHCR y se dispara un webhook para que Coolify descargue la nueva versión y la despliegue.

## Estructura del repositorio

```text
.
├── src/                       # Código de la API
├── tests/                     # Pruebas con Jest y Supertest
├── db.sql                     # Script de creación de la tabla libros
├── db-init/init.sql           # Script para inicialización automática de MySQL
├── Dockerfile
├── docker-compose.yml         # Stack de servicios (api + db) para Coolify
├── .github/workflows/         # Archivos ci.yml y cd.yml
├── .env.example
└── evidencias/                # Capturas de pantalla del funcionamiento
```

## Ejecución local

```bash
npm install
cp .env.example .env   # Configurar los datos de tu base de datos local
npm start              # La API correrá en http://localhost:3000
```

También se puede levantar todo el entorno con Docker Compose:

```bash
cp .env.example .env   # Asegurarse de agregar DB_ROOT_PASSWORD
docker compose up --build
```

## Pruebas automatizadas

```bash
npm install
npm test
```

Las pruebas utilizan `jest.mock('../src/librosRepository')`, por lo que simulan la base de datos y no requieren una instancia real de MySQL para ejecutarse.

## Variables de entorno

Puedes guiarte del archivo `.env.example`. En producción, estas variables se configuran directamente en la pestaña de Environment Variables del servicio en Coolify. Nunca se suben al repositorio ni se guardan dentro de la imagen de Docker.

| Variable          | Descripción                                        |
|-------------------|-----------------------------------------------------|
| `DB_HOST`         | Host de la base de datos (en Coolify debe ser `db`) |
| `DB_PORT`         | Puerto de MySQL (3306)                               |
| `DB_USER`         | Usuario de la base de datos                          |
| `DB_PASSWORD`     | Contraseña del usuario                               |
| `DB_NAME`         | Nombre de la base de datos                           |
| `DB_ROOT_PASSWORD`| Contraseña root de MySQL (solo para el contenedor)  |
| `APP_VERSION`     | Versión de la app (útil para verificar despliegues) |

## Pasos para el despliegue en Coolify

1. Instalar Coolify en el VPS.
2. Crear un nuevo Proyecto y añadir un recurso de tipo Docker Compose.
3. Pegar el contenido del archivo `docker-compose.yml`.
4. En la sección de variables de entorno del servicio, agregar `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_ROOT_PASSWORD` y `APP_VERSION`.
5. Asignar un dominio público al servicio `api` (Coolify generará el certificado SSL).
6. Hacer el primer despliegue manual desde el panel de Coolify.
7. En Coolify, ir a **Keys & Tokens > API Tokens**, crear uno con permisos de despliegue y copiar la **Deploy Webhook URL**.
8. En GitHub, ir a **Settings > Secrets and variables > Actions** y crear los siguientes secretos:
   - `COOLIFY_TOKEN`: El token generado en el paso anterior.
   - `COOLIFY_WEBHOOK`: La URL del webhook.
   - `APP_URL`: La URL pública de la API.
9. Hacer un push a la rama `main`. GitHub Actions probará el código, subirá la imagen y solicitará a Coolify el despliegue.

## Rollback (Conservación de versión anterior)

Si una nueva versión falla al desplegarse o no pasa las verificaciones de `/health` y `/libros`, el workflow de GitHub Actions fallará (gracias a los comandos `curl --fail`).
Para volver a la versión anterior de forma segura, basta con ir a la pestaña **Deployments** del servicio en Coolify, buscar el despliegue anterior que fue exitoso y hacer clic en **Rollback**. Coolify restaurará la imagen previa en segundos.

## URL pública de la API

API Base URL: [URL Pública de la API](https://libros-api.tudominio.com)
